var css, view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView Acceptance", {
  setup: function() {
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

    Ember.ENABLE_PROFILING = false;
  }
});

test("should exist", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50
  });
  appendView();
  ok(view);
});

test("should render an empty view when there is no content", function() {
  var content = helper.generateContent(0),
      height = 500,
      rowHeight = 50,
      emptyViewHeight = 175,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      }),
      emptyView = Ember.View.extend({
        attributeBindings: ['style'],
        classNames: ['empty-view'],
        style: 'height:' + emptyViewHeight + 'px;'
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    emptyView: emptyView
  });

  appendView();

  equal(view.get('element').style.height, "500px", "The list view height is correct");
  equal(view.$('.ember-list-container').height(), emptyViewHeight, "The scrollable view has the correct height");

  equal(view.$('.ember-list-item-view').length, 0, "The correct number of rows were rendered");
  equal(view.$('.empty-view').length, 1, "The empty view rendered");

  Ember.run(function () {
    view.set('content', helper.generateContent(10));
  });

  equal(view.get('element').style.height, "500px", "The list view height is correct");
  equal(view.$('.ember-list-container').height(), 500, "The scrollable view has the correct height");

  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  equal(view.$('.empty-view').length, 0, "The empty view is removed");

  Ember.run(function () {
    view.set('content', content);
  });

  equal(view.get('element').style.height, "500px", "The list view height is correct");
  equal(view.$('.ember-list-container').height(), emptyViewHeight, "The scrollable view has the correct height");

  equal(view.$('.ember-list-item-view').length, 0, "The correct number of rows were rendered");
  equal(view.$('.empty-view').length, 1, "The empty view rendered");
});

test("should render a subset of the full content, based on the height, in the correct positions", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();

  equal(view.get('element').style.height, "500px", "The list view height is correct");
  equal(view.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  equal(Ember.$(positionSorted[0]).text(), "Item 1");
  equal(Ember.$(positionSorted[10]).text(), "Item 11");

  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
});

