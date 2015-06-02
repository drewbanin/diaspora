
var Color = require("color");

// maximum population density per square. This is too low for the real sim, but
// it seems like a reasonable number for testing
var MAX_POPULATION = 1000;

var Population = function(dimensions) {
  this.position = dimensions.position;
  this.size = dimensions.size;

  this.pct_explorers = 0.80;
  this.pct_settlers = 0.20;
};

Population.prototype.step = function(map) {
  var count = this.size;

  var bx = this.position.block_x;
  var by = this.position.block_y;

  var hosp_here = map.get_hospitability(bx, by);

  var num_staying = this.pct_settlers * count;
  var new_size = num_staying + num_staying * this.population_change(num_staying);
  var new_size = Math.min(new_size, MAX_POPULATION);

  var populations = [new Population(this.get_dimensions(0, 0, new_size))];

  count -= num_staying;

  var deltas = [-1, 0, 1];

  hosps = [];
  _.each(deltas, function(dx) {
    _.each(deltas, function(dy) {
      var hosp = map.get_hospitability(bx + dx, by + dy);
      var data = {dx: dx, dy: dy, score: hosp.score, possible: hosp.possible};
      hosps.push(data);
    }.bind(this));
  }.bind(this))

  var hosp_sum = Math.max(0.01, _.reduce(hosps, function(memo, hosp) { return memo + hosp.score; }, 0));

  _.each(hosps, function(hosp) {
    if (hosp.possible) {
      var score = hosp.score;
      var pop_size = Math.floor(count * score / hosp_sum);
      var pop = new Population(this.get_dimensions(hosp.dx, hosp.dy, pop_size));
      populations.push(pop);
    }
  }.bind(this));

  return populations;
}

Population.prototype.population_change = function(size) {
  return Math.cos((Math.PI * this.size) / MAX_POPULATION);
},

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
  ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
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
