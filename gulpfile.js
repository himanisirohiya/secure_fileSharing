var gulp = require('gulp');

function moveBootstrap(cb) {
    gulp.src('node_modules/bootstrap/*/*/*')
    .pipe(gulp.dest('public/libs/bootstrap/'));
    // body omitted
    cb();
}
function moveJquery(cb) {
    gulp.src('node_modules/jquery/*/*')
    .pipe(gulp.dest('public/libs/jquery'));
    cb();
}
  
exports.moveBootstrap = gulp.series(moveBootstrap, moveJquery);