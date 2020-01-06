/**
 * @file component hmr handler
 * @author tanglei02 (tanglei02@baidu.com)
 */

const defaultOptions = require('./default-options');
const normalizeOptions = require('../utils/normalize-options');
const matchByAst = require('./match-by-ast');
const tpl = require('./tpl');
const {append} = require('../utils/source-map');

module.exports = class ComponentHmrHandler {
    constructor(options, loaderContext) {
        this.options = normalizeOptions(defaultOptions, options.component);
        this.loaderContext = loaderContext;
        this.enable = this.options.enable !== false;
    }

    match(source) {
        if (!this.enable) {
            return;
        }

        for (let pattern of this.options.patterns) {
            if (pattern === 'auto' || pattern.component === 'auto') {
                if (matchByAst(source, pattern)) {
                    return true;
                }
            }
            else if (pattern.component instanceof RegExp) {
                if (pattern.component.test(this.loaderContext.resourcePath)) {
                    return true;
                }
            }
            else {
                this.loaderContext.emitWarning(
                    new Error(`暂不支持 typeof pattern.component === '${typeof pattern.component}' 的配置`)
                );
            }
        }
    }

    async generate(source, {inputSourceMap}) {
        let hmrCode = tpl({
            componentPath: this.loaderContext.resourcePath,
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

