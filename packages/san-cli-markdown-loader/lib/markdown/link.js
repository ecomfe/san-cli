/**
 * @file 将相对.md 换成 html，href 是外链添加 blank
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {mdLink2Html} = require('../utils');

function markdownitLink(md, configs) {
    /* eslint-disable fecs-camelcase*/
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex('href');
        if (hrefIndex >= 0) {
            let href = token.attrs[hrefIndex][1];
            if (/^[\.\/]+.*?\.md$/.test(href)) {
                href = mdLink2Html(href);
            }
            token.attrs[hrefIndex][1] = href;

            if (/^https?:\/\//.test(href)) {
                // 添加 target
                let aIndex = token.attrIndex('target');

                if (aIndex < 0) {
                    token.attrPush(['target', '_blank']);
                } else {
                    token.attrs[aIndex][1] = '_blank';
                }
            }
        }

        return self.renderToken(tokens, idx, options, env, self);
    };
}

module.exports = markdownitLink;
