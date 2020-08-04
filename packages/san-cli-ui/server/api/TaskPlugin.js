/**
 * @file 任务类的插件
 * @author jinzhan
 */

class TaskPlugin {
    constructor() {
        this.tasks = [];
        this.hooks = {
            taskRun: [],
            taskExit: [],
            taskOpen: []
        };
    }

    /**
     * 注册一个任务
     *
     * @param {object} options Task信息
     */
    register(options) {
        try {
            // TODO: to validate task
            // validate(options);
            this.tasks.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // TODO: invalidate task
            // error(e);
        }
    }

    /**
     * 根据script的命令，找到一个描述型的task
     *
     * @param {string} command package.json中的script command
     * @returns {object} task
     */
    getTask(command) {
        // return this.tasks.find(xxx);
    }

    onTaskRun(callback) {
        this.hooks.taskRun.push(callback);
    }

    onTaskExit(callback) {
        this.hooks.taskExit.push(callback);
    }

    onTaskOpen(callback) {
        this.hooks.taskOpen.push(callback);
    }
};

module.exports = TaskPlugin;
