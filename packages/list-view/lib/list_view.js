require('list-view/list_item_view');

var get = Ember.get, set = Ember.set,
min = Math.min, floor = Math.floor;

Ember.ListViewMixin = Ember.Mixin.create({
  itemViewClass: Ember.ListItemView,
  classNames: ['ember-list-view'],
  attributeBindings: ['style'],
  scrollTop: 0,
  paddingCount: 1, // One row for padding

  init: function() {
    this._super();
    this.contentDidChange(); // Setup array observing
  },

  style: Ember.computed(function() {
    return "height: " + get(this, 'height') + "px";
  }).property('height'),

  didInsertElement: function() {
    var self, element;

    self = this,
    element = get(this, 'element');

    self._scroll = function(e) { self.scroll(e); };
    self._touchMove = function(e) { self.touchMove(e); };
    self._mouseWheel = function(e) { self.mouseWheel(e); };

    element.addEventListener('scroll',     this._scroll);
    element.addEventListener('touchmove',  this._touchMove);
    element.addEventListener('mousewheel', this._mouseWheel);
  },

  touchMove: Ember.K,
  mouseWheel: Ember.K,

  willDestroyElement: function() {
    var element;

    element = get(this, 'element');

    element.removeEventListener('scroll', this._scroll);
    element.removeEventListener('touchmove', this._touchMove);
    element.removeEventListener('mousewheel', this._mouseWheel);
  },

  // Browser fires the scroll event asynchronously
  scroll: function(e) {
    Ember.run(this, this.scrollTo, e.target.scrollTop);
  },

  // TODO: refactor
  scrollTo: function(scrollTop, options) {
    var contentLength, childViews, childViewsLength,
    startingIndex, endingIndex, childView, attrs, contentIndex,
    neededViews;

    options = options || { };

    set(this, 'scrollTop', scrollTop);

    contentLength = get(this, 'content.length');

    childViews = this.listItemViews();
    childViewsLength =  childViews.length;

    startingIndex = this._startingIndex();
    neededViews = startingIndex + this._numChildViewsForViewport();

    endingIndex = min(contentLength, neededViews);

    if (!options.force && startingIndex === this._lastStartingIndex && endingIndex === this._lastEndingIndex) {
      return;
    }

    for (contentIndex = startingIndex; contentIndex < endingIndex; contentIndex++) {
      childView = childViews[contentIndex % childViewsLength];

      this._reuseChildForContentIndex(childView, contentIndex, options);
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
  },

  childViewsWillSync: Ember.K,
  childViewsDidSync: Ember.K,

  totalHeight: Ember.computed(function() {
    var contentLength, rowHeight, columnCount;

    contentLength = get(this, 'content.length');
    rowHeight = get(this, 'rowHeight');
    columnCount = this._columnCount();

    return  (floor(contentLength / columnCount)) * rowHeight;
  }).property('content.length', 'rowHeight'),

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

  // TODO: extract
  positionForIndex: function(index){
    var elementWidth, width, columnCount, rowHeight, y, x;

    elementWidth = get(this, 'elementWidth') || 1;
    width = get(this, 'width') || 1;
    columnCount = this._columnCount();
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

    if (childViewCountForHeight > contentLength) {
      return contentLength;
    } else {
      return childViewCountForHeight;
    }
  },

  _columnCount: function(){
    var elementWidth, width;

    elementWidth = get(this, 'elementWidth');
    width = get(this, 'width') || 1;

    if(elementWidth){
      return floor(width / elementWidth);
    } else {
      return 1;
    }
  },

  _numChildViewsForViewport: function() {
    var height, rowHeight, paddingCount, columnCount;

    height = get(this, 'height');
    rowHeight = get(this, 'rowHeight');
    paddingCount = get(this, 'paddingCount');
    columnCount = this._columnCount();

    return ((height / rowHeight) * columnCount) + (paddingCount * columnCount);
  },

  _startingIndex: function() {
    var scrollTop, rowHeight, columnCount;

    scrollTop = get(this, 'scrollTop');
    rowHeight = get(this, 'rowHeight');
    columnCount = this._columnCount();

    return floor(scrollTop / rowHeight) * columnCount;
  },

  contentWillChange: Ember.beforeObserver(function() {
    var content;

    content = get(this, 'content');

    if (content) {
      content.removeArrayObserver(this);
    }
  }, 'content'),

  contentDidChange: Ember.observer(function() {
    var content;
    content = get(this, 'content');

    if (content) {
      content.addArrayObserver(this);
    }

    Ember.run.once(this, '_syncChildViews');
  }, 'content'),


  heightDidChange: Ember.observer(function(){
    Ember.run.once(this, '_syncChildViews');
  }, 'height'),

  widthDidChange:  Ember.observer(function(a,b,c,d,e){
    Ember.run.once(this, '_syncChildViews');
  }, 'width'),

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

    this.childViewsWillSync();

    childViewCount = this._childViewCount();
    childViews = this.positionOrderedChildViews();

    startingIndex = this._startingIndex();
    endingIndex = startingIndex + childViewCount;

    numberOfChildViewsNeeded = childViewCount;
    numberOfChildViews = childViews.length;

    delta =  numberOfChildViewsNeeded - numberOfChildViews;
    index = this._lastEndingIndex || startingIndex;

    if (delta === 0) {
      // no change
    } else if (delta > 0) {
      contentIndex = startingIndex + index;

      for (count = 0; count < delta; count++, contentIndex++) {
        this._addItemView(contentIndex);
      }

    } else {

      // TODO: extract// or just hide these...
      childViews.
        splice(numberOfChildViewsNeeded, numberOfChildViews).
        forEach(function(childView){
          this.removeObject(childView);
          childView.destroy();
        }, this);
    }

    this.scrollTo(get(this, 'scrollTop'), { force: true });

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex   = startingIndex + delta;

    this.childViewsDidSync();
  },

  listItemViews: function(){
    return get(this, 'childViews').filter(function(childView){
      return Ember.ListItemView.detectInstance(childView);
    });
  },

  positionOrderedChildViews: function() {
    return this.listItemViews().sort(function(a, b){
      return get(a, 'contentIndex') - get(b, 'contentIndex');
    });
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

      Ember.run.once(this, '_syncChildViews');
    }
  }
});

function createScrollingView(){
  return Ember.View.createWithMixins({
    attributeBindings: ['style'],

    style: Ember.computed(function() {
      return "height: " + get(this, 'parentView.totalHeight') + "px";
    }).property('parentView.totalHeight')
  });
}

Ember.ListView = Ember.ContainerView.extend(Ember.ListViewMixin, {
  init: function(){
    this._super();
  },

  childViewsWillSync: function(){
    var scrollingView;

    scrollingView = get(this, '_scrollingView');

    this.removeObject(scrollingView);
  },

  childViewsDidSync: function(){
    var scrollingView;

    scrollingView = get(this, '_scrollingView');

    if (!scrollingView) {
      scrollingView =  createScrollingView();
      this.set('_scrollingView', scrollingView);
    }

    this.pushObject(scrollingView);
  }
});

Ember.VirtualListView = Ember.ContainerView.extend(Ember.ListViewMixin, {
  touchMove: function(e){
    e.preventDefault();

    console.log('Attempt touchmove');
    // call scroller library
  },

  mouseWheel: function(e){
    e.preventDefault();

    console.log('Attempt mouseWheel');
    // call scroller library
  }
});
