/**
 * @file List组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {List, Skeleton} from 'santd';
import 'santd/es/list/style';
import 'santd/es/skeleton/style';

export default class ProjectList extends Component {

    static template = /* html */`
        <div class="project-list">
            项目列表
            <s-list
                class=""
                loading="{{loading}}"
                item-layout="horizontal"
                data-source="{{list}}"
            >
                <s-list-item slot="renderItem" actions="{{['edit', 'delete']}}">
                    <a slot="edit" on-click="edit(item, index)">编辑</a>
                    <a slot="delete" on-click="delete(item, index)">删除</a>
                    <s-skeleton avatar="{{true}}" loading="{{item.loading}}" active="{{true}}">
                        <s-list-item-meta description="{{item.dir}}">
                            <span href="#" slot="title">{{item.title}}</span>
                        </s-list-item-meta>
                    </s-skeleton>
                </s-list-item>
            </s-list>
        </div>
    `;

    initData() {
        return {
        };
    }

    static components = {
        's-list': List,
        's-list-item': List.Item,
        's-list-item-meta': List.Item.Meta,
        's-skeleton': Skeleton
    }
    attached() {
    }
    edit(item, index) {
        console.log('edit', item, index);
    }
    delete(item, index) {
        console.log('delete', item, index);
    }
}
