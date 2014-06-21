var gulp = require('gulp'),
    connect = require('gulp-connect'),
    wiredep = require('wiredep').stream,
    compass = require('gulp-compass'),
    coffee = require('gulp-coffee'),
    gutil = require('gulp-util'),
    prefix = require('gulp-autoprefixer');

gulp.task('connect', function() {
    connect.server({
        root: 'app',
        livereload: true,
    });
});

gulp.task('html', function() {
    gulp.src('./app/**/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('./app'))
        .pipe(connect.reload());
});

gulp.task('compass', function() {
    gulp.src('./app/**/*.scss')
        .pipe(compass({
            css: 'app/styles',
            sass: 'app/styles',
            image: 'app/images'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./app'));
});

gulp.task('css', function() {
    gulp.src('./app/**/*.css')
        .pipe(prefix())
        .pipe(gulp.dest('./app'))
        .pipe(connect.reload());
});

gulp.task('coffee', function() {
    gulp.src('./app/**/*.coffee')
        .pipe(coffee({bare: true}))
        .on('error', gutil.log)
        .pipe(gulp.dest('./app'))
});

gulp.task('js', function() {
    gulp.src('./app/**/*.js')
        .pipe(connect.reload());
});

gulp.task('bower', function() {
    gulp.src(['**/*.html', '**/*.scss'], {cwd: './app'})
        .pipe(wiredep())
        .pipe(gulp.dest('./app/'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/**/*.scss'], ['compass']);
    gulp.watch(['./app/**/*.css'], ['css']);
    gulp.watch(['./app/**/*.coffee'], ['coffee']);
    gulp.watch(['./app/**/*.js'], ['js']);

    gulp.watch(['./bower.json'], ['bower']);
});

gulp.task('default', ['connect', 'bower', 'compass', 'coffee', 'watch']);
