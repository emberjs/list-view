import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

moduleForView("list-view", "acceptance", {});

test("should render an empty view when there is no content", function(assert) {
  var content = generateContent(0),
    height = 500,
    rowHeight = 50,
    emptyViewHeight = 170,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    }),
    emptyView = Ember.View.extend({
      attributeBindings: ['style'],
      classNames: ['empty-view'],
      style: 'height:' + emptyViewHeight + 'px;'
    });

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      emptyView: emptyView
    });
  });

  this.render();

  assert.equal(view.get('element').style.height, "500px", "The list view height is correct");
  assert.equal(this.$('.ember-list-container').height(), emptyViewHeight, "The scrollable view has the correct height");

  assert.equal(this.$('.ember-list-item-view').length, 0, "The correct number of rows were rendered");
  assert.equal(this.$('.empty-view').length, 1, "The empty view rendered");

  Ember.run(function () {
    view.set('content', generateContent(10));
  });

  assert.equal(view.get('element').style.height, "500px", "The list view height is correct");
  assert.equal(this.$('.ember-list-container').height(), 500, "The scrollable view has the correct height");

  assert.equal(this.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  assert.equal(this.$('.empty-view').length, 0, "The empty view is removed");

  Ember.run(function () {
    view.set('content', content);
  });

  assert.equal(view.get('element').style.height, "500px", "The list view height is correct");
  assert.equal(this.$('.ember-list-container').height(), emptyViewHeight, "The scrollable view has the correct height");

  assert.equal(this.$('.ember-list-item-view').length, 0, "The correct number of rows were rendered");
  assert.equal(this.$('.empty-view').length, 1, "The empty view rendered");

  Ember.run(function () {
    view.set('content', generateContent(10));
  });

  assert.equal(view.get('element').style.height, "500px", "The list view height is correct");
  assert.equal(this.$('.ember-list-container').height(), 500, "The scrollable view has the correct height");

  assert.equal(this.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  assert.equal(this.$('.empty-view').length, 0, "The empty view has been removed");
});

test("should render a subset of the full content, based on the height, in the correct positions", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
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
  assert.equal(this.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.equal(this.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  assert.equal(Ember.$(positionSorted[0]).text(), "Item 1");
  assert.equal(Ember.$(positionSorted[10]).text(), "Item 11");

  assert.deepEqual(itemPositions(view).map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
});

test("should render correctly with an initial scrollTop", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
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

test("should perform correct number of renders and repositions on short list init", function (assert) {
  var content = generateContent(8),
    height = 60,
    width = 50,
    rowHeight = 10,
    positions = 0,
    renders = 0,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
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

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      width: width,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  assert.equal(renders, 7, "The correct number of renders occured");
  assert.equal(positions, 14, "The correct number of positions occured");
});

test("should perform correct number of renders and repositions while short list scrolling", function (assert) {
  var content = generateContent(8),
    height = 60,
    width = 50,
    scrollTop = 50,
    rowHeight = 10,
    positions = 0,
    renders = 0,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
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

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      width: width,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  Ember.run(function () {
    view.scrollTo(scrollTop);
  });

  assert.equal(renders, 14, "The correct number of renders occured");
  assert.equal(positions, 21, "The correct number of positions occured");
});

test("should perform correct number of renders and repositions on long list init", function (assert) {
  var content = generateContent(200),
    height = 50,
    width = 50,
    rowHeight = 10,
    positions = 0,
    renders = 0,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
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

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      width: width,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0
    });
  });

  this.render();

  assert.equal(renders, ((height / 10) + 1),  "The correct number of renders occurred");
  assert.equal(positions, 12, "The correct number of positions occurred");
});

test("should be programatically scrollable", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
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

  var view;
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

  var view;
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

  var view;
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
  // o o
  // x x --|
  // x x   |- viewport
  // x x --|

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
    'A:Item 10B:Item 10'
  ], 'after width + height change: elements should be rendered in expected position');
});

