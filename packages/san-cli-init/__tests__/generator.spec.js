/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file checkStatus test
 * @author yanyiting, Lohoyo
 */

jest.unmock('fs-extra');
jest.mock('prompts');

const fs = require('fs');
const fse = require('fs-extra');
const prompts = require('prompts');
const generator = require('../tasks/generator');

function Task() {
    this.skipInfo = [];
    this.nextInfo = [];
    this.res = '';
    this.skip = data => {
        this.skipInfo.push(data);
    };
    this.info = data => {
        this.nextInfo.push(data);
    };
    this.error = err => {
        this.res = err;
    };
    this.complete = () => {
        this.res = 'done';
    };
}

describe('meta.js', () => {
    let task;
    beforeEach(() => {
        task = new Task();
    });
    afterEach(() => {
        fse.removeSync(__dirname + '/mock-dest');
    });

    test('通过命令行交互式问答传入预设', async () => {
        // tplEngine 选择 smarty、enableMatrix 选择 false、demo 选择 false
        prompts.mockResolvedValueOnce({tplEngine: 'smarty'});
        prompts.mockResolvedValueOnce({enableMatrix: false});
        prompts.mockResolvedValueOnce({demo: false});

        let ctx = {
            localTemplatePath: __dirname + '/mock-template'
        };
        await generator('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-dest', {})(ctx, task).then(() => {
            // 将_下划线文件转为.文件
            expect(fs.existsSync(__dirname + '/mock-dest/.env')).toBeTruthy();
            // 检验 filters 是否生效
            expect(fs.existsSync(__dirname + '/mock-dest/test.js')).toBeFalsy();
            // 检验 handlerbars 渲染
            const req = require(__dirname + '/mock-dest/san.config.js');
            expect(req.enableMatrix).toBeFalsy();
            expect(req.pages.index).toEqual({
                entry: './src/pages/index/index.js',
                template: './template/index/index.tpl',
                filename: 'index/index.tpl'
            });
        });
    });

    test('通过 --project-presets 参数传入预设', async () => {
        let ctx = {
            localTemplatePath: __dirname + '/mock-template'
        };
        const projectPresets = `{
            "tplEngine": "smarty",
            "enableMatrix": false,
            "demo": false
        }`;
        await generator('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-dest', {projectPresets})(ctx, task).then(() => {
            // 将_下划线文件转为.文件
            expect(fs.existsSync(__dirname + '/mock-dest/.env')).toBeTruthy();
            // 检验 filters 是否生效
            expect(fs.existsSync(__dirname + '/mock-dest/test.js')).toBeFalsy();
            // 检验 handlerbars 渲染
            const req = require(__dirname + '/mock-dest/san.config.js');
            expect(req.enableMatrix).toBeFalsy();
            expect(req.pages.index).toEqual({
                entry: './src/pages/index/index.js',
                template: './template/index/index.tpl',
                filename: 'index/index.tpl'
            });
        });
    });
});
