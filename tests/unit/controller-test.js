import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

var template = compile(
  `<a {{action 'wat'}} href='#'>
  <span class='controller'>{{foo}}</span>
  <span class='context'>{{name}}</span></a>`
);

moduleForView("list-view", "controllers", {});

test("parent controller", function(assert) {
  var watWasCalled = false;

  var controller;
  Ember.run(()=>{
    controller = Ember.Controller.extend({
      foo: 'bar',
      actions: {
        wat: function() {
          watWasCalled = true;
        }
      }
    }).create();
  });

  var content = Ember.A([
    { name: 'entry' }
  ]);

  var listView;
  Ember.run(this, function(){
    listView = this.subject({
      itemViewClass: ReusableListItemView.extend({
        template: template
      }),
      height: 500,
      rowHeight: 50,
      content: content
    });
  });

  this.render({
    controller: controller
  });

  assert.equal(listView.get('controller'), controller);
  assert.equal(listView.get('childViews.firstObject.controller'), controller);

  assert.equal(this.$('a .controller').text(), '');
  assert.equal(this.$('a .context').text(), 'entry');

  this.$('a').trigger('click');

  assert.ok(watWasCalled, 'expected correct action bubbling');
});

test("itemController", function(assert) {
  var container = this.container;
  var watWasCalled = false;

  container.register('controller:item', Ember.ObjectController.extend({
    foo: 'bar',
    actions: {
      wat: function() {
        watWasCalled = true;
      }
    }
  }));

  var controller, listView;

  Ember.run(this, function(){
    controller = Ember.ArrayController.create({
      content: Ember.A([ { name: 'entry' } ]),
      itemController: 'item',
      container: container
    });
    listView = this.subject({
      itemViewClass: ReusableListItemView.extend({
        template: template
      }),
      height: 500,
      rowHeight: 50,
      content: controller,
      container: container
    });
  });

  this.render({
    controller: controller
  });

  assert.equal(listView.$('a .controller').text(), 'bar');
  assert.equal(listView.$('a .context').text(), 'entry');

  assert.equal(listView.get('childViews.firstObject.controller.foo'), 'bar');

  this.$('a').trigger('click');

  assert.ok(watWasCalled, 'expected correct action bubbling');
});
