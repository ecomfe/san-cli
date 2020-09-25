/**
 * @file client addon组件
 * @author jinzhan
 */

import Component from '@lib/san-component';
import './client-addon.less';

export default class ClientAddon extends Component {
    static template = '<div class="client-addon"></div>';

    attached() {
        const clientAddon = this.data.get('clientAddon');
        const data = this.data.get('data');
        this.addonComponent = null;
        window.ClientAddonApi.awaitComponent(clientAddon)
            .then(Component => {
                this.addonComponent = new Component({
                    owner: this,
                    data: {
                        data
                    }
                });
                this.addonComponent.attach(this.el);
            })
            .catch(e => {
                console.log(`awaitComponent ${clientAddon} error: ${e}`);
            });

        this.watch('data', data => {
            if (this.addonComponent) {
                this.addonComponent.data.set('data', data);
            }
            else {
                console.log('AddonComponent is not initialized.');
            }
        });
    }
}
