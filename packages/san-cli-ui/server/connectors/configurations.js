/**
 * @file configuration
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/configurations.js
 */
const fs = require('fs-extra');
const path = require('path');
const plugins = require('./plugins');
const folders = require('./folders');
const cwd = require('./cwd');
const prompts = require('./prompts');

const fileTypes = ['js', 'json'];
let current = {};

const list = () => {
    return plugins.getApi(cwd.get()).configurations;
};
const findOne = (id, context) => {
    return list(context).find(c => c.id === id);
};
const findFile = (fileDescriptor, context) => {
    if (fileDescriptor.package) {
        const pkg = folders.readPackage(cwd.get(), context);
        const data = pkg[fileDescriptor.package];
        if (data) {
            return {type: 'package', path: path.join(cwd.get(), 'package.json')};
        }
    }

    for (const type of fileTypes) {
        const files = fileDescriptor[type];
        if (files) {
            for (const file of files) {
                const resolvedFile = path.resolve(cwd.get(), file);
                if (fs.existsSync(resolvedFile)) {
                    return {type, path: resolvedFile};
                }
            }
        }
    }
};

const readFile = (config, fileDescriptor, context) => {
    const file = findFile(fileDescriptor, context);
    let fileData = {};
    if (file) {
        if (file.type === 'package') {
            const pkg = folders.readPackage(cwd.get(), context);
            fileData = pkg[fileDescriptor.package];
        }
        else if (file.type === 'js') {
            fileData = require(file.path);
        }
        else {
            const rawContent = fs.readFileSync(file.path, {encoding: 'utf8'});
            if (file.type === 'json') {
                fileData = JSON.parse(rawContent);
            }
        }
    }
    return {
        file,
        fileData
    };
};
const readData = (config, context) => {
    const data = {};
    config.foundFiles = {};
    if (config.files) {
        for (const fileId in config.files) {
            const fileDescriptor = config.files[fileId];
            const {file, fileData} = readFile(config, fileDescriptor, context);
            config.foundFiles[fileId] = file;
            data[fileId] = fileData;
        }
    }
    return data;
};
const getPromptTabs = async (id, context) => {
    const config = findOne(id, context);
    if (config) {
        const data = readData(config, context);
        console.log('Config read', config.id, data);
        current = {config, data};

        // API
        const onReadData = await config.onRead({
            cwd: cwd.get(),
            data
        });

        let tabs = onReadData.tabs;
        if (!tabs) {
            tabs = [
                {
                    id: '__default',
                    label: 'Default',
                    prompts: onReadData.prompts
                }
            ];
        }
        await prompts.reset();
        for (const tab of tabs) {
            tab.prompts = tab.prompts.map(data => prompts.add({
                ...data,
                tabId: tab.id
            }));
        }
        if (onReadData.answers) {
            await prompts.setAnswers(onReadData.answers);
        }
        await prompts.start();

        plugins.callHook({
            id: 'configRead',
            args: [{
                config,
                data,
                onReadData,
                tabs,
                cwd: cwd.get()
            }],
            file: cwd.get()
        }, context);

        return tabs;
    }
    return [];
};

module.exports = {
    list,
    findOne,
    getPromptTabs
};
