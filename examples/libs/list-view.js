(function() {
Ember.ListViewHelper = {
  applyTransform: (function(){
    var element = document.createElement('div');

    if ('webkitTransform' in element.style){
      return function(element, position){
        var x = position.x,
            y = position.y;

        element.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      };
    }else{
      return function(element, position){
        var x = position.x,
            y = position.y;

        element.style.top =  y + 'px';
        element.style.left = x + 'px';
      };
    }
  })()
};
})();



(function() {
var get = Ember.get, set = Ember.set;

var backportedInnerString = function(buffer) {
  var content = [], childBuffers = buffer.childBuffers;

  Ember.ArrayPolyfills.forEach.call(childBuffers, function(buffer) {
    var stringy = typeof buffer === 'string';
    if (stringy) {
      content.push(buffer);
    } else {
      buffer.array(content);
    }
  });

  return content.join('');
};

function samePosition(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

function willInsertElementIfNeeded(view) {
  if (view.willInsertElement) {
    view.willInsertElement();
  }
}

function didInsertElementIfNeeded(view) {
  if (view.didInsertElement) {
    view.didInsertElement();
  }
}

function rerender() {
  var element, buffer, context, hasChildViews;

  element = get(this, 'element');

  if (!element) { return; }

  context = get(this, 'context');
  hasChildViews = this._childViews.length > 0;

  if (hasChildViews) {
    this.triggerRecursively('willClearRender');
    this.clearRenderedChildren();
  }

  if (context) {
    buffer = Ember.RenderBuffer();
    buffer = this.renderToBuffer(buffer);

    if (hasChildViews) {
      this.invokeRecursively(willInsertElementIfNeeded, false);
    }

    element.innerHTML = buffer.innerString ? buffer.innerString() : backportedInnerString(buffer);

    set(this, 'element', element);

    this.transitionTo('inDOM');

    if (hasChildViews) {
      this.invokeRecursively(didInsertElementIfNeeded, false);
    }

    this._updateStyle();
  } else {
    element.innerHTML = ''; // when there is no context, this view should be completely empty
  }
}

function updateStyle() {
  var element, position, _position;

  element = get(this, 'element');
  position = get(this, 'position');
  _position = this._position;

  if (!element) { return; }
  if (samePosition(position, _position)) { return; }

  this.applyTransform(element, position);

  this._position = position;
}

/**
  ListItemView

  @class ListItemView
  @namespace Ember
*/
Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],

  _position: null,
  _updateStyle: updateStyle,
  _contextDidChange: Ember.observer(rerender, 'context'),

  applyTransform: Ember.ListViewHelper.applyTransform,
  positionDidChange: Ember.observer(updateStyle, 'position'),
  didInsertElement: updateStyle
});
})();



