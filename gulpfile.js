var gulp = require('gulp'),
    connect = require('gulp-connect'),
    wiredep = require('wiredep').stream,
    compass = require('gulp-compass'),
    coffee = require('gulp-coffee'),
    gutil = require('gulp-util'),
    prefix = require('gulp-autoprefixer'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    clean = require('gulp-clean');

gulp.task('connect', function() {
    connect.server({
        root: './.tmp',
        livereload: true,
    });
});

gulp.task('html', function() {
    gulp.src('./app/**/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('./.tmp'))
        .pipe(connect.reload());
});

gulp.task('compass', ['clean'], function() {
    gulp.src('./app/**/*.scss')
        .pipe(compass({
            css: 'app/styles',
            sass: 'app/styles',
            image: 'app/images'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('css', function() {
    gulp.src('./.tmp/**/*.css')
        .pipe(prefix())
        .pipe(gulp.dest('./.tmp'))
        .pipe(connect.reload());
});

gulp.task('coffee', ['clean'], function() {
    gulp.src('./app/**/*.coffee')
        .pipe(coffee({bare: true}))
        .on('error', gutil.log)
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('js', function() {
    gulp.src('./.tmp/**/*.js')
        .pipe(connect.reload());
});

gulp.task('bower', ['clean'], function() {
    gulp.src(['**/*.html', '**/*.scss'], {cwd: './app'})
        .pipe(wiredep())
        .pipe(gulp.dest('./.tmp/'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/**/*.scss'], ['compass']);
    gulp.watch(['./.tmp/**/*.css'], ['css']);
    gulp.watch(['./app/**/*.coffee'], ['coffee']);
    gulp.watch(['./.tmp/**/*.js'], ['js']);

    gulp.watch(['./bower.json'], ['bower']);
});

gulp.task('clean', function() {
    return gulp.src('{.tmp,dist}', {read: false})
               .pipe(clean());
});

gulp.task('first_round', function() {
    return gulp.start('bower', 'compass', 'coffee');
});
gulp.task('default', ['connect', 'first_round', 'watch']);

gulp.task('htmlmin', ['first_round'], function() {
    return gulp.src('**/*.html', {cwd: './.tmp'})
               .pipe(useref.assets())
               .pipe(gulpif('*.js', uglify()))
               .pipe(gulpif('*.css', minifyCss()))
               .pipe(useref.restore())
               .pipe(useref())
               .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['htmlmin']);
