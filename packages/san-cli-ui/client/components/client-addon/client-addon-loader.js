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
            all: 0,
            cur: 0
        };
    }
    async inited() {
        let clientAddons = await this.$apollo.query({
            query: CLIENT_ADDONS,
            fetchPolicy: 'no-cache',
            manual: true
        });
        if (!clientAddons.stale && clientAddons.data) {
            this.data.set('all', clientAddons.data.clientAddons.length);
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
        // eslint-disable-next-line no-console
        console.log(`[UI] Loading client addon ${addon.id} (${addon.url})...`);
        const that = this;
        const script = document.createElement('script');
        script.setAttribute('src', addon.url);
        script.onload = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                that.addCur();
            }
        };
        document.body.appendChild(script);
    }
    addCur() {
        let {all, cur} = this.data.get();
        this.data.set('cur', cur + 1);
        if (all === cur + 1) {
            this.fire('scriptloaded');
        }
    }

}
