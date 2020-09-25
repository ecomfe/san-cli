/**
 * @file compress-image 压缩图片组件
 * @author zttonly
 */

import './compress-image.less';

export default {
    template: /* html */`
        <div class="compress-image">
            <s-alert s-if="error" message="{{errorTip}}" type="error"/>
            <div class="san-upload" on-click="upload">
                <s-icon type="{{loading ? 'loading' : 'download'}}" style="font-size: 32px"/>
                <div class="san-upload-text">
                    <p>{{$t('dashboard.widgets.compress-image.upload')}}</p>
                    <p class="small">{{$t('dashboard.widgets.compress-image.limit')}}</p>
                </div>
                <input type="file" multiple="multiple" accept="image/png,image/jpeg,image/gif" s-ref="inputup">
            </div>
        </div>
    `,
    computed: {
    },
    initData() {
        return {
            fileList: [],
            error: '',
            errorTip: '',
            loading: false,
            beforeUpload: null,
            customRequest: null
        };
    },
    attached() {
    },
    async compress() {
        // 细节待补充
        try {
            const {results, errors} = await this.$callPluginAction('san.widgets.actions.compress-image', {
                fileList: this.data.get('filterList')
            });
        }
        catch (e) {
        }
    },
    upload(e) {
        console.log(e, this.ref('inputup'));
    }
};
