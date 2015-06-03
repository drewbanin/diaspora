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

var stripe_img = document.createElement('img');
stripe_img.src = "/img/stripe.png";

// can i do this?
STRIPE_PATTERN = null;
stripe_img.onload = function() {
  STRIPE_PATTERN = ctx.createPattern(stripe_img,"repeat");
}.bind(this);


var img_src = "/img/earth.png";

var population_dimension = {
  position: {
    block_x: 150,
    block_y: 60,
  },
  size: 100
}

var earth = new Earth(canvas, ctx, dimensions, img_src, population_dimension, function(earth) {
  earth.mainloop();
}.bind(this));

