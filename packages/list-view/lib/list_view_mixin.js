require('list-view/list_item_view');

var get = Ember.get, set = Ember.set,
min = Math.min, max = Math.max, floor = Math.floor,
ceil = Math.ceil;

function addContentArrayObserver() {
  var content = get(this, 'content');
  if (content) {
    content.addArrayObserver(this);
  }
}

function removeAndDestroy(object){
  this.removeObject(object);
  object.destroy();
}

function syncChildViews(){
  Ember.run.once(this, '_syncChildViews');
}

function sortByContentIndex (viewOne, viewTwo){
  return get(viewOne, 'contentIndex') - get(viewTwo, 'contentIndex');
}

function detectListItemViews(childView) {
  return Ember.ListItemView.detectInstance(childView);
}

function notifyMutationListeners() {
  if (Ember.View.notifyMutationListeners) {
    Ember.run.once(Ember.View, 'notifyMutationListeners');
  }
}

var domManager = Ember.create(Ember.ContainerView.proto().domManager);

domManager.prepend = function(view, html) {
  view.$('.ember-list-container').prepend(html);
  notifyMutationListeners();
};

function syncListContainerWidth(){
  var elementWidth, columnCount, containerWidth, element;

  elementWidth = get(this, 'elementWidth');
  columnCount = get(this, 'columnCount');
  containerWidth = elementWidth * columnCount;
  element = this.$('.ember-list-container');

  if (containerWidth && element) {
    element.css('width', containerWidth);
  }
}

