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
        _this.scrollTo(max(0, top));
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
    var self, listContainerElement;

    self = this;
    this.listContainerElement = this.$('> .ember-list-container')[0];

    self._touchStart = function(e) { self.touchStart(e); };
    self._touchMove = function(e) { self.touchMove(e); };
    self._touchEnd = function(e) { self.touchEnd(e); };
    self._mouseDown = function(e) { self.mouseDown(e); };
    self._mouseMove = function(e) { self.mouseMove(e); };
    self._mouseUp = function(e) { self.mouseUp(e); };
    self._mouseWheel = function(e) { self.mouseWheel(e); };

    this.listContainerElement.addEventListener('touchstart',  this._touchStart);
    this.listContainerElement.addEventListener('touchmove',  this._touchMove);
    this.listContainerElement.addEventListener('touchend',  this._touchEnd);
    this.listContainerElement.addEventListener('mousedown',  this._mouseDown);
    this.listContainerElement.addEventListener('mousemove',  this._mouseMove);
    this.listContainerElement.addEventListener('mouseup',  this._mouseUp);
    this.listContainerElement.addEventListener('mousewheel', this._mouseWheel);
  },

  willDestroyElement: function() {
    this.listContainerElement.removeEventListener('touchstart', this._touchStart);
    this.listContainerElement.removeEventListener('touchmove', this._touchMove);
    this.listContainerElement.removeEventListener('touchend', this._touchEnd);
    this.listContainerElement.removeEventListener('mousedown', this._mouseDown);
    this.listContainerElement.removeEventListener('mousemove', this._mouseMove);
    this.listContainerElement.removeEventListener('mouseup', this._mouseUp);
    this.listContainerElement.removeEventListener('mousewheel', this._mouseWheel);
  },
  mouseWheel: function(e){
    // TODO: translate mouseWheel to beginScroll/continueScroll/endScroll
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
    this.beginScroll(e.touches, e.timeStamp);
    return false;
  },
  touchMove: function(e){
    this.continueScroll(e.touches, e.timeStamp);
    return false;
  },
  touchEnd: function(e){
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
  scrollerScrollTo: function(y, animate){
    if (animate === undefined) {
      animate = true;
    }
    this.scroller.scrollTo(0, y, animate, 1);
  }
});
