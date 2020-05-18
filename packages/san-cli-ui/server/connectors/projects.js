/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 项目相关的api
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');

const TEMPLATE_PATH = '.san/templates/san-project';
const initCreator = async (useCache = true) => {
    const args = [
        '--download-repo-only'
    ];

    // 判断本地目录是否存在
    if (useCache) {
        const templatePath = path.join(require('os').homedir(), TEMPLATE_PATH);
        if (fs.existsSync(templatePath)) {
            args.push('--offline');
        }
    }

    // TODO: 正式版改成san
    const child = execa('yarn', [
        'dev:san',
        'init',
        'JUST-A-PLACEHOLDER',
        ...args
    ], {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'inherit']
    });

    // const child = require('child_process').exec('yarn dev:san init test-dir --download-repo-only --offline');

    const onData = buffer => {
        const text = buffer.toString().trim();
        console.log({text});
    };

    child.stdout.on('data', onData);

    await child;
};

module.exports = {
    initCreator
};