Ember.ListViewMixin = Ember.Mixin.create({
  itemViewClass: Ember.ListItemView,
  classNames: ['ember-list-view'],
  attributeBindings: ['style'],
  domManager: domManager,
  scrollTop: 0,
  _lastEndingIndex: 0,
  paddingCount: 1, // One row for padding

  init: function() {
    this._super();
    addContentArrayObserver.call(this);
    this._syncChildViews();
    this.columnCountDidChange();
    this.on('didInsertElement', syncListContainerWidth);
  },

  render: function(buffer) {
    buffer.push('<div class="ember-list-container">');
    this._super(buffer);
    buffer.push('</div>');
  },

  style: Ember.computed('height', 'width', function() {
    var height, width, style, css;

    height = get(this, 'height');
    width = get(this, 'width');
    css = get(this, 'css');

    style = '';

    if (height) { style += 'height:' + height + 'px;'; }
    if (width)  { style += 'width:'  + width  + 'px;'; }

    for ( var rule in css ){
      if (css.hasOwnProperty(rule)) {
        style += rule + ':' + css[rule] + ';';
      }
    }

    return style;
  }),
  scrollTo: function(y) {
    throw "must override to perform the visual scroll and effectively delegate to _scrollContentTo";
  },
  _scrollContentTo: function(scrollTop, options) {
    var contentLength, childViews, childViewsLength,
        startingIndex, endingIndex, childView, attrs,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd;

    options = options || { };

    set(this, 'scrollTop', scrollTop);
    contentLength = get(this, 'content.length');
    maxContentIndex = max(contentLength - 1, 0);
    childViews = get(this, 'listItemViews');
    childViewsLength =  childViews.length;

    startingIndex = this._startingIndex();
    visibleEndingIndex = startingIndex + this._numChildViewsForViewport();

    endingIndex = min(maxContentIndex, visibleEndingIndex);

    if (!options.force && startingIndex === this._lastStartingIndex && endingIndex === this._lastEndingIndex) {
      return;
    }

    contentIndexEnd = min(visibleEndingIndex, startingIndex + childViewsLength);

    for (contentIndex = startingIndex; contentIndex < contentIndexEnd; contentIndex++) {
      childView = childViews[contentIndex % childViewsLength];
      this._reuseChildForContentIndex(childView, contentIndex, options);
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
  },

  childViewsWillSync: Ember.K,
  childViewsDidSync: Ember.K,

  totalHeight: Ember.computed('content.length', 'rowHeight', 'columnCount', function() {
    var contentLength, rowHeight, columnCount;

    contentLength = get(this, 'content.length');
    rowHeight = get(this, 'rowHeight');
    columnCount = get(this, 'columnCount');

    return (ceil(contentLength / columnCount)) * rowHeight;
  }),

  _prepareChildForReuse: function(childView) {
    childView.prepareForReuse();
  },

  _reuseChildForContentIndex: function(childView, contentIndex, options) {
    var content, childsCurrentContentIndex, position;

    content = get(this, 'content');
    childsCurrentContentIndex = get(childView, 'contentIndex');

    options = options || {};
    this._prepareChildForReuse(childView);

    if (childsCurrentContentIndex !== contentIndex || options.force) {
      position = this.positionForIndex(contentIndex);

      set(childView, 'position', position);
      set(childView, 'contentIndex', contentIndex);
      set(childView, 'context', content.objectAt(contentIndex));
    }
  },

  positionForIndex: function(index){
    var elementWidth, width, columnCount, rowHeight, y, x;

    elementWidth = get(this, 'elementWidth') || 1;
    width = get(this, 'width') || 1;
    columnCount = get(this, 'columnCount');
    rowHeight = get(this, 'rowHeight');

    y = (rowHeight * floor(index/columnCount));
    x = (index % columnCount) * elementWidth;

    return {
      y: y,
      x: x
    };
  },

  _childViewCount: function() {
    var contentLength, childViewCountForHeight;

    contentLength = get(this, 'content.length');
    childViewCountForHeight = this._numChildViewsForViewport();

    return min(contentLength, childViewCountForHeight);
  },

  columnCount: Ember.computed('width', 'elementWidth', function() {
    var elementWidth, width, count;

    elementWidth = get(this, 'elementWidth');
    width = get(this, 'width');

    if (elementWidth) {
      count = floor(width / elementWidth);
    } else {
      count = 1;
    }

    return count;
  }),

  columnCountDidChange: Ember.observer(function(){
    var ratio, currentScrollTop, proposedScrollTop, maxScrollTop,
        scrollTop, lastColumnCount, newColumnCount;

    lastColumnCount = this._lastColumnCount;

    currentScrollTop = get(this, 'scrollTop');
    newColumnCount = get(this, 'columnCount');
    maxScrollTop = get(this, 'maxScrollTop');

    this._lastColumnCount = newColumnCount;

    if (lastColumnCount) {
      ratio = (lastColumnCount / newColumnCount);
      proposedScrollTop = currentScrollTop * ratio;
      scrollTop = min(maxScrollTop, proposedScrollTop);
      set(this, 'scrollTop', scrollTop);
    }

    if (arguments.length > 0) {
      // invoked by observer
      Ember.run.schedule('afterRender', this, syncListContainerWidth);

    }
  }, 'columnCount'),

  maxScrollTop: Ember.computed('height', 'totalHeight', function(){
    var totalHeight, viewportHeight;

    totalHeight = get(this, 'totalHeight'),
    viewportHeight = get(this, 'height');

    return max(0, totalHeight - viewportHeight);
  }),

  _numChildViewsForViewport: function() {
    var height, rowHeight, paddingCount, columnCount;

    height = get(this, 'height');
    rowHeight = get(this, 'rowHeight');
    paddingCount = get(this, 'paddingCount');
    columnCount = get(this, 'columnCount');

    return (ceil(height / rowHeight) * columnCount) + (paddingCount * columnCount);
  },

  _startingIndex: function() {
    var scrollTop, rowHeight, columnCount, calculatedStartingIndex,
        contentLength, largestStartingIndex;

    contentLength = get(this, 'content.length');
    scrollTop = get(this, 'scrollTop');
    rowHeight = get(this, 'rowHeight');
    columnCount = get(this, 'columnCount');

    calculatedStartingIndex = floor(scrollTop / rowHeight) * columnCount;

    largestStartingIndex = max(contentLength - 1, 0);

    return min(calculatedStartingIndex, largestStartingIndex);
  },

  contentWillChange: Ember.beforeObserver(function() {
    var content;

    content = get(this, 'content');

    if (content) {
      content.removeArrayObserver(this);
    }
  }, 'content'),

  contentDidChange: Ember.observer(function() {
    addContentArrayObserver.call(this);
    syncChildViews.call(this);
  }, 'content'),

  needsSyncChildViews: Ember.observer(syncChildViews, 'height', 'width', 'columnCount'),

  _addItemView: function(contentIndex){
    var itemViewClass, childView;

    itemViewClass = get(this, 'itemViewClass');
    childView = itemViewClass.create();

    this._reuseChildForContentIndex(childView, contentIndex);

    this.pushObject(childView);
   },

  /**
   @private

   Intelligently manages the number of childviews.

   @method _syncChildViews
   **/
  _syncChildViews: function(){
    var itemViewClass, startingIndex, childViewCount,
        endingIndex, numberOfChildViews, numberOfChildViewsNeeded,
        childViews, count, delta, index, childViewsLength, contentIndex;

    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) {
      return;
    }

    this.childViewsWillSync();

    childViewCount = this._childViewCount();
    childViews = this.positionOrderedChildViews();

    startingIndex = this._startingIndex();
    endingIndex = startingIndex + childViewCount;

    numberOfChildViewsNeeded = childViewCount;
    numberOfChildViews = childViews.length;

    delta = numberOfChildViewsNeeded - numberOfChildViews;

    if (delta === 0) {
      // no change
    } else if (delta > 0) { // more views are needed
      contentIndex = this._lastEndingIndex;

      for (count = 0; count < delta; count++, contentIndex++) {
        this._addItemView(contentIndex);
      }

    } else { // less views are needed
      childViews.
        splice(numberOfChildViewsNeeded, numberOfChildViews).
        forEach(removeAndDestroy, this);
    }

    this._scrollContentTo(get(this, 'scrollTop'), { force: true });

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex   = this._lastEndingIndex + delta;

    this.childViewsDidSync();
  },

  listItemViews: Ember.computed('[]', function(){
    return this.filter(detectListItemViews);
  }),

  positionOrderedChildViews: function() {
    return get(this, 'listItemViews').sort(sortByContentIndex);
  },

  arrayWillChange: Ember.K,

  // TODO: refactor
  arrayDidChange: function(content, start, removedCount, addedCount) {
    var index, contentIndex;

    if (this.state === 'inDOM') {
      // ignore if all changes are out of the visible change
      if( start >= this._lastStartingIndex || start < this._lastEndingIndex) {
        index = 0;
        // ignore all changes not in the visible range
        this.positionOrderedChildViews().
          slice(start, start + addedCount).
          forEach(function(childView){
            contentIndex = this._lastStartingIndex + index;
            this._reuseChildForContentIndex(childView, contentIndex, { force: true });
            index++;
          }, this);
      }

      syncChildViews.call(this);
    }
  }
});
