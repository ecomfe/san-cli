/**
 * @file component run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
/* eslint-disable no-console */

module.exports = (entry, args) => {
    const serve = require('../serve/run').serve;
    const fse = require('fs-extra');

    const context = process.cwd();
    let mainTemplate;
    if (path.extname(entry) === '') {
        // 默认是 docs/index
        const docIndex = path.resolve(entry, './docs/index.js');
        if (fse.existsSync(docIndex)) {
            entry = docIndex;
        }
    }
    if (args.mainTemplate) {
        // 下面来检查下 main template 内容是否正确
        /* eslint-disable no-unused-vars,fecs-no-require */
        const {error} = require('@baidu/hulk-utils/logger');
        /* eslint-enable no-unused-vars,fecs-no-require */

        mainTemplate = path.resolve(args.mainTemplate);
        if (fse.existsSync(mainTemplate)) {
            const content = fse.readFileSync(mainTemplate, {encoding: 'utf8'});
            if (content.indexOf('~entry') === -1) {
                // 必须包含~entry 引入啊
                error(`${args.mainTemplate} is not include \`~entry\`!`);
                process.exit(1);
            }
        } else {
            // 不存在的哦~
            error(`${args.mainTemplate} is not exists!`);
            process.exit(1);
        }
    } else {
        // 默认情况
        mainTemplate = require.resolve('../../template/webpack/component/main.js');
    }
    // eslint-disable-next-line
    return serve(mainTemplate, path.resolve(context, entry), args, 'component', [
        require('../../lib/serivce-plugins/component')
    ]).catch(err => console.log(err));
};
