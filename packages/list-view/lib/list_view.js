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
    this.contentDidChange(); // Setup array observing
    this._super();
    this._syncChildViews();
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

    this.scrollTo(get(this, 'scrollTop'));
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

  scrollTo: function(scrollTop) {

    var itemViewClass, contentLength, childViews, childViewsLength,
    startingIndex, endingIndex, childView, attrs, contentIndex;

    set(this, 'scrollTop', scrollTop);

    itemViewClass = get(this, 'itemViewClass');
    contentLength = get(this, 'content.length');
    childViews = this;
    childViewsLength = get(this, 'length') - 1;
    startingIndex = this._startingIndex();
    endingIndex = min(contentLength, startingIndex + this._numChildViewsForViewport());

    if (startingIndex === this._lastStartingIndex && endingIndex === this._lastEndingIndex) { return; }

    for (contentIndex = startingIndex; contentIndex < endingIndex; contentIndex++) {
      childView = childViews.objectAt(contentIndex % childViewsLength);

      this._reuseChildForContentIndex(childView, contentIndex);
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
    position = this.positionForContentIndex(contentIndex);

    options = options || {};
    this._prepareChildForReuse(childView);

    if (childsCurrentContentIndex !== contentIndex || options.force) {
      set(childView, 'position', position);
      set(childView, 'context', content.objectAt(contentIndex));
      set(childView, 'contentIndex', contentIndex);
    }
  },

  positionForContentIndex: function(index){
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

  _numOfChildViews: function() {
    var contentLength, numOfChildViewsForHeight;

    contentLength = get(this, 'content.length');
    numOfChildViewsForHeight = this._numChildViewsForViewport();

    if (numOfChildViewsForHeight > contentLength) {
      return contentLength;
    } else {
      return numOfChildViewsForHeight;
    }
  },

  _columnCount: function(){
    var elementWidth, width;

    elementWidth = get(this, 'elementWidth');
    width = get(this, 'width') || 1;

    if(elementWidth){
      return floor(width/elementWidth);
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

    if (this.state === 'inDOM') {
      this._syncChildViews();
    }
  }, 'content'),

  heightDidChange: Ember.observer(function(){
    this._syncChildViews();
  }, 'height'),

  _addItemView: function(itemViewClass, contentIndex){
    var childView = itemViewClass.create();
    this._reuseChildForContentIndex(childView, contentIndex);

    this.pushObject(childView);
   },

   // TODO: cleanup
  _syncChildViews: function(){
    var that, itemViewClass, startingIndex, numOfChildViews,
    endingIndex, numOfChildViewsNeeded, currentNumOfChildViews,
    childViews, count;

    this.childViewsWillSync();

    that = this;

    itemViewClass = get(this, 'itemViewClass');
    startingIndex = this._startingIndex();
    numOfChildViews = this._numOfChildViews();
    endingIndex = startingIndex + numOfChildViews;

    numOfChildViewsNeeded = numOfChildViews;
    currentNumOfChildViews = this.get('length');

    delta = numOfChildViewsNeeded - currentNumOfChildViews,
    index = this._lastEndingIndex || startingIndex;

    if (delta === 0) {
      // noop
    } else if (delta > 0) {
      for (count = 0; count < delta; count++, index++){
        this._addItemView(itemViewClass, index);
      }
    } else {

      childViewsLength = get(this, 'childViews.length');

      // extract
      this.positionOrderedChildViews().
        splice(numOfChildViewsNeeded, childViewsLength).
        forEach(function(childView){
          that.removeObject(childView);
          childView.destroy();
        });
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = numOfChildViewsNeeded;

    this.childViewsDidSync();
  },

  positionOrderdChildViews: function() {
    var childViews;

    childViews = get(this, 'childViews');

    function sortByTopProperty(a, b){
      return get(a, 'top') - get(b, 'top');
    }

    return childViews.sort(sortByTopProperty);
  },

  arrayWillChange: Ember.K,

  arrayDidChange: function(content, start, removedCount, addedCount) {
    var index, contentIndex;

    if (this.state === 'inDOM') {
      // only bother doing anything if it's a visible change
      // TODO: clean this up
      if( start >= this._lastStartingIndex || start < this._lastEndingIndex) {
        index = 0, contentIndex;
        this.positionOrderdChildViews().forEach(function(childView){

          if(childView.prepareForReuse){ // hack
            contentIndex = this._lastStartingIndex + index;

            // we can likely be only cause a context change for the ones that changes
            // and re-position the rest
            this._reuseChildForContentIndex(childView, contentIndex, { force: true });
            index++;
          }
        }, this);
      }

      this._syncChildViews();
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
