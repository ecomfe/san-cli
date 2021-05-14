import ChartWithDetails from './chart-with-details';
import buildHierarchy from '../../utils/buildHierarchy';
import {getAssetsData, getBundleDetails, formatSize} from '../../utils/util';
import styles from './index.less';

export default {
    template: /* html */`
        <div s-if="!disabled">
            <fragment s-if="assetsData && assetsData.length && assetsData.length > 1">
                <select on-change="onAssetChange" value="{{selectedAssetIndex}}">
                    <option value="0">All Chunks</option>
                    <option s-for="asset,index in assetsData" key="{{index}}" value="{{index + 1}}">
                        {{asset.name}} ({{formatSize(asset.size)}})
                    </option>
                </select>
            </fragment>
            <c-char-width-details 
                chartData="{{chartData}}" 
                bundleDetails="{{bundleDetails}}"
                styles="{{styles}}"
            />
        </div>
    `,

    components: {
        'c-char-width-details': ChartWithDetails
    },

    initData() {
        return {
            styles,
            selectedAssetIndex: 0
        };
    },

    attached() {
        this.formatData(this.data.get('data'));
        this.watch('data', data => {
            this.formatData(data);
        });
    },

    formatData({analyzerData}) {
        if (!analyzerData) {
            return;
        }
        const {assets, chunks, modules} = analyzerData;
        const chartData = buildHierarchy(modules);

        const assetsData = getAssetsData(assets, chunks);

        const bundleDetails = getBundleDetails({
            assets: assetsData,
            selectedAssetIndex: this.data.get('selectedAssetIndex')
        });

        this.data.set('bundleDetails', bundleDetails);
        this.data.set('chartData', chartData);
        this.data.set('assetsData', assetsData);
    },

    formatSize(size) {
        return formatSize(size);
    },

    onAssetChange(e) {
        const selectedAssetIndex = Number(e.target.value);
        let modules = [];
        let chartData = {};

        if (selectedAssetIndex === 0) {
            modules = this.data.get('data.modules');
        }
        else {
            const asset = this.data.get('assetsData')[selectedAssetIndex - 1];
            modules = asset.chunk.modules;
        }

        if (modules) {
            chartData = buildHierarchy(modules);
        }

        const bundleDetails = getBundleDetails({
            assets: this.data.get('assetsData'),
            selectedAssetIndex
        });

        this.data.set('bundleDetails', bundleDetails);
        this.data.set('chartData', chartData);
        this.data.set('selectedAssetIndex', selectedAssetIndex);
    }
};
