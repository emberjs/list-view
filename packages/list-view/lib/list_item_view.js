var get = Ember.get, set = Ember.set;

// Older Ember support
var backportedInnerString = function(buffer) {
  var content = [], childBuffers = buffer.childBuffers;

  Ember.ArrayPolyfills.forEach.call(childBuffers, function(buffer) {
    var stringy = typeof buffer === 'string';
    if (stringy) {
      content.push(buffer);
    } else {
      buffer.array(content);
    }
  });

  return content.join('');
};

function willInsertElementIfNeeded(view) {
  if (view.willInsertElement) {
    view.willInsertElement();
  }
}

function didInsertElementIfNeeded(view) {
  if (view.didInsertElement) {
    view.didInsertElement();
  }
}

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
    var element, buffer;

    element = get(this, 'element');

    if (!element) { return; }

    this.triggerRecursively('willClearRender');
    this.clearRenderedChildren();

    buffer = Ember.RenderBuffer();
    buffer = this.renderToBuffer(buffer);

    this.invokeRecursively(willInsertElementIfNeeded);

    element.innerHTML = buffer.innerString ? buffer.innerString() : backportedInnerString(buffer);

    set(this, 'element', element);

    this.transitionTo('inDOM', get(this, 'children'));

    this.invokeRecursively(didInsertElementIfNeeded);

    this._updateStyle();
  }, 'context'),

  serialize: Ember.K,
  prepareForReuse: Ember.K
});
