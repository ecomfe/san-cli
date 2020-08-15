/**
 * @file client addon
*/

import Task from './components/task';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san-cli.components.dashboard', Task);
}
