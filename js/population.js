
var Color = require("color");
var Explorer = require("./explorer");

// maximum population density per square. This is too low for the real sim, but
// it seems like a reasonable number for testing
var MAX_POPULATION = 1000;
var STOP_EXPLORING_AT = 300;

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};


var Population = function(dimensions, num_ticks, parent, world_dimensions) {
  this.position = dimensions.position;
  this.size = dimensions.size;
  this.parent = parent;
  this.dimensions = world_dimensions;

  this.pct_explorers = 0.50;
  this.pct_settlers = 0.50;

  this.num_ticks = num_ticks || 0;

  this.explorer = new Explorer(this, world_dimensions);

  this.moves_to_target = [];
  this.moving = false;
  this.surrounded = false;
};

Population.prototype.relocate = function(pos, moves, populations) {
  this.moves_to_target = moves;

  var this_size = Math.max(Math.floor(this.size * this.pct_explorers), 1);
  var other_size = Math.max(Math.floor(this.size * this.pct_settlers), 1);

  if (this_size < 1 || other_size < 1) debugger

  var new_pop = new Population({position: this.position, size: this_size}, this.num_ticks, this.parent, this.dimensions);
  new_pop.surrounded = this.surrounded;
  this.size = other_size;
  this.num_ticks = 0;

  if (this.position.block_x == new_pop.position.block_x && this.position.block_y == new_pop.position.block_y) {
    if (this.moves_to_target.length == 0) debugger
    this.move_to(this.moves_to_target.pop());
  }
  if (this.position.block_x == new_pop.position.block_x && this.position.block_y == new_pop.position.block_y) {
    if (this.moves_to_target.length == 0) debugger
    this.move_to(this.moves_to_target.pop());
  }

  this.parent.add(new_pop);
},

Population.prototype.move_to = function(pos) {
  this.position = pos;
  this.explorer.position = pos;
};

Population.prototype.step = function(map, global_ticks) {
  this.num_ticks += 1;

  if (this.num_ticks > STOP_EXPLORING_AT) {
    this.explorer.state = "chilling";
    return // inert
  }

  var hosp = map.get_hospitability(this.position.block_x, this.position.block_y);
  var max_pop = this.max_population(hosp.score);
  var dp = this.population_change(this.size, max_pop);
  this.size = Math.min(max_pop, Math.floor(this.size * dp + 1));
  var count = this.size;

  if (this.moves_to_target.length && !this.moving) {
    this.moving = true;
  } else if (this.moves_to_target.length && this.moving) {
    this.move_to(this.moves_to_target.pop());
  } else if (this.explorer.state == "chilling") {
    this.moving = false;
    if (!this.surrounded && this.num_ticks > 50 && _.random(0, 100) > 95) {
      this.explorer.explore();
      var adj = this.parent.adjacent_populations(this);
      // once this it set, we won't enter this if block again!
      this.surrounded = adj.length > 4;
    }
  }

  this.explorer.step(map, global_ticks, this.parent);
};

Population.prototype.max_population = function(hosp) {
  return hosp * MAX_POPULATION;
};

Population.prototype.population_change = function(size, max_pop) {
  return 1 + Math.cos((Math.PI * this.size) / max_pop) / 10;
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
  var x = this.position.block_x * block_size % this.dimensions.width;
  var y = this.position.block_y * block_size;
  ctx.fillStyle = this.get_color();
  ctx.fillRect(x, y, block_size, block_size);

  this.explorer.render(ctx, block_size);
};

Population.prototype.get_color = function() {
  if (this.moving) {
    var color = Color({r: 255, g: 255, b: 255, a: 0.5});
  } else {
    //var alpha = this.size / 10000;
    //var color = Color({r: 0, g: 0, b: 0, a: alpha});
    var solid_color = "#" + window.POPULATION_GRADIENT.colourAt(Math.min(Math.floor(this.size / 100), 100));
    var color = Color(solid_color);
    color.clearer(0.3);
  }
  return color.rgbaString();
};

// return a new population combining sizes
Population.prototype.merge = function(other) {
  this.size += other.size;
  this.num_ticks = Math.max(other.num_ticks, this.num_ticks);
};

// hash based on the position on the map
Population.prototype.hash = function() {
  return "" + this.position.block_x + "," + this.position.block_y;
};

module.exports = Population;
