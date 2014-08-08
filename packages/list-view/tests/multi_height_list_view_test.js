var css, view, helper;
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView - Multi-height", {
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
  equal(view.$('.ember-list-item-view').length, 4);

  var i, contentIdx;

  equal(Ember.$(positionSorted[0]).text(), "Meow says Andrew expected: cat === cat 1");
  equal(Ember.$(positionSorted[1]).text(), "Meow says Bruce expected: cat === cat 3");
  equal(Ember.$(positionSorted[2]).text(), "Potato says Xbar expected: other === other 4");
  equal(Ember.$(positionSorted[3]).text(), "Woof says Caroline expected: dog === dog 5");

  deepEqual(helper.itemPositions(view), [
    { x:0, y:    0 }, // <-- in view
    { x:0, y:  100 }, // <-- in view
    { x:0, y:  200 }, // <-- in view
    { x:0, y:  350 }  // <-- buffer
  ], 'went beyond scroll max via overscroll');

  Ember.run(view, 'scrollTo', 1000);
  positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));

  equal(Ember.$(positionSorted[0]).text(), "Potato says Xbar expected: other === other 12");
  equal(Ember.$(positionSorted[1]).text(), "Woof says Harry expected: dog === dog 13");
  equal(Ember.$(positionSorted[2]).text(), "Meow says Ingrid expected: cat === cat 14");
  equal(Ember.$(positionSorted[3]).text(), "Potato says Xbar expected: other === other 15");

  deepEqual(helper.itemPositions(view), [
    { x:0, y: 950 }, // <-- partially in view
    { x:0, y: 1100 }, // <-- in view
    { x:0, y: 1150 }, // <-- in view
    { x:0, y: 1250 }  // <-- partially in view
  ], 'went beyond scroll max via overscroll');
});

test("Correct height based on view", function() {
  var content = [
    { id:  1, type: "cat",   name: "Andrew" },
    { id:  3, type: "cat",   name: "Bruce" },
    { id:  4, type: "other", name: "Xbar" },
    { id:  5, type: "dog",   name: "Caroline" },
    { id:  6, type: "cat",   name: "David" },
    { id:  7, type: "other", name: "Xbar" },
    { id:  8, type: "other", name: "Xbar" },
    { id:  9, type: "dog",   name: "Edward" },
    { id: 10, type: "dog",   name: "Francis" },
    { id: 11, type: "dog",   name: "George" },
    { id: 12, type: "other", name: "Xbar" },
    { id: 13, type: "dog",   name: "Harry" },
    { id: 14, type: "cat",   name: "Ingrid" },
    { id: 15, type: "other", name: "Xbar" },
    { id: 16, type: "cat",   name: "Jenn" },
    { id: 17, type: "cat",   name: "Kelly" },
    { id: 18, type: "other", name: "Xbar" },
    { id: 19, type: "other", name: "Xbar" },
    { id: 20, type: "cat",   name: "Larry" },
    { id: 21, type: "other", name: "Xbar" },
    { id: 22, type: "cat",   name: "Manny" },
    { id: 23, type: "dog",   name: "Nathan" },
    { id: 24, type: "cat",   name: "Ophelia" },
    { id: 25, type: "dog",   name: "Patrick" },
    { id: 26, type: "other", name: "Xbar" },
    { id: 27, type: "other", name: "Xbar" },
    { id: 28, type: "other", name: "Xbar" },
    { id: 29, type: "other", name: "Xbar" },
    { id: 30, type: "other", name: "Xbar" },
    { id: 31, type: "cat",   name: "Quincy" },
    { id: 32, type: "dog",   name: "Roger" },
  ];

  view = Ember.ListView.create({
    content: Em.A(content),
    height: 300,
    width: 500,
    rowHeight: 100,
    itemViews: {
      cat: Ember.ListItemView.extend({
        rowHeight: 100,
        template: Ember.Handlebars.compile("Meow says {{name}} expected: cat === {{type}} {{id}}")
      }),
      dog: Ember.ListItemView.extend({
        rowHeight: 50,
        template: Ember.Handlebars.compile("Woof says {{name}} expected: dog === {{type}} {{id}}")
      }),
      other: Ember.ListItemView.extend({
        rowHeight: 150,
        template: Ember.Handlebars.compile("Potato says {{name}} expected: other === {{type}} {{id}}")
      })
    },
    itemViewForIndex: function(idx){
      return this.itemViews[Ember.get(Ember.A(this.get('content')).objectAt(idx), 'type')];
    },
    heightForIndex: function(idx) {
      // proto() is a quick hack, lets just store this on the class..
      return this.itemViewForIndex(idx).proto().rowHeight;
    }
  });

  appendView();

  equal(view.get('totalHeight'), 3350);

  var positionSorted = helper.sortElementsByPosition(view.$('.ember-list-item-view'));
  equal(view.$('.ember-list-item-view').length, 4);

  var i, contentIdx;

  equal(Ember.$(positionSorted[0]).text(), "Meow says Andrew expected: cat === cat 1");
  equal(Ember.$(positionSorted[1]).text(), "Meow says Bruce expected: cat === cat 3");
  equal(Ember.$(positionSorted[2]).text(), "Potato says Xbar expected: other === other 4");
  equal(Ember.$(positionSorted[3]).text(), "Woof says Caroline expected: dog === dog 5");

  deepEqual(helper.itemPositions(view), [
    { x:0, y:    0 }, // <-- in view
    { x:0, y:  100 }, // <-- in view
    { x:0, y:  200 }, // <-- in view
    { x:0, y:  350 }  // <-- buffer
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
    { x:0, y: 1250 }  // <-- partially in view
  ], 'went beyond scroll max via overscroll');
});




