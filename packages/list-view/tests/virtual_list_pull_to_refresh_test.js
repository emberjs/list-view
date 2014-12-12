var css, view, helper, nextTopPosition;
helper = window.helper;
nextTopPosition = 0;



function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

function fireEvent(type, target) {
  var hasTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
    events = hasTouch ? {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    } : {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseend'
    },
    e = document.createEvent('Event');
  if (hasTouch) {
    e.touches = [{target: target}];
  } else {
    e.which = 1;
  }
  e.initEvent(events[type], true, true);
  target.dispatchEvent(e);
}

module("Ember.VirtualListView pull to refresh acceptance", {
  setup: function() {
    window.Scroller = function(callback, opts){
      this.callback = callback;
      this.opts = opts;
      this.scrollTo = function(left, top, zoom) {
        view._scrollerTop = top;
        view._scrollContentTo(Math.max(0, top));
      };
      this.setDimensions = function() { };
      this.doTouchStart = function() {};
      this.doTouchMove = function() {
        this.scrollTo(0, nextTopPosition, 1);
      };
      this.activatePullToRefresh = function(pullToRefreshHeight, activateCallback, deactivateCallback, startCallback){
        this.pullToRefreshHeight = pullToRefreshHeight;
        this.activateCallback = activateCallback;
        this.deactivateCallback = deactivateCallback;
        this.startCallback = startCallback;
      };
      this.finishPullToRefresh = function(){
        this.finishPullToRefreshCalled = true;
      };
      this.doTouchEnd = function() {};
    };

    css = Ember.$("<style>" +
            ".ember-list-view {" +
            "  overflow: auto;" +
            "  position: relative;" +
            "}" +
            ".ember-list-item-view {" +
            "  position: absolute;" +
            "}" +
            ".is-selected {" +
            "  background: red;" +
            "}" +
            "</style>").appendTo('head');
  },
  teardown: function() {
    css.remove();

    Ember.run(function() {
      if (view) { view.destroy(); }
    });
  }
});

test("When pulling below zero, show the pull to refresh view", function() {
  expect(12);
  view = Ember.VirtualListView.create({
    content: helper.generateContent(6),
    height: 150,
    rowHeight: 50,
    pullToRefreshViewClass: Ember.View.extend({
      classNames: ['pull-to-refresh'],
      template: Ember.Handlebars.compile("Pull to refresh...")
    }),
    pullToRefreshViewHeight: 75,
    activatePullToRefresh: function() {
      this.pullToRefreshActivated = true;
    },
    deactivatePullToRefresh: function() {
      this.pullToRefreshDeactivated = true;
    },
    startRefresh: function(finishRefresh) {
      this.pullToRefreshStarted = true;
      var view = this;
      stop();
      setTimeout(function(){
        start();
        ok(view.pullToRefreshView.get('refreshing'), 'sets refreshing property on refresh view');
        finishRefresh();
        ok(view.scroller.finishPullToRefreshCalled, 'calls back to scroller');
        ok(!view.pullToRefreshView.get('refreshing'), 'unsets refreshing property on refresh view');
      }, 0);
    }
  });

  appendView();

  var pullToRefreshElement = view.$('.pull-to-refresh')[0];
  ok(pullToRefreshElement, 'pullToRefreshElement was rendered');

  Ember.run(function() {
    view.scrollTo(150);
  });

  pullToRefreshElement = view.$('.pull-to-refresh')[0];
  ok(pullToRefreshElement, 'pullToRefreshElement was rendered');

  equal(view.scroller.pullToRefreshHeight, 75, 'informs scroller of pullToRefreshHeight');
  equal(helper.extractPosition(view._childViews[0].get('element')).y, -75, 'positions pullToRefreshElement');

  view.scroller.activateCallback();
  ok(view.pullToRefreshActivated, 'triggers hook function on activateCallback');
  ok(view.pullToRefreshView.get('active'), 'sets active property on refresh view');

  view.scroller.deactivateCallback();
  ok(view.pullToRefreshDeactivated, 'triggers hook function on deactivateCallback');
  ok(!view.pullToRefreshView.get('active'), 'unsets active property on refresh view');

  view.scroller.startCallback();
  ok(view.pullToRefreshStarted, 'triggers hook function on startCallback');
});
