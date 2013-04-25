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

    // check again for childViews, since rendering may have added some
    hasChildViews = this._childViews.length > 0;

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
  var element, position;//, _position;

  element = get(this, 'element');
  position = get(this, 'position');
  // _position = this._position;

  if (!element) { return; }
  // if (samePosition(position, _position)) { return; }

  this.applyTransform(element, position);

  // this._position = position;
}

/**
  The `Ember.ListViewItem` view class renders a
  [div](https://developer.mozilla.org/en/HTML/Element/div) HTML element
  with `ember-list-item-view` class. It allows you to specify a custom item
  handlebars template for `Ember.ListView`.

  Example:

  ```handlebars
  <script type="text/x-handlebars" data-template-name="row_item">
    {{name}}
  </script>
  ```

  ```javascript
  App.ListView = Ember.ListView.extend({
    height: 500,
    rowHeight: 20,
    itemViewClass: Ember.ListItemView.extend({templateName: "row_item"})
  });
  ```

  @extends Ember.View
  @class ListItemView
  @namespace Ember
*/
Ember.ListItemView = Ember.View.extend({
  init: function(){
    this._super();
    this.on('didInsertElement', updateStyle);
  },
  classNames: ['ember-list-item-view'],

  _position: null,
  _updateStyle: updateStyle,
  _contextDidChange: Ember.observer(rerender, 'context'),

  applyTransform: Ember.ListViewHelper.applyTransform,
  positionDidChange: Ember.observer(updateStyle, 'position')
});

Ember.ReusableListItemView = Ember.View.extend({
  init: function(){
    this._super();
    this.on('didInsertElement', updateStyle);
    this.set('context', Ember.ObjectProxy.create());
  },
  updateContext: function(newContext){
    this.set('context.content', newContext);
  },
  classNames: ['ember-list-item-view'],
  _positionDidChange: Ember.observer(updateStyle, 'position'),
  _position: null,
  _updateStyle: updateStyle,
  applyTransform: Ember.ListViewHelper.applyTransform,
  render: function(buffer) {
    console.log('render');
    return this._super(buffer);
  }
});
