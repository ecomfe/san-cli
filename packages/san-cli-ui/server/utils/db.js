/**
 * @file db
 */
const Lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const rFolder = path.join(os.homedir(), '.san-cli-ui');
fs.ensureDirSync(path.resolve(rFolder));
const db = new Lowdb(new FileSync(path.resolve(rFolder, 'db.json')));

// Seed an empty DB
db.defaults({
    projects: [],
    foldersFavorite: [],
    tasks: [],
    config: {}
}).write();

module.exports = {
    db
};