test("_numChildViewsForViewport + _startingIndex with multi-height", function() {
  var content = [
    { id:  1, type: "cat",   name: "Andrew" },
    { id:  3, type: "cat",   name: "Bruce" },
    { id:  4, type: "other", name: "Xbar" },
    { id:  5, type: "dog",   name: "Caroline" },
    { id:  6, type: "cat",   name: "David" },
    { id:  7, type: "other", name: "Xbar" },
    { id:  8, type: "other", name: "Xbar" },
    { id:  9, type: "dog",   name: "Edward" },
    { id: 10, type: "dog",   name: "Francis" },
    { id: 11, type: "dog",   name: "George" },
    { id: 12, type: "other", name: "Xbar" },
    { id: 13, type: "dog",   name: "Harry" },
    { id: 14, type: "cat",   name: "Ingrid" },
    { id: 15, type: "other", name: "Xbar" },
    { id: 16, type: "cat",   name: "Jenn" },
    { id: 17, type: "cat",   name: "Kelly" },
    { id: 18, type: "other", name: "Xbar" },
    { id: 19, type: "other", name: "Xbar" },
    { id: 20, type: "cat",   name: "Larry" },
    { id: 21, type: "other", name: "Xbar" },
    { id: 22, type: "cat",   name: "Manny" },
    { id: 23, type: "dog",   name: "Nathan" },
    { id: 24, type: "cat",   name: "Ophelia" },
    { id: 25, type: "dog",   name: "Patrick" },
    { id: 26, type: "other", name: "Xbar" },
    { id: 27, type: "other", name: "Xbar" },
    { id: 28, type: "other", name: "Xbar" },
    { id: 29, type: "other", name: "Xbar" },
    { id: 30, type: "other", name: "Xbar" },
    { id: 31, type: "cat",   name: "Quincy" },
    { id: 32, type: "dog",   name: "Roger" },
  ];

  view = Ember.ListView.create({
    content: Em.A(content),
    height: 300,
    width: 500,
    rowHeight: 100,
    itemViews: {
      cat: Ember.ListItemView.extend({
        rowHeight: 100,
        template: Ember.Handlebars.compile("Meow says {{name}} expected: cat === {{type}} {{id}}")
      }),
      dog: Ember.ListItemView.extend({
        rowHeight: 50,
        template: Ember.Handlebars.compile("Woof says {{name}} expected: dog === {{type}} {{id}}")
      }),
      other: Ember.ListItemView.extend({
        rowHeight: 150,
        template: Ember.Handlebars.compile("Potato says {{name}} expected: other === {{type}} {{id}}")
      })
    },
    itemViewForIndex: function(idx){
      return this.itemViews[Ember.get(Ember.A(this.get('content')).objectAt(idx), 'type')];
    },
    heightForIndex: function(idx) {
      // proto() is a quick hack, lets just store this on the class..
      return this.itemViewForIndex(idx).proto().rowHeight;
    }
  });

  appendView();

  equal(view._numChildViewsForViewport(), 4, 'expected _numChildViewsForViewport to be correct (before scroll)');
  equal(view._startingIndex(), 0, 'expected _startingIndex to be correct (before scroll)');

  // entries: 1, 3, 4, 5

  Ember.run(view, 'scrollTo', 1000);

  // entries: 12, 13, 14, 15

  equal(view._numChildViewsForViewport(), 5, 'expected _numChildViewsForViewport to be correct (after scroll)');
  equal(view._startingIndex(), 10, 'expected _startingIndex to be correct (after scroll)');
});
