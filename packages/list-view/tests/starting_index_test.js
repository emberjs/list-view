var view, helper;
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

  equal(view._startingIndex(), 0);
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

  equal(view._startingIndex(), 0);
});


test("larger list", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  // 2x2 grid
  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(50),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 1000
  });

  equal(view._startingIndex(), 30);
});

test("larger list", function(){
  var height = 200, rowHeight = 100, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: helper.generateContent(40),
    width: width,
    elementWidth: width,
    scrollTop: 100
  });

  equal(view._startingIndex(), 1);
});

