var get = Ember.get, set = Ember.set;

// extract into positiongDelegate
var applyTransform = (function(){
  var element = document.createElement('div');

  if ('webkitTransform' in element.style){
    return function(element, position){
      var x = position.x,
          y = position.y;

      element.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    };
  }else{
    return function(element, position){
      var x = position.x,
          y = position.y;

      element.style.top =  y + 'px';
      element.style.left = x + 'px';
    };
  }
})();

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

function samePosition(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

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
  _position: null,

  applyTransform: applyTransform,

  _updateStyle: function() {
    var element, position, _position;

    element = get(this, 'element');
    position = get(this, 'position');
    _position = this._position;

    if (!element) { return; }
    if (samePosition(position, _position)) { return; }

    this.applyTransform(element, position);

    this._position = position;
  },

  positionDidChange: Ember.observer(function(){
    this._updateStyle();
  }, 'position'),

  didInsertElement: function() {
    this._updateStyle();
  },

  // this will eventually go away once rerender becomes
  // less wasteful. (and buggy)
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

  prepareForReuse: function() {
    this._position = null;
  }
});
