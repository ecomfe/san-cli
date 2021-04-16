!function(n){function s(s){for(var e,t,l=s[0],p=s[1],r=s[2],d=0,u=[];d<l.length;d++)t=l[d],Object.prototype.hasOwnProperty.call(o,t)&&o[t]&&u.push(o[t][0]),o[t]=0;for(e in p)Object.prototype.hasOwnProperty.call(p,e)&&(n[e]=p[e]);for(i&&i(s);u.length;)u.shift()();return c.push.apply(c,r||[]),a()}function a(){for(var n,s=0;s<c.length;s++){for(var a=c[s],e=!0,l=1;l<a.length;l++){var p=a[l];0!==o[p]&&(e=!1)}e&&(c.splice(s--,1),n=t(t.s=a[0]))}return n}var e={},o={17:0,58:0},c=[];function t(s){if(e[s])return e[s].exports;var a=e[s]={i:s,l:!1,exports:{}};return n[s].call(a.exports,a,a.exports,t),a.l=!0,a.exports}t.e=function(){return Promise.resolve()},t.m=n,t.c=e,t.d=function(n,s,a){t.o(n,s)||Object.defineProperty(n,s,{enumerable:!0,get:a})},t.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},t.t=function(n,s){if(1&s&&(n=t(n)),8&s)return n;if(4&s&&"object"==typeof n&&n&&n.__esModule)return n;var a=Object.create(null);if(t.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:n}),2&s&&"string"!=typeof n)for(var e in n)t.d(a,e,function(s){return n[s]}.bind(null,e));return a},t.n=function(n){var s=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(s,"a",s),s},t.o=function(n,s){return Object.prototype.hasOwnProperty.call(n,s)},t.p="/san-cli/";var l=window.webpackJsonp=window.webpackJsonp||[],p=l.push.bind(l);l.push=s,l=l.slice();for(var r=0;r<l.length;r++)s(l[r]);var i=p;c.push([117,0]),a()}({117:function(n,s,a){var e=a(1),o=a(65),c=a(18).default;n.exports=a(18),n.exports.default=e(c,o,[])},18:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return l}));var e,o,c,t=a(0);class l extends t.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"配置项",hash:"%E9%85%8D%E7%BD%AE%E9%A1%B9"},{level:2,title:"San CLI 中会修改sanrc.json的命令",hash:"san-cli-%E4%B8%AD%E4%BC%9A%E4%BF%AE%E6%94%B9sanrc.json%E7%9A%84%E5%91%BD%E4%BB%A4",children:[{level:3,title:"san command add/remove/list",hash:"san-command-add%2Fremove%2Flist"},{level:3,title:"san plugin add/remove/list",hash:"san-plugin-add%2Fremove%2Flist"},{level:3,title:"san remote add/remove/list",hash:"san-remote-add%2Fremove%2Flist"}]}]})}}c={},(o="components")in(e=l)?Object.defineProperty(e,o,{value:c,enumerable:!0,configurable:!0,writable:!0}):e[o]=c}.call(this,a(2))},65:function(n,s){n.exports=' <div class="content"><div class="markdown"><h1 id="presets-%E9%A2%84%E8%AE%BE">Presets 预设</h1> <p>为了方便个人和团队使用，San CLI 支持<code>sanrc.json</code>的预设文件，该文件存储在<code>homedir/.san/sanrc.json</code>，这个文件因为存储在个人的 home 文件夹，所以不会被同步到项目中，适应场景是自己定制的 San CLI 配置。</p> <p>团队或者项目中如果要统一 San CLI 的预设配置，可以修改项目的<code>package.json</code>的<code>san</code>字段，添加对应的配置项。</p> <blockquote> <p>更精确的表达是：sanrc.json 是 CLI 的配置文件，san.config.js 是项目的配置文件。</p> </blockquote> <h2 id="%E9%85%8D%E7%BD%AE%E9%A1%B9">配置项</h2> <p><code>sanrc.json</code>的文件配置项如下：</p> <ul> <li>commands：<strong>Array</strong>，添加的 <a href="/san-cli/cmd-plugin/">Command 插件</a>，数组内存储的是<code>String</code>类型，支持路径或者插件的 NPM 包名；</li> <li>plugins：<strong>Array</strong>，添加的 <a href="/san-cli/srv-plugin/">Service 插件</a>，数组内存储的是<code>String</code>类型，支持路径或者插件的 NPM 包名；</li> <li>useBuiltInPlugin：<strong>Boolean</strong>，表示初始化 Service 时，是否使用内置插件，默认是<code>true</code>；</li> <li>templateAlias：<strong>Object</strong>，脚手架模板的 alias Map，例如下面的配置，在使用<code>san init project target_path</code>时，会去对应的<code>icode</code>地址拉取脚手架模板。</li> </ul> <pre class="language-json"><code class="language-json"><span class="token comment">// sanrc.json 举例</span>\n<span class="token punctuation">{</span><span class="token property">"templateAlias"</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token property">"project"</span><span class="token operator">:</span> <span class="token string">"ssh://git@icode.baidu.com:8235/baidu/foo/bar"</span><span class="token punctuation">}</span><span class="token punctuation">}</span></code></pre> <p>配置在<code>package.json</code>的<code>san</code>字段举例：</p> <pre class="language-json"><code class="language-json"><span class="token comment">// 项目的 package.json</span>\n<span class="token punctuation">{</span>\n    <span class="token property">"name"</span><span class="token operator">:</span> <span class="token string">"san-project"</span><span class="token punctuation">,</span>\n    <span class="token comment">// ..其他 package.json 配置</span>\n    <span class="token comment">// san 字段</span>\n    <span class="token property">"san"</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n        <span class="token property">"commands"</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">"san-command.js"</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n        <span class="token property">"plugins"</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">"san-plugin.js"</span><span class="token punctuation">]</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre> <h2 id="san-cli-%E4%B8%AD%E4%BC%9A%E4%BF%AE%E6%94%B9sanrc.json%E7%9A%84%E5%91%BD%E4%BB%A4">San CLI 中会修改<code>sanrc.json</code>的命令</h2> <p>San CLI 中有一些命令可以修改<code>sanrc.json</code>的配置。</p> <h3 id="san-command-add%2Fremove%2Flist"><code>san command add/remove/list</code></h3> <p><code>san command</code>是添加和管理 CLI Command 插件的命令：</p> <ul> <li>add：添加</li> <li>remove/rm：删除，</li> <li>list/ls：列出 command 列表</li> </ul> <p><strong>用法举例：</strong></p> <pre class="language-bash"><code class="language-bash">san <span class="token builtin class-name">command</span> <span class="token function">add</span> san-command.js\nsan <span class="token builtin class-name">command</span> <span class="token function">ls</span>\nsan <span class="token builtin class-name">command</span> <span class="token function">rm</span> san-command.js\nsan <span class="token builtin class-name">command</span> <span class="token function">add</span> san-command.js -g</code></pre> <div class="warning"> <ol> <li><code>--global</code>,<code>-g</code>：默认写到项目的 package.json 的 san 字段，使用<code>-g</code>则写到 home 文件夹的<code>sanrc.json</code>文件。</li> <li>command 实际是操作的<code>sanrc.json</code>或者 package.json <code>san</code> 的 commands 字段</li> </ol> </div> <h3 id="san-plugin-add%2Fremove%2Flist">san plugin add/remove/list</h3> <p><code>san plugin</code>是添加和管理 CLI plugin 插件的命令：</p> <ul> <li>add：添加</li> <li>remove/rm：删除，</li> <li>list/ls：列出 plugin 列表</li> </ul> <p><strong>用法举例：</strong></p> <pre class="language-bash"><code class="language-bash">san plugin <span class="token function">add</span> san-plugin.js\nsan plugin <span class="token function">ls</span>\nsan plugin <span class="token function">rm</span> san-plugin.js\nsan plugin <span class="token function">add</span> san-plugin.js -g</code></pre> <div class="warning"> <ol> <li><code>--global</code>,<code>-g</code>：默认写到项目的 package.json 的 san 字段，使用<code>-g</code>则写到 home 文件夹的<code>sanrc.json</code>文件。</li> <li>plugin 实际是操作的<code>sanrc.json</code>或者 package.json <code>san</code> 的 plugins 字段</li> </ol> </div> <h3 id="san-remote-add%2Fremove%2Flist">san remote add/remove/list</h3> <p>每次初始化项目的时候，都输出长长的脚手架地址，使用<code>san remote</code>可以给脚手架模板创建一个短别名：</p> <ul> <li>add：添加</li> <li>remove/rm：删除，</li> <li>list/ls：列出脚手架模板 alias</li> </ul> <p><strong>用法举例：</strong></p> <pre class="language-bash"><code class="language-bash"><span class="token comment"># san remote add &lt;name> &lt;url></span>\nsan remote <span class="token function">add</span> project ssh://git@icode.baidu.com:8235/baidu/foo/bar\nsan remote <span class="token function">ls</span>\nsan remote <span class="token function">rm</span> project</code></pre> <div class="warning"> <ol> <li><code>remote</code>的命令不支持<code>--global</code>，操作的实际是<code>sanrc.json</code>的 <code>templateAlias</code> 字段。</li> <li>不建议在<code>package.json</code>中添加<code>templateAlias</code>。</li> </ol> </div> </div></div> '}});