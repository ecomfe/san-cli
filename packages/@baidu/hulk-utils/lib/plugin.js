const pluginRE = /^@baidu\/hulk-cli-plugin-/;

exports.isPlugin = id => pluginRE.test(id);
