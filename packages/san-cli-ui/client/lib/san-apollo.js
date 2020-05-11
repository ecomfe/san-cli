/**
 * @file san apollo
 * @author jinzhan
 */

const global = {};

const handleTypes = ['query', 'mutate', 'subscribe'];

const apolloClient = client => ({
    query: (query, variables) => client.query({
        query,
        variables
    }),
    mutate: (mutation, variables) => client.mutate({
        mutation,
        variables
    }),
    subscribe: (subscription, variables) => client.subscribe({
        subscription,
        variables
    })
});

/**
 *  Add a global $apolloClient
 * */
export const register = (san, apolloClient) => {
    if (register.isRegistered) {
        return;
    }

    register.isRegistered = true;

    global.san = san;

    Object.defineProperty(san.Component.prototype, '$apollo', {
        get() {
            return apolloClient;
        }
    });
};

export const createApolloComponent = () => class ApolloComponent extends global.san.Component {
    initData() {
        return {
            loading: false
        };
    }

    created() {
        if (!this.apollo) {
            return;
        }
        this.data.set('loading', true);
        Object.keys(this.apollo).forEach(key => {
            let schema = this.apollo[key];
            // To support variables
            const variables = schema.variables;
            handleTypes.forEach(t => {
                if (schema[t]) {
                    schema = schema[t];
                }
            });
            this.$handle(key, schema, variables);
        });
    }

    $handle(key, schema, variables) {
        const operation = schema.definitions[0].operation;
        if (handleTypes.indexOf(operation) === -1) {
            throw new Error('Operation in Schema is not supported.');
        }
        apolloClient(this.$apollo)[operation](schema, variables)
            .then(data => {
                this.data.set(key, data.data);
            }).finally(() => {
                this.data.set('loading', false);
            });
    }
};
