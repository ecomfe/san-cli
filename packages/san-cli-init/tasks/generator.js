/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 根据模板生成项目目录结构
 * @author ksky521
 */

const path = require('path');
const fs = require('fs-extra');
const through = require('through2');
const Handlebars = require('../handlerbars');
const vfs = require('vinyl-fs');
const render = require('consolidate').handlebars.render;
const concat = require('concat-stream');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const evaluate = require('../utils/evaluate');
const validatePrompts = require('../utils/promptsValidator');
const {getGitUser} = require('san-cli-utils/env');

const ask = require('../ask');
const exists = fs.existsSync;
const debug = getDebugLogger('init:generate');

module.exports = (name, dest, options) => {
    return async (ctx, task) => {
        const src = ctx.localTemplatePath;
        // 0. 设置meta信息
        const metaData = getMetadata(src);
        debug('read meta file from template project %O', metaData);
        const {name: gitUser, email: gitEmail, author} = getGitUser();
        debug('author: %s, email: %s, git user: %s', author, gitEmail, gitUser);

        metaData.author = author;
        metaData.email = gitEmail;
        // 优先使用用户传入的
        metaData.username = options.username !== '' ? options.username : gitUser || 'git';
        // 路径地址
        metaData.name = path.basename(path.resolve(dest));

        // 添加到 context 传入下一个流程
        ctx.metaData = metaData;

        // 1. 添加 handlebar helper
        // eslint-disable-next-line
        metaData.helpers &&
            Object.keys(metaData.helpers).forEach(key => {
                Handlebars.registerHelper(key, metaData.helpers[key]);
            });

        // 添加 handlebar partials
        // eslint-disable-next-line
        metaData.partials &&
            Object.keys(metaData.partials).forEach(key => {
                Handlebars.registerPartial(key, metaData.partials[key]);
            });

        // 设置自定义边界符，例如：['<%=', '%>']
        metaData.delimiters && Handlebars.setDelimiters(metaData.delimiters);

        // 2. 请回答
        task.info();

        // 如果在cli ui中执行，模板中的预设已经通过 --project-presets 参数传过来了
        const projectPresets = getProjectPresets(options.projectPresets, metaData);

        // 预设存在，就不再询问配置项
        const answers = projectPresets || await ask(metaData.prompts || {}, metaData, options);
        const data = Object.assign(
            {
                destDirName: dest,
                inPlace: dest === process.cwd(),
                noEscape: true
            },
            answers
        );

        debug('Meta data after the merge are completed: %O', data);

        ctx.tplData = data;

        task.info('Generating directory structure...');
        await startTask(src, dest, ctx, task);
    };
};

function getProjectPresets(projectPresets, metaData) {
    // 在cli ui中，获取模板中通过 --project-presets 参数传来了的预设
    let data = null;
    if (projectPresets) {
        try {
            data = JSON.parse(projectPresets);
            if (validatePrompts(metaData.prompts, data)) {
                debug('ProjectPresets is valid!');
            }
            else {
                throw new Error('🌚 Project presets illegal.');
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }
    }
    return data;
};

async function startTask(src, dest, ctx, task) {
    const {metaData: opts, tplData: data} = ctx;
    // 处理过滤
    const rootSrc = ['**/*', '!node_modules/**'];
    if (opts.filters) {
        const filters = Object.keys(opts.filters);
        const globs = filters.filter(glob => {
            return evaluate(opts.filters[glob], data);
        });

        if (globs.length) {
            globs.forEach(glob => {
                rootSrc.push(`!${glob}`);
            });
        }
    }

    debug('rootSrc: %O', rootSrc);
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
    return new Promise((resolve, reject) => {
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
                        if (path.extname !== '') {
                            path.basename = path.basename.replace(/^_/, '.');
                        }
                        else {
                            path.extname = path.basename.replace(/^_/, '.');
                            path.basename = '';
                        }
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
                task.complete();
                resolve();
            })
            .on('error', err => {
                task.error(err);
                reject();
            })
            .resume();
    });
}

function getMetadata(dir) {
    const meta = path.join(dir, 'meta');
    let opts = {};
    try {
        opts = require(meta);
        if (opts !== Object(opts)) {
            throw new Error('Wrong type in meta.js');
        }
    }
    catch (e) {
        // 不存在就算了
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw new Error('Wrong type in meta.js');
        }
    }

    return opts;
}

function template(content, file, cb, data) {
    if (!Handlebars.isHandlebarTPL(content)) {
        return cb(null, file);
    }

    render(content, data)
        .then(res => {
            file.contents = Buffer.from(res);
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
        }
        else if (file.isStream()) {
            file.contents.pipe(
                concat(str => {
                    try {
                        fn(str, file, cb, ...args);
                    }
                    catch (e) {
                        cb(e);
                    }
                })
            );
        }
        else {
            cb(null, file);
        }
    });
}
