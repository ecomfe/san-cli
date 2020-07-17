/**
 * @file 仪表盘显示部件组件
 * @author zttonly
 */

import {Component} from 'san';

export default class DashboardWidget extends Component {

    static template = /* html */`
        <div class="dashboard-widget">
            <div s-if="custom" class="custom">
                modal
            </div>
        </div>
    `;

    static computed = {
    };

    initData() {
        return {
            widget: null,
            custom: false,
            loaded: false
        };
    }
    attached() {
        if (this.data.get('loaded')) {
            this.nextTick(() => this.addChild());
        }
        else {
            this.watch('loaded', function (value) {
                if (value) {
                    this.nextTick(() => this.addChild());
                }
            });
        }
    }
    addChild() {
        const widget = this.data.get('widget');
        const addonApi = window.ClientAddonApi;
        const parentEl = this.el;
        if (!widget || !addonApi) {
            return;
        }

        let Child = addonApi.getComponent(widget.definition.component);
        if (!Child) {
            return;
        }
        let node = new Child({
            parent: this,
            data: widget
        });

        node.attach(parentEl);
        this.children.push(node);
    }
}
