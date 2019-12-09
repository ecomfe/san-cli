/**
 * @file add
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    command: 'add <name> <url>',
    desc: 'Add a scaffolding address',
    builder: {},
    async handler(argv) {
        const fse = require('fs-extra');
        const inquirer = require('inquirer');
        const readRc = require('../../../lib/readRc');
        const {getGlobalSanRcFilePath} = require('san-cli-utils/path');
        const {success} = require('san-cli-utils/ttyLogger');
        const {name, url} = argv;

        // 检测是否存在
        // 全局
        let sanrc = readRc('rc') || {};
        const templateAlias = sanrc.templateAlias || {};
        if (templateAlias[name] && templateAlias[name] !== url) {
            // ask 替换？

            const answers = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    // eslint-disable-next-line
                    message: `\`${name}\` already exists，and the current value is \`${templateAlias[name]}\`.Please select an operation：`,
                    choices: [
                        {name: 'overwrite', value: 'overwrite'},
                        {name: 'cancel', value: false}
                    ]
                }
            ]);
            if (answers.action === false) {
                process.exit(1);
            }
        }
        templateAlias[name] = url;
        sanrc.templateAlias = templateAlias;
        let filepath = getGlobalSanRcFilePath();
        fse.writeJsonSync(filepath, sanrc);

        success(`Add \`${name}\` success!`);
    }
};
