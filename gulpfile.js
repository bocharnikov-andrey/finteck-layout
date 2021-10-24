const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminGiflossy = require('imagemin-giflossy');
const del = require('del');
const shorthand = require('gulp-shorthand');
const cache = require('gulp-cache');

// Пути
const paths = {
  root: './build',
  templates: {
    src: 'src/*.pug',
    dest: 'build/'
  },
  styles: {
    main: 'src/styles/main.scss',
    src: 'src/styles/**/*.scss',
    dest: 'build/styles/'
  },
  scripts: {
    src: 'src/scripts/*.js',
    dest: 'build/scripts/'
  },
  images: {
    src: 'src/images/**/*.*',
    dest: 'build/images/'
  },
  fonts: {
    src: 'src/fonts/**/*.*',
    dest: 'build/fonts/'
  }
}

// сервер
gulp.task('server', function () {
  browserSync.init({
    server: paths.root,
    notify: false
  });

  browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
});

// удаление папки продакшена
gulp.task('clean', function (done) {
  del.sync(paths.root);
  done()
});

// работа с Pug
gulp.task('pug', function buildHTML() {
  return gulp.src(paths.templates.src)
    .pipe(pug())
    .pipe(gulp.dest(paths.root))
});

// работа со стилями
gulp.task('scss', function () {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(shorthand())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
});

// работа с js
gulp.task('scripts', function () {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(terser())
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scripts.dest))
})

// работа с графикой
gulp.task("images", function () {
  return gulp.src(paths.images.src)
    // .pipe(cache(
    //   imagemin([
    //     imageminGiflossy({
    //       optimizationLevel: 3,
    //       optimize: 3,
    //       lossy: 2
    //     }),
    //     imageminPngquant({
    //       speed: 5,
    //       quality: [0.6, 0.8]
    //     }),
    //     imageminZopfli({
    //       more: true
    //     }),
    //     imageminMozjpeg({
    //       progressive: true,
    //       quality: 80
    //     }),
    //     imagemin.svgo({
    //       plugins: [
    //         { removeViewBox: false },
    //         { removeUnusedNS: false },
    //         { removeUselessStrokeAndFill: false },
    //         { cleanupIDs: false },
    //         { removeComments: true },
    //         { removeEmptyAttrs: true },
    //         { removeEmptyText: true },
    //         { collapseGroups: true }
    //       ]
    //     })
    //   ])
    // ))
    .pipe(gulp.dest(paths.images.dest))
});

// копирование шрифтов
gulp.task('copy:fonts', function () {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
});

// слежка за изменениями в файлах
gulp.task('watch', function () {
  gulp.watch(paths.templates.src, gulp.series('pug'));
  gulp.watch(paths.styles.src, gulp.series('scss'));
  gulp.watch(paths.scripts.src, gulp.series('scripts'));
  gulp.watch(paths.images.src, gulp.series('images'));
});

// запуск задач Gulp по умолчанию
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('pug', 'scss', 'scripts', 'images', 'copy:fonts'),
  gulp.parallel('watch', 'server')
)
);



