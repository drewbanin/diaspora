// Global libs

_ = require('underscore');
$ = require('jquery');

var Earth = require('./earth')

var dimensions = {
  block_size: 16,
  width: 4096,
  height: 2048,
};

dimensions.h_blocks = dimensions.width / dimensions.block_size;
dimensions.v_blocks = dimensions.height / dimensions.block_size;

var canvas = document.getElementById("earth");
canvas.width  = dimensions.width;
canvas.height = dimensions.height;

ctx = canvas.getContext("2d");

var img_src = "/img/earth-doctored.png";

var population_dimension = {
  position: {
    // ethiopia
    block_x: 150,
    block_y: 60,

    // bering strait
    //block_x: 255,
    //block_y: 16,
  },
  size: 100
}

var earth = new Earth(canvas, ctx, dimensions, img_src, population_dimension, function(earth) {
  earth.mainloop();
}.bind(this));

