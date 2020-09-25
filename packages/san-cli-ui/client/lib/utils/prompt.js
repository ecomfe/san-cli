/**
 * @file prompt表单相关函数
 * @author zttonly
*/

/**
 * 过滤表单可见列表，并进行JSON字符串的转换
*/

export const getVisiblePrompts = obj => {
    return obj ? obj.prompts.filter(p => {
        if (p.type === 'confirm' || p.type === 'checkbox' || p.type === 'input') {
            try {
                p.value = JSON.parse(p.value);
            }
            catch (error) {}
        }
        if (p.type === 'list' && !p.value) {
            p.value = [];
        }
        return p.visible;
    }) : [];
};

/**
 * 将json对象转换为表单的树形格式
*/

export const generateItem = (inputKey, inputValue, prefix = '') => {
    let type = typeof inputValue;
    let key = (prefix ? prefix + '-' : '') + inputKey;
    let children;
    // 叶子节点只显示就可以了
    if (inputValue === 'struct_leaf') {
        children = null;
    }
    // 值没有子节点，说明接下来的节点是叶子节点
    else if (type === 'string'
        || type === 'boolean'
        || type === 'number'
        || inputValue === null
        || inputValue === undefined) {
        children = [generateItem(inputValue, 'struct_leaf', key)];
    }
    // object和array都有子节点
    else if (type === 'object') {
        type = inputValue instanceof Array ? 'array' : 'object';
        children = [];
        for (let k in inputValue) {
            children.push(generateItem(k, inputValue[k], key));
        }
        if (children.length === 0) {
            children.push(generateItem(JSON.stringify(inputValue), 'struct_leaf', key));
        }
    }

    return {
        title: inputKey + (children ? ' (' + type.replace(type[0], type[0].toUpperCase()) + ')' : ''),
        key,
        children
    };
};
