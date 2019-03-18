/**
 * @file global config plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const path = require('path');
const resolve = require('resolve');
const {findExisting} = require('@baidu/hulk-utils');

module.exports = function createConfigPlugin(context, entry) {
    return {
        id: 'hulk-cli-service-global-config',
        apply: (api, options) => {
            api.chainWebpack(config => {
                // entry is *.vue file, create alias for built-in js entry
                if (/\.san$/.test(entry)) {
                    config.resolve.alias.set('~entry', path.resolve(context, entry));
                    entry = require.resolve('../template/main.js');
                } else {
                    // make sure entry is relative or absolute
                    if (!/^\.\//.test(entry) && !/^\//.test(entry)) {
                        entry = `./${entry}`;
                    }
                }

                // add resolve alias for vue and vue-hot-reload-api
                // but prioritize versions installed locally.
                try {
                    resolve.sync('san', {basedir: context});
                } catch (e) {
                    const sanPath = path.dirname(require.resolve('san'));
                    config.resolve.alias.set('san', `${sanPath}/${options.compiler ? 'san.dev.js' : 'san.min.js'}`);
                }
                // set entry
                if (entry) {
                    config
                        .entry('app')
                        .clear()
                        .add(entry);
                } else {
                    // config.entry('app').clear();
                }

                // set inline babel options
                config.module
                    .rule('js')
                    .test(/\.m?js$/)
                    .include.add(api.resolve('src'))
                    .end()
                    .exclude.add(/node_modules/)
                    .add(/@baidu\/hulk-serve/)
                    .add(/@baidu\/hulk-command-component/)
                    .end()
                    .use('babel-loader')
                    .loader(require.resolve('babel-loader'))
                    .options({
                        cacheDirectory: true,
                        presets: [['@babel/preset-env']],
                        plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-new-target']
                    })
                    .end();

                if (!options.pages) {
                    // set html plugin template
                    /* eslint-disable*/
                    const indexFile =
                        findExisting(context, ['index.html', 'public/index.html']) ||
                        path.resolve(__dirname, '../template/index.html');
                    /* eslint-enable*/
                    let hasHtml = false;
                    config.plugin('html').tap(args => {
                        if (Array.isArray(args) && args[0]) {
                            args[0].template = indexFile;
                            hasHtml = true;
                        }
                        return args;
                    });
                    if (!hasHtml) {
                        config.plugins.delete('html');
                    }
                }
            });
        }
    };
};
