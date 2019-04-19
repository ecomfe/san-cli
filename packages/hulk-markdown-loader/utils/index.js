/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const merge = Object.assign;

const hasOwn = Object.prototype.hasOwnProperty;
let cache$1 = {};
const re = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

function lower(string) {
    return string.toLowerCase();
}

function slugify(str) {
    if (typeof str !== 'string') {
        return '';
    }

    let slug = str
        .trim()
        .replace(/[A-Z]+/g, lower)
        .replace(/<[^>\d]+>/g, '')
        .replace(re, '')
        .replace(/\s/g, '-')
        .replace(/-+/g, '-')
        .replace(/^(\d)/, '_$1');
    let count = cache$1[slug];

    count = hasOwn.call(cache$1, slug) ? count + 1 : 0;
    cache$1[slug] = count;

    if (count) {
        slug = slug + '-' + count;
    }

    return slug;
}

slugify.clear = () => {
    cache$1 = {};
};

function helper(className, content) {
    return '<p class="' + className + '">' + content.slice(5).trim() + '</p>';
}
module.exports = {
    merge,
    helper,
    slugify
};