test("should render correctly with an initial scrollTop", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 475
  });

  appendView();

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(Ember.$(positionSorted[0]).text(), "Item 10");
  equal(Ember.$(positionSorted[10]).text(), "Item 20");

  deepEqual(helper.itemPositions(view).map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

test("should perform correct number of renders and repositions on short list init", function () {
  var content = helper.generateContent(8),
      height = 60,
      width = 50,
      rowHeight = 10,
      positions = 0,
      renders = 0,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  Ember.subscribe("view.updateContext.render", {
    before: function(){},
    after: function(name, timestamp, payload) {
      renders++;
    }
  });

  Ember.subscribe("view.updateContext.positionElement", {
    before: function(){},
    after: function(name, timestamp, payload) {
      positions++;
    }
  });

  view = Ember.ListView.create({
    content: content,
    height: height,
    width: width,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  equal(renders, 7, "The correct number of renders occured");
  equal(positions, 14, "The correct number of positions occured");
});

test("should perform correct number of renders and repositions while short list scrolling", function () {
  var content = helper.generateContent(8),
      height = 60,
      width = 50,
      scrollTop = 50,
      rowHeight = 10,
      positions = 0,
      renders = 0,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  if (window.console) {
    Ember.ENABLE_PROFILING = true;
  }

  Ember.subscribe("view.updateContext.render", {
    before: function(){},
    after: function(name, timestamp, payload) {
      renders++;
    }
  });

  Ember.subscribe("view.updateContext.positionElement", {
    before: function(){},
    after: function(name, timestamp, payload) {
      positions++;
    }
  });

  view = Ember.ListView.create({
    content: content,
    height: height,
    width: width,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  Ember.run(function () {
    view.scrollTo(scrollTop);
  });

  equal(renders, 14, "The correct number of renders occured");
  equal(positions, 21, "The correct number of positions occured");
});

test("should perform correct number of renders and repositions on long list init", function () {
  var content = helper.generateContent(200),
      height = 50,
      width = 50,
      rowHeight = 10,
      positions = 0,
      renders = 0,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  Ember.subscribe("view.updateContext.render", {
    before: function(){},
    after: function(name, timestamp, payload) {
      renders++;
    }
  });

  Ember.subscribe("view.updateContext.positionElement", {
    before: function(){},
    after: function(name, timestamp, payload) {
      positions++;
    }
  });

  view = Ember.ListView.create({
    content: content,
    height: height,
    width: width,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  equal(renders, ((height / 10) + 1),  "The correct number of renders occurred");
  equal(positions, 12, "The correct number of positions occurred");
});

test("should be programatically scrollable", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();

  Ember.run(function() {
    view.scrollTo(475);
  });

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view).map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

function yPosition(position){
  return position.y;
}

function xPosition(position){
  return position.x;
}

test("height change", function(){
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50, 100], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50, 100], "The rows are in the correct positions" );
});

test("adding a column, when everything is already within viewport", function(){
  // start off with 2x3 grid visible and 4 elements
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element, ?: no element
  //
  // x x  --|
  // x x    |- viewport
  // ? ?  --|
  var content = helper.generateContent(4),
      width = 100,
      height = 150,
      rowHeight = 50,
      elementWidth = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("A:{{name}}{{view view.NestedViewClass}}"),
        NestedViewClass: Ember.View.extend({
          tagName: 'span',
          template: Ember.Handlebars.compile("B:{{name}}")
        })
      });

  view = Ember.ListView.create({
    content: content,
    width: width,
    height: height,
    rowHeight: rowHeight,
    elementWidth: elementWidth,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  deepEqual(helper.itemPositions(view), [
            { x:  0, y:    0 }, { x: 50, y:    0 },
            { x:  0, y:   50 }, { x: 50, y:   50 }
            ], "initial render: The rows are rendered in the correct positions");

  equal(view.$('.ember-list-item-view').length, 4, "initial render: The correct number of rows were rendered");

  // rotate to a with 3x2 grid visible and 8 elements
  // rapid dimension changes
  Ember.run(function() {
    view.set('width',  140);
  });

  Ember.run(function() {
    view.set('width',  150);
  });

  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // x x x --|
  // x ? ?   |- viewport
  // ? ? ? --|

  equal(view.$('.ember-list-item-view').length, 4, "after width + height change: the correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
            { x:  0, y:  0 }, { x: 50, y: 0 }, { x: 100, y: 0 },
            { x:  0, y: 50 }
            ], "after width + height change: The rows are in the correct positions");

  var sortedElements = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });
  deepEqual(texts, [
             'A:Item 1B:Item 1',
             'A:Item 2B:Item 2',
             'A:Item 3B:Item 3',
             'A:Item 4B:Item 4'
            ], 'after width + height change: elements should be rendered in expected position');
});

test("height and width change after with scroll – simple", function(){
  // start off with 2x3 grid visible and 10 elements, at top of scroll
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // x x  --|
  // x x    |- viewport
  // x x  --|
  // + +
  // 0 0
  var content = helper.generateContent(10),
      width = 100,
      height = 150,
      rowHeight = 50,
      elementWidth = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("A:{{name}}{{view view.NestedViewClass}}"),
        NestedViewClass: Ember.View.extend({
          tagName: 'span',
          template: Ember.Handlebars.compile("B:{{name}}")
        })
      });

  view = Ember.ListView.create({
    content: content,
    width: width,
    height: height,
    rowHeight: rowHeight,
    elementWidth: elementWidth,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  deepEqual(helper.itemPositions(view), [
            { x:  0, y:    0 }, { x: 50, y:    0 },
            { x:  0, y:   50 }, { x: 50, y:   50 },
            { x:  0, y:  100 }, { x: 50, y:  100 },
            { x:  0, y:  150 }, { x: 50, y:  150 }
            ], "initial render: The rows are rendered in the correct positions");

  equal(view.$('.ember-list-item-view').length, 8, "initial render: The correct number of rows were rendered");

  // user is scrolled near the bottom of the list
  Ember.run(function(){
    view.scrollTo(101);
  });
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // 0 0
  // 0 0
  // x x --|
  // x x   |- viewport
  // x x --|
  // o o

  equal(view.$('.ember-list-item-view').length, 8, "after scroll: The correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
              { x: 0, y: 100 }, { x: 50, y: 100 },
              { x: 0, y: 150 }, { x: 50, y: 150 },
              { x: 0, y: 200 }, { x: 50, y: 200 },
/* padding */ { x: 0, y: 250 }, { x: 50, y: 250 }], "after scroll: The rows are in the correct positions");

  // rotate to a with 3x2 grid visible and 8 elements
  Ember.run(function() {
    view.set('width',  150);
    view.set('height', 100);
  });

  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // 0 0 0
  // x x x
  // x x x --|
  // x o o --|- viewport

  equal(view.$('.ember-list-item-view').length, 9, "after width + height change: the correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
              { x: 0, y:  50 }, { x: 50, y:  50 }, { x: 100, y:  50 },
              { x: 0, y: 100 }, { x: 50, y: 100 }, { x: 100, y: 100 },
              { x: 0, y: 150 }, { x: 50, y: 150 }, { x: 100, y: 150 }
            ], "after width + height change: The rows are in the correct positions");

  var sortedElements = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });
  deepEqual(texts, [
             'A:Item 4B:Item 4',
             'A:Item 5B:Item 5',
             'A:Item 6B:Item 6',
             'A:Item 7B:Item 7',
             'A:Item 8B:Item 8',
             'A:Item 9B:Item 9',
             'A:Item 10B:Item 10',
             '',
             ''
            ], 'after width + height change: elements should be rendered in expected position');
});

