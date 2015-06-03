
var Population = require('./population')

var Populations = function(block_size) {
  this.populations = []
  this.block_size = block_size;
};

// kind of functionaly -- create new populations spawned from the existing one.
// Then add them to the new population dict and replace the existing one.
Populations.prototype.step = function(map, global_ticks) {
  var new_pops = []
  _.each(this.populations, function(population, index) {
    population.step(map, global_ticks);
  }.bind(this));

  //console.log("pops: ", Object.keys(this.populations).length);
};

Populations.prototype.population_at = function(bx, by) {
  return _.find(this.populations, function(pop) {
    return pop.position.block_x == bx && pop.position.block_y == by;
  }.bind(this));
};

Populations.prototype.occupied = function(position) {
  return !!this.population_at(position.block_x, position.block_y);
};

Populations.prototype.render = function(ctx) {
  _.each(this.populations, function(population, index) {
    population.render(ctx, this.block_size);
  }.bind(this));
};

Populations.prototype.add = function(population) {
  var existing = this.population_at(population.position.block_x, population.position.block_y);

  if (existing) {
    if (!existing.moving && !population.moving) {
      existing.target_pos = null;
      existing.merge(population);
    }
    delete population;
  } else {
    this.populations.push(population);
  }
}

Populations.prototype.adjacent_populations = function(pop) {
  var pos = pop.position;
  return _.filter(this.populations, function(population) {
    var pos2 = population.position;
    return (Math.abs(pos2.block_x - pos.block_x) <= 1 &&
            Math.abs(pos2.block_y - pos.block_y) <= 1 &&
            pos2.block_x != pos.block_x && pos2.block_y != pos.block_y);
  }.bind(this));
};

Populations.prototype.adjacent_blocks = function() {
  var adj = {};

  _.each(this.populations, function(population) {
    var blocks = population.adjacent_blocks();
    _.each(blocks, function(block) {
      var key = "" + block[0] + "," + block[1];
      adj[key] = block;
    }.bind(this));
  }.bind(this));

  return adj;
};

module.exports = Populations;
