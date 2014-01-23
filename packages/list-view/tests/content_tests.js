var css, view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView integration - Content", {
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

test("the ember-list helper", function() {
  var content = helper.generateContent(100);

  view = Ember.View.create({
    controller: content,
    template: Ember.Handlebars.compile("{{#ember-list height=500 row-height=50}}{{name}}{{/ember-list}}")
  });

  appendView();

  equal(view.$('.ember-list-item-view').length, 11, "The rendered list was updated");
  equal(view.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");
});

test("the ember-list helper uses items=", function() {
  var content = helper.generateContent(100);

  view = Ember.View.create({
    controller: { itemz: content },
    template: Ember.Handlebars.compile("{{#ember-list items=itemz height=500 row-height=50}}{{name}}{{/ember-list}}")
  });

  appendView();

  equal(view.$('.ember-list-item-view').length, 11, "The rendered list was updated");
  equal(view.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");
});

test("replacing the list content", function() {
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
    view.set('content', Ember.A([{name: 'The only item'}]));
  });

  equal(view.$('.ember-list-item-view').length, 1, "The rendered list was updated");
  equal(view.$('.ember-list-container').height(), 50, "The scrollable view has the correct height");
});

test("adding to the front of the list content", function() {
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
    content.unshiftObject({name: "Item -1"});
  });

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(Ember.$(positionSorted[0]).text(), "Item -1", "The item has been inserted in the list");
  equal(view.$('.ember-list-container').height(), 5050, "The scrollable view has the correct height");
});

test("inserting in the middle of visible content", function() {
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
    content.insertAt(2, {name: "Item 2'"});
  });

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(Ember.$(positionSorted[0]).text(), "Item 1", "The item has been inserted in the list");
  equal(Ember.$(positionSorted[2]).text(), "Item 2'", "The item has been inserted in the list");
});

test("clearing the content", function() {
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
    content.clear();
  });

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(positionSorted.length, 0, "The list should not contain any elements");
});

test("deleting the first element", function() {
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

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(Ember.$(positionSorted[0]).text(), "Item 1", "The item has been inserted in the list");

  Ember.run(function() {
    content.removeAt(0);
  });

  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(Ember.$(positionSorted[0]).text(), "Item 2", "The item has been inserted in the list");
});

