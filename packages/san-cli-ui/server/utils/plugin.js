/**
 * @file plugin utils
 */
const pluginRE = /^san-cli-plugin-/;
const SAN_CLI = 'san-cli';

exports.isPlugin = id => {
    return id === SAN_CLI || pluginRE.test(id);
};

exports.getPluginLink = id => {
    if (id === SAN_CLI) {
        return 'https://ecomfe.github.io/san-cli';
    }
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
