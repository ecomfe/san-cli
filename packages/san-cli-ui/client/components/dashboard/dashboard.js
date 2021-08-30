/**
 * @file 仪表盘显示部件组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import {getVisiblePrompts} from '@lib/utils/prompt';
import ClientAddon from '../client-addon/client-addon';
import PromptsList from '../prompts-form/prompts-form';
import {LAYOUT_ONE_THIRD} from '@lib/const';
import WIDGET_CONFIG_OPEN from '@graphql/widget/widgetConfigOpen.gql';
import WIDGET_CONFIG_SAVE from '@graphql/widget/widgetConfigSave.gql';
import PROMPT_ANSWER from '@graphql/prompt/promptAnswer.gql';
import WIDGET_FRAGMENT from '@graphql/widget/widgetFragment.gql';
import WIDGET_MOVE from '@graphql/widget/widgetMove.gql';
import './dashboard.less';

const ZOOM = 0.7;

const getPositionStyle = (x, y) => (
    {
        left: `${x}px`,
        top: `${y}px`
    }
);

const getSizeStyle = ({width, height, field, gridSize}) => (
    {
        width: `${width || gridSize * field.width}px`,
        height: `${height || gridSize * field.height}px`
    }
);

export default class DashboardWidget extends Component {
    static template = /* html */`
        <div class="dashboard-widget">
            <div
                class="shell {{isOpenDetails ? 'details-shell' : ''}} {{detailsAnimation ? 'details-animation' : ''}}"
                style="{{mainStyle}}">
                <div class="wrap">
                    <div class="flex-none head-bar">
                        <div class="head-title">{{customTitle || $t(widget.definition.title)}}</div>

                        <!-- Custom actions -->
                        <fragment s-if="widget.configured && headerActions.length > 0" s-for="action in headerActions">
                            <fragment s-if="!action.hidden">
                                <s-tooltip s-if="action.tooltip" title="{{action.tooltip}}">
                                    <s-button
                                        icon="{=action.icon=}"
                                        disabled="{=action.disabled=}"
                                        class="icon-button"
                                        on-click="onCustomAction(action)">
                                    </s-button>
                                </s-tooltip>
                                <s-button
                                    s-else
                                    icon="{=action.icon=}"
                                    disabled="{=action.disabled=}"
                                    class="icon-button"
                                    on-click="onCustomAction(action)">
                                </s-button>
                            </fragment>
                        </fragment>

                        <!-- Setting button -->
                        <s-tooltip
                            s-if="widget.definition.hasConfigPrompts"
                            title="{{$t('dashboard.widgets.widget.actionTooltip.setting')}}">
                            <s-button icon="setting" class="icon-button" on-click="openConfig" size="large"></s-button>
                        </s-tooltip>

                        <!-- Exit button -->
                        <s-tooltip s-if="isOpenDetails" title="{{$t('dashboard.widgets.widget.actionTooltip.exit')}}">
                            <s-button
                                icon="fullscreen-exit"
                                class="icon-button"
                                on-click="changeDetailsStatus(false)"
                                size="large">
                            </s-button>
                        </s-tooltip>

                        <!-- Open details button -->
                        <s-tooltip
                            s-elif="widget.definition.openDetailsButton"
                            title="{{$t('dashboard.widgets.widget.actionTooltip.openDetails')}}">
                            <s-button
                                icon="fullscreen"
                                class="icon-button"
                                on-click="changeDetailsStatus(true)"
                                size="large">
                            </s-button>
                        </s-tooltip>
                    </div>
                    <div s-if="widget.configured" class="flex-all content">
                        <c-client-addon 
                            client-addon="{{widget.definition.component}}"
                            data="{{widget}}" />
                    </div>
                    <div s-else class="flex-all content not-configured">
                        <s-icon type="setting" class="icon huge"></s-icon>
                        <s-button type="primary" on-click="openConfig">
                            {{$t('dashboard.widgets.widget.configure')}}
                        </s-button>
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
                        on-mousedown="onMoveStart"
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
                            on-click="remove(widget.id)"
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
                on-cancel="closeConfig">
                <div class="default-body">
                    <div s-if="loadingConfig" class="widget-loading">
                        <s-spin spinning="{=loadingConfig=}">
                            <s-icon slot="indicator" type="loading" style="font-size: 24px;" />
                        </s-spin>
                    </div>
                    <c-prompts
                        s-else
                        s-ref="widgetConfigForm"
                        form-item-layout="{{formItemLayout}}"
                        hide-submit-btn="{{true}}"
                        prompts="{=visiblePrompts=}"
                        on-submit="saveConfig"
                        on-valuechanged="onConfigChange">
                    </c-prompts>
                </div>
            </s-modal>
        </div>
    `;

    static computed = {
        mainStyle() {
            const gridSize = this.data.get('gridSize');
            const field = this.data.get('widget');
            const moveState = this.data.get('moveState');
            if (!field) {
                return {};
            }
            if (moveState) {
                return {
                    ...getPositionStyle(moveState.pxX, moveState.pxY),
                    ...getSizeStyle({field, gridSize})
                };
            }
            return {
                ...getPositionStyle(gridSize * field.x, gridSize * field.y),
                ...getSizeStyle({field, gridSize})
            };
        },

        moveGhostStyle() {
            const gridSize = this.data.get('gridSize');
            const moveState = this.data.get('moveState');
            const field = this.data.get('widget');
            if (!field || !moveState) {
                return {};
            }
            return {
                ...getPositionStyle(gridSize * moveState.x, gridSize * moveState.y),
                ...getSizeStyle({field, gridSize})
            };
        },
        visiblePrompts() {
            return getVisiblePrompts(this.data.get('widget'));
        }
    };
    static components = {
        'c-prompts': PromptsList,
        'c-client-addon': ClientAddon
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
            customTitle: null,
            isOpenDetails: false,
            loadingConfig: false,
            showConfig: false,
            formItemLayout: LAYOUT_ONE_THIRD,
            detailsAnimation: false
        };
    }
    attached() {
        this.ev1 = e => this.onMoveUpdate(e);
        this.ev2 = e => this.onMoveEnd(e);
    }
    detached() {
        this.removeMoveListeners();
    }
    remove(id) {
        this.dispatch('Widget:remove', id);
    }
    removeMoveListeners() {
        window.removeEventListener('mousemove', this.ev1);
        window.removeEventListener('mouseup', this.ev2);
    }
    updateMoveState(e) {
        const gridSize = this.data.get('gridSize');
        const initalMousePosition = this.data.get('initalMousePosition');
        const mouseDeltaX = e.clientX - initalMousePosition.x;
        const mouseDeltaY = e.clientY - initalMousePosition.y;
        const field = this.data.get('widget');
        const pxX = field.x * gridSize + mouseDeltaX / ZOOM;
        const pxY = field.y * gridSize + mouseDeltaY / ZOOM;
        let x = Math.round(pxX / gridSize);
        let y = Math.round(pxY / gridSize);
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        this.data.set('moveState', {
            pxX,
            pxY,
            x,
            y
        });
    }

    onMoveStart(e) {
        this.data.set('initalMousePosition', {
            x: e.clientX,
            y: e.clientY
        });
        this.updateMoveState(e);
        window.addEventListener('mousemove', this.ev1);
        window.addEventListener('mouseup', this.ev2);
    }

    onMoveUpdate(e) {
        this.updateMoveState(e);
    }

    async onMoveEnd(e) {
        this.updateMoveState(e);
        this.removeMoveListeners();
        if (this.onMoved) {
            await this.onMoved();
        }
        this.data.set('moveState', null);
    }

    async onMoved() {
        const {widget, moveState} = this.data.get();
        let res = await this.$apollo.mutate({
            mutation: WIDGET_MOVE,
            variables: {
                input: {
                    id: widget.id,
                    x: moveState.x,
                    y: moveState.y,
                    width: widget.width,
                    height: widget.height
                }
            }
        });
        this.fire('updatewidgets', res.data.widgetMove);
    }
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
                    value
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
        const widgetConfig = await this.$apollo.mutate({
            mutation: WIDGET_CONFIG_SAVE,
            variables: {
                id: this.data.get('widget.id')
            }
        });

        this.data.set('widget', widgetConfig.data.widgetConfigSave);
        this.data.set('loadingConfig', false);
        this.closeConfig();
    }
    closeConfig() {
        this.data.set('showConfig', false);
    }

    changeDetailsStatus(detailsStatus) {
        this.data.set('isOpenDetails', detailsStatus);
        if (detailsStatus) {
            this.data.set('detailsAnimation', detailsStatus);
        } else {
            const ANIMATION_DURATION = 500;
            setTimeout(() => {
                this.data.set('detailsAnimation', detailsStatus);
            }, ANIMATION_DURATION);
        }
        this.fire('hideOtherWidgets', detailsStatus);
    }
    onCustomAction(action) {
        return action.onCalled();
    }
}
