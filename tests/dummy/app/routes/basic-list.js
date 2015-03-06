import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var model = [];
    for (var i = 0; i < 100000; i++) {
      model.push({
        name: `Item ${i+1}`,
        imageSrc: images[i%images.length]
      });
    }
    return model;
  }
});

var images = [
  'images/ebryn.jpg',
  'images/iterzic.jpg',
  'images/kselden.jpg',
  'images/machty.jpg',
  'images/rwjblue.jpg',
  'images/stefanpenner.jpg',
  'images/tomdale.jpg',
  'images/trek.jpg',
  'images/wagenet.jpg',
  'images/wycats.jpg'
];
