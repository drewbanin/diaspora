

var HUD = {

  render: function(ctx, stats) {
    if (stats.mouse.block_x && stats.mouse.block_y) {
      var text = stats.mouse.block_x + ', ' + stats.mouse.block_y;
      ctx.font = "48px Courier";
      ctx.fillText(text, 48, 48);
    }
  },
}

module.exports = HUD;
