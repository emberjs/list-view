require('list-view/list_item_view_mixin');

var get = Ember.get, set = Ember.set;

Ember.ReusableListItemView = Ember.View.extend(Ember.ListItemViewMixin, {
  init: function(){
    this._super();
    var context = Ember.ObjectProxy.create();
    this.set('context', context);
    this._proxyContext = context;
  },
  isVisible: Ember.computed('context.content', function(){
    return !!this.get('context.content');
  }),
  updateContext: function(newContext){
    var context = get(this._proxyContext, 'content');
    if (context !== newContext) {
      if (this.state === 'inDOM') {
        this.prepareForReuse(newContext);
      }

      set(this._proxyContext, 'content', newContext);

      if (newContext && newContext.isController) {
        set(this, 'controller', newContext);
      }
    }
  },
  prepareForReuse: Ember.K
});
