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

export const SEARCH_URL = 'http://ofcncog2cu-2.algolianet.com/1/indexes/*/queries?x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=db283631f89b5b8a10707311f911fd00';
export const SEARCH_DEBOUNCE_DELAY = 1000;
export const MAX_SEARCH_RESULT_TOTAL = 1000;
