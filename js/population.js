
var Color = require("color");

// maximum population density per square. This is too low for the real sim, but
// it seems like a reasonable number for testing
var MAX_POPULATION = 1000;
//var POP_CHANGE_RATE = 1.2;
var POP_CHANGE_RATE = 2.0;

var Population = function(dimensions) {
  this.position = dimensions.position;
  this.size = dimensions.size;

  // is 5% a good number? Assume 50% is able bodied, 10% of those are adventurous
  this.pct_explorers = 0.20;
  this.pct_settlers = 0.80;
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

  // SIMPLE IS GOOD (for now)
  //
  // calc relative hospitabilities for this + surrounding blocks, ex:
  //      -1   0  -2     1 2 0
  //       3   0   5     5   7
  //      -1  -1   3     1 1 5
  //                            sum = 22
  //
  // num stay = floor(p(settler) * count)
  // num_leave = count - num_stay
  // distributions are weighted proportions of surrounding hospitabilities
  // p(left)    5/22
  // p(right) = 7/22
  // ...

  var num_stay = Math.floor(this.pct_settlers * count);
  count -= num_stay;

  var deltas = [-1, 0, 1];

  var bx = this.position.block_x;
  var by = this.position.block_y;

  hosps = [];
  var min_hosp = null;
  _.each(deltas, function(dx) {
    _.each(deltas, function(dy) {
      var hosp = map.get_hospitability(bx + dx, by + dy);
      var data = {dx: dx, dy: dy, h: hosp};
      if (min_hosp === null || hosp < min_hosp) { min_hosp = hosp; }
      hosps.push(data);
    }.bind(this));
  }.bind(this))

  var hosp_sum = 0;
  _.each(hosps, function(hosp) {
    // make everything positive
    if (min_hosp < 0) { hosp.h -= min_hosp;  }
    hosp_sum += hosp.h;
  }.bind(this));

  // sort by descending hospitality
  hosps.sort(function(a, b) { return (a.h < b.h) ? 1 : -1; });

  var new_size = Math.min(MAX_POPULATION, Math.floor(num_stay * POP_CHANGE_RATE));
  var populations = [new Population(this.get_dimensions(0, 0, new_size))];
  // we have `count` people left to distribute

  _.each(hosps, function(hosp) {
    if (hosp_sum == 0) {
      var pop_size = 0;
    } else {
      var pop_size = Math.floor(count * (hosp.h / hosp_sum));
    }
    if (_.isNaN(pop_size)) debugger
    pop = new Population(this.get_dimensions(hosp.dx, hosp.dy, pop_size));
    populations.push(pop);
  }.bind(this));

  return populations;
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
  var alpha = 1 * (this.size / MAX_POPULATION) + .5;
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
