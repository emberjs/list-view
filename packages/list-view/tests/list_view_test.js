var view, css;

module("Ember.ListView", {
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

function extractYFromTransform(string) {
  var number = string.replace(/translate3d\(0px, (\d+)px,.*$/, '$1');

  return parseInt(number, 10);
}

function extractNumberFromPosition(string) {
  var number = string.replace(/px/g,'');
  return parseInt(number, 10);
}

function extractPosition(element) {
  var topOffset = null,
  style = element.style;

  if (style.top) {
    topOffset = extractNumberFromPosition(style.top);
  } else if (style.webkitTransform) {
    topOffset = extractYFromTransform(style.webkitTransform);
  }

  return topOffset;
}

function sortElementsByPosition (elements) {
  return elements.sort(function(a, b){
    return extractPosition(a) - extractPosition(b);
  });
}

function itemPositions() {
  return view.$('.ember-list-item-view').toArray().map(function(e) {
    return extractPosition(e);
  }).sort(function(a,b){ return a - b; });
}

test("should exist", function() {
  view = Ember.ListView.create();
  appendView();
  ok(view);
});

test("computing the number of child views to create", function() {
  var height = 500, rowHeight = 50;
  view = Ember.ListView.create({height: height, rowHeight: rowHeight, content: Ember.A()});
  equal(view._numOfChildViewsForHeight(), 11);
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

  deepEqual(itemPositions(), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
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

  deepEqual(itemPositions(), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
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
  deepEqual(itemPositions(), [450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950], "The rows are in the correct positions");
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
  deepEqual(itemPositions(), [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [0, 50, 100], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [0, 50], "The rows are in the correct positions");

  Ember.run(function() {
    view.set('height', 100);
  });

  equal(view.$('.ember-list-item-view').length, 3, "The correct number of rows were rendered");
  deepEqual(itemPositions(), [0, 50, 100], "The rows are in the correct positions" );
});

test("_syncChildViews", function(){
  expect(0);
});
// TODO:
// - selection?
// - content array length changes, causes the scrollTop to be greater than the totalHeight
