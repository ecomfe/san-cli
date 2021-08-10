(window.webpackJsonp=window.webpackJsonp||[]).push([[39,4],{0:function(e,t,l){"use strict";l.d(t,"a",(function(){return n}));var o=l(3);const s={};class n extends o.Component{constructor(e){super(e),this.defaultComponents=s}get components(){const e=this.customComponents||{};return Object.assign(e,this.defaultComponents)}set components(e){this.customComponents=e}}},113:function(e,t,l){var o=l(1),s=l(60),n=l(15).default;e.exports=l(15),e.exports.default=o(n,s,[])},15:function(e,t,l){"use strict";l.r(t),function(e){l.d(t,"default",(function(){return i}));var o,s,n,a=l(0);class i extends a.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"使用命令",hash:"%E4%BD%BF%E7%94%A8%E5%91%BD%E4%BB%A4"},{level:2,title:"参数说明",hash:"%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E",children:[{level:3,title:"性能相关",hash:"%E6%80%A7%E8%83%BD%E7%9B%B8%E5%85%B3"},{level:3,title:"配置相关",hash:"%E9%85%8D%E7%BD%AE%E7%9B%B8%E5%85%B3"},{level:3,title:"报告和日志相关",hash:"%E6%8A%A5%E5%91%8A%E5%92%8C%E6%97%A5%E5%BF%97%E7%9B%B8%E5%85%B3"},{level:3,title:"其他",hash:"%E5%85%B6%E4%BB%96"}]}]})}}n={},(s="components")in(o=i)?Object.defineProperty(o,s,{value:n,enumerable:!0,configurable:!0,writable:!0}):o[s]=n}.call(this,l(2))},4:function(e,t,l){"use strict";e.exports=function(e,t){return t||(t={}),"string"!=typeof(e=e&&e.__esModule?e.default:e)?e:(t.hash&&(e+=t.hash),t.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(e)?'"'.concat(e,'"'):e)}},60:function(e,t,l){var o=' <div class="content markdown-content"><div class="markdown"><h1 id="%E7%94%9F%E4%BA%A7%E6%89%93%E5%8C%85">生产打包</h1> <p><code>san build</code>是生产环境打包，下面详细说下用法。</p> <h2 id="%E4%BD%BF%E7%94%A8%E5%91%BD%E4%BB%A4">使用命令</h2> <pre class="language-bash"><code class="language-bash">san build <span class="token punctuation">[</span>entry<span class="token punctuation">]</span></code></pre> <ul> <li>entry：入口文件，用于编译单一文件，不传入，则从当前<a href="https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84" target="_blank">工作目录</a>，读取 Config 文件的 pages 配置项</li> </ul> <p>打包结束之后，build 命令默认会生成产出物报表，效果如下：</p> <p><img src="'+l(4)(l(61))+'" alt=""/></p> <h2 id="%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E">参数说明</h2> <h3 id="%E6%80%A7%E8%83%BD%E7%9B%B8%E5%85%B3">性能相关</h3> <ul> <li><code>--modern</code> 是否使用 modern mode 打包，值为 true 或 false，默认是 false，modern mode<a href="/san-cli/modern-mode/">参考</a></li> </ul> <h3 id="%E9%85%8D%E7%BD%AE%E7%9B%B8%E5%85%B3">配置相关</h3> <ul> <li><code>--dest</code> 产出文件目录</li> <li><code>--mode，--m</code> 环境指示，值为 development 或 production，默认是 production</li> <li><code>--config，--config-file</code> 指定 san config 内容，值为 san config 文件的地址，默认会从当前目录中寻找 san.config.js 文件</li> </ul> <h3 id="%E6%8A%A5%E5%91%8A%E5%92%8C%E6%97%A5%E5%BF%97%E7%9B%B8%E5%85%B3">报告和日志相关</h3> <ul> <li><code>--analyze，--analyzer</code>：是否使用 webpack-bundle-analyzer 输出包分析，值为 true 或 false，默认 false</li> <li><code>--profile，--profiler</code>：是否展示编译进度日志，值为 true 或 false，默认是 false</li> <li><code>--report</code>：是否输将包分析报表生成为单个 HTML 文件，值为 true 或 false 或者文件名，默认 false，仅生成 Webpack Stats JSON 文件</li> <li><code>--stats-json，--statsJson</code>：是否输将包分析报表生成为 stats.json，值为 true 或 false 或者文件名，默认是 false</li> <li><code>--no-colors</code>：是否展示无色彩 log，值为 true 或 false，默认是 false</li> </ul> <h3 id="%E5%85%B6%E4%BB%96">其他</h3> <ul> <li><code>--watch，--w</code> 是否监听代码变化</li> <li><code>--clean</code> 是否在 building 之前删除上一次的产出文件，值为 true 或 false，默认 false</li> <li><code>--remote</code> 将编译产出远程部署到目标机器的名称，具体使用可参考<a href="/san-cli/deployment/">文档</a></li> <li><code>--no-progress</code>：禁用默认的进度条（webpackbar）值为 true 或 false，默认是 false</li> </ul> </div></div> ';e.exports=o},61:function(e,t,l){"use strict";l.r(t),t.default=l.p+"static/img/format-stats.png"}}]);