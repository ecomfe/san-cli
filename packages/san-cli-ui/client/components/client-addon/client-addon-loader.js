/**
 * @file client addon widget加载组件
 * @author zttonly
 */

import {Component} from 'san';
import CLIENT_ADDONS from '@graphql/client-addon/clientAddons.gql';
import CLIENT_ADDON_ADDED from '@graphql/client-addon/clientAddonAdded.gql';


export default class clientAddonLoader extends Component {
    // 没有此方法会有san的warn
    static template = `
        <template></template>
    `;

    initData() {
        return {
            lastRead: null
        };
    }
    async init() {
        let clientAddons = await this.$apollo.query({
            query: CLIENT_ADDONS,
            fetchPolicy: 'no-cache',
            manual: true
        });
        if (!clientAddons.stale && clientAddons.data) {
            clientAddons.data.clientAddons.forEach(this.loadAddon);
            this.data.set('lastRead', Date.now());
        }
    }
    attached() {
        this.init();
        const observer = this.$apollo.subscribe({query: CLIENT_ADDON_ADDED});
        observer.subscribe({
            next: result => {
                const {data, loading, error, errors} = result;
                /* eslint-disable no-console */
                if (error || errors) {
                    console.log('err');
                }

                if (data && data.clientAddonAdded) {
                    let lastRead = this.data.get('lastRead');
                    if (lastRead && Date.now() - lastRead > 1000) {
                        this.loadAddon(data.clientAddonAdded);
                    }
                }
            },
            error: err => {
                console.log('error', err);
                /* eslint-enable no-console */
            }
        });
    }
    loadAddon(addon) {
        // eslint-disable-next-line no-console
        console.log(`[UI] Loading client addon ${addon.id} (${addon.url})...`);
        const script = document.createElement('script');
        script.setAttribute('src', addon.url);
        document.body.appendChild(script);
    }

}
