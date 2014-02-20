var setDimensionsCalled = 0,
    css, view, helper, scrollingDidCompleteCount,
    didInitializeScrollerCount, scrollerDimensionsDidChange;

require('list-view/~tests/test_helper');
helper = window.helper;

function Scroller(callback, opts){
  this.callback = callback;
  this.opts = opts;
  this.scrollTo = function(left, top, zoom) {
    view._scrollContentTo(Math.max(0, top));
  };
  this.setDimensions = function() { setDimensionsCalled = setDimensionsCalled + 1; };
  this.doTouchStart = function() {};
  this.doTouchMove = function() {};
  this.doTouchEnd = function() {};
}

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.VirtualListView Acceptance", {
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

test("should exist", function() {
  view = Ember.VirtualListView.create({
    height: 500,
    rowHeight: 50
  });
  appendView();
  ok(view);
});

test("should render a subset of the full content, based on the height, in the correct positions", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.VirtualListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();

  equal(view.get('element').style.height, "500px", "The list view height is correct");
  // equal(view.$(':last')[0].style.height, "5000px", "The scrollable view has the correct height");

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  equal(Ember.$(positionSorted[0]).text(), "Item 1");
  equal(Ember.$(positionSorted[10]).text(), "Item 11");

  deepEqual(helper.itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
});

test("should update dimensions of scroller when totalHeight changes", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.VirtualListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  appendView();
  setDimensionsCalled = 0;

  Ember.run(function(){
    content.pushObject({name: "New Item"});
  });

  equal(setDimensionsCalled, 1, "setDimensions was called on the scroller");
});

test("lifecycle events", function(){
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      }),
    scrollingDidCompleteCount = 0,
    didInitializeScrollerCount = 0,
    scrollerDimensionsDidChangeCount = 0;

  view = Ember.VirtualListView.extend({
    init: function(){
      // Some hooks for testing
      this.on('didInitializeScroller', function(){ didInitializeScrollerCount++; });
      this.on('scrollingDidComplete',  function(){ scrollingDidCompleteCount++;  });
      this.on('scrollerDimensionsDidChange',  function(){ scrollerDimensionsDidChangeCount++;  });
      this._super();
    }
  }).create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 475
  });

  equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  equal(scrollerDimensionsDidChangeCount, 1, 'scrollerDimensionsDidChangeCount event was fired on create');
  equal(scrollingDidCompleteCount, 0, 'scrollingDidCompleteCount event was NOT fired on create');

  appendView();

  Ember.run(function(){
    view.set('height', height + 1);
  });

  equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  equal(scrollerDimensionsDidChangeCount, 2, 'scrollerDimensionsDidChangeCount event was fired on create');
  equal(scrollingDidCompleteCount, 0, 'scrollingDidCompleteCount event was NOT fired on create');

  Ember.run(function(){
    view.scrollTo(0, true);
    view.scroller.opts.scrollingComplete();
  });

  equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  equal(scrollerDimensionsDidChangeCount, 2, 'scrollerDimensionsDidChangeCount event was fired on create');
  equal(scrollingDidCompleteCount, 1, 'scrollingDidCompleteCount event was NOT fired on create');
});

test("should render correctly with an initial scrollTop", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.VirtualListView.create({
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

test("should be programatically scrollable", function() {
  var content = helper.generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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

  view = Ember.VirtualListView.create({
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
  view = Ember.VirtualListView.create({
    content: Ember.A(),
    height: 100,
    rowHeight: 50
  });

  appendView();

  equal(view.$('.ember-list-container').length, 1, "expected a ember-list-container wrapper div");
  equal(view.$('.ember-list-container > .ember-list-item-view').length, 0, "expected no ember-list-items inside the wrapper div");
});

test("When scrolled to the very bottom, the 'padding' list items should be empty", function() {
  view = Ember.VirtualListView.create({
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

test("When destroyed, short-circuits syncChildViews", function() {
  expect(1);

  view = Ember.VirtualListView.create({
    content: helper.generateContent(4),
    height: 150,
    rowHeight: 50
  });

  appendView();

  Ember.run(function(){
    view.destroy();
  });

  Ember.run(function(){
    view._syncChildViews();
  });

  ok(true, 'made it!');
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

  view = Ember.VirtualListView.create({
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

test("Creating a VirtualListView without height and rowHeight properties should throw an exception", function() {
  throws(function() {
    view = Ember.VirtualListView.create({
      content: helper.generateContent(4)
    });

    appendView();
  },
  /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});
