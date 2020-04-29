const path = require('path');
const MdIt = require('markdown-it');
const {getRelativeLink} = require('./utils');

const activeClassName = 'active';

const parser =  new MdIt({
    xhtmlOut: true,
    html: true
});


function isInline(token) {
    return token.type === 'inline';
}
function isParagraph(token) {
    return token.type === 'paragraph_open';
}
function isListItem(token) {
    return token.type === 'list_item_open';
}

module.exports = (content, configs) => {
    let pathRelative = getRelativeLink;
    if (typeof configs.relativeLink === 'function') {
        pathRelative = configs.relativeLink;
    }
    let relativeTo = configs.relativeTo;
    if (!path.isAbsolute(relativeTo)) {
        relativeTo = path.resolve(configs.context, './' + relativeTo).split('?')[0];
    }


    function isLinkItem(tokens, index) {
        return isInline(tokens[index + 2])
               && isParagraph(tokens[index + 1])
               && isListItem(tokens[index])
               && hasLink(tokens[index + 2].children);
    }
    function hasLink(tokens) {
        return tokens.find(token => {
            if (token.type === 'link_open') {
                const hrefIndex = token.attrIndex('href');
                if (hrefIndex >= 0) {
                    let href = token.attrs[hrefIndex][1];
                    if (!href || /^http[s]:/.test(href)) {
                        return false;
                    }

                    const resolvedFilePath = path.resolve(configs.context, './' + href).split('?')[0];
                    return resolvedFilePath === relativeTo;
                }
            }
            return false;
        });
    }

    function attrSet(token, name, value) {
        let index = token.attrIndex(name);
        let attr = [name, value];

        if (index < 0) {
            token.attrPush(attr);
        }
        else {
            token.attrs[index] = attr;
        }
    }

    parser.use(function markdownItPlugin(md) {

        md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
            if (isLinkItem(tokens, idx)) {
                attrSet(tokens[idx], 'class', activeClassName);
            }
            return self.renderToken(tokens, idx, options, env, self);
        };
        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const hrefIndex = token.attrIndex('href');
            if (hrefIndex >= 0) {

                let href = token.attrs[hrefIndex][1];
                if (href && /^https?:\/\//.test(href)) {
                    // 添加 target
                    attrSet(token, 'target', '_blank');
                }


                if (/^[\.\/]+.*?\.md$/.test(href)) {
                    href = pathRelative(configs.relativeLink, href, configs.rootUrl || '/');
                }
                token.attrs[hrefIndex][1] = href;
            }
            return self.renderToken(tokens, idx, options, env, self);
        };
    });
    return parser.render(content);
};
