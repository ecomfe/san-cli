import san from 'san';
import utils from './utils';
import {store, connect} from 'san-store';
import './store-action';
import Child from './child.san';

var si = san
var {defineComponent: defineComp} = si
var def = defineComp

var component = def({
    template: '<div><p>hello {{name}}, click {{ num }} times</p><button on-click="count">click me</button><div><p>这个是 child</p><child></child></div></div>',
    initData: function () {
        return {
            name: 'world'
        }
    },
    attached: function () {
        utils.hello();
    },
    count: function () {
        store.dispatch('count', (this.data.get('num') || 0) + 1);
    },
    components: {
        child: Child
    }
});

export default connect.san({
    num: 'num'
})(component);

