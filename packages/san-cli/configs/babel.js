/**
 * @file 修改自： @vue/cli-plugin-babel
 */
const path = require('path');

function genTranspileDepRegex(transpileDependencies) {
    const deps = transpileDependencies.map(dep => {
        if (typeof dep === 'string') {
            const depPath = path.join('node_modules', dep, '/');
            return process.platform === 'win32'
                ? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
                : depPath;
        } else if (dep instanceof RegExp) {
            return dep.source;
        }
    });
    return deps.length ? new RegExp(deps.join('|')) : null;
}

module.exports = {
    id: 'built-in:babel',
    apply(api, options) {
        const useThreads = api.isProd() && !!options.parallel;
        const cliServicePath = path.dirname(path.resolve(__dirname, '../package.json'));
        const {loaderOptions = {}, parallel, transpileDependencies = []} = options || {};

        // 如果需要 babel 转义node_module 中的模块，则使用这个配置
        // 类似 xbox 这些基础库都提供 esm 版本
        const transpileDepRegex = genTranspileDepRegex(transpileDependencies);

        api.chainWebpack(webpackConfig => {
            webpackConfig.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'));

            const jsRule = webpackConfig.module
                .rule('js')
                .test(/\.m?jsx?$/)
                .exclude.add(filepath => {
                    // exclude dynamic entries from cli-service
                    if (filepath.startsWith(cliServicePath)) {
                        return true;
                    }
                    // check if this is something the user explicitly wants to transpile
                    if (transpileDepRegex && transpileDepRegex.test(filepath)) {
                        return false;
                    }
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath);
                })
                .end();

            if (useThreads) {
                const threadLoaderConfig = jsRule.use('thread-loader').loader('thread-loader');

                if (typeof parallel === 'number') {
                    threadLoaderConfig.options({workers: parallel});
                }
            }

            const {name, loader, options: babelOptions} = require('./loaders/babel')(loaderOptions.babel, options, api);

            jsRule
                .use(name)
                .loader(loader)
                .options(babelOptions);
        });
    }
};
