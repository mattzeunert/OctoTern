var path = require('path');
var webpack = require('webpack');
var StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
  entry: './src/app.js',
  output: { path: "./extension/", filename: 'app.js' },
  module: {
        loaders: [
            {
                test: /\.json$/,
                loader: "json"
            },
            {
                test: /\.js$/,
                loader: StringReplacePlugin.replace({
                    replacements: [{
                        // Tern uses an older version of Acorn, which embeds an invalid UTF-8 character
                        // Chrome doesn't want to load the content script because of that
                        // So we replace the character literal with a fromCharCode call
                        pattern: new RegExp("\"\uffff\""),
                        replacement: function(){
                            return "String.fromCharCode(65535)";
                        }
                    }]
                })
            }
        ]
    },
    plugins: [
        new StringReplacePlugin()
    ]
};