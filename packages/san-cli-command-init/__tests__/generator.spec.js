/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file checkStatus test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.unmock('vinyl-fs');
jest.unmock('fs-extra');
jest.mock('rxjs')
jest.mock('inquirer');

const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const generator = require('../tasks/generator');

test('meta.js', async () => {
    // 选择smarty、false
    inquirer.prompt.mockResolvedValueOnce({tplEngine: 'smarty'});
    inquirer.prompt.mockResolvedValueOnce({enableMatrix: false});

    let ctx = {
        localTemplatePath: __dirname + '/mock-template'
    };
    await generator('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-dest', {})(ctx).then(data => {
        // 将_下划线文件转为.文件
        expect(fs.existsSync(__dirname + '/mock-dest/.env')).toBeTruthy();
        // 检验filters是否生效
        expect(fs.existsSync(__dirname + '/mock-dest/test.js')).toBeFalsy();
        // 检验handlerbars渲染
        const req = require(__dirname + '/mock-dest/san.config.js');
        expect(req.enableMatrix).toBeFalsy();
        expect(req.pages.index).toEqual({
            entry: './src/pages/index/index.js',
            template: './template/index/index.tpl',
            filename: 'index/index.tpl'
        });
    });

    fse.removeSync(__dirname + '/mock-dest');
});
