/**
 * @file 找不页面组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import './index.less';

export default class NotFound extends Component {
    static template = /* html */`
        <div class="not-found">
            {{$t('notFound.tips')}}
            <br>
            <s-router-link to="/">
                <s-button type="primary">{{$t('notFound.btnText')}}</s-button>
            </s-router-link>
        </div>
    `;
}
