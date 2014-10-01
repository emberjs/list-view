function Bin(content, width) {
  this.width = width || 0;
  this._positionEntries = [];
  this.content = content;
}

function Position(x, y) {
  this.x = x;
  this.y = y;
}

 // @param height: "known to have atleast this might height available"
function Entry(height, width, x, y) {
  this.height   = height;
  this.width    = width;
  this.position = new Position(x, y);
}

Bin.prototype.get = function(obj, key) {
  return obj[key];
};

Bin.prototype.objectAt = function(collection, index) {
  return collection[index];
};

// width/height should be optional
Bin.prototype.position = function position(index, width) {
  if (width !== this.width) {
    this.flush(0);
    this.width= width;
  }

  return this._entryAt(index).position;
};

Bin.prototype.flush = function(index /*, to */) {
  if (this._positionEntries.length > index) {
    this._positionEntries.length = index;
  }
};

Bin.prototype.height = function() {
  throw TypeError("NOT IMPLEMENTED");
}



function rangeError(length, index) {
  throw new RangeError("Parameter must be within: [" + 0 + " and " + length + ") but was: " + index);
}

function insufficientArguments(actual, expected) {
  throw new TypeError("Insufficent Arguments expected: " + expected + " but got " + actual + "");
}

Bin.prototype.length = function() {
  return this.content.length;
}

Bin.prototype._entryAt = function position(index) {
  var length = this.length();
  var width = this.width;

  if (index >= length) {
    rangeError(length, index)
  }

  var entry;
  var entries = this._positionEntries;
  var entriesLength = entries.length;
  var startingIndex;

  var y, x, i;
  var rowHeight = 0;
  var rowWidth = 0;

  if (index < entriesLength) {
    return this._positionEntries[index];
  } else if (entriesLength === 0) {
    startingIndex = 0;
    y = 0;
  } else {
    startingIndex = entriesLength - 1;
    entry = this._positionEntries[startingIndex];
    y = entry.position.y;
    rowWidth = entry.position.x;
  }

  for (i = startingIndex; i < index + 1; i++) {

    currentHeight = this.heightAtIndex(i);
    currentWidth = this.widthAtIndex(i);

    if (rowWidth >= width) {
      // new row
      y = rowHeight + y;
      rowHeight = currentHeight;
      x  = 0;
      rowWidth = 0;
    } else {
      x = rowWidth;
    }

    if (currentHeight > rowHeight) {
      rowHeight = currentHeight;
    }

    entry = this._positionEntries[i] = new Entry(rowHeight, currentWidth, x, y);

    rowWidth += currentWidth;
  }

  return entry;
};

Bin.prototype.visibleStartingIndex = function(topOffset, width) {
  if (topOffset === 0 ) { return 0; }

  var top = 0;
  var position;
  var previousTop = 0;
  var index = -1

  while (topOffset > top) {
    index++;
    position = this._entryAt(index).position;

    if (position.y === previousTop) {
      // same row
    } else {
      // new row
      top = position.y;
    }
  }

  return index;
};

Bin.prototype.numberVisibleWithin = function (topOffset, width, height) {
  if (width!== this.width) {
    this.flush(0);
    this.width = width;
  }

  var startingIndex = this.visibleStartingIndex(topOffset, width, height);

  return this._numberVisibleWithin(startingIndex, height);
};

Bin.prototype._numberVisibleWithin = function(startingIndex, height) {
  var width = this.width;
  var count = 0;
  var length = this.length();
  var entry, position;
  var currentY = 0;
  var yOffset = 0;

  if (startingIndex > 0 && startingIndex < length) {
    yOffset = this._entryAt(startingIndex).position.y;
  } else {
    yOffset = 0;
  }

  if (startingIndex < length)

  for (var i = startingIndex; i < length; i++) {
    entry = this._entryAt(i);
    position = entry.position;

    if (currentY === position.y) {
      // same row
    } else {
      currentY = position.y - yOffset;
    }

    if (currentY < height) {
      count++;
    } else {
      break;
    }
  }

  return count;
};

Bin.prototype.heightAtIndex = function(index) {
  return this.content[index].height;
};

Bin.prototype.widthAtIndex = function(index) {
  return this.content[index].width;
};

function FixedDimension(content, elementWidth, elementHeight) {
  this._elementWidth =  elementWidth;
  this._elementHeight =  elementHeight;

  this._super$constructor(content);
}

FixedDimension.prototype = Object.create(Bin.prototype);
FixedDimension.prototype._super$constructor = Bin;

FixedDimension.prototype.widthAtIndex = function(index) {
  return this._elementWidth;
};

FixedDimension.prototype.heightAtIndex = function(index) {
  return this._elementWidth;
};

FixedDimension.prototype.height = function() {
  var length = this.length();
  if (length === 0) { return 0; }

  var entry = this._entryAt(0);
  var width = this.width;
  var columnCount = Math.floor(width/entry.width);
  var rows = length/columnCount;

  var totalHeight = rows * entry.height;

  return totalHeight;
}

Bin.FixedDimension = FixedDimension;

Bin.Position = Position;
Bin.Entry = Entry;
/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return Bin; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = Bin;
} else if (typeof this !== 'undefined') {
  this['Bin'] = Bin;
}
