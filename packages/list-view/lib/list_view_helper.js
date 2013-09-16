var el = document.createElement('div'), style = el.style;

var propPrefixes = ['Webkit', 'Moz', 'O', 'ms'];

function testProp(prop) {
  if (prop in style) return prop;
  var uppercaseProp = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i=0; i<propPrefixes.length; i++) {
    var prefixedProp = propPrefixes[i] + uppercaseProp;
    if (prefixedProp in style) {
      return prefixedProp;
    }
  }
  return null;
}

var transformProp = testProp('transform');
var perspectiveProp = testProp('perspective');

var supports2D = transformProp !== null;
var supports3D = perspectiveProp !== null;

Ember.ListViewHelper = {
  transformProp: transformProp,
  applyTransform: (function(){
    if (supports2D) {
      return function(element, x, y){
        element.style[transformProp] = 'translate(' + x + 'px, ' + y + 'px)';
      };
    } else {
      return function(element, x, y){
        element.style.top  = y + 'px';
        element.style.left = x + 'px';
      };
    }
  })(),
  apply3DTransform: (function(){
    if (supports3D) {
      return function(element, x, y){
        element.style[transformProp] = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      };
    } else if (supports2D) {
      return function(element, x, y){
        element.style[transformProp] = 'translate(' + x + 'px, ' + y + 'px)';
      };
    } else {
      return function(element, x, y){
        element.style.top  = y + 'px';
        element.style.left = x + 'px';
      };
    }
  })()
};
