/**
 * Modifyed by caozf on 2017/9/11.
 */
'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpack_config = require('./webpack.config');

//用于gulp传递参数
var minimist = require('minimist');

var gutil = require('gulp-util');

var src = process.cwd() + '/src';
var assets = process.cwd() + '/dist';

var knownOptions = {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'debug'}
};

var options = minimist(process.argv.slice(2), knownOptions);

// var webpackConf = require('./webpack.config');
// var webpackConfDev = require('./webpack-dev.config');

var webpackConfig = options.env === 'production' ? webpack_config({debug:false}) : webpack_config({debug:true});

var remoteServer = {
    host: '192.168.56.129',
    remotePath: '/data/website/website1',
    user: 'root',
    pass: 'password'
};
var localServer = {
    host: '192.168.56.130',
    remotePath: '/data/website/website1',
    user: 'root',
    pass: 'password'
}

//check code
gulp.task('hint', function () {
    var jshint = require('gulp-jshint')
    var stylish = require('jshint-stylish')

    return gulp.src([
        '!' + src + '/js/lib/**/*.js',
        src + '/js/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
})

// clean asserts
gulp.task('clean', ['hint'], function () {
    var clean = require('gulp-clean');
    return gulp.src(assets, {read: true}).pipe(clean())
});

//run webpack pack
gulp.task('pack', ['clean'], function (done) {
    var config = webpackConfig;
    webpack(config, function (err, stats) {
        if (err) throw new gutil.PluginError('webpack', err)
        gutil.log('[webpack]', stats.toString({colors: true}))
        done()
    });
});
//run webpack-dev-server
gulp.task('server', function () {
    var config = webpackConfig;
    config.entry.vendor.unshift('webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server');
    new WebpackDevServer(webpack(config), {
        contentBase:'./dist',
        publicPath: config.output.publicPath,
        hot: true
    }).listen(8080, 'localhost', function(err, result) {
        if (err) {
            console.log(err);
        }
        console.log('Listening at localhost:8080');
    });
});

//default task
gulp.task('default', ['pack'])

//deploy assets to remote server
gulp.task('deploy', function () {
    var sftp = require('gulp-sftp');
    var _conf = options.env === 'production' ? remoteServer : localServer;
    return gulp.src(assets + '/**')
        .pipe(sftp(_conf))
})