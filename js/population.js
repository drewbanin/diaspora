
var Color = require("color");

// maximum population density per square. This is too low for the real sim, but
// it seems like a reasonable number for testing
var MAX_POPULATION = 1000;

var Population = function(dimensions) {
  this.position = dimensions.position;
  this.size = dimensions.size;

  // is 5% a good number? Assume 50% is able bodied, 10% of those are adventurous
  this.pct_explorers = 0.05;
  this.pct_settlers = 0.95;
};

// Each step, the population will split. New populations are returned for each
// adjacent square the population splits to (with the correct position)
//
// This is currently random and that's currently bad. Instead, distribution from
// THIS node should be a function of the hospitability of the surrounding nodes
// and their densities!
//
// ok ok ok. so:
//  - some population stays put
//    - how many?
//  - some travel
//    - how many? in which directions?
//  - some people live and some die
//
//  # who stay is proportion of "settlers", # who leave is proportion of explorers
//  # distribution is weighted by hospitability and density of surrounding blocks
//  this function needs the hospitability of each block around it and # of people
Population.prototype.step = function(map) {
  // TODO : account for deaths and births!
  var count = this.size;

  var hospitability = map.hospitability(this.position.block_x, this.position.block_y);
  var stay = Math.floor(this.pct_settlers * count);
  count -= stay;

  var left = Math.floor(Math.random() * count)
  count -= left;

  var right = Math.floor(Math.random() * count)
  count -= right;

  var up = Math.floor(Math.random() * count)
  count -= up;

  var down = Math.floor(Math.random() * count)
  count -= down;

  return [
    new Population(this.get_dimensions(0,  0, stay)),
    new Population(this.get_dimensions(-1, 0, left)),
    new Population(this.get_dimensions(1,  0, right)),
    new Population(this.get_dimensions(0, -1, up)),
    new Population(this.get_dimensions(0,  1, down)),
  ];
}

Population.prototype.get_dimensions = function(dx, dy, size) {
  return {
    position: {
      block_x: this.position.block_x + dx,
      block_y: this.position.block_y + dy,
    },
    size: size
  }
}

Population.prototype.render = function(ctx, block_size) {
  // don't hardcode this, dummy
  var radius = block_size / 2;
  var x = this.position.block_x * block_size;
  var y = this.position.block_y * block_size;
  ctx.fillStyle = this.get_color();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
};

Population.prototype.get_color = function() {
  var alpha = 255 * (this.size / MAX_POPULATION);
  var color = Color({r: 0, g: 0, b: 0, a: alpha});
  return color.rgbaString();
};

// return a new population combining sizes
Population.prototype.merge = function(other) {
  var dims = this.get_dimensions(0, 0, this.size + other.size);
  return new Population(dims)
};

// hash based on the position on the map
Population.prototype.hash = function() {
  return "" + this.position.block_x + "," + this.position.block_y;
};

Population.prototype.adjacent_blocks = function() {
  var bx = this.position.block_x;
  var by = this.position.block_y;
  return [[bx, by],
          [bx - 1, by],
          [bx - 1, by - 1],
          [bx, by - 1],
          [bx + 1, by - 1],
          [bx + 1, by],
          [bx + 1, by + 1],
          [bx, by + 1],
          [bx - 1, by + 1]
  ];
};

module.exports = Population;