test("height and width change after with scroll – 1x2 -> 2x2 with 5 items", function(assert){
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

  var view;
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
  // o
  // x --|
  // x --|- viewport
  // 0
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

  var view;
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

  // Test a width smaller than elementWidth, should behave the same as width === elementWidth
  Ember.run(function () {
    view.set('width', 50);
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

  assert.ok(this.$().is('.ember-list-view-list'), 'has correct list related class');

  Ember.run(function() {
    view.set('width', 200);
  });

  assert.ok(this.$().is('.ember-list-view-grid'), 'has correct grid related class');
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

  var view;
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

  var view;
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
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: Ember.A(),
      height: 100,
      rowHeight: 50
    });
  });

  this.render();
  assert.equal(this.$('.ember-list-container').length, 1, "expected a ember-list-container wrapper div");
  assert.equal(this.$('.ember-list-container > .ember-list-item-view').length, 0, "expected ember-list-items inside the wrapper div");
});

test("When scrolled past the totalHeight, views should not be recycled in. This is to support overscroll", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(2),
      height:100,
      rowHeight: 50,
      itemViewClass: ListItemView.extend({
        template: compile("Name: {{name}}")
      })
    });
  });

  this.render();

  Ember.run(function(){
    view.scrollTo(150);
  });

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 2, "after width 200 - The correct number of rows were rendered");

  assert.deepEqual(itemPositions(view), [
    { x:0, y:  0 },
    { x:0, y: 50 }] , "went beyond scroll max via overscroll");

  assert.equal(Ember.$(positionSorted[0]).text(), "Name: Item " + 1);
  assert.equal(Ember.$(positionSorted[1]).text(), "Name: Item " + 2);
});


test("When list-view is unable to scroll, scrollTop should be zero", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(2),
      height:400,
      rowHeight: 100,
      itemViewClass: ListItemView.extend({
        template: compile("Name: {{name}}")
      })
    });
  });

  this.render();

  Ember.run(function(){
    view.scrollTo(1);
  });

  assert.equal(view.get('scrollTop'), 0, "Scrolltop should be zero");
});


test("Creating a ListView without height and rowHeight properties should throw an exception", function(assert) {
  assert.throws(()=>{
      Ember.run(()=>{
        this.subject({
          content: generateContent(4)
        });
      });
      this.render();
    },
    /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});

test("Creating a ListView without height and rowHeight properties should throw an exception", function(assert) {
  assert.throws(()=>{
      Ember.run(()=>{
        this.subject({
          content: generateContent(4)
        });
      });

      this.render();
    },
    /A ListView must be created with a height and a rowHeight./, "Throws exception.");
});

test("handle strange ratios between height/rowHeight", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(15),
      height: 235,
      rowHeight: 73,
      itemViewClass: ListItemView.extend({
        template: compile("Name: {{name}}")
      })
    });
  });

  this.render();

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 5);

  assert.deepEqual(itemPositions(view), [
    { x:0, y:   0 },
    { x:0, y:  73 },
    { x:0, y: 146 },
    { x:0, y: 219 },
    { x:0, y: 292 }
  ] , "went beyond scroll max via overscroll");

  for (var i = 0; i < positionSorted.length; i++) {
    assert.equal(Ember.$(positionSorted[i]).text(), "Name: Item " + (i + 1));
  }

  view.scrollTo(1000);

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 5);

  // expected
  // -----
  // 0   |
  // 1   |
  // 2   |
  // 3   |
  // 4   | <--- not rendered
  // 5   |
  // 6   |
  // 7   |
  // 8   |
  // 9   |
  // ----
  // 10  | <- buffer
  // ----
  // 11  | <-- partially visible
  // 12  | <--- visible
  // 13  |
  // 14  |
  // ----
  assert.deepEqual(itemPositions(view), [
    { x:0, y:  730 }, // <-- buffer
    { x:0, y:  803 }, // <-- partially visible
    { x:0, y:  876 }, // <-- in view
    { x:0, y:  949 }, // <-- in view
    { x:0, y: 1022 }  // <-- in view
  ], "went beyond scroll max via overscroll");

  assert.equal(Ember.$(positionSorted[0]).text(), "Name: Item 11");
  assert.equal(Ember.$(positionSorted[1]).text(), "Name: Item 12");
  assert.equal(Ember.$(positionSorted[2]).text(), "Name: Item 13");
  assert.equal(Ember.$(positionSorted[3]).text(), "Name: Item 14");
  assert.equal(Ember.$(positionSorted[4]).text(), "Name: Item 15");
});

