import Ember from 'ember';
import {EmberList, EmberVirtualList} from 'list-view/helper';

export function initialize() {
  var registerHelper;
  if (Ember.HTMLBars) {
    // registerHelper was used for some 1.10-beta's and _registerHelper is for 1.10.0 final.
    registerHelper = Ember.HTMLBars._registerHelper || Ember.HTMLBars.registerHelper;
  } else {
    registerHelper = Ember.Handlebars.registerHelper;
  }
  registerHelper('ember-list', EmberList);
  registerHelper('ember-virtual-list', EmberVirtualList);
}

export default {
  name: 'list-view-helper',
  initialize: initialize
};
