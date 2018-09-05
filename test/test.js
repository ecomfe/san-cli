const vfs = require('vinyl-fs');
const path = require('path');
const through = require('through2');
const concat = require('concat-stream');

vfs.src(['**/*', '!node_modules/**/*'], {cwd: path.join(__dirname, '../test/project'), cwdbase: true, dot: true})
    // 2. 增加 handlerbar
    // 处理 _ 开头文件为 .开头
    .pipe(through.obj((file, enc, callback) => {
        if (file.isNull()) {
            return callback(null, file);
        }
        else if (file.isBuffer()) {
        }
        else if (file.isStream()) {
        }

        if (file.isBuffer()) {
            let content = file.contents.toString(enc);
            // console.log(content);
            file.contents = new Buffer('修改也');
            console.log(file.contents.toString(enc));
        }

        callback(null, file);
    }))
    .pipe(through.obj((file, enc, callback) => {
        if (file.isBuffer()) {
            let content = file.contents.toString(enc);
            console.log(content);
        }
        callback(null, file);
    }))
    .on('end', () => {
        console.log(1);
    })
    .resume();
