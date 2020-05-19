/**
 * @file FolderExplorer组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Button, Input, Dropdown, Menu, Tooltip, Icon, Modal} from 'santd';
import {isValidMultiName} from '@lib/utils/folders';
import {logo} from '../../const';
import CWD_CHANGE from '@graphql/cwd/cwdChanged.gql';
import FOLDER_CURRENT from '@graphql/folder/folderCurrent.gql';
import FOLDERS_FAVORITE from '@graphql/folder/foldersFavorite.gql';
import FOLDER_OPEN from '@graphql/folder/folderOpen.gql';
import FOLDER_SET_FAVORITE from '@graphql/folder/folderSetFavorite.gql';
import FOLDER_CREATE from '@graphql/folder/folderCreate.gql';
import view from '../../const/view';
import 'santd/es/button/style';
import 'santd/es/input/style';
import 'santd/es/dropdown/style';
import 'santd/es/menu/style';
import 'santd/es/tooltip/style';
import 'santd/es/icon/style';
import 'santd/es/modal/style';
import './index.less';

const folderExplorerView = view.project.select.folderExplorer;

export default class FolderExplorer extends Component {

    static template = /* html */`
        <div class="folder-explorer">
            <div class="contents">
                <s-tooltip title="{{tooltip.pre}}">
                    <s-button type="primary" icon="up" on-click="onPathChange(-2)"></s-button>
                </s-tooltip>
                <div class="path-guide">
                    <s-input s-if="editing"
                        placeholder="{{placeholder.edit}}"
                        value="{{inputValue}}"
                        on-blur="openFolder"
                    ></s-input>
                    <template s-else s-for="p,index in paths">
                        <s-button s-if="index === 0"
                            type="primary"
                            icon="folder"
                            on-click="onPathChange(index)"
                        ></s-button>
                        <s-button s-elif="p"
                            type="primary"
                            on-click="onPathChange(index)"
                        >{{p}}</s-button>
                    </template>
                </div>
                <s-tooltip title="{{tooltip.edit}}">
                    <s-button type="primary" icon="form" on-click="onEdit"></s-button>
                </s-tooltip>
                <s-tooltip title="{{tooltip.star}}" s-if="folderCurrent">
                    <s-button type="primary" on-click="onFavorite">
                        <s-icon type="star" theme="{{folderCurrent.favorite ? 'filled' : 'outlined'}}"></s-icon>
                    </s-button>
                </s-tooltip>
                <s-tooltip title="{{tooltip.refresh}}">
                    <s-button type="primary" icon="redo" on-click="openFolder(folderCurrent.path)"></s-button>
                </s-tooltip>
                <s-tooltip s-if="foldersFavorite" title="{{tooltip.starDirs}}">
                    <s-dropdown trigger="click">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            class="contents-menu"
                            on-click="onStarMenuClick"
                        >
                            <s-menuitem s-for="item in foldersFavorite" key="{{item.path}}">{{item.path}}</s-menuitem>
                        </s-menu>
                        <s-button type="primary" icon="caret-down"></s-button>
                    </s-dropdown>
                </s-tooltip>
                <s-dropdown trigger="click">
                    <s-menu slot="overlay" selectable="{{false}}" class="contents-menu" on-click="onMoreMenuClick">
                        <s-menuitem key="1">{{menu.createFolder}}</s-menuitem>
                        <s-menuitem key="2">
                            {{showHiddenFolder ? menu.hiddenFolder : menu.hiddenFolderShow}}
                        </s-menuitem>
                    </s-menu>
                    <s-button type="primary" icon="more"></s-button>
                </s-dropdown>
            </div>
            <div class="folders">
                <s-spin spinning="{{loading}}"/>
                <template s-if="folderCurrent && folderCurrent.children" s-for="folder in folderCurrent.children">
                    <div s-if="showHiddenFolder || !folder.hidden"
                        class="folder-item {{folder.hidden ? 'hidden' : ''}}"
                        on-click="openFolder(folder.path)"
                    >
                        <s-icon type="{{folder.isPackage ? 'folder' : 'folder-open'}}" theme="filled"></s-icon>
                        <div class="folder-name">
                            {{folder.name}}
                            <img s-if="folder.isSanProject"
                                class="vue-ui-project-icon"
                                src="{{logo}}"
                            >
                        </div>
                        <s-icon s-if="folder.favorite" type="star" theme="filled"></s-icon>
                    </div>
                </template>
            </div>
            <s-modal title="{{modal.createTitle}}"
                visible="{=modalVisible=}"
                on-ok="handleModalOk"
                on-cancel="handleModalCancel"
            >
                <s-input placeholder="{{placeholder.create}}" value="{=newFolderName=}"></s-input>
            </s-modal>
        </div>
    `;

    static components = {
        's-button': Button,
        's-input': Input,
        's-dropdown': Dropdown,
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-tooltip': Tooltip,
        's-icon': Icon,
        's-modal': Modal
    };
    static computed = {
        // 计算路径的分割符，linux是'/'，windows是'\\'
        separator() {
            const currentPath = this.data.get('currentPath');
            let index = currentPath.indexOf('/');
            let indexWin = currentPath.indexOf('\\');
            return index !== -1 ? '/'
                : indexWin !== -1 ? '\\' : '';
        },
        // 路径切分为数据，用于页面渲染
        paths() {
            const currentPath = this.data.get('currentPath');
            const separator = this.data.get('separator');
            return separator ? currentPath.split(separator) : [currentPath];
        },
        newFolderValid() {
            return isValidMultiName(this.data.get('newFolderName'));
        }
    };
    initData() {
        return {
            logo,
            currentPath: '', // 当前路径
            inputValue: '', // 输入框的值
            separator: '', // 分隔符
            editing: false,
            loading: true,
            folderCurrent: {},
            foldersFavorite: '',
            showHiddenFolder: false,
            newFolderName: '',
            modalVisible: false,
            // 文案字段合集
            placeholder: folderExplorerView.placeholder,
            tooltip: folderExplorerView.tooltip,
            menu: folderExplorerView.menu,
            modalCreateTitle: folderExplorerView.modalCreateTitle
        };
    }

    attached() {
        this.folderApollo();
        const observer = this.$apollo.subscribe({query: CWD_CHANGE});
        observer.subscribe({
            next: result => {
                const {data, loading, error, errors} = result;
                /* eslint-disable no-console */
                if (error || errors) {
                    console.log('err');
                }

                if (loading) {
                    console.log('loading');
                }

                if (data && data.cwd) {
                    this.data.set('currentPath', data.cwd);
                    this.folderApollo();
                }
            },
            error: err => {
                console.log('error', err);
                /* eslint-enable no-console */
            }
        });
    }
    async folderApollo() {
        this.data.set('loading', false);
        let folder = await this.$apollo.query({query: FOLDER_CURRENT});
        if (folder.data) {
            this.data.set('folderCurrent', folder.data.folderCurrent);
        }
        let star = await this.$apollo.query({query: FOLDERS_FAVORITE});
        if (star.data) {
            this.data.set('foldersFavorite', star.data.foldersFavorite);
        }
    }
    onEdit(e) {
        // e.stopPropagation();
        let {paths, separator} = this.data.get();
        this.data.set('inputValue', paths.join(separator));
        this.data.set('editing', true);
        this.nextTick(() => {
            document.querySelector('input').focus();
        });
    }
    onPathChange(index) {
        let {paths, separator} = this.data.get();
        // 本地根路径，linux是'/'，windows是'C:\\'
        let p = paths.slice(0, index + 1).join(separator) + separator;
        this.openFolder(p);
    }
    onStarMenuClick(e) {
        this.openFolder(e.key);
    }
    async onFavorite() {
        const folderCurrent = this.data.get('folderCurrent');
        await this.$apollo.mutate({
            mutation: FOLDER_SET_FAVORITE,
            variables: {
                path: folderCurrent.path,
                favorite: !folderCurrent.favorite
            },
            update: (cache, {data: {folderSetFavorite}}) => {
                cache.writeQuery({query: FOLDER_CURRENT, data: {folderCurrent: folderSetFavorite}});
                let {foldersFavorite} = cache.readQuery({query: FOLDERS_FAVORITE});
                if (folderSetFavorite.favorite) {
                    foldersFavorite.push(folderSetFavorite);
                }
                else {
                    foldersFavorite = foldersFavorite.filter(
                        f => f.path !== folderSetFavorite.path
                    );
                }
                cache.writeQuery({query: FOLDERS_FAVORITE, data: {foldersFavorite}});
                this.folderApollo();
            }
        });
    }
    onMoreMenuClick(ev) {
        switch (ev.key) {
            case '1':
                this.data.set('modalVisible', true);
                break;
            case '2':
                this.data.set('showHiddenFolder', !this.data.get('showHiddenFolder'));
                break;
        }
    }
    async openFolder(path) {
        this.data.set('editing', false);
        this.data.set('loading', true);
        try {
            await this.$apollo.mutate({
                mutation: FOLDER_OPEN,
                variables: {
                    path
                },
                update: (cache, {data: {folderOpen}}) => {
                    cache.writeQuery({query: FOLDER_CURRENT, data: {folderCurrent: folderOpen}});
                    // notify parent component
                    this.fire('change', folderOpen.path);
                }
            });
        } catch (e) {
            this.data.set('error', e);
        }
        this.data.set('loading', false);
    }
    handleModalOk() {
        this.createFolder();
        this.data.set('modalVisible', false);
    }
    handleModalCancel() {
        this.data.set('modalVisible', false);
    }
    async createFolder() {
        let {newFolderName, newFolderValid} = this.data.get();
        if (!newFolderValid) {
            return;
        }
        let result = await this.$apollo.mutate({
            mutation: FOLDER_CREATE,
            variables: {
                name: newFolderName
            }
        });
        this.openFolder(result.data.folderCreate.path);
        this.data.set('newFolderName', '');
    }
}
