var Bin = require('./index');
var assert = require('assert');

var content = [
  { width:  50, height: 50 }, { width: 50, height: 50 },
  { width: 100, height: 25 },
  { width:  50, height: 50 }, { width: 50, height: 50 },
  { width:  50, height: 50 }, { width: 50, height: 50 },
  { width:  50, height: 50}
];

var bin = new Bin(content);

assert.deepEqual(bin.position(0, 100), {
  x: 0,
  y: 0
});

assert.deepEqual(bin.position(1, 100), {
  x: 50,
  y:  0
});

assert.deepEqual(bin.position(2, 100), {
 x:  0,
 y: 50
});

assert.deepEqual(bin.position(3, 100), {
  x: 0,
  y: 75
});

assert.deepEqual(bin.position(4, 100), {
  x:  50,
  y: 75
});

assert.deepEqual(bin.position(5, 100), {
  x:   0,
  y: 125
});

assert.deepEqual(bin.position(6, 100), {
  x:  50,
  y: 125
});

assert.deepEqual(bin.position(7, 100), {
  x:   0,
  y: 175
});

assert.throws(function() {
  assert.deepEqual(bin.position(8, 100), {
    x:   0,
    y: 175
  });
}, /Parameter must be within: \[0 and 8\) but was: 8/);

// dimension change

assert.deepEqual(bin.position(7, 99), {
  x:   0,
  y: 175
});

assert.deepEqual(bin.position(2, 200), {
 x: 100,
 y:   0
});

assert.deepEqual(bin.position(3, 200), {
 x:  0,
 y: 25
});

function FixedDimensionBin(content, elementWidth, elementHeight) {
  this._elementWidth =  elementWidth;
  this._elementHeight =  elementHeight;

  this._super$constructor(content);
}

FixedDimensionBin.prototype = Object.create(Bin.prototype);
FixedDimensionBin.prototype._super$constructor = Bin;

FixedDimensionBin.prototype.widthAtIndex = function(index) {
  return this._elementWidth;
};

FixedDimensionBin.prototype.heightAtIndex = function(index) {
  return this._elementWidth;
};

var fixed = new FixedDimensionBin(content, 10, 10);

assert.deepEqual(fixed.position(0, 20), {
  x: 0,
  y: 0
});

assert.deepEqual(fixed.position(1, 20), {
  x: 10,
  y: 0
});

assert.deepEqual(fixed.position(2, 20), {
  x:  0,
  y: 10
});

assert.deepEqual(fixed.position(3, 20), {
  x: 10,
  y: 10
});

// index 0; given viewport { height: 20, width: 20 }
assert.equal(fixed.numberVisibleWithin(0, 20, 20), 4);
