var view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView unit: - startingIndex", {
  teardown: function() {
    Ember.run(function() {
      if (view) { view.destroy(); }
    });
  }
});

test("base case", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 0
  });

  equal(view._startingIndex(), 0);
});

test("scroll but within content length", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 100
  });

  equal(view._startingIndex(), 4);
});

test("scroll but beyond content length", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 1000
  });

  equal(view._startingIndex(), 4);
});

