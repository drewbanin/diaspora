

var HUD = {

  render: function(ctx, stats) {
    if (stats.mouse.block_x && stats.mouse.block_y) {

      ctx.fillStyle = "#000";
      var font_size = 24;
      var rect = ctx.canvas.getBoundingClientRect();
      var x = -rect.left + font_size;
      var y = -rect.top + font_size;
      ctx.font = "" + font_size + "px Courier";

      var text = stats.mouse.block_x + ', ' + stats.mouse.block_y;
      ctx.fillText(text, x, y);

      _.each(stats.features, function(pct, key) {
        y += font_size;
        text = key + "=" + (pct * 100).toFixed(2);
        ctx.fillText(text.substring(4), x, y);
      });

      y += font_size;
      ctx.fillText("score=" + stats.score.score, x, y);

      y += font_size;
      ctx.fillText("livable=" + stats.score.possible, x, y);

      var pop_size = !!stats.population ? stats.population.size : 0;
      y += font_size;
      ctx.fillText("pop=" + pop_size, x, y);

      if (pop_size > 0) {
        y += font_size;
        ctx.fillText("ticks_alive=" + stats.population.num_ticks, x, y);
      }
    }
  },
}

module.exports = HUD;
