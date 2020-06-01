/**
 * @file 项目相关的resolver
 * @author jinzhan
*/
const projects = require('../connectors/projects');

module.exports = {
    Query: {
        projects: (root, args, context) => projects.list(context),
        projectTemplateList: (root, args, context) => projects.getTemplateList(context),
        projectCurrent: (root, args, context) => projects.getCurrent(context)
    },
    Mutation: {
        projectInitTemplate: (root, args, context) => projects.initTemplate(args, context),
        projectCreation: (root, args, context) => projects.create(args, context),
        projectSetFavorite: (root, args, context) => projects.setFavorite(args, context),
        projectImport: (root, args, context) => projects.importProject(args, context),
        projectOpen: (root, args, context) => projects.open(args, context),
        projectOpenInEditor: (root, args, context) => projects.projectOpenInEditor(args, context),
        projectRename: (root, args, context) => projects.rename(args, context),
        projectRemove: (root, args, context) => projects.remove(args, context)
    }
};