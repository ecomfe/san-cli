/**
 * @file entry loader
 * @author ksky521
 */
const qs = require('querystring');
module.exports = function (source) {
    const {resourceQuery} = this;

    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);
    let {md = null} = query;
    if (md == null || !/\.md$/.test(md)) {
        return source;
    }

    return `
        import entry from '../san-cli-docit/client-entry.js';
        import options from '${md}';
        ${source}
        entry(options);
    `;
};
