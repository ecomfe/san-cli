/**
 * @file 仪表盘显示部件组件
 * @author zttonly
 */

import {Component} from 'san';
import {getPositionStyle, getSizeStyle, GRID_SIZE, ZOOM} from '@lib/utils/position';

export default class DashboardWidget extends Component {

    static template = /* html */`
        <div class="dashboard-widget">
            <div class="shell" style="{{mainStyle}}">
                <div class="wrap">
                    <div class="flex-none head-bar">
                        <div class="head-title">{{customTitle || $t(widget.definition.title)}}</div>

                        <!-- Custom actions -->
                        <template s-if="widget.configured" s-for="action in headerActions">
                            <s-button
                                s-if="!action.hidden"
                                icon="{{action.icon}}"
                                disabled="{{action.disabled}}"
                                type="primary"
                                on-click="action.onCalled"
                            ></s-button>
                        </template>

                        <!-- Settings button -->
                        <s-button
                                s-if="widget.definition.hasConfigPrompts"
                                icon="settings"
                                class="icon-button flat primary"
                                on-click="openConfig"
                            ></s-button>

                        <!-- Close button -->
                        <s-button
                            s-if="details"
                            icon="close"
                            class="icon-button flat primary"
                            on-click="handleClose"
                        ></s-button>

                        <!-- Open details button -->
                        <s-button
                            s-elif="widget.definition.openDetailsButton"
                            icon="zoom_out_map"
                            class="icon-button flat primary"
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
                            type="settings"
                            class="icon huge"
                        />
                        <s-button on-click="openConfig">{{$t('san.dashboard.widgets.widget.configure')}}</s-button>
                    </div>
                    <div
                        s-if="moveState"
                        class="move-ghost"
                        sstyle="{{moveGhostStyle}}"
                    >
                        <div class="backdrop"></div>
                    </div>
                    <div s-if="custom" class="custom">
                        modal
                    </div>
                </div>
            </div>
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
        }
    };

    initData() {
        return {
            moveState: null,
            resizeState: null,
            headerActions: [],
            widget: null,
            custom: false,
            loaded: false,
            text: this.$t('dashboard.widgets'),
            customTitle: null
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
    detached() {
        this.removeMoveListeners();
    }
    addChild() {
        const {widget, text} = this.data.get();
        const addonApi = window.ClientAddonApi;
        const parentEl = this.ref('clientAddons' + widget.definition.component);
        if (!widget || !addonApi) {
            return;
        }

        let Child = addonApi.getComponent(widget.definition.component);
        if (!Child) {
            return;
        }
        let node = new Child({
            parent: this,
            data: {widget, text}
        });

        node.attach(parentEl);
        this.children.push(node);
    }
    removeMoveListeners() {
        window.removeEventListener('mousemove', this.onMoveUpdate);
        window.removeEventListener('mouseup', this.onMoveEnd);
    }
    updateMoveState(e) {
        const initalMousePosition = this.data.get('initalMousePosition');
        const mouseDeltaX = e.clientX - initalMousePosition.x;
        const mouseDeltaY = e.clientY - initalMousePosition.y;
        const field = this.data.get('widget');
        const pxX = field.x * GRID_SIZE + mouseDeltaX / ZOOM;
        const pxY = field.y * GRID_SIZE + mouseDeltaY / ZOOM;
        let x = Math.round(pxX / GRID_SIZE);
        let y = Math.round(pxY / GRID_SIZE);
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
        window.addEventListener('mousemove', this.onMoveUpdate);
        window.addEventListener('mouseup', this.onMoveEnd);
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

    onMoved() {
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
        let headerActions = this.data.get('headerActions');
        headerActions.push(action);
        this.data.set('headerActions', headerActions);
    }

    removeHeaderAction(id) {
        const headerActions = this.data.get('headerActions');
        const index = headerActions.findIndex(a => a.id === id);
        if (index !== -1) {
            headerActions.splice(index, 1);
            this.data.set('headerActions', headerActions);
        }
    }
    openConfig() {
        console.log('openconfig');
    }
}
