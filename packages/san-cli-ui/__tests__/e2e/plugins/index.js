/**
 * @type {Cypress.PluginConfig}
 */
// You can read more here:
// https://on.cypress.io/plugins-guide

const path = require('path');


module.exports = (on, config) => {
    return Object.assign({}, config, {
        fixturesFolder: '__tests__/e2e/fixtures',
        integrationFolder: '__tests__/e2e/specs',
        screenshotsFolder: '__tests__/e2e/screenshots',
        videosFolder: '__tests__/e2e/videos',
        supportFile: '__tests__/e2e/support/index.js',
        execTimeout: 1000000,
        pageLoadTimeout: 1000000,
        requestTimeout: 1000000,
        responseTimeout: 1000000,
        env: {
            cwd: path.resolve(__dirname, '../../../__tests__')
        }
    });
};
