/**
 * @file 文件系统相关的方案
 * @author jinzhan
 */

const fs = require('fs');
const path = require('path');
const {generateFolder} = require('../utils/fileHelper');
const cwd = require('./cwd');

class Folders {
    getCurrent(args, context) {
        const base = cwd.get();
        return generateFolder(base, context);
    }

    open(file, context) {
        cwd.set(file, context);
        return generateFolder(cwd.get(), context);
    }

    listFavorite(context) {
        return context.db.get('foldersFavorite').value().map(
            file => generateFolder(file.id, context)
        );
    }

    isFavorite(file, context) {
        return !!context.db.get('foldersFavorite').find({
            id: file
        }).size().value();
    }

    setFavorite({file, favorite}, context) {
        const collection = context.db.get('foldersFavorite');
        if (favorite) {
            collection.push({
                id: file
            }).write();
        }
        else {
            collection.remove({
                id: file
            }).write();
        }
        return generateFolder(file, context);
    }

    createFolder(name, context) {
        const file = path.join(cwd.get(), name);
        fs.mkdirpSync(file);
        return generateFolder(file, context);
    }
};

module.exports = new Folders();
