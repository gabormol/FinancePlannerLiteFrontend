
var gulp = require('gulp'),
minifycss = require('gulp-minify-css'),
jshint = require('gulp-jshint'),
stylish = require('jshint-stylish'),
//uglify = require('gulp-uglifyes'),
uglify = require('gulp-terser'),
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

gulp.task('jshint', function() {
return gulp.src('app/scripts/**/*.js')
.pipe(jshint())
.pipe(jshint.reporter(stylish));
});

gulp.task('usemin',gulp.series(['jshint'], function () {
return gulp.src('./app/**/*.html')
  .pipe(usemin({
    css:[minifycss(),rev()],
    js: [ngannotate(),uglify(),rev()]
  }))
  .pipe(gulp.dest('dist/'));
}));


// Images
gulp.task('imagemin', function() {
return del(['dist/images']), gulp.src('app/images/**/*')
.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
.pipe(gulp.dest('dist/images'))
.pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
return del(['dist']);
});

gulp.task('copyfonts', function(done) {
gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
.pipe(gulp.dest('./dist/fonts'));
gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
.pipe(gulp.dest('./dist/fonts'));
done();
});

// Default task
gulp.task('default', function(done) {
  gulp.series("clean", "copyfonts", "usemin", "imagemin")();

  done();
  });



gulp.task('browser-sync', gulp.series(['default'], async function () {
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
    
}));

// Watch
gulp.task('watch', gulp.series('browser-sync', async function() {

// Watch .js files
gulp.watch('{app/scripts/**/*.js,app/styles/**/*.css,app/**/*.html}', ['usemin']);

// Watch image files
gulp.watch('app/images/**/*', ['imagemin']);

}));
