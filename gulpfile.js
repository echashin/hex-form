var gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  del = require('del');


gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
gulp.task('clean', function () {
  del('dist/*.*');
  return true;
});

gulp.task('html', function () {
  return gulp.src('index.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src(['src/*.png','src/*.jpg','src/*.jpeg','src/*.gif'])
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', function () {
  return gulp.src('index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['lint','clean','html','images','minify'], function () {
  // This will only run if the lint task is successful...
});
