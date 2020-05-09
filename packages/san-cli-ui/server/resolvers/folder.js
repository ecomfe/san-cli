const folders = require('../connectors/folders');
const cwd = require('../connectors/cwd');

module.exports = {
    Folder: {
        children: (folder, args, context) => folders.list(folder.path, context),
        isPackage: (folder, args, context) => folders.isPackage(folder.path, context),
        isSanProject: (folder, args, context) => folders.isSanProject(folder.path, context),
        favorite: (folder, args, context) => folders.isFavorite(folder.path, context)
    },

    Query: {
        folderCurrent: (root, args, context) => folders.getCurrent(args, context),
        foldersFavorite: (root, args, context) => folders.listFavorite(context),
        folderExists: (root, {file}, context) => folders.isDirectory(file)
    },

    Mutation: {
        folderOpen: (root, {path}, context) => folders.open(path, context),
        folderOpenParent: (root, args, context) => folders.openParent(cwd.get(), context),
        folderSetFavorite: (root, args, context) => folders.setFavorite({
            file: args.path,
            favorite: args.favorite
        }, context),
        folderCreate: (root, {name}, context) => folders.create(name, context)
    }
};