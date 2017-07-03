/*
The MIT License (MIT)

Copyright (c) 2015-present C. T. Lin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import webpack from "webpack";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";
import ExtractTextPlugin from "extract-text-webpack-plugin";

const port = process.env.PORT || 3000;

export default merge(baseConfig, {
  devtool: "inline-source-map",

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    "babel-polyfill",
    "./app/index"
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: ExtractTextPlugin.extract({
          use: "css-loader",
          fallback: "style-loader"
        })
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: ExtractTextPlugin.extract({
          use: {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]__[local]__[hash:base64:5]"
            }
          }
        })
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader"
            },
            {
              loader: "sass-loader"
            }
          ],
          fallback: "style-loader"
        })
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: "[name]__[local]__[hash:base64:5]"
              }
            },
            {
              loader: "sass-loader"
            }
          ]
        })
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff"
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff"
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/octet-stream"
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader"
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "image/svg+xml"
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader"
      }
    ]
  },

  plugins: [
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
    // https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
    new webpack.NoErrorsPlugin(),

    // NODE_ENV should be production so that modules do not perform certain development checks
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    }),

    new ExtractTextPlugin({
      filename: "[name].css"
    })
  ],

  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: "electron-renderer"
});
