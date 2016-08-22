// include gulp
var gulp = require('gulp');
var gulpUtil = require('gulp-util');
// include plug-ins
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var debug = require('gulp-debug');
var gutil = require('gulp-util');
var streamqueue = require('streamqueue');
var rename = require('gulp-rename');
var RevAll = require('gulp-rev-all');
var handlebars = require('gulp-compile-handlebars');
var fs = require('fs');
var file = require('gulp-file');
var execfile = require('./lib/execfile');

var argv = require('yargs')
            //.default('build-env', 'devBuild') // Let's make it mandatory to give the build environment
            .usage('Usage: gulp --build-env devBuild [task-name]')
            .example('$0 --build-env devBuild', 'Run the `default` task for `devBuild` environment.')
            .example('$0 --build-env devBuild scripts', 'Run the `scripts` task for `devBuild` environment.')
            .demand('build-env')
            .describe('build-env', 'Name of environment to build the app like dev, qa, prod, devBuild')
            .help('h')
            .alias('h', 'help')
            .argv;

var allTasks = [];
var buildPath = 'buildRelease';
var assetsConfigFile = 'js/assets-path-config.js';

var copyAllFiles = {
    fonts     : {
        src : 'fonts/**/*',
        dest: buildPath + '/fonts'
    },
    // html      : {
    //     src : ['html/**/*', '!html/**/*.hbs'],
    //     dest: buildPath + '/html/'
    // },
    // images    : {
    //     src : 'images/**/*',
    //     dest: buildPath + '/images'
    // },
    // json      : {
    //     src : 'json/**/*',
    //     dest: buildPath + '/json'
    // },
    // xml       : {
    //     src : 'xml/**/*',
    //     dest: buildPath + '/xml'
    // },
    
    // writingFunDocs: {
    //     src : 'writingFunDocs/**/*',
    //     dest: buildPath + '/writingFunDocs'
    // },
    // menuJson      : {
    //     src : 'js/panels/menu.json',
    //     dest: buildPath + '/js/panels'
    // },
    helpDocs: {
        src : 'helpDocs/**/*',
        dest: buildPath + '/helpDocs'
    },

    wegAssets: {
      src : 'src/assets/**/*',
      dest: buildPath + '/src/assets'
    },
    wegPartials: {
      src : 'src/eventPanel/partial/**/*',
      dest: buildPath + '/src/eventPanel/partial/'
    },
    wegAppPartials: {
      src : 'src/test/partial/**/*',
      dest: buildPath + '/src/test/partial/'
    }
};

var taskCopy = function (key, paths, previousKey) {
    var taskKey = 'copy:' + key;
    var dependency = previousKey ? [previousKey] : [];
    if (paths.rename) {
        gulp.task(taskKey, dependency, function(){
            return gulp.src(paths.src)
                .pipe(rename(paths.rename))
                .pipe(gulp.dest(paths.dest));
        });
    } else {
        gulp.task(taskKey, dependency, function(){
            return gulp.src(paths.src)
                .pipe(gulp.dest(paths.dest));
        });
    }
    return taskKey;
};

function copyDone(dependency){
    var taskKey = 'copy:done';
    gulp.task(taskKey, dependency, function(cb){
        return cb();
    });
}

function getBuildEnv(){
    var buildEnv = argv.buildEnv || 'devBuild'; //default is `devBuild`
    var assetsPaths = getAssetsConfig() || {};

    if(!assetsPaths[buildEnv]){
        
        gulpUtil.log(gulpUtil.colors.red('✗ ' + gulpUtil.colors.cyan(buildEnv) + ' build path is not found' + 
                        ' in ' + gulpUtil.colors.cyan('/' + assetsConfigFile) + ' config.'));
        showEnvs();

        //If build environment is not correct then exit from gulp task
        process.exit();
    }

    return buildEnv;
}

function showEnvs(){
    var assetsPaths = getAssetsConfig() || {};
    var envs = [];

    for(var k in assetsPaths){
        envs.push(k);
    }
    
    if(envs.length > 0){
        gulpUtil.log(gulpUtil.colors.magenta('Following build environments are available in our config file : ') + 
            gulpUtil.colors.cyan('/' + assetsConfigFile));
        for(var en in envs){
            gulpUtil.log(gulpUtil.colors.gray('\u2022 ') + gulpUtil.colors.cyan(envs[en]));
        }
    }else{
        gulpUtil.log(gulpUtil.colors.red('There is no any environment is defined at ') + 
            gulpUtil.colors.cyan('/' + assetsConfigFile));
    }
}

