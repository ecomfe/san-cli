!function(e){function a(a){for(var s,l,r=a[0],i=a[1],c=a[2],E=0,u=[];E<r.length;E++)l=r[E],Object.prototype.hasOwnProperty.call(t,l)&&t[l]&&u.push(t[l][0]),t[l]=0;for(s in i)Object.prototype.hasOwnProperty.call(i,s)&&(e[s]=i[s]);for(p&&p(a);u.length;)u.shift()();return o.push.apply(o,c||[]),n()}function n(){for(var e,a=0;a<o.length;a++){for(var n=o[a],s=!0,r=1;r<n.length;r++){var i=n[r];0!==t[i]&&(s=!1)}s&&(o.splice(a--,1),e=l(l.s=n[0]))}return e}var s={},t={9:0,51:0},o=[];function l(a){if(s[a])return s[a].exports;var n=s[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,l),n.l=!0,n.exports}l.e=function(){return Promise.resolve()},l.m=e,l.c=s,l.d=function(e,a,n){l.o(e,a)||Object.defineProperty(e,a,{enumerable:!0,get:n})},l.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,a){if(1&a&&(e=l(e)),8&a)return e;if(4&a&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(l.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&a&&"string"!=typeof e)for(var s in e)l.d(n,s,function(a){return e[a]}.bind(null,s));return n},l.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(a,"a",a),a},l.o=function(e,a){return Object.prototype.hasOwnProperty.call(e,a)},l.p="/san-cli/";var r=window.webpackJsonp=window.webpackJsonp||[],i=r.push.bind(r);r.push=a,r=r.slice();for(var c=0;c<r.length;c++)a(r[c]);var p=i;o.push([112,0]),n()}({112:function(e,a,n){var s=n(1),t=n(59),o=n(13).default;e.exports=n(13),e.exports.default=s(o,t,[])},13:function(e,a,n){"use strict";n.r(a),function(e){n.d(a,"default",(function(){return r}));var s,t,o,l=n(0);class r extends l.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"没有安装 San-CLI 需要安装",hash:"%E6%B2%A1%E6%9C%89%E5%AE%89%E8%A3%85-san-cli-%E9%9C%80%E8%A6%81%E5%AE%89%E8%A3%85"},{level:2,title:"快速创建",hash:"%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA"},{level:2,title:"指定脚手架创建",hash:"%E6%8C%87%E5%AE%9A%E8%84%9A%E6%89%8B%E6%9E%B6%E5%88%9B%E5%BB%BA",children:[{level:3,title:"例如",hash:"%E4%BE%8B%E5%A6%82"}]},{level:2,title:"init 参数说明",hash:"init-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E"},{level:2,title:"使用 remote 管理脚手架模板别名",hash:"%E4%BD%BF%E7%94%A8-remote-%E7%AE%A1%E7%90%86%E8%84%9A%E6%89%8B%E6%9E%B6%E6%A8%A1%E6%9D%BF%E5%88%AB%E5%90%8D"}]})}}o={},(t="components")in(s=r)?Object.defineProperty(s,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):s[t]=o}.call(this,n(2))},59:function(e,a){e.exports=' <div class="content"><div class="markdown"><h1 id="%E5%88%9D%E5%A7%8B%E5%8C%96%E9%A1%B9%E7%9B%AE">初始化项目</h1> <h2 id="%E6%B2%A1%E6%9C%89%E5%AE%89%E8%A3%85-san-cli-%E9%9C%80%E8%A6%81%E5%AE%89%E8%A3%85">没有安装 San-CLI 需要安装</h2> <pre class="language-bash"><code class="language-bash"><span class="token function">npm</span> i -g san-cli</code></pre> <h2 id="%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA">快速创建</h2> <pre class="language-bash"><code class="language-bash">san init <span class="token operator">&lt;</span>app-name<span class="token operator">></span></code></pre> <blockquote> <ol> <li>创建的是 san 项目。</li> <li>app-name 是要创建的工程项目目录，可以为<code>.</code>（即在当前目录下创建）。</li> </ol> </blockquote> <h2 id="%E6%8C%87%E5%AE%9A%E8%84%9A%E6%89%8B%E6%9E%B6%E5%88%9B%E5%BB%BA">指定脚手架创建</h2> <pre class="language-bash"><code class="language-bash">san init <span class="token operator">&lt;</span>template<span class="token operator">></span> <span class="token operator">&lt;</span>app-name<span class="token operator">></span></code></pre> <blockquote> <ol> <li>template 是工程项目脚手架地址，支持 github、icode、gitlab 等 repo 作为脚手架直接创建项目，并且可以指定 template 的 alias，详见下方的 <strong>san remote</strong></li> <li>为了方便，我们创建了一个 San 的基础脚手架 ksky521/san-project，不指定脚手架创建时（即快速创建时），用的就是这个基础脚手架。</li> </ol> </blockquote> <h3 id="%E4%BE%8B%E5%A6%82">例如</h3> <pre class="language-bash"><code class="language-bash"><span class="token comment"># 1. 支持传入完整的 repo 地址:</span>\nsan init ksky521/san-project demo\nsan init https://github.com/ksky521/san-project.git demo\n<span class="token comment"># 2. 默认是从 github repo 安装</span>\n<span class="token comment"># 所以用 git@github.com:ksky521/simple.git 这个 repo 时可以简写成：</span>\nsan init simple demo\n<span class="token comment">#  3. 支持 github，icode，gitlab 等简写方式</span>\nsan init github:ksky521/san-project demo\nsan init icode:baidu/hulk/san-project-base demo\nsan init coding:ksky521/san-project demo\n<span class="token comment"># 4. 分支写法</span>\nsan init template<span class="token comment">#branch demo</span>\n<span class="token comment"># 5. 项目生成在当前目录</span>\nsan init template<span class="token comment">#branch .</span></code></pre> <h2 id="init-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E"><code>init</code> 参数说明</h2> <ul> <li><code>--ssh</code>：下载脚手架模板时是否使用 SSH，默认使用 HTTP</li> <li><code>--useCache，--cache</code> 优先使用本地已经下载过的脚手架缓存</li> <li><code>--install</code> 初始化成功后，进入目录安装依赖</li> <li><code>--offline</code> 标示 template 是离线脚手架</li> <li><code>--force</code> 跳过提醒，强制删除已存在的目录，默认会提醒</li> <li><code>--username，--u</code> 指定 Git 用户名，默认：git</li> <li><code>--registry</code> 设置 npm registry</li> </ul> <h2 id="%E4%BD%BF%E7%94%A8-remote-%E7%AE%A1%E7%90%86%E8%84%9A%E6%89%8B%E6%9E%B6%E6%A8%A1%E6%9D%BF%E5%88%AB%E5%90%8D">使用 remote 管理脚手架模板别名</h2> <p>初始化的时候，项目脚手架路径较长，不容易记忆，可以使用 remote 命令来管理脚手架模板的别名。remote 方法包括三个：</p> <ul> <li>add：添加</li> <li>remove/rm：删除，</li> <li>list/ls：列出脚手架模板 alias</li> </ul> <h4 id="1.-%E6%B7%BB%E5%8A%A0%E4%B8%80%E7%BB%84-alias">1. 添加一组 alias</h4> <pre class="language-bash"><code class="language-bash"><span class="token comment"># 基本语法</span>\nsan remote <span class="token function">add</span> <span class="token operator">&lt;</span>name<span class="token operator">></span> <span class="token operator">&lt;</span>url<span class="token operator">></span></code></pre> <h6 id="%E4%BE%8B%E5%A6%82-2"><strong><em>例如</em></strong></h6> <pre class="language-bash"><code class="language-bash">san remote <span class="token function">add</span> hello github:yyt/HelloWorld\nsan remote <span class="token function">add</span> project ssh://git@icode.baidu.com:8235/baidu/hulk/san-project-base</code></pre> <h4 id="2.-%E7%A7%BB%E9%99%A4%E4%B8%80%E7%BB%84-alias">2. 移除一组 alias</h4> <pre class="language-bash"><code class="language-bash">san remote remove <span class="token operator">&lt;</span>name<span class="token operator">></span></code></pre> <p>从预设文件中将你输入的映射的关系移除</p> <h6 id="%E4%BE%8B%E5%A6%82-3"><strong><em>例如</em></strong></h6> <pre class="language-bash"><code class="language-bash">san remote <span class="token function">rm</span> hello</code></pre> <h4 id="3.-%E6%9F%A5%E7%9C%8B-alias-%E5%88%97%E8%A1%A8">3. 查看 alias 列表</h4> <pre class="language-bash"><code class="language-bash">san remote list</code></pre> <p>查看目前的映射关系表</p> <h6 id="%E4%BE%8B%E5%A6%82-4"><strong>例如</strong></h6> <pre class="language-bash"><code class="language-bash">san remote list\n<span class="token comment"># or</span>\nsan remote <span class="token function">ls</span></code></pre> <p>更多类似用法和配置方式查看<a href="/san-cli/presets/">预设文件</a>。</p> </div></div> '}});