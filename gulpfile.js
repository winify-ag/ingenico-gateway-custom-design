const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const browserSync = require('browser-sync').create()
const del = require('del')
const runSequence = require('run-sequence')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const uncss = require('postcss-uncss')

const $ = gulpLoadPlugins()
const reload = browserSync.reload

let dev = true

gulp.task('styles', () => {
  return gulp.src('src/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']})
    ]))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}))
})

gulp.task('build', ['clean'], () => {
  runSequence(['styles'], () => {
    return gulp.src('src/index.html')
      .pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
      .pipe($.if(/\.css$/, $.postcss([
        uncss({html: ['src/*.html']}),
      ])))
      // .pipe($.if('*.css', $.rev()))
      .pipe($.if('*.css', $.stripCssComments({preserve: false})))
      // .pipe($.if('*.css', $.cleanCss({format: 'beautify'})))
      // .pipe(gulp.dest('dist'))  // save unminified version
      .pipe($.if(/\.css$/, $.postcss([
        cssnano({safe: false, autoprefixer: true})
      ])))
      // .pipe($.if(/\.css$/, $.rename({ extname: '.min.css' })))
      // .pipe($.revReplace())
      .pipe(gulp.dest('dist'))
  })
})

gulp.task('clean', del.bind(null, ['.tmp', 'dist']))

gulp.task('serve', () => {
  runSequence(['clean'], ['styles'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'src', '.']
      }
    })

    gulp.watch([
      'src/*.html'
    ]).on('change', reload)

    gulp.watch('src/styles/**/*.scss', ['styles'])
  })
})

gulp.task('serve:dist', ['build'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  })
})
