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
 * san init命令的形式
 * @see https://ecomfe.github.io/san-cli/#/create-project
 *
 * 1. 支持传入完整repo地址:
 * san init ksky521/san-project demo
 * # 下面的示例请换成自己的地址和 username
 * san init https://github.com/ksky521/san-project.git demo
 * # 下面的示例请换成自己的地址和 username (百度内部建议使用如下模板地址)
 * san init ssh://${username}@icode.baidu.com:8235/baidu/hulk/san-project-base demo
 *
 * 2. 默认是从 github repo 安装
 *  # 所以 git@github.com:ksky521/simple.git 这个 repo到 demo 文件，可以使用：
 *  san init simple demo
 *
 * 3. 支持 github，icode，gitlab 等简写方式
 * san init github:ksky521/san-project demo
 * san init icode:baidu/hulk/san-project-base demo
 * san init coding:ksky521/san-project demo
 *
 * 4. 分支写法
 * san init template#branch demo
 *
 * 5. 项目生成在当前目录
 * san init template#branch .
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
