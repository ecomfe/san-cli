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
        projectInitCreation: (root, args, context) => projects.initCreator()
    }
};