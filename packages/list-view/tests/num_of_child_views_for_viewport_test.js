var view, helper;
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

var content = [];
for (var i = 0; i < 20; i++) {
  content[i] = {
    id: i
  };
}

test("computing the number of child views to create with scrollTop zero", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    content: Ember.A()
  });

  equal(view._numChildViewsForViewport(), 0);
});

test("computing the number of child views to create after when scroll down a bit", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    scrollTop: 51,
    content: Ember.A()
  });
  equal(view._numChildViewsForViewport(), 0);
});

test("computing the number of child views to create with scrollTop zero (With content)", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    content: Ember.A(content)
  });

  equal(view._numChildViewsForViewport(), 11);
});

test("computing the number of child views to create after when scroll down a bit (with content)", function() {
  view = Ember.ListView.create({
    height: 500,
    rowHeight: 50,
    scrollTop: 51,
    content: Ember.A(content)
  });
  equal(view._numChildViewsForViewport(), 11);
});

