import './asset-list.less';

/* global SanComponent */
export default class AssetList extends SanComponent {
    static template = /* html */`
        <div class="asset-list">
            <s-grid-row class="first-row">
                <s-grid-col span="8"></s-grid-col>
                <s-grid-col span="4">Parsed</s-grid-col>
                <s-grid-col span="4">Global</s-grid-col>
                <s-grid-col span="4">3G Slow</s-grid-col>
                <s-grid-col span="4">3G Fast</s-grid-col>
            </s-grid-row>
            <s-grid-row s-for="item in assetList">
                <s-grid-col span="8" class="first-col">{{item.name}}</s-grid-col>
                <s-grid-col span="4">{{bytes2kb(item.size.gzip)}}</s-grid-col>
                <s-grid-col span="4">{{item.size.gzip}}</s-grid-col>
                <s-grid-col span="4">{{item.size.gzip}}</s-grid-col>
                <s-grid-col span="4">{{item.size.gzip}}</s-grid-col>
            </s-grid-row>
        </div>
        `;
    bytes2kb(size) {
        return size ? (size / 1024).toFixed(3) + 'kb' : '';
    }
};
