var view, css;

module("Ember.ListView integration", {
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
  }
});

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

function generateContent(n) {
  var content = Ember.A();
  for (var i = 0; i < n; i++) {
    content.push({name: "Item " + (i+1)});
  }
  return content;
}

function extractPositionFromTransform(string) {
  var matched, x, y, position;

  matched = string.match(/translate3d\((\d+)px,\s*(\d+)px,.*$/);

  x = parseInt(matched[1], 10);
  y = parseInt(matched[2], 10);

  position = {
    x: x,
    y: y
  };

  return position;
}

function extractNumberFromPosition(string) {
  var number = string.replace(/px/g,'');
  return parseInt(number, 10);
}

function extractPosition(element) {
  var style, position;

  style = element.style;

  if (style.top) {
    position = {
      y: extractNumberFromPosition(style.top),
      x: extractNumberFromPosition(style.left)
    };
  } else if (style.webkitTransform) {
    position = extractPositionFromTransform(style.webkitTransform);
  }

  return position;
}

function sortElementsByPosition (elements) {
  return elements.sort(function(a, b){
    var aPosition, bPosition;

    aPosition = extractPosition(a);
    bPosition = extractPosition(b);

    if (bPosition.y === aPosition.y){
      return (aPosition.x - bPosition.x);
    } else {
      return (aPosition.y - bPosition.y);
    }
  });
}

function sortByPosition (a, b) {
  var aPosition, bPosition;

  aPosition = a;
  bPosition = b;

  if (bPosition.y === aPosition.y){
    return (aPosition.x - bPosition.x);
  } else {
    return (aPosition.y - bPosition.y);
  }
}

function itemPositions() {
  return view.$('.ember-list-item-view').toArray().map(function(e) {
    return extractPosition(e);
  }).sort(sortByPosition);
}

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
    content:generateContent(20)
  });

  equal(view.get('totalHeight'), 1000);
});

test("totalHeight: even", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: generateContent(20),
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
    content: generateContent(21),
    width: width,
    elementWidth: elementWidth
  });

  equal(view.get('totalHeight'), 550);
});


test("_startingIndex: base case", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 0
  });

  equal(view._startingIndex(), 0);
});

test("_startingIndex: scroll but within content length", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 100
  });

  equal(view._startingIndex(), 4);
});

test("_startingIndex: scroll but beyond content length", function(){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  view = Ember.ListView.create({
    height: height,
    rowHeight: rowHeight,
    content: generateContent(5),
    width: width,
    elementWidth: elementWidth,
    scrollTop: 1000
  });

  equal(view._startingIndex(), 4);
});


test("computing the number of child views to create with scrollTop zero", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    content: Ember.A()
  });

  equal(view._numChildViewsForViewport(), 11);
});

test("computing the number of child views to create after when scroll down a bit", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    scrollTop: 51,
    content: Ember.A()
  });
  equal(view._numChildViewsForViewport(), 11);
});

test("should render a subset of the full content, based on the height, in the correct positions", function() {
  var content = generateContent(100),
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
  equal(view.$(':last')[0].style.height, "5000px", "The scrollable view has the correct height");

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  equal(positionSorted[0].innerText, "Item 1");
  equal(positionSorted[10].innerText, "Item 11");

  deepEqual(itemPositions().map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
});

test("should render correctly with an initial scrollTop", function() {
  var content = generateContent(100),
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

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(positionSorted[0].innerText, "Item 10");
  equal(positionSorted[10].innerText, "Item 20");

  deepEqual(itemPositions().map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

test("should be programatically scrollable", function() {
  var content = generateContent(100),
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
  deepEqual(itemPositions().map(yPosition), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
});

test("replacing the list content", function() {
  var content = generateContent(100),
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
    view.set('content', Ember.A([{name: 'The only item'}]));
  });

  equal(view.$('.ember-list-item-view').length, 1, "The rendered list was updated");
  equal(view.$(':last')[0].style.height, "50px", "The scrollable view has the correct height");
});

test("adding to the front of the list content", function() {
  var content = generateContent(100),
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
    content.unshiftObject({name: "Item -1"});
  });

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted[0].innerText, "Item -1", "The item has been inserted in the list");
  equal(view.$(':last')[0].style.height, "5050px", "The scrollable view has the correct height");
});

