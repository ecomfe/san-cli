/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file babel loader config
 */
const path = require('path');
const semver = require('semver');
const sanHmrPlugin = require('san-hot-loader/lib/babel-plugin');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const debugLogger = getDebugLogger('babel');
const {
    default: getTargets,
    isRequired
} = require('@babel/helper-compilation-targets');

// includes的配置要经过targets过滤一下，去掉不必要的
const getPolyfills = (targets, includes) => {
    if (!targets || !Object.keys(targets).length) {
        return includes;
    }
    const compatData = require('core-js-compat').data;
    return includes.filter(item => {
        if (!compatData[item]) {
            // eslint-disable-next-line max-len
            throw new Error(`Cannot find polyfill ${item}, please refer to 'core-js-compat' for a complete list of available modules`);
        }
        return isRequired(item, targets, {compatData});
    });
};

// 从modernTarget中排除掉targets中不需要的浏览器
const getModernTargets = targets => {
    const modernTargets = getTargets(
        {
            esmodules: true
        },
        {
            ignoreBrowserslistConfig: true
        }
    );

    return Object.keys(modernTargets).reduce(
        (results, browser) => {
            // 排除用户不需要的浏览器
            if (!targets[browser]) {
                return results;
            }

            // 选择用户配置的target和modern的交集，更高的版本
            results[browser] = semver.gt(
                semver.coerce(modernTargets[browser]),
                semver.coerce(targets[browser])
            ) ? modernTargets[browser] : targets[browser];

            return results;
        },
        {}
    );
};

module.exports = (context, options = {}) => {
    const defaultEntryFiles = JSON.parse(process.env.SAN_CLI_ENTRY_FILES || '[]');
    const runtimePath = path.dirname(require.resolve('@babel/runtime/package.json'));
    const runtimeVersion = require('@babel/runtime/package.json').version;
    let {
        useBuiltIns = 'usage',
        debug = false,
        loose = false,
        modules = false,
        ignoreBrowserslistConfig,
        // 这个是plugins数组
        plugins: userPlugins,
        // 用户传入的其他预设
        presets = [],
        // 用户显式传入的 polyfill，一般是解决core-js没有自动注入的问题
        polyfills: userPolyfills,
        bugfixes = true,
        targets: rawTargets,
        spec,
        configPath,
        include,
        exclude,
        shippedProposals,
        forceAllTransforms,
        // 入口文件，用来配合 userPolyfills
        entryFiles = defaultEntryFiles,
        absoluteRuntime = runtimePath,
        version = runtimeVersion
    } = options;


    if (debugLogger.enabled) {
        // 使用 DEBUG=san-cli:babel 开启
        debug = true;
    }

    const isProd = process.env.NODE_ENV === 'production';

    const isModernBundle = process.env.SAN_CLI_MODERN_BUILD;

    // 格式化 target
    let targets = getTargets(rawTargets, {
        ignoreBrowserslistConfig,
        configPath
    });

    if (isModernBundle) {
        // 这个是 modern 打包
        targets = getModernTargets(targets);
    }

    let plugins = userPlugins ? [...userPlugins] : [];

    if (!isProd && !plugins.includes(sanHmrPlugin)) {
        // 添加 san-hmr 插件
        plugins.push(sanHmrPlugin);
    }

    let polyfills = [];
    if (useBuiltIns === 'usage') {
        // 手动注入用户自定义的polyfill
        if (userPolyfills) {
            polyfills = getPolyfills(targets, userPolyfills);
        }

        plugins.push([
            require('./polyfillsPlugin'),
            {
                polyfills,
                entryFiles
            }
        ]);
    }

    // @see: https://babeljs.io/docs/en/babel-preset-env#configpath
    const envOptions = {
        bugfixes,
        corejs: useBuiltIns ? require('core-js/package.json').version : false,
        spec,
        loose,
        debug,
        modules,
        targets,
        useBuiltIns,
        ignoreBrowserslistConfig,
        configPath,
        include,
        exclude: polyfills.concat(exclude || []),
        shippedProposals,
        forceAllTransforms
    };

    plugins.push(
        require('@babel/plugin-syntax-dynamic-import'),
        require('@babel/plugin-syntax-import-meta'),
        [require('@babel/plugin-proposal-class-properties'), {loose}],
        require('@babel/plugin-transform-new-target')
    );

    plugins.push([
        require('@babel/plugin-transform-runtime'),
        {
            // 默认值，可以不写
            corejs: false,

            // 通过 preset-env 已经使用了全局的 regeneratorRuntime,
            // 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
            regenerator: useBuiltIns !== 'usage',

            // 默认true
            helpers: useBuiltIns === 'usage',

            // 不使用 es modules helpers, 减少 commonJS 语法代码
            useESModules: false,
            absoluteRuntime,
            version
        }
    ]);

    return {
        presets: [
            [require('@babel/preset-env'), envOptions],
            ...presets
        ],
        plugins
    };
};
