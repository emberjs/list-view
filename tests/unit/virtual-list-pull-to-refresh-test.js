import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, nextTopPosition, extractPosition} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

var view;

moduleForView('virtual-list', 'pull to refresh acceptance', {
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
  }
});

test("When pulling below zero, show the pull to refresh view", function(assert) {
  assert.expect(12);
  var promise = new Ember.RSVP.Promise((resolve)=>{
    Ember.run(this, function(){
      view = this.subject({
        content: generateContent(6),
        height: 150,
        rowHeight: 50,
        pullToRefreshViewClass: Ember.View.extend({
          classNames: ['pull-to-refresh'],
          template: compile("Pull to refresh...")
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
          Ember.run.later(this, function(){
            assert.ok(this.pullToRefreshView.get('refreshing'), 'sets refreshing property on refresh view');
            finishRefresh();
            assert.ok(this.scroller.finishPullToRefreshCalled, 'calls back to scroller');
            assert.ok(!this.pullToRefreshView.get('refreshing'), 'unsets refreshing property on refresh view');
            resolve();
          }, 0);
        }
      });
    });
  });

  this.render();

  var pullToRefreshElement = this.$('.pull-to-refresh')[0];
  assert.ok(pullToRefreshElement, 'pullToRefreshElement was rendered');

  view.scrollTo(150);

  pullToRefreshElement = view.$('.pull-to-refresh')[0];
  assert.ok(pullToRefreshElement, 'pullToRefreshElement was rendered');

  assert.equal(view.scroller.pullToRefreshHeight, 75, 'informs scroller of pullToRefreshHeight');
  assert.equal(extractPosition(view._childViews[0].get('element')).y, -75, 'positions pullToRefreshElement');

  view.scroller.activateCallback();
  assert.ok(view.pullToRefreshActivated, 'triggers hoassert.ok function on activateCallback');
  assert.ok(view.pullToRefreshView.get('active'), 'sets active property on refresh view');

  view.scroller.deactivateCallback();
  assert.ok(view.pullToRefreshDeactivated, 'triggers hoassert.ok function on deactivateCallback');
  assert.ok(!view.pullToRefreshView.get('active'), 'unsets active property on refresh view');

  view.scroller.startCallback();
  assert.ok(view.pullToRefreshStarted, 'triggers hoassert.ok function on startCallback');

  return promise;
});
