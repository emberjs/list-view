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
    this.listContainerElement = el = this.$('> .ember-list-container')[0];

    self.__touchStart = function(e) { self._touchStart(e); };
    self.__touchMove =  function(e) { self._touchMove(e);  };
    self.__touchEnd =   function(e) { self._touchEnd(e);   };
    self.__mouseDown =  function(e) { self._mouseDown(e);  };
    self.__mouseMove =  function(e) { self._mouseMove(e);  };
    self.__mouseUp =    function(e) { self._mouseUp(e);    };
    self.__mouseWheel = function(e) { self._mouseWheel(e); };

    el.addEventListener('touchstart', this.__touchStart);
    el.addEventListener('touchmove',  this.__touchMove);
    el.addEventListener('touchend',   this.__touchEnd);
    el.addEventListener('mousedown',  this.__mouseDown);
    el.addEventListener('mousemove',  this.__mouseMove);
    el.addEventListener('mouseup',    this.__mouseUp);
    el.addEventListener('mousewheel', this.__mouseWheel);
  },

  willDestroyElement: function() {
    var el = this.listContainerElement;

    el.removeEventListener('touchstart', this.__touchStart);
    el.removeEventListener('touchmove',  this.__touchMove);
    el.removeEventListener('touchend',   this.__touchEnd);
    el.removeEventListener('mousedown',  this.__mouseDown);
    el.removeEventListener('mousemove',  this.__mouseMove);
    el.removeEventListener('mouseup',    this.__mouseUp);
    el.removeEventListener('mousewheel', this.__mouseWheel);
  },

  _mouseWheel: function(e){
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

  _touchStart: function(e){
    if (e.touches) {
      this.beginScroll(e.touches, e.timeStamp);
    }
    return false;
  },

  _touchMove: function(e){
    if (e.touches) {
      this.continueScroll(e.touches, e.timeStamp);
    }
    return false;
  },

  _touchEnd: function(e){
    this.endScroll(e.timeStamp);
    return false;
  },

  _mouseDown: function(e){
    this.beginScroll([e], e.timeStamp);
    return false;
  },

  _mouseMove: function(e){
    this.continueScroll([e], e.timeStamp);
    return false;
  },

  _mouseUp: function(e){
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
