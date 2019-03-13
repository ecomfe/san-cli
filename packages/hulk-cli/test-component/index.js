/**
 * @file 组件 test
 * @author wangyongqing01 <wangyongqing01@baidu.com>
 */

import './style/index.less';
import san from 'san';
// cc()就是 prefix class，cc('xxx')返回 prefixClass-xxx
const className = 'test';

export default san.defineComponent({
    template: `
    	<div class="${className}">
    		<h2>Hi~</h2>
        </div>
    ` 
});