import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'a',
  didInsertElement: function() {
    this.$().on('dragstart', 'img', function(e) {
      e.preventDefault();
    });
  },

  willDestroyElement: function() {
    this.$().off('dragstart', 'img');
  }
});