test("handle bindable rowHeight", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(15),
      height: 400,
      rowHeight: 100,
      itemViewClass: ListItemView.extend({
        template: compile("Name: {{name}}")
      })
    });
  });

  this.render();

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 5);
  assert.equal(view.get('totalHeight'), 1500);

  // expected
  // -----
  // 0   |
  // 1   |
  // 2   |
  // 3   |
  // -----
  // 4   | <--- buffer
  // -----
  // 5   |
  // 6   |
  // 7   |
  // 8   |
  // 9   |
  // 10  |
  // 11  |
  // 12  |
  // 13  |
  // 14  |
  // -----
  //
  assert.deepEqual(itemPositions(view), [
    { x:0, y:   0 }, // <- visible
    { x:0, y: 100 }, // <- visible
    { x:0, y: 200 }, // <- visible
    { x:0, y: 300 }, // <- visible
    { x:0, y: 400 }  // <- buffer
  ] , "inDOM views are correctly positioned: before rowHeight change");

  assert.equal(Ember.$(positionSorted[0]).text(), "Name: Item 1");
  assert.equal(Ember.$(positionSorted[1]).text(), "Name: Item 2");
  assert.equal(Ember.$(positionSorted[2]).text(), "Name: Item 3");
  assert.equal(Ember.$(positionSorted[3]).text(), "Name: Item 4");

  Ember.run(view, 'set', 'rowHeight', 200);

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 3);
  assert.equal(view.get('totalHeight'), 3000);

  // expected
  // -----
  // 0   |
  // 1   |
  // ----|
  // 2   | <--- buffer
  // ----|
  // 3   |
  // 4   |
  // 5   |
  // 6   |
  // 7   |
  // 8   |
  // 9   |
  // 10  |
  // 11  |
  // 12  |
  // 13  |
  // 14  |
  // -----
  assert.deepEqual(itemPositions(view), [
    { x:0, y:    0 }, // <-- visible
    { x:0, y:  200 }, // <-- visible
    { x:0, y:  400 }  // <-- buffer
  ], "inDOM views are correctly positioned: after rowHeight change");

  assert.equal(Ember.$(positionSorted[0]).text(), "Name: Item 1");
  assert.equal(Ember.$(positionSorted[1]).text(), "Name: Item 2");
  assert.equal(Ember.$(positionSorted[2]).text(), "Name: Item 3");
});

var scrollYChanged, reuseChildren;

moduleForView("list-view", "acceptance", {
  setup: function() {
    scrollYChanged = 0;
    reuseChildren = 0;
  },
  subject: function(options, factory) {
    return factory.extend({
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
    }).create(options);
  }
});

test("should trigger scrollYChanged correctly", function (assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: generateContent(10),
      height: 100,
      rowHeight: 50
    });
  });

  this.render();

  assert.equal(scrollYChanged, 0, 'scrollYChanged should not fire on init');

  view.scrollTo(1);

  assert.equal(scrollYChanged, 1, 'scrollYChanged should fire after scroll');

  view.scrollTo(1);

  assert.equal(scrollYChanged, 1, 'scrollYChanged should not fire for same value');
});

moduleForView("list-view", "acceptance", {
  setup: function() {
    scrollYChanged = 0;
    reuseChildren = 0;
  },
  subject: function(options, factory) {
    return factory.extend({
      _reuseChildren: function () {
        reuseChildren++;
        this._super();
      }
    }).create(options);
  }
});

test("should trigger reuseChildren correctly", function (assert) {
  var view;
  Ember.run(this, function() {
    view = this.subject({
      content: generateContent(10),
      height: 100,
      rowHeight: 50
    });
  });

  this.render();

  assert.equal(reuseChildren, 1, 'initialize the content');

  view.scrollTo(1);

  assert.equal(reuseChildren, 1, 'should not update the content');

  view.scrollTo(51);

  assert.equal(reuseChildren, 2, 'should update the content');
});

function yPosition(position){
  return position.y;
}

function xPosition(position){
  return position.x;
}
