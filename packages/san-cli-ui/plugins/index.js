/**
 * @file defaults
 * @author zttonly
 */

const { cosmiconfig } = require('cosmiconfig');
const explorer = cosmiconfig('eslint', {
    stopDir: process.cwd()
});

module.exports = api => {
    require('./widgets')(api);
    require('./sanConfig')(api);
    explorer.search().then(result => {
        if (result === null) {
            return;
        }
        require('./eslintConfig')(api);
    });
};
