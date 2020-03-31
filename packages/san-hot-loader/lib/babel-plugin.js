
/**
 * @file babel-plugin-san-hmr.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const getHandler = require('./get-handler');

module.exports = function ({parse}) {
    return {
        visitor: {
            Program(path, state) {
                const matchOptions = {
                    ast: path.node,
                    options: state.opts,
                    resourcePath: state.filename,
                    warning: console.warn
                };

                const handler = getHandler(matchOptions);
                if (!handler) {
                    return;
                }

                // 直接通过
                let hmrCode = handler.genHmrCode();
                let code = parse(hmrCode).program.body[0];
                path.pushContainer('body', code);
            }
        }
    };
};
