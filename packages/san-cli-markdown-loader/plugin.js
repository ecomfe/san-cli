/**
 * @file webpack 4 版本 plguin，添加 san-md 拦截
 * @author ksky521
 */
const qs = require('querystring');

const RuleSet = require('webpack/lib/RuleSet');
const HTMLPlugin = require('html-webpack-plugin');
const {SanProject} = require('san-ssr');
const id = 'san-cli-markdown-loader-plugin';
const {NS, isSanLoader} = require('./const');

class LoaderPlugin {
    apply(compiler) {
        if (compiler.hooks) {
            // webpack 4
            compiler.hooks.compilation.tap(id, compilation => {
                let normalModuleLoader;
                if (Object.isFrozen(compilation.hooks)) {
                    // webpack 5
                    normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(compilation).loader;
                }
                else {
                    normalModuleLoader = compilation.hooks.normalModuleLoader;
                }
                normalModuleLoader.tap(id, loaderContext => {
                    // 这个是为了在loader里面读取this的ns，然后检测plugin是否使用！！！
                    loaderContext[NS] = true;
                });
            });
        }
        else {
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
            throw new Error(
                '[SanMarkdownLoaderPlugin Error] san-cli-markdown-loader currently does not support san rules with oneOf.'
            );
        }
        const sanUse = sanRule.use;
        // 获取 loader 配置
        const sanUseIdx = sanUse.findIndex(u => {
            return isSanLoader({path: u.loader});
        });
        if (sanUseIdx < 0) {
            throw new Error(
                '[SanMarkdownLoaderPlugin Error] No matching use for san-loader is found.\n' +
                    'Make sure the rule matching .san files include san-loader in its use.'
            );
        }

        // TODO 删掉
        const mdLoaderIdx = rawRules.findIndex(createMatcher('foo.md'));
        const mdLoader = rules[mdLoaderIdx];
        const mdResource = mdLoader.resource;

        const picker = {
            loader: require.resolve('./picker'),
            resource(p) {
                if (mdResource && typeof mdResource === 'function') {
                    return mdResource(p);
                }
                return true;
            },
            resourceQuery(query) {
                const parsed = qs.parse(query.slice(1));
                return parsed['san-md-picker'] != null;
            },
            options: {}
        };

        // 这个san-loader是跟picker配合使用的
        const clonedRule = cloneRule(sanRule);
        // 剔除md loader，移到picker之后
        rules.splice(mdLoaderIdx, 1);

        // 添加新的 rule，利用loader picker 顺序优先处理`?san-md-picker`的情况
        // 将?san-md-picker实际处理转到 picker.js 中
        // loader顺序说明：
        // 1. picker + san-loader会拦截 san-md-picker，所以需要保证picker出来的是 san file
        // 2. md-loader 会放行 san-md-picker，md-loader保证出来的是html（html-loader）和 js

        compiler.options.module.rules = [...rules, mdLoader, clonedRule, picker];

        this.compiler = compiler;

        const isProd = this.compiler.options.mode === 'production';
        this.addHook('afterCompile', isProd
            ? this.ssrRender.bind(this)
            : this.injectGlobalVaribal.bind(this));
    }

    addHook(hook, cb) {
        // webpack 4+
        if (this.compiler.hooks) {
            this.compiler.hooks[hook].tap(id, cb);
        }
        else {
            // webpack < 4
            this.compiler.plugin(hook, cb);
        }
    }

    injectGlobalVaribal(compilation) {
        const plugins = this.getHTMLPlugin();
        if (!global.SAN_DOCIT || !plugins) {
            return;
        }

        const SAN_DOCIT = global.SAN_DOCIT;
        plugins.forEach(plugin => {
            const filepath = plugin.options.filepath;
            const varibal = SAN_DOCIT[filepath];
            if (!filepath || !varibal) {
                return;
            }

            plugin.options.window = plugin.options.window || {};
            plugin.options.window.SAN_DOCIT = varibal;
        });
    }

    ssrRender() {
        const plugins = this.getHTMLPlugin();
        if (!global.SAN_DOCIT || !plugins) {
            return;
        }

        plugins.forEach(plugin => {
            const varibal = this.getVaribal(plugin.options);
            if (!varibal) {
                return;
            }

            const project = new SanProject();

            const entry = require('../san-cli-docit/server-entry');

            const render = project.compileToRenderer(entry);
            const html = render(varibal);

            plugin.options.ssrHtmlSnippet = html;
        });
    }

    getHTMLPlugin() {
        const plugins = this.compiler.options.plugins;
        if (!plugins) {
            return;
        }

        return plugins.filter(plugin => plugin instanceof HTMLPlugin);
    }

    getVaribal(options) {
        const SAN_DOCIT = global.SAN_DOCIT;
        if (!SAN_DOCIT || !options.filepath) {
            return;
        }

        return SAN_DOCIT[options.filepath] || {};
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
            return parsed['san-md-picker'] != null;
        }
    );
}

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

        return (
            !rule.enforce &&
            normalized.resource &&
            normalized.resource(fakeFile) &&
            (!normalized.resourceQuery || (normalized.resourceQuery && normalized.resourceQuery(fakeFile)))
        );
    };
}