(function() {
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
  bottomPadding: 0,
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

  _scrollContentTo: function(scrollTop) {
    var startingIndex, endingIndex,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd, contentLength;

    contentLength = get(this, 'content.length');
    set(this, 'scrollTop', scrollTop);

    maxContentIndex = max(contentLength - 1, 0);

    startingIndex = this._startingIndex();
    visibleEndingIndex = startingIndex + this._numChildViewsForViewport();

    endingIndex = min(maxContentIndex, visibleEndingIndex);

    this.trigger('scrollContentTo', scrollTop);

    if (startingIndex === this._lastStartingIndex &&
        endingIndex === this._lastEndingIndex) {
      return;
    }

    this._reuseChildren();

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
  },

  childViewsWillSync: Ember.K,
  childViewsDidSync: Ember.K,

  totalHeight: Ember.computed('content.length', 'rowHeight', 'columnCount', 'bottomPadding', function() {
    var contentLength, rowHeight, columnCount, bottomPadding;

    contentLength = get(this, 'content.length');
    rowHeight = get(this, 'rowHeight');
    columnCount = get(this, 'columnCount');
    bottomPadding = get(this, 'bottomPadding');

    return ((ceil(contentLength / columnCount)) * rowHeight) + bottomPadding;
  }),

  _prepareChildForReuse: function(childView) {
    childView.prepareForReuse();
  },

  _reuseChildForContentIndex: function(childView, contentIndex) {
    var content, context, newContext, childsCurrentContentIndex, position;

    content = get(this, 'content');
    context = get(childView, 'context');
    newContext = content.objectAt(contentIndex);

    childsCurrentContentIndex = get(childView, 'contentIndex');

    position = this.positionForIndex(contentIndex);

    set(childView, 'position', position);

    if (childsCurrentContentIndex !== contentIndex || newContext !== context) {
      set(childView, 'contentIndex', contentIndex);
      set(childView, 'context', newContext);
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
        scrollTop, lastColumnCount, newColumnCount, element;

    lastColumnCount = this._lastColumnCount;

    currentScrollTop = get(this, 'scrollTop');
    newColumnCount = get(this, 'columnCount');
    maxScrollTop = get(this, 'maxScrollTop');
    element = get(this, 'element');

    this._lastColumnCount = newColumnCount;

    if (lastColumnCount) {
      ratio = (lastColumnCount / newColumnCount);
      proposedScrollTop = currentScrollTop * ratio;
      scrollTop = min(maxScrollTop, proposedScrollTop);
      set(this, 'scrollTop', scrollTop);

      if (element) { element.scrollTop = scrollTop; }
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
    } else if (delta > 0) {
      // more views are needed
      contentIndex = this._lastEndingIndex;

      for (count = 0; count < delta; count++, contentIndex++) {
        this._addItemView(contentIndex);
      }

    } else {
      // less views are needed
      childViews.
        splice(numberOfChildViewsNeeded, numberOfChildViews).
        forEach(removeAndDestroy, this);
    }

    this._scrollContentTo(get(this, 'scrollTop'));

    this._reuseChildren();

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex   = this._lastEndingIndex + delta;

    this.childViewsDidSync();
  },

  _reuseChildren: function(){
    var contentLength, childViews, childViewsLength,
        startingIndex, endingIndex, childView, attrs,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd, scrollTop;

    scrollTop = get(this, 'scrollTop');
    contentLength = get(this, 'content.length');
    maxContentIndex = max(contentLength - 1, 0);
    childViews = get(this, 'listItemViews');
    childViewsLength =  childViews.length;

    startingIndex = this._startingIndex();
    visibleEndingIndex = startingIndex + this._numChildViewsForViewport();

    endingIndex = min(maxContentIndex, visibleEndingIndex);

    this.trigger('scrollContentTo', scrollTop);

    contentIndexEnd = min(visibleEndingIndex, startingIndex + childViewsLength);

    for (contentIndex = startingIndex; contentIndex < contentIndexEnd; contentIndex++) {
      childView = childViews[contentIndex % childViewsLength];
      this._reuseChildForContentIndex(childView, contentIndex);
    }
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
        // this can re-position many, rather then causing a cascade of re-renders
        this.positionOrderedChildViews().
          forEach(function(childView){
            contentIndex = this._lastStartingIndex + index;
            this._reuseChildForContentIndex(childView, contentIndex);
            index++;
          }, this);
      }

      syncChildViews.call(this);
    }
  }
});
})();



