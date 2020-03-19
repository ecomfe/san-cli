/**
 * @file plugin.js
 * @author tanglei02 (tanglei02@baidu.com)
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

SanLoaderPlugin.NS = NS;
module.exports = SanLoaderPlugin;
