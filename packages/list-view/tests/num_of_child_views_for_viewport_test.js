var view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}

module("Ember.ListView unit: - numOfChildViewsForViewport", {
  teardown: function() {
    Ember.run(function() {
      if (view) { view.destroy(); }
    });
  }
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

