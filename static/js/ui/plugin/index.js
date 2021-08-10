!function(e){function t(t){for(var r,l,u=t[0],a=t[1],c=t[2],p=0,d=[];p<u.length;p++)l=u[p],Object.prototype.hasOwnProperty.call(o,l)&&o[l]&&d.push(o[l][0]),o[l]=0;for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]);for(s&&s(t);d.length;)d.shift()();return i.push.apply(i,c||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],r=!0,u=1;u<n.length;u++){var a=n[u];0!==o[a]&&(r=!1)}r&&(i.splice(t--,1),e=l(l.s=n[0]))}return e}var r={},o={28:0},i=[];function l(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,l),n.l=!0,n.exports}l.e=function(){return Promise.resolve()},l.m=e,l.c=r,l.d=function(e,t,n){l.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},l.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,t){if(1&t&&(e=l(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(l.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)l.d(n,r,function(t){return e[t]}.bind(null,r));return n},l.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(t,"a",t),t},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="/san-cli/";var u=window.webpackJsonp=window.webpackJsonp||[],a=u.push.bind(u);u.push=t,u=u.slice();for(var c=0;c<u.length;c++)t(u[c]);var s=a;i.push([131,0]),n()}({131:function(e,t,n){var r=n(1),o=n(90),i=n(33).default;e.exports=n(33),e.exports.default=r(i,o,[])},33:function(e,t,n){"use strict";n.r(t),function(e){n.d(t,"default",(function(){return u}));var r,o,i,l=n(0);class u extends l.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"安装插件",hash:"%E5%AE%89%E8%A3%85%E6%8F%92%E4%BB%B6"},{level:2,title:"安装 devtools",hash:"%E5%AE%89%E8%A3%85-devtools"}]})}}i={},(o="components")in(r=u)?Object.defineProperty(r,o,{value:i,enumerable:!0,configurable:!0,writable:!0}):r[o]=i}.call(this,n(2))},90:function(e,t,n){var r=n(4),o=n(91),i=n(92),l=' <div class="content markdown-content"><div class="markdown"><h1 id="%E6%8F%92%E4%BB%B6%E7%AE%A1%E7%90%86">插件管理</h1> <p>在插件管理，可以查看项目已安装的插件列表，也可以在上方的搜索框中搜索项目已安装的插件，然后更新或卸载它们。</p> <img src="'+r(o)+'" style="width:80%;max-width:1000px"/> <h2 id="%E5%AE%89%E8%A3%85%E6%8F%92%E4%BB%B6">安装插件</h2> <p>点击右上角的“安装插件”按钮后，我们可以浏览所有的插件，这里我们将<code>San CLI</code>插件和<code>San CLI UI</code>插件进行了分类展示，提升搜索效率。</p> <img src="'+r(i)+'" style="width:80%;max-width:1000px"/> <h2 id="%E5%AE%89%E8%A3%85-devtools">安装 devtools</h2> <p>右上角还提供了安装 devtools 的快捷入口。注：devtools 是用于调试 san.js 应用的开发工具。</p> <p>配置和依赖确认完毕后，接下来需要启动本地服务进行调试了。</p> </div></div> ';e.exports=l},91:function(e,t,n){"use strict";n.r(t),t.default=n.p+"static/img/plugins.png"},92:function(e,t,n){"use strict";n.r(t),t.default=n.p+"static/img/install-plugin.png"}});