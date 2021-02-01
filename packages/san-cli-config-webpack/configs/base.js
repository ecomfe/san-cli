const fs = require('fs');
const path = require('path');
const resolveSync = require('resolve');
const defaultsDeep = require('lodash.defaultsdeep');
const {createRule} = require('../rules');

module.exports = (webpackChainConfig, projectOptions) => {
    const {resolve, resolveLocal, isProduction, isLegacyBundle, context} = projectOptions;
    webpackChainConfig.context(context);

    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    // set output
    // prettier-ignore
    webpackChainConfig.output
        .path(resolve(projectOptions.outputDir))
        /* eslint-disable max-len */
        .filename((isLegacyBundle() ? '[name]-legacy' : '[name]') + `${projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.js`)
        /* eslint-enable max-len */
        .publicPath(projectOptions.publicPath);

    // prettier-ignore
    /* eslint-disable*/
    webpackChainConfig
        .resolve
            .set('symlinks', false)
            // 默认加上 less 吧，less 内部用的最多
            .extensions.merge(['.js', '.css', '.less', '.san'])
            .end()
        .modules
            .add('node_modules')
            .add(resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
        // set alias
        // TODO 这里要拿到跟babel配置一起设置
        .alias
            .set('core-js', path.dirname(resolveSync('core-js')))
            .set('regenerator-runtime', path.dirname(resolveSync('regenerator-runtime')));
    /* eslint-enable */

    if (fs.existsSync(resolve('src'))) {
        webpackChainConfig.resolve.alias
            // 加个@默认值
            .set('@', resolve('src'));
    }

    // set resolveLoader
    const resolveLoader = webpackChainConfig.resolveLoader.modules
        .add('node_modules')
        .add(resolve('node_modules'))
        .add(resolveLocal('node_modules'));

    //  优先考虑本地安装的html-loader版本，没有的话去全局路径寻找
    try {
        resolveSync('html-loader', {basedir: context});
        // console.log(`Find local htmlLoader at [${htmlLoader}]`);
    } catch (e) {
        // 找到html-loader所在根目录
        let nodeModulesPath = path.dirname(require.resolve('html-loader'));
        nodeModulesPath = nodeModulesPath.substring(0, nodeModulesPath.lastIndexOf('node_modules')) + 'node_modules';
        resolveLoader.add(nodeModulesPath);
    }
    // set san alias
    try {
        const sanFile = resolveSync('san', {basedir: context});
        const sanPath = path.dirname(sanFile);
        webpackChainConfig.resolve.alias.set(
            'san',
            path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
        );
    } catch (e) {
        const sanPath = path.dirname(require.resolve('san'));
        webpackChainConfig.resolve.alias.set(
            'san',
            path.join(sanPath, !isProduction() ? 'san.spa.dev.js' : 'san.spa.js')
        );
    }
    // projectOptions.alias
    if (projectOptions.alias) {
        let alias = projectOptions.alias;
        Object.keys(alias).forEach(k => {
            let p = path.isAbsolute(alias[k]) ? alias[k] : resolve(alias[k]);
            webpackChainConfig.resolve.alias.set(k, p);
        });
    }

    // set loaders
    // ------------------------loaders------------
    const loaderOptions = projectOptions.loaderOptions || {};

    function setLoader(lang, test, loaders) {
        // 如果san.config.js 中loaderOptions.xx为false则不添加
        if (loaderOptions[lang] === false) {
            return;
        }
        if (!Array.isArray(loaders)) {
            loaders = [loaders];
        }
        loaders = loaders.map(a => {
            let name;
            let options = {};
            if (Array.isArray(a)) {
                name = a[0];
                options = a[1] || {};
            } else if (typeof a === 'object') {
                name = a.name;
                options = a.options || {};
            } else {
                name = a;
            }
            return [name, defaultsDeep(options, loaderOptions[lang])];
        });
        createRule(lang, test, loaders);
    }

    if (isProduction()) {
        setLoader('san', /\.san$/, ['san']);
    } else {
        setLoader('san', /\.san$/, ['san-hot', 'san']);
    }

    setLoader('ejs', /\.ejs$/, 'ejs');

    setLoader('html', /\.html?$/, 'html');

    // -----------plugins--------
    webpackChainConfig.plugin('san').use(require('san-loader/lib/plugin'));
    // 大小写敏感！！！！
    webpackChainConfig.plugin('case-sensitive-paths').use(require('case-sensitive-paths-webpack-plugin'));

    // 定义 env 中的变量
    // 这里需要写到文档，以 SAN_VAR 开头的 env 变量
    webpackChainConfig.plugin('define').use(require('webpack/lib/DefinePlugin'), [defineVar()]);
    // 将 env 中的值进行赋值
    function defineVar() {
        const vars = {
            // TODO 这里要不要按照 mode 设置下 undefined 的情况？
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            PRODUCTION: JSON.stringify(process.env.NODE_ENV === 'production'),
            BASE_URL: JSON.stringify(projectOptions.publicPath)
        };
        // 这里把var 变量名拆出来
        const re = /^SAN_VAR_([\w\d\_]+)$/;
        Object.keys(process.env).forEach(key => {
            if (re.test(key)) {
                const name = re.exec(key)[1];
                vars[name] = JSON.stringify(process.env[key]);
            }
        });
        return vars;
    }
};
