import Ember from 'ember';
import EmberListView from './list_view';
import EmberVirtualListView from './virtual_list_view';

export var EmberVirtualList = createHelper(EmberVirtualListView);
export var EmberList = createHelper(EmberListView);

function createHelper(view) {
  if (Ember.HTMLBars) {
    return {
      isHelper: true,
      isHTMLBars: true,
      helperFunction: function listViewHTMLBarsHelper(params, hash, options, env) {
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
        return env.helpers.collection.helperFunction.call(this, [view], hash, options, env);
      }
    };
  }
  return function handlebarsHelperFactory(options) {
    return createHandlebarsHelper.call(this, view, options);
  };
}

function createHandlebarsHelper(view, options) {
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
