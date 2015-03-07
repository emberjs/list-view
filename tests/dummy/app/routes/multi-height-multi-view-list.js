import Ember from 'ember';
import {types} from '../utils/make-model';

export default Ember.Route.extend({
  model: function() {
    return types;
  }
});
