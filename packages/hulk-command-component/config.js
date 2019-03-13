/**
 * @file component command config file
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');

module.exports = (api, context, entry, options) => {
    api.chainWebpack(config => {
        // 增加 md
        config.module
            .rule('md')
            .test(/\.md$/)
            .use('hulk-san-loader')
            .loader(require.resolve('@baidu/hulk-san-loader'))
            .options({
                hotReload: true,
                sourceMap: true,
                minimize: false
            })
            .end()
            .use('markdown')
            .loader(require.resolve('@baidu/hulk-markdown-loader'));

        if (fs.existsSync(api.resolve('src'))) {
            config.resolve.alias.set('@', api.resolve('src'));
        } else {
            config.resolve.alias.set('@', api.resolve('.'));
        }

        config.resolve.alias.set('~entry', path.resolve(context, entry));
        entry = require.resolve('./template/main.js');

        try {
            resolve.sync('san', {basedir: context});
        } catch (e) {
            const sanPath = path.dirname(require.resolve('san'));
            config.resolve.alias.set('san', `${sanPath}/${options.compiler ? 'dist/san.dev.js' : 'dist/san.min.js'}`);
        }
        // set entry
        config
            .entry('app')
            .clear()
            .add(entry);
    });
};