test("inserting in the middle of visible content", function() {
  var content = generateContent(100),
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
    content.insertAt(2, {name: "Item 2'"});
  });

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted[0].innerText, "Item 1", "The item has been inserted in the list");
  equal(positionSorted[2].innerText, "Item 2'", "The item has been inserted in the list");
});

test("clearing the content", function() {
  var content = generateContent(100),
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
    content.clear();
  });

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted.length, 0, "The list should not contain any elements");
});

test("deleting the first element", function() {
  var content = generateContent(100),
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

  var positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted[0].innerText, "Item 1", "The item has been inserted in the list");

  Ember.run(function() {
    content.removeAt(0);
  });

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted[0].innerText, "Item 2", "The item has been inserted in the list");
});


function yPosition(position){
  return position.y;
}

function xPosition(position){
  return position.x;
}

test("height change", function(){
  var content = generateContent(100),
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
  deepEqual(itemPositions().map(yPosition), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(itemPositions().map(yPosition), [0, 50, 100], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");
  deepEqual(itemPositions().map(yPosition), [0, 50], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(itemPositions().map(yPosition), [0, 50, 100], "The rows are in the correct positions" );
});

test("height and width change after with scroll", function(){
  // start off with 2x3 grid visible and 8 elements
  var content = generateContent(8),
      width = 100,
      height = 150,
      rowHeight = 50,
      elementWidth = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}")
      });

  view = Ember.ListView.create({
    content: content,
    width: width,
    height: height,
    rowHeight: rowHeight,
    elementWidth: elementWidth,
    itemViewClass: itemViewClass
  });

  appendView();

  deepEqual(itemPositions(), [
            { x:  0, y:    0 }, { x: 50, y:    0 },
            { x:  0, y:   50 }, { x: 50, y:   50 },
            { x:  0, y:  100 }, { x: 50, y:  100 },
            { x:  0, y:  150 }, { x: 50, y:  150 }
            ], "The rows are rendered in the correct positions");

  equal(view.$('.ember-list-item-view').length, 8, "The correct number of rows were rendered");

  // user is scrolled near the bottom of the list
  Ember.run(function(){
    view.scrollTo(51);
  });

  equal(view.$('.ember-list-item-view').length, 8, "The correct number of rows were rendered");

  deepEqual(itemPositions(), [
              { x: 0, y:  50 }, { x: 50, y:  50 },
              { x: 0, y: 100 }, { x: 50, y: 100 },
              { x: 0, y: 150 }, { x: 50, y: 150 },
/* padding */ { x: 0, y: 200 }, { x: 50, y: 200 }], "The rows are in the correct positions");

  // rotate to a with 3x2 grid visible and 8 elements
  Ember.run(function() {
    view.set('width',  150);
    view.set('height', 100);
  });
  equal(view.$('.ember-list-item-view').length, 8, "The correct number of rows were rendered");

  deepEqual(itemPositions(), [
              { x:  0, y:   50 }, { x: 50, y:   50 }, { x:  100, y:  50 },
              { x:  0, y:  100 }, { x: 50, y:  100 }, { x: 100, y:  100 },
/* padding */ { x:  0, y:  150 }, { x: 50, y:  150 }
            ], "The rows are in the correct positions");

});

