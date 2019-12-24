/**
 * @file 将相对.md 换成 html
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {mdLink2Html} = require('../utils');
function markdownitLink(md, configs) {
    /* eslint-disable fecs-camelcase*/
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const attrs = token.attrs;
        token.attrs = attrs.map(([key, value]) => {
            if (key === 'href' && /^[\.\/]+.*?\.md$/.test(value)) {
                value = mdLink2Html(value);
            }
            return [key, value];
        });

        return self.renderToken(tokens, idx, options, env, self);
    };
}

module.exports = markdownitLink;
