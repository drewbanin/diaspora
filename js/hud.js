

var HUD = {

  render: function(ctx, stats) {
    if (stats.mouse.block_x && stats.mouse.block_y) {
      var rect = ctx.canvas.getBoundingClientRect();
      var x = -rect.left + 48;
      var y = -rect.top + 48;
      ctx.font = "48px Courier";

      var text = stats.mouse.block_x + ', ' + stats.mouse.block_y;
      ctx.fillText(text, x, y);

      _.each(stats.features, function(pct, key) {
        y += 48;
        text = key + "=" + Math.floor(pct * 100);
        ctx.fillText(text.substring(4), x, y);
      });
    }
  },
}

module.exports = HUD;
