/**
 * @file plugin utils
 */
const pluginRE = /^san-cli-plugin-/;
const widgetRE = /^san-cli-ui-widget-/;
const SAN_CLI = 'san-cli';

exports.isPlugin = id => {
    return id === SAN_CLI || pluginRE.test(id) || widgetRE.test(id);
};

exports.isWidget = id => {
    return widgetRE.test(id);
};

exports.getPluginLink = id => {
    let pkg = {};
    try {
        pkg = require(`${id}/package.json`);
    }
    catch (e) {}
    return (
        pkg.homepage || (pkg.repository && pkg.repository.url)
            || `https://www.npmjs.com/package/${id.replace('/', '%2F')}`
    );
};
