/**
 * @file 从 md 中解析出来 H
 * @author ksky521
 */
const LRU = require('lru-cache');
const {compose, removeNonCodeWrappedHTML, parseHeaders, slugify} = require('./utils');

const deeplyParseHeaders = compose(removeNonCodeWrappedHTML, parseHeaders);

const cache = new LRU({max: 1000});

module.exports = (content, md, include = ['H2', 'H3']) => {
    include = include.map(i => i.toLowerCase());
    const key = content + include.join(',');
    const hit = cache.get(key);
    if (hit) {
        return hit;
    }

    const tokens = md.parse(content, {});

    const res = [];
    tokens.forEach((t, i) => {
        if (t.type === 'heading_open' && include.includes(t.tag)) {
            const title = tokens[i + 1].content;
            const slug = t.attrs ? t.attrs.find(([name]) => name === 'id')[1] : '';
            res.push({
                level: parseInt(t.tag.slice(1), 10),
                title: deeplyParseHeaders(title),
                slug: slug || slugify(title)
            });
        }
    });

    cache.set(key, res);
    return res;
};
