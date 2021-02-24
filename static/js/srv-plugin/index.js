!function(n){function a(a){for(var t,e,c=a[0],i=a[1],l=a[2],k=0,r=[];k<c.length;k++)e=c[k],Object.prototype.hasOwnProperty.call(p,e)&&p[e]&&r.push(p[e][0]),p[e]=0;for(t in i)Object.prototype.hasOwnProperty.call(i,t)&&(n[t]=i[t]);for(u&&u(a);r.length;)r.shift()();return o.push.apply(o,l||[]),s()}function s(){for(var n,a=0;a<o.length;a++){for(var s=o[a],t=!0,c=1;c<s.length;c++){var i=s[c];0!==p[i]&&(t=!1)}t&&(o.splice(a--,1),n=e(e.s=s[0]))}return n}var t={},p={20:0,61:0},o=[];function e(a){if(t[a])return t[a].exports;var s=t[a]={i:a,l:!1,exports:{}};return n[a].call(s.exports,s,s.exports,e),s.l=!0,s.exports}e.e=function(){return Promise.resolve()},e.m=n,e.c=t,e.d=function(n,a,s){e.o(n,a)||Object.defineProperty(n,a,{enumerable:!0,get:s})},e.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},e.t=function(n,a){if(1&a&&(n=e(n)),8&a)return n;if(4&a&&"object"==typeof n&&n&&n.__esModule)return n;var s=Object.create(null);if(e.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:n}),2&a&&"string"!=typeof n)for(var t in n)e.d(s,t,function(a){return n[a]}.bind(null,t));return s},e.n=function(n){var a=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(a,"a",a),a},e.o=function(n,a){return Object.prototype.hasOwnProperty.call(n,a)},e.p="";var c=window.webpackJsonp=window.webpackJsonp||[],i=c.push.bind(c);c.push=a,c=c.slice();for(var l=0;l<c.length;l++)a(c[l]);var u=i;o.push([129,0]),s()}({129:function(n,a,s){var t=s(1),p=s(82),o=s(30).default;n.exports=s(30),n.exports.default=t(o,p,[])},30:function(n,a,s){"use strict";s.r(a),function(n){s.d(a,"default",(function(){return c}));var t,p,o,e=s(0);class c extends e.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"插件的apply函数",hash:"%E6%8F%92%E4%BB%B6%E7%9A%84apply%E5%87%BD%E6%95%B0"},{level:2,title:"在插件内修改 Webpack 配置",hash:"%E5%9C%A8%E6%8F%92%E4%BB%B6%E5%86%85%E4%BF%AE%E6%94%B9-webpack-%E9%85%8D%E7%BD%AE"},{level:2,title:"插件的使用",hash:"%E6%8F%92%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8"},{level:2,title:"Service 插件 API",hash:"service-%E6%8F%92%E4%BB%B6-api"}]})}}o={},(p="components")in(t=c)?Object.defineProperty(t,p,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[p]=o}.call(this,s(2))},82:function(n,a){n.exports=' <div class="content"><div class="markdown"><h1 id="%E7%BC%96%E5%86%99%E4%B8%80%E4%B8%AA-serivce-%E6%8F%92%E4%BB%B6"><a class="header-anchor" href="#%E7%BC%96%E5%86%99%E4%B8%80%E4%B8%AA-serivce-%E6%8F%92%E4%BB%B6">#</a> 编写一个 Serivce 插件</h1> <p>San CLI 在实现可扩展 Webpack 配置的设计上，借鉴了 Vue CLI 的 Service 机制。Service 主要是对 Webpack 的配置进行统一处理和封装，当 Service 实例化之时，会依次将 Service 的插件进行注册执行，对 Webpack 的配置进行修改。</p> <p>一个 Service 插件的定义结构如下：</p> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 插件 id</span>\n    id<span class="token operator">:</span> <span class="token string">\'plugin-id\'</span><span class="token punctuation">,</span>\n    <span class="token comment">// 插件的入口函数</span>\n    <span class="token function">apply</span><span class="token punctuation">(</span><span class="token parameter">api<span class="token punctuation">,</span> projectOptions<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        api<span class="token punctuation">.</span><span class="token function">chainWebpack</span><span class="token punctuation">(</span><span class="token parameter">webpackConfig</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n            console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>projectOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>\n            webpackConfig<span class="token punctuation">.</span><span class="token function">entry</span><span class="token punctuation">(</span><span class="token comment">/*...*/</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// gui 预留接口</span>\n    <span class="token function">ui</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <h2 id="%E6%8F%92%E4%BB%B6%E7%9A%84apply%E5%87%BD%E6%95%B0"><a class="header-anchor" href="#%E6%8F%92%E4%BB%B6%E7%9A%84apply%E5%87%BD%E6%95%B0">#</a> 插件的<code>apply</code>函数</h2> <p>插件的<code>apply</code>函数接受三个参数：</p> <ol> <li><code>api</code>是 PluginAPI 实例，会提供一些 api（下面详细介绍）；</li> <li><code>projectOptions</code>是 san.config.js 处理后的项目配置；</li> <li><code>options</code> 是插件自己的参数，使用插件时：</li> </ol> <pre class="language-js"><code class="language-js"><span class="token comment">// san.config.js</span>\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    plugins<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token function">requie</span><span class="token punctuation">(</span><span class="token string">\'plugin\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>options<span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">]</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token comment">// 或者使用 service addPlugin</span>\nserviceInstance<span class="token punctuation">.</span><span class="token function">addPlugin</span><span class="token punctuation">(</span><span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'plugin\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span> options<span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <blockquote> <p>在插件中，可以直接使用<code>__isProduction</code>变量，代表是否为<code>mode===\'production\'</code>，即生产环境打包。</p> </blockquote> <h2 id="%E5%9C%A8%E6%8F%92%E4%BB%B6%E5%86%85%E4%BF%AE%E6%94%B9-webpack-%E9%85%8D%E7%BD%AE"><a class="header-anchor" href="#%E5%9C%A8%E6%8F%92%E4%BB%B6%E5%86%85%E4%BF%AE%E6%94%B9-webpack-%E9%85%8D%E7%BD%AE">#</a> 在插件内修改 Webpack 配置</h2> <p>在插件内有两种方法可以修改 Webpack 配置：</p> <ol> <li>通过<code>api.chainWebpack</code>获取<a href="https://github.com/neutrinojs/webpack-chain" target="_blank">webpack-chain</a>链式调用的对象，然后进行 Webpack 配置；</li> <li>通过<code>api.configWebpack</code>获取对象形式的 Webpack Config。</li> </ol> <p>例如：</p> <pre class="language-js"><code class="language-js">api<span class="token punctuation">.</span><span class="token function">chainWebpack</span><span class="token punctuation">(</span><span class="token parameter">webpackChain</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>projectOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    webpackChain<span class="token punctuation">.</span><span class="token function">entry</span><span class="token punctuation">(</span><span class="token comment">/*...*/</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\napi<span class="token punctuation">.</span><span class="token function">configWebpack</span><span class="token punctuation">(</span><span class="token parameter">webpackConfig</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>projectOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>webpackConfig<span class="token punctuation">.</span>entry<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <h2 id="%E6%8F%92%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8"><a class="header-anchor" href="#%E6%8F%92%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8">#</a> 插件的使用</h2> <p>插件可以发布到 npm 上，命名规范建议使用<code>san-cli-plugin-*</code>来命名。不发布到 npm 中也可以本地使用。Service 插件的使用有两种配置方法：</p> <ol> <li>在<code>san.config.js</code>的 plugins 字段添加对应的路径或者直接<code>require</code>进来；</li> <li>在项目的<code>package.json</code>的<code>san.plugins</code>中添加路径或者 npm 插件包名</li> </ol> <p>san.config.js 中举例：</p> <pre class="language-js"><code class="language-js"><span class="token comment">// san.config.js 文件</span>\n\n<span class="token keyword">const</span> plugins <span class="token operator">=</span> <span class="token punctuation">[</span>\n    <span class="token comment">// 这个是直接手写的 plugin</span>\n    <span class="token punctuation">{</span>\n        id<span class="token operator">:</span> <span class="token string">\'smarty-middleware\'</span><span class="token punctuation">,</span>\n        <span class="token function">apply</span><span class="token punctuation">(</span><span class="token parameter">api</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            api<span class="token punctuation">.</span><span class="token function">middleware</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>\n                <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'hulk-mock-server\'</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n                    contentBase<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./\'</span> <span class="token operator">+</span> outputDir <span class="token operator">+</span> <span class="token string">\'/\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                    rootDir<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./mock\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                    processors<span class="token operator">:</span> <span class="token punctuation">[</span>\n                        <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">smarty?router=/template/*&amp;baseDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>\n                            __dirname<span class="token punctuation">,</span>\n                            <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">./</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>outputDir<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">/template</span><span class="token template-punctuation string">`</span></span>\n                        <span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">&amp;dataDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./mock/_data_\'</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span>\n                    <span class="token punctuation">]</span> <span class="token comment">// eslint-disable-line</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span>\n            <span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// require进来</span>\n    <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-cli-plugin-x\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n    <span class="token comment">// 这个是相对路径</span>\n    <span class="token string">\'./san-plugin\'</span>\n<span class="token punctuation">]</span><span class="token punctuation">;</span>\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">//...</span>\n    <span class="token comment">// 添加插件配置</span>\n    plugins\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <h2 id="service-%E6%8F%92%E4%BB%B6-api"><a class="header-anchor" href="#service-%E6%8F%92%E4%BB%B6-api">#</a> Service 插件 API</h2> <p>属性：</p> <ul> <li><code>.id</code>：插件 id；</li> <li><code>.service</code>：service 实例；</li> <li><code>.log/logger</code>：日志对象，包含： <ul> <li>debug</li> <li>done</li> <li>error</li> <li>warn</li> <li>log</li> <li>fatal</li> <li>trace</li> <li>time</li> <li>timeEnd</li> <li>textColor</li> <li>bgColor 等；</li> </ul> </li> <li><code>.version</code>：San CLI 版本号。</li> </ul> <p>常见方法包括：</p> <ul> <li><code>.isProd()</code>：是不是生产环境打包，<code>process.NODD_ENV===\'production\'</code>；</li> <li><code>.configWebpack(fn)</code>：将<code>fn</code> 压入 webpackConfig 回调栈，<code>fn</code>会在出栈执行时接收 webpackConfig，用于修改 webpack config；</li> <li><code>.chainWebpack(fn)</code>：将<code>fn</code> 压入 webpackChain 回调栈，<code>fn</code>会在出栈执行时接收 chainableConfig，用于 webpack-chain 语法修改 webpack config；</li> <li><code>.resolve(p)</code>：获取 CLI 执行目录的完整路径；</li> <li><code>.getWebpackChainConfig()</code>：获取 webpack-chain 格式的 config；</li> <li><code>.getWebpackConfig([chainableConfig])</code>：将传入的 webpack-chain 格式 config 处理成 webpackConfig 返回；</li> <li><code>.getCwd()</code>：获取 CLI 的执行目录；</li> <li><code>.getProjectOption()</code>：获取项目的配置内容；</li> <li><code>.getPkg()</code>：获取当前项目<code>package.json</code>内容；</li> <li><code>.addPlugin(plugin, options)</code>：添加插件；</li> <li><code>.middleware()</code>：添加 dev-server 中间件，<strong>这里注意：中间件需要使用 factory 函数返回</strong></li> </ul> <p><strong><code>.middleware()</code>示例：</strong></p> <pre class="language-js"><code class="language-js">api<span class="token punctuation">.</span><span class="token function">middleware</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>\n    <span class="token comment">// return 一个 Expressjs 中间件</span>\n    <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'hulk-mock-server\'</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n        contentBase<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./\'</span> <span class="token operator">+</span> outputDir <span class="token operator">+</span> <span class="token string">\'/\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n        rootDir<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./mock\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n        processors<span class="token operator">:</span> <span class="token punctuation">[</span>\n            <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">smarty?router=/template/*&amp;baseDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">./</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>outputDir<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">/template</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">&amp;dataDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>\n                __dirname<span class="token punctuation">,</span>\n                <span class="token string">\'./mock/_data_\'</span>\n            <span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span>\n        <span class="token punctuation">]</span> <span class="token comment">// eslint-disable-line</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <blockquote> <p>详细的使用方法可以查看<code>san-cli-plugin-progress</code>的代码。</p> </blockquote> </div></div> '}});