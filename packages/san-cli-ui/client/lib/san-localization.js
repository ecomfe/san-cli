/**
 * @file Add a global $t
 * @author jinzhan
 * */

import localization from '@locales/zh.json';

/**
 * DEMO:
 * $t('san.title') => 'SAN UI'
 * */
export default san => {
    Object.defineProperty(san.Component.prototype, '$t', {
        get() {
            return key => {
                const keys = key.split('.');
                return keys.reduce((cur, next) => (cur || {})[next], localization);
            };
        }
    });
};