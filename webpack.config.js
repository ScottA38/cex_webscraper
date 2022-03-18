const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = [
  {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(s(a|c)ss)$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new NodePolyfillPlugin()
    ]
  },
  {
    entry: {
      index: "./index.js",
      app: "./app.js"
    },
    output: {
      path: path.resolve(__dirname),
      filename: '[name].babel.js',
    },
    target: 'node',
    externals: [nodeExternals()],
    externalsPresets: {
        node: true
    },
    module: {
      rules: [
        {
          test: [/\.m?js$/],
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new NodePolyfillPlugin()
    ]
  }
]