/**
 * @file task describer
 */
import {Icon, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/button/style';

export default {
    template: /* html */`
        <div class="client-addon-task">
           Hello CLI.
        </div>
    `,
    components: {
        's-icon': Icon,
        's-button': Button
    }
};
