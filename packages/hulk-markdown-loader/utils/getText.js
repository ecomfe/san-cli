/**
 * @file 根据 content 生成匹配 text 对象
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// eslint-disable-next-line
function getTextObject(content, tag = 'text') {
    const reg = new RegExp(`<(${tag})(\\s+lang=(["'])(.*?)\\3)?.*?>\\s*(.+?)\\s*<\/\\1>`, 'gs');
    // /<(text)(\s+lang=(["'])(.*?)\3)?.*?>\s*(.+?)\s*<\/\1>/gs;
    const result = {content};
    content.replace(reg, (matchString, textTag, langString, quote, lang, text) => {
        if (lang) {
            result[lang] = {
                matchString,
                lang,
                text
            };
        } else {
            result['default'] = {
                matchString,
                lang,
                text
            };
        }
    });
    if (result.cn && !result.default) {
        // 默认是 cn
        result.default = result.cn;
    }
    if (!result.default) {
        result.default = {text: content, lang: '', matchString: content};
    }
    return result;
}
getTextObject.getText = (content, tag = 'text', i18n = 'cn') => {
    const textObj = getTextObject(content, tag);
    let text = textObj.default.text;
    if (i18n && textObj[i18n] && textObj[i18n].text) {
        text = textObj[i18n].text;
    }
    if (!text) {
        return content;
    }
    return text;
};
module.exports = getTextObject;
