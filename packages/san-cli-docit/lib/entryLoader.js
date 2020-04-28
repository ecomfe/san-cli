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
    import $content, {toc as $toc, matter as $matter, link as $link} from '${md}';
    ${source}
    `;
};
