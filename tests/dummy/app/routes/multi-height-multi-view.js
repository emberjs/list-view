import Ember from 'ember';
import {types} from '../utils/fixtures';

export default Ember.Route.extend({
  model: function() {
    return types;
  }
});
