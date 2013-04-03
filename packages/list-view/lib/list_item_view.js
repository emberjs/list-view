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

function samePosition(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],
  _position: null,

  _updateStyle: function() {
    var element, position, _position;

    element = get(this, 'element');
    position = get(this, 'position');
    _position = this._position;

    if (!element) { return; }
    if (samePosition(position, _position)) { return; }

    applyTransform(element, position);

    this._position = position;
  },

  positionDidChange: Ember.observer(function(){
    this._updateStyle();
  }, 'position'),

  didInsertElement: function() {
    this._updateStyle();
  },

  _contextDidChange: Ember.observer(function() {
    var element, buffer;

    element = get(this, 'element');
    if (!element) { return; }

    buffer = Ember.RenderBuffer();
    buffer = this.renderToBuffer(buffer);

    element.innerHTML = buffer.innerString ? buffer.innerString() : buffer.childBuffers.join('');

    this._position = null;
    set(this, 'element', element);

    this._updateStyle({ force: true });
  }, 'context'),

  prepareForReuse: function() {
    this._position = null;
  }
});
