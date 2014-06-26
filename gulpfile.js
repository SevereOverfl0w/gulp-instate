var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    wiredep = require('wiredep').stream,
    pngcrush = require('imagemin-pngcrush');

gulp.task('connect', function() {
    $.connect.server({
        root: './.tmp',
        livereload: true,
    });
});

gulp.task('html', ['bower', 'clean'], function() {
    return gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./.tmp'))
        .pipe($.connect.reload());
});

gulp.task('compass', ['bower', 'clean'], function() {
    return gulp.src('./app/**/*.scss')
        .pipe($.compass({
            css: 'app/styles',
            sass: 'app/styles',
            image: 'app/images'
        }))
        .on('error', $.util.log)
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('css', function() {
    gulp.src('./.tmp/**/*.css')
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./.tmp'))
        .pipe($.connect.reload());
});

gulp.task('coffee', ['clean'], function() {
    return gulp.src('./app/**/*.coffee')
        .pipe($.coffee({bare: true}))
        .on('error', $.util.log)
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('js', function() {
    gulp.src('./.tmp/**/*.js')
        .pipe($.connect.reload());
});

gulp.task('bower', function() {
    return gulp.src(['**/*.html', '**/*.scss'], {cwd: './app'})
        .pipe(wiredep())
        .pipe(gulp.dest('./app/'));
});

gulp.task('copy', ['clean'], function(){
    return gulp.src(['./app/**/*.{png,jpeg,jpg,svg}'])
               .pipe(gulp.dest('./.tmp'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/**/*.scss'], ['compass']);
    gulp.watch(['./.tmp/**/*.css'], ['css']);
    gulp.watch(['./app/**/*.coffee'], ['coffee']);
    gulp.watch(['./.tmp/**/*.js'], ['js']);
    gulp.watch(['./app/**/*.{png,jpeg,jpg,svg}'], ['copy']);

    gulp.watch(['./bower.json'], ['bower']);
});

gulp.task('clean', function() {
    return gulp.src('{.tmp,dist}', {read: false})
               .pipe($.clean());
});

gulp.task('first_round', ['bower', 'copy', 'html', 'compass', 'coffee']);

gulp.task('default', ['connect', 'first_round', 'watch']);

gulp.task('build', ['first_round'], function() {
    gulp.src('./.tmp/**/*.html')
        .pipe($.usemin({
             css: [$.minifyCss(), 'concat', $.rev()],
             html: [$.minifyHtml({empty: true})],
             js: [$.uglify(), $.rev()]
        }))
        .pipe(gulp.dest('./dist/'));
    gulp.src('./.tmp/**/*.{svg,png,jpg,jpeg,gif}')
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('./dist/'));
});
