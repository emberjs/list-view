Ember.Handlebars.registerHelper('ember-list', function emberList(options) {
  var hash = options.hash;
  var types = options.hashTypes;

  hash.content = hash.items;
  delete hash.items;

  types.content = types.items;
  delete types.items;

  if (!hash.content) {
    hash.content = "this";
    types.content = "ID";
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

  return Ember.Handlebars.helpers.collection.call(this, 'Ember.ListView', options);
});

