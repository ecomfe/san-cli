/**
 * @file yargs/yargs单测mock
 */

const Yargs = jest.fn();

Yargs.prototype.scriptName = jest.fn(() => Yargs.prototype);
Yargs.prototype.usage = jest.fn(() => Yargs.prototype);
Yargs.prototype.option = jest.fn(() => Yargs.prototype);
Yargs.prototype.wrap = jest.fn(() => Yargs.prototype);
Yargs.prototype.terminalWidth = jest.fn(() => Yargs.prototype);
Yargs.prototype.middleware = jest.fn(() => Yargs.prototype);
Yargs.prototype.help = jest.fn(() => Yargs.prototype);
Yargs.prototype.alias = jest.fn(() => Yargs.prototype);
Yargs.prototype.epilog = jest.fn(() => Yargs.prototype);

const yargs = jest.fn(() => new Yargs());

module.exports = yargs;
