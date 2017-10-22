var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ReplaceBundleStringPlugin = require('replace-bundle-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: './src/app.js',
    output: {
      path: path.resolve(__dirname, 'extension'),
      filename: 'app.js',
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ReplaceBundleStringPlugin([{
            // Tern uses an older version of Acorn, which embeds an invalid UTF-8 character
            // Chrome doesn't want to load the content script because of that
            // So we replace the character literal with a fromCharCode call
            partten: /\"\\uffff\"/g,
            replacement: function () {
                return "String.fromCharCode(65535)";
            }
        }])
    ],
};

if (process.env.NODE_ENV === 'production') {
	module.exports.plugins.push(
		new UglifyJSPlugin({
			sourceMap: true,
			uglifyOptions: {
				mangle: false,
				output: {
					beautify: true
				}
			}
		})
	);
}
