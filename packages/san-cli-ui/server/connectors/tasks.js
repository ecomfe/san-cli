/**
 * @file 任务管理
 * @author jinzhan
 */

const execa = require('execa');
const chalk = require('chalk');
const {log, error, getDebugLogger} = require('san-cli-utils/ttyLogger');
const channels = require('../utils/channels');
const parseArgs = require('../utils/parseArgs');
const cwd = require('./cwd');
const projects = require('./projects');
const logs = require('./logs');
const notify = require('../utils/notify');
const plugins = require('./plugins');
const {readPackage} = require('../utils/fileHelper');
const terminate = require('../utils/terminate');

const MAX_LOGS = 2000;
const WIN_ENOENT_THRESHOLD = 500; // ms
const debug = getDebugLogger('ui:tasks');

// TODO: 获取配置信息
const prompts = {
    getAnswers() {
        return {};
    }
};

class Tasks {
    constructor() {
        this.tasks = new Map();
    }

    /**
     * 获取项目下的任务列表
     *
     * @param {string} 文件路径
    */
    getTasks(file = cwd.get()) {
        let list = this.tasks.get(file);
        if (!list) {
            list = [];
            this.tasks.set(file, list);
        }
        return list;
    }

    async list({file = cwd.get(), api = true} = {}, context) {
        let list = this.getTasks(file);
        const pkg = readPackage(file, context);
        if (pkg.scripts) {
            const existing = new Map();
            const scriptKeys = Object.keys(pkg.scripts);
            let currentTasks = scriptKeys.map(
                name => {
                    const id = `${file}:${name}`;
                    existing.set(id, true);
                    const command = pkg.scripts[name];
                    return {
                        id,
                        name,
                        command,
                        index: list.findIndex(t => t.id === id),
                        prompts: [],
                        views: [],
                        path: file
                    };
                }
            );

            // Process existing tasks
            const existingTasks = currentTasks.filter(
                task => task.index !== -1
            );

            // Update tasks data
            existingTasks.forEach(task => {
                Object.assign(list[task.index], task);
            });

            // Process removed tasks
            const removedTasks = list.filter(
                t => currentTasks.findIndex(c => c.id === t.id) === -1
            );

            // Process new tasks
            const newTasks = currentTasks.filter(
                task => task.index === -1
            ).map(
                task => ({
                    ...task,
                    status: 'idle',
                    child: null,
                    logs: []
                })
            );

            // Keep existing running tasks
            list = list.filter(
                task => existing.get(task.id) || task.status === 'running'
            );

            // Add the new tasks
            list = list.concat(newTasks);

            // Sort
            const getSortScore = task => {
                const index = scriptKeys.indexOf(task.name);
                if (index !== -1) {
                    return index;
                }
                return Infinity;
            };

            list.sort((a, b) => getSortScore(a) - getSortScore(b));

            this.tasks.set(file, list);
        }
        return list;
    }

    findOne(id, context) {
        for (const [, list] of this.tasks) {
            const result = list.find(t => t.id === id || t.id === t.path + ':' + id);
            if (result) {
                return result;
            }
        }
    }

    getSavedData(id, context) {
        let data = context.db.get('tasks').find({
            id
        }).value();
        // Clone
        if (data != null) {
            data = JSON.parse(JSON.stringify(data));
        }
        return data;
    }

    updateSavedData(data, context) {
        if (this.getSavedData(data.id, context)) {
            context.db.get('tasks').find({
                id: data.id
            }).assign(data).write();
        }
        else {
            context.db.get('tasks').push(data).write();
        }
    }

    updateOne(data, context) {
        const task = this.findOne(data.id);
        if (task) {
            if (task.status !== data.status) {
                // updateViewBadges({
                //     task,
                //     data
                // }, context);
            }
            Object.assign(task, data);
            context.pubsub.publish(channels.TASK_CHANGED, {
                taskChanged: task
            });
        }
        return task;
    }

