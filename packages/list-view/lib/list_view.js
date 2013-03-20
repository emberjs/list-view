require('list-view/list_item_view');

var get = Ember.get, set = Ember.set;

Ember.ListView = Ember.ContainerView.extend({
  classNames: ['ember-list-view'],
  attributeBindings: ['style'],
  scrollTop: 0,
  itemViewClass: Ember.ListItemView,

  init: function() {
    this.contentDidChange(); // Setup array observing
    this._super();
    this._renderList();
  },

  style: Ember.computed(function() {
    return "height: " + get(this, 'height') + "px";
  }).property('height'),

  didInsertElement: function() {
    var self = this,
        element = get(this, 'element');

    self._scroll = function(e) { self.scroll(e); };
    element.addEventListener('scroll', this._scroll);
  },

  willDestroyElement: function() {
    var element = get(this, 'element');
    element.removeEventListener('scroll', this._scroll);
  },

  // Browser fires the scroll event asynchronously
  scroll: function(e) {
    Ember.run(this, this.scrollTo, e.target.scrollTop);
  },

  _renderList: function() {
    this._createChildViews();
    this._appendScrollingView();
  },

  _rerenderList: function() {
    this.destroyAllChildren();
    this._renderList();
  },

  _createScrollingView: function() {
    return Ember.View.createWithMixins({
      attributeBindings: ['style'],

      style: Ember.computed(function() {
        return "height: " + get(this, 'parentView.totalHeight') + "px";
      }).property('parentView.totalHeight')
    });
  },

  _appendScrollingView: function() {
    this.pushObject(this._createScrollingView());
  },

  totalHeight: Ember.computed(function() {
    return get(this, 'content.length') * get(this, 'rowHeight');
  }).property('content.length', 'rowHeight'),

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
      this._prepareChildForReuse(childView);
      this._reuseChildForContentIndex(childView, contentIndex);
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
  },

  _prepareChildForReuse: function(childView) {
    childView.prepareForReuse();
  },

  _reuseChildForContentIndex: function(childView, contentIndex) {
    var content = get(this, 'content');

    var childsCurrentContentIndex = get(childView, 'contentIndex');

    if (childsCurrentContentIndex !== contentIndex) {
      set(childView, 'top', get(this, 'rowHeight') * contentIndex);
      set(childView, 'context', content.objectAt(contentIndex));
      set(childView, 'contentIndex', contentIndex);
    }
  },

  _createChildViews: function() {
    var itemViewClass = get(this, 'itemViewClass'),
        content = Ember.A(get(this, 'content')),
        contentLength = get(content, 'length'),
        childViews = this,
        startingIndex = this._startingIndex(),
        endingIndex = startingIndex + this._numOfChildViews(),
        childView, attrs;

    for (var contentIndex = startingIndex; contentIndex < endingIndex; contentIndex++) {
      childView = itemViewClass.create();
      this._reuseChildForContentIndex(childView, contentIndex);
      childViews.pushObject(childView);
    }

    this._lastStartingIndex = startingIndex;
    this._lastEndingIndex = endingIndex;
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
    return get(this, 'height') / get(this, 'rowHeight') + 1; // One row for padding
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
      this._rerenderList();
    }
  }, 'content'),

  // TODO: Handle array changes without rerendering the list
  arrayWillChange: Ember.K,
  arrayDidChange: function(content, start, removedCount, addedCount) {
    if (this.state === 'inDOM') {
      this._rerenderList();
    }
  }
});
