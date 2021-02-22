!function(e){function n(n){for(var o,c,s=n[0],l=n[1],i=n[2],u=0,d=[];u<s.length;u++)c=s[u],Object.prototype.hasOwnProperty.call(t,c)&&t[c]&&d.push(t[c][0]),t[c]=0;for(o in l)Object.prototype.hasOwnProperty.call(l,o)&&(e[o]=l[o]);for(p&&p(n);d.length;)d.shift()();return r.push.apply(r,i||[]),a()}function a(){for(var e,n=0;n<r.length;n++){for(var a=r[n],o=!0,s=1;s<a.length;s++){var l=a[s];0!==t[l]&&(o=!1)}o&&(r.splice(n--,1),e=c(c.s=a[0]))}return e}var o={},t={31:0,66:0},r=[];function c(n){if(o[n])return o[n].exports;var a=o[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,c),a.l=!0,a.exports}c.e=function(){return Promise.resolve()},c.m=e,c.c=o,c.d=function(e,n,a){c.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:a})},c.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,n){if(1&n&&(e=c(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(c.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)c.d(a,o,function(n){return e[n]}.bind(null,o));return a},c.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return c.d(n,"a",n),n},c.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},c.p="/san-cli/";var s=window.webpackJsonp=window.webpackJsonp||[],l=s.push.bind(s);s.push=n,s=s.slice();for(var i=0;i<s.length;i++)n(s[i]);var p=l;r.push([130,0]),a()}({130:function(e,n,a){var o=a(1),t=a(83),r=a(31).default;e.exports=a(31),e.exports.default=o(r,t,[])},31:function(e,n,a){"use strict";a.r(n),function(e){a.d(n,"default",(function(){return s}));var o,t,r,c=a(0);class s extends c.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"安装",hash:"%E5%AE%89%E8%A3%85"},{level:2,title:"使用",hash:"%E4%BD%BF%E7%94%A8"},{level:2,title:"特点",hash:"%E7%89%B9%E7%82%B9"}]})}}r={},(t="components")in(o=s)?Object.defineProperty(o,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):o[t]=r}.call(this,a(2))},83:function(e,n){e.exports=' <div class="content"><div class="markdown"><h1 id="san-cli-ui"><a class="header-anchor" href="#san-cli-ui">#</a> San CLI UI</h1> <p><code>San CLI UI</code>是<code>San CLI</code>的图形化操作界面，实现<code>San CLI</code>工程项目的可视化管理；<code>San CLI UI</code>的功能定位是一款可视化的项目管理和构建的工具，在设计之初借鉴了业界比较优秀的可视化工具<a href="https://cli.vuejs.org/dev-guide/ui-api.html" target="_blank">Vue-CLI-UI</a>和<a href="https://github.com/kitze/JSUI" target="_blank">JSUI</a>的功能设计，以期更加适应用户的使用习惯，降低接入门槛，带来更好的使用体验，进而令工具更广泛地传播。</p> <p>其次，<code>San CLI UI</code>附加了插件化设计，使得<code>San CLI UI</code>在功能增强的基础上更易于扩展，为更多功能集成提供了可能。随着插件建设的丰富，比如集成各种构建流程、小工具等，最终目标实现千人千面的个性化工作台，用户无需辗转各种网站工具，可以在<code>San CLI UI</code>处理一切工作相关的事情。</p> <h2 id="%E5%AE%89%E8%A3%85"><a class="header-anchor" href="#%E5%AE%89%E8%A3%85">#</a> 安装</h2> <p>作为<code>San CLI</code>的图形化界面，安装<code>san-cli@3</code>以上版本即可尽情享用。</p> <p>!&gt; 使用<code>San CLI UI</code>功能，请尽量保证 Node.js 版本 <code>&gt;= 10.13.0</code>。</p> <p>全局安装<code>San CLI</code></p> <pre class="language-bash"><code class="language-bash"><span class="token comment"># use npm </span>\n<span class="token operator">></span> <span class="token function">npm</span> <span class="token function">install</span> -g san-cli\n\n<span class="token comment"># or use yarn </span>\n<span class="token operator">></span> <span class="token function">yarn</span> global <span class="token function">add</span> san-cli</code></pre> <h2 id="%E4%BD%BF%E7%94%A8"><a class="header-anchor" href="#%E4%BD%BF%E7%94%A8">#</a> 使用</h2> <p>执行命令启动工作台</p> <pre class="language-bash"><code class="language-bash"><span class="token operator">></span> san ui</code></pre> <p>在打开一个浏览器窗口体验<code>San CLI UI</code>的功能。</p> <h2 id="%E7%89%B9%E7%82%B9"><a class="header-anchor" href="#%E7%89%B9%E7%82%B9">#</a> 特点</h2> <p>基于<code>San CLI UI</code>的图形化和插件化，可以概括以下特点：</p> <ul> <li>操作简单，新手友好</li> <li>可视化操作</li> <li>集成项目管理</li> <li>自带配置语义</li> <li>构建过程更直观</li> <li>自定义工具集</li> </ul> </div></div> '}});