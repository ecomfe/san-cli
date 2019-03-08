const Handlebars = require('handlebars');

// 增加 handleba helper
Handlebars.registerHelper('if_eq', (a, b, opts) => {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', (a, b, opts) => {
    return a === b ? opts.inverse(this) : opts.fn(this);
});

function isHandlebarTPL(content) {
    return /{{([^{}]+)}}/g.test(content);
}
Handlebars.isHandlebarTPL = isHandlebarTPL;
module.exports = Handlebars;
