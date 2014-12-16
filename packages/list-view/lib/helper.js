import EmberListView from './list_view';
import EmberVirtualListView from './virtual_list_view';

function createHelper (view, options) {
  var hash = options.hash;
  var types = options.hashTypes;

  hash.content = hash.items;
  delete hash.items;

  types.content = types.items;
  delete types.items;

  if (!hash.content) {
    hash.content = 'this';
    types.content = 'ID';
  }

  for (var prop in hash) {
    if (/-/.test(prop)) {
      var camelized = Ember.String.camelize(prop);
      hash[camelized] = hash[prop];
      types[camelized] = types[prop];
      delete hash[prop];
      delete types[prop];
    }
  }

  /*jshint validthis:true */
  return Ember.Handlebars.helpers.collection.call(this, view, options);
}

export function EmberList (options) {
  return createHelper.call(this, EmberListView, options);
}

export default EmberList;

export function EmberVirtualList (options) {
  return createHelper.call(this, EmberVirtualListView, options);
}
