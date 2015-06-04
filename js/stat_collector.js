
var StatCollector = function(earth, initial_population) {
  this.earth = earth;
  this.record_interval = 100;
  this.initial_position = initial_population.position;
  this.last_tick_time = (new Date()).getTime();
};

StatCollector.prototype.distance = function(from, to) {
  var x = from.block_x - to.block_x;
  var y = from.block_y - to.block_y;
  return Math.sqrt(x*x + y*y);
};

StatCollector.prototype.populations = function() {
  return this.earth.populations.populations;
};

StatCollector.prototype.summary_stats = function() {
  var cur_time = (new Date()).getTime();

  // words can't describe how happy i am that these are all 8 chars...
  var stats = {
    DISP_SUM : 0,
    POP_SIZE : 0,
    MAX_DIST : 0,
    POPS_NUM : 0,
    // V filled in later V
    DISP_AVG : 0,
    MEM_USED : 0,
    LAST_FPS : 0,
  };

  _.each(this.populations(), function(population) {
    var dist = this.distance(population.position, this.initial_position);
    stats.DISP_SUM += dist;
    stats.POP_SIZE += population.size;
    stats.MAX_DIST = Math.max(stats.MAX_DIST, dist);
    stats.POPS_NUM += 1;
  }.bind(this));

  stats.DISP_AVG = stats.DISP_SUM / stats.POPS_NUM;

  // not sure if this works on browsers besides chrome!
  if (window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize) {
    stats.MEM_USED = window.performance.memory.usedJSHeapSize
  }

  stats.LAST_FPS = this.record_interval / ((cur_time - this.last_tick_time) / 1000);
  // record frames per second

  this.last_tick_time = (new Date()).getTime();
  return stats;
};

StatCollector.prototype.tick = function(tick_no) {
  if (tick_no % this.record_interval == 0) {
    // NOT TOO BAD!!!
    var stats = this.summary_stats();

    _.each(stats, function(value, key) {
      console.log("" + tick_no + "," + key + "," + value.toFixed(2));
    }.bind(this));
  }
};

module.exports = StatCollector;
