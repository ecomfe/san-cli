/**
 * @file san apollo
 * @author jinzhan
 */

const global = {};

const DATA_NAME = 'apollo';

const HANDLER_TYPES = ['query', 'mutation', 'subscription'];

const HANDLER_ACTIONS = {
    query: 'query',
    mutation: 'mutate',
    subscription: 'subscribe'
};

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



export const createApolloDataComponent = (Component = global.san && global.san.Component) => {
    if (!Component) {
        throw new Error('global.san has not been registered.');
    }

    if (global.ApolloDataComponent) {
        return global.ApolloDataComponent;
    }

    return global.ApolloDataComponent = class ApolloDataComponent extends Component {
        static template = '<template><slot></slot></template>';

        initData() {
            return {

            };
        }

        attached() {
            HANDLER_TYPES.forEach(type => {
                this.watch(type, value => {
                    this.$$handle(type);
                });
            });

            this.watch('variables', value => {
                this.$$handle();
            });

        }

        $$handle(operation = '') {
            if (!operation) {
                HANDLER_TYPES.forEach(o => {
                    if (this.data.get(o)) {
                        operation = o;
                    }
                });
                if (!operation) {
                    return;
                }
            }
            const schema = this.data.get(operation);
            const variables = this.data.get('variables');
            const varName = this.data.get('var') || DATA_NAME;
            apolloClient(this.$apollo)[HANDLER_ACTIONS[operation]](schema, variables)
                .then(data => {
                    this.owner.data.set(varName, data.data);
                }).catch(err => {
                    // eslint-disable-next-line no-console
                    console.log({
                        err
                    });
                });
        }
    };
};

export const createApolloComponent = (Component = global.san && global.san.Component) => {
    if (!Component) {
        throw new Error('global.san has not been registered.');
    }

    if (global.ApolloComponent) {
        return global.ApolloComponent;
    }

    return global.ApolloComponent = class ApolloComponent extends Component {
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
                const handleTypes = Object.values(HANDLER_ACTIONS);
                handleTypes.forEach(t => {
                    if (schema[t]) {
                        schema = schema[t];
                    }
                });
                this.$$handle(key, schema, variables);
            });
        }

        $$handle(key, schema, variables) {
            const operation = schema.definitions[0].operation;
            const handleTypes = Object.values(HANDLER_ACTIONS);
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
};
