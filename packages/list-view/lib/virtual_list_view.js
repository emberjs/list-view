/*global Scroller*/
require('list-view/list_view_mixin');
require('list-view/list_view_helper');

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
    var view = this;

    view.scroller = new Scroller(function(left, top, zoom) {
      if (view.state !== 'inDOM') { return; }

      if (view.listContainerElement) {
        view.applyTransform(view.listContainerElement, {x: 0, y: -top});
        view._scrollContentTo(max(0, top));
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
      //TODO: this.showScrollbar()
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
