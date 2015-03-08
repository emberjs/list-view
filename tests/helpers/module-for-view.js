import Ember from 'ember';
import TestModule from 'ember-test-helpers/test-module';
import { getResolver } from 'ember-test-helpers/test-resolver';
import { createModule } from 'qunit-module';

var TestModuleForView = TestModule.extend({
  init: function(viewName, description, callbacks) {
    this.viewName = viewName;
    this._super.call(this, 'view:' + viewName, description, callbacks);
    this.setupSteps.push(this.setupView);
  },
  setupView: function() {
    var _this = this;
    var resolver = getResolver();
    var container = this.container;
    var context = this.context;
    var templateName = 'template:' + this.viewName;
    var template = resolver.resolve(templateName);
    if (template) {
      container.register(templateName, template);
      container.injection(this.subjectName, 'template', templateName);
    }
    context.dispatcher = Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    this.callbacks.render = function() {
      var containerView = Ember.ContainerView.create({container: container});
      var view = Ember.run(function(){
        var subject = context.subject();
        containerView.pushObject(subject);
        containerView.appendTo('#ember-testing');
        return subject;
      });
      _this.teardownSteps.unshift(function() {
        Ember.run(function() {
          Ember.tryInvoke(containerView, 'destroy');
        });
      });
      return view.$();
    };
    this.callbacks.append = function() {
      Ember.deprecate('this.append() is deprecated. Please use this.render() instead.');
      return this.callbacks.render();
    };
    context.$ = function() {
      var $view = this.render();
      var subject = this.subject();
      if (arguments.length){
        return subject.$.apply(subject, arguments);
      } else {
        return $view;
      }
    };
  }
});

export default function moduleForView(name, description, callbacks) {
  createModule(TestModuleForView, name, description, callbacks);
}
