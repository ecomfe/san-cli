/**
 * @file 找不页面组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import './index.less';
import {Link} from 'san-router';

export default class NotFound extends Component {
    static template = /* html */`
        <div class="not-found">
            {{$t('notFound.tips')}}
            <br>
            <r-link to="/">
                <s-button type="primary">{{$t('notFound.btnText')}}</s-button>
            </r-link>
        </div>
    `;

    static components = {
        'r-link': Link
    };
}
