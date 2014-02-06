var css, view, helper;
require('list-view/~tests/test_helper');
helper = window.helper;

function appendView() {
  Ember.run(function() {
    view.appendTo('#qunit-fixture');
  });
}
var template = Ember.Handlebars.compile("<a {{action 'wat'}}" +
    " href='#'><span class='controller'>{{foo}}</span>" +
    "<span class='context'>{{name}}</span></a>");

var dispatcher;
module("Ember.ListView controllers", {
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

    dispatcher = Ember.EventDispatcher.create();
    dispatcher.setup();
  },
  teardown: function() {
    css.remove();

    Ember.run(function() {
      dispatcher.destroy();
      if (view) { view.destroy(); }
    });

    Ember.ENABLE_PROFILING = false;
  }
});

test("parent controller", function() {
  var watWasCalled = false;
  var controller = Ember.Controller.extend({
    foo: 'bar',
    actions: {
      wat: function() {
        watWasCalled = true;
      }
    }
  }).create();

  view = Ember.ContainerView.create({
    controller: controller
  });

  var content = Ember.A([
    { name: 'entry' }
  ]);

  var listView = view.createChildView(Ember.ListView.extend({
    itemViewClass: Ember.ReusableListItemView.extend({
      template: template
    }),
    height: 500,
    rowHeight: 50,
    content: content
  }));

  appendView();

  Ember.run(function(){
    view.pushObject(listView);
  });

  equal(listView.get('controller'), controller);
  equal(listView.get('childViews.firstObject.controller'), controller);

  equal(listView.$('a .controller').text(), '');
  equal(listView.$('a .context').text(), 'entry');

  listView.$('a').trigger('click');

  ok(watWasCalled, 'expected correct action bubbling');
});

test("itemController", function() {
  var container = new Ember.Container();
  var watWasCalled = false;

  container.register('controller:item', Ember.ObjectController.extend({
    foo: 'bar',
    actions: {
      wat: function() {
        watWasCalled = true;
      }
    }
  }));

  var controller = Ember.ArrayController.create({
    content: Ember.A([ { name: 'entry' } ]),
    itemController: 'item',
    container: container
  });

  view = Ember.ContainerView.create();

  var listView = view.createChildView(Ember.ListView.extend({
    itemViewClass: Ember.ReusableListItemView.extend({
      template: template
    }),
    height: 500,
    rowHeight: 50,
    content: controller,
    container: container
  }));

  appendView();

  Ember.run(function(){
    view.pushObject(listView);
  });

  equal(listView.$('a .controller').text(), 'bar');
  equal(listView.$('a .context').text(), 'entry');

  equal(listView.get('childViews.firstObject.controller.foo'), 'bar');

  listView.$('a').trigger('click');

  ok(watWasCalled, 'expected correct action bubbling');
});
