var view, css;

module("Ember.ListView", {
  setup: function() {
    css = Ember.$("<style>" +
            ".list-view {" +
            "  overflow: auto;" +
            "  position: relative;" +
            "}" +
            ".list-item-view {" +
            "  position: absolute;" +
            "}" +
            ".is-selected {" +
            "  background: red;" +
            "}" +
            "</style>").appendTo('head');
  },
  teardown: function() {
    //css.remove();

    Ember.run(function() {
      //if (view) { view.destroy(); }
    });
  }
});

function appendView() {
  Ember.run(function() {
    view.append(); //appendTo('#qunit-fixture');
  });
}

function generateContent(n) {
  var content = Ember.A();
  for (var i = 0; i < n; i++) {
    content.push({name: "Item " + (i+1)});
  }
  return content;
}

function itemPositions() {
  return view.$('.list-item-view').toArray().map(function(e) {
    return e.style.top;
  }).join(' ').replace(/px/g, "");
}

test("should exist", function() {
  view = Ember.ListView.create();
  appendView();
  ok(view);
});

test("computing the number of child views to create", function() {
  var height = 500, rowHeight = 50;
  view = Ember.ListView.create({height: height, rowHeight: rowHeight});
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

  equal(view.$('.list-item-view').length, 11, "The correct number of rows were rendered");
  equal(view.$('.list-item-view:eq(0)').text(), "Item 1");
  equal(view.$('.list-item-view:eq(10)').text(), "Item 11");

  equal(itemPositions(), "0 50 100 150 200 250 300 350 400 450 500");
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

  equal(view.$('.list-item-view').length, 11, "The correct number of rows were rendered");
  equal(view.$('.list-item-view:eq(0)').text(), "Item 10");
  equal(view.$('.list-item-view:eq(10)').text(), "Item 20");

  equal(itemPositions(), "450 500 550 600 650 700 750 800 850 900 950", "The rows are in the correct positions");
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

  equal(view.$('.list-item-view').length, 11, "The correct number of rows were rendered");
  equal(itemPositions(), "550 600 650 700 750 800 850 900 950 450 500", "The rows are in the correct positions");
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

  equal(view.$('.list-item-view').length, 1, "The rendered list was updated");
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

  equal(view.$('.list-item-view:eq(0)').text(), "Item -1", "The item has been inserted in the list");
  equal(view.$(':last')[0].style.height, "5050px", "The scrollable view has the correct height");
});

test("item view state is maintained across scroll / content array manipulation", function() {
  var content = generateContent(100),
      height = 500,
      rowHeight = 50,
      itemViewClass = Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("{{name}}"),
        classNameBindings: ['isSelected'],
        prepareForReuse: function() {
          this.set('isSelected', false);
        },
        serialize: function() {
          var props = this.getProperties('isSelected');
          if (props.isSelected) { debugger; }
          return props;
        }
      });
  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    itemViewClass: itemViewClass
  });
  appendView();

  Ember.run(function() {
    view.set('childViews.0.isSelected', true);
  });

  Ember.run(function() {
    view.scrollTo(600);
  });

  equal(view.get('childViews.0.isSelected'), false, "View state was cleared after scroll");

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.get('childViews.0.isSelected'), true, "View state was restored after scroll");

  Ember.run(function() {
    content.popObject();
  });

  equal(view.get('childViews.0.isSelected'), true, "View state was retained after content array manipulation");
});

// TODO:
// - selection?
// - view state serialization
// - content array length changes, causes the scrollTop to be greater than the totalHeight
