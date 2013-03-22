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

Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],

  _updateStyle: function() {
    var element, position;

    element = get(this, 'element');
    position = get(this, 'position');

    if (!element) { return; }
    applyTransform(element, position);
  },

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

  prepareForReuse: Ember.K
});
