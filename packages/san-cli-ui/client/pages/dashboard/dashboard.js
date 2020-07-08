/**
 * @file 仪表盘
 * @author zttonly
 */

import {Component} from 'san';
// import WIDGETS from '@graphql/widget/widgets.gql';
import Layout from '@components/layout';
import Widget from '@components/dashboard-widget/dashboard-widget';
import WidgetList from '@components/dashboard-widget/widget-list';
import {Link} from 'san-router';
import {Icon, Button, Spin, Input} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import 'santd/es/input/style';
import './dashboard.less';

export default class Dashboard extends Component {
    static template = /* html */`
        <div class="dashboard {{editing ? 'custom' : ''}}">
            <s-spin class="loading" spinning="{{pageLoading}}" size="large"/>
            <c-layout menu="{{$t('menu')}}" nav="{{['dashboard']}}" title="{{$t('dashboard.title')}}">
                <template slot="right">
                    <s-button disabled="{{true}}">{{$t('dashboard.tools')}}</s-button>
                    <s-button type="primary" on-click="showCustom">
                        <template s-if="editing">
                            <s-icon type="check"></s-icon>{{$t('dashboard.operationOn')}}
                        </template>
                        <template s-else>
                            <s-icon type="edit"></s-icon>{{$t('dashboard.operationOff')}}
                        </template>
                    </s-button>
                </template>
                <div slot="content" class="main-content">
                    <div class="widgets">
                        <c-widget
                            s-for="widget in widgets"
                            widget="{=widget=}"
                            custom="{=editing=}"
                        />
                    </div>
                    <c-widget-list visible="{=editing=}"/>
                </div>
            </c-layout>
        </div>
    `;
    static components = {
        's-icon': Icon,
        'r-link': Link,
        's-button': Button,
        's-spin': Spin,
        's-input-search': Input.Search,
        'c-layout': Layout,
        'c-widget': Widget,
        'c-widget-list': WidgetList
    };
    initData() {
        return {
            editing: false,
            widgets: [1, 2, 3, 4, 5, 6],
            pageLoading: false
        };
    }
    static computed = {
    };

    attached() {

    }

    showCustom() {
        let editing = this.data.get('editing');
        this.data.set('editing', !editing);
    }
}
