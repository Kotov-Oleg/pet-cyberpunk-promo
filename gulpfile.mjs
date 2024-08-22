import pkg from 'gulp';
const { src, series, dest, parallel, watch } = pkg;
import gulpClean from 'gulp-clean';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemap from 'gulp-sourcemaps';
import browser from 'browser-sync';
import gulpIf from 'gulp-if';
import gcmq from 'gulp-group-css-media-queries';
import less from 'gulp-less';

const browserSync = browser.create();
console.log(process.argv);

let isMap = process.argv.includes('--map');
let isMinify = process.argv.includes('--clean');
let isSync = process.argv.includes('--sync');

function clean() {
  return src('./build/*', { read: false }).pipe(gulpClean());
}
function html() {
  return src('./src/**/*.html')
    .pipe(dest('./build'))
    .pipe(gulpIf(isSync, browserSync.stream()));
}

function styles() {
  return (
    src('./src/css/main.less')
      .pipe(gulpIf(isMap, sourcemap.init()))
      // .pipe(concat('main.css'))
      .pipe(less())
      // .pipe(gcmq())
      // .pipe(gulpIf(isProd, autoprefixer()))
      .pipe(
        gulpIf(
          isMinify,
          cleanCSS({
            level: 2,
          })
        )
      )
      .pipe(gulpIf(isMap, sourcemap.write()))
      .pipe(dest('./build/css'))
      .pipe(gulpIf(isSync, browserSync.stream()))
  );
}

function images() {
  return src('./src/img/**/*.{png,jpg,jpeg,gif,svg}')
    .pipe(dest('./build/img'))
    .pipe(gulpIf(isSync, browserSync.stream()));
}

function fonts() {
  return src('./src/fonts/**/*').pipe(dest('./build/fonts'));
}

function watchDev() {
  if (isSync) {
    browserSync.init({
      server: {
        baseDir: './build',
      },
    });
  }
  watch('./src/css/**/*.less', styles);
  watch('./src/**/*.html', html);
  watch('./src/img', images);
}

const build = parallel(html, styles, images, fonts);
const buildWithClean = series(clean, build);
const dev = series(buildWithClean, watchDev);

export { dev as watch };
export { buildWithClean as build };
