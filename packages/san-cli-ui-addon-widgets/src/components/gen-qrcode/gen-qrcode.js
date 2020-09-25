/**
 * @file gen-qrcode 生成二维码组件
 * @author zttonly
 */

import QRCode from 'qrcodejs2';
import {frameTypes, box} from './schema';
import './gen-qrcode.less';

export default {
    template: /* html */`
        <div class="gen-qrcode">
            <div class="conditions">
                <s-select value="{{currentType}}"
                    placeholder="{{$('dashboard.widgets.gen-qrcode.select-type')}}"
                    on-change="onFrameChange"
                >
                    <s-select-option s-for="ft in frameTypes" value="{{ft.value}}">
                        {{ft.text}}
                    </s-select-option>
                </s-select>
                <s-select
                    s-if="realBox.length > 0" 
                    value="{=currentBox=}"
                    placeholder="{{$('dashboard.widgets.gen-qrcode.select-box')}}"
                >
                    <s-select-option s-for="b in realBox" value="{{b.value}}">
                        {{b.text}}
                    </s-select-option>
                </s-select>
                <s-radio-group s-if="showSearchOpt" name="radiogroup" value="{{radioValue}}}" on-change="onRadioChange">
                    <s-radio value="{{'open'}}">url</s-radio>
                    <s-radio value="{{'search'}}">query</s-radio>
                </s-radio-group>
            </div>
            <s-input-search
                value="{=inputValue=}"
                placeholder="{{$t('dashboard.widgets.gen-qrcode.placeholder')}}"
                enter-button="{{$t('dashboard.widgets.gen-qrcode.ok')}}"
                on-search="gen"
                size="large"
            ></s-input-search>
            <s-alert s-if="error" message="{{$t('dashboard.widgets.gen-qrcode.err-msg')}}" type="error"/>
            <div class="title">
                {{$t('dashboard.widgets.gen-qrcode.sec-title')}}
            </div>
            <div class="qrcode" s-ref="qrcode"></div>
            <div class="title">
                {{$t('dashboard.widgets.gen-qrcode.schema')}}
            </div>
            <div class="schema">{{schema}}</div>
        </div>
    `,
    computed: {
        realBox() {
            const currentType = this.data.get('currentType');
            const box = this.data.get('box');
            return box.filter(item => item[currentType]);
        },
        showSearchOpt() {
            const currentType = this.data.get('currentType');
            return currentType === 'search';
        }
    },
    initData() {
        return {
            inputValue: location.href,
            error: false,
            frameTypes,
            currentType: 'url',
            box,
            currentBox: ['boxapp'],
            schema: '',
            radioValue: 'open',
            slog: null
        };
    },
    attached() {
        let url = this.data.get('inputValue');
        if (url) {
            this.genCode(url);
        }
        this.watch('widget.config', value => {
            value && typeof value === 'object'
                && Object.keys(value).length > 0
                && this.data.set('slog', value);
        });
    },
    gen() {
        const {inputValue, currentType} = this.data.get();

        if (currentType === 'url') {
            this.genCode(inputValue);
            return;
        }
        let {currentBox, realBox, radioValue, slog} = this.data.get();

        let current = realBox.find(item => item.value === currentBox[0] && item[currentType]);
        let schema = current[currentType](inputValue, slog);
        if (currentType === 'search') {
            schema = current[currentType](inputValue, radioValue === 'search');
        }
        this.genCode(schema);
    },
    genCode(schema) {
        this.data.set('schema', schema);
        if (this.qrcode) {
            this.qrcode.clear();
            this.qrcode.makeCode(schema);
            return;
        }
        this.qrcode = new QRCode(this.ref('qrcode'), {
            text: schema,
            width: 200,
            height: 200,
            colorDark: '#1890ffff',
            colorLight: '#e6f7ffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    },
    onFrameChange(value) {
        this.data.set('currentType', value[0]);
        let realBox = this.data.get('realBox');
        this.data.set('currentBox', realBox[0] ? [realBox[0].value] : '');
    },
    onRadioChange(e) {
        this.data.set('radioValue', e.target.value);
    }
};