function getAssetsConfig(){
    var config = execfile('./' + assetsConfigFile);
    return config.assetsConfig;
}



var jsBuildPath = buildPath + '/js/';

// JS concat, strip debugging and minify
gulp.task('scripts', function () {
    getBuildEnv();
    
    return streamqueue({objectMode: true},
        // gulp.src("./js/thirdparty/jquery-2.0.3.min.js"),
        // gulp.src("./js/thirdparty/angular.min.js"),
        // gulp.src("./js/thirdparty/angular-route.js"),
        // gulp.src("./js/thirdparty/angular-animate.js"),
        // gulp.src("./js/thirdparty/angular-touch.js"),
        // gulp.src("./js/thirdparty/angular-sanitize.js"),
        // gulp.src("./js/thirdparty/bowser.js"),
        // gulp.src("./js/thirdparty/ui-bootstrap-tpls-0.11.0.js"),
        // gulp.src("./js/thirdparty/jquery.xml2json.js"),
        // gulp.src("./js/utils/jquery-css-transform.js"),
        // gulp.src("./js/thirdparty/app-config.min.js"),
        // gulp.src("./js/configModule/configFileModule.js"),
        // gulp.src("./script/jquery.slimscroll.js"),
        // gulp.src("./script/classSelectionScrollBar.js"),
        // gulp.src("./js/utils/animationAPI.js"),
        // gulp.src("./js/utils/jquery-animate-css-rotate-scale.js"),
        // gulp.src("./js/thirdparty/underscore-min.js"),
        // gulp.src("./js/thirdparty/bililiteRange.js"),
        // gulp.src("./js/thirdparty/jquery.sendkeys.js"),
        // gulp.src("./script/prettify.js"),
        // gulp.src("./js/helper/worldMap.js"),
        // gulp.src("./js/thirdparty/lodash.min.js"),
        // gulp.src("./js/thirdparty/xml2json.min.js"),
        // gulp.src("./js/thirdparty/moment.min.js"),
        // gulp.src("./js/path-mapping.js"),
        // gulp.src("./js/assets-path-config.js"),

        // Weg integration
        gulp.src("./js/thirdparty/angular-ui-router.js"),
        gulp.src("./src/eventPanel/eventPanel.js"),
        gulp.src("./src/eventPanel/service/eventService.js"),
        gulp.src("./src/eventPanel/service/eventResultsService.js"),
        gulp.src("./src/eventPanel/service/evtSrvConfig.js"),
        gulp.src("./src/eventPanel/directive/eventRoundProgressDirective.js"),
        gulp.src("./src/eventPanel/directive/eventPanelDirective.js"),
        gulp.src("./src/eventPanel/directive/clickOutsideDirective.js"),
        gulp.src("./src/eventPanel/factory/eventFactory.js"),
        gulp.src("./src/test/service/eventInfoService.js"),
        gulp.src("./src/test/controller/testController.js"),
        // Weg integration

        // gulp.src("./js/libs/main.js"),
        // gulp.src("./js/helper/Enviroment.js"),
        // gulp.src("./js/helper/BaseController.js"),
        // gulp.src("./js/helper/StaticObjects.js"),
        // gulp.src("./js/helper/Utility.js"),
        // gulp.src("./js/helper/Ajax.js"),
        // gulp.src("./js/helper/DataApi.js"),
        // gulp.src("./js/helper/Logger.js"),
        // gulp.src("./js/helper/RestUrls.js"),
        // gulp.src("./js/libs/HeaderPanel.js"),
        // gulp.src("./js/libs/FooterPanel.js"),
        // gulp.src("./js/libs/LeftPanel.js"),
        // gulp.src("./js/libs/RightPanel.js"),
        // gulp.src("./js/helper/crossWordGenerator.js"),
        // gulp.src("./js/panels/header/staticheader/StaticHeader.js"),
        // gulp.src("./js/panels/footer/staticfooter/StaticFooter.js"),
        // gulp.src("./js/panels/right/MyWordList.js"),
        // gulp.src("./js/panels/header/staticheader/Menus.js"),
        // gulp.src("./js/panels/left/Template.js"),
        // gulp.src("./js/panels/right/millenniumGallery.js"),
        // gulp.src("./js/panels/right/liveReport.js"),
        // gulp.src("./js/panels/right/CyclobotChallenge.js"),
        // gulp.src("./js/panels/right/LiveSpellodrome.js"),
        // gulp.src("./js/panels/right/FindAWord.js"),
        // gulp.src("./js/panels/right/crossWord.js"),
        // gulp.src("./js/thirdparty/jquery.overlaps.js"),
        // gulp.src("./js/utils/drag-pieces.js"),
        // gulp.src("./js/panels/right/wordInPieces.js"),
        // gulp.src("./js/utils/replaceTextWritingFun.js"),
        // gulp.src("./js/panels/right/WritingFun.js"),
        // gulp.src("./js/panels/right/myResult.js"),
        // gulp.src("./js/panels/right/cyclobotRevenge.js"),
        // gulp.src("./js/panels/header/staticheader/Menus.js"),
        // gulp.src("./js/libs/Layout.js"),
        // gulp.src("./js/utils/wordsearch.js"),
        // gulp.src("./js/utils/replaceTextWritingFun.js"),
        // gulp.src("./js/directives/BA-SqureMatrix.js"),
        // gulp.src("./js/directives/myWordList.js"),
        // gulp.src("./js/directives/BA-Pieces.js"),
        // gulp.src("./js/helper/AppLoader.js"),
        // gulp.src("./js/services/crossWordDataService.js"),
        // gulp.src("./js/services/face-maker.js"),
        // gulp.src("./js/services/redirect-to-loginpage.js"),
        // gulp.src("./js/panels/right/HomePage.js"),
        gulp.src("./js/panels/right/LoginPage.js")
    )
    .pipe(debug())
    .pipe(concat('script.min.js'))
    .pipe(uglify({compress: {drop_debugger: true}}))
    .pipe(gulp.dest(jsBuildPath))
    .on('success', function () {
        console.log('done');
    })
    .on('error', gutil.log);
});

