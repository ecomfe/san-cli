/**
 * @file 包装本地的轻量级JSON数据库lowdb，存储项目信息等
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const Lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const rcPath = require('../utils/rcPath');
const DB_NAME = 'db.json';

fs.ensureDirSync(rcPath);
const dbPath = path.join(rcPath, DB_NAME);
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
