import Ember from 'ember';
import {registerListViewHelpers} from 'ember-list-view/helper';

export var initialize = registerListViewHelpers;

export default {
  name: 'list-view-helper',
  initialize: registerListViewHelpers
};
