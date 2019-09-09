/**
 * @file default 默认不存在的command 会走到这里来
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const yParser = require('yargs-parser');
const Service = require('@hulk/core/lib/Service');

const args = yParser(process.argv.slice(2));
const cmd = process.argv[2];

new Service(args).run(cmd, args);
