/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file deploy
 * @author zttonly
 */

const {resolve, isAbsolute} = require('path');
const fs = require('graceful-fs');
const chokidar = require('chokidar');

const {logger} = require('san-cli-utils/ttyLogger');
const {textCommonColor} = require('san-cli-utils/color');
const {findExisting} = require('san-cli-utils/path');
const Upload = require('deploy-files/upload');

const loadConfig = (filepath, cwd) => {
    // 读取远程目标配置
    let configFile = filepath;
    let config = null;
    if (configFile && typeof configFile === 'string') {
        configFile = isAbsolute(configFile) ? configFile : resolve(cwd, configFile);
        if (!fs.existsSync(configFile)) {
            configFile = false;
            logger.warn(`Config file \`${filepath}\` is not exists!`);
        }
    }

    if (!configFile) {
        // 主动查找 cwd 目录的config
        configFile = findExisting(['san.deploy.config.js', '.san.deploy.config.js'], cwd);
    }

    if (configFile) {
        config = require(configFile);

        if (typeof config !== 'object') {
            logger.error(`${textCommonColor(configFile)}: Expected object type.`);
        }
    }
    return config;
};

const arrify = (value = []) => (Array.isArray(value) ? value : [value]);

module.exports = function apply(argv) {
    const cwd = process.cwd();
    const config = loadConfig(argv.config, cwd);
    if (!config) {
        logger.error('Please set default deploy configuration!');
        return;
    }

    if (!argv.target || !config[argv.target]) {
        logger.error('Deploy target invalid!');
        return;
    }
    const deployObj = config[argv.target];
    const {
        root = '.',
        disableFsr = false,
        ignore = [/(^|[\/\\])\../, '**/node_modules/**'],
        host,
        receiver,
        watchOptions = {}
    } = deployObj;

    const up = new Upload({
        disableFsr,
        host,
        receiver,
        replace: arrify(deployObj.replace),
    });
    const rule = arrify(deployObj.rule);
    rule.forEach(item => {
        let timer = null;
        const watcher = chokidar.watch(item.match, {
            cwd: resolve(cwd, root),
            ignored: ignore, // glob
            persistent: argv.watch,
            ...watchOptions
        });
        const files = {};
        watcher.on('all', (event, file) => {
            const filePth = resolve(cwd, root, file);
            if (event === 'add' || event === 'change') {
                files[file] = fs.readFileSync(filePth);
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    up.upload({
                        to: item.to,
                        files
                    });
                    timer = null;
                }, 500);
            }
        });
    });
};
