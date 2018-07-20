const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-minify-css');
const cssBeautify = require('gulp-cssbeautify');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('styles', function() {
  return gulp
    .src(['src/**/*.scss', '!src/**/_*.scss']) //会编译styles目录下的以scss结尾的scss文件
    .pipe(
      debug({
        title: 'CSS packing:'
      })
    )
    .pipe(
      sass({
        style: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 20 versions'],
        cascade: true
      })
    )
    .pipe(
      cssBeautify({
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
      })
    )
    .pipe(concat('navigator.css'))
    .pipe(gulp.dest('dist/'))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(minifycss())
    .pipe(gulp.dest('dist/'))
    .pipe(reload({ stream: true }));
});

// 只有eslint通过了才经行script打包
gulp.task('scripts', ['lint'], function() {
  return gulp
    .src('src/**/*.js')
    .pipe(
      debug({
        title: 'JS packing:'
      })
    )
    .pipe(
      babel({
        presets: ['env']
        // plugins: ['transform-runtime']
      })
    )
    .pipe(concat('navigator.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
    .pipe(reload({ stream: true }));
});

gulp.task('images', function() {
  return gulp
    .src('src/images/**')
    .pipe(gulp.dest('dist/images'))
    .pipe(reload({ stream: true }));
});

gulp.task('fonts', function() {
  return gulp
    .src('src/fonts/**')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(reload({ stream: true }));
});

gulp.task('html', function() {
  return gulp
    .src('test/*.html')
    .pipe(
      debug({
        title: 'HTML packing:'
      })
    )
    .pipe(gulp.dest('dist/'))
    .pipe(reload({ stream: true }));
});

// 清除所有的生成文件
gulp.task('clean', function() {
  return gulp
    .src(['dist'], {
      read: false
    })
    .pipe(clean());
});

// 静态服务器
gulp.task('webserver', function() {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch('src/images/**', ['images']);
  gulp.watch('src/fonts/**', ['fonts']);
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('test/**/*.html', ['html']);
});

gulp.task('lint', () => {
  return gulp
    .src(['src/**/*.js', '!node_modules/**', '!dist/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// 默认任务
gulp.task('default', function() {
  gulp.start('styles');
  gulp.start('scripts');
  gulp.start('images');
  gulp.start('fonts');
  gulp.start('html');
  gulp.start('webserver');
});

gulp.task('build', ['clean'], function() {
  gulp.start('styles');
  gulp.start('scripts');
  gulp.start('images');
  gulp.start('fonts');
  gulp.start('html');
});
