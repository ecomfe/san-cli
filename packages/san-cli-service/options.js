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

let schema = joi
    .object().keys({
        // env 相关
        jsonpFunction: joi.string(),
        transpileDependencies: joi.array(),
        // service 插件相关
        plugins: joi.array(),
        extends: joi.array(),
        // 内置 loader 的 options 增加thread-loader主要用在生产环境 增加esbuild-loader主要用在开发环境（转换js）生产环境（压缩js和css）
        loaderOptions: joi.object(),
        // config.module.unsafeCache,webpack5新增
        unsafeCache: joi.boolean(),
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

exports.extendSchema = fn => {
    schema = schema.keys(fn(joi));
    return schema;
};
exports.validate = (value, options) => {
    const {error} = schema.validate(value, options);
    if (error) {
        throw error;
    }
};

exports.defaults = {
    pages: undefined,
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    filenameHashing: false,
    devServer: devServerOptions,
    sourceMap: false
};
