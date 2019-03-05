/**
 * @file global config plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const path = require('path');
const resolve = require('resolve');
const {findExisting} = require('@baidu/hulk-utils');


module.exports = function createConfigPlugin(context, entry, asLib) {
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
                    config.resolve.alias.set(
                        'san',
                        `${sanPath}/${options.compiler ? 'san.dev.js' : 'san.min.js'}`
                    );
                }
                // set entry
                config
                    .entry('app')
                    .clear()
                    .add(entry);

                if (!asLib) {
                    // set html plugin template
                    /* eslint-disable*/
                    const indexFile =
                        findExisting(context, ['index.html', 'public/index.html']) ||
                        path.resolve(__dirname, '../template/index.html');
                    /* eslint-enable*/
                    config.plugin('html').tap(args => {
                        args[0].template = indexFile;
                        return args;
                    });
                }

                // disable copy plugin if no public dir
                if (asLib || !findExisting(context, ['public'])) {
                    config.plugins.delete('copy');
                }
            });
        }
    };
};
