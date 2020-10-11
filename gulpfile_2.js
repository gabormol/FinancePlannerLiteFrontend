
var gulp = require('gulp'),
minifycss = require('gulp-minify-css'),
jshint = require('gulp-jshint'),
stylish = require('jshint-stylish'),
uglify = require('gulp-uglify'),
usemin = require('gulp-usemin'),
imagemin = require('gulp-imagemin'),
rename = require('gulp-rename'),
concat = require('gulp-concat'),
notify = require('gulp-notify'),
cache = require('gulp-cache'),
changed = require('gulp-changed'),
rev = require('gulp-rev'),
browserSync = require('browser-sync'),
ngannotate = require('gulp-ng-annotate'),
del = require('del');

function jshint() {
return gulp.src('app/scripts/**/*.js')
.pipe(jshint())
.pipe(jshint.reporter(stylish));
};

function usemin() {
return gulp.src('./app/**/*.html')
  .pipe(usemin({
    css:[minifycss(),rev()],
    js: [ngannotate(),uglify(),rev()]
  }))
  .pipe(gulp.dest('dist/'));
};
exports.usemin = gulp.series(jshint, usemin);

// Images
function imagemin() {
return del(['dist/images']), gulp.src('app/images/**/*')
.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
.pipe(gulp.dest('dist/images'))
.pipe(notify({ message: 'Images task complete' }));
};

// Clean
function clean() {
return del(['dist']);
};

function copyfonts() {
gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
.pipe(gulp.dest('./dist/fonts'));
gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
.pipe(gulp.dest('./dist/fonts'));
};
exports.copyfonts = gulp.series(clean, copyfonts);

// Watch
function watch() {

// Watch .js files
gulp.watch('{app/scripts/**/*.js,app/styles/**/*.css,app/**/*.html}', ['usemin']);

// Watch image files
gulp.watch('app/images/**/*', ['imagemin']);

};
exports.watch = gulp.series(browsersync, watch);

function browsersync() {
var files = [
  'app/**/*.html',
  'app/styles/**/*.css',
  'app/images/**/*.png',
  'app/scripts/**/*.js',
  'dist/**/*'
];

browserSync.init(files, {
  server: {
     baseDir: "dist",
     index: "index.html"
  }
});  

// Watch any files in dist/, reload on change
gulp.watch(['dist/**']).on('change', browserSync.reload);

};
exports.browsersync = gulp.series(defaulttask, browsersync);

// Default task
function defaulttask(done) {
gulp.series(usemin, imagemin, copyfonts);
done();
};
exports.defaulttask = gulp.series(clean, defaulttask);
