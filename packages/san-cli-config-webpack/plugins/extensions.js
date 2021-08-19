/**
 * @file
 * @author
 */

module.exports = {
    id: 'extensions',
    schema: joi => ({
        extensions: joi.array(),
    }),
    apply(api, projectOptions = {}, options) {
        const {
            extensions = ['.js', '.ts', '.css', '.less', '.san']
        } = projectOptions;
        api.chainWebpack(chainConfig => {
            chainConfig
                .resolve.set('symlinks', false)
                // 默认加上 less 吧，less 内部用的最多
                .extensions.merge(extensions)
                .end();
        });
    }
};