var cssBuildPath = buildPath + '/css/';

// CSS concat, auto-prefix and minify
gulp.task('styles', ['scripts'], function () {
    return streamqueue({objectMode: true},
        // gulp.src("./css/bootstrap.min.css"),
        // gulp.src("./css/bootstrap-responsive.min.css"),
        // gulp.src("./css/bootstrap-theme.css"),
        // gulp.src("./css/bootstrap-theme.min.css"),
        // gulp.src("./css/angular-carousel.css"),
        // gulp.src("./css/main.css"),
        // gulp.src("./css/homepage.css"),
        // gulp.src("./css/findAWord.css"),
        // gulp.src("./css/keyBoard.css"),
        // gulp.src("./css/crossword-print.css"),
        // gulp.src("./css/crossword.css"),
        // gulp.src("./css/myWordList.css"),
        // gulp.src("./css/print-certificate.css"),
        // gulp.src("./css/millenniumGallery.css"),
        // gulp.src("./css/login.css"),
        // gulp.src("./css/global.css"),
        // gulp.src("./css/loader.css"),
        // gulp.src("./css/media-css.css"),
        // gulp.src("./css/font-css.css"),
        // gulp.src("./css/cyclobotChallenge.css"),
        // gulp.src("./css/liveSpellodrome.css"),
        // gulp.src("./css/livespello-flag.css"),
        // gulp.src("./css/Cyclobot_Revenge.css"),
        // gulp.src("./css/my-result-print.css"),
        // gulp.src("./css/wordInPieces.css"),
        // gulp.src("./css/writing-fun-letter-print.css"),
        gulp.src("./css/writingFun.css"),

        // Weg integration
        gulp.src("./src/eventPanel/styles/eventPanel.css"),
        gulp.src("./src/styles/eventPanelContainer.css"),
        gulp.src("./src/styles/eventPanelOverride.css")
        // Weg integration
    )
    .pipe(debug())
    .pipe(concat('styles.min.css'))
    .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
    .pipe(gulp.dest(cssBuildPath))

    .on('success', function () {
        console.log('done');
    })
    .on('error', gutil.log);
});

gulp.task('print:find-a-word:scripts', ['create-index', 'copy:done'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./js/thirdparty/angular.min.js"),
        gulp.src("./js/panels/right/findAWord-Print.js")
    )
    .pipe(debug())
    .pipe(concat('find-a-word-print-script.min.js'))
    .pipe(uglify({compress: {drop_debugger: true}}))
    .pipe(gulp.dest(jsBuildPath))
    .on('success', function () {
        console.log('done');
    })
    .on('error', gutil.log);
});

