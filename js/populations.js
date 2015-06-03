
var Population = require('./population')

var Populations = function(block_size) {
  this.populations = {};
  this.block_size = block_size;
};

// kind of functionaly -- create new populations spawned from the existing one.
// Then add them to the new population dict and replace the existing one.
Populations.prototype.step = function(map, global_ticks) {
  var new_pops = []
  _.each(this.populations, function(population, hash) {
    population.step(map, global_ticks);
    if (population.size < 1) {
      delete this.populations[hash];
    }
  }.bind(this));

  //console.log("pops: ", Object.keys(this.populations).length);
};

Populations.prototype.hash = function(bx, by) {
  return "" + bx + "," + by;
};

Populations.prototype.population_at = function(bx, by) {
  return this.populations[this.hash(bx, by)];
};

Populations.prototype.render = function(ctx) {
  _.each(this.populations, function(population, hash) {
    //if (population.position.block_x == 150 && population.position.block_y == 60) debugger
    population.render(ctx, this.block_size);
  }.bind(this));
};

Populations.prototype.add = function(population) {
  var hash = population.hash();

  if (this.populations[hash]) {
    this.populations[hash].merge(population);
    delete population;
  } else {
    this.populations[hash] = population;
  }
}

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
}

module.exports = Populations;

