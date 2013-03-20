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

function extractYFromTransform(string){
  var number = string.replace(/translate3d\(0px, (\d+)px,.*$/, '$1');

  return parseInt(number, 10);
}

function extractNumberFromPosition(string){
  var number = string.replace(/px/g,'');
  return parseInt(number, 10);
}

function itemPositions() {
  return view.$('.ember-list-item-view').toArray().map(function(e) {

    var topOffset = null;

    if(e.style.top){
      topOffset = extractNumberFromPosition(e.style.top);
    } else if(e.style.webkitTransform) {
      topOffset = extractYFromTransform(e.style.webkitTransform);
    }

    return topOffset;

  });
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

  equal(view.$('.ember-list-item-view').length, 11, "The correct number of rows were rendered");
  equal(view.$('.ember-list-item-view:eq(0)').text(), "Item 1");
  equal(view.$('.ember-list-item-view:eq(10)').text(), "Item 11");

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
  equal(view.$('.ember-list-item-view:eq(0)').text(), "Item 10");
  equal(view.$('.ember-list-item-view:eq(10)').text(), "Item 20");

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
  deepEqual(itemPositions(), [550, 600, 650, 700, 750, 800, 850, 900, 950, 450, 500], "The rows are in the correct positions");
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

test("modifying the list content", function() {
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

  equal(view.$('.ember-list-item-view:eq(0)').text(), "Item -1", "The item has been inserted in the list");
  equal(view.$(':last')[0].style.height, "5050px", "The scrollable view has the correct height");
});

// TODO:
// - selection?
// - content array length changes, causes the scrollTop to be greater than the totalHeight
