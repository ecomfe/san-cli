/**
 * @file CLI插件系统的组件mixin，向san组件中注入插件方法
 * @author jinzhan
*/

import PLUGIN_ACTION_CALL from '@graphql/plugin/pluginActionCall.gql';
import PLUGIN_ACTION_CALLED from '@graphql/plugin/pluginActionCalled.gql';
import PLUGIN_ACTION_RESOLVED from '@graphql/plugin/pluginActionResolved.gql';

module.exports = {
    async $callPluginAction(id, params) {
        const mutate = await this.$apollo.mutate({
            mutation: PLUGIN_ACTION_CALL,
            variables: {
                id,
                params
            }
        });
        return mutate.data.pluginActionCall;
    },

    $onPluginActionCalled(callback) {
        return this.$apollo.subscribe({
            query: PLUGIN_ACTION_CALLED
        }).subscribe({
            next: ({data}) => {
                callback(data.pluginActionCalled);
            },
            error: err => {
                // eslint-disable-next-line no-console
                console.log('$onPluginActionCalled error', err);
            }
        });
    },

    $onPluginActionResolved(callback) {
        return this.$apollo.subscribe({
            query: PLUGIN_ACTION_RESOLVED
        }).subscribe({
            next: ({data}) => {
                callback(data.pluginActionResolved);
            }
        });
    }
};