gulp.task('print:find-a-word:styles', ['print:find-a-word:scripts'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./css/global.css"),
        gulp.src("./css/media-css.css"),
        gulp.src("./css/findAWord.css")
    )
    .pipe(debug())
    .pipe(concat('find-a-word-print-styles.min.css'))
    .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
    .pipe(gulp.dest(cssBuildPath))
    .on('success', function () {
        console.log('done');
    })
    .on('error', gutil.log);
});


gulp.task('print:find-a-word:html', ['print:find-a-word:styles'], function () {
    var data = {
        jsFilePath : '/js/find-a-word-print-script.min.js',
        cssFilePath: '/css/find-a-word-print-styles.min.css'
    }

    return gulp.src('html/panels/right/find-a-word.hbs')
           .pipe(handlebars(data))
           .pipe(rename('find-a-word-print.html'))
           .pipe(gulp.dest(buildPath + '/html/panels/right/'));
});

gulp.task('print:crossword-scripts', ['print:find-a-word:html'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./js/thirdparty/jquery-2.0.3.min.js"),
        gulp.src("./js/thirdparty/angular.min.js"),
        gulp.src("./js/panels/right/crossWord-Print.js")
    )
        .pipe(debug())
        .pipe(concat('crossword-print-script.min.js'))
        .pipe(uglify({compress: {drop_debugger: true}}))
        .pipe(gulp.dest(jsBuildPath))
        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:crossword-styles', ['print:crossword-scripts'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./css/global.css"),
        gulp.src("./css/media-css.css"),
        gulp.src("./css/crossword-print.css")
    )
        .pipe(debug())
        .pipe(concat('crossword-print-styles.min.css'))
        .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
        .pipe(gulp.dest(cssBuildPath))

        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:crossword:html', ['print:crossword-styles'], function () {
    var data = {
        jsFilePath : '/js/crossword-print-script.min.js',
        cssFilePath: '/css/crossword-print-styles.min.css'
    }

    return gulp.src('html/panels/right/crossword.hbs')
           .pipe(handlebars(data))
           .pipe(rename('crossword-print.html'))
           .pipe(gulp.dest(buildPath + '/html/panels/right/'));

});



gulp.task('print:myresult-scripts', ['print:crossword:html'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./js/thirdparty/jquery-2.0.3.min.js"),
        gulp.src("./js/thirdparty/angular.min.js"),
        gulp.src("./js/thirdparty/lodash.min.js"),
        gulp.src("./js/panels/right/myResult-Print.js")
    )
        .pipe(debug())
        .pipe(concat('myresult-print-script.min.js'))
        .pipe(uglify({compress: {drop_debugger: true}}))
        .pipe(gulp.dest(jsBuildPath))
        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:myresult-styles', ['print:myresult-scripts'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./css/global.css"),
        gulp.src("./css/media-css.css"),
        gulp.src("./css/findAWord.css"),
        gulp.src("./css/my-result-print.css")
    )
        .pipe(debug())
        .pipe(concat('myresult-print-styles.min.css'))
        .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
        .pipe(gulp.dest(cssBuildPath))

        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:myresult:html', ['print:myresult-styles'], function () {
    var data = {
        jsFilePath : '/js/myresult-print-script.min.js',
        cssFilePath: '/css/myresult-print-styles.min.css'
    }

    return gulp.src('html/panels/right/myResult-print.hbs')
           .pipe(handlebars(data))
           .pipe(rename('myResult-print.html'))
           .pipe(gulp.dest(buildPath + '/html/panels/right/'));

});


gulp.task('print:writing-fun-letter:scripts', ['print:myresult:html'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./js/thirdparty/angular.min.js"),
        gulp.src("./js/panels/right/writing-fun-letter-print.js")
    )
        .pipe(debug())
        .pipe(concat('writing-fun-letter-print-script.min.js'))
        .pipe(uglify({compress: {drop_debugger: true}}))
        .pipe(gulp.dest(jsBuildPath))
        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:writing-fun-letter:styles', ['print:writing-fun-letter:scripts'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./css/global.css"),
        gulp.src("./css/media-css.css"),
        gulp.src("./css/writingFun.css"),
        gulp.src("./css/writing-fun-letter-print.css")
    )
        .pipe(debug())
        .pipe(concat('writing-fun-letter-styles.min.css'))
        .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
        .pipe(gulp.dest(cssBuildPath))

        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:writing-fun-letter:html', ['print:writing-fun-letter:styles'], function () {    var data = {
        jsFilePath : '/js/writing-fun-letter-print-script.min.js',
        cssFilePath: '/css/writing-fun-letter-styles.min.css'
    }

    return gulp.src('html/panels/right/writing-fun-letter-print.hbs')
        .pipe(handlebars(data))
        .pipe(rename('writing-fun-letter-print.html'))
        .pipe(gulp.dest(buildPath + '/html/panels/right/'));

});



