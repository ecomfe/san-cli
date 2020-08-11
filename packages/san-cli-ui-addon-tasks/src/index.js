/**
 * @file client addon
*/

import Task from './components/task/task';

if (window.ClientAddonApi) {
    window.ClientAddonApi.component('san.widgets.components.task', Task);
}

