
var HUD = require('./hud.js');
var Populations = require('./populations.js');
var Map = require('./map.js');

var Earth = function(canvas, dimensions, image_src, initial_population, loaded) {
  var image_src = image_src;

  this.canvas = canvas;
  this.dimensions = dimensions;
  this.timeout = 100;

  this.ctx = canvas.getContext("2d");

  this.populations = new Populations(dimensions.block_size);
  this.populations.add(initial_population);

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
  var start = Date.now();
  var ctx = this.ctx;
  ctx.clearRect(0 ,0, this.canvas.width, this.canvas.height);
  ctx.drawImage(this.map_image, 0, 0, this.dimensions.width, this.dimensions.height);

  // this has to come immediately after drawImage before anything else is
  // drawn! it scans the canvas to determine what features exist in the necessary blocks
  this.map.update(this.ctx, this.populations);

  // we need to advance the state before we redraw because some components need
  // to query the map!
  this.populations.step(this.map);

  this.populations.render(ctx);
  this.draw_grid(ctx);

  if (this.stats.mouse.block_x && this.stats.mouse.block_y)
    this.stats.population = this.populations.population_at(this.stats.mouse.block_x, this.stats.mouse.block_y);

  HUD.render(this.ctx, this.stats);
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
