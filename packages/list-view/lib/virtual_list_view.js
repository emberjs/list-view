require('list-view/list_view');
var max = Math.max;

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
    var _this = this;
    this.scroller = new Scroller(function(left, top, zoom) {
      if (_this.listContainerElement) {
        _this.listContainerElement.style.webkitTransform = 'translate3d( 0px, ' + (-top) + 'px, 0)';
        _this.scrollTo(max(0, top));
      }
    }, {
      scrollingX: false
    });

    // Configure to have an outer dimension of 1000px and inner dimension of 3000px
    this.scroller.setDimensions(this.get('width'), this.get('height'), this.get('width'), this.get('totalHeight'));
  },

  didInsertElement: function() {
    var self, listContainerElement;

    self = this;
    this.listContainerElement = this.$('> .ember-list-container')[0];

    self._scroll = function(e) { self.scroll(e); };
    self._touchStart = function(e) { self.touchStart(e); };
    self._touchMove = function(e) { self.touchMove(e); };
    self._touchEnd = function(e) { self.touchEnd(e); };
    self._mouseDown = function(e) { self.mouseDown(e); };
    self._mouseMove = function(e) { self.mouseMove(e); };
    self._mouseUp = function(e) { self.mouseUp(e); };
    self._mouseWheel = function(e) { self.mouseWheel(e); };

    this.listContainerElement.addEventListener('scroll',     this._scroll);
    this.listContainerElement.addEventListener('touchstart',  this._touchStart);
    this.listContainerElement.addEventListener('touchmove',  this._touchMove);
    this.listContainerElement.addEventListener('touchend',  this._touchEnd);
    this.listContainerElement.addEventListener('mousedown',  this._mouseDown);
    this.listContainerElement.addEventListener('mousemove',  this._mouseMove);
    this.listContainerElement.addEventListener('mouseup',  this._mouseUp);
    this.listContainerElement.addEventListener('mousewheel', this._mouseWheel);
  },

  willDestroyElement: function() {
    this.listContainerElement.removeEventListener('scroll', this._scroll);
    this.listContainerElement.removeEventListener('touchstart', this._touchStart);
    this.listContainerElement.removeEventListener('touchmove', this._touchMove);
    this.listContainerElement.removeEventListener('touchend', this._touchEnd);
    this.listContainerElement.removeEventListener('mousedown', this._mouseDown);
    this.listContainerElement.removeEventListener('mousemove', this._mouseMove);
    this.listContainerElement.removeEventListener('mouseup', this._mouseUp);
    this.listContainerElement.removeEventListener('mousewheel', this._mouseWheel);
  },

  mouseWheel: function(e){
    e.preventDefault();

    // this.scroller.doTouchMove(, e.timeStamp);

    // var inverted = e.webkitDirectionInvertedFromDevice;
    // this.y = this.y || 0;

    // if (inverted) {
    //   this.y -= e.wheelDeltaY;
    // } else {
    //   this.y += e.wheelDeltaY;
    // }

    // if (this.y > -1) { this.y = 0; }

    return false;
  },

  touchStart: function(e){
    this.scroller.doTouchStart(e.touches, e.timeStamp);
    return false;
  },
  touchMove: function(e){
    this.scroller.doTouchMove(e.touches, e.timeStamp);
    return false;
  },
  touchEnd: function(e){
    this.scroller.doTouchEnd(e.timeStamp);
    return false;
  },
  mouseDown: function(e){
    this.scroller.doTouchStart([e], e.timeStamp);
    return false;
  },
  mouseMove: function(e){
    this.scroller.doTouchMove([e], e.timeStamp);
    return false;
  },
  mouseUp: function(e){
    this.scroller.doTouchEnd(e.timeStamp);
    return false;
  }
});
