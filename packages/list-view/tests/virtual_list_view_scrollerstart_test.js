var css, view, helper, nextTopPosition;

require('list-view/~tests/test_helper');
helper = window.helper;
nextTopPosition = 0;

function Scroller(callback, opts){
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
  this.doTouchEnd = function() {};
}


function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.VirtualListView scrollerstart acceptance", {
  setup: function() {
    window.Scroller = Scroller;
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

test("When scrolling begins, fire a scrollerstart event on the original target", function() {
  expect(1);
  view = Ember.VirtualListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50
  });

  appendView();

  var childElement = view.$('.ember-list-item-view')[0];
  Ember.$(document).on("scrollerstart", function(e){
    ok(e.target === childElement, "fired scrollerstart on original target");
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;
    view.touchStart(Ember.$.Event('touchstart'));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  Ember.$(document).off("scrollerstart");
});

test("fire scrollerstart event only once per scroll session", function() {
  view = Ember.VirtualListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50
  });

  appendView();

  var childElement = view.$('.ember-list-item-view')[0],
      scrollerstartCount = 0;

  Ember.$(document).on("scrollerstart", function(e){
    scrollerstartCount = scrollerstartCount + 1;
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;
    view.touchStart(Ember.$.Event('touchstart'));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  equal(scrollerstartCount, 1, "scrollerstart should fire only once per scroll session");

  Ember.run(function(){
    view.touchEnd(Ember.$.Event('touchend'));
    nextTopPosition = nextTopPosition + 1;
    view.touchStart(Ember.$.Event('touchstart'));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  equal(scrollerstartCount, 2, "scrollerstart should fire again for a new scroll session");

  Ember.$(document).off("scrollerstart");
});

test("doesn't fire scrollerstart event when view did not actually scroll vertically", function() {
  view = Ember.VirtualListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50
  });

  appendView();

  var childElement = view.$('.ember-list-item-view')[0],
      scrollerstartCount = 0;

  Ember.$(document).on("scrollerstart", function(e){
    scrollerstartCount = scrollerstartCount + 1;
  });

  Ember.run(function(){
    nextTopPosition = 0;
    view.touchStart(Ember.$.Event('touchstart'));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  equal(scrollerstartCount, 0, "scrollerstart should not fire if view did not scroll");

  Ember.run(function(){
    nextTopPosition = nextTopPosition + 1;
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  equal(scrollerstartCount, 1, "scrollerstart should fire if view scrolled");

  Ember.$(document).off("scrollerstart");
});

test("When pulling below zero, still fire a scrollerstart event", function() {
  expect(1);
  view = Ember.VirtualListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50
  });

  appendView();

  var childElement = view.$('.ember-list-item-view')[0];
  Ember.$(document).on("scrollerstart", function(e){
    ok(true, "fired scrollerstart");
  });

  Ember.run(function(){
    nextTopPosition = nextTopPosition - 10;
    view.touchStart(Ember.$.Event('touchstart'));
    view.touchMove(Ember.$.Event('touchmove', {
      touches: [{target: childElement }]
    }));
  });

  Ember.$(document).off("scrollerstart");
});

