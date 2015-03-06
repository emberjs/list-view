import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('basic-list');
  this.route('mobile-list');
  this.route('mobile-large-images-list');
  this.route('mobile-small-images-list');
});

export default Router;
