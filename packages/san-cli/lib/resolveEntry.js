/**
 * @file 将处理 entry 的情况单独拿出来，供复用和单测
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fse = require('fs-extra');
const {chalk, error} = require('san-cli-utils/ttyLogger');
module.exports = (resolveEntryPath, absoluteEntryPath, webpackConfig) => {
    // entry arg
    if (resolveEntryPath) {
        // 1. 判断 entry 是文件还是目
        // 2. 文件，直接启动 file server
        // 3. 目录，则直接启动 devServer
        const obj = resolveEntry(absoluteEntryPath);
        resolveEntryPath = obj.entry;
        const isFile = obj.isFile;

        if (isFile && !/\.san$/.test(resolveEntryPath)) {
            webpackConfig.entry.app = resolveEntryPath;
        } else {
            // san 文件/目录的情况需要指定 ~entry
            webpackConfig.resolve.alias['~entry'] = absoluteEntryPath;
        }
    }
    // 处理 entry 不存在的情况
    if (
        /* eslint-disable operator-linebreak */
        !webpackConfig.entry ||
        /* eslint-enable operator-linebreak */
        (!Array.isArray(webpackConfig.entry) && Object.keys(webpackConfig.entry).length === 0)
    ) {
        error('没有找到 Entry，请命令后面添加 entry 或者配置 san.config.js');
        process.exit(1);
    }
    return webpackConfig;
};

function resolveEntry(entry) {
    let isFile = false;
    try {
        const stats = fse.statSync(entry);
        if (stats.isFile()) {
            const ext = path.extname(entry);
            if (ext === '.js' || ext === '.san') {
                isFile = true;
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
    return {
        entry,
        isFile
    };
}
