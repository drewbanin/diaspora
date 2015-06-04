
var Color = require("color");
var FeatureColors = require('./feature_colors');

var ImageProcessor = {

  getBlockFeatures : function(ctx, block, earth_dimensions) {
    var imgd = ctx.getImageData(block.x % earth_dimensions.width, block.y, block.block_size, block.block_size);
    var pix = imgd.data;

    var pixel_counts = {
      water: 0,
      desert: 0,
      forest: 0,
      ice: 0,
    };

    var feature_types = FeatureColors.types;

    var pix_length = pix.length;
    for (var i=0; i < pix_length; i += 4) {
      var pixel = {
        r : pix[i],
        g : pix[i+1],
        b : pix[i+2],
      };

      _.each(feature_types, function(feature) {
        var colors = FeatureColors[feature];
        var is_match = (pixel.r >= colors.r[0] && pixel.r <= colors.r[1] &&
                        pixel.g >= colors.g[0] && pixel.g <= colors.g[1] &&
                        pixel.b >= colors.b[0] && pixel.b <= colors.b[1] );

        if (is_match) {
          pixel_counts[feature] += 1;
        }

      }.bind(this));
    }

    var total_pixels = block.block_size * block.block_size;
    var latitude = block.y;

    return {
      pct_water: pixel_counts.water / total_pixels,
      pct_desert: pixel_counts.desert / total_pixels,
      pct_forest: pixel_counts.forest / total_pixels,
      pct_ice: pixel_counts.ice / total_pixels,
      pct_cold: Math.abs(latitude / earth_dimensions.height - 0.5) * 2,
    }
  },

  processImage: function(ctx, dims) {
    var imgd = ctx.getImageData(0, 0, dims.w, dims.h);
    var pix = imgd.data;

    var num_rows = Math.floor(dims.h / dims.block_size);
    var num_cols = Math.floor(dims.w / dims.block_size);

    var feature_logs = [];

    var drawables = [];
    _(num_rows).times(function(row) {
      _(num_cols).times(function(col) {
        console.log((col + row * num_cols) + ' / ' + (num_rows * num_cols));

        var block = {
          x: col * dims.block_size,
          y: row * dims.block_size,
          block_size: dims.block_size
        };

        var features = this.getBlockFeatures(ctx, block);
        feature_logs.push({block: block, features: features});

        drawables.push({color: color.rgbaString(), x: x, y: y, size: dims.block_size});
      }.bind(this));
    }.bind(this));

    console.log(JSON.stringify(feature_logs));
  },

  render: function(ctx, data) {
    //ctx.clearRect(0, 0, data.dimensions.width, data.dimensions.height);

    _.each(data.blocks, function(item, index) {
      var features = item.features;
      var block = item.block;

      if (features.pct_ice > .8) {
        var r = 255; var g = 255; var b = 255;
      } else {
        var r = features.pct_desert * 255;
        var g = features.pct_forest * 255;
        var b = features.pct_water * 255
      }

      var color = Color({r: r, g: g, b: b, a: 0.7});

      ctx.fillStyle = color.rgbaString();
      ctx.fillRect(block.x, block.y, block.block_size, block.block_size);
    }.bind(this));
  }
};

module.exports = ImageProcessor;
