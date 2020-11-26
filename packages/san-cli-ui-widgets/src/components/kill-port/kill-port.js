/**
 * @file kill端口组件
 * @author zttonly, Lohoyo
 */

import './kill-port.less';

export default {
    template: /* html */`
        <div class="dashboard-widget-kill-port">
            <div class="status status-{{status}}">
                <s-icon type="{{icons[status]}}"/>
                <div class="info">
                    {{$t('dashboard.widgets.kill-port.status.' + status)}}
                </div>
            </div>
            <div class="actions">
                <s-input-number min="0" max="9999" value="{{port}}" on-change="onchange"></s-input-number>
                <s-button class="btn" type="primary" on-click="kill">
                    {{$t('dashboard.widgets.kill-port.kill')}}
                </s-button>
            </div>
        </div>
    `,
    initData() {
        return {
            status: 'idle',
            icons: {
                idle: 'thunderbolt',
                killed: 'check-circle',
                error: 'exclamation-circle'
            },
            port: ''
        };
    },
    attached() {
        this.statusTimer = null;
        if (this.data.get('status') !== 'idle') {
            this.statusReset();
        }
        else {
            this.watch('status', s => {
                if (s === 'killed') {
                    this.data.set('port', '');
                }
                if (s !== 'idle') {
                    this.statusReset();
                }
            });
        }
    },
    statusReset() {
        this.statusTimer = setTimeout(() => {
            this.data.set('status', 'idle');
        }, 3000);
    },
    onchange(p) {
        this.data.set('port', p);
    },
    async kill() {
        this.statusTimer && clearTimeout(this.statusTimer);
        try {
            const {results, errors} = await this.$callPluginAction('san.widgets.actions.kill-port', {
                port: this.data.get('port')
            });
            if (errors.length && errors[0]) {
                throw new Error(errors[0]);
            }
            results[0] && results[0].status && this.data.set('status', results[0].status);
        }
        catch (e) {
            this.data.set('status', 'error');
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
};
