import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';
import ReusableListItemView from 'ember-list-view/reusable-list-item-view';

moduleForView('list-view', 'View recycling', {});

test("recycling complex views long list", function(assert){
  var content = generateContent(100),
    height = 50,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      innerViewClass: Ember.View.extend({
        didInsertElement: function(){
          innerViewInsertionCount++;
        },
        willDestroyElement: function(){
          innerViewDestroyCount++;
        }
      }),
      template: compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
    });

  var listViewInsertionCount, listViewDestroyCount,
    innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0,
      didInsertElement: function() {
        listViewInsertionCount++;
      },
      willDestroyElement: function() {
        listViewDestroyCount++;
      }
    });
  });

  assert.equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  this.render();

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  assert.equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement");

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(50);
  });

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  assert.equal(innerViewInsertionCount, 1, "expected number of innerView's didInsertElement");
  assert.equal(innerViewDestroyCount, 1, "expected number of innerView's willDestroyElement");

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.scrollTo(0);
  });

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  assert.equal(innerViewInsertionCount, 1, "expected number of innerView's didInsertElement");
  assert.equal(innerViewDestroyCount, 1, "expected number of innerView's willDestroyElement");

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement");

});

test("recycling complex views short list", function(assert){
  var content = generateContent(2),
    height = 50,
    rowHeight = 50,
    itemViewClass = ListItemView.extend({
      innerViewClass: Ember.View.extend({
        didInsertElement: function(){
          innerViewInsertionCount++;
        },
        willDestroyElement: function(){
          innerViewDestroyCount++;
        }
      }),
      template: compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
    });

  var listViewInsertionCount, listViewDestroyCount,
    innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0,
      didInsertElement: function() {
        listViewInsertionCount++;
      },
      willDestroyElement: function() {
        listViewDestroyCount++;
      }
    });
  });

  assert.equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");

  this.render();

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  assert.equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(50);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-scroll to 50)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-scroll to 50)");

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(0);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 0)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-scroll to 0)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-scroll to 0)");

});

test("recycling complex views long list, with ReusableListItemView", function(assert){
  var content = generateContent(50),
    height = 50,
    rowHeight = 50,
    itemViewClass = Ember.ReusableListItemView.extend({
      innerViewClass: Ember.View.extend({
        didInsertElement: function(){
          innerViewInsertionCount++;
        },
        willDestroyElement: function(){
          innerViewDestroyCount++;
        }
      }),
      didInsertElement: function(){
        this._super();
        listItemViewInsertionCount++;
      },
      willDestroyElement: function(){
        this._super();
        listItemViewDestroyCount++;
      },
      template: compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
    });

  var listViewInsertionCount, listViewDestroyCount,
    listItemViewInsertionCount, listItemViewDestroyCount,
    innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0,
      didInsertElement: function() {
        listViewInsertionCount++;
      },
      willDestroyElement: function() {
        listViewDestroyCount++;
      }
    });
  });

  assert.equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  this.render();

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  assert.equal(listItemViewInsertionCount, 2, "expected number of listItemView's didInsertElement (post-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  assert.equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(50);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 50)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 50)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(0);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 0)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 0)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 0)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");
});

test("recycling complex views short list, with ReusableListItemView", function(assert){
  var content = generateContent(2),
    height = 50,
    rowHeight = 50,
    itemViewClass = ReusableListItemView.extend({
      innerViewClass: Ember.View.extend({
        didInsertElement: function(){
          innerViewInsertionCount++;
        },
        willDestroyElement: function(){
          innerViewDestroyCount++;
        }
      }),
      didInsertElement: function(){
        this._super();
        listItemViewInsertionCount++;
      },
      willDestroyElement: function(){
        this._super();
        listItemViewDestroyCount++;
      },
      template: compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
    });

  var listViewInsertionCount, listViewDestroyCount,
    listItemViewInsertionCount, listItemViewDestroyCount,
    innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      itemViewClass: itemViewClass,
      scrollTop: 0,
      didInsertElement: function() {
        listViewInsertionCount++;
      },
      willDestroyElement: function() {
        listViewDestroyCount++;
      }
    });
  });

  assert.equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  this.render();

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  assert.equal(listItemViewInsertionCount, 2, "expected number of listItemView's didInsertElement (post-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  assert.equal(innerViewInsertionCount, 2, "expected number of innerView's didInsertElement (post-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(50);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 50)");

  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 50)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 50)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 50)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 50)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(0);

  assert.equal(this.$('.ember-list-item-view').length, 2, "The correct number of rows were rendered (post-scroll to 0)");

  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 0)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 0)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 0)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 0)");
});

