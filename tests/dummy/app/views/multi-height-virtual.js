import Ember from 'ember';
import VirtualListView from 'list-view/virtual_list_view';
import ListItemView from 'list-view/list_item_view';

export default VirtualListView.extend({
  height: 300,
  width: 500,
  rowHeight: 100,
  itemViews: {
    "cat" : ListItemView.extend({
      rowHeight: 100,
      templateName: 'cat'
    }),
    "dog" : {
      rowHeight: 50
    },
    "other": {
      rowHeight: 150
    }
  },
  heightForIndex: function(idx){
    // TODO: cleanup
    var entry = this.get('content').objectAt(idx);
    var type = this.itemViews[entry.type];

    return type.rowHeight ? type.rowHeight : type.proto().rowHeight;
  },
  itemViewForIndex: function(idx){
    return this.itemViews[this.get('content').objectAt(0).type];
  }
});
