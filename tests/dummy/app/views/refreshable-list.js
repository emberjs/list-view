import Ember from 'ember';
import VirtualListView from 'list-view/virtual-list-view';
import ListItemView from 'list-view/list-item-view';
import images from '../utils/images';

export default VirtualListView.extend({
  pullToRefreshViewClass: Ember.View.extend({
    classNames: ['pull-to-refresh-animation'],
    templateName: 'pull-to-refresh-animation',
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
        // TODO: fix this missing image
        imageSrc: null
      });
      finishRefresh();
    }, 1000);
  }
});
