(window.webpackJsonp=window.webpackJsonp||[]).push([[58,18],{121:function(n,a,s){var t=s(1),p=s(70),e=s(23).default;n.exports=s(23),n.exports.default=t(e,p,[])},23:function(n,a,s){"use strict";s.r(a),function(n){s.d(a,"default",(function(){return c}));var t,p,e,o=s(0);class c extends o.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"Hulk Mock Server",hash:"hulk-mock-server"},{level:2,title:"配置举例",hash:"%E9%85%8D%E7%BD%AE%E4%B8%BE%E4%BE%8B"}]})}}e={},(p="components")in(t=c)?Object.defineProperty(t,p,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[p]=e}.call(this,s(2))},70:function(n,a){n.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="smarty-%E7%9B%B8%E5%85%B3">Smarty 相关</h1> <p>要使用 Smarty 的 PHP 模板，可以配置<a href="https://www.npmjs.com/package/hulk-mock-server" target="_blank">Hulk Mock Server</a> 。</p> <h2 id="hulk-mock-server">Hulk Mock Server</h2> <p>Mock Server 实现涉及到的代码和说明：</p> <pre class="language-text"><code class="language-text">├── mock    mock 文件\n│   ├── _data_  这里是 JSON 数据，跟 template 目录结构一致，支持 Mockjs 语法（**.mock.json）\n│   └── index.js 配置文件\n├── scripts\n│   ├── dev.js</code></pre> <p><code>dev.js</code>中会启动<code>webpackDevServer</code>和<code>hotReload</code>功能，DevServer 会将请求转发到 MockServer，MockServer （代码在<code>middlewares/mocker.js</code>）包含两部分：<code>nodeServer</code>和<code>smartyServer</code>，node 遵循<a href="https://github.com/jaywcjlove/webpack-api-mocker/" target="_blank"><code>webpack-api-mocker</code></a>文档，<code>smartyServer</code>是 node 执行<code>php</code>命令行渲染 smarty 模板，然后将 stdout 作为输出。</p> <p>smarty 支持的配置有：<code>baseDir=./template&amp;bin=php&amp;dataDir=mockDir/_mockdata_</code></p> <ul> <li>baseDir：template 路径，会传递给 smarty-&gt;setTempalteDir</li> <li>bin：php bin 的路径，默认会使用 node 的 which 查找 php</li> <li>dataDir：模板数据来源目录，默认是 rootDir 的 <code>_data_</code>目录</li> </ul> <p>使用 Smarty 模板，则通过<code>template</code>文件夹下面的 tpl 进行渲染，全部继承<code>base.tpl</code>模板，本地开发通过<code>localhost:port/template</code>访问</p> <h2 id="%E9%85%8D%E7%BD%AE%E4%B8%BE%E4%BE%8B">配置举例</h2> <pre class="language-js"><code class="language-js"><span class="token keyword">const</span> plugins <span class="token operator">=</span> <span class="token punctuation">[</span>\n    <span class="token punctuation">{</span>\n        id<span class="token operator">:</span> <span class="token string">\'middleware1\'</span><span class="token punctuation">,</span>\n        <span class="token function">apply</span><span class="token punctuation">(</span><span class="token parameter">api</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token comment">// 使用 api 配置dev server 中间件</span>\n            api<span class="token punctuation">.</span><span class="token function">middleware</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>\n                <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'hulk-mock-server\'</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n                    <span class="token comment">// 配置contentBase</span>\n                    contentBase<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./\'</span> <span class="token operator">+</span> outputDir <span class="token operator">+</span> <span class="token string">\'/\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                    <span class="token comment">// 配置 mock 路径</span>\n                    rootDir<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./mock\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                    <span class="token comment">// 配置解析器相关内容</span>\n                    processors<span class="token operator">:</span> <span class="token punctuation">[</span>\n                        <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">smarty?router=/template/*&amp;baseDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>\n                            __dirname<span class="token punctuation">,</span>\n                            <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">./</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>outputDir<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">/template</span><span class="token template-punctuation string">`</span></span>\n                        <span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">&amp;dataDir=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./mock/_data_\'</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span>\n                    <span class="token punctuation">]</span> <span class="token comment">// eslint-disable-line</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span>\n            <span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">]</span><span class="token punctuation">;</span>\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    plugins\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> </div></div> '}}]);