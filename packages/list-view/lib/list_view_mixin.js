// jshint validthis: true

import ReusableListItemView from 'list-view/reusable_list_item_view';

var get = Ember.get, set = Ember.set,
    min = Math.min, max = Math.max, floor = Math.floor,
    ceil = Math.ceil,
    forEach = Ember.EnumerableUtils.forEach;

function integer(key, value) {
  if (arguments.length > 1) {
    var ret;
    if (typeof value === 'string') {
      ret = parseInt(value, 10);
    } else {
      ret = value;
    }
    this[key] = ret;
    return ret;
  } else {
    return this[key];
  }
}

function addContentArrayObserver() {
  var content = get(this, 'content');
  if (content) {
    content.addArrayObserver(this);
  }
}

function removeAndDestroy(object) {
  this.removeObject(object);
  object.destroy();
}

function syncChildViews() {
  Ember.run.once(this, '_syncChildViews');
}

function sortByContentIndex (viewOne, viewTwo) {
  return get(viewOne, 'contentIndex') - get(viewTwo, 'contentIndex');
}

function notifyMutationListeners() {
  if (Ember.View.notifyMutationListeners) {
    Ember.run.once(Ember.View, 'notifyMutationListeners');
  }
}

function removeEmptyView() {
  var emptyView = get(this, 'emptyView');
  if (emptyView && emptyView instanceof Ember.View) {
    emptyView.removeFromParent();
  }
}

function addEmptyView() {
  var emptyView = get(this, 'emptyView');

  if (!emptyView) {
    return;
  }

  if ('string' === typeof emptyView) {
    emptyView = get(emptyView) || emptyView;
  }

  emptyView = this.createChildView(emptyView);
  set(this, 'emptyView', emptyView);

  if (Ember.CoreView.detect(emptyView)) {
    this._createdEmptyView = emptyView;
  }

  this.unshiftObject(emptyView);
}

var domManager = Ember.create(Ember.ContainerView.proto().domManager);

domManager.prepend = function(view, html) {
  view.$('.ember-list-container').prepend(html);
  notifyMutationListeners();
};

function enableProfilingOutput() {
  function before(name, time, payload) {
    console.time(name);
  }

  function after (name, time, payload) {
    console.timeEnd(name);
  }

  if (Ember.ENABLE_PROFILING) {
    Ember.subscribe('view._scrollContentTo', {
      before: before,
      after: after
    });
    Ember.subscribe('view.updateContext', {
      before: before,
      after: after
    });
  }
}

