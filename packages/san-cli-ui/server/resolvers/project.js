/**
 * @file 项目相关的resolver
 * @author jinzhan
*/
const projects = require('../connectors/projects');

module.exports = {
    Query: {
        projects: () => {
            return [];
        },
        projectCurrent: () => {
            return {};
        }
    },
    Mutation: {
        projectInitTemplate: (root, args, context) => projects.initTemplate(),
        projectInitCreation: (root, args, context) => projects.initCreator()
    }
};