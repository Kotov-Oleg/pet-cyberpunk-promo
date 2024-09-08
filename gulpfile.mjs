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

const paths = {
  styles: {
    src: 'src/blocks/**/*.less',
    dest: 'build/css/'
  },
  scripts: {
    src: 'src/blocks/**/*.js',
    dest: 'build/js/'
  },
  images: {
    src: './src/images/**/*.{png,jpg,jpeg,gif,svg,webp}',
    dest: 'build/images/'
  },
  fonts: {
    src: './src/fonts/**/*',
    dest: 'build/fonts/'
  },
  pages: {
    src: './src/**/*.html',
    dest: './build/',
  }
}

const browserSync = browser.create();
console.log(process.argv);

let isAutoprefixer = process.argv.includes('--autoprefixer');
let isMap = process.argv.includes('--map');
let isMinify = process.argv.includes('--clean');
let isSync = process.argv.includes('--sync');

function clean() {
  return src('./build/*', { read: false }).pipe(gulpClean());
}
function html() {
  return src(paths.pages.src)
    .pipe(dest(paths.pages.dest))
    .pipe(gulpIf(isSync, browserSync.stream()));
}

function styles() {
  return (
    src(['src/blocks/vars.less', 'src/blocks/mixins.less', 'src/blocks/index.less', paths.styles.src])
      .pipe(gulpIf(isMap, sourcemap.init()))
      .pipe(concat('main.less')) 
      .pipe(less())
      .pipe(gcmq())
      .pipe(gulpIf(isAutoprefixer, autoprefixer()))
      .pipe(
        gulpIf(
          isMinify,
          cleanCSS({
            level: 2,
          })
        )
      )
      .pipe(gulpIf(isMap, sourcemap.write()))
      .pipe(dest(paths.styles.dest))
      .pipe(gulpIf(isSync, browserSync.stream()))
  );
}

function images() {
  return src(paths.images.src)
    .pipe(dest(paths.images.dest))
    .pipe(gulpIf(isSync, browserSync.stream()));
}

function fonts() {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dest));
}

function watchDev() {
  if (isSync) {
    browserSync.init({
      server: {
        baseDir: './build',
      },
    });
  }
  watch(paths.styles.src, styles);
  watch(paths.pages.src, html);
  watch('./src/images', images);
}

const build = parallel(html, styles, images, fonts);
const buildWithClean = series(clean, build);
const dev = series(buildWithClean, watchDev);

export { dev as watch };
export { buildWithClean as build };