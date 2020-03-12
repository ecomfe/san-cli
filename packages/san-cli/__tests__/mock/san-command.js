/**
 * @file customize command
 * @author yanyiting <yanyiting@baidu.com>
 */

exports.command = 'hello';
exports.builder = {
    name: {
        type: 'string'
    }
};
exports.desc = 'San Command Plugin Demo';
exports.handler = argv => {
    console.log(`hello, ${argv.name}`);
};
