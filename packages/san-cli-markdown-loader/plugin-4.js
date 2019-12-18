/**
 * @file webpack 4 版本 plguin，添加 san-md 拦截
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const qs = require('querystring');

const RuleSet = require('webpack/lib/RuleSet');
const id = 'san-cli-markdown-loader-plugin';
const {NS} = require('./const');

class LoaderPlugin {
    apply(compiler) {
        if (compiler.hooks) {
            // webpack 4
            compiler.hooks.compilation.tap(id, compilation => {
                let normalModuleLoader;
                if (Object.isFrozen(compilation.hooks)) {
                    // webpack 5
                    normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(compilation).loader;
                } else {
                    normalModuleLoader = compilation.hooks.normalModuleLoader;
                }
                normalModuleLoader.tap(id, loaderContext => {
                    // 这个是为了在loader里面读取this的ns，然后检测plugin是否使用！！！
                    loaderContext[NS] = true;
                });
            });
        } else {
            // webpack < 4
            compiler.plugin('compilation', compilation => {
                compilation.plugin('normal-module-loader', loaderContext => {
                    loaderContext[NS] = true;
                });
            });
        }

        const rawRules = compiler.options.module.rules;
        const {rules} = new RuleSet(rawRules);
        let sanRuleIndex = rawRules.findIndex(createMatcher('foo.san'));

        const sanRule = rules[sanRuleIndex];

        if (!sanRule) {
            throw new Error(
                /* eslint-disable operator-linebreak */
                '[SanMarkdownLoaderPlugin Error] No matching rule for .san files found.\n' +
                    'Make sure there is at least one root-level rule that matches .san files.'
            );
        }

        if (sanRule.oneOf) {
            /* eslint-disable max-len */
            throw new Error('[SanMarkdownLoaderPlugin Error] san-cli-markdown-loader currently does not support san rules with oneOf.');
        }
        const sanUse = sanRule.use;
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

        const pitcher = {
            loader: require.resolve('./loaders/pitcher'),
            resourceQuery: query => {
                const parsed = qs.parse(query.slice(1));
                return parsed['san-md'] != null;
            },
            options: {}
        };
        // 添加新的 rule
        compiler.options.module.rules = [pitcher, cloneRule(sanRule), ...rules];
    }
}
LoaderPlugin.NS = NS;
module.exports = LoaderPlugin;

function cloneRule(rule) {
    return _cloneRule(
        rule,
        resource => {
            return true;
        },
        query => {
            const parsed = qs.parse(query.slice(1));
            if (parsed['san-md'] != null) {
                return true;
            }
        }
    );
}

/* eslint-disable fecs-camelcase */
function _cloneRule(rule, test, resourceQuery) {
    const res = Object.assign({}, rule, {
        resource: {
            test
        },
        resourceQuery
    });

    if (rule.oneOf) {
        res.oneOf = rule.oneOf.map(rule => _cloneRule(rule, test, resourceQuery));
    }

    return res;
}

function createMatcher(fakeFile) {
    return (rule, i) => {
        const clone = Object.assign({}, rule);
        delete clone.include;
        const normalized = RuleSet.normalizeRule(clone, {}, '');
        return !rule.enforce && normalized.resource && normalized.resource(fakeFile);
    };
}
