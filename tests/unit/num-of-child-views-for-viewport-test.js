import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

moduleForView('list-view', 'numOfChildViewsForViewport', {});

test("computing the number of child views to create with scrollTop zero", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: 500,
      rowHeight: 50,
      content: Ember.A()
    });
  });

  assert.equal(view._numChildViewsForViewport(), 11);
});

test("computing the number of child views to create after when scroll down a bit", function(assert) {
  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: 500,
      rowHeight: 50,
      scrollTop: 51,
      content: Ember.A()
    });
  });

  assert.equal(view._numChildViewsForViewport(), 11);
});

