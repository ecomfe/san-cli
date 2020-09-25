/**
 * @file 校验文件夹名称
*/

export const isValidName = name => (
    !name.match(/[/@\s+%:]|^[_.]/) && encodeURIComponent(name) === name && name.length <= 214
);

export const isValidMultiName = name => {
    name = name.replace(/\\/g, '/');
    return name.split('/').every(isValidName);
};
