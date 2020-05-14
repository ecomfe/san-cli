/**
 * @file FolderExplorer组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Button, Input, Dropdown, Menu, Tooltip, Icon} from 'santd';
import {
    logo,
    CWD,
    CWD_CHANGE,
    FOLDER_CURRENT,
    FOLDERS_FAVORITE,
    FOLDER_OPEN,
    FOLDER_OPEN_PARENT,
    FOLDER_SET_FAVORITE,
    PROJECT_CWD_RESET,
    FOLDER_CREATE
} from '../../const';
import 'santd/es/button/style';
import 'santd/es/input/style';
import 'santd/es/dropdown/style';
import 'santd/es/menu/style';
import 'santd/es/tooltip/style';
import 'santd/es/icon/style';
import 'santd/es/switch/style';
import './index.less';

export default class FolderExplorer extends Component {

    static template = /* html */`
        <div class="folder-explorer">
            目录浏览
            <div class="contents">
                <s-tooltip title="{{tooltipPre}}">
                    <s-button type="primary" icon="up" on-click="onPathChange(-2)"></s-button>
                </s-tooltip>
                <div class="path-guide">
                    <s-input s-if="editing"
                        placeholder="{{placeholder}}"
                        value="{{inputValue}}"
                        on-blur="onBlur"
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
                <s-tooltip title="{{tooltipEdit}}">
                    <s-button type="primary" icon="form" on-click="onEdit"></s-button>
                </s-tooltip>
                <s-tooltip title="{{tooltipStar}}">
                    <s-button type="primary" icon="star" on-click="onStar"></s-button>
                </s-tooltip>
                <s-tooltip title="{{tooltipRefresh}}">
                    <s-button type="primary" icon="redo" on-click="folderApollo"></s-button>
                </s-tooltip>
                <s-tooltip title="{{tooltipStarDirs}}">
                    <s-dropdown trigger="click">
                        <s-menu slot="overlay" selectable="{{false}}" class="contents-menu" on-click="onStarMenuClick">
                            <s-menuitem key="1">1st item</s-menuitem>
                        </s-menu>
                        <s-button type="primary" icon="caret-down"></s-button>
                    </s-dropdown>
                </s-tooltip>
                <s-dropdown trigger="click">
                    <s-menu slot="overlay" selectable="{{false}}" class="contents-menu" on-click="onMoreMenuClick">
                        <s-menuitem key="1">新建文件夹</s-menuitem>
                        <s-menuitem key="2">
                            {{showHiddenFolder ? menuHiddenFolderShow : menuHiddenFolder}}
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
                        on-click="changeFolder(folder.path)"
                    >
                        <s-icon s-if="folder" type="folder" theme="filled"></s-icon>
                        <s-icon s-else type="folder-open" theme="filled"></s-icon>
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
            <div class="actions-bar">
                <s-button type="primary" icon="add">在此创建新目录</s-button>
            </div>
        </div>
    `;

    static components = {
        's-button': Button,
        's-input': Input,
        's-dropdown': Dropdown,
        's-menu': Menu,
        's-menuitem': Menu.Item,
        's-tooltip': Tooltip,
        's-icon': Icon
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
            showHiddenFolder: false,
            // todo：以下文案字段后续收敛在一起
            placeholder: '请输入合法路径',
            tooltipPre: '上一页面',
            tooltipEdit: '编辑',
            tooltipRefresh: '刷新',
            tooltipStar: '添加/取消收藏',
            tooltipStarDirs: '收藏的文件夹',
            menuCreateFolder: '新建文件夹',
            menuHiddenFolderShow: '显示隐藏文件夹',
            menuHiddenFolder: '不显示隐藏文件夹'
        };
    }

    attached() {
        this.folderApollo();
    }
    async folderApollo() {
        this.data.set('loading', false);
        let path = await this.$apollo.query({query: CWD});
        if (path.data) {
            this.data.set('currentPath', path.data.cwd);
        }
        let folder = await this.$apollo.query({query: FOLDER_CURRENT});
        if (folder.data) {
            this.data.set('folderCurrent', folder.data.folderCurrent);
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
    onBlur(value) {
        this.data.set('editing', false);
        this.changeFolder(value);
    }
    onPathChange(index) {
        let {paths, separator} = this.data.get();
        // 本地根路径，linux是'/'，windows是'C:\\'
        let p = paths.slice(0, index + 1).join(separator) + separator;
        this.changeFolder(p);
    }
    onStar() {
        this.fire('star', this.data.get('currentPath'));
    }
    onMoreMenuClick(ev) {
        switch (ev.key) {
            case '1':
                this.createFolder();
                break;
            case '2':
                this.data.set('showHiddenFolder', !this.data.get('showHiddenFolder'));
                break;
        }
    }
    async changeFolder(path) {
        this.data.set('loading', true);
        try {
            await this.$apollo.mutate({
                mutation: FOLDER_OPEN,
                variables: {
                    path
                },
                update: (cache, {data: {folderOpen}}) => {
                    console.log(cache, folderOpen);
                    cache.writeQuery({query: FOLDER_CURRENT, data: {folderCurrent: folderOpen}});
                }
            });
            this.folderApollo();
        } catch (e) {
            this.data.set('error', e);
        }
        this.data.set('loading', false);
    }
}
