

var HUD = {

  render: function(ctx, stats) {
    var text = stats.mouse.x + ', ' + stats.mouse.y;
    ctx.font = "48px Times";
    ctx.fillText(text, 48, 48);
  },
}

module.exports = HUD;
