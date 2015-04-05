import Ember from 'ember';
import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';

export default ListView.extend({
  height: 300,
  width: 500,
  rowHeight: 100,
  itemViews: {
    "cat" : ListItemView.extend({
      classNames: ['cat'],
      rowHeight: 100,
      templateName: 'cat'
    }),
    "dog" : ListItemView.extend({
      classNames: ['dog'],
      rowHeight: 50,
      templateName: 'dog'
    }),
    "other" : ListItemView.extend({
      classNames: ['other'],
      rowHeight: 150,
      templateName: 'other'
    })
  },
  heightForIndex: function(idx){
    return this.itemViewForIndex(idx).proto().rowHeight;
  },
  itemViewForIndex: function(idx){
    return this.itemViews[this.get('content').objectAt(idx).type];
  }
});
