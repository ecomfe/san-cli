/**
 * @file MatrixPlugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const JsonpTemplatePlugin = require('webpack/lib/web/JsonpTemplatePlugin');
const SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin');

const PLUGIN_NAME = 'MatrixPlugin';
class MatrixPlugin {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                excludedPlugins: [PLUGIN_NAME],
                additionalPlugins: []
            },
            options
        );
        if (!this.options.matrixEnv) {
            // 错误，不做任何事情
            /* eslint-disable no-console */
            console.log(`${PLUGIN_NAME}: matrixEnv is empty!`);
            /* eslint-enable no-console */
        } else if (!Array.isArray(this.options.matrixEnv)) {
            this.options.matrixEnv = [this.options.matrixEnv];
        }
        // 去掉 main，main 编译给主进程
        this.options.matrixEnv = this.options.matrixEnv.filter(env => env !== 'main');
    }
    apply(compiler) {
        if (this.options.matrixEnv.length) {
            compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
                this.options.matrixEnv.forEach(env => {
                    const outputOptions = Object.assign({}, compiler.options.output);

                    outputOptions.filename = this.getFileName(outputOptions.filename, env);
                    outputOptions.chunkFilename = this.getFileName(outputOptions.chunkFilename, env);
                    this.createChildCompiler(compiler, compilation, outputOptions);
                });
                // calback();
                callback();
            });
        }
    }
    getFileName(filename, env) {
        if (filename) {
            // [name]=> [name]-[env]
        } else {
            return `[name]-${env}.js`;
        }
    }
    createChildCompiler(compiler, compilation, outputOptions) {
        const childCompiler = compilation.createChildCompiler(PLUGIN_NAME, outputOptions);
        childCompiler.context = compiler.context;
        childCompiler.inputFileSystem = compiler.inputFileSystem;
        childCompiler.outputFileSystem = compiler.outputFileSystem;
        let plugins = (compiler.options.plugins || []).filter(
            c => this.options.excludedPlugins.indexOf(c.constructor.name) < 0
        );
        // Add the additionalPlugins
        plugins = plugins.concat(this.options.additionalPlugins);
        if (Array.isArray(plugins)) {
            for (const plugin of plugins) {
                plugin.apply(childCompiler);
            }
        }

        Object.keys(compiler.options.entry).forEach(entry => {
            const entryFiles = compiler.options.entry[entry];
            if (Array.isArray(entryFiles)) {
                new MultiEntryPlugin(compiler.context, entryFiles, entry).apply(childCompiler);
            } else {
                new SingleEntryPlugin(compiler.context, entryFiles, entry).apply(childCompiler);
            }
        });

        // Convert entry chunk to entry file
        new JsonpTemplatePlugin().apply(childCompiler);

        if (compiler.options.optimization) {
            if (compiler.options.optimization.splitChunks) {
                new SplitChunksPlugin(Object.assign({}, compiler.options.optimization.splitChunks)).apply(
                    childCompiler
                );
            }
        }
        // ...
        // childCompiler.runas
    }
}

module.exports = MatrixPlugin;
