var get = Ember.get, set = Ember.set;

// extract into positiongDelegate
var applyTransform = (function(){
  var element = document.createElement('div');

  if ('webkitTransform' in element.style){
    return function(element, x, y){
      element.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    };
  }else{
    return function(element, x, y){
      element.style.top =  y + 'px';
      element.style.left = x + 'px';
    };
  }
})();

Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],

  _updateStyle: function() {
    var element = get(this, 'element');
    if (!element) { return; }

    var top = get(this, 'top');

    if (this._lastTop !== top) {
      applyTransform(element, 0, top);
      this._lastTop = top;
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
