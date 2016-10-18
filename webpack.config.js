const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const stylelint = require('stylelint');

const parts = require('./libs/parts');

const PATHS = {
  build: path.join(__dirname, 'build'),
  src: path.join(__dirname, 'src'),
  style: path.join(__dirname, 'src', 'styles', 'main.css')
};

const common = {
  entry : {
    main: PATHS.src,
    style: PATHS.style
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        include: PATHS.src
      }
    ]
  },
  postcss: function () {
    return [
      stylelint({
        rules: {
          'color-hex-case': 'lower'
        }
      })
    ];
  },
  plugins : [
    new HtmlWebpackPlugin({
      template: path.join(PATHS.src, 'index.template.ejs'),
      inject: 'body'
    })
  ]
};

let config;

switch (process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.minify(),
      parts.extractStyle(PATHS.style),
      parts.purifyCSS([PATHS.src])
    );
    break;
  default:
    config = merge(
      common,
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      }),
      parts.setupStyle(PATHS.style)
    );
}

module.exports = validate(
  config,
  {
    quiet: true
  }
);
