/**
 * @file client addon组件
 * @author jinzhan
 */

import Component from '@lib/san-component';

export default class ClientAddon extends Component {
    static template = '<div class="client-addon"></div>';

    attached() {
        const clientAddon = this.data.get('clientAddon');
        const data = this.data.get('data');
        let addonComponent = null;
        window.ClientAddonApi.awaitComponent(clientAddon)
            .then(Component => {
                addonComponent = new Component({
                    data: {
                        data
                    }
                }).attach(this.el);
            })
            .catch(e => {
                console.log(`awaitComponent ${clientAddon} error: ${e}`);
            });

        this.watch('data', data => {
            addonComponent && addonComponent.data.set('data', data);
        });
    }
}