test("recycling complex views with ReusableListItemView, handling empty slots at the end of the grid", function(assert){
  var content = generateContent(20),
    height = 150,
    rowHeight = 50,
    width = 100,
    elementWidth = 50,
    itemViewClass = ReusableListItemView.extend({
      innerViewClass: Ember.View.extend({
        didInsertElement: function(){
          innerViewInsertionCount++;
        },
        willDestroyElement: function(){
          innerViewDestroyCount++;
        }
      }),
      didInsertElement: function(){
        this._super();
        listItemViewInsertionCount++;
      },
      willDestroyElement: function(){
        this._super();
        listItemViewDestroyCount++;
      },
      template: compile("{{name}} {{#view view.innerViewClass}}{{/view}}")
    });

  var listViewInsertionCount, listViewDestroyCount,
    listItemViewInsertionCount, listItemViewDestroyCount,
    innerViewInsertionCount, innerViewDestroyCount;

  listViewInsertionCount = 0;
  listViewDestroyCount = 0;

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;

  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  var view;
  Ember.run(this, function(){
    view = this.subject({
      content: content,
      height: height,
      rowHeight: rowHeight,
      width: width,
      elementWidth: elementWidth,
      itemViewClass: itemViewClass,
      scrollTop: 0,
      didInsertElement: function() {
        listViewInsertionCount++;
      },
      willDestroyElement: function() {
        listViewDestroyCount++;
      }
    });
  });

  assert.equal(listViewInsertionCount, 0, "expected number of listView's didInsertElement (pre-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (pre-append)");
  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (pre-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (pre-append)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (pre-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (pre-append)");

  this.render();

  assert.equal(listViewInsertionCount, 1, "expected number of listView's didInsertElement (post-append)");
  assert.equal(listViewDestroyCount, 0, "expected number of listView's willDestroyElement (post-append)");

  assert.equal(listItemViewInsertionCount, 8, "expected number of listItemView's didInsertElement (post-append)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's didInsertElement (post-append)");

  assert.equal(innerViewInsertionCount, 8, "expected number of innerView's didInsertElement (post-append)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's didInsertElement (post-append)");

  assert.equal(this.$('.ember-list-item-view').length, 8, "The correct number of items were rendered (post-append)");
  assert.equal(this.$('.ember-list-item-view:visible').length, 8, "The number of items that are not hidden with display:none (post-append)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  view.scrollTo(350);

  assert.equal(this.$('.ember-list-item-view').length, 8, "The correct number of items were rendered (post-scroll to 350)");
  assert.equal(this.$('.ember-list-item-view:visible').length, 8, "The number of items that are not hidden with display:none (post-scroll to 350)");

  assert.equal(listItemViewInsertionCount, 0, "expected number of listItemView's didInsertElement (post-scroll to 350)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-scroll to 350)");
  assert.equal(innerViewInsertionCount, 0, "expected number of innerView's didInsertElement (post-scroll to 350)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-scroll to 350)");

  listItemViewInsertionCount = 0;
  listItemViewDestroyCount = 0;
  innerViewInsertionCount = 0;
  innerViewDestroyCount = 0;

  Ember.run(function() {
    view.set('width', 150);
  });

  assert.equal(this.$('.ember-list-item-view').length, 12, "The correct number of items were rendered (post-expand to 3 columns)");

  assert.equal(listItemViewInsertionCount, 4, "expected number of listItemView's didInsertElement (post-expand to 3 columns)");
  assert.equal(listItemViewDestroyCount, 0, "expected number of listItemView's willDestroyElement (post-expand to 3 columns)");
  assert.equal(innerViewInsertionCount, 4, "expected number of innerView's didInsertElement (post-expand to 3 columns)");
  assert.equal(innerViewDestroyCount, 0, "expected number of innerView's willDestroyElement (post-expand to 3 columns)");

  assert.equal(this.$('.ember-list-item-view:visible').length, 12, "The number of items that are not hidden with display:none (post-expand to 3 columns)");
});
