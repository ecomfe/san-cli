/**
 * @file 从 md 中解析出来 H
 * @author ksky521
 */
const LRU = require('lru-cache');
const hash = require('hash-sum');

const {slugify, deeplyParseHeaders} = require('./utils');

const cache = new LRU({max: 1000});

module.exports = (content, compiler, include = ['H2', 'H3']) => {
    include = include.map(i => i.toLowerCase());
    const key = hash(content + include.join(','));
    const hit = cache.get(key);
    if (hit) {
        return hit;
    }

    const tokens = compiler.parse(content, {});

    let tocMd = [];

    const data = [];
    tokens.forEach((t, i) => {
        if (t.type === 'heading_open' && include.includes(t.tag)) {
            const title = tokens[i + 1].content;
            const slug = t.attrs ? t.attrs.find(([name]) => name === 'id')[1] : '';
            const r = {
                level: parseInt(t.tag.slice(1), 10),
                title: deeplyParseHeaders(title),
                slug: slug || slugify(title)
            };
            tocMd.push(`${new Array((r.level - 2) * 4).join(' ')} - [${r.title}](#${r.slug})`);
            data.push(r);
        }
    });
    const result = {
        data,
        html: compiler.render(tocMd.join('\n'))
    };

    cache.set(key, result);
    return result;
};
