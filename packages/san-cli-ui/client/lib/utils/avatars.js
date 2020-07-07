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

module.exports = id => {
    const index = id.replace('@', '').toLowerCase().charCodeAt(0);
    const iconType = category[index % len];
    return `https://avatars.dicebear.com/api/${iconType}/${id}.svg`;
};
