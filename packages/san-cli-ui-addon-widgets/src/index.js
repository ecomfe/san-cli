/**
 * @file addon-widgets
 * @author zttonly
*/

import Welcome from './components/welcome';
import KillPort from './components/kill-port';
// import PluginUpdates from './components/PluginUpdates.js';
// import DependencyUpdates from './components/DependencyUpdates.js';
// import Vulnerability from './components/Vulnerability.js';
// import VulnerabilityDetails from './components/VulnerabilityDetails.js';
// import RunTask from './components/RunTask.js';
// import News from './components/News.js';

module.exports = ClientAddonApi => {
    ClientAddonApi.component('san.widgets.components.welcome', Welcome);
    ClientAddonApi.component('san.widgets.components.kill-port', KillPort);
    // ClientAddonApi.component('san.widgets.components.plugin-updates', PluginUpdates)
    // ClientAddonApi.component('san.widgets.components.dependency-updates', DependencyUpdates)
    // ClientAddonApi.component('san.widgets.components.vulnerability', Vulnerability)
    // ClientAddonApi.component('san.widgets.components.vulnerability-details', VulnerabilityDetails)
    // ClientAddonApi.component('san.widgets.components.run-task', RunTask)
    // ClientAddonApi.component('san.widgets.components.news', News)
};
