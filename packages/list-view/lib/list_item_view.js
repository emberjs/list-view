var get = Ember.get, set = Ember.set;

Ember.ListItemView = Ember.View.extend({
  classNames: ['list-item-view'],

  // Attribute bindings are too slow
  _updateStyle: function() {
    var e = get(this, 'element');
    if (e) { // WHY?
      e.style.top = get(this, 'top') + 'px';
    }
  },

  didInsertElement: function() {
    this._updateStyle();
  },

  serialize: function() {},
  prepareForReuse: function() {}
});