test("height and width change after with scroll – 1x2 -> 2x2 with 5 items, ", function(){
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // x  --|
  // x  --|- viewport
  // +
  // 0
  // 0
  var content = helper.generateContent(5),
      width = 50,
      height = 100,
      rowHeight = 50,
      elementWidth = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("A:{{name}}{{view view.NestedViewClass}}"),
        NestedViewClass: Ember.View.extend({
          tagName: 'span',
          template: Ember.Handlebars.compile("B:{{name}}")
        })
      });

  view = Ember.ListView.create({
    content: content,
    width: width,
    height: height,
    rowHeight: rowHeight,
    elementWidth: elementWidth,
    itemViewClass: itemViewClass,
    scrollTop: 0
  });

  appendView();

  deepEqual(helper.itemPositions(view), [
            { x:  0, y:    0 },
            { x:  0, y:   50 },
            { x:  0, y:  100 }
            ], "initial render: The rows are rendered in the correct positions");

  equal(view.$('.ember-list-item-view').length, 3, "initial render: The correct number of rows were rendered");

  // user is scrolled near the bottom of the list
  Ember.run(function(){
    view.scrollTo(151);
  });
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // 0
  // 0
  // 0
  // x --|
  // x --|- viewport
  // o
  equal(view.$('.ember-list-item-view').length, 3, "after scroll: The correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
              { x: 0, y: 150 },
              { x: 0, y: 200 },
/* padding */ { x: 0, y: 250 }], "after scroll: The rows are in the correct positions");

  // rotate to a with 2x2 grid visible and 8 elements
  Ember.run(function() {
    view.set('width',  100);
    view.set('height', 100);
  });

  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // 0 0
  // x x --|
  // x o --|- viewport
  // o
  equal(view.$('.ember-list-item-view').length, 5, "after width + height change: the correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
              { x: 0, y:  50 }, { x: 50, y:  50 },
              { x: 0, y: 100 }, { x: 50, y: 100 },
              { x: 0, y: 150 }
            ], "The rows are in the correct positions");

  var sortedElements = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });
  deepEqual(texts, [
             'A:Item 3B:Item 3', 'A:Item 4B:Item 4',
             'A:Item 5B:Item 5', '',
             ''
            ], 'elements should be rendered in expected position');
});

