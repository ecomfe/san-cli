/**
 * @file inspect command tests
 */
/* global test */
const execSync = require('child_process').execSync;
const path = require('path');
const {version} = require('../package.json');

test('command inspect', () => {
    const cliBinPath = require.resolve('../index.js');
    const p = path.dirname(cliBinPath);
    let stdout = execSync(`node ${cliBinPath} inspect`).toString();
    expect(stdout).toMatch(`San inspect v${version}`);
    expect(stdout).toMatch(p);
    stdout = execSync(`node ${cliBinPath} inspect plugins`).toString();
    expect(stdout).toMatch(`San inspect v${version}`);
    expect(stdout).toMatch('new SanLoaderPlugin');
    stdout = execSync(`node ${cliBinPath} inspect --plugin progress`).toString();
    expect(stdout).toMatch(`San inspect v${version}`);
    expect(stdout).toMatch('WebpackBarPlugin');
});
