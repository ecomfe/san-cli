/**
 * @file san.config 格式
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const joi = require('@hapi/joi');
const schema = joi.object({
    build: joi.object(),
    parallel: joi.alternatives().try(joi.boolean(), joi.number().integer()),
    browserslist: joi.alternatives().try(joi.array(), joi.object()),
    jsonpFunction: joi.string(),
    transpileDependencies: joi.array(),
    filenameHashing: joi.boolean(),
    splitChunksCacheGroups: joi.object(),
    indexPath: joi.string().valid('less', 'sass', 'styl'),
    cssPreprocessor: joi.string(),
    templateDir: joi.string().allow(''),
    copy: joi.alternatives().try(
        joi.array().items(
            joi.object({
                from: joi.string(),
                to: joi.string(),
                ignore: joi.alternatives().try(joi.string(), joi.object().instance(RegExp))
            })
        ),
        joi.object({
            from: joi.string(),
            to: joi.string(),
            ignore: joi.alternatives().try(joi.string(), joi.object().instance(RegExp))
        })
    ),
    terserOptions: joi.object(),
    publicPath: joi.string().allow(''),
    outputDir: joi.string(),
    assetsDir: joi.string().allow(''),
    sourceMap: joi.boolean(),
    devServer: joi.object({
        port: joi.number()
    }),
    devServerMiddlewares: joi.alternatives().try(joi.array().items(joi.func), joi.func),
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
                    chunks: joi.alternatives().try(joi.string().required(), joi.array().items(joi.string().required()))
                })
                .unknown(true)
        )
    ),
    loaderOptions: joi.object(),
    css: joi.object({
        loaderOptions: joi.object({
            css: joi.object(),
            sass: joi.object(),
            scss: joi.object(),
            less: joi.object(),
            stylus: joi.object(),
            postcss: joi.object()
        })
    }),
    pluginOptions: joi.object(),
    // webpack
    chainWebpack: joi.func(),
    configureWebpack: joi.alternatives().try(joi.object(), joi.func())
});
exports.validate = (options, cb) => {
    schema.validate(options, cb);
};
exports.validateSync = schema.validateAsync;

exports.defaults = {
    build: {},
    pages: undefined,
    indexPath: 'index.html',
    outputDir: 'output',
    assetsDir: '',
    publicPath: '/',
    devServer: {},
    css: {},
    loaderOptions: {},
    pluginOptions: {},
    sourceMap: true
};
