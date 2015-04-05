import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

var setDimensionsCalled = 0, view, scrollingDidCompleteCount, didInitializeScrollerCount, scrollerDimensionsDidChangeCount;

moduleForView('virtual-list', 'Acceptance', {
  setup: function() {
    window.Scroller = function(callback, opts){
      this.callback = callback;
      this.opts = opts;
      this.scrollTo = function(left, top, zoom) {
        view._scrollContentTo(Math.max(0, top));
      };
      this.setDimensions = function() { setDimensionsCalled = setDimensionsCalled + 1; };
      this.doTouchStart = function() {};
      this.doTouchMove = function() {};
      this.doTouchEnd = function() {};
    };
  }
});

test("should exist", function(assert) {
  view = this.subject({
    height: 500,
    rowHeight: 50
  });
  this.render();
  assert.ok(view);
});

test("should render a subset of the full content, based on the height, in the correct positions", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  assert.equal(view.get('element').style.height, "500px", "The list view height is correct");
  // assert.equal(this.$(':last')[0].style.height, "5000px", "The scrollable view has the correct height");

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.equal(this.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  assert.equal(Ember.$(positionSorted[0]).text(), "Item 1");
  assert.equal(Ember.$(positionSorted[10]).text(), "Item 11");

  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
});

test("should update dimensions of scroller when totalHeight changes", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();
  setDimensionsCalled = 0;

  Ember.run(function(){
    content.pushObject({name: "New Item"});
  });

  assert.equal(setDimensionsCalled, 1, "setDimensions was called on the scroller");
});

moduleForView('virtual-list', 'Acceptance', {
  setup: function() {
    scrollerDimensionsDidChangeCount = 0;
    scrollingDidCompleteCount = 0;
    didInitializeScrollerCount = 0;
    window.Scroller = function(callback, opts){
      this.callback = callback;
      this.opts = opts;
      this.scrollTo = function(left, top, zoom) {
        view._scrollContentTo(Math.max(0, top));
      };
      this.setDimensions = function() { setDimensionsCalled = setDimensionsCalled + 1; };
      this.doTouchStart = function() {};
      this.doTouchMove = function() {};
      this.doTouchEnd = function() {};
    };
  },
  subject: function(options, factory) {
    return factory.extend({
      init: function(){
        // Some hoassert.oks for testing
        this.on('didInitializeScroller', function(){ didInitializeScrollerCount++; });
        this.on('scrollingDidComplete',  function(){ scrollingDidCompleteCount++;  });
        this.on('scrollerDimensionsDidChange',  function(){ scrollerDimensionsDidChangeCount++;  });
        this._super();
      }
    }).create(options);
  }
});



test("lifecycle events", function(assert){
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 475
    });
  });

  assert.equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  assert.equal(scrollerDimensionsDidChangeCount, 1, 'scrollerDimensionsDidChangeCount event was fired on create');
  assert.equal(scrollingDidCompleteCount, 0, 'scrollingDidCompleteCount event was NOT fired on create');

  this.render();

  Ember.run(function(){
    view.set('height', height + 1);
  });

  assert.equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  assert.equal(scrollerDimensionsDidChangeCount, 2, 'scrollerDimensionsDidChangeCount event was fired on create');
  assert.equal(scrollingDidCompleteCount, 0, 'scrollingDidCompleteCount event was NOT fired on create');

  Ember.run(function(){
    view.scrollTo(0, true);
    view.scroller.opts.scrollingComplete();
  });

  assert.equal(didInitializeScrollerCount, 1, 'didInitializeScroller event was fired on create');
  assert.equal(scrollerDimensionsDidChangeCount, 2, 'scrollerDimensionsDidChangeCount event was fired on create');
  assert.equal(scrollingDidCompleteCount, 1, 'scrollingDidCompleteCount event was NOT fired on create');
});

test("should render correctly with an initial scrollTop", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 475
    });
  });

  this.render();

  assert.equal(this.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.equal(Ember.$(positionSorted[0]).text(), "Item 10");
  assert.equal(Ember.$(positionSorted[10]).text(), "Item 20");

  assert.deepEqual(itemPositions(view).map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

test("should be programatically scrollable", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  view = this.subject({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });

  this.render();

  Ember.run(function() {
    view.scrollTo(475);
  });

  assert.equal(this.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view).map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

test("height change", function(assert){
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  assert.equal(this.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  assert.equal(this.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50, 100], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 50);
  });

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  assert.equal(this.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50, 100], "The rows are in the correct positions" );
});

