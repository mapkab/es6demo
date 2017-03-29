
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    jade = require('gulp-jade'),
    del = require('del'),
    minimist = require('minimist');
var argv = require('minimist')(process.argv.slice(2));
var basepath=argv.src
var destpath=argv.dest;
var bizType=argv.bizType;
var imgPath=argv.imgPath;

if(!imgPath) {
    imgPath = bizType;
}


//sass编译 添加前缀 保存到目录下 压缩 添加.min在输出压缩文件到指定目录，最后提示任务完成
gulp.task('styles', function() {
    return sass(basepath+'/src/'+bizType+'/**/*.scss',{ sourcemap: true })
        .on('error', sass.logError)
        .pipe(gulp.dest(destpath+'/css'))
        .pipe(notify({ message: '老大，您的sass旨意已完成' }));
});

// 组件开发拷贝公用的public css
gulp.task('publicCss', function() {
    return sass(basepath+'/src/'+imgPath+'/sass/public/public.scss',{ sourcemap: true })
        .on('error', sass.logError)
        .pipe(gulp.dest(destpath+'/css'))
        .pipe(notify({ message: '老大，您的sass旨意已完成' }));
});

//jade解析
gulp.task('jade', function() {
    gulp.src(basepath+'/src/'+bizType+'/**/*.jade')
        .pipe(jade({
            pretty:true
        }))
        .pipe(gulp.dest(destpath+'/html'))
});

gulp.task('images', function () {
   return gulp.src(basepath + '/src/' + imgPath+'/images/**/*')
       .pipe(gulp.dest(destpath+'/images'))
       .pipe(notify({message:'图片拷贝完成'}));
});

//在任务执行前，最好先清除之前生成的文件
gulp.task('clean', function() {
    del([destpath])
});

//我们在命令行下输入 gulp执行的就是默认任务，现在我们为默认任务指定执行上面写好的2个任务
gulp.task('default',['clean'], function() {
    gulp.start('styles', 'jade', 'images');
});

gulp.task('cssJade',['clean'], function() {
    gulp.start('styles', 'jade');
});

gulp.task('jadeImg',['clean'], function() {
    gulp.start('publicCss', 'jade', 'images');
});




