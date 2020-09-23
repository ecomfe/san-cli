/**
 * @file Task Client Addon
*/
import TaskDashboard from './components/dashboard';
import TaskAnalyzer from './components/analyzer';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san.cli-ui.components.dashboard', TaskDashboard);
    ClientAddonApi.defineComponent('san.cli-ui.components.analyzer', TaskAnalyzer);
}
