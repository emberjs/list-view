var view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView unit - totalHeight", {
  teardown: function() {
    Ember.run(function() {
      if (view) { view.destroy(); }
    });
  }
});

test("should exist", function() {
  view = Ember.ListView.create();
  appendView();
  ok(view);
});

test("totalHeight: single column", function(){
  var height = 500, rowHeight = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(20)
  });

  equal(view.get('totalHeight'), 1000);
});

test("totalHeight: even", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(20),
    width: width,
    elementWidth: elementWidth
  });

  equal(view.get('totalHeight'), 500);
});

test("totalHeight: odd", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(21),
    width: width,
    elementWidth: elementWidth
  });

  equal(view.get('totalHeight'), 550);
});

