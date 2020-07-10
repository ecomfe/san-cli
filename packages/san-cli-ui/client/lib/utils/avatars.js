/**
 * @file 根据id获取个性化头像
 * @author jinzhan
 */

import Avatars from '@dicebear/avatars';
import gridy from '@dicebear/avatars-gridy-sprites';
import initials from '@dicebear/avatars-initials-sprites';
import identicon from '@dicebear/avatars-identicon-sprites';
import jdenticon from '@dicebear/avatars-jdenticon-sprites';

// const category = [
//     'avataaars',
//     'bottts',
//     'female',
//     'female',
//     'gridy',
//     'human',
//     'identicon',
//     'initials',
//     'jdenticon',
//     'male'
// ];

const avatars = {
    gridy,
    initials,
    identicon,
    jdenticon
};

const avatarTypes = Object.keys(avatars);
const total = avatarTypes.length;


/**
 * 返回个性化的头像
 *
 * @param {string} id 头像的标识
 * @param {string} iconType 头像的类型，如果不设置则按照首字母的charCode分配一个
 * @param {boolean} remote 使用使用远程地址
 *
 * @return {string} 头像的地址
 */
module.exports = (id, iconType = '', remote = false) => {
    const index = id.replace('@', '').toLowerCase().charCodeAt(0);
    if (!iconType || avatarTypes.indexOf(iconType) === -1) {
        iconType = avatarTypes[index % total];
    }
    if (remote) {
        return `https://avatars.dicebear.com/api/${iconType}/${id}.svg`;
    }
    const avatar = new Avatars(avatars[iconType], {
        base64: true
    });
    return avatar.create(id);
};
