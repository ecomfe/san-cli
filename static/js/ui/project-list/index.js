!function(e){function t(t){for(var n,u,a=t[0],c=t[1],l=t[2],s=0,p=[];s<a.length;s++)u=a[s],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&p.push(o[u][0]),o[u]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(f&&f(t);p.length;)p.shift()();return i.push.apply(i,l||[]),r()}function r(){for(var e,t=0;t<i.length;t++){for(var r=i[t],n=!0,a=1;a<r.length;a++){var c=r[a];0!==o[c]&&(n=!1)}n&&(i.splice(t--,1),e=u(u.s=r[0]))}return e}var n={},o={30:0},i=[];function u(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,u),r.l=!0,r.exports}u.e=function(){return Promise.resolve()},u.m=e,u.c=n,u.d=function(e,t,r){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},u.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(u.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)u.d(r,n,function(t){return e[t]}.bind(null,n));return r},u.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="";var a=window.webpackJsonp=window.webpackJsonp||[],c=a.push.bind(a);a.push=t,a=a.slice();for(var l=0;l<a.length;l++)t(a[l]);var f=c;i.push([131,0]),r()}({131:function(e,t,r){var n=r(1),o=r(84),i=r(32).default;e.exports=r(32),e.exports.default=n(i,o,[])},32:function(e,t,r){"use strict";r.r(t),function(e){r.d(t,"default",(function(){return a}));var n,o,i,u=r(0);class a extends u.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0})}}i={},(o="components")in(n=a)?Object.defineProperty(n,o,{value:i,enumerable:!0,configurable:!0,writable:!0}):n[o]=i}.call(this,r(2))},84:function(e,t,r){var n=' <div class="content"><div class="markdown"><h1 id="%E9%A1%B9%E7%9B%AE%E7%AE%A1%E7%90%86"><a class="header-anchor" href="#%E9%A1%B9%E7%9B%AE%E7%AE%A1%E7%90%86">#</a> 项目管理</h1> <p>进入<code>San CLI UI</code>的主页即为项目管理界面，可对显示的本地列表项目进行搜索、收藏、在编辑器打开、重命名、从<code>San CLI UI</code>删除（不会删除本地文件），删除后可通过导入项目重新显示在项目列表中，</p> <img src="'+r(4)(r(85))+'" style="width:80%;max-width:1000px"/> </div></div> ';e.exports=n},85:function(e,t,r){"use strict";r.r(t),t.default=r.p+"static/img/project-list.png"}});