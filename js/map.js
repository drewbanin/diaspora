
var ImageProcessor = require('./image_processor.js');

// great name for this, Drew. Factor multipliers for different features
var FEAT_HOSP = {
  forest: 30,
  desert: 5,
  water: 20, // be careful, living in the ocean isn't so great...
  mountain: 1,
  ice: 1,
};

var Map = function(dimensions) {
  this.dimensions = dimensions
  this.map = {};
};

Map.prototype.adjacent_blocks = function() {
  var adj = {};

  _.each(this.populations, function(population) {
    var blocks = population.adjacent_blocks();
    _.each(blocks, function(block) {
      var key = this.hash(block[0], block[1])
      adj[key] = block;
    }.bind(this));
  }.bind(this));

  return adj;
};

Map.prototype.get_hospitability = function(bx, by) {
  return this.map[this.hash(bx, by)].hospitability;
};

Map.prototype.hospitability = function(features) {
  var f = features;
  if (f.pct_water > 0.2) {
    return {possible: false, score: 0};
  }

  var hosp = f.pct_forest * FEAT_HOSP.forest +
         f.pct_desert * FEAT_HOSP.desert +
         f.pct_water  * FEAT_HOSP.water  +
         f.pct_mountainous * FEAT_HOSP.mountain +
         f.pct_ice * FEAT_HOSP.ice;

  return {possible: true, score: hosp}
};

Map.prototype.hash = function(block_x, block_y) {
  return "" + block_x + "," + block_y;
};


Map.prototype.getFeatures = function(ctx, x, y, block_size) {
  var block = {x: x, y: y, block_size: block_size};
  return ImageProcessor.getBlockFeatures(ctx, block);
};

// update the population's understanding of the map. This entails adding features from
// each block surrounding an occupied block to the this.map hash. Naively, this will
// check every surrouding block on every step. That sucks, so let's find some dirty checking
// way to avoid doing that work for known blocks
Map.prototype.update = function(ctx, populations) {
  var adjacent_blocks = populations.adjacent_blocks();

  _.each(adjacent_blocks, function(block, hash) {
    // quit if we know about this block already
    if (this.map[hash]) return;
    // else, analyze the block and record it in this.map

    var block = {
      x: block[0] * this.dimensions.block_size,
      y: block[1] * this.dimensions.block_size,
      block_size: this.dimensions.block_size
    };
    var features = ImageProcessor.getBlockFeatures(ctx, block);
    this.map[hash] = {
      features: features,
      hospitability: this.hospitability(features),
    }
  }.bind(this));

  // console.log("" + Object.keys(this.map).length + " known blocks");
};

module.exports = Map;

