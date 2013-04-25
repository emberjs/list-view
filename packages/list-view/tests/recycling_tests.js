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

test("recycling complex views long list", function(){
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

test("recycling complex views short list", function(){
  var content = helper.generateContent(2),
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

  equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");

  appendView();

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  equal(innerViewDestroyCount, 1, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-scroll to 50)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-scroll to 50)");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  equal(innerViewInsertionCount, 1, "expected number of innerView's didInsertElement (post-scroll to 0)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-scroll to 0)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-scroll to 0)");

});

test("recycling complex views long list, with ReusableListItemView", function(){
  var content = helper.generateContent(50),
      height = 50,
      rowHeight = 50,
      itemViewClass = Ember.ReusableListItemView.extend({
        innerViewClass: Ember.View.extend({
          didInsertElement: function(){
            innerViewInsertionCount++;
          },
          willDestroyElement: function(){
            innerViewDestroyCount++;
          }
        }),
        didInsertElement: function(){
          this._super();
          listItemViewInsertionCount++;
        },
        willDestroyElement: function(){
          this._super();
          listItemViewDestroyCount++;
        },
        template: Ember.Handlebars.compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
      });

  var listViewInsertionCount, listViewDestroyCount,
  listItemViewInsertionCount, listItemViewDestroyCount,
  innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

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

  equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  appendView();

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  equal(listItemViewInsertionCount, 2, "expected number of listItemView's didInsertElement (post-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 50)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 50)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 0)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 0)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 0)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");
});

test("recycling complex views short list, with ReusableListItemView", function(){
  var content = helper.generateContent(2),
      height = 50,
      rowHeight = 50,
      itemViewClass = Ember.ReusableListItemView.extend({
        innerViewClass: Ember.View.extend({
          didInsertElement: function(){
            innerViewInsertionCount++;
          },
          willDestroyElement: function(){
            innerViewDestroyCount++;
          }
        }),
        didInsertElement: function(){
          this._super();
          listItemViewInsertionCount++;
        },
        willDestroyElement: function(){
          this._super();
          listItemViewDestroyCount++;
        },
        template: Ember.Handlebars.compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
      });

  var listViewInsertionCount, listViewDestroyCount,
  listItemViewInsertionCount, listItemViewDestroyCount,
  innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

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

  equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  appendView();

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  equal(listItemViewInsertionCount, 2, "expected number of listItemView's didInsertElement (post-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(50);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 50)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 50)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(0);
  });

  equal(view.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 0)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 0)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 0)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");
});

test("recycling complex views with ReusableListItemView, handling empty slots at the end of the grid", function(){
  var content = helper.generateContent(20),
      height = 150,
      rowHeight = 50,
      width = 100,
      elementWidth = 50,
      itemViewClass = Ember.ReusableListItemView.extend({
        innerViewClass: Ember.View.extend({
          didInsertElement: function(){
            innerViewInsertionCount++;
          },
          willDestroyElement: function(){
            innerViewDestroyCount++;
          }
        }),
        didInsertElement: function(){
          this._super();
          listItemViewInsertionCount++;
        },
        willDestroyElement: function(){
          this._super();
          listItemViewDestroyCount++;
        },
        template: Ember.Handlebars.compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
      });

  var listViewInsertionCount, listViewDestroyCount,
  listItemViewInsertionCount, listItemViewDestroyCount,
  innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view = Ember.ListView.create({
    content: content,
    height: height,
    rowHeight: rowHeight,
    width: width,
    elementWidth: elementWidth,
    itemViewClass: itemViewClass,
    scrollTop: 0,
    didInsertElement: function() {
      listViewInsertionCount++;
    },
    willDestroyElement: function() {
      listViewDestroyCount++;
    }
  });

  equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  appendView();

  equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  equal(listItemViewInsertionCount, 8, "expected number of listItemView's didInsertElement (post-append)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  equal(innerViewInsertionCount, 8, "expected number of innerView's didInsertElement (post-append)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  equal(view.$('.ember-list-item-view').length, 8, "The correct number of items were rendered (post-append)");
  equal(view.$('.ember-list-item-view:visible').length, 8, "The number of items that are not hidden with display:none (post-append)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(350);
  });

  equal(view.$('.ember-list-item-view').length, 8, "The correct number of items were rendered (post-scroll to 350)");
  equal(view.$('.ember-list-item-view:visible').length, 6, "The number of items that are not hidden with display:none (post-scroll to 350)");

  equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 350)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 350)");
  equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 350)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 350)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.set('width', 150);
  });

  equal(view.$('.ember-list-item-view').length, 12, "The correct number of items were rendered (post-expand to 3 columns)");

  equal(listItemViewInsertionCount, 4, "expected number of listItemView's didInsertElement (post-expand to 3 columns)");
  equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-expand to 3 columns)");
  equal(innerViewInsertionCount, 4, "expected number of innerView's didInsertElement (post-expand to 3 columns)");
  equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-expand to 3 columns)");

  equal(view.$('.ember-list-item-view:visible').length, 8, "The number of items that are not hidden with display:none (post-expand to 3 columns)");
});
