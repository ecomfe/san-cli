/**
 * @file prompt表单相关函数
 * @author zttonly
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
