
var HUD = require('./hud.js');
var Populations = require('./populations.js');
var Population = require('./population')
var Map = require('./map.js');
var StatCollector = require('./stat_collector');

var Earth = function(canvas, ctx, dimensions, image_src, population_dimension, loaded) {
  var image_src = image_src;

  this.canvas = canvas;
  this.ctx = ctx;
  this.dimensions = dimensions;
  this.timeout = 60;
  this.TICKS = 0;

  this.populations = new Populations(dimensions.block_size);

  this.populations.add(new Population(population_dimension, 0, this.populations, dimensions));

  // ice cores?
  this.stat_collector = new StatCollector(this, population_dimension);

  // hash of grid coords -> block information
  this.map = new Map(this.dimensions, this.ctx, this.dimensions.block_size);

  this.stats = {
    mouse : {
      x: 0,
      y: 0
    },
    features: {}
  };

  this.map_image = document.createElement('img');
  this.map_image.src = image_src;
  this.map_image.onload = function() {
    loaded(this);
  }.bind(this);

  canvas.addEventListener('mousemove', function(evt) {
    var rect = this.canvas.getBoundingClientRect();
    this.stats.mouse.x = evt.clientX - rect.left;
    this.stats.mouse.y = evt.clientY - rect.top;

    var bs = this.dimensions.block_size;
    var bx = Math.floor((evt.clientX - rect.left) / bs);
    var by = Math.floor((evt.clientY - rect.top) / bs);

    this.stats.mouse.block_x = bx;
    this.stats.mouse.block_y = by;

    this.stats.features = this.map.getFeatures(bx * bs, by * bs, bs);
    this.stats.score = this.map.hospitability(this.stats.features);

    this.stats.population = this.populations.population_at(bx, by);
  }.bind(this), false);

};

Earth.prototype.mainloop = function() {
  this.stat_collector.tick(this.TICKS);
  var start = Date.now();
  var ctx = this.ctx;
  ctx.clearRect(0 ,0, this.canvas.width, this.canvas.height);
  ctx.drawImage(this.map_image, 0, 0, this.dimensions.width, this.dimensions.height);

  // this has to come immediately after drawImage before anything else is
  // drawn! it scans the canvas to determine what features exist in the necessary blocks
  this.map.update(this.ctx, this.populations);

  // we need to advance the state before we redraw because some components need
  // to query the map!
  this.populations.step(this.map, this.TICKS);

  this.populations.render(ctx);
  //this.draw_grid(ctx);

  if (_.isNumber(this.stats.mouse.block_x) && _.isNumber(this.stats.mouse.block_y)) {
    this.stats.population = this.populations.population_at(this.stats.mouse.block_x, this.stats.mouse.block_y);
  }

  HUD.render(this.ctx, this.stats);
  this.TICKS += 1;
  setTimeout(this.mainloop.bind(this), this.timeout);
};

Earth.prototype.draw_grid = function(ctx) {
  ctx.strokeStyle = "#aaa";
  _.each(_.range(1, this.dimensions.h_blocks), function(i) {
    ctx.beginPath();
    var x = i * this.dimensions.block_size;
    ctx.moveTo(x ,0);
    ctx.lineTo(x, this.dimensions.height);
    ctx.stroke();
  }.bind(this));

  _.each(_.range(1, this.dimensions.v_blocks), function(i) {
    ctx.beginPath();
    var y = i * this.dimensions.block_size;
    ctx.moveTo(0 , y);
    ctx.lineTo(this.dimensions.width, y);
    ctx.stroke();
  }.bind(this));
}

module.exports = Earth;
