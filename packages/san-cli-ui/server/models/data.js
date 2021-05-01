/**
 * @file 纯JSON格式的文件数据存储，通常将项目logs等放这里
 * @author jinzhan
 */
const path = require('path');
const fs = require('fs-extra');
const rcPath = require('../utils/rcPath');

const shareDataDir = 'shared-data';
const rootFolder = path.resolve(rcPath, shareDataDir);
fs.ensureDirSync(rcPath);
fs.ensureDirSync(rootFolder);

const resolve = (projectId, id) => {
    return path.resolve(rootFolder, projectId, `${id}.json`);
};

const hasData = (projectId, id) => {
    const file = resolve(projectId, id);
    return fs.existsSync(file);
};

const getData = (projectId, id) => {
    const file = resolve(projectId, id);
    return fs.existsSync(file) ? fs.readJSONSync(file) : null;
};

const setData = (projectId, id, data) => {
    const projectFolder = path.resolve(rootFolder, projectId);
    fs.ensureDirSync(projectFolder);
    fs.writeJsonSync(path.resolve(projectFolder, `${id}.json`), data);
};

const removeData = (projectId, id) => {
    fs.remove(resolve(projectId, id));
};

module.exports = {
    hasData,
    getData,
    setData,
    removeData
};

