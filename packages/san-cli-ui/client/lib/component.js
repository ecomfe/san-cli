/**
 * @file 向san组件进行扩展组件，注入默认的组件(如：santd)
 * @author jinzhan
*/

import {Button, Icon, Tooltip} from 'santd';
import 'santd/es/button/style';
import 'santd/es/icon/style';
import 'santd/es/tooltip/style';

// 要注入的默认组件
export default {
    's-icon': Icon,
    's-button': Button,
    's-tooltip': Tooltip
};