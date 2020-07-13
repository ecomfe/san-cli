/**
 * @file 任务管理
 * @author jinzhan
 */

const execa = require('execa');
const chalk = require('chalk');
const {log, error, getDebugLogger} = require('san-cli-utils/ttyLogger');
const channels = require('../utils/channels');
const parseArgs = require('../utils/parseArgs');
const projects = require('./projects');
const cwd = require('./cwd');
const logs = require('./logs');
const notify = require('../utils/notify');
const plugins = require('./plugins');
const {readPackage} = require('../utils/fileHelper');
const terminate = require('../utils/terminate');

const MAX_LOGS = 2000;
const WIN_ENOENT_THRESHOLD = 500;
const TASK_STATUS_IDLE = 'idle';
const TASK_STATUS_RUNNING  = 'running';
const debug = getDebugLogger('ui:tasks');

// TODO: 获取配置信息
const prompts = {
    getAnswers() {
        return {};
    }
};

class Tasks {
    constructor() {
        // 这里存储多个项目任务
        this.tasks = new Map();
    }

    /**
     * 获取某个项目下的任务列表
     *
     * @param {string} file 文件路径
    */
    getTasks(file = cwd.get(), context) {
        const list = this.tasks.get(file) || [];

        // 从当前项目的package.json中script获取信息
        const pkg = readPackage(file, context);
        if (pkg.scripts) {
            const scriptKeys = Object.keys(pkg.scripts);
            scriptKeys.forEach(
                name => {
                    const id = `${file}:${name}`;
                    const command = pkg.scripts[name];
                    const index = list.findIndex(t => t.id === id);
                    const task = {
                        id,
                        name,
                        command,
                        index,
                        prompts: [],
                        views: [],
                        path: file,
                        status: TASK_STATUS_IDLE,
                        logs: []
                    };
                    // 如果任务已存在，更新list数据，否则添加到任务list中
                    ~index ? Object.assign(list[index], task) : list.push(task);
                }
            );
        }
        this.tasks.set(file, list);
        return list;
    }

    /**
     * 通个id去查找一个任务
     * @param {string} id 任务id或者任务path
    */
    findTask(id, context) {
        for (const [, list] of this.tasks) {
            const result = list.find(t => t.id === id || t.id === t.path + ':' + id);
            if (result) {
                return result;
            }
        }
    }

    /**
     * 更新任务
    */
    updateTask(data, context) {
        const task = this.findTask(data.id);
        if (task) {
            Object.assign(task, data);
            context.pubsub.publish(channels.TASK_CHANGED, {
                taskChanged: task
            });
        }
        return task;
    }

    getData(id, context) {
        let data = context.db.get('tasks').find({
            id
        }).value();
        // 拷贝一份
        if (data != null) {
            data = JSON.parse(JSON.stringify(data));
        }
        return data;
    }

    updateData(data, context) {
        if (this.getData(data.id, context)) {
            context.db.get('tasks').find({
                id: data.id
            }).assign(data).write();
        }
        else {
            context.db.get('tasks').push(data).write();
        }
    }

    /**
     * TODO: 删除重复参数
     * @param {Array} args 命令（npm）参数
     *  */
    deduplicateArgs(args) {
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
        return args;
    }

    async run(id, context) {
        const task = this.findTask(id, context);
        if (task && task.status !== TASK_STATUS_RUNNING) {
            task.$terminating = false;
            const answers = prompts.getAnswers();
            let [command, ...args] = parseArgs(task.command);

            // onBeforeRun任务hook
            if (task.onBeforeRun) {
                if (!answers.$_overrideArgs) {
                    const push = args.push.bind(args);
                    args.push = (...items) => {
                        if (items.length && args.indexOf(items[0]) !== -1) {
                            return items.length;
                        }
                        return push(...items);
                    };
                }
                await task.onBeforeRun({
                    answers,
                    args
                });
            }

            args = this.deduplicateArgs(args);

            if (command === 'npm') {
                args.splice(0, 0, '--');
            }

            log('Task run', command, args);

            // 修改任务状态
            this.updateTask({
                id: task.id,
                status: TASK_STATUS_RUNNING
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

                // 命令行log
                log('Task exit', command, args, 'code:', code, 'signal:', signal);

                const duration = Date.now() - task.time;
                const seconds = Math.round(duration / 10) / 100;

                // 通过websocket，往web界面打log
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

                if (code === null || task.$terminating) {
                    this.updateTask({
                        id: task.id,
                        status: 'terminated'
                    }, context);

                    logs.add({
                        message: `Task ${task.id} was terminated`,
                        type: 'info'
                    }, context);
                }
                else if (code !== 0) {
                    this.updateTask({
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
                    this.updateTask({
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

                this.updateTask({
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
        const task = this.findTask(log.taskId, context);
        if (task) {
            if (task.logs.length === MAX_LOGS) {
                task.logs.shift();
            }
            task.logs.push(log);
            context.pubsub.publish(channels.TASK_LOG_ADDED, {
                taskLogAdded: log
            });
        }
    }

    async stop(id, context) {
        const task = this.findTask(id, context);
        if (task && task.status === TASK_STATUS_RUNNING && task.child) {
            task.$terminating = true;
            try {
                const {success, error} = await terminate(task.child, cwd.get());
                if (success) {
                    this.updateTask({
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
                error(e);
            }
        }
        return task;
    }

    clearLogs(id, context) {
        const task = this.findTask(id, context);
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
        // 保存参数
        this.updateData({
            id,
            answers
        }, context);
        return prompts.list();
    }
}

module.exports = new Tasks();
