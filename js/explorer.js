
var Color = require("color");

var STATES = {
  exploring: "exploring",
  returning: "returning",
  chilling: "chilling",
};

var MAX_DISTANCE = 10;

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

  this.global_ticks = 1;
};

Explorer.prototype.step = function(map, global_ticks, populations) {
  this.global_ticks = global_ticks;

  if (this.is_exploring() && !this.reached_target()) {
    var valid = this.move_to_target(map);
    if (!valid)
      this.return_to_home();
    else {
      var hosp_here = map.get_hospitability(this.position.block_x, this.position.block_y);
      if (hosp_here.score > this.best.score && !populations.occupied(this.position)) {
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
    // TODO : don't actually do multiplication here
    var adjusted_best_score = !!this.best.pos ? this.best.score * this.distance(this.population.position, this.best.pos) : 0;
    this.state = STATES.chilling;
    if (pop_hosp.score < adjusted_best_score) {
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
    }
  } else if (this.state == STATES.chilling) {
  }

  if (this.population.size < 1) {
    //this.population.delete_explorer();
  }
};

Explorer.prototype.distance = function(from, to) {
  var x = from.block_x - to.block_x;
  var y = from.block_y - to.block_y;
  return Math.sqrt(x*x + y*y);
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
  var max_distance = Math.floor(Math.log(this.global_ticks + 1));
  this.target_pos = this.random_pos_from_here(max_distance);
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

Explorer.prototype.random_pos_from_here = function(max_distance) {
  var dx = _.random(0, max_distance);
  var dy = _.random(0, max_distance);

  if (_.random(0,1) == 1) dx *= -1;
  if (_.random(0,1) == 1) dy *= -1;

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
  if (this.state == STATES.chilling) color = Color({r: 0, g: 0, b: 0, a: 0});
  if (this.state == STATES.exploring) color = Color({r: 255, g: 255, b: 255, a: 0.5});
  if (this.state == STATES.returning) color = Color({r: 0, g: 0, b: 0, a: 0.5});
  return color.rgbaString();
};

module.exports = Explorer;
