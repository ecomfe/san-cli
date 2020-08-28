/**
 * @file 读写存储在本地文件中的共享数据
 * @author jinzhan
*/
import SHARED_DATA from '@graphql/shared-data/sharedData.gql';
import SHARED_DATA_UPDATE from '@graphql/shared-data/sharedDataUpdate.gql';
import SHARED_DATA_UPDATED from '@graphql/shared-data/sharedDataUpdated.gql';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';

module.exports = {
    async $getProjectId() {
        const query = await this.$apollo.query({
            query: PROJECT_CURRENT
        });

        return (query.data.projectCurrent || {}).id;
    },

    async $getSharedData(id) {
        const projectId = await this.$getProjectId();
        const query = await this.$apollo.query({
            query: SHARED_DATA,
            variables: {
                id,
                projectId
            }
        });
        return query.data.sharedData;
    },

    async $watchSharedData(id, callback) {
        const projectId = await this.$getProjectId();
        return this.$apollo.subscribe({
            query: SHARED_DATA_UPDATED,
            variables: {
                id,
                projectId
            }
        }).subscribe({
            next: ({data}) => {
                if (data && data.sharedDataUpdated) {
                    callback(data.sharedDataUpdated.value);
                }
            }
        });
    },

    async $setSharedData(id, value) {
        const projectId = await this.$getProjectId();
        return this.$apollo.mutate({
            mutation: SHARED_DATA_UPDATE,
            variables: {
                id,
                value,
                projectId
            }
        });
    },

    async $syncSharedData(data) {
        // TODO: sync data
    }
};
