import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

moduleForView('list-view', 'Multi-height Multi-view', {});

test("Correct view is used for right data type", function(assert) {
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

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: Ember.A(content),
      height: 300,
      width: 500,
      rowHeight: 100,
      itemViews: {
        cat: ListItemView.extend({
          template: compile("Meow says {{name}} expected: cat === {{type}} {{id}}")
        }),
        dog: ListItemView.extend({
          template: compile("Woof says {{name}} expected: dog === {{type}} {{id}}")
        }),
        other: ListItemView.extend({
          template: compile("Potato says {{name}} expected: other === {{type}} {{id}}")
        })
      },
      itemViewForIndex: function(idx){
        return this.itemViews[this.get('content').objectAt(idx).type];
      }
    });
  });

  this.render();

  var positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));
  assert.equal(this.$('.ember-list-item-view').length, 4);

  var i, contentIdx;

  assert.equal(Ember.$(positionSorted[0]).text(), "Meow says Andrew expected: cat === cat 1");
  assert.equal(Ember.$(positionSorted[1]).text(), "Meow says Bruce expected: cat === cat 3");
  assert.equal(Ember.$(positionSorted[2]).text(), "Potato says Xbar expected: other === other 4");
  assert.equal(Ember.$(positionSorted[3]).text(), "Woof says Caroline expected: dog === dog 5");

  assert.deepEqual(itemPositions(view), [
    { x: 0, y:    0 }, // <-- in view
    { x: 0, y:  100 }, // <-- in view
    { x: 0, y:  200 }, // <-- in view
    { x: 0, y:  300 }  // <-- buffer
  ], 'went beyond scroll max via overscroll');

  view.scrollTo(1000);
  positionSorted = sortElementsByPosition(this.$('.ember-list-item-view'));

  assert.equal(Ember.$(positionSorted[0]).text(), "Potato says Xbar expected: other === other 12");
  assert.equal(Ember.$(positionSorted[1]).text(), "Woof says Harry expected: dog === dog 13");
  assert.equal(Ember.$(positionSorted[2]).text(), "Meow says Ingrid expected: cat === cat 14");
  assert.equal(Ember.$(positionSorted[3]).text(), "Potato says Xbar expected: other === other 15");

  assert.deepEqual(itemPositions(view), [
    { x:0, y: 1000 }, // <-- partially in view
    { x:0, y: 1100 }, // <-- in view
    { x:0, y: 1200 }, // <-- in view
    { x:0, y: 1300 }  // <-- partially in view
  ], 'went beyond scroll max via overscroll');
});
