/**
 * @file 本地的json数据库
 * @author jinzhan
 */

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const Lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const LOCAL_DATA_FOLDER = '.san-cli-ui';
const DB_NAME = 'db.json';

const dbDir = path.join(os.homedir(), LOCAL_DATA_FOLDER);
fs.ensureDirSync(path.resolve(dbDir));

const dbPath = path.join(dbDir, DB_NAME);
const adapter = new FileSync(dbPath);
const db = new Lowdb(adapter);

// 初始化空数据库
db.defaults({
    projects: [],
    foldersFavorite: [],
    tasks: [],
    config: {}
}).write();

module.exports = db;
