/**
 * @file 根据id获取个性化头像
 * @author jinzhan
*/

const category = [
    'avataaars',
    'bottts',
    'female',
    'female',
    'gridy',
    'human',
    'identicon',
    'initials',
    'jdenticon',
    'male'
];

const len = category.length;

/**
 * 返回个性化的头像
 *
 * @param {string} id 头像的标识
 * @param {string} iconType 头像的类型，如果不设置则按照首字母的charCode分配一个
 *
 * @return {string} 头像的地址
*/
module.exports = (id, iconType = '') => {
    const index = id.replace('@', '').toLowerCase().charCodeAt(0);
    if (!iconType || category.indexOf(iconType) === -1) {
        iconType = category[index % len];
    }
    return `https://avatars.dicebear.com/api/${iconType}/${id}.svg`;
};
