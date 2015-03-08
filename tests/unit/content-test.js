import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import generateContent from '../helpers/generate-content';
import {register} from 'list-view/helper';

var compile = Ember.Handlebars.compile;

moduleForView('test', 'list-view integration - content', {
  setup: function() {
    register();
  }
});

test('the ember-list helper', function(assert){
  var view = this.subject({
    controller: {
      model: generateContent(100)
    },
    template: compile(`{{#ember-list items=model height=500 row-height=50}}{{name}}{{/ember-list}}`)
  });

  this.render();

  assert.equal(this.$('.ember-list-item-view').length, 11, "The rendered list was updated");
  assert.equal(this.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");
});

test("the ember-list helper uses items=", function(assert) {

  var view = this.subject({
    controller: { itemz: generateContent(100) },
    template: compile("{{#ember-list items=itemz height=500 rowHeight=50}}{{name}}{{/ember-list}}")
  });

  this.render();

  assert.equal(this.$('.ember-list-item-view').length, 11, "The rendered list was updated");
  assert.equal(this.$('.ember-list-container').height(), 5000, "The scrollable view has the correct height");
});
