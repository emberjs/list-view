var css, view, helper;
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView - Multi-height grid", {
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

    Ember.ENABLE_PROFILING = false;
  }
});

test("Correct height based on content", function() {
  var content = [
    { id:  1, type: "cat",   height: 100, name: "Andrew" },
    { id:  3, type: "cat",   height: 100, name: "Bruce" },
    { id:  4, type: "other", height: 150, name: "Xbar" },
    { id:  5, type: "dog",   height:  50, name: "Caroline" },
    { id:  6, type: "cat",   height: 100, name: "David" },
    { id:  7, type: "other", height: 150, name: "Xbar" },
    { id:  8, type: "other", height: 150, name: "Xbar" },
    { id:  9, type: "dog",   height:  50, name: "Edward" },
    { id: 10, type: "dog",   height:  50, name: "Francis" },
    { id: 11, type: "dog",   height:  50, name: "George" },
    { id: 12, type: "other", height: 150, name: "Xbar" },
    { id: 13, type: "dog",   height:  50, name: "Harry" },
    { id: 14, type: "cat",   height: 100, name: "Ingrid" },
    { id: 15, type: "other", height: 150, name: "Xbar" },
    { id: 16, type: "cat",   height: 100, name: "Jenn" },
    { id: 17, type: "cat",   height: 100, name: "Kelly" },
    { id: 18, type: "other", height: 150, name: "Xbar" },
    { id: 19, type: "other", height: 150, name: "Xbar" },
    { id: 20, type: "cat",   height: 100, name: "Larry" },
    { id: 21, type: "other", height: 150, name: "Xbar" },
    { id: 22, type: "cat",   height: 100, name: "Manny" },
    { id: 23, type: "dog",   height:  50, name: "Nathan" },
    { id: 24, type: "cat",   height: 100, name: "Ophelia" },
    { id: 25, type: "dog",   height:  50, name: "Patrick" },
    { id: 26, type: "other", height: 150, name: "Xbar" },
    { id: 27, type: "other", height: 150, name: "Xbar" },
    { id: 28, type: "other", height: 150, name: "Xbar" },
    { id: 29, type: "other", height: 150, name: "Xbar" },
    { id: 30, type: "other", height: 150, name: "Xbar" },
    { id: 31, type: "cat",   height: 100, name: "Quincy" },
    { id: 32, type: "dog",   height:  50, name: "Roger" },
  ];

  view = Ember.ListView.create({
    content: Em.A(content),
    height: 300,
    width: 500,
    rowHeight: 100,
    itemViews: {
      cat: Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("Meow says {{name}} expected: cat === {{type}} {{id}}")
      }),
      dog: Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("Woof says {{name}} expected: dog === {{type}} {{id}}")
      }),
      other: Ember.ListItemView.extend({
        template: Ember.Handlebars.compile("Potato says {{name}} expected: other === {{type}} {{id}}")
      })
    },
    itemViewForIndex: function(idx) {
      return this.itemViews[Ember.A(this.get('content')).objectAt(idx).type];
    },
    heightForIndex: function(idx) {
      return Ember.get(Ember.A(this.get('content')).objectAt(idx), 'height');
    }
  });

  appendView();

  equal(view.get('totalHeight'), 3350);

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 5);

  var i, contentIdx;

  equal(Ember.$(positionSorted[0]).text(), "Meow says Andrew expected: cat === cat 1");
  equal(Ember.$(positionSorted[1]).text(), "Meow says Bruce expected: cat === cat 3");
  equal(Ember.$(positionSorted[2]).text(), "Potato says Xbar expected: other === other 4");
  equal(Ember.$(positionSorted[3]).text(), "Woof says Caroline expected: dog === dog 5");

  deepEqual(helper.itemPositions(view), [
    { x:0, y:    0 }, // <-- in view
    { x:0, y:  100 }, // <-- in view
    { x:0, y:  200 }, // <-- in view
    { x:0, y:  350 }, // <-- buffer
    { x:0, y:  400 }  // <-- buffer
  ], 'went beyond scroll max via overscroll');

  Ember.run(view, 'scrollTo', 1000);
  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(Ember.$(positionSorted[0]).text(), "Potato says Xbar expected: other === other 12");
  equal(Ember.$(positionSorted[1]).text(), "Woof says Harry expected: dog === dog 13");
  equal(Ember.$(positionSorted[2]).text(), "Meow says Ingrid expected: cat === cat 14");
  equal(Ember.$(positionSorted[3]).text(), "Potato says Xbar expected: other === other 15");

  deepEqual(helper.itemPositions(view), [
    { x:0, y:  950 }, // <-- partially in view
    { x:0, y: 1100 }, // <-- in view
    { x:0, y: 1150 }, // <-- in view
    { x:0, y: 1250 }, // <-- partially in view
    { x:0, y: 1400 }  // <-- partially in view
  ], 'went beyond scroll max via overscroll');
});

test("with 100% width groups", function() {
  var content = [
    { id: 0, height: 100, width:      100, name: "Andrew"   },
    { id: 1, height: 100, width:      100, name: "Xbar"     },
    { id: 2, height:  25, width: Infinity, name: "Caroline" },
    { id: 3, height: 100, width:      100, name: "David"    },
    { id: 4, height: 100, width: Infinity, name: "Xbar"     },
    { id: 5, height: 100, width: Infinity, name: "Xbar"     },
    { id: 6, height:  25, width:      100, name: "Caroline" },
    { id: 7, height:  25, width:      100, name: "Caroline" },
    { id: 8, height: 100, width:      100, name: "Edward"   },
    { id: 9, height:  25, width:      100, name: "Caroline" }
  ];

  // rowHeight + elementWidth are fallback dimensions
  view = Ember.ListView.create({
    content: Em.A(content),
    height: 100,
    width: 200,
    itemViewClass: Ember.ListItemView.extend({
      template: Ember.Handlebars.compile("{{name}}#{{id}}")
    }),
    heightForIndex: function(idx) {
      return Ember.get(Ember.A(this.get('content')).objectAt(idx), 'height');
    },
    widthForIndex: function (idx) {
      return Ember.get(Ember.A(this.get('content')).objectAt(idx), 'width');
    }
  });

  appendView();

  equal(view.get('totalHeight'), 550);

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 4);

  var i, contentIdx;

  equal(Ember.$(positionSorted[0]).text(), "Andrew#0");
  equal(Ember.$(positionSorted[1]).text(), "Xbar#1");
  equal(Ember.$(positionSorted[2]).text(), "Caroline#2");

  deepEqual(helper.itemPositions(view), [
    { x:   0, y:   0 }, // <-- in view
    { x: 100, y:   0 }, // <-- in view
    { x:  0,  y: 100 }, // <-- buffer
    { x:  0,  y: 125 }, // <-- buffer
  ], '');

  Ember.run(view, 'scrollTo', 100);
  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(Ember.$(positionSorted[0]).text(), 'Xbar#1');
  equal(Ember.$(positionSorted[1]).text(), 'Caroline#2');
  equal(Ember.$(positionSorted[2]).text(), 'David#3');
  equal(Ember.$(positionSorted[3]).text(), 'Xbar#4');

  deepEqual(helper.itemPositions(view), [
    { x: 100, y:   0 }, // <-- in-view
    { x:   0, y: 100 }, // <-- in-view
    { x:   0, y: 125 }, // <-- buffer
    { x:   0, y: 225 }  // <-- buffer
  ], '');
});
