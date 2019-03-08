/**
 * @file 根据模板生成项目目录结构
 */
const path = require('path');
const fs = require('fs');
const Observable = require('rxjs').Observable;

const through = require('through2');
const Handlebars = require('./handlerbars');
const vfs = require('vinyl-fs');
const render = require('consolidate').handlebars.render;
const concat = require('concat-stream');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const {evaluate, getGitUser, getDebugLogger} = require('@baidu/hulk-utils');
const {name, version} = require('../package.json');
const debug = getDebugLogger('generate', name);

const ask = require('./ask');
const exists = fs.existsSync;

module.exports = (name, dest, options) => {
    return (ctx, task) => {
        return new Observable(async observer => {
            const src = ctx.localTemplatePath;
            // 0. 设置meta信息
            const metaData = getMetadata(src);
            const {name: gitUser, email: gitEmail, author} = getGitUser();
            metaData.author = author;
            metaData.email = gitEmail;
            metaData.username = gitUser;

            // 添加到 context 传入下一个流程
            ctx.metaData = metaData;
            debug(metaData);

            // 1. 添加 handlebar helper
            // eslint-disable-next-line
            metaData.helpers &&
                Object.keys(metaData.helpers).map(key => {
                    Handlebars.registerHelper(key, metaData.helpers[key]);
                });

            const opts = ctx.metaData;
            // 2. 请回答
            const answers = await ask(opts.prompts || {}, opts);
            const data = Object.assign(
                {
                    destDirName: name,
                    inPlace: dest === process.cwd(),
                    noEscape: true
                },
                answers
            );
            debug('merge 后的参数', data);
            ctx.tplData = data;
            startTask(src, dest, ctx, observer);
        });
    };
};
function startTask(src, dest, ctx, observer) {
    const {metaData: opts, tplData: data} = ctx;
    // 处理过滤
    const rootSrc = ['**/*', '!node_modules/**'];
    if (opts.filters) {
        const filters = Object.keys(opts.filters);
        const globs = filters.filter(glob => {
            return evaluate(opts.filters[glob], data);
        });

        if (globs.length) {
            globs.map(glob => {
                rootSrc.push(`!${glob}`);
            });
        }
    }

    debug(rootSrc);
    // 过滤 _ dotFile
    const dotFileFilter = filter(['**/_*'], {
        restore: true
    });
    // 过滤 {{}} 的文件
    const braceFileFilter = filter(['**/{{*'], {
        restore: true
    });
    // 复制代码vfs
    let templateDir = path.join(src, 'template');

    if (!exists(templateDir)) {
        // 不存在 template 则以整个文件夹做根目录
        templateDir = src;
    }
    vfs.src(rootSrc, {cwd: templateDir, cwdbase: true, dot: true})
        // 过滤
        // .pipe(f)
        // 4. 增加 handlerbar
        .pipe(streamFile(template, data))
        // 处理 _ 开头文件为 .开头
        .pipe(dotFileFilter)
        .pipe(
            rename((path, file) => {
                if (!file.isDirectory()) {
                    path.extname = path.basename.replace(/^_/, '.');
                    path.basename = '';
                }

                return path;
            })
        )
        .pipe(dotFileFilter.restore)
        // 处理文件命名中出现{{}}的情况
        .pipe(braceFileFilter)
        .pipe(
            rename(path => {
                let m = path.basename.match(/^{{(.+?)}}$/);
                if (m && m[1] && typeof data[m[1]] === 'string') {
                    path.basename = data[m[1]];
                    return path;
                }

                return path;
            })
        )
        .pipe(braceFileFilter.restore)
        .pipe(vfs.dest(dest))
        .on('end', () => {
            observer.complete();
        })
        .on('error', err => {
            observer.error(err);
        })
        .resume();
}

function getMetadata(dir) {
    const json = path.join(dir, 'meta.json');
    const js = path.join(dir, 'meta.js');
    let opts = {};

    if (exists(json)) {
        const content = fs.readFileSync(json, 'utf-8');
        opts = JSON.parse(content);
    } else if (exists(js)) {
        const req = require(path.resolve(js));
        if (req !== Object(req)) {
            throw new Error('meta.js 格式有误');
        }

        opts = req;
    }

    return opts;
}

function template(content, file, cb, data) {
    if (!Handlebars.isHandlebarTPL(content)) {
        return cb(null, file);
    }

    render(content, data)
        .then(res => {
            file.contents = new Buffer(res);
            cb(null, file);
        })
        .catch(err => {
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
        } else if (file.isStream()) {
            file.contents.pipe(
                concat(str => {
                    try {
                        fn(str, file, cb, ...args);
                    } catch (e) {
                        cb(e);
                    }
                })
            );
        } else {
            cb(null, file);
        }
    });
}
