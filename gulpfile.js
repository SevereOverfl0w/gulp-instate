var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    wiredep = require('wiredep').stream,
    pngcrush = require('imagemin-pngcrush'),
    runSequence = require('run-sequence'); 

gulp.task('connect', function(next) {
    var connect = require('connect'),
        server = connect();
    server.use(connect.static('./.tmp')).listen(process.env.PORT || 8080, next);
});

gulp.task('html', function() {
    return gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('compass', function() {
    return gulp.src('./app/**/*.scss')
        .pipe($.compass({
            css: 'app/styles',
            sass: 'app/styles',
            image: 'app/images'
        }))
        .on('error', $.util.log)
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('scss', function(){
    return gulp.src('./app/**/*.scss')
               .pipe($.sass())
               .on('error', $.util.log)
               .pipe(gulp.dest('./.tmp'));
});

gulp.task('css', function() {
    gulp.src('./.tmp/**/*.css')
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('coffee', function() {
    return gulp.src('./app/**/*.coffee')
        .pipe($.coffee({bare: true}))
        .on('error', $.util.log)
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('js', function() {
    gulp.src('./.tmp/**/*.js')
});

gulp.task('bower', function() {
    return gulp.src(['**/*.html', '**/*.scss'], {cwd: './app'})
        .pipe(wiredep())
        .pipe(gulp.dest('./app/'));
});

gulp.task('copy', function(){
    return gulp.src(['./app/**/*.{png,jpeg,jpg,svg,js,css}'])
               .pipe(gulp.dest('./.tmp'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/**/*.html'], ['html']);
    gulp.watch(['./app/**/*.scss'], ['scss']);
    gulp.watch(['./.tmp/**/*.css'], ['css']);
    gulp.watch(['./app/**/*.coffee'], ['coffee']);
    gulp.watch(['./.tmp/**/*.js'], ['js']);
    gulp.watch(['./app/**/*.{png,jpeg,jpg,svg,js,css}'], ['copy']);

    $.livereload.listen();
    gulp.watch(['.tmp/**'], $.livereload.changed);

    gulp.watch(['./bower.json'], ['bower']);
});

gulp.task('clean', function() {
    return gulp.src('{.tmp,dist}', {read: false})
               .pipe($.clean())
               .on('error', $.util.log);
});

gulp.task('first_round', function(cb){
    runSequence('clean', ['bower', 'copy', 'html', 'scss', 'coffee'], cb);
});

gulp.task('default', function(cb){
    runSequence('first_round', ['connect', 'watch'], cb);
});

gulp.task('htmlmin', ['first_round'], function() {
    return gulp.src('./.tmp/**/*.html')
        .pipe($.usemin({
             css: [$.minifyCss(), 'concat', $.rev()],
             html: [$.minifyHtml({empty: true})],
             js: [$.uglify(), $.rev()]
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('imagemin', ['first_round'], function() {
    return gulp.src('./.tmp/**/*.{svg,png,jpg,jpeg,gif}')
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['htmlmin', 'imagemin']);


gulp.task('copycname', ['build'], function(){
    return gulp.src('./CNAME')
        .pipe(gulp.dest('./dist/'))
});

gulp.task('deploy', ['build', 'copycname'], function(){
     gulp.src('./dist/**/*')
         .pipe($.ghPages());
});