(function() {
var get = Ember.get, set = Ember.set;

function createScrollingView(){
  return Ember.View.createWithMixins({
    attributeBindings: ['style'],
    classNames: ['ember-list-scrolling-view'],

    style: Ember.computed(function() {
      return "height: " + get(this, 'parentView.totalHeight') + "px";
    }).property('parentView.totalHeight')
  });
}

/**
  ListView

  @class ListView
  @namespace Ember
*/
Ember.ListView = Ember.ContainerView.extend(Ember.ListViewMixin, {
  css: {
    position: 'relative',
    overflow: 'scroll',
    '-webkit-overflow-scrolling': 'touch',
    'overflow-scrolling': 'touch'
  },

  didInsertElement: function() {
    var that, element;

    that = this,
    element = get(this, 'element');

    this._scroll = function(e) { that.scroll(e); };

    element.addEventListener('scroll', this._scroll);
  },

  willDestroyElement: function() {
    var element;

    element = get(this, 'element');

    element.removeEventListener('scroll', this._scroll);
  },

  scroll: function(e) {
    Ember.run(this, this.scrollTo, e.target.scrollTop);
  },

  scrollTo: function(y){
    var element = get(this, 'element');
    element.scrollTop = y;
    this._scrollContentTo(y);
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

})();



(function() {
/*global Scroller*/
var max = Math.max, get = Ember.get;

function updateScrollerDimensions(target) {
  var width, height, totalHeight;

  target = target || this;

  width = get(target, 'width');
  height = get(target, 'height');
  totalHeight = get(target, 'totalHeight');

  target.scroller.setDimensions(width, height, width, totalHeight);
  target.trigger('scrollerDimensionsDidChange');
}

/**
  VirtualListView

  @class VirtualListView
  @namespace Ember
*/
Ember.VirtualListView = Ember.ContainerView.extend(Ember.ListViewMixin, {
  css: {
    position: 'relative',
    overflow: 'hidden'
  },

  init: function(){
    this._super();
    this.setupScroller();
  },

  applyTransform: Ember.ListViewHelper.applyTransform,

  setupScroller: function(){
    var view = this, y;

    view.scroller = new Scroller(function(left, top, zoom) {
      if (view.state !== 'inDOM') { return; }

      if (view.listContainerElement) {
        view.applyTransform(view.listContainerElement, {x: 0, y: -top});

        y = max(0, top);
        view._scrollContentTo(y);
      }
    }, {
      scrollingX: false,
      scrollingComplete: function(){
        view.trigger('scrollingDidComplete');
      }
    });

    view.trigger('didInitializeScroller');
    updateScrollerDimensions(view);
  },

  scrollerDimensionsNeedToChange: Ember.observer(function() {
    Ember.run.once(this, updateScrollerDimensions);
  }, 'width', 'height', 'totalHeight'),

  didInsertElement: function() {
    var self, listContainerElement, el;

    self = this;
    el = this.$()[0];
    this.listContainerElement = this.$('> .ember-list-container')[0];

    self._mouseWheel = function(e) { self.mouseWheel(e); };
    el.addEventListener('mousewheel', this._mouseWheel);
  },

  willDestroyElement: function() {
    var el = this.$()[0];

    el.removeEventListener('mousewheel', this._mouseWheel);
  },

  mouseWheel: function(e){
    var inverted = e.webkitDirectionInvertedFromDevice,
        delta = e.wheelDeltaY * (inverted ? 0.5 : -0.5),
        candidatePosition = this.scroller.__scrollTop + delta;

    if ((candidatePosition >= 0) && (candidatePosition <= this.scroller.__maxScrollTop)) {
      this.scroller.scrollBy(0, delta, true);
    }

    return false;
  },
  _isScrolling: false,
  willBeginScroll: function(touches, timeStamp) {
    this._isScrolling = false;
    this.scroller.doTouchStart(touches, timeStamp);
  },

  continueScroll: function(touches, timeStamp) {
    if (this._isScrolling) {
      this.scroller.doTouchMove(touches, timeStamp);
    } else {
      var startingScrollTop = this.get('scrollTop');
      this.scroller.doTouchMove(touches, timeStamp);
      var endingScrollTop = this.get('scrollTop');
      if (startingScrollTop !== endingScrollTop) {
        var e = Ember.$.Event("scrollerstart");
        Ember.$(touches[0].target).trigger(e);
        this._isScrolling = true;
      }
    }
  },

  endScroll: function(timeStamp) {
    this.scroller.doTouchEnd(timeStamp);
  },

  touchStart: function(e){
    e = e.originalEvent || e;
    this.willBeginScroll(e.touches, e.timeStamp);
    return false;
  },

  touchMove: function(e){
    e = e.originalEvent || e;
    this.continueScroll(e.touches, e.timeStamp);
    return false;
  },

  touchEnd: function(e){
    e = e.originalEvent || e;
    this.endScroll(e.timeStamp);
    return false;
  },

  mouseDown: function(e){
    this.willBeginScroll([e], e.timeStamp);
    return false;
  },

  mouseMove: function(e){
    this.continueScroll([e], e.timeStamp);
    return false;
  },

  mouseUp: function(e){
    this.endScroll(e.timeStamp);
    return false;
  },

  scrollTo: function(y, animate) {
    if (animate === undefined) {
      animate = true;
    }

    this.scroller.scrollTo(0, y, animate, 1);
  }
});

})();



(function() {

})();
