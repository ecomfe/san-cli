/**
 * @file plugin extensions
 * @author
 */

module.exports = {
    id: 'extensions',
    pickConfig: ['extensions'],
    apply(api, options = {}) {
        const extensions = options.extensions || ['.js', '.ts', '.css', '.less', '.san'];
        api.chainWebpack(chainConfig => {
            chainConfig
                .resolve.set('symlinks', false)
                // 默认加上 less 吧，less 内部用的最多
                .extensions.merge(extensions)
                .end();
        });
    }
};
