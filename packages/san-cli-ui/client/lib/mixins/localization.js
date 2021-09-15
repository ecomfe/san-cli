/**
 * @file $t方法，用于快捷访问语言包
 * @author jinzhan
 * */

import merge from 'deepmerge';
import locales from '@locales/zh.json';

let localization = locales || {};
/**
 * san-mix的组件
 *
 * DEMO:
 * $t('san.title') => 'SAN UI'
 * */

export default {
    addLocalization(lang) {
        let newLocale = merge(localization, lang);
        Object.assign(localization, newLocale);
    },
    $t: key => {
        if (!key || typeof key !== 'string') {
            return '';
        }
        const keys = key.split('.');
        return keys.reduce((cur, next) => (cur || {})[next], localization);
    }
};
