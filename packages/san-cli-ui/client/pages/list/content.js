/**
 * @file 用户添加的项目列表页
 * @author zttonly, Lohoyo
 */

import {router} from 'san-router';
import Component from '@lib/san-component';
import ProjectList from '@components/project/project-list';
import './content.less';

export default class Project extends Component {
    static template = /* html */`
    <c-project-list
        class="project-container"
        on-routeto="handleRouteTo"
        filterInput="{{filterInput}}"
    />
    `;

    static components = {
        'c-project-list': ProjectList
    };

    $events() {
        return {
            filterInputChange(filterInput) {
                this.data.set('filterInput', filterInput);
            }
        };
    }

    handleRouteTo(path) {
        path && router.locator.redirect(path);
    }
}
