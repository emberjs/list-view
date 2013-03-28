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
    var element, position;

    element = get(this, 'element');
    position = get(this, 'position');

    if (!element) { return; }

    applyTransform(element, position);

    this._position = position;
  },

  positionDidChange: Ember.observer(function(){
    var position, _position;

    position = get('position');
    _position = this._position;

    if (samePosition(position, _position)) { return; }

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
    element.innerHTML = buffer.innerString();

    set(this, 'element', element);

    this._updateStyle();
  }, 'context'),

  prepareForReuse: function() {
    this._position = null;
  }
});
