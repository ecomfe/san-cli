/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file component hmr handler
 * @author clark-t
 */

const defaultOptions = require('./default-options');
const normalizeOptions = require('../utils/normalize-options');
const matchByAst = require('./match-by-ast');
const tpl = require('./tpl');
const {append} = require('../utils/source-map');
const {hasModuleHot, hasComment} = require('../utils/ast');

module.exports = class ComponentHmrHandler {
    constructor({
        ast,
        source,
        options,
        resourcePath,
        needMap,
        inputSourceMap,
        warning
    }) {
        this.ast = ast;
        this.source = source;
        this.resourcePath = resourcePath;
        this.needMap = needMap;
        this.inputSourceMap = inputSourceMap;
        this.waring = warning;
        this.options = normalizeOptions(defaultOptions, options.component);
        this.enable = this.options.enable !== false;
    }

    match() {
        if (!this.enable) {
            return;
        }

        const ast = this.ast;

        if (hasComment(ast, 'san-hmr disable')) {
            return false;
        }

        for (let pattern of this.options.patterns) {
            let tester = pattern && pattern.component || pattern;
            if (tester === 'auto') {
                if (matchByAst(ast)) {
                    return true;
                }
            }
            else if (tester instanceof RegExp) {
                if (tester.test(this.resourcePath)) {
                    return true;
                }
            }
            else if (tester instanceof Function) {
                if (tester(this.resourcePath)) {
                    return true;
                }
            }

            else {
                this.warning(
                    new Error(`暂不支持 typeof pattern === '${typeof tester}' 的配置`)
                );
            }
        }

        if (!hasModuleHot(ast) && hasComment(ast, 'san-hmr component')) {
            return true;
        }
    }

    async genCode() {
        const hmrCode = this.genHmrCode();
        const source = this.source;

        if (!this.needMap) {
            return {code: source + hmrCode};
        }
        // no-return-await
        const result = await append(source, hmrCode, {
            inputSourceMap: this.inputSourceMap,
            resourcePath: this.resourcePath
        });
        return result;
    }

    genHmrCode() {
        return tpl({resourcePath: this.resourcePath});
    }
};

