/**
 * @file client addon widget加载组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import CLIENT_ADDONS from '@graphql/client-addon/clientAddons.gql';
import CLIENT_ADDON_ADDED from '@graphql/client-addon/clientAddonAdded.gql';

export default class clientAddonLoader extends Component {
    // 没有此方法会有san的warn
    static template = `
        <span></span>
    `;

    initData() {
        return {
            lastRead: null,
            loadMap: {}
        };
    }
    async inited() {
        let clientAddons = await this.$apollo.query({
            query: CLIENT_ADDONS,
            fetchPolicy: 'no-cache',
            manual: true
        });

        if (!clientAddons.stale && clientAddons.data) {
            clientAddons.data.clientAddons.forEach(addon => this.loadAddon(addon));
            this.data.set('lastRead', Date.now());
        }
    }
    attached() {
        const observer = this.$apollo.subscribe({query: CLIENT_ADDON_ADDED});
        observer.subscribe({
            next: result => {
                const {data, error, errors} = result;
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
        const loadMap = this.data.get('loadMap');
        const key = addon.id.replace(/\./g, '_');
        if (loadMap && loadMap[key]) {
            return;
        }
        // eslint-disable-next-line no-console
        console.log(`[UI] Loading client addon ${addon.id} (${addon.url})...`);
        const that = this;
        const script = document.createElement('script');
        script.setAttribute('src', addon.url);
        script.onload = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                loadMap[key] = true;
                that.data.set('loadMap', loadMap);
                that.fire('scriptloaded', addon.id);
            }
        };
        document.body.appendChild(script);
    }
}
