
var Color = require("color");

var STATES = {
  exploring: "exploring",
  returning: "returning",
  chilling: "chilling",
};

var MAX_DISTANCE = 5;

var Explorer = function(population) {
  this.population = population;
  this.position = {
    block_x: population.position.block_x,
    block_y: population.position.block_y,
  }

  this.state = STATES.chilling;
  this.target_pos = null;
  this.moves = [];
  this.moves_from_target = [];

  this.best = {
    score: 0,
    pos: null,
  };
};

Explorer.prototype.step = function(map) {
  if (this.is_exploring() && !this.reached_target()) {
    var valid = this.move_to_target(map);
    if (!valid)
      this.return_to_home();
    else {
      var hosp_here = map.get_hospitability(this.position.block_x, this.position.block_y);
      if (hosp_here.score > this.best.score) {
        this.best.score = hosp_here.score;
        this.best.pos = this.position;
      }
    }
  } else if (this.is_exploring() && this.reached_target()) {
    this.return_to_home();
  } else if (this.state == STATES.returning && !this.reached_home()) {
    var move = this.moves.pop();
    this.moves_from_target.push(move);
    this.position = move;
  } else if (this.state == STATES.returning && this.reached_home()) {
    var pop_hosp = map.get_hospitability(this.population.position.block_x, this.population.position.block_y);
    if (this.best.score > pop_hosp.score) {
      this.state = STATES.chilling;
      console.log('moving population from', this.population.position, 'to', this.best.pos, 'because', this.best.score, '>', pop_hosp.score);
      var move_subset = [];
      var found = false;
      _.each(this.moves_from_target, function(move) {
        if (move.block_x == this.best.pos.block_x && move.block_y == this.best.pos.block_y) found = true;
        if (found) move_subset.push(move);
      }.bind(this));
      // only take the moves up to the one with the highest score
      this.population.relocate(this.best.pos, move_subset);
      this.best = { score: 0, pos: null };
      this.moves_from_target = [];
      this.moves = [];
    } else {
      this.best = { score: 0, pos: null };
      this.moves = [];
      this.moves_from_target = [];
      this.explore();
    }
  } else if (this.state == STATES.chilling) {
    //this.explore();
  }
};

Explorer.prototype.reached_home = function(map) {
  return this.population.position.block_x == this.position.block_x &&
         this.population.position.block_y == this.position.block_y;
};

Explorer.prototype.reached_target = function(map) {
  return this.target_pos.block_x == this.position.block_x &&
         this.target_pos.block_y == this.position.block_y;
};

Explorer.prototype.is_exploring = function(map) {
  return this.state == STATES.exploring;
};


Explorer.prototype.return_to_home = function(map) {
  this.state = STATES.returning;
};

Explorer.prototype.explore = function(map) {
  this.state = STATES.exploring;
  this.moves.push(this.population.position);
  this.target_pos = this.random_pos_from_here(MAX_DISTANCE);
};

Explorer.prototype.move_to_target = function(map) {
  var distance_dx = this.target_pos.block_x - this.position.block_x;
  var distance_dy = this.target_pos.block_y - this.position.block_y;

  var dx = 0;
  var dy = 0;
  if (distance_dx != 0)
    dx = distance_dx > 0 ? 1 : -1;

  if (distance_dy != 0)
    dy = distance_dy > 0 ? 1 : -1;

  var new_pos = {
    block_x : this.position.block_x + dx,
    block_y : this.position.block_y + dy,
  }

  var hosp = map.get_hospitability(new_pos.block_x, new_pos.block_y);
  if (hosp.possible) {
    this.position = new_pos;
    this.moves.push(new_pos);
  } else {
    this.moves.push(this.position);
  }
  return hosp.possible;
};

Explorer.prototype.random_pos_from_here = function(MAX_DISTANCE) {
  var dx = _.random(0, MAX_DISTANCE * 2) - MAX_DISTANCE;
  var dy = _.random(0, MAX_DISTANCE * 2) - MAX_DISTANCE;
  return {
    block_x: this.position.block_x + dx,
    block_y: this.position.block_y + dy,
  };
};


Explorer.prototype.render = function(ctx, block_size) {
  var radius = block_size / 5;

  var x = this.position.block_x * block_size;
  var y = this.position.block_y * block_size;
  ctx.fillStyle = this.get_color();
  ctx.beginPath();
  ctx.arc(x + block_size / 2, y + block_size / 2, radius, 0, 2 * Math.PI);
  ctx.fill();
};

Explorer.prototype.get_color = function() {
  var color;
  if (this.state == STATES.chilling) color = Color({r: 0, g: 0, b: 255});
  if (this.state == STATES.exploring) color = Color({r: 255, g: 0, b: 0});
  if (this.state == STATES.returning) color = Color({r: 0, g: 255, b: 0});
  return color.rgbaString();
};

module.exports = Explorer;
