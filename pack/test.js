var Bin = require('./index');
var assert = require('assert');

var content = [
/* y:   0 */ { width:  50, height: 50 }, { width: 50, height: 50 }, // y:   0
/* y:  50 */ { width: 100, height: 25 },                            // y:  50
/* y:  75 */ { width:  50, height: 50 }, { width: 50, height: 50 }, // y:  75
/* y: 125 */ { width:  50, height: 50 }, { width: 50, height: 50 }, // y: 125
/* y: 175 */ { width:  50, height: 50}                              // y: 175
];

var bin = new Bin.ShelfFirst(content, 100);

assert.equal(bin.visibleStartingIndex(  0, 100), 0);
assert.equal(bin.visibleStartingIndex( 50, 100), 2);

assert.equal(bin.visibleStartingIndex( 75, 100), 3);
assert.equal(bin.visibleStartingIndex(100, 100), 5);
assert.equal(bin.visibleStartingIndex(125, 100), 5);

assert.equal(bin.visibleStartingIndex(150, 100), 7);
assert.equal(bin.visibleStartingIndex(175, 100), 7);

assert.throws(function() {
  assert.equal(bin.visibleStartingIndex(200, 100), 7);
}, /Parameter must be within: \[0 and 8\) but was: 8/);

// index 0; given viewport { height: 50 , width: 100}
assert.equal(bin.numberVisibleWithin( 0, 100, 50), 2);
assert.equal(bin.numberVisibleWithin(50, 100, 50), 3);
assert.equal(bin.numberVisibleWithin(75, 100, 50), 2);

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

assert.equal(bin.height(), 225);

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

var fixed = new Bin.FixedDimension(content, 10, 10);

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

assert.deepEqual(fixed.height(), 40);

// index 0; given viewport { height: 20, width: 20 }
assert.equal(fixed.numberVisibleWithin(0, 20, 20), 4);
assert.equal(fixed.numberVisibleWithin(10, 20, 20), 4);
assert.equal(fixed.numberVisibleWithin(20, 20, 20), 4);
