/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-max-calls-in-template */
const qs = require('querystring');

const yamlFront = require('yaml-front-matter');
const loaderUtils = require('loader-utils');
const {NS, sanboxRegExp} = require('./const');
const compiler = require('./lib/compiler');

// eslint-disable-next-line
module.exports = function(content) {
    this.cacheable && this.cacheable();
    const loaderContext = this;
    if (!loaderContext['thread-loader'] && !loaderContext[NS]) {
        loaderContext.emitError(
            new Error(
                /* eslint-disable max-len */
                'san-cli-markdown-loader was used without the corresponding plugin. Make sure to include SanMarkdownLoaderPlugin in your webpack config.'
            )
        );
    }
    const source = content;

    const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r);
    const {resourcePath, resourceQuery} = loaderContext;
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);
    let index = query.index;
    const inheritQuery = `&${rawQuery}`;

    // eslint-disable-next-line
    let {template = '', context = process.cwd(), i18n = '', exportType} = loaderUtils.getOptions(this) || {};

    // 1. 获取content，正则匹配 sanbox 内容
    // 2. sanbox 按照位置替换成 Component
    // 3. 组装 san defindComponent 内容
    const frontMatter = yamlFront.loadFront(content);
    const meta = frontMatter.meta || {};
    content = frontMatter.__content;

    const getTemplate = content => {
        const cls = typeof meta.classes === 'string' ? [meta.classes] : meta.classes || ['markdown'];
        return `${JSON.stringify('<div class="' + cls.join(' ') + '">' + content + '</div>')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')}`;
    };
    if (query.exportType === 'html') {
        return `
            export default ${getTemplate(compiler(content))}
        `;
    } else if (query.exportType === 'san-code' || query.exportType === 'sanCode') {
        sanboxRegExp.lastIndex = 0;
        let idx = 0;
        const componentArr = [];
        content = content.replace(sanboxRegExp, (input, match) => {
            const query = `?san-md&type=code-component&index=${idx}&template=${template}&context=${context}&i18n=${i18n}`;
            idx++;
            componentArr.push(stringifyRequest(resourcePath + query));
        });

        index = parseInt(index, 10);

        if (!isNaN(index) && index >= 0 && componentArr[index]) {
            const request = componentArr[index];
            return `
            import mod from ${request}; export default mod; export * from ${request}
        `;
        } else {
            const arr = [];
            const importCode = componentArr
                .map((req, idx) => {
                    const compName = `SanBox${idx}`;
                    arr.push(compName);
                    return `import ${compName} from ${req}`;
                })
                .join(';\n');
            return `
            ${importCode};
            const components =  [${arr.join(',')}];
            export default components;
        `;
        }
    }

    let sanboxArray = [];
    sanboxRegExp.lastIndex = 0;
    content = content.replace(sanboxRegExp, (input, match) => {
        const idx = sanboxArray.length;
        sanboxArray.push(match);
        return `<san-box-${idx}></san-box-${idx}>`;
    });
    if (sanboxArray.length === 0) {
        return `export default {
            template:${getTemplate(compiler(content))},
            _meta:${JSON.stringify(meta)},
            _content: ${JSON.stringify(source)}
        }`;
    } else {
        let components = {};
        sanboxArray = sanboxArray.map((box, idx) => {
            const query = `?san-md&type=sanbox&index=${idx}${inheritQuery}&template=${template}&context=${context}&i18n=${i18n}`;
            components[`san-box-${idx}`] = `Sanbox${idx}`;
            return `import Sanbox${idx} from ${stringifyRequest(resourcePath + query)};`;
        });
        let compString = [];
        Object.keys(components).forEach(key => {
            compString.push(JSON.stringify(key) + ':' + components[key]);
        });
        compString = `{
            ${compString.join(',\n')}
        }`;

        return `
            ${sanboxArray.join('\n')}
            export default {
                _meta:${JSON.stringify(meta)},
                _content: ${JSON.stringify(source)},
                template: ${getTemplate(compiler(content))},
                components: ${compString}
            }
        `;
    }
};
