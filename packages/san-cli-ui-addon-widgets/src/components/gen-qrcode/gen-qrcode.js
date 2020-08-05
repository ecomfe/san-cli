/**
 * @file gen-qrcode 生成二维码组件
 * @author zttonly
 */
import QRCode from 'qrcode';
import {Input, Alert} from 'santd';
import 'santd/es/input/style';
import 'santd/es/alert/style';
import './gen-qrcode.less';

export default {
    template: /* html */`
        <div class="gen-qrcode">
            <s-input-search
                value="{=inputValue=}"
                placeholder="{{$t('dashboard.widgets.gen-qrcode.placeholder')}}"
                enter-button="{{$t('dashboard.widgets.gen-qrcode.ok')}}"
                on-search="gen"
                size="large"
            ></s-input-search>
            <s-alert s-if="error" message="{{$t('dashboard.widgets.gen-qrcode.err-msg')}}" type="error"/>
            <div class="title">
                {{$t('dashboard.widgets.gen-qrcode.url-title')}}
            </div>
            <canvas class="qrcode" s-ref="qrcode-url"></canvas>
            <div class="title">
                {{$t('dashboard.widgets.gen-qrcode.schema-title')}}
            </div>
            <canvas class="qrcode" s-ref="qrcode-schema"></canvas>
        </div>
    `,
    components: {
        's-input-search': Input.Search,
        's-alert': Alert
    },
    initData() {
        return {
            inputValue: location.href,
            error: false
        };
    },
    attached() {
        this.timer = null;
        if (this.data.get('inputValue')) {
            this.gen();
        }
    },
    gen() {
        this.timer && clearTimeout(this.timer);
        const url = this.data.get('inputValue');
        const schema = 'baiduboxapp://v1/easybrowse/open?url=' + encodeURIComponent(url) + '&style=' + encodeURIComponent('{"menumode":2,"toolbaricons":{"toolids":["3"],"tids":["3"]}}');
        const option = {
            color: {
                dark: '#1890ffff',
                light: '#e6f7ffff'
            },
            width: 200,
            margin: 1,
            scale: 2
        };
        const cb = err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                this.data.set('error', true);
                this.timer = setTimeout(() => this.data.set('error', false), 1000);
            }
        };
        QRCode.toCanvas(this.ref('qrcode-url'), url, option, cb);
        QRCode.toCanvas(this.ref('qrcode-schema'), schema, option, cb);
    }
};
