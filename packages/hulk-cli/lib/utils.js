/**
 * @file utils
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const chalk = require('chalk');
const fse = require('fs-extra');

exports.getAssetPath = (assetsDir, filePath) => (assetsDir ? path.posix.join(assetsDir, filePath) : filePath);

exports.resolveLocal = function resolveLocal(...args) {
    return path.join(__dirname, '../../', ...args);
};

exports.resolveEntry = entry => {
    let isFile = false;

    if (entry) {
        try {
            const stats = fse.statSync(path.resolve(entry));
            if (stats.isFile()) {
                const ext = path.extname(entry);
                if (ext === '.js' || ext === '.san') {
                    isFile = true;
                    // 添加。~entry
                    entry = path.resolve(entry);
                } else {
                    console.log(chalk.red('Valid entry file should be one of: *.js or *.san.'));
                    process.exit(1);
                }
                isFile = true;
            }
        } catch (e) {
            console.log(chalk.red('Valid entry is not a file or directory.'));
            process.exit(1);
        }
    }
    return {
        entry,
        isFile
    };
};
exports.getLoaderOptions = (
    api,
    {
        sourceMap,
        browserslist = ['defaults', 'not ie < 11', 'last 2 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
        command = 'build',
        largeAssetSize = 4096,
        devServer = {}
    } = {}
) => {
    const mode = api.getMode();
    return {
        context: api.getCwd(),
        sourceMap: sourceMap === false || sourceMap === true ? sourceMap : mode === 'production',
        browserslist,
        command,
        largeAssetSize,
        mode,
        devServer
    };
};

const rules = [
    {
        type: 'cant-resolve-loader',
        re: /Can't resolve '(.*loader)'/,
        msg: (e, match) => `Failed to resolve loader: ${chalk.yellow(match[1])}\nYou may need to install it.`
    }
];
exports.transformer = error => {
    if (error.webpackError) {
        const message = typeof error.webpackError === 'string' ? error.webpackError : error.webpackError.message || '';
        for (const {re, msg, type} of rules) {
            const match = message.match(re);
            if (match) {
                return Object.assign({}, error, {
                    // type is necessary to avoid being printed as defualt error
                    // by friendly-error-webpack-plugin
                    type,
                    shortMessage: msg(error, match)
                });
            }
        }
        // no match, unknown webpack error without a message.
        // friendly-error-webpack-plugin fails to handle this.
        if (!error.message) {
            return Object.assign({}, error, {
                type: 'unknown-webpack-error',
                shortMessage: message
            });
        }
    }
    return error;
};

exports.formatter = errors => {
    errors = errors.filter(e => e.shortMessage);
    if (errors.length) {
        return errors.map(e => e.shortMessage);
    }
};
