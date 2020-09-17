/**
 * @file Task Client Addon
*/
import BuildStatus from './components/build-status';
import BuildProgress from './components/build-progress';
import SpeedStats from './components/speed-stats';
import AssetList from './components/asset-list';
import ModuletList from './components/module-list';
import './index.less';

const TaskDashboard = {
    template: /* html */`
        <div class="task-dashboard">
            <s-dropdown trigger="click" class="size-type">
                <s-menu
                    slot="overlay"
                    on-click="changeSizeType"
                    defaultSelectedKeys="{{['stats']}}"
                    style="box-shadow: 0 2px 20px rgba(0, 0, 0 , .1); border-radius: 5px; width: 80px;">
                    <s-menu-item s-for="sizeType in data.sizeTypes"  key="{{sizeType}}">{{sizeType}}</s-menu-item>
                </s-menu>
                <s-button class="size-type-btn">
                    {{currentSizeType}} <s-icon type="down" />
                </s-button>
            </s-dropdown>
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

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san-cli.components.dashboard', TaskDashboard);
}
