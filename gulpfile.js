import {deleteSync, deleteAsync} from 'del';
import gulp from 'gulp';
import cache from 'gulp-cache';
import concat from 'gulp-concat';
import cleanCSS from 'gulp-clean-css';
import eslint from 'gulp-eslint-new';
import nodemon from 'gulp-nodemon';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify';
import streamqueue from 'streamqueue';
const sass = gulpSass(dartSass);

const out = 'dist/';
const dirs = {
	css: `${out}css/`,
	fonts: `${out}fonts/`,
	js: `${out}js/`
};
const globs = {
	fonts: [
		'node_modules/bootstrap-icons/font/fonts/*.woff2',
		'node_modules/@fontsource/ubuntu/files/ubuntu-*-400-*.woff*'
	],
	vendor: [
		'node_modules/socket.io-client/dist/socket.io.min.js',
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/jquery-backstretch/jquery.backstretch.min.js',
		'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
		'node_modules/bootstrap-table/dist/bootstrap-table.min.js'
	]
};

gulp.task('clean', () => {
	return deleteAsync(`${out}**/*`);
});

gulp.task('css', () => {
	deleteSync(`${dirs.css}**/*`);
	return gulp
		.src('styles/**/*.scss')
		.pipe(sass({quietDeps: true}))
		.pipe(cache(cleanCSS({level: {1: {specialComments: 0}}})))
		.pipe(gulp.dest(dirs.css));
});

gulp.task('fonts', () => {
	deleteSync(`${dirs.fonts}**/*`);
	return gulp.src(globs.fonts).pipe(gulp.dest(dirs.fonts));
});

gulp.task('js', () => {
	deleteSync(`${dirs.js}**/*`);
	return streamqueue(
		{objectMode: true},
		gulp.src(globs.vendor).pipe(cache(uglify())),
		gulp
			.src(['client/**/*.js'])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(cache(uglify()))
	)
		.pipe(concat('client.js'))
		.pipe(gulp.dest(dirs.js));
});

gulp.task('lint', () => {
	return gulp
		.src(['src/**/*.js', 'client/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('watch', (done) => {
	const watch_src = gulp.watch(['src/**/*.js']);
	watch_src.on('change', (path) => {
		return gulp.src(path).pipe(eslint()).pipe(eslint.format());
	});

	gulp.watch(['styles/**/*.scss'], gulp.series('css'));
	gulp.watch(['client/**/*.js'], gulp.series('js'));

	nodemon({
		script: './src/index.js',
		ext: 'js',
		watch: ['src/'],
		signal: 'SIGINT',
		done: done
	});
});

export default gulp.series('lint', 'clean', 'css', 'fonts', 'js');
