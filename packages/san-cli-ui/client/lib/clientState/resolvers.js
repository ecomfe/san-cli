/**
 * @file resolvers
 * @author zhangtingting12
 */

export default {
    Mutation: {
        connectedSet: (root, {value}, {cache}) => {
            const data = {
                connected: value
            };
            cache.writeData({data});
            return null;
        },
        currentProjectIdSet: (root, {projectId}, {cache}) => {
            cache.writeData({data: {currentProjectId: projectId}});
            return null;
        }
    }
};
