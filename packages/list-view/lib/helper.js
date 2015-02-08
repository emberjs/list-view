import EmberListView from './list_view';
import EmberVirtualListView from './virtual_list_view';

var EmberVirtualList = createHelper(EmberVirtualListView);
var EmberList = createHelper(EmberListView);

export { EmberList as default, EmberVirtualList};

function createHelper(view) {
  return function (params, hash, options, env) {
    hash.content = hash.items;
    delete hash.items;

    for (var prop in hash) {
      if (/-/.test(prop)) {
        var camelized = Ember.String.camelize(prop);
        hash[camelized] = hash[prop];
        delete hash[prop];
      }
    }

    /*jshint validthis:true */
    return Ember.HTMLBars.helpers.collection.helperFunction.call(this, [view], hash, options, env);
  };
}