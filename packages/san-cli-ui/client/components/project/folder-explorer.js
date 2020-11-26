/**
 * @file FolderExplorer组件
 * @author zttonly, Lohoyo
 */

import Component from '@lib/san-component';
import {isValidMultiName} from '@lib/utils/folders';
import {logo} from '@lib/const';
import CWD_CHANGE from '@graphql/cwd/cwdChanged.gql';
import FOLDER_CURRENT from '@graphql/folder/folderCurrent.gql';
import FOLDERS_FAVORITE from '@graphql/folder/foldersFavorite.gql';
import FOLDER_OPEN from '@graphql/folder/folderOpen.gql';
import FOLDER_SET_FAVORITE from '@graphql/folder/folderSetFavorite.gql';
import FOLDER_CREATE from '@graphql/folder/folderCreate.gql';
import './folder-explorer.less';

export default class FolderExplorer extends Component {
    static template = /* html */`
        <div class="flex-all folder-explorer">
            <div class="flex-none folder-path container">
                <s-tooltip title="{{$t('project.select.folderExplorer.tooltip.pre')}}">
                    <s-button type="primary" icon="left" on-click="onPathChange(-2)"></s-button>
                </s-tooltip>

                <div class="path-guide">
                    <s-input s-if="editing"
                        placeholder="{{$t('project.select.folderExplorer.placeholder.edit')}}"
                        value="{{inputValue}}"
                        on-blur="openFolder"
                        on-pressEnter="openFolder"
                    ></s-input>
                    <template s-else s-for="p,index in paths">
                        <s-button s-if="index === 0"
                            type="primary"
                            icon="folder"
                            on-click="onPathChange(index)"
                        ></s-button>
                        <s-button s-elif="paths.length - index === PATH_DISPLAY_LENGTH"
                            type="primary"
                            on-click="onPathChange(index)"
                        >...</s-button>
                        <s-button s-elif="p && (paths.length - index < PATH_DISPLAY_LENGTH)"
                            type="primary"
                            on-click="onPathChange(index)"
                        >{{p}}</s-button>
                    </template>
                </div>

                <s-tooltip title="{{$t('project.select.folderExplorer.tooltip.edit')}}" class="operate-btn">
                    <div on-click="onEdit" class="icon edit-icon"></div>
                </s-tooltip>

                <s-tooltip title="{{$t('project.select.folderExplorer.tooltip.star')}}"
                    s-if="folderCurrent"
                    class="operate-btn"
                >
                    <div
                        on-click="onFavorite"
                        class="icon star-icon {{folderCurrent.favorite ? 'favorited' : ''}}">
                    </div>
                </s-tooltip>

                <s-tooltip title="{{$t('project.select.folderExplorer.tooltip.refresh')}}" class="operate-btn">
                    <div on-click="openFolder(folderCurrent.path)" class="icon redo-icon"></div>
                </s-tooltip>

                <s-tooltip s-if="foldersFavorite && foldersFavorite.length > 0"
                    title="{{$t('project.select.folderExplorer.tooltip.starDirs')}}"
                    class="operate-btn"
                >
                    <s-dropdown trigger="click" placement="bottomRight">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            class="contents-menu"
                            on-click="onStarMenuClick"
                        >
                            <s-menu-item s-for="item in foldersFavorite" key="{{item.path}}">{{item.path}}</s-menu-item>
                        </s-menu>
                        <div class="icon caret-down-icon"></div>
                    </s-dropdown>
                </s-tooltip>

                <s-tooltip title="{{$t('project.select.folderExplorer.tooltip.more')}}" class="operate-btn">
                    <s-dropdown trigger="click" placement="bottomRight">
                        <s-menu slot="overlay"
                            selectable="{{false}}"
                            class="contents-menu"
                            on-click="onMoreMenuClick"
                        >
                            <s-menu-item
                                key="showCreateModal"
                                disabled="{{!isPathWritable}}">
                                {{$t('project.select.folderExplorer.menu.createFolder')}}
                            </s-menu-item>
                            <s-menu-item key="showHiddenFolder">
                                {{showHiddenFolder ? $t('project.select.folderExplorer.menu.hiddenFolder')
                                    : $t('project.select.folderExplorer.menu.hiddenFolderShow')}}
                            </s-menu-item>
                        </s-menu>
                        <div class="icon more-icon"></div>
                    </s-dropdown>
                </s-tooltip>
            </div>
            <div class="folders">
                <div class="container" s-if="folderCurrent && folderCurrent.children && folderCurrent.children.length">
                    <s-spin spinning="{{loading}}"/>
                    <template s-for="folder in folderCurrent.children">
                        <div s-if="showHiddenFolder || !folder.hidden"
                            class="folder-item {{folder.hidden ? 'hidden' : ''}}"
                            on-click="openFolder(folder.path)"
                        >
                            <img s-if="folder.isSanProject" class="san-project-icon" src="{{logo}}" />
                            <div s-else class="folder-icon"></div>
                            <div class="folder-name">
                                {{folder.name}}
                            </div>
                            <div s-if="folder.favorite" class="icon yellow-star-icon"></div>
                        </div>
                    </template>
                </div>
            </div>

            <s-modal title="{{$t('project.select.folderExplorer.modalCreateTitle')}}"
                visible="{=showCreateModal=}"
                on-ok="handleModalOk"
                on-cancel="handleModalCancel"
            >
                <s-input placeholder="{{$t('project.select.folderExplorer.placeholder.edit')}}"
                    value="{=newFolderName=}"
                ></s-input>
            </s-modal>
        </div>
    `;

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
            isPathWritable: true,
            inputValue: '', // 输入框的值
            separator: '', // 分隔符
            editing: false,
            loading: true,
            folderCurrent: {},
            foldersFavorite: [],
            showHiddenFolder: false,
            newFolderName: '',
            showCreateModal: false,
            PATH_DISPLAY_LENGTH: 9
        };
    }

    attached() {
        this.folderApollo();
        const observer = this.$apollo.subscribe({query: CWD_CHANGE});
        observer.subscribe({
            next: result => {
                const {data, error, errors} = result;
                /* eslint-disable no-console */
                if (error || errors) {
                    console.log('err');
                }

                if (data && data.cwd && data.cwd.path) {
                    this.data.set('currentPath', data.cwd.path);
                    this.data.set('isPathWritable', data.cwd.isWritable);
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
        let folder = await this.$apollo.query({query: FOLDER_CURRENT});
        this.data.set('loading', false);
        if (folder.data) {
            this.data.set('folderCurrent', folder.data.folderCurrent);
            this.fire('change', folder.data.folderCurrent);
        }
        let {data} = await this.$apollo.query({query: FOLDERS_FAVORITE});
        if (data) {
            this.data.set('foldersFavorite', data.foldersFavorite);
        }
    }
    onEdit() {
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
    onMoreMenuClick(e) {
        switch (e.key) {
            case 'showCreateModal':
                this.data.set('showCreateModal', true);
                break;
            case 'showHiddenFolder':
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
                    this.fire('change', folderOpen);
                }
            });
        }
        catch (e) {
            this.data.set('error', e);
        }
        this.data.set('loading', false);
    }
    handleModalOk() {
        this.createFolder();
        this.data.set('showCreateModal', false);
    }
    handleModalCancel() {
        this.data.set('showCreateModal', false);
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
