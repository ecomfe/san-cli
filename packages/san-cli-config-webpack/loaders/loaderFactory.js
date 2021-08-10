const defaultsDeep = require('lodash.defaultsdeep');

module.exports = ({loader, options = {}}) => opts => ({loader, options: defaultsDeep(opts, options)});
