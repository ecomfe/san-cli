(window.webpackJsonp=window.webpackJsonp||[]).push([[41,20],{0:function(n,s,a){"use strict";a.d(s,"a",(function(){return o}));var t=a(3);const p={};class o extends t.Component{constructor(n){super(n),this.defaultComponents=p}get components(){const n=this.customComponents||{};return Object.assign(n,this.defaultComponents)}set components(n){this.customComponents=n}}},104:function(n,s,a){var t=' <div class="content markdown-content"><div class="markdown"><h1 id="widget-%E9%83%A8%E4%BB%B6">widget 部件</h1> <p>仪表盘部件的工作流程：</p> <p><img src="'+a(4)(a(105))+'" alt=""/></p> <p>前文提到的插件包的目录结构：</p> <pre class="language-js"><code class="language-js"><span class="token punctuation">.</span>\n├── <span class="token constant">README</span><span class="token punctuation">.</span>md\n├── src\n│    └── index<span class="token punctuation">.</span>js <span class="token comment">// 组件注册</span>\n├── <span class="token keyword">package</span><span class="token punctuation">.</span>json\n└── ui<span class="token punctuation">.</span>js         <span class="token comment">// `San CLI UI` 集成（这里存放插件的配置信息）</span></code></pre> <p>实现一个显示在仪表盘的小部件，在ui.js内主要借助两个api：</p> <ul> <li><code>api.registerAddon</code>：注册插件的id并且定义加载的路径。</li> <li><code>api.registerWidget</code>：注册一个 widget 部件，返回小部件的具体配置。</li> </ul> <p>在client端通过<code>ClientAddonApi</code>加载组件定义并挂载到仪表盘视图内，因此在index.js内需要用到:</p> <ul> <li><code>ClientAddonApi.defineComponent</code>：组件定义</li> <li><code>ClientAddonApi.addLocales</code>：组件扩展语言</li> </ul> <h2 id="widget%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91">widget插件开发</h2> <p><code>San CLI UI</code>提供了将自定义组件挂载到项目仪表盘的方式，通过此功能，你可以定制属于自己的个性仪表盘，也可将小工具分享给更多的人使用。</p> <p>插件的实践中，我们将演示一个自定义部件的实现，并显示在仪表盘显示的过程。将新增部件分为三步：<strong>创建工程</strong>-&gt;<strong>本地调试</strong>-&gt;<strong>发布安装</strong></p> <h3 id="%E5%88%9B%E5%BB%BA%E5%B7%A5%E7%A8%8B">创建工程</h3> <p>我们提供了插件创建的脚手架来简化插件的创建过程，脚手架推荐：</p> <ul> <li>插件脚手架：https://github.com/jinzhan/san-cli-plugin-template.git</li> <li>UI插件脚手架：https://github.com/zttonly/san-ui-addon-project.git</li> </ul> <p>在脚手架中预置了插件相关的基础配置，当然用户也可以根据自身习惯，创建自己的脚手架工程。</p> <p>这里我们使用UI插件脚手架，创建一个名为<code>san-cli-ui-widget-hello</code>的工程，使用<code>San CLI UI</code>的创建项目功能，在脚手架地址输入<code>San CLI UI</code>插件脚手架地址，按照步骤执行，完成创建。过程演示如下：</p> <p><img src="https://b.bdstatic.com/searchbox/icms/searchbox/img/widget-create.gif" alt=""/></p> <p>在新创建工程的目录中关键的文件：<code>san.config.js</code>、<code>ui.js</code>、<code>src/index.js</code>中已包含了默认配置，开发者直接修改其中的名称即可。</p> <p>新建的插件包目录结构如下：</p> <pre class="language-js"><code class="language-js">san<span class="token operator">-</span>cli<span class="token operator">-</span>ui<span class="token operator">-</span>widget<span class="token operator">-</span>hello\n├── <span class="token constant">README</span><span class="token punctuation">.</span>md\n├── src\n      ├──components\n│     └── index<span class="token punctuation">.</span>js\n├── <span class="token keyword">package</span><span class="token punctuation">.</span>json\n├── san<span class="token punctuation">.</span>config<span class="token punctuation">.</span>js\n└── ui<span class="token punctuation">.</span>js         <span class="token comment">// San UI 集成（这里存放插件的配置信息）</span></code></pre> <p>我们逐一来看</p> <p>在插件工程的<code>san.config.js</code>中已预置了由<code>San CLI UI</code>提供的默认配置，通过<code>clientAddonConfig</code>可生成<code>san.config.js</code>的默认配置，打包出的代码输出到<code>./dist/index.js</code>。：</p> <pre class="language-js"><code class="language-js"><span class="token keyword">const</span> clientAddonConfig <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-cli-ui/client-addon-config\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token operator">...</span><span class="token function">clientAddonConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n        id<span class="token operator">:</span> <span class="token string">\'san.webpack.client-addon.san-cli-ui-widget-hello\'</span><span class="token punctuation">,</span> <span class="token comment">// 名称唯一</span>\n        port<span class="token operator">:</span> <span class="token number">8890</span> <span class="token comment">// 端口可变</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <blockquote> <p>注意： id应设置正确的命名，且在所有插件中保持唯一； port是本地服务的端口，可修改，但应与ui.js文件中本地服务url保持一致</p> </blockquote> <p><code>ui.js</code>文件已预置了插件加载路径定义和 widget 部件定义：</p> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span><span class="token function-variable function">exports</span> <span class="token operator">=</span> <span class="token parameter">api</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token comment">// 注册组件加载路径 区分生产环境和开发环境</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span><span class="token constant">SAN_CLI_UI_DEV</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// 开发环境</span>\n        api<span class="token punctuation">.</span><span class="token function">registerAddon</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n            id<span class="token operator">:</span> <span class="token string">\'san.widget.san-cli-ui-widget-hello.client-addon.dev\'</span><span class="token punctuation">,</span>\n            url<span class="token operator">:</span> <span class="token string">\'http://localhost:8890/index.js\'</span> <span class="token comment">// 开发环境地址，也即本地服务地址</span>\n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">// 生产环境</span>\n        api<span class="token punctuation">.</span><span class="token function">registerAddon</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n            id<span class="token operator">:</span> <span class="token string">\'san.widget.san-cli-ui-widget-hello.client-addon\'</span><span class="token punctuation">,</span> <span class="token comment">// 唯一id，推荐增加类型前缀\'san.widgets\'</span>\n            path<span class="token operator">:</span> <span class="token string">\'san-cli-ui-widget-hello/dist\'</span> <span class="token comment">// 生产环境指向本插件包的编译产出地址</span>\n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token comment">// 接下来注册widget</span>\n    api<span class="token punctuation">.</span><span class="token function">registerWidget</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n        id<span class="token operator">:</span> <span class="token string">\'san.san-cli-ui-widget-hello.widget-demo\'</span><span class="token punctuation">,</span> <span class="token comment">// 命名不重复即可</span>\n        title<span class="token operator">:</span> <span class="token string">\'san-cli-ui-widget-hello.title\'</span><span class="token punctuation">,</span> <span class="token comment">// locales定义的文案</span>\n        description<span class="token operator">:</span> <span class="token string">\'san-cli-ui-widget-hello.description\'</span><span class="token punctuation">,</span>\n        icon<span class="token operator">:</span> <span class="token string">\'smile\'</span><span class="token punctuation">,</span> <span class="token comment">// santd的icon类型</span>\n        component<span class="token operator">:</span> <span class="token string">\'san.widget.components.widget-demo\'</span><span class="token punctuation">,</span> <span class="token comment">// 指定显示的组件id, 值对应src/index.js注册的组件名</span>\n        <span class="token comment">// 接下来具体组件的配置信息</span>\n        minWidth<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n        minHeight<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n        maxWidth<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n        maxHeight<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n        maxCount<span class="token operator">:</span> <span class="token number">1</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <blockquote> <p>注意开发环境下的url<code>http://localhost:8890/index.js</code>其中端口应与san.config.js端口一致</p> </blockquote> <p>在<code>src/index.js</code>中也定义了一个显示在client端的组件：</p> <pre class="language-js"><code class="language-js"><span class="token keyword">import</span> widgetdemo <span class="token keyword">from</span> <span class="token string">\'./components/widget-demo\'</span><span class="token punctuation">;</span>\n<span class="token keyword">import</span> locales <span class="token keyword">from</span> <span class="token string">\'./locales.json\'</span><span class="token punctuation">;</span>\n\n<span class="token comment">/* global ClientAddonApi */</span>\n<span class="token keyword">if</span> <span class="token punctuation">(</span>window<span class="token punctuation">.</span>ClientAddonApi<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 扩展语言</span>\n    ClientAddonApi<span class="token punctuation">.</span><span class="token function">addLocales</span><span class="token punctuation">(</span>locales<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token comment">// 推荐以类型前缀定义组件的唯一id：\'san.widget\'</span>\n    ClientAddonApi<span class="token punctuation">.</span><span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token string">\'san.widget.components.widget-demo\'</span><span class="token punctuation">,</span> widgetdemo<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span></code></pre> <p>其中的<code>widgetdemo</code>是按照san组件规范定义的一个san组件，在<code>San CLI UI</code>中扩展了santd组件预置，因此可直接使用santd组件，无需重复定义，例如santd的icon组件<code>&lt;s-icon /&gt;</code>：</p> <pre class="language-js"><code class="language-js"><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>\n    template<span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">\n        &lt;div class="widget-demo">\n            &lt;div>&#123;&#123;hello}}&lt;/div>\n            &lt;div>&#123;&#123;$t(\'san-cli-ui-widget-hello.welcome\')}}&lt;/div>\n            &lt;s-icon type="file" style="font-size: 32px"/>\n        &lt;/div>\n    </span><span class="token template-punctuation string">`</span></span><span class="token punctuation">,</span>\n    <span class="token function">initData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">return</span> <span class="token punctuation">{</span>\n            hello<span class="token operator">:</span> <span class="token string">\'hello san ui widget\'</span>\n        <span class="token punctuation">}</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <p>在开发 addon 组件过程中，会涉及到以下 API：</p> <ul> <li><code>api.registerAddon</code>：addon 组件注册</li> <li><code>api.registerWidget</code>：widget 部件注册</li> <li><code>api.callAction</code>：事件调用</li> <li><code>api.onAction</code>：事件监听</li> <li><code>ClientAddonApi.defineComponent</code>：组件定义</li> <li><code>ClientAddonApi.addLocales</code>：组件扩展语言</li> </ul> <p>组件实现可参考<a href="https://ecomfe.github.io/san-cli/#/ui/start" target="_blank">文档</a>以及已有插件<a href="https://github.com/amazing-js/san-cli-ui-widget-tiny-image" target="_blank">图片压缩插件</a></p> <h3 id="%E6%9C%AC%E5%9C%B0%E8%B0%83%E8%AF%95">本地调试</h3> <h4 id="1.-%E5%90%AF%E5%8A%A8%E6%9C%AC%E5%9C%B0%E6%9C%8D%E5%8A%A1">1. 启动本地服务</h4> <p>在<code>san-cli-ui-widget-hello</code>插件工程中执行<code>npm start</code>或在<code>San CLI UI</code>启动的界面中，打开<code>san-cli-ui-widget-hello</code>工程，点击任务管理-&gt;start任务-&gt;运行，来启动start任务。</p> <h4 id="2.-%E4%BF%AE%E6%94%B9%E6%8F%92%E4%BB%B6%E7%9A%84ui.js">2. 修改插件的ui.js</h4> <p>这步主要是将加载环境置为开发环境，暂时注释掉生产环境的加载条件判断：</p> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span><span class="token function-variable function">exports</span> <span class="token operator">=</span> <span class="token parameter">api</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token comment">// 注册组件加载路径 区分生产环境和开发环境</span>\n    <span class="token comment">// if (process.env.SAN_CLI_UI_DEV) { // 开发环境</span>\n        api<span class="token punctuation">.</span><span class="token function">registerAddon</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n            id<span class="token operator">:</span> <span class="token string">\'san.widget.san-cli-ui-widget-hello.client-addon.dev\'</span><span class="token punctuation">,</span>\n            url<span class="token operator">:</span> <span class="token string">\'http://localhost:8890/index.js\'</span> <span class="token comment">// 开发环境地址，也即本地服务地址</span>\n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token comment">// }</span>\n    <span class="token comment">// else { // 生产环境</span>\n    <span class="token comment">//     api.registerAddon({</span>\n    <span class="token comment">//         id: \'san.widget.san-cli-ui-widget-hello.client-addon\', // 唯一id，推荐增加类型前缀\'san.widgets\'</span>\n    <span class="token comment">//         path: \'san-cli-ui-widget-hello/dist\' // 生产环境指向本插件包的编译产出地址</span>\n    <span class="token comment">//     });</span>\n    <span class="token comment">// }</span>\n    <span class="token operator">...</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <h4 id="3.-%E5%9C%A8%E8%B0%83%E8%AF%95%E5%B7%A5%E7%A8%8B%E4%B8%AD%E5%8A%A0%E5%85%A5%E6%96%B0%E6%8F%92%E4%BB%B6%E7%9A%84%E4%BE%9D%E8%B5%96">3. 在调试工程中加入新插件的依赖</h4> <p>现在我们已经有了一个插件工程<code>san-cli-ui-widget-hello</code>。</p> <p>找到一个本地san工程用于调试，例如名称为<code>san-local</code>，在<code>san-local</code>的package.json增加插件依赖:</p> <pre class="language-json"><code class="language-json"><span class="token comment">// package.json</span>\n<span class="token punctuation">{</span>\n  <span class="token property">"name"</span><span class="token operator">:</span> <span class="token string">"san-local"</span><span class="token punctuation">,</span>\n  ...\n  <span class="token property">"devDependencies"</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token property">"san-cli-ui-widget-hello"</span><span class="token operator">:</span> <span class="token string">"file:../san-cli-ui-widget-hello"</span><span class="token punctuation">,</span>\n    ...\n  <span class="token punctuation">}</span><span class="token punctuation">,</span>\n  <span class="token property">"dependencies"</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span></code></pre> <p>注意这里采用的是本地文件的方式。</p> <h4 id="4.-%E8%B0%83%E8%AF%95%E5%B7%A5%E7%A8%8B%E5%86%85%E5%AE%89%E8%A3%85%E6%8F%92%E4%BB%B6">4. 调试工程内安装插件</h4> <p>在<code>san-local</code>工程内执行<code>npm i</code>，安装新添加的依赖。</p> <h4 id="5.-%E6%9F%A5%E7%9C%8B%E6%95%88%E6%9E%9C">5. 查看效果</h4> <p>依赖安装完成，在<code>San CLI UI</code>界面中打开<code>san-local</code>工程的仪表盘即可看到效果。</p> <p><img src="https://b.bdstatic.com/searchbox/icms/searchbox/img/widget-debug.gif" alt=""/></p> <h3 id="%E5%8F%91%E5%B8%83%E5%AE%89%E8%A3%85">发布安装</h3> <p><code>san-cli-ui-widget-hello</code>调试完毕后，恢复<code>ui.js</code>内注释的内容，执行<code>npm run build</code> + <code>npm publish</code>完成包的发布。</p> <p>在<code>San CLI UI</code>的插件管理中搜索到刚发布的插件，安装后即可使用了。</p> </div></div> ';n.exports=t},105:function(n,s,a){"use strict";a.r(s),s.default=a.p+"static/img/widget.png"},137:function(n,s,a){var t=a(1),p=a(104),o=a(39).default;n.exports=a(39),n.exports.default=t(o,p,[])},39:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return c}));var t,p,o,e=a(0);class c extends e.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"widget插件开发",hash:"widget%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91",children:[{level:3,title:"创建工程",hash:"%E5%88%9B%E5%BB%BA%E5%B7%A5%E7%A8%8B"},{level:3,title:"本地调试",hash:"%E6%9C%AC%E5%9C%B0%E8%B0%83%E8%AF%95"},{level:3,title:"发布安装",hash:"%E5%8F%91%E5%B8%83%E5%AE%89%E8%A3%85"}]}]})}}o={},(p="components")in(t=c)?Object.defineProperty(t,p,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[p]=o}.call(this,a(2))},4:function(n,s,a){"use strict";n.exports=function(n,s){return s||(s={}),"string"!=typeof(n=n&&n.__esModule?n.default:n)?n:(s.hash&&(n+=s.hash),s.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(n)?'"'.concat(n,'"'):n)}}}]);