test("elementWidth change", function(){
  var i,
      positionSorted,
      content = helper.generateContent(100),
      height = 200,
      width = 200,
      rowHeight = 50,
      elementWidth = 100,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    width: width,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    elementWidth: elementWidth
  });

  appendView();

  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view), [
            { x:0,   y: 0   },
            { x:100, y: 0   },
            { x:0,   y: 50  },
            { x:100, y: 50  },
            { x:0 ,  y: 100 },
            { x:100, y: 100 },
            { x:0,   y: 150 },
            { x:100, y: 150 },
            { x:0,   y: 200 },
            { x:100, y: 200 }], "The rows are in the correct positions");

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  for(i = 0; i < 10; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 100);
  });

  equal(view.$('.ember-list-item-view').length, 5, "The correct number of rows were rendered");

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  deepEqual(helper.itemPositions(view), [
            { x: 0, y: 0},
            { x: 0, y: 50},
            { x: 0, y: 100},
            { x: 0, y: 150},
            { x: 0, y: 200}
  ], "The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }

  // Test a width smaller than elementWidth, should behave the same as width === elementWidth
  Ember.run(function () {
    view.set('width', 50);
  });

  equal(view.$('.ember-list-item-view').length, 5, "The correct number of rows were rendered");

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  deepEqual(helper.itemPositions(view), [
            { x: 0, y: 0},
            { x: 0, y: 50},
            { x: 0, y: 100},
            { x: 0, y: 150},
            { x: 0, y: 200}
  ], "The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 200);
  });

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view), [
            { x:0,   y: 0   },
            { x:100, y: 0   },
            { x:0,   y: 50  },
            { x:100, y: 50  },
            { x:0 ,  y: 100 },
            { x:100, y: 100 },
            { x:0,   y: 150 },
            { x:100, y: 150 },
            { x:0,   y: 200 },
            { x:100, y: 200 }], "The rows are in the correct positions");

  for(i = 0; i < 10; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }
});

test("elementWidth change with scroll", function(){
  var i,
      positionSorted,
      content = helper.generateContent(100),
      height = 200,
      width = 200,
      rowHeight = 50,
      elementWidth = 100,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    width: width,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    elementWidth: elementWidth
  });

  appendView();

  Ember.run(function(){
    view.scrollTo(1000);
  });

  equal(view.$('.ember-list-item-view').length, 10, "after scroll 1000 - The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view), [
            { x:0,   y: 1000 },
            { x:100, y: 1000 },
            { x:0,   y: 1050 },
            { x:100, y: 1050 },
            { x:0 ,  y: 1100 },
            { x:100, y: 1100 },
            { x:0,   y: 1150 },
            { x:100, y: 1150 },
            { x:0,   y: 1200 },
            { x:100, y: 1200 }], "after scroll 1000 - The rows are in the correct positions");

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  for (i = 0; i < 10; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }

  Ember.run(function() {
    view.set('width', 100);
  });

  equal(view.$('.ember-list-item-view').length, 5, " after width 100 -The correct number of rows were rendered");

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  deepEqual(helper.itemPositions(view), [
            { x:0,   y: 2000 },
            { x:0,   y: 2050 },
            { x:0 ,  y: 2100 },
            { x:0,   y: 2150 },
            { x:0,   y: 2200 }], "after width 100 - The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }

  Ember.run(function() {
    view.set('width', 200);
  });

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 10, "after width 200 - The correct number of rows were rendered");
  deepEqual(helper.itemPositions(view), [
            { x:0,   y: 1000 },
            { x:100, y: 1000 },
            { x:0,   y: 1050 },
            { x:100, y: 1050 },
            { x:0 ,  y: 1100 },
            { x:100, y: 1100 },
            { x:0,   y: 1150 },
            { x:100, y: 1150 },
            { x:0,   y: 1200 },
            { x:100, y: 1200 }], "after width 200 - The rows are in the correct positions");

  for(i = 0; i < 10; i++) {
    equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }
});

test("A property of an item can be changed", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();

  //Change name
  Ember.run(function() {
    content.set('0.name', 'First change');
  });

  equal(view.$('.ember-list-item-view:eq(0)').text(), "First change", "The item's name has been updated");

  //Scroll down, change name, and scroll back up
  Ember.run(function() {
    view.scrollTo(600);
  });

  Ember.run(function() {
    content.set('0.name', 'Second change');
  });

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.$('.ember-list-item-view:eq(0)').text(), "Second change", "The item's name has been updated");

});

