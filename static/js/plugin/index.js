!function(e){function n(n){for(var t,l,u=n[0],a=n[1],c=n[2],p=0,s=[];p<u.length;p++)l=u[p],Object.prototype.hasOwnProperty.call(o,l)&&o[l]&&s.push(o[l][0]),o[l]=0;for(t in a)Object.prototype.hasOwnProperty.call(a,t)&&(e[t]=a[t]);for(f&&f(n);s.length;)s.shift()();return i.push.apply(i,c||[]),r()}function r(){for(var e,n=0;n<i.length;n++){for(var r=i[n],t=!0,u=1;u<r.length;u++){var a=r[u];0!==o[a]&&(t=!1)}t&&(i.splice(n--,1),e=l(l.s=r[0]))}return e}var t={},o={16:0},i=[];function l(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,l),r.l=!0,r.exports}l.e=function(){return Promise.resolve()},l.m=e,l.c=t,l.d=function(e,n,r){l.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},l.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,n){if(1&n&&(e=l(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(l.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var t in e)l.d(r,t,function(n){return e[n]}.bind(null,t));return r},l.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(n,"a",n),n},l.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},l.p="/san-cli/";var u=window.webpackJsonp=window.webpackJsonp||[],a=u.push.bind(u);u.push=n,u=u.slice();for(var c=0;c<u.length;c++)n(u[c]);var f=a;i.push([126,0]),r()}({126:function(e,n,r){var t=r(1),o=r(80),i=r(28).default;e.exports=r(28),e.exports.default=t(i,o,[])},28:function(e,n,r){"use strict";r.r(n),function(e){r.d(n,"default",(function(){return u}));var t,o,i,l=r(0);class u extends l.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:3,title:"深入阅读",hash:"%E6%B7%B1%E5%85%A5%E9%98%85%E8%AF%BB"}]})}}i={},(o="components")in(t=u)?Object.defineProperty(t,o,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[o]=i}.call(this,r(2))},80:function(e,n){e.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E6%8F%92%E4%BB%B6">插件</h1> <p>San CLI 是灵活可扩展的，我们可以通过编写插件来扩展 San CLI 的功能：</p> <ul> <li>Service 插件：Service 层的插件，用于对 Webpack 构建流程进行扩展。</li> </ul> <div class="warning"> <p>Service 插件主要是针对 Webpack 相关的，会加载内置 Webpack 配置和<code>san.config.js</code>配置。</p> </div> <h3 id="%E6%B7%B1%E5%85%A5%E9%98%85%E8%AF%BB">深入阅读</h3> <ul> <li><a href="/san-cli/srv-plugin/">编写一个 Service 插件</a></li> </ul> </div></div> '}});