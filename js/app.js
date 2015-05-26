// Global libs

_ = require('underscore');
$ = require('jquery');

var Earth = require('./script')
//var image_processor = require('./image_processor')

var dimensions = {
  block_size: 16,
  width: 4096,
  height: 2048,
};


var canvas = document.getElementById("earth");
canvas.width  = dimensions.width;
canvas.height = dimensions.height;

var img_src = "/img/earth.png";

$.get('/data/earth.json', function(data) {
  var earth = new Earth(canvas, dimensions, img_src, data);
  earth.mainloop();
}.bind(this));

