
var HUD = require('./hud.js');

var Earth = function(canvas, dimensions, image_src, data) {
  var image_src = image_src;

  this.canvas = canvas;
  this.dimensions = dimensions;
  this.data = data;

  this.ctx = canvas.getContext("2d");

  this.map_image = document.createElement('img');
  this.map_image.src = image_src;

  this.stats = {
    mouse : {
      x: 0,
      y: 0
    }
  };

  canvas.addEventListener('mousemove', function(evt) {
    var rect = this.canvas.getBoundingClientRect();
    this.stats.mouse.x = evt.clientX - rect.left;
    this.stats.mouse.y = evt.clientY - rect.top;
  }.bind(this), false);
};

Earth.prototype.mainloop = function() {
  setInterval(function() {
    this.ctx.clearRect(0 ,0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.map_image, 0, 0, this.dimensions.width, this.dimensions.height);
    HUD.render(this.ctx, this.stats);
  }.bind(this), 100);
};

Earth.prototype.populate = function(ctx, options) {
  var density = 100;
  var position = {
    x: 2300,
    y: 1000,
  };

  return new Population(position, density);
};

module.exports = Earth;