test("height and width change after with scroll – simple", function(assert){
  // start off with 2x3 grid visible and 10 elements, at top of scroll
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // x x  --|
  // x x    |- viewport
  // x x  --|
  // + +
  // 0 0
  var content = generateContent(10),
    width = 100,
    height = 150,
    rowHeight = 50,
    elementWidth = 50,
    itemViewClass = ListItemView.extend({
      template: compile("A:{{name}}{{view view.NestedViewClass}}"),
      NestedViewClass: Ember.View.extend({
        tagName: 'span',
        template: compile("B:{{name}}")
      })
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      width: width,
      height: height,
      rowHeight: rowHeight,
      elementWidth: elementWidth,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  assert.deepEqual(itemPositions(view), [
    { x:  0, y:    0 }, { x: 50, y:    0 },
    { x:  0, y:   50 }, { x: 50, y:   50 },
    { x:  0, y:  100 }, { x: 50, y:  100 },
    { x:  0, y:  150 }, { x: 50, y:  150 }
  ], "initial render: The rows are rendered in the correct positions");

  assert.equal(this.$('.ember-list-item-view').length, 8, "initial render: The correct number of rows were rendered");

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

  assert.equal(this.$('.ember-list-item-view').length, 8, "after scroll: The correct number of rows were rendered");

  assert.deepEqual(itemPositions(view), [
    { x: 0, y:  50 }, { x: 50, y:  50 },
    { x: 0, y: 100 }, { x: 50, y: 100 },
    { x: 0, y: 150 }, { x: 50, y: 150 },
    /* padding */ { x: 0, y: 200 }, { x: 50, y: 200 }], "after scroll: The rows are in the correct positions");

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

  assert.equal(this.$('.ember-list-item-view').length, 9, "after width + height change: the correct number of rows were rendered");
  assert.deepEqual(itemPositions(view), [
    /*              */  { x:  50, y:   0 }, { x: 100, y:   0 },
    { x:   0, y:  50 }, { x:  50, y:  50 }, { x: 100, y:  50 },
    { x:   0, y: 100 }, { x:  50, y: 100 }, { x: 100, y: 100 },
    { x:   0, y: 150 }], "after width + height change: The rows are in the correct positions");

  var sortedElements = sortElementsByPosition(this.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });
  assert.deepEqual(texts, [
    'A:Item 2B:Item 2',
    'A:Item 3B:Item 3',
    'A:Item 4B:Item 4',
    'A:Item 5B:Item 5',
    'A:Item 6B:Item 6',
    'A:Item 7B:Item 7',
    'A:Item 8B:Item 8',
    'A:Item 9B:Item 9',
    'A:Item 10B:Item 10',
  ], 'after width + height change: elements should be rendered in expected position');
});

test("height and width change after with scroll – 1x2 -> 2x2 with 5 items", function(assert) {
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element
  //
  // x  --|
  // x  --|- viewport
  // +
  // 0
  // 0
  var content = generateContent(5),
    width = 50,
    height = 100,
    rowHeight = 50,
    elementWidth = 50,
    itemViewClass = ListItemView.extend({
      template: compile("A:{{name}}{{view view.NestedViewClass}}"),
      NestedViewClass: Ember.View.extend({
        tagName: 'span',
        template: compile("B:{{name}}")
      })
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      width: width,
      height: height,
      rowHeight: rowHeight,
      elementWidth: elementWidth,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  assert.deepEqual(itemPositions(view), [
    { x:  0, y:    0 },
    { x:  0, y:   50 },
    { x:  0, y:  100 }
  ], "initial render: The rows are rendered in the correct positions");

  assert.equal(this.$('.ember-list-item-view').length, 3, "initial render: The correct number of rows were rendered");

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
  assert.equal(this.$('.ember-list-item-view').length, 3, "after scroll: The correct number of rows were rendered");

  assert.deepEqual(itemPositions(view), [
    { x: 0, y: 100 },
    { x: 0, y: 150 },
    /* padding */ { x: 0, y: 200 }], "after scroll: The rows are in the correct positions");

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
  assert.equal(this.$('.ember-list-item-view').length, 5, "after width + height change: the correct number of rows were rendered");

  assert.deepEqual(itemPositions(view), [
    { x: 0, y:   0 }, { x: 50, y:   0 },
    { x: 0, y:  50 }, { x: 50, y:  50 },
    { x: 0, y: 100 }
  ], "The rows are in the correct positions");

  var sortedElements = sortElementsByPosition(this.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });
  assert.deepEqual(texts, [
    'A:Item 1B:Item 1', 'A:Item 2B:Item 2',
    'A:Item 3B:Item 3', 'A:Item 4B:Item 4',
    'A:Item 5B:Item 5'
  ], 'elements should be rendered in expected position');
});

test("elementWidth change", function(assert){
  var i,
    positionSorted,
    content = generateContent(100),
    height = 200,
    width = 200,
    rowHeight = 50,
    elementWidth = 100,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      width: width,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      elementWidth: elementWidth
    });
  });

  this.render();

  assert.equal(this.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view), [
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

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  for(i = 0; i < 10; i++) {
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 100);
  });

  assert.equal(this.$('.ember-list-item-view').length, 5, "The correct number of rows were rendered");

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.deepEqual(itemPositions(view), [
    { x: 0, y: 0},
    { x: 0, y: 50},
    { x: 0, y: 100},
    { x: 0, y: 150},
    { x: 0, y: 200}
  ], "The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 200);
  });

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view), [
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
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i+1));
  }
});

