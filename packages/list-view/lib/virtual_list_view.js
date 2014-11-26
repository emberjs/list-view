/*
  global Scroller
*/

import ListViewMixin from 'list-view/list_view_mixin';
import { TransformMixin } from 'list-view/list_item_view_mixin';
import ListViewHelper from 'list-view/list_view_helper';
import VirtualListScrollerEvents from 'list-view/virtual_list_scroller_events';

var max = Math.max, get = Ember.get, set = Ember.set;

function updateScrollerDimensions(target) {
  var width, height, totalHeight;

  target = target || this; // jshint ignore:line

  width = get(target, 'width');
  height = get(target, 'height');
  totalHeight = get(target, 'totalHeight'); // jshint ignore:line

  target.scroller.setDimensions(width, height, width, totalHeight);
  target.trigger('scrollerDimensionsDidChange');
}

/**
  VirtualListView

  @class VirtualListView
  @namespace Ember
*/
export default Ember.ContainerView.extend(ListViewMixin, VirtualListScrollerEvents, {
  _isScrolling: false,
  _mouseWheel: null,
  css: {
    position: 'relative',
    overflow: 'hidden'
  },

  init: function(){
    this._super();
    this.setupScroller();
    this.setupPullToRefresh();
  },
  _scrollerTop: 0,
  applyTransform: ListViewHelper.apply3DTransform,

  setupScroller: function(){
    var view, y;

    view = this;

    view.scroller = new Scroller(function(left, top, zoom) {
      // Support old and new Ember versions
      var state = view._state || view.state;

      if (state !== 'inDOM') {
        return;
      }

      if (view.listContainerElement) {
        view._scrollerTop = top;
        view._scrollContentTo(top);
        view.applyTransform(view.listContainerElement, 0, -top);
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
  setupPullToRefresh: function() {
    if (!this.pullToRefreshViewClass) {
      return;
    }

    this._insertPullToRefreshView();
    this._activateScrollerPullToRefresh();
  },
  _insertPullToRefreshView: function(){
    var pulldownClass = this.pullToRefreshViewClass.extend(TransformMixin);
    this.pullToRefreshView = this.createChildView(pulldownClass);
    this.insertAt(0, this.pullToRefreshView);

    var view = this;

    this.pullToRefreshView.on('didInsertElement', function(){
      Ember.run.schedule('afterRender', this, function(){
        view.applyTransform(this, 0, -1 * view.pullToRefreshViewHeight);
      });
    });
  },
  _activateScrollerPullToRefresh: function(){
    var view = this;
    function activatePullToRefresh(){
      view.pullToRefreshView.set('active', true);
      view.trigger('activatePullToRefresh');
    }
    function deactivatePullToRefresh() {
      view.pullToRefreshView.set('active', false);
      view.trigger('deactivatePullToRefresh');
    }
    function startPullToRefresh() {
      Ember.run(function(){
        view.pullToRefreshView.set('refreshing', true);

        function finishRefresh(){
          if (view && !view.get('isDestroyed') && !view.get('isDestroying')) {
            view.scroller.finishPullToRefresh();
            view.pullToRefreshView.set('refreshing', false);
          }
        }
        view.startRefresh(finishRefresh);
      });
    }
    this.scroller.activatePullToRefresh(
      this.pullToRefreshViewHeight,
      activatePullToRefresh,
      deactivatePullToRefresh,
      startPullToRefresh
    );
  },

  getReusableChildViews: function(){
    var firstView = this._childViews[0];
    if (firstView && firstView === this.pullToRefreshView) {
      return this._childViews.slice(1);
    } else {
      return this._childViews;
    }
  },

  scrollerDimensionsNeedToChange: Ember.observer(function() {
    Ember.run.once(this, updateScrollerDimensions);
  }, 'width', 'height', 'totalHeight'),

  didInsertElement: function() {
    this.listContainerElement = this.$('> .ember-list-container')[0];
  },

  willBeginScroll: function(touches, timeStamp) {
    this._isScrolling = false;
    this.trigger('scrollingDidStart');

    this.scroller.doTouchStart(touches, timeStamp);
  },

  continueScroll: function(touches, timeStamp) {
    var startingScrollTop, endingScrollTop, event;

    if (this._isScrolling) {
      this.scroller.doTouchMove(touches, timeStamp);
    } else {
      startingScrollTop = this._scrollerTop;

      this.scroller.doTouchMove(touches, timeStamp);

      endingScrollTop = this._scrollerTop;

      if (startingScrollTop !== endingScrollTop) {
        event = Ember.$.Event("scrollerstart");
        Ember.$(touches[0].target).trigger(event);

        this._isScrolling = true;
      }
    }
  },

  endScroll: function(timeStamp) {
    this.scroller.doTouchEnd(timeStamp);
  },

  // api
  scrollTo: function(y, animate) {
    if (animate === undefined) {
      animate = true;
    }

    this.scroller.scrollTo(0, y, animate, 1);
  },

  // events
  mouseWheel: function(e){
    var inverted, delta, candidatePosition;

    inverted = e.webkitDirectionInvertedFromDevice;
    delta = e.wheelDeltaY * (inverted ? 0.8 : -0.8);
    candidatePosition = this.scroller.__scrollTop + delta;

    if ((candidatePosition >= 0) && (candidatePosition <= this.scroller.__maxScrollTop)) {
      this.scroller.scrollBy(0, delta, true);
      e.stopPropagation();
    }

    return false;
  }
});
