require('list-view/list_view_helper');

var get = Ember.get, set = Ember.set;

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

function rerender() {
  var element, buffer, context, hasChildViews;

  element = get(this, 'element');

  if (!element) { return; }

  context = get(this, 'context');
  hasChildViews = this._childViews.length > 0;

  if (hasChildViews) {
    this.triggerRecursively('willClearRender');
    this.clearRenderedChildren();
  }

  if (context) {
    buffer = Ember.RenderBuffer();
    buffer = this.renderToBuffer(buffer);

    if (hasChildViews) {
      this.invokeRecursively(willInsertElementIfNeeded, false);
    }

    element.innerHTML = buffer.innerString ? buffer.innerString() : backportedInnerString(buffer);

    set(this, 'element', element);

    this.transitionTo('inDOM');

    if (hasChildViews) {
      this.invokeRecursively(didInsertElementIfNeeded, false);
    }

    this._updateStyle();
  } else {
    element.innerHTML = ''; // when there is no context, this view should be completely empty
  }
}

function updateStyle() {
  var element, position, _position;

  element = get(this, 'element');
  position = get(this, 'position');
  _position = this._position;

  if (!element) { return; }
  if (samePosition(position, _position)) { return; }

  this.applyTransform(element, position);

  this._position = position;
}

/**
  ListItemView

  @class ListItemView
  @namespace Ember
*/
Ember.ListItemView = Ember.View.extend({
  classNames: ['ember-list-item-view'],

  _position: null,
  _updateStyle: updateStyle,
  _contextDidChange: Ember.observer(rerender, 'context'),

  applyTransform: Ember.ListViewHelper.applyTransform,
  positionDidChange: Ember.observer(updateStyle, 'position'),
  didInsertElement: updateStyle,

  prepareForReuse: function() {
    this._position = null;
  }
});
