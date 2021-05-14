/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Handlebars
 * @author ksky521
 */

const Handlebars = require('handlebars');
const setDelimiters = require('handlebars-delimiters');

// 增加 handleba helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
    return a === b ? opts.inverse(this) : opts.fn(this);
});
/*
{{#xif " name == 'Sam' && age === '12' " }}
BOOM
{{else}}
BAMM
{{/xif}}
*/

Handlebars.registerHelper('xif', function(expression, options) {
    return Handlebars.helpers['x'].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});
/* a helper to execute javascript expressions
   USAGE:
   -- Yes you NEED to properly escape the string literals or just alternate single and double quotes
   -- to access any global function or property you should use window.functionName() instead of just functionName(), notice how I had to use window.parseInt() instead of parseInt()
   -- this example assumes you passed this context to your handlebars template( {name: 'Sam', age: '20' } )
   <p>Url: {{x " \"hi\" + name + \", \" + window.location.href + \" <---- this is your href,\" + " your Age is:" + window.parseInt(this.age, 10) "}}</p>
   OUTPUT:
   <p>Url: hi Sam, http://example.com <---- this is your href, your Age is: 20</p>
  */
Handlebars.registerHelper('x', function(expression, options) {
    var result;

    // you can change the context, or merge it with options.data, options.hash
    var context = this;

    // yup, i use 'with' here to expose the context's properties as block variables
    // you don't need to do {{x 'this.age + 2'}}
    // but you can also do {{x 'age + 2'}}
    // HOWEVER including an UNINITIALIZED var in a expression will return undefined as the result.
    /* eslint-disable syntax */
    with (context) {
    /* eslint-enable syntax */
        result = function() {
            try {
                return eval(expression);
            } catch (e) {
                console.warn("•Expression: {{x '" + expression + "'}}\n•JS-Error: ", e, '\n•Context: ', context);
            }
        }.call(context); // to make eval's lexical this=context
    }
    return result;
});

/**
 * 添加设置自定义边界符的方案
 * 
 * @param {Array<string>} delimiters - ['<%=', '%>']
*/
Handlebars.setDelimiters = function(delimiters) {
    if (!Array.isArray(delimiters) || delimiters.length !== 2) {
        console.warn('Handlebars Delimiters Settings Failed');
        return;
    }
    setDelimiters(Handlebars, [...delimiters]);
    Handlebars.delimiters = delimiters;
};

/**
 * 判断是否是Handlebars模板
 * 
 * @param {string} content - 文本内容
 * @param {Array<string>} delimiters - 默认['{{', '}}']
*/
Handlebars.isHandlebarTPL = function(content, delimiters) {
    if (!content) {
        return false;
    }

    delimiters = delimiters || Handlebars.delimiters;

    // Handlebars默认边界符
    if (!delimiters) {
        return /{{([^{}]+)}}/g.test(content);
    }

    // 对用户配置进行转义
    const [startDelimiter, endDelimiter] = delimiters.map(
        t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    );

    return new RegExp(startDelimiter + '.*?' + endDelimiter, 'g').test(content);
};

module.exports = Handlebars;
