/**
 * @file client addon
*/

import Task from './components/task';

if (window.ClientAddonApi) {
    window.ClientAddonApi.component('san.widgets.components.task', Task);
}

