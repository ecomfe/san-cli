(window.webpackJsonp=window.webpackJsonp||[]).push([[52,10],{126:function(n,s,a){var p=a(1),t=a(79),o=a(27).default;n.exports=a(27),n.exports.default=p(o,t,[])},27:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return c}));var p,t,o,e=a(0);class c extends e.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"脚手架项目必备的基础目录结构",hash:"%E8%84%9A%E6%89%8B%E6%9E%B6%E9%A1%B9%E7%9B%AE%E5%BF%85%E5%A4%87%E7%9A%84%E5%9F%BA%E7%A1%80%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84"},{level:2,title:"meta.js/meta.json",hash:"meta.js%2Fmeta.json"},{level:2,title:"san.config.js",hash:"san.config.js"},{level:2,title:"相关 dot 文件",hash:"%E7%9B%B8%E5%85%B3-dot-%E6%96%87%E4%BB%B6"}]})}}o={},(t="components")in(p=c)?Object.defineProperty(p,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):p[t]=o}.call(this,a(2))},79:function(n,s){n.exports=' <div class="content"><div class="markdown"><h1 id="%E5%A6%82%E4%BD%95%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E8%84%9A%E6%89%8B%E6%9E%B6%E9%A1%B9%E7%9B%AE">如何创建一个脚手架项目</h1> <p>日常开发中，团队可以创建自己的项目脚手架，本文将介绍脚手架创建的方法。</p> <h2 id="%E8%84%9A%E6%89%8B%E6%9E%B6%E9%A1%B9%E7%9B%AE%E5%BF%85%E5%A4%87%E7%9A%84%E5%9F%BA%E7%A1%80%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84">脚手架项目必备的基础目录结构</h2> <pre class="language-text"><code class="language-text">├── template            # 模板目录结构\n│   ├── san.config.js   # cli配置项\n└── meta.js/meta.json   # 模板创建 prompt 交互问题</code></pre> <p>San CLI 使用 handlerbars 渲染 template 目录，所以脚手架请使用 handlerbars 语法。</p> <h2 id="meta.js%2Fmeta.json">meta.js/meta.json</h2> <p>回答的内容会作为模板数据来处理文件</p> <h5 id="meta.js">meta.js</h5> <pre class="language-js"><code class="language-js"><span class="token comment">// meta 配置项</span>\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 生成器会将 handlerbars 语法填上 prompts 内容</span>\n    <span class="token comment">// 扩展 handlerbars helper</span>\n    helpers<span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// 过滤满足 value 跳转的目录 key，不做生成处理</span>\n    filters<span class="token operator">:</span> <span class="token punctuation">{</span>\n        <span class="token string">\'mock/**\'</span><span class="token operator">:</span> <span class="token string">\'useMock\'</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// 脚手架交互问答</span>\n    prompts<span class="token operator">:</span> <span class="token punctuation">{</span>\n        name<span class="token operator">:</span> <span class="token punctuation">{</span>\n            type<span class="token operator">:</span> <span class="token string">\'string\'</span><span class="token punctuation">,</span>\n            required<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n            label<span class="token operator">:</span> <span class="token string">\'项目名称\'</span><span class="token punctuation">,</span>\n            <span class="token comment">// 默认 &#123;&#123;name}} 会被替换成init 命令的目录名</span>\n            <span class="token comment">// 类似还有username、email 等 git 配置</span>\n            <span class="token keyword">default</span><span class="token operator">:</span> <span class="token string">\'&#123;&#123;name}}\'</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        useMock<span class="token operator">:</span> <span class="token punctuation">{</span>\n            type<span class="token operator">:</span> <span class="token string">\'confirm\'</span><span class="token punctuation">,</span>\n            message<span class="token operator">:</span> <span class="token string">\'使用 mock 数据？\'</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// San CLI 默认使用 yarn 安装依赖，若要使用 npm，则需把 useYarn 置为 false</span>\n    useYarn<span class="token operator">:</span> <span class="token boolean">false</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <h5 id="meta.json">meta.json</h5> <pre class="language-json"><code class="language-json"><span class="token punctuation">{</span>\n    <span class="token comment">// meta 配置项</span>\n<span class="token punctuation">}</span></code></pre> <h5 id="%E9%85%8D%E7%BD%AE%E9%A1%B9">配置项</h5> <p><code>helpers</code> 自定义 handlerbars 的块级 helper，cli 会调用 registerHelper，处理这段自定义</p> <p><strong>例如</strong></p> <pre class="language-js"><code class="language-js"><span class="token comment">// meta.js</span>\n<span class="token punctuation">{</span>\n    helpers<span class="token operator">:</span> <span class="token punctuation">{</span>\n        <span class="token function-variable function">if_or</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">v1<span class="token punctuation">,</span> v2<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n            <span class="token keyword">if</span> <span class="token punctuation">(</span>v1 <span class="token operator">||</span> v2<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token keyword">return</span> options<span class="token punctuation">.</span><span class="token function">fn</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token punctuation">}</span>\n            <span class="token keyword">return</span> options<span class="token punctuation">.</span><span class="token function">inverse</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre> <p><code>filters</code> 过滤满足 value 跳转的目录 key，不做渲染处理</p> <p><strong>例如</strong></p> <pre class="language-js"><code class="language-js"><span class="token comment">// meta.js</span>\n<span class="token punctuation">{</span>\n    filters<span class="token operator">:</span> <span class="token punctuation">{</span>\n        <span class="token string">\'mock/**\'</span><span class="token operator">:</span> <span class="token string">\'tplEngine!=="smarty"\'</span><span class="token punctuation">,</span>\n        <span class="token string">\'template/**\'</span><span class="token operator">:</span> <span class="token string">\'tplEngine!=="smarty"\'</span><span class="token punctuation">,</span>\n        <span class="token string">\'template/demo-store/**\'</span><span class="token operator">:</span> <span class="token string">\'!demo || (demo &amp;&amp; demoType!=="store")\'</span><span class="token punctuation">,</span>\n        <span class="token string">\'template/demo/**\'</span><span class="token operator">:</span> <span class="token string">\'!demo || (demo &amp;&amp; demoType!=="normal")\'</span><span class="token punctuation">,</span>\n        <span class="token string">\'src/pages/demo-store/**\'</span><span class="token operator">:</span> <span class="token string">\'!demo || (demo &amp;&amp; demoType!=="store")\'</span><span class="token punctuation">,</span>\n        <span class="token string">\'src/pages/demo/**\'</span><span class="token operator">:</span> <span class="token string">\'!demo || (demo &amp;&amp; demoType!=="normal")\'</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre> <p><code>prompts</code> 交互问答，key 为问题名称（string 类型），value 为问题配置项（Object 类型）</p> <p><strong>例如</strong></p> <pre class="language-js"><code class="language-js"><span class="token comment">// meta.js</span>\n<span class="token punctuation">{</span>\n    prompts<span class="token operator">:</span> <span class="token punctuation">{</span>\n        name<span class="token operator">:</span> <span class="token punctuation">{</span>\n            type<span class="token operator">:</span> <span class="token string">\'string\'</span><span class="token punctuation">,</span>\n            required<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n            label<span class="token operator">:</span> <span class="token string">\'项目名称\'</span><span class="token punctuation">,</span>\n            <span class="token keyword">default</span><span class="token operator">:</span> <span class="token string">\'&#123;&#123;name}}\'</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        tplEngine<span class="token operator">:</span> <span class="token punctuation">{</span>\n            type<span class="token operator">:</span> <span class="token string">\'select\'</span><span class="token punctuation">,</span>\n            message<span class="token operator">:</span> <span class="token string">\'选择模板引擎\'</span><span class="token punctuation">,</span>\n            choices<span class="token operator">:</span> <span class="token punctuation">[</span>\n                <span class="token punctuation">{</span>\n                    title<span class="token operator">:</span> <span class="token string">\'Smarty（百度内部）\'</span><span class="token punctuation">,</span>\n                    value<span class="token operator">:</span> <span class="token string">\'smarty\'</span>\n                <span class="token punctuation">}</span><span class="token punctuation">,</span>\n                <span class="token punctuation">{</span>\n                    title<span class="token operator">:</span> <span class="token string">\'纯 HTML\'</span><span class="token punctuation">,</span>\n                    value<span class="token operator">:</span> <span class="token string">\'html\'</span>\n                <span class="token punctuation">}</span>\n            <span class="token punctuation">]</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        demo<span class="token operator">:</span> <span class="token punctuation">{</span>\n            type<span class="token operator">:</span> <span class="token string">\'confirm\'</span><span class="token punctuation">,</span>\n            message<span class="token operator">:</span> <span class="token string">\'安装demo示例？\'</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        demoType<span class="token operator">:</span> <span class="token punctuation">{</span>\n            when<span class="token operator">:</span> <span class="token string">\'demo\'</span><span class="token punctuation">,</span>\n            type<span class="token operator">:</span> <span class="token string">\'select\'</span><span class="token punctuation">,</span>\n            message<span class="token operator">:</span> <span class="token string">\'选择示例代码类型：\'</span><span class="token punctuation">,</span>\n            choices<span class="token operator">:</span> <span class="token punctuation">[</span>\n                <span class="token punctuation">{</span>\n                    title<span class="token operator">:</span> <span class="token string">\'san-store (推荐)\'</span><span class="token punctuation">,</span>\n                    value<span class="token operator">:</span> <span class="token string">\'store\'</span>\n                <span class="token punctuation">}</span><span class="token punctuation">,</span>\n                <span class="token punctuation">{</span>\n                    title<span class="token operator">:</span> <span class="token string">\'normal\'</span><span class="token punctuation">,</span>\n                    value<span class="token operator">:</span> <span class="token string">\'normal\'</span>\n                <span class="token punctuation">}</span>\n            <span class="token punctuation">]</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre> <h2 id="san.config.js">san.config.js</h2> <p>san.config.js 是 San-CLI 的配置文件，配置格式<a href="/san-cli/config/">参考</a></p> <h2 id="%E7%9B%B8%E5%85%B3-dot-%E6%96%87%E4%BB%B6">相关 dot 文件</h2> <p>模板中的<code>_xxx</code>文件会在安装之后，转换成<code>.xxx</code>文件，例如<code>template/_babelrc</code>经过<code>san init</code>之后，会变成<code>.babelrc</code>。</p> <p>常见 dot 文件：</p> <ul> <li>babelrc：babel 配置</li> <li>editorconfig：常见规范类的配置</li> <li>npmrc：npm 配置</li> <li>prettierrc：格式化插件</li> <li>gitignore：git 忽略</li> <li>fecsrc：fecs 格式化配置</li> </ul> </div></div> '}}]);