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
    Tooltip
} from 'santd';

import 'santd/es/button/style';
import 'santd/es/card/style';
import 'santd/es/dropdown/style';
import 'santd/es/empty/style';
import 'santd/es/form/style';
import 'santd/es/grid/style';
import 'santd/es/icon/style';
import 'santd/es/input/style';
import 'santd/es/layout/style';
import 'santd/es/menu/style';
import 'santd/es/modal/style';
import 'santd/es/pagination/style';
import 'santd/es/radio/style';
import 'santd/es/select/style';
import 'santd/es/spin/style';
import 'santd/es/switch/style';
import 'santd/es/tooltip/style';

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
    's-radio-button': Radio.Button,
    's-radio-group': Radio.Group,
    's-select': Select,
    's-select-option': Select.Option,
    's-spin': Spin,
    's-switch': Switch,
    's-tooltip': Tooltip,
};
