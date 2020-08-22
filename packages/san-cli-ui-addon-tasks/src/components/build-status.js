import './build-status.less';

/* global SanComponent */
export default class BuildStatus extends SanComponent {
    static template = /* html */`
    <div class="build-status">
        <s-grid-row gutter="16" class="first-row">
            <s-grid-col span="8" class="info-block">
                <div class="label">状态</div>
                <div class="value">{{status || '空闲'}}</div>
            </s-grid-col>
            <s-grid-col span="8" class="info-block">
                <div class="label">错误</div>
                <div class="value">{{data.errors.length}}</div>
            </s-grid-col>
            <s-grid-col span="8" class="info-block">
                <div class="label">警告</div>
                <div class="value">{{data.warnings.length}}</div>
            </s-grid-col>
        </s-grid-row>
        <s-grid-row gutter="16">
            <s-grid-col span="8" class="info-block">
                <div class="label">资源</div>
                <div class="value">{{bytes2kb(computed.modulesPerSizeType.gzip.modulesTotalSize)}}(gizp)</div>
                <!-- <div class="extra-info">(Parsed)</div> -->
            </s-grid-col>
            <s-grid-col span="8" class="info-block">
                <div class="label">模块</div>
                <div class="value">{{bytes2kb(computed.modulesPerSizeType.gzip.modulesTotalSize)}}(gizp)</div>
                <!-- <div class="extra-info">(Parsed)</div> -->
            </s-grid-col>
            <s-grid-col span="8" class="info-block">
                <div class="label">依赖项</div>
                <div class="value">{{bytes2kb(computed.modulesPerSizeType.gzip.depModulesTotalSize)}}(gizp)</div>
                <!-- <div class="extra-info">92.78%</div> -->
            </s-grid-col>
        </s-grid-row>
    </div>
    `;

    bytes2kb(size) {
        return (size / 1024).toFixed(3) + 'kb';
    }
};
