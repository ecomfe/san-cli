/**
 * @file Task Client Addon
*/
import BuildStatus from './components/build-status';
import BuildProgress from './components/build-progress';
import SpeedStats from './components/speed-stats';
import AssetList from './components/asset-list';
import ModuletList from './components/module-list';
import './index.less';

/* global SanComponent */
class TaskDashboard extends SanComponent {
    static template = /* html */`
    <div class="task-dashboard">
        <s-grid-row class="row" gutter="16">
            <s-grid-col span="16">
                <s-card bordered="{{false}}" class="card">
                    <c-build-status 
                        data="{{data.data}}" 
                        status="{{data.status}}" 
                        computed="{{data.computed}}">
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
                    <c-speed-stats speedStats="{{speedStats}}"></c-speed-stats>
                </s-card>
            </s-grid-col>
        </s-grid-row>
        <s-grid-row class="row" gutter="16">
            <s-grid-col span="16">
                <s-card bordered="{{false}}" class="card" title="资源">
                    <c-asset-list assetList="{{data.data.assets}}"></c-asset-list>
                </s-card>
            </s-grid-col>
            <s-grid-col span="8">
                <s-card bordered="{{false}}" class="card" title="依赖项">
                    <c-module-list moduletList="{{data.computed.modulesPerSizeType.stats.depModules}}"></c-module-list>
                </s-card>
            </s-grid-col>
        </s-grid-row>
    </div>
    `;

    static components = {
        'c-build-status': BuildStatus,
        'c-build-progress': BuildProgress,
        'c-speed-stats': SpeedStats,
        'c-asset-list': AssetList,
        'c-module-list': ModuletList
    };
};

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san-cli.components.dashboard', TaskDashboard);
}
