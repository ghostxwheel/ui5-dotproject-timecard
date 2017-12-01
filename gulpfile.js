// npm install --save-dev gulp-ui5-preload gulp-uglify gulp-pretty-data gulp-if 
var gulp = require('gulp');
var ui5preload = require('gulp-ui5-preload');
var uglify = require('gulp-uglify');
var prettydata = require('gulp-pretty-data');
var gulpif = require('gulp-if');
var gulpSequence = require('gulp-sequence');
var clean = require('gulp-clean');
var nodemon = require('gulp-nodemon');

gulp.task('clean', function () {
  return gulp.src(['ui/dist'])
    .pipe(clean());
});

gulp.task('ui5preload', function () {
  return gulp.src(['ui/src/**/**.+(js|xml|json|properties)'])
    .pipe(gulpif('**/*.js', uglify()))    //only pass .js files to uglify 
    .pipe(gulpif('**/*.xml', prettydata({ type: 'minify' }))) // only pass .xml to prettydata  
    .pipe(ui5preload({ base: 'ui/src', namespace: 'com.ui5.dotproject.timecard' }))
    .pipe(gulp.dest('ui/dist'));
});

gulp.task('copy', function () {
  return gulp.src(['ui/src/**/**.+(css|png|ico|json)'])
    .pipe(gulp.dest('ui/dist'));
});

gulp.task('build', gulpSequence('ui5preload', 'copy'));

gulp.task('nodemon', function () {
  nodemon({
    script: 'index.js',
    tasks: ['ui5preload', 'copy'],
    watch: ["*.*"],
    ignoreRoot: ["./ui/dist/", "./ui/resources/"],
    ext: "js html xml json properties env css"
  });
});