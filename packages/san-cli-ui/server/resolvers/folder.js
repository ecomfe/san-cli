/**
 * @file 文件夹处理相关API
 * @author jinzhan
*/

const folders = require('../connectors/folders');
const {
    isDirectory,
    fileList,
    isPackage,
    isSanProject
} = require('../utils/fileHelper');

module.exports = {
    Folder: {
        children: (folder, args, context) => fileList(folder.path),
        isPackage: (folder, args, context) => isPackage(folder.path),
        isSanProject: (folder, args, context) => isSanProject(folder.path),
        favorite: (folder, args, context) => folders.isFavorite(folder.path, context)
    },

    Query: {
        folderCurrent: (root, args, context) => folders.getCurrent(args, context),
        foldersFavorite: (root, args, context) => folders.listFavorite(context),
        folderExists: (root, {file}, context) => isDirectory(file)
    },

    Mutation: {
        folderOpen: (root, {path}, context) => folders.open(path, context),
        folderSetFavorite: (root, args, context) => folders.setFavorite({
            file: args.path,
            favorite: args.favorite
        }, context),
        folderCreate: (root, {name}, context) => folders.create(name, context)
    }
};