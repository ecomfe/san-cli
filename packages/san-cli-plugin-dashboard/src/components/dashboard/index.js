/**
 * @file Task Client Addon
*/
import BuildStatus from './build-status';
import BuildProgress from './build-progress';
import SpeedStats from './speed-stats';
import AssetList from './asset-list';
import ModuletList from './module-list';
import './index.less';

export default {
    template: /* html */`
        <div class="task-dashboard">
            <div class="header">
                <div class="header-title">{{$t('addons.dashboard.title')}}</div>
                <div>
                    <s-button
                        s-if="data.taskName === 'start'"
                        class="header-btn open-app-btn"
                        type="primary"
                        href="{{data.serveUrl}}"
                        target="_blank"
                        disabled="{{!data.serveUrl}}">
                        {{$t('addons.dashboard.openApp')}}
                    </s-button>
                    <s-dropdown trigger="click" overlayClassName="task-dashboard-dropdown">
                        <s-menu
                            slot="overlay"
                            on-click="changeSizeType"
                            defaultSelectedKeys="{{['stats']}}">
                            <s-menu-item s-for="sizeType in data.sizeTypes" key="{{sizeType}}">
                                {{sizeType}}
                            </s-menu-item>
                        </s-menu>
                        <s-button class="header-btn size-type-btn" type="primary">
                            {{currentSizeType}} <s-icon type="down" />
                        </s-button>
                    </s-dropdown>
                </div>
            </div>
            <s-grid-row class="row" gutter="16">
                <s-grid-col span="16">
                    <s-card bordered="{{false}}" class="card">
                        <c-build-status
                            data="{{data.data}}"
                            status="{{data.status}}"
                            computed="{{data.computed}}"
                            sizeType="{{currentSizeType}}">
                        </c-build-status>
                    </s-card>
                </s-grid-col>
                <s-grid-col span="8">
                    <s-card bordered="{{false}}" class="card">
                        <c-build-progress data="{{data}}"></c-build-progress>
                    </s-card>
                </s-grid-col>
            </s-grid-row>
            <s-grid-row class="row">
                <s-grid-col span="24">
                    <s-card bordered="{{false}}" class="card" title="速度统计">
                        <c-speed-stats computed="{{data.computed}}" sizeType="{{currentSizeType}}"></c-speed-stats>
                    </s-card>
                </s-grid-col>
            </s-grid-row>
            <s-grid-row class="row">
                <s-grid-col span="24">
                    <s-card bordered="{{false}}" class="card" title="资源">
                        <c-asset-list assetList="{{data.data.assets}}" sizeType="{{currentSizeType}}"></c-asset-list>
                    </s-card>
                </s-grid-col>
            </s-grid-row>
            <s-grid-row class="row">
                <s-grid-col span="12">
                    <s-card bordered="{{false}}" class="card" title="依赖项">
                        <c-module-list moduletList="{{data.computed.modulesPerSizeType[currentSizeType].depModules}}">
                        </c-module-list>
                    </s-card>
                </s-grid-col>
            </s-grid-row>
        </div>
    `,

    components: {
        'c-build-status': BuildStatus,
        'c-build-progress': BuildProgress,
        'c-speed-stats': SpeedStats,
        'c-asset-list': AssetList,
        'c-module-list': ModuletList
    },

    initData() {
        return {
            currentSizeType: 'stats'
        };
    },

    changeSizeType({key}) {
        this.data.set('currentSizeType', key);
    }
};
