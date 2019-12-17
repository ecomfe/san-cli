/**
 * @file webpack 5 版本 plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const qs = require('querystring');
const id = 'san-cli-markdown-loader-plugin';
const {NS} = require('./const');

const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin');
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin');
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler');
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin');

const ruleSetCompiler = new RuleSetCompiler([
    new BasicMatcherRulePlugin('test', 'resource'),
    new BasicMatcherRulePlugin('include', 'resource'),
    new BasicMatcherRulePlugin('exclude', 'resource', true),
    new BasicMatcherRulePlugin('resource'),
    new BasicMatcherRulePlugin('conditions'),
    new BasicMatcherRulePlugin('resourceQuery'),
    new BasicMatcherRulePlugin('realResource'),
    new BasicMatcherRulePlugin('issuer'),
    new BasicMatcherRulePlugin('compiler'),
    new BasicEffectRulePlugin('type'),
    new BasicEffectRulePlugin('sideEffects'),
    new BasicEffectRulePlugin('parser'),
    new BasicEffectRulePlugin('resolve'),
    new UseEffectRulePlugin()
]);

class LoaderPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap(id, compilation => {
            const normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(compilation).loader;
            normalModuleLoader.tap(id, loaderContext => {
                loaderContext[NS] = true;
            });
        });

        const rules = compiler.options.module.rules;
        let sanRules = [];
        let rawSanRules;
        for (const rawRule of rules) {
            const clonedRawRule = Object.assign({}, rawRule);
            delete clonedRawRule.include;

            const ruleSet = ruleSetCompiler.compile([
                {
                    rules: [clonedRawRule]
                }
            ]);
            sanRules = ruleSet.exec({
                resource: 'foo.san'
            });

            if (sanRules.length > 0) {
                if (rawRule.oneOf) {
                    /* eslint-disable max-len */
                    throw new Error(
                        '[SanMarkdownLoaderPlugin Error] san-cli-markdown-loader currently does not support san rules with oneOf.'
                    );
                }
                rawSanRules = rawRule;
                break;
            }
        }
        if (!sanRules.length) {
            throw new Error(
                /* eslint-disable operator-linebreak */
                '[SanMarkdownLoaderPlugin Error] No matching rule for .san files found.\n' +
                    'Make sure there is at least one root-level rule that matches .san files.'
            );
        }

        // get the normlized "use" for vue files
        const sanUse = sanRules.filter(rule => rule.type === 'use').map(rule => rule.value);

        // 获取 loader 配置
        const sanUseIdx = sanUse.findIndex(u => {
            return /san-webpack-loader|san-loader|(\/|\\|@)san-loader/.test(u.loader);
        });

        if (sanUseIdx < 0) {
            throw new Error(
                '[SanMarkdownLoaderPlugin Error] No matching use for san-loader is found.\n' +
                    'Make sure the rule matching .san files include san-loader in its use.'
            );
        }

        const sanLoaderUse = sanUse[sanUseIdx];
        sanLoaderUse.ident = 'san-loader-options';
        sanLoaderUse.options = sanLoaderUse.options || {};

        // fix conflict with config.loader and config.options when using config.use
        delete rawSanRules.loader;
        delete rawSanRules.options;
        rawSanRules.use = sanUse;

        const pitcher = {
            loader: require.resolve('./loaders/pitcher'),
            resourceQuery: query => {
                const parsed = qs.parse(query.slice(1));
                return parsed['san-md'] != null;
            },
            options: {}
        };
        // 添加新的 rule
        const refs = new Map();
        compiler.options.module.rules = [pitcher, cloneRule(rawSanRules, refs), ...rules];
    }
}

function cloneRule(rawRule, refs) {
    const rules = ruleSetCompiler.compileRules(
        'ruleSet',
        [
            {
                rules: [rawRule]
            }
        ],
        refs
    );
    let currentResource;

    const conditions = rules[0].rules
        .map(rule => rule.conditions)
        // shallow flat
        .reduce((prev, next) => prev.concat(next), []);

    // do not process rule with enforce
    if (!rawRule.enforce) {
        const ruleUse = rules[0].rules
            .map(rule => rule.effects.filter(effect => effect.type === 'use').map(effect => effect.value))
            // shallow flat
            .reduce((prev, next) => prev.concat(next), []);

        // fix conflict with config.loader and config.options when using config.use
        delete rawRule.loader;
        delete rawRule.options;
        rawRule.use = ruleUse;
    }

    const res = Object.assign({}, rawRule, {
        resource: {
            test: resource => {
                return true;
            }
        },
        resourceQuery: query => {
            const parsed = qs.parse(query.slice(1));
            if (parsed['san-md'] != null) {
                return true;
            }
        }
    });

    delete res.test;

    if (rawRule.oneOf) {
        res.oneOf = rawRule.oneOf.map(rule => cloneRule(rule, refs));
    }

    return res;
}

LoaderPlugin.NS = NS;
module.exports = LoaderPlugin;
