/**
 * @file read-pkg单测mock
 * @author yanyiting
 */

const readPkg = {
    sync: jest.fn(() => ({
        'name': 'san-cli',
        'description': '定制化的前端工程构建工具',
        'version': '1.0.0',
        'scriptName': 'san',
        'main': 'index.js',
        'bin': {
            '3': 'index.js',
            'san': 'index.js'
        },
        'author': 'ksky521',
        'license': 'MIT',
        'engines': {
            'node': '>=8.16'
        },
        'dependencies': {
            '@babel/core': '^7.6.4',
            '@hapi/joi': '^16.1.7',
            'san-cli-utils': '^1.0.0',
            // 'san-cli-command-init': '^1.0.0',
            'babel-loader': '^8.0.6',
            'babel-plugin-dynamic-import-node': '^2.3.0',
            'resolve': '^1.12.0',
            'san': '^3.7.9',
            'semver': '^6.3.0',
            'url-loader': '^2.2.0',
            'webpack': '^4.41.2',
            'webpack-chain': '~6.0.0'
        },
        'devDependencies': {
            'sass': '^1.19.0'
        },
        'san': {
            'commands': [
                './packages/san-cli/__tests__/mock/san-command.js'
            ]
        }
    }))
};
module.exports = new Proxy(readPkg, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return jest.fn();
        }
    }
});
