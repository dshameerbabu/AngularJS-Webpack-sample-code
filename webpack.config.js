var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var pathApp;

function pathTo() {
  return path.join(__dirname, 'src', path.join.apply(path, arguments));
}

pathApp = _.partial(pathTo, 'app');

var maxImageSize = '10000';
// For loading splash screen images.
var base64ImageSize = '10000000';

module.exports = function (options) {
  var config = _.merge({}, {
    entry: {
      vendor: [
        'font-awesome/css/font-awesome.min.css',
        'bootstrap/dist/css/bootstrap.min.css',
        'bootstrap/dist/css/bootstrap-theme.min.css',
        'bootstrap/dist/js/bootstrap.min.js',

        'jquery',
        'bluebird',
        'lodash',

        'angular',
        'angular-animate',
        'angular-aria',
        'angular-ui-router',

        'angular-strap/dist/angular-strap.min.js',
        'angular-strap/dist/angular-strap.tpl.min.js'
      ]
    },
    output: {
      path: path.join( __dirname, 'build' ),
      filename: 'js/[name]-[hash].js',
      chunkFilename: "[id]-[hash].js",
      publicPath: '/'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.ProvidePlugin( {
        jQuery: 'jquery',
        $: 'jquery',
        'window.jQuery': 'jquery'
      }),
      new webpack.optimize.CommonsChunkPlugin( 'vendor', 'js/vendor-[hash].js' ),
      new ExtractTextPlugin('css/[name]-[id]-[contenthash].css')
    ],
    resolve: {
      extensions: [ '', '.js' ],
      alias: {
        // app sub aliases
        // assets sub aliases
        assets: pathTo( 'assets' ),
        // vendor aliases
        jquery: 'jquery/dist/jquery.min.js'
      }
    },
    module: {
      loaders: [
        {
          test: /\.html$/,
          loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './src/app')) + '/!html'
        },
        {
          test: /\.scss$/,
          // loaders: ["style-loader", "css-loader?sourceMap", "sass?sourceMap"]
          loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!sass-loader")
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")
        },
        // {
        //   test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: 'url-loader?name=assets/[name]-[hash].[ext]&limit=10000&mimetype=application/font-woff'
        // },
        { test: /\.gif$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=image/gif"
        },
        { test: /\.jpg$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=image/jpg"
        },
        { test: /\.jpeg$/ ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=image/jpeg"
        },
        { test: /\.png$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=image/png"
        },
        { test: /\.(svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=image/svg+xml"
        },
        { test: /\.(woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/ ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=application/font-woff"
        },
        { test: /\.(woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=application/font-woff2"
        },
        { test: /\.(ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=application/vnd.ms-fontobject"
        },
        { test: /\.(eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + maxImageSize + "&mimetype=application/x-font-ttf"
        },
        //Its is for particualr images where we want to load them at splash screens.
        { test: /\.png\?make\-base64$/  ,
          loader: "url?name=assets/[name]-[hash].[ext]&limit=" + base64ImageSize + "&mimetype=image/png"
        },

        // {
        //   test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: 'file-loader?name=assets/[name]-[hash].[ext]'
        // },
        {
          test: /\.(mp3|mp4)$/,
          loader: 'file-loader?name=assets/[name]-[hash].[ext]'
        }

        // ,
        // Any png-image or woff-font below or equal to 100K will be converted
        // to inline base64 instead
        // { test: /\.(png|woff)$/, loader: 'url-loader?limit=100000' }

      ]
    }
  }, options.overrides);

  config.module.loaders = _.union(config.module.loaders, options.loaders);
  config.plugins = _.union(config.plugins, options.plugins);

  return config;
};