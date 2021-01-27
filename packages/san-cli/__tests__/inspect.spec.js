/**
 * @file inspect command tests
 */
/* global describe, test */
const execSync = require('child_process').execSync;
const path = require('path');
const {version} = require('../package.json');

describe('command inspect', () => {
    const cliBinPath = require.resolve('../index.js');
    const p = path.dirname(cliBinPath);
    test('inspect', () => {
        const stdout = execSync(`node ${cliBinPath} inspect`).toString();
        expect(stdout).toMatch(`San v${version}`);
        expect(stdout).toMatch(p);
    });
    test('inspect plugins', () => {
        const stdout = execSync(`node ${cliBinPath} inspect plugins`).toString();
        expect(stdout).toMatch(`San v${version}`);
        expect(stdout).toMatch('new SanLoaderPlugin');
    });
    test('inspect with flag', () => {
        const stdout = execSync(`node ${cliBinPath} inspect --plugin progress`).toString();
        expect(stdout).toMatch(`San v${version}`);
        expect(stdout).toMatch('WebpackBarPlugin');
    });
});
