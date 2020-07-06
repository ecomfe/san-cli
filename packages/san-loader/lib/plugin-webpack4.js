/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file plugin.js
 * @author clark-t
 * @description inspired by https://github.com/vuejs/vue-loader/blob/master/lib/plugin-webpack4.js
 */

const qs = require('querystring');
const RuleSet = require('webpack/lib/RuleSet');

const id = 'san-loader-plugin';
const NS = 'san-loader';

class SanLoaderPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap(id, compilation => {
            const normalModuleLoader = compilation.hooks.normalModuleLoader;
            normalModuleLoader.tap(id, loaderContext => {
                loaderContext[NS] = true;
            });
        });

        const rawRules = compiler.options.module.rules;
        const {rules} = new RuleSet(rawRules);

        let sanRuleIndex = rawRules.findIndex(createMatcher('foo.san'));
        if (sanRuleIndex < 0) {
            sanRuleIndex = rawRules.findIndex(createMatcher('foo.san.html'));
        }

        const sanRule = rules[sanRuleIndex];
        const clonedRules = rules.filter(r => r !== sanRule).map(cloneRule);

        compiler.options.module.rules = [
            ...clonedRules,
            ...rules
        ];
    }
}

function createMatcher(fakeFile) {
    return (rule, i) => {
        // #1201 we need to skip the `include` check when locating the vue rule
        const clone = Object.assign({}, rule);
        delete clone.include;
        const normalized = RuleSet.normalizeRule(clone, {}, '');
        return (
            !rule.enforce
            && normalized.resource
            && normalized.resource(fakeFile)
        );
    };
}

function cloneRule(rule) {
    const {resource, resourceQuery} = rule;
    // Assuming `test` and `resourceQuery` tests are executed in series and
    // synchronously (which is true based on RuleSet's implementation), we can
    // save the current resource being matched from `test` so that we can access
    // it in `resourceQuery`. This ensures when we use the normalized rule's
    // resource check, include/exclude are matched correctly.
    let currentResource;
    const res = Object.assign({}, rule, {
        resource: {
            test: resource => {
                currentResource = resource;
                return true;
            }
        },
        resourceQuery: query => {
            const parsed = qs.parse(query.slice(1));
            if (parsed.san == null) {
                return false;
            }
            if (resource && parsed.lang == null) {
                return false;
            }
            const fakeResourcePath = `${currentResource}.${parsed.lang}`;
            if (resource && !resource(fakeResourcePath)) {
                return false;
            }
            if (resourceQuery && !resourceQuery(query)) {
                return false;
            }
            if (parsed.type === 'style' && parsed.module !== undefined) {
                const conf = findMatchedLoader('css-loader', rule, currentResource, resourceQuery);
                // style 会经过很多规则，检查 css-loader 的那一个
                if (conf && (!conf.options || !conf.options.modules)) {
                    throw new Error(`css-loader#module not set, required by ${currentResource}${query}`);
                }
            }
            return true;
        }
    });

    if (rule.rules) {
        res.rules = rule.rules.map(cloneRule);
    }

    if (rule.oneOf) {
        res.oneOf = rule.oneOf.map(cloneRule);
    }

    return res;
}

/**
 * 找到 oneOf 或 use 中匹配的指定 loader
 *
 * @argument loaderName 要找的 loader 名
 * @argument rule 当前匹配到的大规则，里面可能有 use 或 oneOf
 * @argument resource 当前 resource
 * @argument query 当前 resourceQuery
 * @return 对应 loader 的配置，如果没有匹配返回 undefined
 */
function findMatchedLoader(loaderName, rule, resource, query) {
    if (rule.use) {
        for (let conf of rule.use) {
            if (conf.loader === loaderName) {
                return conf;
            }
        }
    }
    if (rule.oneOf) {
        for (let subRule of rule.oneOf) {
            if (
                subRule.resource && subRule.resource(resource)
                || subRule.resourceQuery && subRule.resourceQuery(query)
            ) {
                return findMatchedLoader(loaderName, subRule);
            }
        }
    }
}

SanLoaderPlugin.NS = NS;
module.exports = SanLoaderPlugin;
