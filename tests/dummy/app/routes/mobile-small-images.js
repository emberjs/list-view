import Ember from 'ember';
import makeModel from '../utils/make-model';

export default Ember.Route.extend({
  model: makeModel(1000, 'smallImages')
});
