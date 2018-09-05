const path = require('path');
const fs = require('fs');
const exists = fs.existsSync;

const through = require('through2');
const Handlebars = require('handlebars');
const vfs = require('vinyl-fs');
const render = require('consolidate').handlebars.render;
const concat = require('concat-stream');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const {
    error,
    log,
    getGitUser
} = require('./utils/index');
const ask = require('./ask');

Handlebars.registerHelper('if_eq', function (a, b, opts) {
    return a === b
        ? opts.fn(this)
        : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
    return a === b
        ? opts.inverse(this)
        : opts.fn(this);
});

module.exports = async (name, src, dest, cmdOpts) => {
    // 0. 设置meta信息
    const opts = getMetadata(src);
    opts.name = name;
    const author = getGitUser();
    if (author) {
        opts.author = author;
    }

    // 1. 添加 handlebar helper
    opts.helpers && Object.keys(opts.helpers).map(key => {
        Handlebars.registerHelper(key, opts.helpers[key]);
    });
    // 2. 请回答
    const answers = await ask(opts.prompts || {});

    let f = through.obj();

    // 处理过滤
    if (opts.filters) {
        const filters = Object.keys(opts.filters);
        const globs = filters.filter(glob => {
            return answers[opts.filters[glob]];
        });
        if (globs.length) {
            f = filter(globs);
        }
    }

    // 复制代码vfs
    const templateDir = path.join(src, 'template');
    const dotFileFilter = filter(['**/_*'], {
        restore: true
    });
    vfs.src(['**/*', '!node_modules/**/*'], {cwd: templateDir, cwdbase: true, dot: true})
        // 过滤
        .pipe(f)
        // 4. 增加 handlerbar
        .pipe(streamFile(template, answers))
        // 处理 _ 开头文件为 .开头
        .pipe(dotFileFilter)
        .pipe(rename(path => {
            path.extname = path.basename.replace(/^_/, '.');
            path.basename = '';
            return path;
        }))
        .pipe(dotFileFilter.restore)
        .pipe(vfs.dest(dest))
        .on('end', () => {
            log('成功');
        })
        .on('error', err => {
            error(err);
        })
        .resume();

    // 3. 安装依赖
    // 4. 生成 ReadMe

    // 5. git init
};
function getMetadata(dir) {
    const json = path.join(dir, 'meta.json');
    const js = path.join(dir, 'meta.js');
    let opts = {};

    if (exists(json)) {
        const content = fs.readFileSync(json, 'utf-8');
        opts = JSON.parse(content);
    }
    else if (exists(js)) {
        const req = require(path.resolve(js));
        if (req !== Object(req)) {
            throw new Error('meta.js needs to expose an object')
        }

        opts = req;
    }

    return opts;
}

function template(content, file, cb, data) {
    render(content, data, (err, res) => {
        if (err) {
            err.message = `[${file}] ${err.message}`;
            return cb(err);
        }

        file.contents = new Buffer(res);
        cb(null, file);
    });
}

function streamFile(fn, ...args) {
    return through.obj((file, enc, cb) => {
        if (file.isBuffer()) {
            const str = file.contents.toString();
            fn(str, file, cb, ...args);
        }
        else if (file.isStream()) {
            file.contents.pipe(concat(str => {
                try {
                    fn(str, file, cb, ...args);
                }
                catch (e) {
                    cb(e);
                }
            }));
        }
        else {
            cb(null, file);
        }
    });
}
