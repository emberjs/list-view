import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {registerListViewHelpers} from 'ember-list-view/helper';
import ListItemView from 'ember-list-view/list-item-view';
import {compile, generateContent, sortElementsByPosition} from '../helpers/helpers';

registerListViewHelpers();

moduleForView('toplevel', 'list-view integration - content', {});

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

moduleForView('list-view', 'list-view integration - content', {});

test("replacing the list content", function(assert) {
  var content = generateContent(100);
  var height = 500;
  var rowHeight = 50;

  var itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(()=>{
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  Ember.run(function(){
    view.set('content', Ember.A([{name: 'The only item'}]));
  });

  assert.equal(this.$('.ember-list-item-view').length, 1, "The rendered list was updated");
  assert.equal(this.$('.ember-list-container').height(), 50, "The scrollable view has the correct height");
});

test("adding to the front of the list content", function(assert) {
  var content = generateContent(100);
  var height = 500;
  var rowHeight = 50;
  var itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(()=>{
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  Ember.run(function() {
    content.unshiftObject({name: "Item -1"});
  });

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(Ember.$(positionSorted[0]).text(), "Item -1", "The item has been inserted in the list");
  assert.equal(this.$('.ember-list-container').height(), 5050, "The scrollable view has the correct height");
});

test("inserting in the middle of visible content", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(()=>{
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  Ember.run(function() {
    content.insertAt(2, {name: "Item 2'"});
  });

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(Ember.$(positionSorted[0]).text(), "Item 1", "The item has been inserted in the list");
  assert.equal(Ember.$(positionSorted[2]).text(), "Item 2'", "The item has been inserted in the list");
});

test("clearing the content", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(()=>{
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  Ember.run(function() {
    content.clear();
  });

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(positionSorted.length, 0, "The list should not contain any elements");
});

test("deleting the first element", function(assert) {
  var content = generateContent(100),
    height = 500,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      template: compile("{{name}}")
    });

  var view;
  Ember.run(()=>{
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass
    });
  });

  this.render();

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(Ember.$(positionSorted[0]).text(), "Item 1", "The item has been inserted in the list");

  Ember.run(function() {
    content.removeAt(0);
  });

  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(Ember.$(positionSorted[0]).text(), "Item 2", "The item has been inserted in the list");
});

