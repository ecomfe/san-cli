/**
 * @file 静态常量
 * @author zttonly
*/
import logo from '@assets/logo.svg';

export const LAYOUT_ONE_THIRD = {
    labelCol: {
        xs: {
            span: 12
        },
        sm: {
            span: 8
        }
    },
    wrapperCol: {
        xs: {
            span: 8
        },
        sm: {
            span: 12
        }
    }
};

export {
    logo
};

export const SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
export const SEARCH_DEBOUNCE_DELAY = 1000;
export const SEARCH_MAX_RESULT_TOTAL = 1000;
export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_DEFAULT_QUERY = 'san-cli';
