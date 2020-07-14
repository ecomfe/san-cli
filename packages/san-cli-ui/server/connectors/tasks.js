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
            const task = list.find(t => t.id === id || t.id === t.path + ':' + id);
            if (task) {
                return task;
            }
        }
    }

    /**
     * 更新任务
     * 1. 更新任务map
     * 2. 发布websocket消息
     * 3. 打日志
     * 4. 发送通知
     *
     * @param {Object} taskData 任务信息
     * @param {Object} context 透传的context
     * @param {Object} taskLog push到前端task界面的log信息
     */
    updateTask(taskData, context, taskLog) {
        const {id, message, status} = taskData;
        const task = this.findTask(id);
        if (task) {
            Object.assign(task, taskData);
            context.pubsub.publish(channels.TASK_CHANGED, {
                taskChanged: task
            });
        }

        // 如果需要打log
        if (message) {
            debug(message);

            // 任务是否完成
            const isCompleted = ~['done', 'error'].indexOf(status);

            // 往界面全局命令行面板push log，类型默认为info类型
            const defaultLogType = 'info';
            const type = isCompleted ? status : defaultLogType;
            logs.add({
                message,
                type
            }, context);

            // 桌面通知
            isCompleted && notify({
                title: `Task ${status}`,
                message,
                icon: status
            });

            // 往task的web命名行中push日志
            let text = taskLog || message;
            text = status === 'error' ? chalk.red(text) : chalk.grey(text);
            this.addTaskLog({
                taskId: id,
                type: 'stdout',
                text
            }, context);
        }

        return task;
    }

    getDbData(id, context) {
        let data = context.db.get('tasks').find({
            id
        }).value();
        // 拷贝一份
        if (data) {
            data = JSON.parse(JSON.stringify(data));
        }
        return data;
    }

    updateDbData(data, context) {
        const {id} = data;
        const tasksDb = context.db.get('tasks');
        this.getDbData(id, context) ? tasksDb.find({id}).assign(data).write()
            : tasksDb.push(data).write();
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

    getTaskStatus(task, code) {
        const duration = Date.now() - task.time;
        const seconds = Math.round(duration / 10) / 100;
        let message;
        let status;
        if (task.$terminating) {
            message = `Task ${task.id} was terminated`;
            status = 'terminated';
        }
        else if (code !== 0) {
            message = `Task ${task.id} ended with error code ${code}`;
            status = 'error';
        }
        else {
            message = `Task ${task.id} completed in ${seconds}s.`;
            status = 'done';
        }
        return {status, message};
    }

    async run(id, context) {
        // 查找要运行的任务
        const task = this.findTask(id, context);

        // 如果任务已在执行或者任务不存在
        if (!task || task.status === TASK_STATUS_RUNNING) {
            return task;
        }

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

        // TODO: 清理参数的重复项
        args = this.deduplicateArgs(args);

        // 格式化为execa执行格式
        if (command === 'npm') {
            args.splice(0, 0, '--');
        }

        // 修改任务状态
        this.updateTask({
            id: task.id,
            status: TASK_STATUS_RUNNING,
            message: `Task ${task.id} started`
        }, context, `$ ${command} ${args.join(' ')}`);

        // 运行任务
        const child = this.runTask(task, command, args, context);

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

        return task;
    }

    runTask(task, command, args, context) {
        // 开始执行任务
        log('Task run', command, args);

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

        child.stdout.on('data', buffer => {
            this.taskLogPipe(task, 'stdout', context).add(buffer.toString());
        });

        child.stderr.on('data', buffer => {
            this.taskLogPipe(task, 'stderr', context).add(buffer.toString());
        });

        const onExit = async (code, signal) => {
            this.taskLogPipe(task, 'stdout', context).flush();
            this.taskLogPipe(task, 'stderr', context).flush();

            // 命令行log
            log('Task exit', command, args, 'code:', code, 'signal:', signal);

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
            const taskStatus = this.getTaskStatus(task, code);

            this.updateTask({
                ...task,
                ...taskStatus
            }, context);

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
            const message = `Error while running task ${task.id} with message'${err.message}'`;
            this.updateTask({
                id: task.id,
                status: 'error',
                message
            }, context);

            error(err);
        });
        return child;
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

    /**
     * 1. tasks字段里面添加日志
     * 2. 往命令行中push日志
    */
    addTaskLog(log, context) {
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

    taskLogPipe(task, type, context) {
        return this.logPipe(queue => {
            this.addTaskLog({
                taskId: task.id,
                type,
                text: queue
            }, context);
        });
    }

    clearLogs(id, context) {
        const task = this.findTask(id, context);
        if (task) {
            task.logs = [];
        }
        return task;
    }

    saveParameters({id}, context) {
        const answers = prompts.getAnswers();
        // 保存参数
        this.updateDbData({
            id,
            answers
        }, context);
        return prompts.list();
    }
}

module.exports = new Tasks();
