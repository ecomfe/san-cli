import {Component} from 'san';
import index from './app.san';

export default class Index extends Component {
    static components = {
        index: index
    };
    static template = '<index docit="{{docit}}"><index>';
    static computed = {
        docit() {
            // `SAN_DOCIT` 通过 san-ssr 注入的变量
            return this.data.get('SAN_DOCIT');
        }
    }
};
