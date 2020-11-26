import {Component} from 'san';
import index from './app.san';

export default SAN_DOCIT => {
    class Index extends Component {
        static components = {
            index
        };
        static template = '<index docit="{{docit}}"><index>';
        static computed = {
            docit() {
                return SAN_DOCIT;
            }
        };
    };

    const app = new Index({
        el: document.getElementById('site')
    });

    if (process.env.NODE_ENV !== 'production') {
        app.attach(document.getElementById('app'));
    }
};


