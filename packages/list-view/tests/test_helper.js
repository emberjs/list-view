function generateContent(n) {
  var content = Ember.A();
  for (var i = 0; i < n; i++) {
    content.push({name: "Item " + (i+1)});
  }
  return content;
}

function extractPositionFromTransform(string) {
  var matched, x, y, position;

  matched = string.match(/translate(?:3d)?\((-?\d+)px,\s*(-?\d+)px/);

  x = parseInt(matched[1], 10);
  y = parseInt(matched[2], 10);

  position = {
    x: x,
    y: y
  };

  return position;
}

function extractNumberFromPosition(string) {
  var number = string.replace(/px/g,'');
  return parseInt(number, 10);
}

function extractPosition(element) {
  var style, position,
    transformProp = Ember.ListViewHelper.transformProp;

  style = element.style;

  if (style.top) {
    position = {
      y: extractNumberFromPosition(style.top),
      x: extractNumberFromPosition(style.left)
    };
  } else if (style[transformProp]) {
    position = extractPositionFromTransform(style[transformProp]);
  }

  return position;
}

function sortElementsByPosition (elements) {
  return elements.sort(function(a, b){
    var aPosition, bPosition;

    aPosition = extractPosition(a);
    bPosition = extractPosition(b);

    if (bPosition.y === aPosition.y){
      return (aPosition.x - bPosition.x);
    } else {
      return (aPosition.y - bPosition.y);
    }
  });
}

function sortByPosition (a, b) {
  var aPosition, bPosition;

  aPosition = a;
  bPosition = b;

  if (bPosition.y === aPosition.y){
    return (aPosition.x - bPosition.x);
  } else {
    return (aPosition.y - bPosition.y);
  }
}

function itemPositions(view) {
  return Ember.A(view.$('.ember-list-item-view').toArray()).map(function(e) {
    return extractPosition(e);
  }).sort(sortByPosition);
}

window.helper = {
  itemPositions: itemPositions,
  generateContent: generateContent,
  sortElementsByPosition: sortElementsByPosition,
  extractPosition: extractPosition
};
