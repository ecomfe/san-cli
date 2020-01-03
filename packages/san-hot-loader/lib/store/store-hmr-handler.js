/**
 * @file store-hmr-handler.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const defaultOptions = require('./default-options');
const normalizeOptions = require('../utils/normalize-options');
const matchByAst = require('./match-by-ast');
const tpl = require('./tpl');
const {append} = require('../utils/source-map');

module.exports = class StoreHmrHandler {
    constructor(options, loaderContext) {
        this.options = normalizeOptions(defaultOptions, options.store);
        this.loaderContext = loaderContext;
        this.enable = this.options.hotreload === true;
    }

    match(source) {
        if (!this.enable) {
            return;
        }

        for (let pattern of this.options.patterns) {
            if (pattern === 'auto'
                || pattern.store === 'auto'
                || pattern.action === 'auto'
            ) {
                let matchOptions = matchByAst(source);
                if (matchOptions) {
                    return matchOptions;
                }
            }
            // 手动指定 globalAction 的匹配方法
            else if (pattern.action instanceof RegExp) {
                if (pattern.action.test(this.loaderContext.resourcePath)) {
                    return {
                        type: 'globalAction'
                    };
                }
            }
            // 手动指定 store 和 action 的匹配方法
            else if (pattern.store instanceof RegExp && pattern.getActionPath instanceof Function) {
                if (pattern.store.test(this.loaderContext.resourcePath)) {
                    return {
                        type: 'instantSotre',
                        actionPath: pattern.getActionPath(this.loaderContext.resourcePath)
                    };
                }
            }
            else {
                this.loaderContext.emitWarning(new Error(`暂不支持 ${JSON.stringify(pattern)} 形式的配置`));
            }
        }
    }

    async generate(source, {matchOptions, inputSourceMap}) {
        let template = matchOptions.type === 'globalAction'
            ? tpl.globalStoreActionHmrTpl
            : tpl.instantStoreActionHmrTpl;

        let hmrCode = template({
            filePath: this.loaderContext.resourcePath,
            actionPath: matchOptions.actionPath,
            context: this.loaderContext.context
        });

        if (!this.loaderContext.sourceMap) {
            return {code: source + hmrCode};
        }

        return await append(source, hmrCode, {
            inputSourceMap,
            filePath: this.loaderContext.resourcePath,
            sourceRoot: this.loaderContext.context
        });
    }
};

