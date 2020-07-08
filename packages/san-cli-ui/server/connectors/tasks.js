/**
 * @file 任务管理
 */

const execa = require('execa');
const chalk = require('chalk');
const {log, getDebugLogger} = require('san-cli-utils/ttyLogger');
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
const tasks = new Map();

// TODO: 获取配置信息
const prompts = {
    getAnswers() {
        return {};
    }
};

function getTasks(file) {
    file = file || cwd.get();
    let list = tasks.get(file);
    if (!list) {
        list = [];
        tasks.set(file, list);
    }

    return list;
};

async function list({
    file,
    api = true
} = {}, context) {
    file = file || cwd.get();
    let list = getTasks(file);
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

        tasks.set(file, list);
    }
    return list;
};

function findOne(id, context) {
    for (const [, list] of tasks) {
        const result = list.find(t => t.id === id || t.id === t.path + ':' + id);
        if (result) {
            return result;
        }
    }
};

function getSavedData(id, context) {
    let data = context.db.get('tasks').find({
        id
    }).value();
    // Clone
    if (data != null) {
        data = JSON.parse(JSON.stringify(data));
    }

    return data;
};

function updateSavedData(data, context) {
    if (getSavedData(data.id, context)) {
        context.db.get('tasks').find({
            id: data.id
        }).assign(data).write();
    }
    else {
        context.db.get('tasks').push(data).write();
    }
};

function updateOne(data, context) {
    const task = findOne(data.id);
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
};


async function run(id, context) {
    const task = findOne(id, context);
    if (task && task.status !== 'running') {
        task._terminating = false;

        // Answers
        const answers = prompts.getAnswers();

        let [command, ...args] = parseArgs(task.command);

        // Output colors
        // See: https://www.npmjs.com/package/supports-color
        process.env.FORCE_COLOR = 1;

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

        updateOne({
            id: task.id,
            status: 'running'
        }, context);

        logs.add({
            message: `Task ${task.id} started`,
            type: 'info'
        }, context);

        addLog({
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

        const outPipe = logPipe(queue => {
            addLog({
                taskId: task.id,
                type: 'stdout',
                text: queue
            }, context);
        });

        child.stdout.on('data', buffer => {
            outPipe.add(buffer.toString());
        });

        const errPipe = logPipe(queue => {
            addLog({
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

            addLog({
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
                updateOne({
                    id: task.id,
                    status: 'terminated'
                }, context);

                logs.add({
                    message: `Task ${task.id} was terminated`,
                    type: 'info'
                }, context);
            }
            else if (code !== 0) {
                updateOne({
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
                updateOne({
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

        child.on('error', error => {
            const duration = Date.now() - task.time;
            // hackish workaround for https://github.com/sanjs/san-cli/issues/2096
            if (process.platform === 'win32' && error.code === 'ENOENT' && duration > WIN_ENOENT_THRESHOLD) {
                return onExit(null);
            }

            updateOne({
                id: task.id,
                status: 'error'
            }, context);

            logs.add({
                message: `Error while running task ${task.id} with message'${error.message}'`,
                type: 'error'
            }, context);

            notify({
                title: 'Task error',
                message: `Error while running task ${task.id} with message'${error.message}'`,
                icon: 'error'
            });

            addLog({
                taskId: task.id,
                type: 'stdout',
                text: chalk.red(`Error while running task ${task.id} with message '${error.message}'`)
            }, context);

            console.error(error);
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
};

async function stop(id, context) {
    const task = findOne(id, context);
    if (task && task.status === 'running' && task.child) {
        task._terminating = true;
        try {
            const {
                success,
                error
            } = await terminate(task.child, cwd.get());
            if (success) {
                updateOne({
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
            console.log(chalk.red(`Can't terminate process ${task.child.pid}`));
            console.error(e);
        }
    }

    return task;
};

function addLog(log, context) {
    const task = findOne(log.taskId, context);
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
};

function clearLogs(id, context) {
    const task = findOne(id, context);
    if (task) {
        task.logs = [];
    }

    return task;
};

function logPipe(action) {
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
};

function saveParameters({
    id
}, context) {
    // Answers
    const answers = prompts.getAnswers();

    // Save parameters
    updateSavedData({
        id,
        answers
    }, context);

    return prompts.list();
};

module.exports = {
    list,
    findOne,
    run,
    stop,
    updateOne,
    clearLogs,
    saveParameters
};
