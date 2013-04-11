/*global Scroller*/
require('list-view/list_view_mixin');
require('list-view/list_view_helper');

var max = Math.max;
function updateScrollerDimensions(){
  this.scroller.setDimensions(this.get('width'), this.get('height'), this.get('width'), this.get('totalHeight'));
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
    var _this = this;

    this.scroller = new Scroller(function(left, top, zoom) {
      if (_this.listContainerElement) {
        _this.applyTransform(_this.listContainerElement, {x: 0, y: -top});
        _this._scrollContentTo(max(0, top));
      }
    }, {
      scrollingX: false
    });
    updateScrollerDimensions.call(this);
    this.scroller.setDimensions(this.get('width'), this.get('height'), this.get('width'), this.get('totalHeight'));
  },

  scrollerDimensionsNeedToChange: Ember.observer(function() {
    Ember.run.once(this, updateScrollerDimensions);
  }, 'width', 'height', 'elementWidth'),

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

  beginScroll: function(touches, timeStamp) {
    this.scroller.doTouchStart(touches, timeStamp);
  },

  continueScroll: function(touches, timeStamp) {
    this.scroller.doTouchMove(touches, timeStamp);
  },

  endScroll: function(timeStamp) {
    this.scroller.doTouchEnd(timeStamp);
  },

  touchStart: function(e){
    e = e.originalEvent || e;
    this.beginScroll(e.touches, e.timeStamp);
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
    this.beginScroll([e], e.timeStamp);
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
