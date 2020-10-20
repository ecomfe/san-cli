/**
 * @file 导入项目
 */

import {router} from 'san-router';
import {Modal} from 'santd';
import Component from '@lib/san-component';
import ProjectTemplateList from '@components/project/template-list';
import FolderExplorer from '@components/project/folder-explorer';
import CWD from '@graphql/cwd/cwd.gql';
import PROJECT_IMPORT from '@graphql/project/projectImport.gql';
import './content.less';

export default class Project extends Component {
    static template = /* html */`
    <div class="h1oh project-container project-import">
        <c-folder-explorer
            current-path="{{cwd}}"
            on-change="handleCwdChange"
        />
        <div class="flex-none footer-wrapper">
            <s-button
                class="com-santd-btn-large"
                disabled="{{!isPackage}}"
                loading="{{isImporting}}"
                size="large"
                s-if="current === 0"
                type="primary"
                on-click="importProject"
            >{{$t('project.select.import.importBtnText')}}</s-button>
        </div>
    </div>
    `;

    static components = {
        'c-folder-explorer': FolderExplorer,
        'c-project-template-list': ProjectTemplateList
    };

    initData() {
        return {
            cwd: '',
            projectPrompts: [],
            pageLoading: false,
            current: 0,
            isPackage: false,
            projectTemplateList: [],
            projectTemplate: ''
        };
    }

    async attached() {
        let res = await this.$apollo.query({query: CWD});
        if (res.data) {
            this.data.set('cwd', res.data.cwd);
        }
    }

    handleCwdChange({path, isPackage}) {
        path && this.data.set('cwd', path);
        this.data.set('isPackage', isPackage);
    }

    async importProject() {
        this.data.set('isImporting', true);
        const res = await this.$apollo.mutate({
            mutation: PROJECT_IMPORT,
            variables: {
                path: this.data.get('cwd'),
                force: false
            }
        });
        this.data.set('isImporting', false);
        if (res.errors && res.errors.some(item => item.message === 'NO_MODULES')) {
            Modal.error({
                title: this.$t('project.components.import.noModulesTips.title'),
                content: this.$t('project.components.import.noModulesTips.content')
            });
            return;
        }
        if (res.errors && res.errors.some(item => item.message === 'PROJECT_HAS_BEEN_IMPORTED')) {
            Modal.error({
                title: this.$t('project.components.import.hasBeenImportedTips.title'),
                content: this.$t('project.components.import.hasBeenImportedTips.content')
            });
            return;
        }
        router.locator.redirect('/');
    }
}
