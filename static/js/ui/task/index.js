!function(e){function n(n){for(var r,s,c=n[0],i=n[1],l=n[2],p=0,d=[];p<c.length;p++)s=c[p],Object.prototype.hasOwnProperty.call(o,s)&&o[s]&&d.push(o[s][0]),o[s]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);for(u&&u(n);d.length;)d.shift()();return a.push.apply(a,l||[]),t()}function t(){for(var e,n=0;n<a.length;n++){for(var t=a[n],r=!0,c=1;c<t.length;c++){var i=t[c];0!==o[i]&&(r=!1)}r&&(a.splice(n--,1),e=s(s.s=t[0]))}return e}var r={},o={34:0},a=[];function s(n){if(r[n])return r[n].exports;var t=r[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,s),t.l=!0,t.exports}s.e=function(){return Promise.resolve()},s.m=e,s.c=r,s.d=function(e,n,t){s.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,n){if(1&n&&(e=s(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(s.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)s.d(t,r,function(n){return e[n]}.bind(null,r));return t},s.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(n,"a",n),n},s.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},s.p="/san-cli/";var c=window.webpackJsonp=window.webpackJsonp||[],i=c.push.bind(c);c.push=n,c=c.slice();for(var l=0;l<c.length;l++)n(c[l]);var u=i;a.push([136,0]),t()}({100:function(e,n,t){"use strict";t.r(n),n.default=t.p+"static/img/task.png"},101:function(e,n,t){"use strict";t.r(n),n.default=t.p+"static/img/start-task.png"},136:function(e,n,t){var r=t(1),o=t(99),a=t(37).default;e.exports=t(37),e.exports.default=r(a,o,[])},37:function(e,n,t){"use strict";t.r(n),function(e){t.d(n,"default",(function(){return c}));var r,o,a,s=t(0);class c extends s.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"任务详情",hash:"%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85"}]})}}a={},(o="components")in(r=c)?Object.defineProperty(r,o,{value:a,enumerable:!0,configurable:!0,writable:!0}):r[o]=a}.call(this,t(2))},99:function(e,n,t){var r=t(4),o=t(100),a=t(101),s=' <div class="content"><div class="markdown"><h1 id="%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86">任务管理</h1> <p>在<code>San CLI</code>中主要通过<code>san serve</code>和<code>san build</code>命令进行生产和开发环境的打包，San的脚手架工程内置了四个命令，包括启动本地服务、生产环境打包、打包分析、现代模式打包等，脚手架工程的package.json内可执行的命令有：</p> <pre class="language-js"><code class="language-js">npm run start <span class="token comment">// 打包+启动本地服务</span>\nnpm run build <span class="token comment">// 打包发布</span>\nnpm run analyzer <span class="token comment">// 打包分析</span>\nnpm run build<span class="token operator">:</span>modern <span class="token comment">// 现代模式打包</span></code></pre> <p>在<code>San CLI UI</code>的任务管理中对每一个内置命令实现了对应的可视化操作任务，同时增加了一个内置的<strong>inspect</strong>任务，用于查看webpack的配置，</p> <img src="'+r(o)+'" style="width:80%;max-width:1000px"/> <h2 id="%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85">任务详情</h2> <p>进入其中一个任务的详情页后，比如 start，在右上角设置按钮可以配置该任务，点击运行启动任务。</p> <img src="'+r(a)+'" style="width:80%;max-width:1000px"/> <p><code>San CLI UI</code>的任务管理，在实现内置命令执行的同时，通过插件机制实现了命令的增强：</p> <ul> <li>在仪表盘将打包过程及结果的统计信息进行了可视化的展示，包括资源大小及执行速度等，使得打包过程更清晰，产出大小分类更直观。</li> <li>在任务的分析tab，将包的大小分下采用环状统计图显示，对比更明显，有助于快速定位优化。</li> <li><code>San CLI UI</code>将后台的原始输出展示在页面，用户无需手动切换窗口，更快定位编译问题。</li> </ul> </div></div> ';e.exports=s}});