(window.webpackJsonp=window.webpackJsonp||[]).push([[50,9],{111:function(e,n,a){var s=a(1),t=a(58),o=a(13).default;e.exports=a(13),e.exports.default=s(o,t,[])},13:function(e,n,a){"use strict";a.r(n),function(e){a.d(n,"default",(function(){return i}));var s,t,o,l=a(0);class i extends l.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"没有安装 San CLI 需要安装",hash:"%E6%B2%A1%E6%9C%89%E5%AE%89%E8%A3%85-san-cli-%E9%9C%80%E8%A6%81%E5%AE%89%E8%A3%85"},{level:2,title:"快速创建",hash:"%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA"},{level:2,title:"指定脚手架创建",hash:"%E6%8C%87%E5%AE%9A%E8%84%9A%E6%89%8B%E6%9E%B6%E5%88%9B%E5%BB%BA",children:[{level:3,title:"例如",hash:"%E4%BE%8B%E5%A6%82"}]},{level:2,title:"init 参数说明",hash:"init-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E"}]})}}o={},(t="components")in(s=i)?Object.defineProperty(s,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):s[t]=o}.call(this,a(2))},58:function(e,n){e.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E5%88%9D%E5%A7%8B%E5%8C%96%E9%A1%B9%E7%9B%AE">初始化项目</h1> <h2 id="%E6%B2%A1%E6%9C%89%E5%AE%89%E8%A3%85-san-cli-%E9%9C%80%E8%A6%81%E5%AE%89%E8%A3%85">没有安装 San CLI 需要安装</h2> <pre class="language-bash"><code class="language-bash"><span class="token function">npm</span> i -g san-cli</code></pre> <h2 id="%E5%BF%AB%E9%80%9F%E5%88%9B%E5%BB%BA">快速创建</h2> <pre class="language-bash"><code class="language-bash">san init <span class="token operator">&lt;</span>app-name<span class="token operator">></span></code></pre> <blockquote> <ol> <li>创建的是 san 项目。</li> <li>app-name 是要创建的工程项目目录，可以为<code>.</code>（即在当前目录下创建）。</li> </ol> </blockquote> <h2 id="%E6%8C%87%E5%AE%9A%E8%84%9A%E6%89%8B%E6%9E%B6%E5%88%9B%E5%BB%BA">指定脚手架创建</h2> <pre class="language-bash"><code class="language-bash">san init <span class="token operator">&lt;</span>template<span class="token operator">></span> <span class="token operator">&lt;</span>app-name<span class="token operator">></span></code></pre> <blockquote> <ol> <li>template 是工程项目脚手架地址，支持 github、icode、gitlab 等 repo 作为脚手架直接创建项目，并且可以指定 template 的 alias，详见下方的 <strong>san remote</strong></li> <li>为了方便，我们创建了一个 San 的基础脚手架 ksky521/san-project，不指定脚手架创建时（即快速创建时），用的就是这个基础脚手架。</li> </ol> </blockquote> <h3 id="%E4%BE%8B%E5%A6%82">例如</h3> <pre class="language-bash"><code class="language-bash"><span class="token comment"># 1. 支持传入完整的 repo 地址:</span>\nsan init ksky521/san-project<span class="token comment">#v4 demo</span>\nsan init https://github.com/ksky521/san-project.git<span class="token comment">#v4 demo</span>\n<span class="token comment"># 2. 默认是从 github repo 安装</span>\n<span class="token comment"># 所以用 git@github.com:ksky521/simple.git 这个 repo 时可以简写成：</span>\nsan init simple demo\n<span class="token comment"># 3. 支持 github、icode、gitlab 等的简写方式</span>\nsan init github:ksky521/san-project<span class="token comment">#v4 demo</span>\nsan init icode:baidu/hulk/san-project-base demo\nsan init coding:ksky521/san-project demo\n<span class="token comment"># 4. 分支写法</span>\nsan init template<span class="token comment">#branch demo</span>\n<span class="token comment"># 5. 项目生成在当前目录</span>\nsan init template<span class="token comment">#branch .</span></code></pre> <h2 id="init-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E"><code>init</code> 参数说明</h2> <ul> <li><code>--ssh</code>：下载脚手架模板时是否使用 SSH，默认使用 HTTP</li> <li><code>--useCache，--cache</code> 优先使用本地已经下载过的脚手架缓存，默认不使用</li> <li><code>--install</code> 初始化成功后，进入目录安装依赖</li> <li><code>--offline</code> 标示 template 是离线脚手架</li> <li><code>--force</code> 跳过提醒，强制删除已存在的目录，默认会提醒</li> <li><code>--username，--u</code> 指定 Git 用户名，默认：git</li> <li><code>--registry</code> 设置 npm registry</li> </ul> </div></div> '}}]);