var get = Ember.get, set = Ember.set;

function samePosition(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

function positionElement() {
  var element, position, _position;

  Ember.instrument('view.updateContext.positionElement', this, function() {
    element = get(this, 'element');
    position = this.position;
    _position = this._position;

    if (!position || !element) { return; }

    // TODO: avoid needing this by avoiding unnecessary
    // calls to this method in the first place
    if (samePosition(position, _position)) { return; }
    Ember.run.schedule('render', this, this._parentView.applyTransform, element, position.x, position.y);
    this._position = position;
  }, this);
}

Ember.ListItemViewMixin = Ember.Mixin.create({
  init: function(){
    this._super();
    this.one('didInsertElement', positionElement);
  },
  classNames: ['ember-list-item-view'],
  _position: null,
  updatePosition: function(position) {
    this.position = position;
    this._positionElement();
  },
  _positionElement: positionElement
});
