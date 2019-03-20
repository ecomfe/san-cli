/**
 * @file gen template test
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const fs = require('fs');
const path = require('path');
const genTemplate = require('../utils/genTemplate');

const content = fs.readFileSync(path.join(__dirname, '../template.san'), {encoding: 'utf8'});
const rs = genTemplate(content, {
    id: 'test',
    'text-container-placeholder': 'I am text',
    'code-container-placeholder': 'I am code',
    dyImport: 'const ui = 1;'
});

console.log(rs);
