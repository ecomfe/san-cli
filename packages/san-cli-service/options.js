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
const devServerOptions = require('san-cli-config-webpack/defaultOptions').devServerOptions;

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
            extract: joi.alternatives().try(joi.boolean(), joi.object()),
            sourceMap: joi.boolean(),
            requireModuleExtension: joi.boolean(),
            loaderOptions: joi.object({
                style: joi.object(),
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
        // 缓存的相关配置
        cache: joi.alternatives().try(joi.boolean(), joi.object()),
        // 内置 loader 的 options
        loaderOptions: joi.object(),
        // 主要用 splitChunks.cacheGroups
        splitChunks: joi.object(),
        // webpack5 runtimeChunk
        runtimeChunk: joi.alternatives().try(joi.string(), joi.object()),
        // beta: 主要用在生产环境（转换js、压缩js和css）
        esbuild: joi.object(),
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
exports.validate = (value, options) => {
    const {error} = schema.validate(value, options);
    if (error) {
        throw error;
    }
};

exports.defaults = {
    polyfill: true,
    pages: undefined,
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    filenameHashing: false,
    devServer: devServerOptions,
    sourceMap: false
};
