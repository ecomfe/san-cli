const resolve = require('resolve');
const createRule = require('./createRule');
module.exports = chainConfig => {
    createRule(chainConfig, 'svg', /\.svg(\?.*)?$/, [
        [
            'svg',
            {
                dir: 'svg'
            }
        ]
    ]);
};