    async run(id, context) {
        const task = this.findOne(id, context);
        if (task && task.status !== 'running') {
            task._terminating = false;

            // Answers
            const answers = prompts.getAnswers();
            let [command, ...args] = parseArgs(task.command);

            // Plugin API
            if (task.onBeforeRun) {
                if (!answers.$_overrideArgs) {
                    const origPush = args.push.bind(args);
                    args.push = (...items) => {
                        if (items.length && args.indexOf(items[0]) !== -1) {
                            return items.length;
                        }
                        return origPush(...items);
                    };
                }
                await task.onBeforeRun({
                    answers,
                    args
                });
            }

            // Deduplicate arguments
            const dedupedArgs = [];
            for (let i = args.length - 1; i >= 0; i--) {
                const arg = args[i];
                if (typeof arg === 'string' && arg.indexOf('--') === 0) {
                    if (dedupedArgs.indexOf(arg) === -1) {
                        dedupedArgs.push(arg);
                    }
                    else {
                        const value = args[i + 1];
                        if (value && value.indexOf('--') !== 0) {
                            dedupedArgs.pop();
                        }
                    }
                }
                else {
                    dedupedArgs.push(arg);
                }
            }
            args = dedupedArgs.reverse();

            if (command === 'npm') {
                args.splice(0, 0, '--');
            }

            log('Task run', command, args);

            this.updateOne({
                id: task.id,
                status: 'running'
            }, context);

            logs.add({
                message: `Task ${task.id} started`,
                type: 'info'
            }, context);

            this.addLog({
                taskId: task.id,
                type: 'stdout',
                text: chalk.grey(`$ ${command} ${args.join(' ')}`)
            }, context);

            task.time = Date.now();

            // Task env
            process.env.san_CLI_CONTEXT = cwd.get();
            process.env.san_CLI_PROJECT_ID = projects.getCurrent(context).id;
            const nodeEnv = process.env.NODE_ENV;
            delete process.env.NODE_ENV;

            const child = execa(command, args, {
                cwd: cwd.get(),
                stdio: ['inherit', 'pipe', 'pipe'],
                shell: true
            });

            if (typeof nodeEnv !== 'undefined') {
                process.env.NODE_ENV = nodeEnv;
            }

            task.child = child;

            const outPipe = this.logPipe(queue => {
                this.addLog({
                    taskId: task.id,
                    type: 'stdout',
                    text: queue
                }, context);
            });

            child.stdout.on('data', buffer => {
                outPipe.add(buffer.toString());
            });

            const errPipe = this.logPipe(queue => {
                this.addLog({
                    taskId: task.id,
                    type: 'stderr',
                    text: queue
                }, context);
            });

            child.stderr.on('data', buffer => {
                errPipe.add(buffer.toString());
            });

            const onExit = async (code, signal) => {
                outPipe.flush();
                errPipe.flush();

                log('Task exit', command, args, 'code:', code, 'signal:', signal);

                const duration = Date.now() - task.time;
                const seconds = Math.round(duration / 10) / 100;

                this.addLog({
                    taskId: task.id,
                    type: 'stdout',
                    text: chalk.grey(`Total task duration: ${seconds}s`)
                }, context);

                // Plugin API
                if (task.onExit) {
                    await task.onExit({
                        args,
                        child,
                        cwd: cwd.get(),
                        code,
                        signal
                    });
                }

                if (code === null || task._terminating) {
                    this.updateOne({
                        id: task.id,
                        status: 'terminated'
                    }, context);

                    logs.add({
                        message: `Task ${task.id} was terminated`,
                        type: 'info'
                    }, context);
                }
                else if (code !== 0) {
                    this.updateOne({
                        id: task.id,
                        status: 'error'
                    }, context);

                    logs.add({
                        message: `Task ${task.id} ended with error code ${code}`,
                        type: 'error'
                    }, context);

                    notify({
                        title: 'Task error',
                        message: `Task ${task.id} ended with error code ${code}`,
                        icon: 'error'
                    });
                }
                else {
                    this.updateOne({
                        id: task.id,
                        status: 'done'
                    }, context);

                    logs.add({
                        message: `Task ${task.id} completed`,
                        type: 'done'
                    }, context);

                    notify({
                        title: 'Task completed',
                        message: `Task ${task.id} completed in ${seconds}s.`
                    });
                }

                plugins.callHook({
                    id: 'taskExit',
                    args: [{
                        task,
                        args,
                        child,
                        cwd: cwd.get(),
                        signal,
                        code
                    }],
                    file: cwd.get()
                }, context);
            };

            child.on('exit', onExit);
            child.on('error', err => {
                const duration = Date.now() - task.time;
                if (process.platform === 'win32' && err.code === 'ENOENT' && duration > WIN_ENOENT_THRESHOLD) {
                    return onExit(null);
                }

                this.updateOne({
                    id: task.id,
                    status: 'error'
                }, context);

                logs.add({
                    message: `Error while running task ${task.id} with message'${err.message}'`,
                    type: 'error'
                }, context);

                notify({
                    title: 'Task error',
                    message: `Error while running task ${task.id} with message'${err.message}'`,
                    icon: 'error'
                });

                this.addLog({
                    taskId: task.id,
                    type: 'stdout',
                    text: chalk.red(`Error while running task ${task.id} with message '${err.message}'`)
                }, context);

                error(err);
            });

            // Plugin API
            if (task.onRun) {
                await task.onRun({
                    args,
                    child,
                    cwd: cwd.get()
                });
            }

            plugins.callHook({
                id: 'taskRun',
                args: [{
                    task,
                    args,
                    child,
                    cwd: cwd.get()
                }],
                file: cwd.get()
            }, context);
        }

        return task;
    }

