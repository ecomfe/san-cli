/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 判断是否符合san init <template> <appname>的template参数形式
 * @author ksky521
 */

/**
 * san init 命令的形式
 * @see https://ecomfe.github.io/san-cli/create-project/
 */

module.exports = template => {
    // 包含代码库或分支标识的特殊写法，认为是模板
    if (/[#:]/.test(template)) {
        return true;
    }

    // 不含/线，不认为是一个template地址
    // 这里忽略模板的alias写法，用alias需要2个参数
    if (template.indexOf('/') === -1) {
        return false;
    }

    // 目录层级大于2，不可能是github的简写
    if (template.split('/').length > 2) {
        return false;
    }

    return true;
};
