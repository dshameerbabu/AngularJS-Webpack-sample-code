var path = require( 'path' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var webpack = require( 'webpack' );
var gulpWebpack = require( 'gulp-webpack' );
var WebpackDevServer = require( 'webpack-dev-server' );
//var stylus = require( 'gulp-stylus' );
var clean = require( 'gulp-clean' );
var opener = require('opener');
var runSequence = require( 'run-sequence' );
var argv = require('yargs').argv;

var port = argv.port || '3000';

function handleError( task ) {
    return function ( err ) {
        this.emit( 'end' );
        gutil.log( 'Error handler for', task, err.toString() );
    };
}

var buildPath = 'build/' + (argv.stage || 'live') + '/';

// The development server (the recommended option for development)
gulp.task( 'default', [ 'webpack-dev-server'/*, 'stylus:compile'*/ ] );

gulp.task( 'webpack-dev-server', function ( callback ) {
    var config = Object.create( require( './webpack.dev.js' ) );

    var urlToOpen = 'http://localhost:' + port;

    // Start a webpack-dev-server
    new WebpackDevServer( webpack( config ), {
        contentBase: path.join( __dirname, buildPath ),
        publicPath: config.output.publicPath,
        hot: true,
        historyApiFallback: true,
        stats: {
            colors: true
        }
    } ).listen( port, '0.0.0.0', function ( err ) {
        if ( err ) {
            throw new gutil.PluginError( 'webpack-dev-server', err );
        }
        gutil.log( '[webpack-dev-server]', urlToOpen );
        opener(urlToOpen);
        callback();
    } );

} );
gulp.task( 'clean:build', function () {
    return gulp.src( buildPath + '*', { read: false } )
        .pipe( clean() );
} );

gulp.task( 'build:cp:index', function () {
    return gulp.src( [
            './src/assets/favicon.ico'
        ] )
        .pipe( gulp.dest( buildPath ) );
} );

gulp.task( 'build:webpack', function () {
    return gulp.src( 'src/app/app.js' )
        .pipe( gulpWebpack( require( './webpack.prod.js' ), webpack ) )
        .pipe( gulp.dest( buildPath ) );
} );

gulp.task('copy:HelpDoc', function (){
    return gulp.src( './src/assets/helpDocs/**')
        .pipe(gulp.dest(buildPath + '/assets/helpDocs/'));
});

gulp.task( 'build', function ( cb ) {
    runSequence(
        'clean:build',
        'build:cp:index',
        'build:webpack',
        'copy:HelpDoc',
        cb
    );
} );