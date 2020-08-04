/**
 * @file 仪表盘显示部件组件
 * @author zttonly
 */

import {Component} from 'san';
import {
    getPositionStyle,
    getSizeStyle,
    GRID_SIZE
    // ZOOM
} from '@lib/utils/position';
import {LAYOUT_ONE_THIRD} from '@lib/const';
import WIDGET_CONFIG_OPEN from '@graphql/widget/widgetConfigOpen.gql';
import WIDGET_CONFIG_SAVE from '@graphql/widget/widgetConfigSave.gql';
import PROMPT_ANSWER from '@graphql/prompt/promptAnswer.gql';
import WIDGET_FRAGMENT from '@graphql/widget/widgetFragment.gql';
import {Icon, Button, Modal} from 'santd';
import PromptsList from '../prompts-form/prompts-form';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/modal/style';
import './dashboard-widget.less';

export default class DashboardWidget extends Component {

    static template = /* html */`
        <div class="dashboard-widget">
            <div class="shell" style="{{mainStyle}}">
                <div class="wrap">
                    <div class="flex-none head-bar">
                        <div class="head-title">{{customTitle || $t(widget.definition.title)}}</div>

                        <!-- Custom actions -->
                        <template s-if="widget.configured && headerActions.length > 0" s-for="action in headerActions">
                           <s-button
                                s-if="!action.hidden"
                                icon="{=action.icon=}"
                                disabled="{=action.disabled=}"
                                class="icon-button"
                                on-click="onCustomAction(action)"
                            ></s-button>
                        </template>

                        <!-- Setting button -->
                        <s-button
                                s-if="widget.definition.hasConfigPrompts"
                                icon="setting"
                                class="icon-button"
                                on-click="openConfig"
                            ></s-button>

                        <!-- Exit button -->
                        <s-button
                            s-if="details"
                            icon="fullscreen-exit"
                            class="icon-button"
                            on-click="exitDetails"
                        ></s-button>

                        <!-- Open details button -->
                        <s-button
                            s-elif="widget.definition.openDetailsButton"
                            icon="fullscreen"
                            class="icon-button"
                            on-click="openDetails"
                        ></s-button>
                    </div>
                    <div s-if="widget.configured"
                        s-ref="{{'clientAddons' + widget.definition.component}}"
                        class="flex-all content"
                    >
                    </div>
                    <div s-else class="flex-all content not-configured">
                        <s-icon
                            type="setting"
                            class="icon huge"
                        />
                        <s-button type="primary"
                            ghost="{{true}}"
                            on-click="openConfig"
                        >{{$t('dashboard.widgets.widget.configure')}}</s-button>
                    </div>
                    <div
                        s-if="moveState"
                        class="move-ghost"
                        style="{{moveGhostStyle}}"
                    >
                        <div class="backdrop"></div>
                    </div>
                    <div s-if="custom"
                        class="overlay"
                        on-click="select"
                    >
                        <div class="definition-chip">
                            <s-icon type="{{widget.definition.icon}}"/>
                            <div class="title">{{customTitle || $t(widget.definition.title) }}</div>
                        </div>
                        <s-button
                            class="remove-button"
                            type="primary"
                            icon="close"
                            shape="circle"
                            on-click="remove"
                        ></s-button>
                    </div>
                </div>
            </div>
            <s-modal 
                s-if="showConfig"
                width="580"
                title="{{$t('dashboard.widget.configure')}}"
                visible="{=showConfig=}"
                okText="{{$t('dashboard.widget.save')}}"
                on-ok="save"
                on-cancel="closeConfig"
            >
                <div class="default-body">
                    <div s-if="loadingConfig" class="widget-loading">
                        <s-spin spinning="{=loadingConfig=}">
                            <s-icon slot="indicator" type="loading" style="font-size: 24px;" />
                        </s-spin>
                    </div>
                    <c-prompts s-else
                        s-ref="widgetConfigForm"
                        form-item-layout="{{formItemLayout}}"
                        hide-submit-btn="{{true}}"
                        prompts="{=visiblePrompts=}"
                        on-submit="saveConfig"
                        on-valuechanged="onConfigChange"
                    />
                </div>
            </s-modal>
        </div>
    `;

