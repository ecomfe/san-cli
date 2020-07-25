/**
 * @file 默认注入的Santd组件
 * @author jinzhan
*/

import {Button, Icon, Tooltip} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/tooltip/style';

// 自动注入以下Santd组件
export default {
    's-icon': Icon,
    's-button': Button,
    's-tooltip': Tooltip
};