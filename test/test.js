const vfs = require('vinyl-fs');
const path = require('path');
const through = require('through2');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const f = filter(['**/_*'], {
    restore: true
});
vfs.src(['**/*', '!node_modules/**/*'], {cwd: path.join(__dirname, '../test/project'), cwdbase: true, dot: true})
    .pipe(f)
    .pipe(rename(path => {
        path.extname = path.basename.replace(/^_/, '.')
        path.basename = '';

        return path;
    }))
    .pipe(f.restore)

    .pipe(through.obj((file, enc, callback) => {
        if (file.isBuffer()) {
            let content = file.contents.toString(enc);
            console.log(content);
        }

        callback(null, file);
    }))
    .pipe(vfs.dest('./dist'))

    .on('end', () => {
        console.log(1);
    }).on('error', err => {
    console.log(err);
})
    .resume();