test("elementWidth change with scroll", function(assert){
  var i,
    positionSorted,
    content = generateContent(100),
    height = 200,
    width = 200,
    rowHeight = 50,
    elementWidth = 100,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      width: width,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      elementWidth: elementWidth
    });
  });

  this.render();

  Ember.run(function(){
    view.scrollTo(1000);
  });

  assert.equal(this.$('.ember-list-item-view').length, 10, "after scroll 1000 - The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view), [
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

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  for (i = 0; i < 10; i++) {
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }

  Ember.run(function() {
    view.set('width', 100);
  });

  assert.equal(this.$('.ember-list-item-view').length, 5, " after width 100 -The correct number of rows were rendered");

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.deepEqual(itemPositions(view), [
    { x:0,   y: 2000 },
    { x:0,   y: 2050 },
    { x:0 ,  y: 2100 },
    { x:0,   y: 2150 },
    { x:0,   y: 2200 }], "after width 100 - The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }

  Ember.run(function() {
    view.set('width', 200);
  });

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 10, "after width 200 - The correct number of rows were rendered");
  assert.deepEqual(itemPositions(view), [
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
    assert.equal(Ember.$(positionSorted[i]).text(), "Item " + (i + 41));
  }
});

test("A property of an item can be changed", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  //Change name
  Ember.run(function() {
    content.set('0.name', 'First change');
  });

  assert.equal(this.$('.ember-list-item-view:eq(0)').text(), "First change", "The item's name has been updated");

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

  assert.equal(this.$('.ember-list-item-view:eq(0)').text(), "Second change", "The item's name has been updated");

});

test("The list view is wrapped in an extra div to support JS-emulated scrolling", function(assert) {

  Ember.run(this, function(){
    view = this.subject({
      content: Ember.A(),
      height: 100,
      rowHeight: 50
    });
  });

  this.render();

  assert.equal(this.$('.ember-list-container').length, 1, "expected a ember-list-container wrapper div");
  assert.equal(this.$('.ember-list-container > .ember-list-item-view').length, 0, "expected no ember-list-items inside the wrapper div");
});

test("When destroyed, short-circuits syncChildViews", function(assert) {
  assert.expect(1);

  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(4),
      height: 150,
      rowHeight: 50
    });
  });

  this.render();

  Ember.run(function(){
    view.destroy();
  });

  Ember.run(function(){
    view._syncChildViews();
  });

  assert.ok(true, 'made it!');
});

test("adding a column, when everything is already within viewport", function(assert){
  // start off with 2x3 grid visible and 4 elements
  // x: visible, +: padding w/ element, 0: element not-drawn, o: padding w/o element, ?: no element
  //
  // x x  --|
  // x x    |- viewport
  // ? ?  --|
  var content = generateContent(4),
    width = 100,
    height = 150,
    rowHeight = 50,
    elementWidth = 50,
    itemViewClass = ListItemView.extend({
      template: compile("A:{{name}}{{view view.NestedViewClass}}"),
      NestedViewClass: Ember.View.extend({
        tagName: 'span',
        template: compile("B:{{name}}")
      })
    });

  Ember.run(this, function(){
    view = this.subject({
      content: content,
      width: width,
      height: height,
      rowHeight: rowHeight,
      elementWidth: elementWidth,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  assert.deepEqual(itemPositions(view), [
    { x:  0, y:    0 }, { x: 50, y:    0 },
    { x:  0, y:   50 }, { x: 50, y:   50 }
  ], "initial render: The rows are rendered in the correct positions");

  assert.equal(this.$('.ember-list-item-view').length, 4, "initial render: The correct number of rows were rendered");

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

  assert.equal(this.$('.ember-list-item-view').length, 4, "after width + height change: the correct number of rows were rendered");

  assert.deepEqual(itemPositions(view), [
    { x:  0, y:  0 }, { x: 50, y: 0 }, { x: 100, y: 0 },
    { x:  0, y: 50 }
  ], "after width + height change: The rows are in the correct positions");

  var sortedElements = sortElementsByPosition(this.$('.ember-list-item-view'));
  var texts = Ember.$.map(sortedElements, function(el){ return Ember.$(el).text(); });

  assert.deepEqual(texts, [
    'A:Item 1B:Item 1',
    'A:Item 2B:Item 2',
    'A:Item 3B:Item 3',
    'A:Item 4B:Item 4'
  ], 'after width + height change: elements should be rendered in expected position');
});

test("Creating a VirtualListView without height and rowHeight properties should throw an exception", function(assert) {
  assert.throws(()=>{
      Ember.run(()=>{
        view = this.subject({
          content: generateContent(4)
        });
      });

      this.render();
    },
    /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});


function yPosition(position){
  return position.y;
}

function xPosition(position){
  return position.x;
}
