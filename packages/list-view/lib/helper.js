import EmberListView from './list_view';
import EmberVirtualListView from './virtual_list_view';

export function EmberList (params, hash, options, env) {
  hash.content = hash.items;
  delete hash.items;

  /*jshint validthis:true */
  return Ember.HTMLBars.helpers.collection.helperFunction.call(this, [EmberListView], hash, options, env);
}

export function EmberVirtualList (params, hash, options, env) {
  hash.content = hash.items;
  delete hash.items;

  /*jshint validthis:true */
  return Ember.HTMLBars.helpers.collection.helperFunction.call(this, [EmberVirtualListView], hash, options, env);
}

export default EmberList;
