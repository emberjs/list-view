var get = Ember.get, set = Ember.set;

Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],

  _updateStyle: function() {
    var e = get(this, 'element');
    if (e) { // FIXME
      var top = get(this, 'top');
      if (this._lastTop !== top) {
        e.style.top = top + 'px';
        // e.style.webkitTransform = 'translate3d(0, ' + top + 'px, 0)'
        this._lastTop = top;
      }
    }
  },

  didInsertElement: function() {
    this._updateStyle();
  },

  _contextDidChange: Ember.observer(function() {
    var element = get(this, 'element');
    if (!element) { return; }
    var buffer = Ember.RenderBuffer();
    buffer = this.renderToBuffer(buffer);
    element.innerHTML = buffer.innerString();
    set(this, 'element', element);
    this._updateStyle();
  }, 'context'),

  serialize: Ember.K,
  prepareForReuse: Ember.K
});