gulp.task('print:millennium-scripts', ['print:writing-fun-letter:html'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./js/thirdparty/angular.min.js"),
        gulp.src("./js/panels/right/millenniumgallery-print.js")
    )
        .pipe(debug())
        .pipe(concat('millennium-gallery-print-script.min.js'))
        .pipe(uglify({compress: {drop_debugger: true}}))
        .pipe(gulp.dest(jsBuildPath))
        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:millennium-styles', ['print:millennium-scripts'], function () {
    return streamqueue({objectMode: true},
        gulp.src("./css/global.css"),
        gulp.src("./css/media-css.css")
    )
        .pipe(debug())
        .pipe(concat('millennium-gallery-print-styles.min.css'))
        .pipe(minifyCSS({keepBreaks: false, keepSpecialComments: 0, debug: true}))
        .pipe(gulp.dest(cssBuildPath))

        .on('success', function () {
            console.log('done');
        })
        .on('error', gutil.log);
});

gulp.task('print:millennium:html', ['print:millennium-styles'], function () {
    var data = {
        jsFilePath : '/js/millennium-gallery-print-script.min.js',
        cssFilePath: '/css/millennium-gallery-print-styles.min.css',
        imagePath:'{{imageForCertificate}}'
    }

    return gulp.src('html/panels/right/millenniumGallery.hbs')
           .pipe(handlebars(data))
           .pipe(rename('millenniumGallery-print.html'))
           .pipe(gulp.dest(buildPath + '/html/panels/right/'));

});




gulp.task('revision-all', ['print:millennium:html'], function () {
    var assetsPaths = getAssetsConfig();
    var prefixPath = (assetsPaths[getBuildEnv()]).assetsUrl;

    var options = {
        prefix             : prefixPath + '/', // TODO: check if path has trailing forward-slash or not
        dontRenameFile     : [/^\/favicon.ico$/g, /\.html$/, /^\/index.html/g, '.pdf'],
        dontUpdateReference: ['.html','.pdf'],
        debug              : false
    };

    var revAll = new RevAll(options);
    var assetsPath = buildPath + '/assets/cdn/';

    return gulp.src([
        // buildPath + '/js/**',
        // buildPath + '/css/**',
        // buildPath + '/html/**',
        // buildPath + '/images/**',
        // buildPath + '/writingFunDocs/**',
        // buildPath + '/helpDocs/**',
        // buildPath + '/fonts/**',
        // buildPath + '/json/**',
        // buildPath + '/xml/**',

        buildPath + '/src/assets/**',
        buildPath + '/src/eventPanel/partial/**',
        buildPath + '/src/test/partial/**',

        buildPath + '/index.html'
    ])
        .pipe(revAll.revision())
        .pipe(gulp.dest(assetsPath))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest(assetsPath))
        .pipe(revAll.versionFile())
        .pipe(gulp.dest(assetsPath))
        .on('success', function () {
            console.log('done: revision-all');
        })
        .on('error', gutil.log);
});


gulp.task('create-index', function(){
    var data = {
        currentEnvironment: getBuildEnv()
    };

    return gulp.src('index.hbs')
           .pipe(handlebars(data))
           .pipe(rename('index.html'))
           .pipe(gulp.dest(buildPath));
});

gulp.task('copy:index', ['revision-all'], function () {
    return gulp.src(buildPath + '/assets/cdn/index.html')
        .pipe(gulp.dest(buildPath));
});

gulp.task('copy:HelpDoc',['copy:index'], function (){
    return gulp.src( buildPath + '/helpDocs/**')
        .pipe(gulp.dest(buildPath + '/assets/cdn/helpDocs/'));
});


allTasks.push('scripts');
allTasks.push('styles');

var previousTask = 'styles';
for (var path in copyAllFiles) {
    previousTask = taskCopy(path, copyAllFiles[path], previousTask);

    allTasks.push(previousTask);
}

copyDone([previousTask]);

allTasks.push('print:millennium:html');
allTasks.push('revision-all');
allTasks.push('copy:index');
allTasks.push('copy:HelpDoc');


// console.log('all tasks =>', allTasks);
gulp.task('default', allTasks, function(){
});
