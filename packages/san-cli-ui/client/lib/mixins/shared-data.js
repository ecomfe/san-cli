/**
 * @file 读写存储在本地文件中的共享数据
 * @author jinzhan
*/
import SHARED_DATA from '@graphql/shared-data/sharedData.gql';
import SHARED_DATA_UPDATE from '@graphql/shared-data/sharedDataUpdate.gql';
// import SHARED_DATA_UPDATED from '@graphql/shared-data/sharedDataUpdated.gql';
import CURRENT_PROJECT_ID from '@graphql/project/currentProjectId.gql';

module.exports = {
    // $sharedData: {},
    $getProjectId() {
        return new Promise(resolve => {
            const subscribe = this.$apollo.subscribe({
                query: CURRENT_PROJECT_ID
            }).subscribe({
                next: ({data}) => {
                    if (data.currentProjectId) {
                        subscribe.unsubscribe();
                        resolve(data.currentProjectId);
                    }
                }
            });
        });
    },

    async $getSharedData(id) {
        const projectId = await this.$getProjectId();
        const result = await this.$apollo.query({
            query: SHARED_DATA,
            variables: {
                id,
                projectId
            }
        });
        return result.sharedData.value;
    },

    async $watchSharedData(id, callback) {
        const projectId = await this.$getProjectId();
        return this.$apollo.subscribe({
            query: SHARED_DATA,
            variables: {
                id,
                projectId
            }
        }).subscribe({
            next: ({data}) => {
                if (data && data.sharedData) {
                    callback(data.sharedData.value);
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
