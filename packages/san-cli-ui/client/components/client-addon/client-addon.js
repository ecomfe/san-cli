/**
 * @file client addon组件
 * @author jinzhan
 */

import Component from '@lib/san-component';

export default class ClientAddon extends Component {
    static template = '<div class="client-addon"></div>';

    attached() {
        const clientAddon = this.data.get('clientAddon');
        window.ClientAddonApi.awaitComponent(clientAddon)
            .then(Component => {
                new Component({
                    data: {
                        // TODO
                    }
                }).attach(this.el);
            })
            .catch(e => {
                console.log(`awaitComponent ${clientAddon} error: ${e}`);
            });
    }
};
