let gulp = require('gulp');
let sass = require('gulp-sass');

gulp.task('styles', () => {
	gulp.src('styles/iom.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('styles'));
});

// Watch task
gulp.task('default', () => {
	gulp.watch('styles/**/*.scss', ['styles']);
});
