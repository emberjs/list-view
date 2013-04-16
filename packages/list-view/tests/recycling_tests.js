var css, view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;
function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView acceptance - View recycling", {
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

test("recycling complex views", function(){
  var content = helper.generateContent(100),
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

