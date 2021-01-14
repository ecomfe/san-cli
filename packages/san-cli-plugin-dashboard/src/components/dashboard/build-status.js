import {bytes2kb} from '../../utils/util';

/* global SanComponent */
export default class BuildStatus extends SanComponent {
    static template = /* html */`
        <div class="{{styles.buildStatus}}">
            <s-grid-row gutter="16" class="{{styles.firstRow}}">
                <s-grid-col span="8" class="{{styles.infoBlock}}">
                    <div class="{{styles.value}} {{status === 'Success' ? styles.success : ''}}">
                        {{status || '空闲'}}
                    </div>
                    <div class="{{styles.label}}">状态</div>
                </s-grid-col>
                <s-grid-col span="8" class="{{styles.infoBlock}} {{styles.error}}">
                    <div class="{{styles.value}}">{{data.errors ? data.errors.length : '...'}}</div>
                    <div class="{{styles.label}}">错误</div>
                </s-grid-col>
                <s-grid-col span="8" class="{{styles.infoBlock}} {{styles.warning}}">
                    <div class="{{styles.value}}">{{data.warnings ? data.warnings.length : '...'}}</div>
                    <div class="{{styles.label}}">警告</div>
                </s-grid-col>
            </s-grid-row>
            <s-grid-row gutter="16">
                <s-grid-col span="8" class="{{styles.infoBlock}}">
                    <div class="{{styles.value}}">
                        {{bytes2kb(computed.modulesPerSizeType[sizeType].modulesTotalSize)}}
                    </div>
                    <div class="{{styles.label}}">资源</div>
                </s-grid-col>
                <s-grid-col span="8" class="{{styles.infoBlock}}">
                    <div class="{{styles.value}}">
                        {{bytes2kb(computed.modulesPerSizeType[sizeType].modulesTotalSize)}}
                    </div>
                    <div class="{{styles.label}}">模块</div>
                </s-grid-col>
                <s-grid-col span="8" class="{{styles.infoBlock}}">
                    <div class="{{styles.value}}">
                        {{bytes2kb(computed.modulesPerSizeType[sizeType].depModulesTotalSize)}}
                    </div>
                    <div class="{{styles.label}}">依赖项</div>
                </s-grid-col>
            </s-grid-row>
        </div>
    `;

    bytes2kb(size) {
        return bytes2kb(size);
    }
};
