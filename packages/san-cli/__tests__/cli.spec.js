/**
 * @file inspect command tests
 */
/* global describe, test */
const execSync = require('child_process').execSync;
const {version, scriptName} = require('../package.json');
const cliBinPath = require.resolve('../index.js');

describe('core', () => {
    test('version', () => {
        const stdout = execSync(`node ${cliBinPath} -v`).toString();
        expect(stdout).toMatch(version);
    });
    test('help', () => {
        let stdout = execSync(`node ${cliBinPath} -h`).toString();
        stdout = stdout.replace(/\n\s*/g, '');
        expect(stdout).toMatch(`Usage:${scriptName}`);
    });
    test('no sub-command show help', () => {
        const stdout = execSync(`node ${cliBinPath}`).toString();
        expect(stdout).toMatch('Usage:');
        expect(stdout).toMatch('For more information');
    });
});
