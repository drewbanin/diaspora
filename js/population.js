
// IDEA : ok so a population is a collection of "cells" or
// individuals. This is more efficient than rendering 1000
// cells at a time for a population of 1000 people. Right?


var Population = function(position, density, block_dimensions) {
  this.position = position;
  this.density = density;
};

Population.prototype.render = function(ctx) {
};

module.exports = Population;
