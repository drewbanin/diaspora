
var ImageProcessor = require('./image_processor.js');

// great name for this, Drew. Factor multipliers for different features
var FEAT_HOSP = {
  forest: 10,
  desert: 0.03,
  water: 30, // be careful, living in the ocean isn't so great...
  mountain: 0.02,
  ice: 0.01,
};

var Map = function(dimensions, ctx, block_size) {
  this.dimensions = dimensions
  this.map = {};
  this.ctx = ctx;
  this.block_size = block_size;
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
  var cached = this.map[this.hash(bx, by)];
  if (cached) {
    return cached.hospitability;
  } else {
    var features = this.getFeatures(bx * this.block_size, by * this.block_size, this.block_size);
    var hospitability = this.hospitability(features);
    var hash = this.hash(bx, by);
    this.map[hash] = {
      hospitability: hospitability,
      features: features,
    };
    return hospitability;
  }
};

Map.prototype.hospitability = function(features) {
  var f = features;
  if (f.pct_water > 0.4) {
    return {possible: false, score: 0};
  }

  var hosp = f.pct_forest * FEAT_HOSP.forest +
         f.pct_desert * FEAT_HOSP.desert +
         f.pct_water  * FEAT_HOSP.water  +
         f.pct_ice * FEAT_HOSP.ice;

  return {possible: true, score: hosp}
};

Map.prototype.hash = function(block_x, block_y) {
  return "" + block_x + "," + block_y;
};


Map.prototype.getFeatures = function(x, y, block_size) {
  var block = {x: x, y: y, block_size: block_size};
  return ImageProcessor.getBlockFeatures(this.ctx, block, this.dimensions);
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
    var features = ImageProcessor.getBlockFeatures(ctx, block, this.dimensions);
    this.map[hash] = {
      features: features,
      hospitability: this.hospitability(features),
    }
  }.bind(this));

  // console.log("" + Object.keys(this.map).length + " known blocks");
};

module.exports = Map;

