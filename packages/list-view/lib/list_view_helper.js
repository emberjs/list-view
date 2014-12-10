// TODO - remove this!
var el    = document.body || document.createElement('div');
var style = el.style;
var set   = Ember.set;

function testProp (prop) {
  var uppercaseProp = prop.charAt(0).toUpperCase() + prop.slice(1);

  var props = [
    prop,
    'webkit' + prop,
    'webkit' + uppercaseProp,
    'Moz'    + uppercaseProp,
    'moz'    + uppercaseProp,
    'ms'     + uppercaseProp,
    'ms'     + prop
  ];

  for (var i=0; i < props.length; i++) {
    var property = props[i];

    if (property in style) {
      return property;
    }
  }

  return null;
}

function browserTransform (attributeName) {
  var styleName = testProp(attributeName);
  var prefix = styleName.toLowerCase().replace(attributeName, '');

  var dic = {
    webkit: '-webkit-' + attributeName,
    moz: '-moz-' + attributeName,
    ms: '-ms-' + attributeName
  };

  if (prefix && dic[prefix]) {
    return dic[prefix];
  }

  return styleName;
}

var transformProp = browserTransform('transform');
var perspectiveProp = testProp('perspective');
var supports2D = transformProp !== null;
var supports3D = perspectiveProp !== null;

export default {
  transformProp: transformProp,
  applyTransform: (function(){
    if (supports2D) {
      return function(childView, x, y){
        set(childView, 'style', transformProp + ': translate(' + x + 'px, ' + y + 'px);');
      };
    } else {
      return function(childView, x, y){
        set(childView, 'style', 'top: ' + y + 'px; left: ' + x + 'px;');
      };
    }
  })(),
  apply3DTransform: (function(){
    if (supports3D) {
      return function(childView, x, y){
        set(childView, 'style', transformProp + ': translate3d(' + x + 'px, ' + y + 'px, 0);');
      };
    } else if (supports2D) {
      return function(childView, x, y){
        set(childView, 'style', transformProp + ': translate(' + x + 'px, ' + y + 'px);');
      };
    } else {
      return function(childView, x, y){
        set(childView, 'style', 'top: ' + y + 'px; left: ' + x + 'px;');
      };
    }
  })()
};