test("The list view is wrapped in an extra div to support JS-emulated scrolling", function() {
  view = Ember.ListView.create({
    content: Ember.A(),
    height: 100,
    rowHeight: 50
  });

  appendView();
  equal(view.$('.ember-list-container').length, 1, "expected a ember-list-container wrapper div");
  equal(view.$('.ember-list-container > .ember-list-item-view').length, 0, "expected ember-list-items inside the wrapper div");
});

test("When scrolled to the very bottom, the 'padding' list items should be empty", function() {
  view = Ember.ListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50,
    itemViewClass: Ember.ListItemView.extend({
      template: Ember.Handlebars.compile("Name: {{name}}")
    })
  });

  appendView();

  Ember.run(function(){
    view.scrollTo(51);
  });

  var sortedElements = helper.sortElementsByPosition(view.$('.ember-list-item-view')),
      lastEl = sortedElements[sortedElements.length - 1];
  equal(lastEl.innerHTML, '', "expected the last ('padding') item view to have no content");
});

test("When scrolled past the totalHeight, views should not be recycled in. This is to support overscroll", function() {
  view = Ember.ListView.create({
    content: helper.generateContent(2),
    height:100,
    rowHeight: 50,
    itemViewClass: Ember.ListItemView.extend({
      template: Ember.Handlebars.compile("Name: {{name}}")
    })
  });

  appendView();

  Ember.run(function(){
    view.scrollTo(150);
  });

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 2, "after width 200 - The correct number of rows were rendered");

  deepEqual(helper.itemPositions(view), [
            { x:0, y:  0 },
            { x:0, y: 50 }] , "went beyond scroll max via overscroll");

  equal(Ember.$(positionSorted[0]).text(), "Name: Item " + 1);
  equal(Ember.$(positionSorted[1]).text(), "Name: Item " + 2);
});


test("When list-view is unable to scroll, scrollTop should be zero", function() {
  view = Ember.ListView.create({
    content: helper.generateContent(2),
    height:400,
    rowHeight: 100,
    itemViewClass: Ember.ListItemView.extend({
      template: Ember.Handlebars.compile("Name: {{name}}")
    })
  });

  appendView();

  Ember.run(function(){
    view.scrollTo(1);
  });

  equal(view.get('scrollTop'), 0, "Scrolltop should be zero");

});


test("Creating a ListView without height and rowHeight properties should throw an exception", function() {
  throws(function() {
    view = Ember.ListView.create({
      content: helper.generateContent(4)
    });

    appendView();
  },
  /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});

test("Creating a ListView without height and rowHeight properties should throw an exception", function() {
  throws(function() {
    view = Ember.ListView.create({
      content: helper.generateContent(4)
    });

    appendView();
  },
  /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});

test("should trigger scrollYChanged correctly", function () {
  var scrollYChanged = 0, reuseChildren = 0;

  view = Ember.ListView.extend({
    init: function () {
      this.on('scrollYChanged', function () {
        scrollYChanged++;
      });
      this._super();
    },
    _reuseChildren: function () {
      reuseChildren++;
      this._super();
    }
  }).create({
    content: helper.generateContent(10),
    height: 100,
    rowHeight: 50
  });

  appendView();

  equal(scrollYChanged, 0, 'scrollYChanged should not fire on init');

  Ember.run(function () {
    view.scrollTo(1);
  });

  equal(scrollYChanged, 1, 'scrollYChanged should fire after scroll');

  Ember.run(function () {
    view.scrollTo(1);
  });

  equal(scrollYChanged, 1, 'scrollYChanged should not fire for same value');
});

test("should trigger reuseChildren correctly", function () {
  var scrollYChanged = 0, reuseChildren = 0;

  view = Ember.ListView.extend({
    _reuseChildren: function () {
      reuseChildren++;
      this._super();
    }
  }).create({
    content: helper.generateContent(10),
    height: 100,
    rowHeight: 50
  });

  appendView();

  equal(reuseChildren, 1, 'initialize the content');

  Ember.run(function () {
    view.scrollTo(1);
  });

  equal(reuseChildren, 1, 'should not update the content');

  Ember.run(function () {
    view.scrollTo(51);
  });

  equal(reuseChildren, 2, 'should update the content');
});
