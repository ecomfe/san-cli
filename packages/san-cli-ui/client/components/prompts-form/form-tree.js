/**
 * @file form表单内tree显示和修改控件
 * @author zttonly
 */
import Component from '@lib/san-component';
import {generateItem} from '@lib/utils/prompt';

/**
 * 组件props
 *
 * @param {Object} value json对象
 * @param {Function} on-change fire('change', value)值发生变化
 */

export default class FormTree extends Component {
    static template = /* html */ `
        <div>
            <s-button on-click="edit">
                {{$t('config.prompt.edit')}}{{name}}
            </s-button>
            <s-tree
                s-if="treeData.length"
                autoExpandParent="{{true}}"
                showLine="{{true}}"
                treeData="{=treeData=}"
            ></s-tree>
            <s-modal 
                s-if="showEdit"
                width="950"
                title="{{$t('config.prompt.title')}}"
                visible="{=showEdit=}"
                on-ok="saveEdit"
                on-cancel="closeEdit"
            >
                <div class="default-body">
                    <s-alert s-if="error" message="{{$t('config.prompt.err-msg')}}" type="error"/>
                    <div style="height: 320px;overflow-y: auto;display: flex;margin-top: 8px;">
                        <s-textarea
                            style="width: 48%;"
                            rows="8"
                            value="{=inputValue=}"
                            on-inputChange="onAreaChange"
                        ></s-textarea>
                        <s-tree
                            s-if="showTree.length"
                            style="width: 50%;"
                            autoExpandParent="{{true}}"
                            showLine="{{true}}"
                            on-select="onSelect"
                            treeData="{=showTree=}"
                        ></s-tree>
                    </div>
                </div>
            </s-modal>
        </div>
    `;
    static computed = {
        treeData() {
            const value = this.data.get('value');
            const name = this.data.get('name');
            return [generateItem(name, value)];
        }
    };

    initData() {
        return {
            showEdit: false,
            showTree: '',
            inputValue: '',
            inputObj: {},
            error: ''
        };
    }

    setModalData(value) {
        let name = this.data.get('name');
        this.data.set('inputObj', value || {});
        this.data.set('showTree', [value ? generateItem(name, value) : []]);
    }
    edit() {
        let value = this.data.get('value');
        this.data.set('showEdit', true);
        this.data.set('inputValue', JSON.stringify(value));
        this.setModalData(value);
    }
    saveEdit() {
        let {inputObj, error} = this.data.get();
        if (!error) {
            this.fire('change', inputObj);
            this.closeEdit();
        }
    }
    closeEdit() {
        this.setModalData();
        this.data.set('showEdit', false);
    }
    onAreaChange(val) {
        try {
            let newVal = JSON.parse(val);
            this.data.set('error', false);
            this.setModalData(newVal);
        } catch (error) {
            this.data.set('error', true);
            this.setModalData();
        }
    }
}
