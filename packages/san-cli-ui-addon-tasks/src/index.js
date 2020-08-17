/**
 * @file client addon
*/

import TaskDashboard from './components/task-dashboard';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san-cli.components.dashboard', TaskDashboard);
}
