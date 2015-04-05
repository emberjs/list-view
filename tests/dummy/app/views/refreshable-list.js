import Ember from 'ember';
import VirtualListView from 'ember-list-view/virtual-list-view';

export default VirtualListView.extend({
  pullToRefreshViewClass: Ember.View.extend({
    classNames: ['pull-to-refresh-animation'],
    // TODO(taras): this should be done via container (currently template is being overwritten by ListItem template)
    //templateName: 'pull-to-refresh-animation',
    isRefreshing: true,
    label: function(){
      if (this.get('refreshing')) {
        return "Updating...";
      } else if (this.get('active')) {
        return "Release to Refresh";
      } else {
        return "Pull to Refresh";
      }
    }.property('refreshing', 'active')
  }),
  pullToRefreshViewHeight: 75,
  startRefresh: function(finishRefresh){
    var view = this;
    Ember.run.later(function(){
      view.get('controller').insertAt(0, {
        name: 'New Item',
        isNewItem: true,
        imageSrc: null
      });
      finishRefresh();
    }, 1000);
  }
});
