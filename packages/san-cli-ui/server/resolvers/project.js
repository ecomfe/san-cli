/**
 * @file 项目相关的resolver
 * @author jinzhan
*/
const projects = require('../connectors/projects');
const plugins = require('../connectors/plugins');

module.exports = {
    Project: {
        type: (project, args, context) => projects.getType(project, context),
        plugins: (project, args, context) => plugins.list(project.path, context)
    },
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
        projectRemove: (root, args, context) => projects.remove(args, context),
        projectCwdReset: (root, args, context) => projects.resetCwd(context)
    }
};