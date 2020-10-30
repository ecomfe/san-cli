/**
 * @file 默认注入的组件
 * @author jinzhan
*/
import {defineComponent} from 'san';
import {
    Alert,
    Button,
    Card,
    Dropdown,
    Form,
    Grid,
    Icon,
    Input,
    InputNumber,
    Layout,
    Menu,
    Modal,
    Pagination,
    Radio,
    Select,
    Spin,
    Switch,
    Tabs,
    Tooltip,
    Progress,
    Tree
} from 'santd';
import {Link} from 'san-router';

// 自动注入以下Santd组件
export default {
    's-alert': Alert,
    's-button': Button,
    's-card': Card,
    's-dropdown': Dropdown,
    's-form': Form,
    's-formitem': Form.FormItem,
    's-grid-col': Grid.Col,
    's-grid-row': Grid.Row,
    's-icon': Icon,
    's-input': Input,
    's-input-search': Input.Search,
    's-input-number': InputNumber,
    's-textarea': Input.TextArea,
    's-layout': Layout,
    's-layout-content': Layout.Content,
    's-layout-header': Layout.Header,
    's-layout-sider': Layout.Sider,
    's-menu': Menu,
    's-menu-divider': Menu.MenuDivider,
    's-menu-item': Menu.Item,
    's-menu-item-group': Menu.MenuItemGroup,
    's-modal': Modal,
    's-pagination': Pagination,
    's-radio': Radio,
    's-radio-button': Radio.Button,
    's-radio-group': Radio.Group,
    's-router-link': defineComponent(Link),
    's-select': Select,
    's-select-option': Select.Option,
    's-spin': Spin,
    's-switch': Switch,
    's-tabs': Tabs,
    's-tabpane': Tabs.TabPane,
    's-tooltip': Tooltip,
    's-progress': Progress,
    's-tree': Tree,
    's-tree-node': Tree.TreeNode
};
