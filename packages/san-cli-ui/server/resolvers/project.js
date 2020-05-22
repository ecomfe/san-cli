/**
 * @file 项目相关的resolver
 * @author jinzhan
*/
const projects = require('../connectors/projects');

module.exports = {
    Query: {
        projects: (root, args, context) => projects.list(context),
        projectCurrent: () => {
            return {};
        }
    },
    Mutation: {
        projectInitTemplate: (root, args, context) => projects.initTemplate(),
        projectInitCreation: (root, args, context) => projects.initCreator(args, context),
        projectSetFavorite: (root, args, context) => projects.setFavorite(args, context),
        projectImport: (root, args, context) => projects.importProject(args, context)
    }
};