/**
 * @file component source code text
 * @author clark-t
 */

export const defineComponents = [
    `
    import san from 'san';
    export default san.defineComponent({
        temlpate: '<p>Hello {{name}}</p>',
        initData() {
            return {
                name: 'San'
            }
        }
    });
    `,
    `
    import san from 'san';
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    export default san.defineComponent(options);

    `,
    `
    import {defineComponent} from 'san';
    export default defineComponent({
        temlpate: '<p>Hello {{name}}</p>',
        initData() {
            return {
                name: 'San'
            }
        }
    });
    `,
    `
    import {defineComponent as def} from 'san';
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    export default defineComp(options);

    `,
    `
    import {defineComponent as def} from 'san';
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    let ComponentConstructor = defineComp(options);
    export default ComponentConstructor;
    `,
    `
    const {defineComponent: def} = require('san');
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    module.exports = defineComp(options);
    `
];

export const defineComponentWithGlobalSanStoreConnect = [
    `
    import san from 'san';
    import {connect} from 'san-store';
    import './store-action';

    const Comp = san.defineComponent({
        temlpate: '<p>Hello {{name}}</p>',
        initData() {
            return {
                name: 'San'
            }
        }
    });

    const NewComp = connect.san({
        num: 'num'
    })(Comp);

    export default NewComp;
    `,
    `
    import {defineComponent as def} from 'san';
    import sanStore from 'san-store';

    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    let ComponentConstructor = defineComp(options);
    export default sanStore.connect.san({num: 'num'})(ComponentConstructor);
    `,
    `
    const {defineComponent: def} = require('san');
    const {connect} = require('san-store');
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    module.exports = connect['san']({num: 'num'})(defineComp(options));
    `,
    `
    const {defineComponent: def} = require('san');
    const sanStore = require('san-store');
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    let connect
    connect = sanStore.connect
    let conn;
    conn = connect
    module.exports = conn['san']({num: 'num'})(defineComp(options));
    `

];

export const defineComponentWithInstantSanStoreConnect = [
    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store-action';

    const Comp = san.defineComponent({
        temlpate: '<p>Hello {{name}}</p>',
        initData() {
            return {
                name: 'San'
            }
        }
    });

    let connector = connect.createConnector(store);

    const NewComp = connector({
        num: 'num'
    })(Comp);

    export default NewComp;
    `,
    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store-action';

    const Comp = san.defineComponent({
        temlpate: '<p>Hello {{name}}</p>',
        initData() {
            return {
                name: 'San'
            }
        }
    });

    let connector;
    connector = connect.createConnector(store);

    const NewComp = connector({
        num: 'num'
    })(Comp);

    export default NewComp;
    `,


    `
    import {defineComponent as def} from 'san';
    import sanStore from 'san-store';
    import store from './store-action';

    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    let ComponentConstructor = defineComp(options);
    export default sanStore.connect.createConnector(store)({num: 'num'})(ComponentConstructor);
    `,

    `
    const {defineComponent: def} = require('san');
    const sanStore = require('san-store');
    const store = require('./store-action');
    const {createConnector} = sanStore.connect;
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    module.exports = createConnector(store)({num: 'num'})(defineComp(options));
    `
];


export const classComponents = [
    `
    import san from 'san';
    export default class Comp extends san.Component {
        static template = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    };
    `,
    `
    import {Component as SanComponent} from 'san';
    class Comp extends SanComponent {
        static template = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    }
    export default Comp;

    `,
    `
    const {Component: SanComponent} = require('san');
    class Comp extends SanComponent {
        static template = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    }
    export default Comp;

    `
];

export const classComponentWithGlobalSanStoreConnect = [
    `
    import san from 'san';
    import {connect} from 'san-store';
    import './store-action';

    class Comp extends san.Component {
        static temlpate = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    }

    const NewComp = connect.san({
        num: 'num'
    })(Comp);

    export default NewComp;
    `,
    `
    import {Component as SanComponent} from 'san';
    import sanStore from 'san-store';
    const connect = sanStore.connect;
    class Comp extends SanComponent {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    Comp.prototype.template = '<p>Hello {{name}}</p>';
    export default connect.san({num: 'num'})(Comp);
    `,
    `
    const {Component: SanComponent} = require('san');
    const {connect} = require('san-store');
    const ParentComponent = SanComponent;
    module.exports = connect.san({num: 'num'})(
        class Comp extends ParentComponent {
            static template = '<p>Hello {{name}}</p>';
            initData() {
                return {
                    name: 'San'
                }
            }
        }
    );
    `,
    `
    const sanStore = require('san-store');
    const {Component} = require('san');
    const {
        connect: {
            san
        }
    } = sanStore;
    module.exports = san({num: 'num'})(class Comp extends Component {});
    `
];

