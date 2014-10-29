window.App = Ember.Application.create();

// for debugging
App.ApplicationView = Ember.View.extend({
  didInsertElement: function(){
    window.list = Ember.View.views[$('.ember-list-view').attr('id')];
  },
});

App.ApplicationController = Ember.ArrayController.extend({
  queryParams: [
    'height',
    'width',
    'rowHeight',
    'itemCount',
    'elementWidth'
  ],
  height:    300,
  width:     500,
  rowHeight: 100,
  itemCount: 1000,
  maxItemCount: 99999,
  elementWidth: 100,
  items: Ember.computed('model.length', 'itemCount', function(key) {
    return this.get('model').slice(0, this.get('itemCount')); 
  }).readOnly()
});

App.ListView = Ember.ListView.extend({
  itemViewClass: Ember.ListItemView.extend({
    templateName: "list-item"
  }),
});

App.ApplicationRoute = Ember.Route.extend({
  model: function() {
    var content = [], entry;
    for (var i = 0; i < 10000; i++) {
      entry = window.data[i % window.data.length];
      entry = JSON.parse(JSON.stringify(entry));
      entry.id = i;
      entry.name = entry.name + (i+1);
      content.push(entry);
    }
    return content;
  }
});
