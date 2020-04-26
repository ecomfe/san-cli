/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 读取 rc 内容
 * @author ksky521
 */

const importLazy = require('import-lazy')(require);
const fse = importLazy('fs-extra');
const readPkg = require('./readPkg');
const upath = importLazy('./path');
const {error} = importLazy('./ttyLogger');

module.exports = (rcFrom = 'rc', baseDir = process.cwd()) => {
    switch (rcFrom) {
        case 'rc':
        case 'sanrc': {
            const sanFolder = upath.getGlobalSanRcFilePath();
            const filepath = upath.findExisting(sanFolder);
            let sanrc = null;

            if (filepath) {
                try {
                    sanrc = fse.readJsonSync(filepath);
                } catch (e) {
                    // json 格式错误
                    error(e);
                }
            }
            return sanrc || null;
        }

        default: {
            const pkg = readPkg(baseDir, false);
            return pkg.san || null;
        }
    }
};
