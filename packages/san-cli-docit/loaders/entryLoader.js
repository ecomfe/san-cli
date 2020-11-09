/**
 * @file entry loader
 * @author ksky521
 */
const qs = require('querystring');
const loaderUtils = require('loader-utils');
module.exports = function (source) {
    const {resourceQuery} = this;
    const siteData = loaderUtils.getOptions(this) || {};

    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);
    let {md = null} = query;
    if (md == null || !/\.md$/.test(md)) {
        return source;
    }
    const importString = ['navbar', 'sidebar'].map(key => {
        if (siteData[key] && /\.md$/.test(siteData[key])) {
            const query = qs.stringify({
                // 来自 markdown-loader/loader 的 exportType
                exportType: 'list',
                relativeTo: md
            });
            return `import $${key} from '${siteData[key]}?${query}';`;
        }
        return `const $${key} = '';`;
    }).join('\n');

    let code = `
        import '${md}';
        ${importString}
        ${source}
    `;

    const isProd = this.mode === 'production';
    code = code + (isProd ? '' : '\nimport "../san-cli-docit/client-entry.js"');
    return code;
};
