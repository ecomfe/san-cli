/**
 * 部分代码来自 vue cli
 * @file build 主要内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {info, prepareUrls} = require('@baidu/hulk-utils');



module.exports = (api, options) => {
    api.registerCommand(
        'build',
        {
            description: '零配置启动 dev server',
            usage: 'hulk serve [options] [entry]',
            options: {
                '--mode': 'specify env mode (default: development)',
                '--host': `specify host (default: ${defaults.host})`,
                '--port': `specify port (default: ${defaults.port})`,
                '--https': `use https (default: ${defaults.https})`,
                '--public': 'specify the public network URL for the HMR client'
            }
        },
        async function serve(args) {
            info('Building...');

            process.env.NODE_ENV = 'production';
            const url = require('url');
            const path = require('path');
            const chalk = require('chalk');
            const webpack = require('webpack');


        }
    );
};
