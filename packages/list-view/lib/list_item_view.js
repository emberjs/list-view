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
  } else {
    element.innerHTML = ''; // when there is no context, this view should be completely empty
  }
}

function positionElement() {
  var element, position, _position;

  element = get(this, 'element');
  position = get(this, 'position');
  _position = this._position;

  if (!position) { return; }
  if (!element) { return; }

  // TODO: avoid needing this by avoiding unnecessary
  // calls to this method in the first place
  if (samePosition(position, _position)) { return; }
  this.applyTransform(element, position);

  this._position = position;
}

Ember.ListItemViewMixin = Ember.Mixin.create({
  init: function(){
    this._super();
    this.one('didInsertElement', positionElement);
  },
  classNames: ['ember-list-item-view'],
  _position: null,
  _positionDidChange: Ember.observer(positionElement, 'position'),
  _positionElement: positionElement,
  applyTransform: Ember.ListViewHelper.applyTransform
});

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
Ember.ListItemView = Ember.View.extend(Ember.ListItemViewMixin, {
  updateContext: function(newContext){
    var context = get(this, 'context');
    if (context !== newContext) {
      set(this, 'context', newContext);
    }
  },
  _contextDidChange: Ember.observer(rerender, 'context'),
  positionDidChange: Ember.observer(positionElement, 'position'),
  _positionElement: positionElement,
  applyTransform: Ember.ListViewHelper.applyTransform
});

var BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

Ember.ReusableListItemView = Ember.View.extend(Ember.ListItemViewMixin, {
  init: function(){
    this._super();
    this.set('context', Ember.ObjectProxy.create());
  },
  isVisible: Ember.computed('context.content', function(){
    return !!this.get('context.content');
  }),
  updateContext: function(newContext){
    var context = get(this, 'context.content');
    if (context !== newContext) {
      this.prepareForReuse();
      set(this, 'context.content', newContext);
    }
  },
  prepareForReuse: function(){
    var $img = this.$('img');
    if ($img) {
      $img.attr('src', BLANK_GIF);
    }
  }
});
