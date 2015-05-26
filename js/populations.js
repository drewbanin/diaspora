
var Population = require('./population')

var Populations = function(block_size) {
  this.populations = {};
  this.block_size = block_size;
};

// kind of functionaly -- create new populations spawned from the existing one.
// Then add them to the new population dict and replace the existing one.
Populations.prototype.step = function(map) {
  var new_pops = []
  _.each(this.populations, function(population, hash) {
    var generated = population.step(map);
    new_pops = new_pops.concat(generated);
  }.bind(this));

  this.populations = {};
  _.each(new_pops, function(population) {
    if (population.size > 0) {
      this.add(population);
    }
  }.bind(this));
};

Populations.prototype.render = function(ctx) {
  _.each(this.populations, function(population, hash) {
    population.render(ctx, this.block_size);
  }.bind(this));

  // console.log("" + Object.keys(this.populations).length + " populations");
};

Populations.prototype.add = function(population) {
  var hash = population.hash();

  if (this.populations[hash]) {
    this.populations[hash] = population.merge(this.populations[hash])
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

