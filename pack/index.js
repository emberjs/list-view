function Bin(content) {
  this.width = 0;
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

  return this._entryAt(width, index).position;
};

Bin.prototype.flush = function(index /*, to */) {
  this._positionEntries.length = index;
};

function rangeError(length, index) {
  throw new RangeError("Parameter must be within: [" + 0 + " and " + length + ") but was: " + index);
};

Bin.prototype.length = function() {
  return this.content.length;
}

Bin.prototype._entryAt = function position(width, index) {
  var length = this.length();

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

Bin.prototype.visibleStartingIndex = function(topOffset, width, height) {

};

Bin.prototype.numberVisibleWithin = function (topOffset, width, height) {
  if (width!== this.width) {
    this.flush(0);
    this.width = width;
  }

  var startingIndex = this.visibleStartingIndex(topOffset, width, height);

  return this._numberVisibleWithin(startingIndex, width, height);
};

Bin.prototype._numberVisibleWithin = function(startingIndex, width, height) {
  return 4; // fake it till we make it
};

Bin.prototype.heightAtIndex = function(index) {
  return this.content[index].height;
};

Bin.prototype.widthAtIndex = function(index) {
  return this.content[index].width;
};

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return Bin; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = Bin;
} else if (typeof this !== 'undefined') {
  this['Bin'] = Bin;
}