export const classComponentWithInstantSanStoreConnect = [
    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store-action';

    class Comp extends san.Component {
        static temlpate = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    }

    let connector = connect.createConnector(store);

    const NewComp = connector({
        num: 'num'
    })(Comp);

    export default NewComp;
    `,
    `
    import {Component as SanComponent} from 'san';
    import sanStore from 'san-store';
    import store from './store-action';

    const connect = sanStore.connect;
    class Comp extends SanComponent {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    Comp.prototype.template = '<p>Hello {{name}}</p>';
    export default connect.createConnector(store)({num: 'num'})(Comp);
    `,
    `
    const {Component: SanComponent} = require('san');
    const {connect} = require('san-store');
    const store = require('./store-action');

    const ParentComponent = SanComponent;
    module.exports = connect.createConnector(store)({num: 'num'})(
        class Comp extends ParentComponent {
            static template = '<p>Hello {{name}}</p>';
            initData() {
                return {
                    name: 'San'
                }
            }
        }
    );
    `
];

export const functionComponents = [
    `
    import san from 'san';
    function Comp(options) {
        san.Component(this, options);
        this.data = {
            a: 1
        };
    }
    san.inherits(Comp, san.Component);
    export default Comp;
    `
];

// 非component，可能是store或者其他
export const noComponent = [
    `
    export default san.defineComponent({});
    `,
    `
    import san from 'san';
    const Comp = san.defineComponent({
        template: 'Hello World'
    });

    let comp = new Comp();
    comp.attch(document.body);
    `,
    `
    import san from 'san';
    const a = san['defi' + 'neComponent'].hahaha;
    export default a;
    `,
    `
    import san from 'san';
    import {connect} from 'san-store';
    export default connect;
    `,

    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store';
    export default connect.san(store);
    `,

    `
    import san from 'san';
    import sanStore from 'san-store';
    import store from './store';
    export default sanStore['co' + 'nnect']({num: 'num'})(class Com extends san.Component {});
    `,

    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store-action';

    class Comp extends san.Component {
        static template = '<p>Hello {{name}}</p>';
        initData() {
            return {
                name: 'San'
            }
        }
    }

    export default connect['s' + 'an']({a: 'a'})(Comp);
    `,

    `
    import san from 'san';
    import {connect} from 'san-store';
    import store from './store';
    const connector = connect.createConnector;
    export default connector({num: 'num'})(class Com extends san.Component {});
    `,
    `
    const sanStore = require('san-store');
    const {Component} = require('san');
    const {
        connect: {
            ['s' + 'an']: er
        }
    } = sanStore;
    module.exports = er({num: 'num'})(class Comp extends Component {});
    `,
    `
    const sanStore = require('san-store');
    const {Component} = require('san');
    const {connector} = doSomething();
    module.exports = connector({num: 'num'})(class Comp extends Component {});
    `,
    `
    const {defineComponent: def} = require('san');
    const sanStore = require('san-store');
    let options = {
        initData() {
            return {
                name: 'San'
            }
        }
    };
    options.template = '<p>Hello {{name}}</p>';
    let defineComp = def;
    let connect
    connect = sanStore['con' + 'nect']
    let conn;
    conn = connect
    module.exports = conn['san']({num: 'num'})(defineComp(options));
    `
];

export const hasCommentComponent = [
    `
        /* san-hmr components */
        export default san.defineComponent({});
    `,
    `
        // san-hmr components
        import san from 'san';
        const Comp = san.defineComponent({
            template: 'Hello World'
        });

        let comp = new Comp();
        comp.attch(document.body);
    `,
    `
        export default san.defineComponent({});
        /* san-hmr components */
    `,
    `
        import san from 'san';
        const Comp = san.defineComponent({
            template: 'Hello World'
        });

        let comp = new Comp();
        comp.attch(document.body);
        // san-hmr components
    `
];

export const hasCommentDisable = [
    `
        /* san-hmr disable */
        import san from 'san';
        function Comp(options) {
            san.Component(this, options);
            this.data = {
                a: 1
            };
        }
        san.inherits(Comp, san.Component);
        export default Comp;
    `,
    `
        // san-hmr disable
        import san from 'san';
        function Comp(options) {
            san.Component(this, options);
            this.data = {
                a: 1
            };
        }
        san.inherits(Comp, san.Component);
        export default Comp;
    `,
    `
        import san from 'san';
        function Comp(options) {
            san.Component(this, options);
            this.data = {
                a: 1
            };
        }
        san.inherits(Comp, san.Component);
        export default Comp;
        /* san-hmr disable */
    `,
    `
        import san from 'san';
        function Comp(options) {
            san.Component(this, options);
            this.data = {
                a: 1
            };
        }
        san.inherits(Comp, san.Component);
        export default Comp;
        // san-hmr disable
    `
];
