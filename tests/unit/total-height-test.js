import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {registerListViewHelpers} from 'list-view/helper';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

import ListItemView from 'list-view/list_item_view';
import ListView from 'list-view/list_view';
import ReusableListItemView from 'list-view/reusable_list_item_view';

moduleForView('list-view', 'totalHeight', {});

test("single column", function(assert){
  var height = 500, rowHeight = 50;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: height,
      rowHeight: rowHeight,
      content: generateContent(20)
    });
  });

  assert.equal(view.get('totalHeight'), 1000);
});

test("even", function(assert){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: height,
      rowHeight: rowHeight,
      content: generateContent(20),
      width: width,
      elementWidth: elementWidth
    });
  });

  assert.equal(view.get('totalHeight'), 500);
});

test("odd", function(assert){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: height,
      rowHeight: rowHeight,
      content: generateContent(21),
      width: width,
      elementWidth: elementWidth
    });
  });

  assert.equal(view.get('totalHeight'), 550);
});

test("with bottomPadding", function(assert){
  var height = 500, rowHeight = 50, width = 100, elementWidth = 50;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      height: height,
      rowHeight: rowHeight,
      content: generateContent(20),
      width: width,
      elementWidth: elementWidth,
      bottomPadding: 25
    });
  });

  assert.equal(view.get('totalHeight'), 525);
});
