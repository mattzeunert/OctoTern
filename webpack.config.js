var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: { path: "./extension/", filename: 'app.js' },
  module: {
        loaders: [
            { test: /\.json$/, loader: "json" },
        ]
    }
};