    static computed = {
        mainStyle() {
            const field = this.data.get('widget');
            const moveState = this.data.get('moveState');
            if (!field) {
                return {};
            }
            if (moveState) {
                return {
                    ...getPositionStyle(moveState.pxX, moveState.pxY),
                    ...getSizeStyle({field, gridSize: GRID_SIZE})
                };
            }
            return {
                ...getPositionStyle(GRID_SIZE * field.x, GRID_SIZE * field.y),
                ...getSizeStyle({field, gridSize: GRID_SIZE})
            };
        },

        moveGhostStyle() {
            const moveState = this.data.get('moveState');
            const field = this.data.get('widget');
            if (!field || !moveState) {
                return {};
            }
            return {
                ...getPositionStyle(GRID_SIZE * moveState.x, GRID_SIZE * moveState.y),
                ...getSizeStyle({field, gridSize: GRID_SIZE})
            };
        },
        visiblePrompts() {
            let widget = this.data.get('widget');
            return widget && widget.prompts ? widget.prompts.filter(p => {
                try {
                    p.value = JSON.parse(p.value);
                }
                catch (error) {};
                if (p.type === 'list' && !p.value) {
                    p.value = [];
                }
                return p.visible;
            }) : [];
        }
    };
    static components = {
        's-icon': Icon,
        's-button': Button,
        's-modal': Modal,
        'c-prompts': PromptsList
    };
    static messages = {
        async ['Widget:title'](arg) {
            const title = arg.value;
            this.data.set('customTitle', title);
        },
        async ['Widget:addHeaderAction'](arg) {
            this.addHeaderAction(arg.value);
        }
    }
    initData() {
        return {
            moveState: null,
            resizeState: null,
            headerActions: [],
            widget: null,
            custom: false,
            loaded: false,
            isAttached: false,
            customTitle: null,
            details: false,
            loadingConfig: false,
            showConfig: false,
            formItemLayout: LAYOUT_ONE_THIRD
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
    // detached() {
    //     this.removeMoveListeners();
    // }
    addChild() {
        const {widget, isAttached} = this.data.get();
        const addonApi = window.ClientAddonApi;
        const parentEl = this.ref('clientAddons' + widget.definition.component);

        // 禁止多次attach
        if (isAttached || !parentEl || !widget || !addonApi) {
            return;
        }

        let Child = addonApi.getComponent(widget.definition.component);
        if (!Child) {
            return;
        }
        let node = new Child({
            owner: this,
            source: '<x-child widget="{=widget=}" />'
        });

        node.attach(parentEl);
        this.data.set('isAttached', true);
    }
    remove() {
        const id = this.data.get('widget.id');
        this.dispatch('Widget:remove', id);
    }
    // removeMoveListeners() {
    //     window.removeEventListener('mousemove', this.onMoveUpdate);
    //     window.removeEventListener('mouseup', this.onMoveEnd);
    // }
    // updateMoveState(e) {
    //     const initalMousePosition = this.data.get('initalMousePosition');
    //     const mouseDeltaX = e.clientX - initalMousePosition.x;
    //     const mouseDeltaY = e.clientY - initalMousePosition.y;
    //     const field = this.data.get('widget');
    //     const pxX = field.x * GRID_SIZE + mouseDeltaX / ZOOM;
    //     const pxY = field.y * GRID_SIZE + mouseDeltaY / ZOOM;
    //     let x = Math.round(pxX / GRID_SIZE);
    //     let y = Math.round(pxY / GRID_SIZE);
    //     if (x < 0) {
    //         x = 0;
    //     }
    //     if (y < 0) {
    //         y = 0;
    //     }
    //     this.data.set('moveState', {
    //         pxX,
    //         pxY,
    //         x,
    //         y
    //     });
    // }

    // onMoveStart(e) {
    //     this.data.set('initalMousePosition', {
    //         x: e.clientX,
    //         y: e.clientY
    //     });
    //     this.updateMoveState(e);
    //     window.addEventListener('mousemove', this.onMoveUpdate);
    //     window.addEventListener('mouseup', this.onMoveEnd);
    // }

    // onMoveUpdate(e) {
    //     this.updateMoveState(e);
    // }

    // async onMoveEnd(e) {
    //     this.updateMoveState(e);
    //     this.removeMoveListeners();
    //     if (this.onMoved) {
    //         await this.onMoved();
    //     }
    //     this.data.set('moveState', null);
    // }

    // onMoved() {
    // }
    addHeaderAction(action) {
        this.removeHeaderAction(action.id);
        // Optional props should still be reactive
        if (!action.disabled) {
            action.disabled = false;
        }
        if (!action.hidden) {
            action.hidden = false;
        }
        this.data.push('headerActions', action);
    }

    removeHeaderAction(id) {
        const headerActions = this.data.get('headerActions');
        const index = headerActions.findIndex(a => a.id === id);
        if (index !== -1) {
            this.data.splice('headerActions', [index, 1]);
        }
    }
    save() {
        this.ref('widgetConfigForm').handleSubmit();
    }
    async openConfig() {
        this.data.set('loadingConfig', true);
        let widgetConfig = await this.$apollo.mutate({
            mutation: WIDGET_CONFIG_OPEN,
            variables: {
                id: this.data.get('widget.id')
            }
        });

        if (widgetConfig.data) {
            this.data.set('showConfig', true);
            this.data.set('widget', widgetConfig.data.widgetConfigOpen);
        }
        this.data.set('loadingConfig', false);
    }
    async onConfigChange({prompt, value}) {
        await this.$apollo.mutate({
            mutation: PROMPT_ANSWER,
            variables: {
                input: {
                    id: prompt.id,
                    value: JSON.stringify(value)
                }
            },
            update: (store, {data: {promptAnswer}}) => {
                store.writeFragment({
                    fragment: WIDGET_FRAGMENT,
                    fragmentName: 'widget',
                    id: this.data.get('widget.id'),
                    data: {
                        prompts: promptAnswer
                    }
                });
            }
        });
    }
    async saveConfig() {
        this.data.set('loadingConfig', true);
        this.data.set('showConfig', true);
        let widgetConfig = await this.$apollo.mutate({
            mutation: WIDGET_CONFIG_SAVE,
            variables: {
                id: this.data.get('widget.id')
            }
        });
        this.data.set('widget', widgetConfig.data.widgetConfigSave);
        this.data.set('loadingConfig', false);
        this.closeConfig();
        this.nextTick(() => this.addChild());
    }
    closeConfig() {
        this.data.set('showConfig', false);
    }

    openDetails() {
        this.data.set('details', true);
    }
    exitDetails() {
        this.data.set('details', true);
    }
    onCustomAction(action) {
        return action.onCalled();
    }
}