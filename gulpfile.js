var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var dev = './dev/';
var devCss = dev + 'sass/';
var devJs = dev + 'js/';

var prod = './dist/';
var prodCss = prod + 'css/';
var prodJs = prod + 'js/';

function exceptionLog (error) {
  console.log(error.toString());
}

// HTML
gulp.task('html', function() {
    return gulp.src(dev + '**/*.html')
    .pipe(gulp.dest(prod));
});


// CSS via Sass and Autoprefixer
gulp.task('css', function() {
    return gulp.src(devCss + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('sass/maps'))
    .pipe(gulp.dest(prodCss))
    .on('error', exceptionLog);
});

//JS job
gulp.task('js', function() {
    return gulp.src(devJs+'navmenu.js')
        .pipe(uglify())
        .pipe(gulp.dest(prodJs));
});

//Watch job
gulp.task('watch', function() {
    browserSync.init({
        proxy: "http://localhost:5000/",
        port: 1919
    });
    gulp.watch([dev + '**/*.css', dev + '**/*.scss' ], ['css']);
    gulp.watch([dev + '**/*.js'], ['js']);
    gulp.watch([dev + '**/*.html'], ['html']);
    gulp.watch(dev + '**/*').on('change', browserSync.reload);
});


gulp.task('default', ['watch', 'css', 'js', 'html']);
