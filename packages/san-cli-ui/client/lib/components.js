/**
 * @file 默认注入的Santd组件
 * @author jinzhan
*/

import {
    Button,
    Card,
    Dropdown,
    Empty,
    Form,
    Grid,
    Icon,
    Input,
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
    InputNumber,
    Alert
} from 'santd';

// 自动注入以下Santd组件
export default {
    's-button': Button,
    's-card': Card,
    's-dropdown': Dropdown,
    's-empty': Empty,
    's-form': Form,
    's-formitem': Form.FormItem,
    's-grid-col': Grid.Col,
    's-grid-row': Grid.Row,
    's-icon': Icon,
    's-input': Input,
    's-input-search': Input.Search,
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
    's-select': Select,
    's-select-option': Select.Option,
    's-spin': Spin,
    's-switch': Switch,
    's-tabs': Tabs,
    's-tabpane': Tabs.TabPane,
    's-tooltip': Tooltip,
    's-input-number': InputNumber,
    's-alert': Alert
};
