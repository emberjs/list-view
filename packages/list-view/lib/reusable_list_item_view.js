require('list-view/list_item_view_mixin');

var get = Ember.get, set = Ember.set;

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
