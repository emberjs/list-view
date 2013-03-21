require('list-view/list_item_view');

var get = Ember.get, set = Ember.set;

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
    var self = this,
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
    var element = get(this, 'element');

    element.removeEventListener('scroll', this._scroll);
    element.removeEventListener('touchmove', this._touchMove);
    element.removeEventListener('mousewheel', this._mouseWheel);
  },

  // Browser fires the scroll event asynchronously
  scroll: function(e) {
    Ember.run(this, this.scrollTo, e.target.scrollTop);
  },

  scrollTo: function(scrollTop) {
    set(this, 'scrollTop', scrollTop);

    var itemViewClass = get(this, 'itemViewClass'),
        contentLength = get(this, 'content.length'),
        childViews = this,
        childViewsLength = get(this, 'length') - 1, // account for scrollingView
        startingIndex = this._startingIndex(),
        endingIndex = startingIndex + this._numOfChildViewsForHeight(),
        childView, attrs;

    if (startingIndex === this._lastStartingIndex && endingIndex === this._lastEndingIndex) { return; }

    for (var contentIndex = startingIndex; contentIndex < endingIndex; contentIndex++) {
      childView = childViews.objectAt(contentIndex % childViewsLength);

      this._reuseChildForContentIndex(childView, contentIndex);
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
  },

  childViewsWillSync: Ember.K,
  childViewsDidSync: Ember.K,

  totalHeight: Ember.computed(function() {
    return get(this, 'content.length') * get(this, 'rowHeight');
  }).property('content.length', 'rowHeight'),


  _prepareChildForReuse: function(childView) {
    childView.prepareForReuse();
  },

  _reuseChildForContentIndex: function(childView, contentIndex) {

    this._prepareChildForReuse(childView);

    var content = get(this, 'content');
    var childsCurrentContentIndex = get(childView, 'contentIndex');

    set(childView, 'top', get(this, 'rowHeight') * contentIndex);
    set(childView, 'context', content.objectAt(contentIndex));
    set(childView, 'contentIndex', contentIndex);
  },

  _numOfChildViews: function() {
    var contentLength = get(this, 'content.length'),
        numOfChildViewsForHeight = this._numOfChildViewsForHeight();

    if (numOfChildViewsForHeight > contentLength) {
      return contentLength;
    } else {
      return numOfChildViewsForHeight;
    }
  },

  _numOfChildViewsForHeight: function() {
    var height = get(this, 'height'),
    rowHeight = get(this, 'rowHeight'),
    paddingCount = get(this, 'paddingCount');

    return height / rowHeight  + paddingCount;
  },

  _startingIndex: function() {
    var scrollTop = get(this, 'scrollTop'),
        rowHeight = get(this, 'rowHeight');

    return Math.floor(scrollTop / rowHeight);
  },

  contentWillChange: Ember.beforeObserver(function() {
    var content = get(this, 'content');
    if (content) {
      content.removeArrayObserver(this);
    }
  }, 'content'),

  contentDidChange: Ember.observer(function() {
    var content = get(this, 'content');
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
    this.childViewsWillSync();

    var itemViewClass = get(this, 'itemViewClass'),
    startingIndex = this._startingIndex(),
    endingIndex = startingIndex + this._numOfChildViews(),

    numOfChildViewsNeeded = this._numOfChildViews(),
    currentNumOfChildViews = this.get('length'),

    delta = numOfChildViewsNeeded - currentNumOfChildViews,
    index = this._lastEndingIndex || startingIndex;

    if (delta === 0){
      // noop
    } else if (delta > 0) {
      for (var count = 0; count < delta; count++, index++){
        this._addItemView(itemViewClass, index);
      }
    } else {

      var that = this,
      childViewsLength = get(this, 'childViews.length');

      this.positionOrderdChildViews().
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

    var childViews = get(this, 'childViews');

    function sortByTopProperty(a, b){
      return get(a, 'top') - get(b, 'top');
    }

    return childViews.sort(sortByTopProperty);
  },

  arrayWillChange: Ember.K,

  arrayDidChange: function(content, start, removedCount, addedCount) {
    if (this.state === 'inDOM') {
      // only bother doing anything if it's a visible change
      // TODO: clean this up .... less hacks
      if( start >= this._lastStartingIndex || start < this._lastEndingIndex) {
        var index = 0, contentIndex;
        this.positionOrderdChildViews().forEach(function(childView){

          if(childView.prepareForReuse){ // hack
            contentIndex = this._lastStartingIndex + index;

            // we can likely be only cause a context change for the ones that changes
            // and re-position the rest
            this._reuseChildForContentIndex(childView, contentIndex);
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
    var scrollingView = get(this, '_scrollingView');

    this.removeObject(scrollingView);
  },

  childViewsDidSync: function(){
    var scrollingView = get(this, '_scrollingView');

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
