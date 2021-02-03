/**
 * @file 静态常量
 * @author zttonly, Lohoyo
*/
import logo from '@assets/san.svg';

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
export const SEARCH_DEFAULT_QUERY = 'san';
export const RANKING_MODES = ['optimal', 'popularity', 'quality', 'maintenance'];
export const RANKING_MODE_MAP = {
    optimal: '',
    popularity: '?quality=0.0&maintenance=0.0&popularity=1.0',
    quality: '?quality=1.0&maintenance=0.0&popularity=0.0',
    maintenance: '?quality=0.0&maintenance=1.0&popularity=0.0'
};

export const TEMPLATES_URL = 'https://raw.githubusercontent.com/ecomfe/san-cli/master/packages/san-cli-ui/TEMPLATES.json';