test("elementWidth change", function(){
  var i,
      positionSorted,
      content = generateContent(100),
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
  deepEqual(itemPositions(), [
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

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  for(i = 0; i < 10; i++) {
    equal(positionSorted[i].innerText, "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 100);
  });

  equal(view.$('.ember-list-item-view').length, 5, "The correct number of rows were rendered");

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  deepEqual(itemPositions(), [
            { x: 0, y: 0},
            { x: 0, y: 50},
            { x: 0, y: 100},
            { x: 0, y: 150},
            { x: 0, y: 200}
  ], "The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    equal(positionSorted[i].innerText, "Item " + (i+1));
  }

  Ember.run(function() {
    view.set('width', 200);
  });

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [
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
    equal(positionSorted[i].innerText, "Item " + (i+1));
  }
});

test("elementWidth change with scroll", function(){
  var i,
      positionSorted,
      content = generateContent(100),
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

  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [
            { x:0,   y: 1000 },
            { x:100, y: 1000 },
            { x:0,   y: 1050 },
            { x:100, y: 1050 },
            { x:0 ,  y: 1100 },
            { x:100, y: 1100 },
            { x:0,   y: 1150 },
            { x:100, y: 1150 },
            { x:0,   y: 1200 },
            { x:100, y: 1200 }], "The rows are in the correct positions");

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  for (i = 0; i < 10; i++) {
    equal(positionSorted[i].innerText, "Item " + (i + 41));
  }

  window.STOP = true;
  Ember.run(function() {
    view.set('width', 100);
  });

  equal(view.$('.ember-list-item-view').length, 5, "The correct number of rows were rendered");

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));

  deepEqual(itemPositions(), [
            { x:0,   y: 1000 },
            { x:0,   y: 1050 },
            { x:0 ,  y: 1100 },
            { x:0,   y: 1150 },
            { x:0,   y: 1200 }], "The rows are in the correct positions");

  for(i = 0; i < 5; i++) {
    equal(positionSorted[i].innerText, "Item " + (i + 21));
  }

  Ember.run(function() {
    view.set('width', 200);
  });
  window.STOP = false;

  positionSorted = sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 10, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [
            { x:0,   y: 1000 },
            { x:100, y: 1000 },
            { x:0,   y: 1050 },
            { x:100, y: 1050 },
            { x:0 ,  y: 1100 },
            { x:100, y: 1100 },
            { x:0,   y: 1150 },
            { x:100, y: 1150 },
            { x:0,   y: 1200 },
            { x:100, y: 1200 }], "The rows are in the correct positions");

  for(i = 0; i < 10; i++) {
    equal(positionSorted[i].innerText, "Item " + (i + 41));
  }
});

test("recycling complex views", function(){
  var content = generateContent(100),
      height = 50,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        innerViewClass: Ember.View.extend({
          didInsertElement: function(){
            innerViewInsertionCount++;
          },
          willDestroyElement: function(){
            innerViewDestroyCount++;
          }
        }),
        template: Ember.Handlebars.compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
      });

  var listViewInsertionCount, listViewDestroyCount,
  innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass,
    scrollTop: 0,
    didInsertElement: function() {
      listViewInsertionCount++;
    },
    willDestroyElement: function() {
      listViewDestroyCount++;
    }
  });

  equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  appendView();

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement");
  equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement");

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  console.log("scrollTo 50");
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  equal(innerViewInsertionCount, 1, "expected number of innerView's didInsertElement");
  equal(innerViewDestroyCount, 1, "expected number of innerView's willDestroyElement");

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  console.log("scrollTo 0");
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  equal(innerViewInsertionCount, 1, "expected number of innerView's didInsertElement");
  equal(innerViewDestroyCount, 1, "expected number of innerView's willDestroyElement");

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

});

test("A property of an item can be changed", function() {
  var content = generateContent(100),
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
    content: Ember.A({}),
    height: 100,
    rowHeight: 50
  });
  appendView();
  equal(view.$('.ember-list-container').length, 1, "expected a ember-list-container wrapper div");
  equal(view.$('.ember-list-container > .ember-list-item-view').length, 3, "expected ember-list-items inside the wrapper div");
  equal(view.$('.ember-list-container > .ember-list-scrolling-view').length, 1, "expected a ember-list-scrolling-view inside the wrapper div");
});

test("When scrolled to the very bottom, the 'padding' list items should be empty", function() {
  view = Ember.ListView.create({
    content: generateContent(4),
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
  var sortedElements = sortElementsByPosition(view.$('.ember-list-item-view')),
      lastEl = sortedElements[sortedElements.length - 1];
  equal(lastEl.innerHTML, '', "expected the last ('padding') item view to have no content");
});
