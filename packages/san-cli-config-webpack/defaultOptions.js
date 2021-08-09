exports.cssnanoOptions = {
    mergeLonghand: false,
    cssDeclarationSorter: false,
    normalizeUrl: false,
    discardUnused: false,
    // 避免 cssnano 重新计算 z-index
    zindex: false,
    reduceIdents: false,
    safe: true,
    // cssnano 集成了 autoprefixer 的功能
    // 会使用到 autoprefixer 进行无关前缀的清理
    // 关闭 autoprefixer 功能
    // 使用 postcss 的 autoprefixer 功能
    autoprefixer: false,
    discardComments: {
        removeAll: true
    }
};

exports.devServerOptions = {
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
};

exports.terserOptions = {
    format: {
        comments: false
    },
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
    // 引号保留，不然 inline 的 base64 图片 compress 时报错
    removeAttributeQuotes: false,
    quoteCharacter: '"',
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

exports.lessOptions = {
    extract: false,
    preprocessor: undefined,
    loaderOptions: {
        style: {},
        css: {},
        less: {
            javascriptEnabled: true,
            compress: false
        }
    },
    sourceMap: false
};
