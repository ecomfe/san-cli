/**
 * @file component-hmr.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const genId = require('../utils/gen-id');
const sanHMRApiPath = require.resolve('san-hot-reload-api');

module.exports = function ({
    componentPath,
    context
}) {
    const componentId = genId(componentPath, context);
    return `
    if (module.hot) {
        var hotApi = require('${sanHMRApiPath}');
        hotApi.install(require('san'), false);
        if (!hotApi.compatible) {
            throw new Error('san-hot-reload-api is not compatible with the version of San you are using.');
        }
        module.hot.accept();
        var id = '${componentId}';
        var moduleDefault = module.exports || module.__proto__.exports;
        moduleDefault = moduleDefault.__esModule ? moduleDefault.default : moduleDefault;
        if (!module.hot.data) {
            hotApi.createRecord(id, moduleDefault);
        }
        else {
            hotApi.reload(id, moduleDefault);
        }
    }
    `;
};

