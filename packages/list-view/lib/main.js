import ReusableListItemView from 'list-view/reusable_list_item_view';
import VirtualListView from 'list-view/virtual_list_view';
import ListItemView from 'list-view/list_item_view';
import { EmberList, EmberVirtualList } from 'list-view/helper';
import ListView from 'list-view/list_view';
import ListViewHelper from 'list-view/list_view_helper';

Ember.ReusableListItemView = ReusableListItemView;
Ember.VirtualListView      = VirtualListView;
Ember.ListItemView         = ListItemView;
Ember.ListView             = ListView;
Ember.ListViewHelper       = ListViewHelper;

var registerHelper;
if (Ember.HTMLBars) {
  // registerHelper was used for some 1.10-beta's and _registerHelper is for 1.10.0 final.
  registerHelper = Ember.HTMLBars._registerHelper || Ember.HTMLBars.registerHelper;
} else {
  registerHelper = Ember.Handlebars.registerHelper;
}
registerHelper('ember-list', EmberList);
registerHelper('ember-virtual-list', EmberVirtualList);
