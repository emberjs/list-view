import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {
  compile,
  generateContent,
  sortElementsByPosition,
  itemPositions
  } from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

var hasTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch;

var nextTopPosition = 0;

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

var view;
moduleForView('virtual-list', 'scrollerstart acceptance', {
  setup: function() {
    window.Scroller = function (callback, opts) {
      this.callback = callback;
      this.opts = opts;
      this.scrollTo = function (left, top, zoom) {
        view._scrollerTop = top;
        view._scrollContentTo(Math.max(0, top));
      };
      this.setDimensions = function () {
      };
      this.doTouchStart = function () {
      };
      this.doTouchMove = function () {
        this.scrollTo(0, nextTopPosition, 1);
      };
      this.doTouchEnd = function () {
      };
    };
  }
});

test("When scrolling begins, fire a scrollerstart event on the original target", function(assert) {
  assert.expect(1);

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(4),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();

  var childElement = this.$('.ember-list-item-view')[0];
  Ember.$(document).on("scrollerstart", function(e){
    assert.ok(e.target === childElement, "fired scrollerstart on original target");
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;
    fireEvent('start', childElement);
    fireEvent('move', childElement);
  });

  Ember.$(document).off("scrollerstart");
});

test("fire scrollerstart event only once per scroll session", function(assert) {

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(4),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();

  var childElement = this.$('.ember-list-item-view')[0],
    scrollerstartCount = 0;

  Ember.$(document).on("scrollerstart", function(e){
    scrollerstartCount = scrollerstartCount + 1;
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;

    fireEvent('start', childElement);
    fireEvent('move', childElement);
    fireEvent('move', childElement);
  });

  assert.equal(scrollerstartCount, 1, "scrollerstart should fire only once per scroll session");

  Ember.run(function(){
    fireEvent('end', childElement);
    nextTopPosition = nextTopPosition + 1;
    fireEvent('start', childElement);
    fireEvent('move', childElement);
  });

  assert.equal(scrollerstartCount, 2, "scrollerstart should fire again for a new scroll session");

  Ember.$(document).off("scrollerstart");
});

test("doesn't fire scrollerstart event when view did not actually scroll vertically", function(assert) {

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(4),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();

  var childElement = this.$('.ember-list-item-view')[0],
    scrollerstartCount = 0;

  Ember.$(document).on("scrollerstart", function(e){
    scrollerstartCount = scrollerstartCount + 1;
  });

  Ember.run(function(){
    nextTopPosition = 0;
    fireEvent('start', childElement);
    fireEvent('move', childElement);
  });

  assert.equal(scrollerstartCount, 0, "scrollerstart should not fire if view did not scroll");

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;
    fireEvent('move', childElement);
  });

  assert.equal(scrollerstartCount, 1, "scrollerstart should fire if view scrolled");

  Ember.$(document).off("scrollerstart");
});

test("When pulling below zero, still fire a scrollerstart event", function(assert) {
  assert.expect(1);

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(4),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();

  var childElement = this.$('.ember-list-item-view')[0];
  Ember.$(document).on("scrollerstart", function(e){
    assert.ok(true, "fired scrollerstart");
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition - 10;
    fireEvent('start', childElement);
    fireEvent('move', childElement);
  });

  Ember.$(document).off("scrollerstart");
});

test("triggers a click event when no scroll happened", function(assert){
  assert.expect(1);

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(10),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();
  var $childElement = this.$('.ember-list-item-view');
  var childElement = $childElement[0];

  $childElement.one('click', function(e){
    assert.ok(hasTouch, "click event synthesized for touch device only");
  });

  function fireEvent(type, target) {
    var events = hasTouch ? {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    } : {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseend'
    };
    var e = document.createEvent('Event');
    if (hasTouch) {
      e.touches = [{target: target}];
      e.changedTouches = [{target: target}];
    } else {
      e.which = 1;
    }
    e.initEvent(events[type], true, true);
    target.dispatchEvent(e);
  }

  Ember.run(function(){
    fireEvent('start', childElement);
    fireEvent('end', childElement);
  });

  if (!hasTouch) {
    assert.ok(true, "click event not synthesized for non-touch device");
  }
});


