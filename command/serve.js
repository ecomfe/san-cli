/**
 * markdown / san / js dev server
 * @file Created on Tue Nov 20 2018
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const {existsSync} = require('fs-extra');
const {error} = require('../lib/utils');
module.exports = ({filename}, opts) => {
    const filepath = path.resolve(filename);
    if (!existsSync(filepath)) {
        return error(`${filename} is not exist`);
    }
    
};
