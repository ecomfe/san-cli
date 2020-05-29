/**
 * @file connectors
 * @author zhangtingting12
 */
import CONNECTED_SET from '@/graphql/connected/connectedSet.gql';
import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql';
import CURRENT_PROJECT_ID_SET from '@/graphql/project/currentProjectIdSet.gql';

export const setConnected = (value, apolloClient) => {
    apolloClient.mutate({
        mutation: CONNECTED_SET,
        variables: {
            value
        }
    });
};

export const resetApollo = async apolloClient => {
    console.log('[UI] Apollo store reset');

    const {data: {projectCurrent}} = await apolloClient.query({
        query: PROJECT_CURRENT,
        fetchPolicy: 'network-only'
    });
    const projectId = projectCurrent.id;

    try {
        await apolloClient.resetStore();
    } catch (e) {
        // Potential errors
    }

    await apolloClient.mutate({
        mutation: CURRENT_PROJECT_ID_SET,
        variables: {
            projectId
        }
    });
};
