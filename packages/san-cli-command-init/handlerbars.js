/**
 * @file Handlebars
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const Handlebars = require('handlebars');

// 增加 handleba helper
Handlebars.registerHelper('if_eq', (a, b, opts) => {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', (a, b, opts) => {
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
function isHandlebarTPL(content) {
    return /{{([^{}]+)}}/g.test(content);
}
Handlebars.isHandlebarTPL = isHandlebarTPL;
module.exports = Handlebars;
