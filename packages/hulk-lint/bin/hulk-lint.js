#!/usr/bin/env node

/**
 * @file hulk-cli bin 文件入口
 * @author luzhe <luzhe01@baidu.com>
 */

const linter = require('../index');

linter(process.cwd());