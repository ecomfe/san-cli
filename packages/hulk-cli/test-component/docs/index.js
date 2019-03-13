import san from 'san';
import Readme from '../README.md';
import Basic from './basic.md';

export default san.defineComponent({
    components:{
        readme: Readme,
        demo: Basic
    },
    template: `
        <div>
            <readme/>
            <demo/>
        </div>
    `
})