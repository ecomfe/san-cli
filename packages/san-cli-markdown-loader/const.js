exports.sanboxRegExp = /<(sanbox)\s?(?:[^>]+)?>(.+?)<\/\1>/gis;
exports.NS = 'san-cli-markdown-loader';
exports.isSanLoader = l => /(\/|\\|@)(san-loader|san-webpack-loader|(\w+)-san-loader)/.test(l.path);
exports.isNullLoader = l => /(\/|\\|@)null-loader/.test(l.path);
exports.isBabelLoader = l => /(\/|\\|@)babel-loader/.test(l.path);
exports.sanboxTextTag = 'sanbox:text-tag';
exports.sanboxHighlightCode = 'sanbox:highlight-code';
exports.sanboxSanComponent = 'sanbox:sancode';
