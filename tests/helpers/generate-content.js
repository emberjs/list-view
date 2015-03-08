import Ember from 'ember';

export default function generateContent(n) {
  var content = Ember.A();
  for (var i = 0; i < n; i++) {
    content.push({name: "Item " + (i+1)});
  }
  return content;
}
