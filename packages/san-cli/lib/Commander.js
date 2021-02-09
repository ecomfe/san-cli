/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file yargs instance
 * @author ksky521
 */
// const {resolve} = require('path');
const resolveCwd = require('resolve-cwd');
const yargs = require('yargs/yargs');
const fse = require('fs-extra');
const lMerge = require('lodash.merge');

const {getGlobalSanRcFilePath, findExisting} = require('san-cli-utils/path');
const readPkg = require('san-cli-utils/readPkg');
const {chalk, time, timeEnd, error, getDebugLogger, warn} = require('san-cli-utils/ttyLogger');
const {textCommonColor, textCommonBold} = require('san-cli-utils/color');

const {scriptName, version: pkgVersion} = require('../package.json');
const CommanderAPI = require('./CommanderAPI');
const {getCommandName} = require('./utils');

const buildinCmds = ['build', 'serve', 'init', 'inspect', 'command', 'plugin', 'remote', 'ui'];
const linkText = `For more information, visit ${textCommonColor('https://ecomfe.github.io/san-cli')}`;

const globalDebug = getDebugLogger();
const debug = getDebugLogger('command');
module.exports = class Command {
    constructor(rawArgs = process.argv.slice(2), cwd = process.cwd()) {
        this.rawArgs = rawArgs;
        this.cwd = cwd;
        this._fristLog = true;
        this.help = () => {};
        this.cli = yargs();
        /* eslint-disable no-undef */
        this._commandSet = new Set();
        /* eslint-enable no-undef */
        this._commands = [];
        this.commandMap = new Map();
        this.loadRc();
        this.init();
    }
    loadRc() {
        // 通过 rc 文件预设的默认值，包括扩展的 command
        // **原则**：
        // * 1. rc 文件应该尽量「表现的显性」
        // * 2. 对于每个执行命令的 fe 应该清楚自己的环境，而不是稀里糊涂的用全局 rc
        // * 3. 方便配置默认 preset 统一命令和配置

        time('loadRc');

        // 1. 查找 package.json 的文件
        const pkg = readPkg(this.cwd);
        // 2. 读取 san, dependencies和 devDependencies
        const {dependencies, devDependencies, san = {}} = pkg || {};
        // 3. 合并 pkg.san 和 dependencies，处理相对路径
        const deps = Object.keys(dependencies || {});
        const devDeps = Object.keys(devDependencies || {});
        let commands = deps.concat(devDeps).filter(name => {
            //  忽略非 san-cli 开头的
            if (!/^san-cli-command-|^@[^/]+\/san-cli-command-/.test(name)) {
                return false;
            }
            // 忽略 @types 和 @babel
            if (/^@(types|babel)\//.test(name)) {
                return false;
            }
            return true;
        });
        commands = (san.commands || [])
            .concat(commands)
            .map(name => {
                // 保证插件存在，从 cwd 目录引入
                // 记录下时长
                time(`load-${name}`);
                const path = resolveCwd.silent(name);
                if (!path) {
                    warn(`Load CLI subcommand fail: Cannot found ${name} from package.json 'san' config.`);
                }
                timeEnd(`load-${name}`);
                return path;
            })
            .filter(p => p);
        // 防止 merge
        delete san.commands;
        // 4. 查找 userhome 的 sanrc.json
        const sanFolder = getGlobalSanRcFilePath();
        const filepath = findExisting(sanFolder);
        let sanrc = null;

        if (filepath) {
            try {
                sanrc = fse.readJsonSync(filepath);
            }
            catch (e) {
                // json 格式错误
                error(e);
            }
        }
        // 5. merge全部，返回
        if (sanrc && sanrc.commands) {
            // concat
            commands = commands.concat(sanrc.commands);
            // 防止 merge
            delete sanrc.commands;
        }
        // 目前只有 commands~
        this.presets = lMerge(san, sanrc, {
            // 去重下
            commands
        });

        timeEnd('loadRc');
    }
    command({command, description, builder, handler, middlewares, desc}) {
        const cmd = [command, description || desc || '', builder, handler];
        if (middlewares) {
            cmd.push(middlewares);
        }
        this.commandMap.set(getCommandName(command), cmd);
        // 统一入栈，等待run执行
        this._commands.push(cmd);
        return this;
    }
    init() {
        const self = this;
        // 1. 加载内置命令
        buildinCmds.forEach(cmd => {
            const instance = require(`../commands/${cmd}`);
            self.command(instance);
        });
        // 2. 加载presets命令
        if (Array.isArray(this.presets.commands)) {
            self.addCommands(this.presets.commands);
        }
        function getCommonArgv(argv) {
            const cmd = process.argv[2];
            if (self._fristLog && !process.env.SAN_CLI_MODERN_BUILD && buildinCmds.includes(cmd)) {
                self._fristLog = false;
                // modern 打包不要输出这个了
                // 打印名字
                if (cmd === 'init') {
                    // eslint-disable-next-line no-console
                    console.log(chalk.bold(getCmdLogInfo(cmd)));
                }
                else {
                    // eslint-disable-next-line no-console
                    console.log(textCommonBold(getCmdLogInfo(cmd)));
                }
            }
            // 利用中间件机制，增加公共参数处理和函数等
            if (argv.verbose) {
                // 增加 logger
                globalDebug.enable('san-cli:*');
            }
            else if (argv.logLevel) {
                globalDebug.enable(`san-cli:${argv.logLevel}:*`);
            }

            if (argv.mode) {
                process.env.NODE_ENV = argv.mode;
            }
            // 这里添加他的API
            return {
                _version: pkgVersion,
                _scriptName: scriptName
            };
        }
        // 3. 初始化
        this.cli
            .scriptName(scriptName)
            .detectLocale(false)
            .usage('Usage: $0 <command> [options]')
            .option('verbose', {
                type: 'boolean',
                hidden: true,
                describe: 'Output verbose messages on internal operations'
            })
            .option('no-progress', {
                type: 'boolean',
                default: false,
                hidden: true,
                describe: 'Do not show the progress bar'
            })
            .option('config', {
                alias: 'config-file',
                type: 'string',
                hidden: true,
                describe: 'Project config file'
            })
            .option('mode', {
                hidden: true,
                type: 'string',
                choices: ['development', 'production'],
                describe: 'Operating environment'
            })
            .option('profile', {
                alias: 'profiler',
                hidden: true,
                type: 'boolean',
                default: false,
                describe: 'Show Webpack profiler log'
            })
            .option('dashboard', {
                hidden: true,
                type: 'boolean',
                default: false,
                describe: 'To send ipc message to ui-dashboard'
            })
            .option('log-level', {
                alias: 'logLevel',
                hidden: true,
                type: 'string',
                describe: 'Set debug log scope'
            })
            .wrap(this.cli.terminalWidth() - 30)
            .middleware(getCommonArgv)
            .help()
            // .recommendCommands()
            .check(a => {
                // 检测没有的 command
                const cmdName = a._[0];
                if (cmdName && this.commandMap.get(cmdName)) {
                    return true;
                }
                else if (cmdName) {
                    return textCommonColor(`Unknown command ${chalk.bold(cmdName)}.`);
                }
                return '';
            })
            .alias('help', 'h')
            .alias('version', 'v');
    }
    run(args) {
        args = args || this.rawArgs;
        const cli = this.cli;
        // 1. 读取comands，然后添加它
        this._resolveCommand();
        // 2. 生成help
        this._resolveCliHelp();
        // 3. 检验参数
        if (!args[0]) {
            cli.help();
            return;
        }
        // 4. 触发handler
        this.parsedArgv = cli.parse(args);
    }
    _resolveCommand() {
        const self = this;
        const command = this.cli.command;
        function handlerFactory(cmd, handler) {
            const api = new CommanderAPI(getCommandName(cmd), self);
            return argv => {
                handler(
                    // eslint-disable-line no-undef
                    new Proxy(api, {
                        get(target, prop) {
                            return argv[prop] ? argv[prop] : target[prop];
                        }
                    })
                );
            };
        }
        const iCommand = (cmdName, description, builder = {}, handler, middlewares) => {
            command(
                cmdName,
                description,
                typeof builder === 'object'
                    ? builder
                    : yargs => {
                        const cmd = yargs.getCommandInstance();
                        const oAddHandler = cmd.addHandler;
                        cmd.addHandler = (cmd, description, builder, handler, commandMiddleware) => {
                            // 重写这个方法，是为了让 yargs.addCommandDir 支持commandAPI
                            if (typeof cmd === 'object') {
                                cmd.handler = handlerFactory(cmd.command, cmd.handler);
                                oAddHandler(cmd, description, builder, handler, commandMiddleware);
                            }
                            else {
                                oAddHandler(
                                    cmd,
                                    description,
                                    builder,
                                    handlerFactory(cmd, handler),
                                    commandMiddleware
                                );
                            }
                        };
                        builder(yargs);
                    },
                handlerFactory(cmdName, handler),
                middlewares
            );
        };
        this._commands.forEach(([cmdName, description, builder, handler, middlewares]) =>
            iCommand(cmdName, description, builder, handler, middlewares)
        );
    }
    _resolveCliHelp() {
        const cli = this.cli;
        const usage = cli.getUsageInstance();
        const commands = usage.getCommands();
        const log = msg => {
            // colorful
            // eslint-disable-next-line no-console
            console.log(msg ? msg.replace(/`([^`]+)`/g, (_, m) => chalk.cyan(m)) : '');
        };
        // 添加help
        this.help = cli.help = () => {
            log(`Usage: ${scriptName} <command> [options]`);
            log();
            log('Options:');

            let width = 0;
            commands.forEach(cmd => {
                width = Math.max(cmd[0].length + 12, width);
                width = Math.min(cli.terminalWidth() - 30, width);
            });

            [
                ['--version, -v', 'Show version number'],
                ['--help, -h', 'Show help']
            ].forEach(([option, info]) => {
                let len = width - option.length;
                len = len < 2 ? 2 : len;
                const spaces = new Array(len).join(' ');
                log(`  ${option}${spaces}${info}`);
            });
            log();

            log('Commands:');

            commands.forEach((command, idx) => {
                const commandString = `${scriptName} ${command[0].replace(/^\$0 ?/, '')}`;
                let len = width - commandString.length;
                len = len < 2 ? 2 : len;

                const spaces = new Array(len).join(' ');
                if (idx === 5) {
                    log();
                }
                log(`  ${commandString}${spaces}${command[1]}`);
            });

            log();
            log(linkText);
        };
    }
    addCommands(commands) {
        if (Array.isArray(commands)) {
            const unique = this._commandSet;
            commands.forEach(cmd => {
                if (!cmd) {
                    return;
                }
                let instance = cmd;
                let cmdName = cmd.command;

                if (typeof cmd === 'string') {
                    // 如果是字符串，那么需要require它，并且记录加载时长
                    // 这里需要注意了：
                    // * cmd 可能找不到，现在是直接报错，后面加个更好的处理方式吧
                    // * 如果路径是相对路径或者包名，是 cwd，还是san-cli，还是 global？
                    cmdName = cmd;
                    time(`load-${cmd}`);
                    instance = require(cmd);
                    timeEnd(`load-${cmd}`);
                }
                // 保证至少command是存在的
                if (instance && instance.command) {
                    if (!cmdName || unique.has(cmdName)) {
                        // 保证唯一性
                        error(`${cmdName} is loaded, don't load again!`);
                        return;
                    }
                    debug('Command loaded %s', cmdName);
                    unique.add(cmdName);
                    this.command(instance);
                }
                else {
                    error(`${cmd} is not a validated command instance!`);
                }
            });
        }
    }
};

function getCmdLogInfo(cmd) {
    return `${scriptName[0].toUpperCase()}${scriptName.slice(1)} ${cmd} v${pkgVersion}`;
}
