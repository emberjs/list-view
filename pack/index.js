// I don't think this should have args
function Bin(content, width) {
  this.width = width || 0;
  this.content = content;
  // belongs on ShelfFirst
  this._positionEntries = [];
}

function mustImplement(name) {
  return function() {
    throw TypeError("MustImplement: " + name );
  }
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

// abstract
Bin.prototype.objectAt = function(collection, index) {
  return collection[index];
};

// abstract
Bin.prototype.position = mustImplement('position');

// abstract
Bin.prototype.flush = function(index /*, to */) {
  if (this._positionEntries.length > index) {
    this._positionEntries.length = index;
  }
};

// abstract
Bin.prototype.height = mustImplement('position');

function rangeError(length, index) {
  throw new RangeError("Parameter must be within: [" + 0 + " and " + length + ") but was: " + index);
}

function insufficientArguments(actual, expected) {
  throw new TypeError("Insufficent Arguments expected: " + expected + " but got " + actual + "");
}

// abstract
Bin.prototype.length = function() {
  return this.content.length;
}

// abstract
Bin.prototype.visibleStartingIndex = mustImplement('visibleStartingIndex');

Bin.prototype.numberVisibleWithin = mustImplement('numberVisibleWithin');
  
Bin.prototype.heightAtIndex = function(index) {
  return this.content[index].height;
};

Bin.prototype.widthAtIndex = function(index) {
  return this.content[index].width;
};

function ShelfFirst(content, width) {
  this._super$constructor(content, width);
  this._positionEntries = [];
}

ShelfFirst.prototype = Object.create(Bin.prototype);
ShelfFirst.prototype._super$constructor = Bin;

ShelfFirst.prototype.height = function() {
  var length = this.length();
  if (length === 0) { return 0; }

  // find tallest in last raw, add to Y
  var tallest  = 0;
  var currentY = 0;
  var entry;

  for (var i = length - 1; i >= 0; i--) {
    entry = this._entryAt(i);

    if (currentY > entry.position.y) {
      break; // end of last row
    } else if (tallest < entry.height) {
      tallest = entry.height;
    } else {
      // do nothing
    }

    currentY = entry.position.y;
  }

  return currentY + tallest;
};

ShelfFirst.prototype.numberVisibleWithin = function (topOffset, width, height) {
  if (width!== this.width) {
    this.flush(0);
    this.width = width;
  }

  var startingIndex = this.visibleStartingIndex(topOffset, width, height);

  return this._numberVisibleWithin(startingIndex, height);
};

ShelfFirst.prototype._entryAt = function position(index) {
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

ShelfFirst.prototype._numberVisibleWithin = function(startingIndex, height) {
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

ShelfFirst.prototype.position = function position(index, width) {
  var length = this.length;

  if (length === 0 || index > length) {
    rangeError(length, index);
  }

  if (width !== this.width) {
    this.flush(0);
    this.width =  width;
  }

  return this._entryAt(index).position;
};

ShelfFirst.prototype.visibleStartingIndex = function(topOffset, width) {
  // part of ShelfFirst
  if (topOffset === 0 ) { return 0; }

  // TODO: bust cache if width changed

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

function FixedGrid(content, elementWidth, elementHeight) {
  this._elementWidth =  elementWidth;
  this._elementHeight =  elementHeight;

  this._super$constructor(content);
}

FixedGrid.prototype = Object.create(Bin.prototype);
FixedGrid.prototype._super$constructor = Bin;
FixedGrid.prototype.visibleStartingIndex = function(topOffset, width) {
  var columns = Math.floor(width / this._elementWidth);
  var height = this.height();

  return Math.floor(topOffset / height) / columns;
};

FixedGrid.prototype.numberVisibleWithin = function (topOffset, width, height) {
  var startingIndex = this.visibleStartingIndex(topOffset, width, height);
  var columns = Math.floor(width / this._elementWidth);
  var length = this.length();

  var rows = Math.ceil(height / this._elementHeight);
  var maxNeeded = rows * columns;
  var potentialVisible = length - startingIndex;

  return Math.min(maxNeeded, potentialVisible);
};

FixedGrid.prototype.widthAtIndex = function(index) {
  return this._elementWidth;
};

FixedGrid.prototype.heightAtIndex = function(index) {
  return this._elementWidth;
};

FixedGrid.prototype.position = function(index, width) {
  var length = this.length();
  if (length === 0 || index > length) {
    rangeError(length, index);
  }

  var columns = Math.floor(width / this._elementWidth) || 1;

  var x = index % columns * this._elementWidth;
  var y = Math.floor(index / columns) * this._elementHeight;

  return new Position(x, y);
};

FixedGrid.prototype.height = function(width) {
  var length = this.length();
  if (length === 0) { return 0; }

  var columnCount = Math.floor(width/this._elementWidth);
  columnCount = columnCount > 0 ? columnCount : 1;
  var rows = length/columnCount;

  var totalHeight = rows * this._elementWidth;

  return totalHeight;
}

Bin.FixedGrid = FixedGrid;

Bin.Position = Position;
Bin.Entry = Entry;
Bin.ShelfFirst = ShelfFirst;

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return Bin; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = Bin;
} else if (typeof this !== 'undefined') {
  this['Bin'] = Bin;
}