/**
  @class Ember.ListViewMixin
  @namespace Ember
*/
export default Ember.Mixin.create({
  itemViewClass: ReusableListItemView,
  emptyViewClass: Ember.View,
  classNames: ['ember-list-view'],
  attributeBindings: ['style'],
  classNameBindings: [
    '_isGrid:ember-list-view-grid:ember-list-view-list',
    '_isShelf:ember-list-view-shelf',
    '_isFixed:ember-list-view-fixed'
  ],
  domManager: domManager,
  scrollTop: 0,
  bottomPadding: 0, // TODO: maybe this can go away
  _lastEndingIndex: 0,

  isShelf: false,
  isFixed: false,

  _isGrid: Ember.computed(function() {
    return this._bin.isGrid(this.get('width'));
  }).readOnly(),

  /**
    @private

    Setup a mixin.
    - adding observer to content array
    - creating child views based on height and length of the content array

    @method init
  */
  init: function() {
    this._super();
    this.width = this.width || 0;
    this._bin = this._setupBin();
    this._syncChildViews();
    this._addContentArrayObserver();
  },

  _setupBin: function() {
    if (this.heightForIndex) {
      return this._setupShelfFirstBin();
    } else {
      return this._setupFixedGridBin();
    }
  },

  _setupShelfFirstBin: function() {
    set(this, '_isShelf', true);
    // detect which bin we need
    var bin = new Bin.ShelfFirst([], this.get('width'), 0);
    var list = this;

    bin.length = function() {
      return list.get('content.length'); 
    };

    bin.widthAtIndex = function(index) {
      if (list.widthForIndex) {
        return list.widthForIndex(index);
      } else {
        return Infinity;
      }
    };

    bin.heightAtIndex = function(index) {
      return list.heightForIndex(index);
    };

    return bin;
  },

  _setupFixedGridBin: function() {
    set(this, '_isFixed', true);
    // detect which bin we need
    var bin = new Bin.FixedGrid([], 0, 0);
    var list = this;

    bin.length = function() {
      return list.get('content.length'); 
    };

    bin.widthAtIndex = function() {
      return list.get('elementWidth');
    };

    bin.heightAtIndex = function() {
      return list.get('rowHeight');
    };

    return bin;
  },

  _addContentArrayObserver: Ember.beforeObserver(function() {
    addContentArrayObserver.call(this);
  }, 'content'),

  /**
    Called on your view when it should push strings of HTML into a
    `Ember.RenderBuffer`.

    Adds a [div](https://developer.mozilla.org/en-US/docs/HTML/Element/div)
    with a required `ember-list-container` class.

    @method render
    @param {Ember.RenderBuffer} buffer The render buffer
  */
  render: function(buffer) {
    buffer.push('<div class="ember-list-container">');
    this._super(buffer);
    buffer.push('</div>');
  },

  height: Ember.computed(integer),
  width: Ember.computed(integer),
  rowHeight: Ember.computed(integer),

  willInsertElement: function() {
    if (!this.get("height") || !this.get("rowHeight") && !this.heightForIndex) {
      throw new Error("A ListView must be created with a height and a rowHeight.");
    }
    this._super();
  },

  /**
    @private

    Sets inline styles of the view:
    - height
    - width
    - position
    - overflow
    - -webkit-overflow
    - overflow-scrolling

    Called while attributes binding.

    @property {Ember.ComputedProperty} style
  */
  style: Ember.computed('height', 'width', function() {
    var height, width, style, css;

    height = get(this, 'height');
    width = get(this, 'width');
    css = get(this, 'css');

    style = '';

    if (height) {
      style += 'height:' + height + 'px;';
    }

    if (width)  {
      style += 'width:' + width  + 'px;';
    }

    for ( var rule in css ) {
      if (css.hasOwnProperty(rule)) {
        style += rule + ':' + css[rule] + ';';
      }
    }

    return style;
  }),

  /**
    @private

    Performs visual scrolling. Is overridden in Ember.ListView.

    @method scrollTo
  */
  scrollTo: function(y) {
    throw new Error('must override to perform the visual scroll and effectively delegate to _scrollContentTo');
  },

  /**
    @private

    Internal method used to force scroll position

    @method scrollTo
  */
  _scrollTo: Ember.K,

  /**
    @private
    @method _scrollContentTo
  */
  _scrollContentTo: function(y) {
    var startingIndex, endingIndex,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd, contentLength, scrollTop, content;

    scrollTop = max(0, y);

    if (this.scrollTop === scrollTop) {
      return;
    }

    // allow a visual overscroll, but don't scroll the content. As we are doing needless
    // recycyling, and adding unexpected nodes to the DOM.
    var maxScrollTop = max(0, get(this, 'totalHeight') - get(this, 'height'));
    scrollTop = min(scrollTop, maxScrollTop);

    content = get(this, 'content');
    contentLength = get(content, 'length');
    this.scrollTop = scrollTop;
    startingIndex = this._startingIndex(contentLength);

    Ember.instrument('view._scrollContentTo', {
      scrollTop: scrollTop,
      content: content,
      startingIndex: startingIndex,
      endingIndex: min(max(contentLength - 1, 0), startingIndex + this._numChildViewsForViewport())
    }, function () {
      maxContentIndex = max(contentLength - 1, 0);

      startingIndex = this._startingIndex();
      visibleEndingIndex = startingIndex + this._numChildViewsForViewport();

      endingIndex = min(maxContentIndex, visibleEndingIndex);

      if (startingIndex === this._lastStartingIndex &&
          endingIndex === this._lastEndingIndex) {

        this.trigger('scrollYChanged', y);
        return;
      } else {

        Ember.run(this, function() {
          this._reuseChildren();

          this._lastStartingIndex = startingIndex;
          this._lastEndingIndex = endingIndex;
          this.trigger('scrollYChanged', y);
        });
      }
    }, this);

  },

  _doElementDimensionChange: function() {
    // flush bin
    this._bin.flush(0);
    Ember.propertyDidChange(this, 'isGrid');
    Ember.run.once(this, this._syncChildViews);
  },

  _elementDimensionDidChange: Ember.beforeObserver('elementWidth', 'rowHeight', 'width', 'height', function() {
    this._doElementDimensionChange();
  }),

  /**
    @private

    Computes the height for a `Ember.ListView` scrollable container div.
    You must specify `rowHeight` parameter for the height to be computed properly.

    @property {Ember.ComputedProperty} totalHeight
  */
  totalHeight: Ember.computed('content.length',
                              'width',
                              'rowHeight',
                              'elementWidth',
                              'bottomPadding', function() {
    return this._bin.height(this.get('width')) + this.get('bottomPadding');
  }),

  /**
    @private
    @method _prepareChildForReuse
  */
  _prepareChildForReuse: function(childView) {
    childView.prepareForReuse();
  },

  /**
    @private
    @method _reuseChildForContentIndex
  */
  _reuseChildForContentIndex: function(childView, contentIndex) {
    var content, context, newContext, childsCurrentContentIndex, position, enableProfiling, oldChildView;

    var contentViewClass = this.itemViewForIndex(contentIndex);

    if (childView.constructor !== contentViewClass) {
      // rather then associative arrays, lets move childView + contentEntry maping to a Map
      var i = this._childViews.indexOf(childView);

      childView.destroy();
      childView = this.createChildView(contentViewClass);

      this.insertAt(i, childView);
    }

    content = get(this, 'content');
    enableProfiling = get(this, 'enableProfiling');
    position = this.positionForIndex(contentIndex);
    childView.updatePosition(position);

    set(childView, 'contentIndex', contentIndex);

    if (enableProfiling) {
      Ember.instrument('view._reuseChildForContentIndex', position, function() {

      }, this);
    }

    newContext = content.objectAt(contentIndex);
    childView.updateContext(newContext);
  },

  /**
    @private
    @method positionForIndex
  */
  positionForIndex: function(index) {
    if (this.get('content.length') === 0) {
      // TODO: Hack, to handle clearing the array. Actually the views should
      // just be removed
      return {
        x: 0,
        y: 0
      };
    }
    return this._bin.position(index, this.get('width'));
  },

  /**
    @private
    @method _childViewCount
  */
  _childViewCount: function() {
    var contentLength, childViewCountForHeight;

    contentLength = get(this, 'content.length');
    childViewCountForHeight = this._numChildViewsForViewport();

    return min(contentLength, childViewCountForHeight);
  },

  /**
    @private

    Computes max possible scrollTop value given the visible viewport
    and scrollable container div height.

    @property {Ember.ComputedProperty} maxScrollTop
  */
  maxScrollTop: Ember.computed('height', 'totalHeight', function(){
    var totalHeight, viewportHeight;

    totalHeight = get(this, 'totalHeight');
    viewportHeight = get(this, 'height');

    return max(0, totalHeight - viewportHeight);
  }),

  /**
    @private

    Determines whether the emptyView is the current childView.

    @method _isChildEmptyView
  */
  _isChildEmptyView: function() {
    var emptyView = get(this, 'emptyView');

    return emptyView && emptyView instanceof Ember.View &&
           this._childViews.length === 1 && this._childViews.indexOf(emptyView) === 0;
  },

  /**
    @private

    Computes the number of views that would fit in the viewport area.
    You must specify `height` and `rowHeight` parameters for the number of
    views to be computed properly.

    @method _numChildViewsForViewport
  */

  _numChildViewsForViewport:  function() {
    var height = get(this, 'height');
    var width = get(this, 'width');
    // TODO: defer padding calculation to the bin
    var scrollTop = this.get('scrollTop');

    var numVisible = this._bin.numberVisibleWithin(scrollTop, width, height, true);

    return numVisible;
  },

  /**
    @private

    Computes the starting index of the item views array.
    Takes `scrollTop` property of the element into account.

    Is used in `_syncChildViews`.

    @method _startingIndex
  */
  _startingIndex: function(_contentLength) {
    var scrollTop, rowHeight, calculatedStartingIndex,
        contentLength;

    if (_contentLength === undefined) {
      contentLength = get(this, 'content.length');
    } else {
      contentLength = _contentLength;
    }

    scrollTop = this.scrollTop;
    rowHeight = get(this, 'rowHeight');

    calculatedStartingIndex  = this._bin.visibleStartingIndex(scrollTop, this.get('width'));

    var viewsNeededForViewport = this._numChildViewsForViewport();
    var largestStartingIndex = max(contentLength - viewsNeededForViewport, 0);

    return min(calculatedStartingIndex, largestStartingIndex);
  },

  /**
    @private
    @event contentWillChange
  */
  contentWillChange: Ember.beforeObserver(function() {
    var content;

    content = get(this, 'content');

    if (content) {
      content.removeArrayObserver(this);
    }
  }, 'content'),

  /**),
    @private
    @event contentDidChange
  */
  contentDidChange: Ember.observer(function() {
    addContentArrayObserver.call(this);
    syncChildViews.call(this);
  }, 'content'),

  /**
    @private
    @property {Function} needsSyncChildViews
  */
  needsSyncChildViews: Ember.observer(syncChildViews, 'height', 'width', 'rowHeight', 'elementWidth'),

  /**
    @private

    Returns a new item view. Takes `contentIndex` to set the context
    of the returned view properly.

    @param {Number} contentIndex item index in the content array
    @method _addItemView
  */
  _addItemView: function(contentIndex){
    var itemViewClass, childView;

    itemViewClass = this.itemViewForIndex(contentIndex);
    childView = this.createChildView(itemViewClass);

    this.pushObject(childView);
  },

  /**
    @public

    Returns a view class for the provided contentIndex. If the view is
    different then the one currently present it will remove the existing view
    and replace it with an instance of the class provided

    @param {Number} contentIndex item index in the content array
    @method _addItemView
    @returns {Ember.View} ember view class for this index
  */
  itemViewForIndex: function(contentIndex) {
    return get(this, 'itemViewClass');
  },

  /**
    @public

    Returns a view class for the provided contentIndex. If the view is
    different then the one currently present it will remove the existing view
    and replace it with an instance of the class provided

    @param {Number} contentIndex item index in the content array
    @method _addItemView
    @returns {Ember.View} ember view class for this index
  */
  heightForIndex: null,

  /**
    @private

    Intelligently manages the number of childviews.

    @method _syncChildViews
   **/
  _syncScrollTop: function() {
    var newNumber = this._numChildViewsForViewport();
    var oldNumber = this._oldNumberOfViewsNeededForViewport;

    if (oldNumber !== newNumber) {
      var maxScrollTop = get(this, 'maxScrollTop');
      var currentScrollTop = this.scrollTop;
      var scrollTop = min(maxScrollTop, currentScrollTop * oldNumber/newNumber);

      if (scrollTop === scrollTop) {
        this._scrollTo(scrollTop);
        this.scrollTop = scrollTop;
      } else {
        // scrollTop was NaN;
      }

      this._oldNumberOfViewsNeededForViewport = newNumber;
    }
  },

  _syncChildViews: function(){
    var childViews, childViewCount,
        numberOfChildViews, numberOfChildViewsNeeded,
        contentIndex, startingIndex, endingIndex,
        contentLength, emptyView, count, delta;

    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) {
      return;
    }

    this._syncScrollTop();

    contentLength = get(this, 'content.length');
    emptyView = get(this, 'emptyView');

    childViewCount = this._childViewCount();
    childViews = this.positionOrderedChildViews();

    if (this._isChildEmptyView()) {
      removeEmptyView.call(this);
    }

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
      forEach(
        childViews.splice(numberOfChildViewsNeeded, numberOfChildViews),
        removeAndDestroy,
        this
      );
    }

    this._reuseChildren();

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex   = this._lastEndingIndex + delta;

    if (contentLength === 0 || contentLength === undefined) {
      addEmptyView.call(this);
    }
  },

  /**
    @private
    @method _reuseChildren
  */
  _reuseChildren: function(){
    var contentLength, childViews, childViewsLength,
        startingIndex, endingIndex, childView, attrs,
        contentIndex, visibleEndingIndex, maxContentIndex,
        contentIndexEnd, scrollTop;

    scrollTop = this.scrollTop;
    contentLength = get(this, 'content.length');
    maxContentIndex = max(contentLength - 1, 0);
    childViews = this.getReusableChildViews();
    childViewsLength =  childViews.length;

    startingIndex = this._startingIndex();
    visibleEndingIndex = startingIndex + this._numChildViewsForViewport();

    endingIndex = min(maxContentIndex, visibleEndingIndex);

    contentIndexEnd = min(visibleEndingIndex, startingIndex + childViewsLength);

    for (contentIndex = startingIndex; contentIndex < contentIndexEnd; contentIndex++) {
      childView = childViews[contentIndex % childViewsLength];
      this._reuseChildForContentIndex(childView, contentIndex);
    }
  },

  /**
    @private
    @method getReusableChildViews
  */
  getReusableChildViews: function() {
    return this._childViews;
  },

  /**
    @private
    @method positionOrderedChildViews
  */
  positionOrderedChildViews: function() {
    return this.getReusableChildViews().sort(sortByContentIndex);
  },

  arrayWillChange: Ember.K,

  /**
    @private
    @event arrayDidChange
  */
  // TODO: refactor
  arrayDidChange: function(content, start, removedCount, addedCount) {
    var index, contentIndex, state;

    removeEmptyView.call(this);

    // Support old and new Ember versions
    state = this._state || this.state;

    this._bin.flush(start);
    Ember.propertyDidChange(this, 'isGrid');
    var length = this.get('content.length');

    if (state === 'inDOM') {
      // ignore if all changes are out of the visible change
      if (start >= this._lastStartingIndex || start < this._lastEndingIndex) {
        index = 0;
        // ignore all changes not in the visible range
        // this can re-position many, rather then causing a cascade of re-renders
        forEach(
          this.positionOrderedChildViews(),
          function(childView) {
            contentIndex = this._lastStartingIndex + index;
            if (contentIndex < length) {
              // TODO: i would prefer to prune children before this.
              this._reuseChildForContentIndex(childView, contentIndex);
            }
            index++;
          },
          this
        );
      }

      syncChildViews.call(this);
    }
  },

  destroy: function () {
    if (!this._super()) { return; }

    if (this._createdEmptyView) {
      this._createdEmptyView.destroy();
    }

    return this;
  }
});
