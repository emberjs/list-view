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

test("single column", function(){
  var height = 500, rowHeight = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(20)
  });

  equal(view.get('totalHeight'), 1000);
});

test("even", function(){
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

test("odd", function(){
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

test("with bottomPadding", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(20),
    width: width,
    elementWidth: elementWidth,
    bottomPadding: 25
  });

  equal(view.get('totalHeight'), 525);
});
