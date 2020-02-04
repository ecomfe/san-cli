/**
 * 页面的 main.js
 * @file Created on Thu Nov 15 2018
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
import {defineComponent} from 'san';
import App from '~entry';
const Component = defineComponent(App);
const app = new Component();
app.attach(document.getElementById('app'));
