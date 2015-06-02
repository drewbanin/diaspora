// Global libs

_ = require('underscore');
$ = require('jquery');

var Earth = require('./earth')
var Population = require('./population')

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

var img_src = "/img/earth.png";

var population_dimension = {
  position: {
    block_x: 150,
    block_y: 60,
  },
  size: 100
}
var initial_population = new Population(population_dimension);

var earth = new Earth(canvas, dimensions, img_src, initial_population, function(earth) {
  earth.mainloop();
}.bind(this));

