/**
 * @file 根据模板生成项目目录结构
 */
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
const debug = require('debug')('generate');
const {
    error,
    log,
    chalk,
    success,
    logWithSpinner,
    stopSpinner,
    clearConsole,
    getGitUser
} = require('./utils/index');
const ask = require('./ask');
const {installDeps} = require('./npm');

// 增加 handleba helper
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

    debug(opts);

    // 1. 添加 handlebar helper
    opts.helpers && Object.keys(opts.helpers).map(key => {
        Handlebars.registerHelper(key, opts.helpers[key]);
    });

    // 2. 请回答
    const answers = await ask(opts.prompts || {});
    const data = Object.assign({
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
    }, answers);
    debug(data);

    // 处理过滤
    let f = through.obj();

    if (opts.filters) {
        const filters = Object.keys(opts.filters);
        const globs = filters.filter(glob => {
            return data[opts.filters[glob]];
        });
        if (globs.length) {
            f = filter(globs);
        }
    }

    // 过滤 _ dotFile
    const dotFileFilter = filter(['**/_*'], {
        restore: true
    });
    // 复制代码vfs
    const templateDir = path.join(src, 'template');
    vfs.src(['**/*', '!node_modules/**/*'], {cwd: templateDir, cwdbase: true, dot: true})
        // 过滤
        .pipe(f)
        // 4. 增加 handlerbar
        .pipe(streamFile(template, data))
        // 处理 _ 开头文件为 .开头
        .pipe(dotFileFilter)
        .pipe(rename(path => {
            path.extname = path.basename.replace(/^_/, '.');
            path.basename = '';
            return path;
        }))
        .pipe(dotFileFilter.restore)
        .pipe(vfs.dest(dest))
        .on('end', async () => {
            success('模板初始化成功');
            // 3. 安装依赖
            if (cmdOpts.install) {
                logWithSpinner('📦', '安装依赖...');
                await installDeps(dest, cmdOpts.registry);
            }

            stopSpinner();
            clearConsole();
            if (typeof opts.complete === 'function') {
                // 跟 vue template 参数保持一致
                opts.complete(data, {
                    chalk,
                    logger: {
                        log,
                        fatal: error,
                        success: success
                    },
                    files: []
                });
            }
            else {
                logMessage(opts.completeMessage, data);
            }

        })
        .on('error', err => {
            stopSpinner();
            error(err);
        })
        .resume();
};

function logMessage(message, data) {

    if (isHandlebarTPL(message)) {
        render(message, data).then(res => {
            log(res);
        }).catch(err => {
            error('\n   渲染完成信息失败：' + err.message.trim());
            debug(message, data, err);
        });
    }
    else if (message) {
        log(message);
    }
}

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
            throw new Error('meta.js 格式有误')
        }

        opts = req;
    }

    return opts;
}
function isHandlebarTPL(content) {
    return /{{([^{}]+)}}/g.test(content);
}
function template(content, file, cb, data) {
    if (!isHandlebarTPL(content)) {
        return cb(null, file);
    }

    render(content, data).then(res => {
        file.contents = new Buffer(res);
        cb(null, file);
    }).catch(err => {
        debug(`[${file.path}]`);
        err.message = `[${file.path}] ${err.message}`;
        cb(err);
    });
}

function streamFile(fn, ...args) {
    return through.obj((file, enc, cb) => {
        if (file.isBuffer()) {
            // console.log(file.path, enc);
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
