/**
 * @file addon-widgets registry
 * @author zttonly
*/

import Welcome from './components/welcome/welcome';
import KillPort from './components/kill-port/kill-port';
import News from './components/news/news';
import RunTask from './components/run-task/run-task';
import GenQrcode from './components/gen-qrcode/gen-qrcode';
// import CompressImage from './components/compress-image/compress-image';


/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.defineComponent('san.widgets.components.welcome', Welcome);
    ClientAddonApi.defineComponent('san.widgets.components.kill-port', KillPort);
    ClientAddonApi.defineComponent('san.widgets.components.news', News);
    ClientAddonApi.defineComponent('san.widgets.components.run-task', RunTask);
    ClientAddonApi.defineComponent('san.widgets.components.gen-qrcode', GenQrcode);
    // ClientAddonApi.defineComponent('san.widgets.components.compress-image', CompressImage);
}

