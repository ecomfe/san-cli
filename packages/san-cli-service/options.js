/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file san.config 格式
 * @author ksky521
 */

const joi = require('joi');

const schema = joi
    .object({
        // env 相关
        jsonpFunction: joi.string(),
        transpileDependencies: joi.array(),
        // 产出相关
        copy: joi.alternatives().try(
            joi.array().items(
                joi
                    .object({
                        compress: joi.bool(),
                        from: joi.string(),
                        to: joi.string(),
                        ignore: joi.alternatives().try(joi.string(), joi.object().instance(RegExp))
                    })
                    .unknown(true)
            ),
            joi
                .object({
                    from: joi.string(),
                    compress: joi.bool(),
                    to: joi.string(),
                    ignore: joi.alternatives().try(joi.string(), joi.object().instance(RegExp))
                })
                .unknown(true)
        ),
        // service 插件相关
        plugins: joi.array(),
        // 产出相关
        publicPath: joi.string().allow(''),
        outputDir: joi.string(),
        assetsDir: joi.string().allow(''),
        // 多页配置
        pages: joi.object().pattern(
            /\w+/,
            joi.alternatives().try(
                joi.string().required(),
                joi.array().items(joi.string().required()),
                joi
                    .object()
                    .keys({
                        entry: joi
                            .alternatives()
                            .try(joi.string().required(), joi.array().items(joi.string().required()))
                            .required(),
                        chunks: joi
                            .alternatives()
                            .try(joi.string().required(), joi.array().items(joi.string().required()))
                    })
                    .unknown(true)
            )
        ),
        // 生产环境优化相关
        polyfill: joi.boolean(),
        terserOptions: joi.object(),
        sourceMap: joi.alternatives().try(joi.boolean(), joi.string()),
        filenameHashing: joi.boolean(),
        largeAssetSize: joi.number(),
        // css 相关
        css: joi.object({
            cssnanoOptions: joi.object(),
            cssPreprocessor: joi.string().valid('less', 'sass', 'stylus'),
            extract: joi.boolean(),
            sourceMap: joi.boolean(),
            requireModuleExtension: joi.boolean(),
            loaderOptions: joi.object({
                css: joi.object(),
                sass: joi.object(),
                less: joi.object(),
                stylus: joi.object(),
                // 推荐使用 postcss.config.js
                postcss: joi.object()
            })
        }),
        // webpack 相关配置
        alias: joi.object(),
        // 内置 loader 的 options
        loaderOptions: joi.object(),
        // 主要用 splitChunks.cacheGroups
        splitChunks: joi.object(),
        // 纯自定义的函数
        chainWebpack: joi.func(),
        configWebpack: joi.alternatives().try(joi.object(), joi.func()),
        // dev server
        devServer: joi
            .object({
                port: joi.number()
            })
            .unknown(true)
    })
    // 为了方便自定义扩展
    .unknown(true);
exports.validate = (options, cb) => {
    schema.validate(options, cb);
};
exports.validateSync = async (value, options) => {
    const rs = await schema.validateAsync(value, options);
    return rs;
};

exports.defaults = {
    polyfill: true,
    pages: undefined,
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    filenameHashing: false,
    devServer: {
        watchContentBase: false,
        hot: true,
        hotOnly: false,
        logLevel: 'silent',
        clientLogLevel: 'silent',
        overlay: {warnings: false, errors: true},
        stats: 'errors-only',
        inline: false,
        lazy: false,
        index: 'index.html',
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
        },
        disableHostCheck: true,
        compress: false,
        host: '0.0.0.0',
        port: 8899,
        https: false
    },
    sourceMap: false
};

exports.cssnanoOptions = {
    mergeLonghand: false,
    cssDeclarationSorter: false,
    normalizeUrl: false,
    discardUnused: false,
    // 避免 cssnano 重新计算 z-index
    zindex: false,
    reduceIdents: false,
    safe: true,
    // cssnano 集成了autoprefixer的功能
    // 会使用到autoprefixer进行无关前缀的清理
    // 关闭autoprefixer功能
    // 使用postcss的autoprefixer功能
    autoprefixer: false,
    discardComments: {
        removeAll: true
    }
};

exports.terserOptions = {
    comments: false,
    compress: {
        unused: true,
        // 删掉 debugger
        drop_debugger: true, // eslint-disable-line
        // 移除 console
        drop_console: true, // eslint-disable-line
        // 移除无用的代码
        dead_code: true // eslint-disable-line
    },
    ie8: false,
    safari10: true,
    warnings: false,
    toplevel: true
};
exports.htmlMinifyOptions = {
    removeComments: true,
    collapseWhitespace: false,
    removeAttributeQuotes: true,
    collapseBooleanAttributes: true,
    removeScriptTypeAttributes: false,
    minifyCSS: true,
    // 处理 smarty 和 php 情况
    ignoreCustomFragments: [/{%[\s\S]*?%}/, /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/]
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
};

exports.eslintOptions = {
    'no-console': 2,
    'no-debugger': 2,
    'no-alert': 2,
    'no-unused-vars': 2,
    'no-undef': 2
};