    addLog(log, context) {
        const task = this.findOne(log.taskId, context);
        if (task) {
            if (task.logs.length === MAX_LOGS) {
                task.logs.shift();
            }
            // TODO: log demo
            // log.id = 's' + Date.now().toString(36);
            // log.type = 'log';
            // log.message = log.text;
            // context.pubsub.publish(channels.CONSOLE_LOG_ADDED, {
            //     consoleLogAdded: log
            // });
            task.logs.push(log);
            context.pubsub.publish(channels.TASK_LOG_ADDED, {
                taskLogAdded: log
            });
        }
    }

    async stop(id, context) {
        const task = this.findOne(id, context);
        if (task && task.status === 'running' && task.child) {
            task._terminating = true;
            try {
                const {success, error} = await terminate(task.child, cwd.get());
                if (success) {
                    this.updateOne({
                        id: task.id,
                        status: 'terminated'
                    }, context);
                }
                else if (error) {
                    throw error;
                }
                else {
                    throw new Error('Unknown error');
                }
            }
            catch (e) {
                log(chalk.red(`Can't terminate process ${task.child.pid}`));
                console.error(e);
            }
        }
        return task;
    }

    clearLogs(id, context) {
        const task = this.findOne(id, context);
        if (task) {
            task.logs = [];
        }
        return task;
    }

    logPipe(action) {
        const maxTime = 300;
        let queue = '';
        let size = 0;
        let time = Date.now();
        let timeout;

        const flush = () => {
            clearTimeout(timeout);
            if (!size) {
                return;
            }
            action(queue);
            queue = '';
            size = 0;
            time = Date.now();
        };

        const add = string => {
            queue += string;
            size++;
            if (size === 50 || Date.now() > time + maxTime) {
                flush();
            }
            else {
                clearTimeout(timeout);
                timeout = setTimeout(flush, maxTime);
            }
        };
        return {
            add,
            flush
        };
    }

    saveParameters({id}, context) {
        const answers = prompts.getAnswers();
        // Save parameters
        this.updateSavedData({
            id,
            answers
        }, context);
        return prompts.list();
    }
}

module.exports = new Tasks();
