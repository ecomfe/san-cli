!function(n){function s(s){for(var a,p,l=s[0],c=s[1],r=s[2],u=0,d=[];u<l.length;u++)p=l[u],Object.prototype.hasOwnProperty.call(o,p)&&o[p]&&d.push(o[p][0]),o[p]=0;for(a in c)Object.prototype.hasOwnProperty.call(c,a)&&(n[a]=c[a]);for(i&&i(s);d.length;)d.shift()();return t.push.apply(t,r||[]),e()}function e(){for(var n,s=0;s<t.length;s++){for(var e=t[s],a=!0,l=1;l<e.length;l++){var c=e[l];0!==o[c]&&(a=!1)}a&&(t.splice(s--,1),n=p(p.s=e[0]))}return n}var a={},o={3:0,47:0},t=[];function p(s){if(a[s])return a[s].exports;var e=a[s]={i:s,l:!1,exports:{}};return n[s].call(e.exports,e,e.exports,p),e.l=!0,e.exports}p.e=function(){return Promise.resolve()},p.m=n,p.c=a,p.d=function(n,s,e){p.o(n,s)||Object.defineProperty(n,s,{enumerable:!0,get:e})},p.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},p.t=function(n,s){if(1&s&&(n=p(n)),8&s)return n;if(4&s&&"object"==typeof n&&n&&n.__esModule)return n;var e=Object.create(null);if(p.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:n}),2&s&&"string"!=typeof n)for(var a in n)p.d(e,a,function(s){return n[s]}.bind(null,a));return e},p.n=function(n){var s=n&&n.__esModule?function(){return n.default}:function(){return n};return p.d(s,"a",s),s},p.o=function(n,s){return Object.prototype.hasOwnProperty.call(n,s)},p.p="/san-cli/";var l=window.webpackJsonp=window.webpackJsonp||[],c=l.push.bind(l);l.push=s,l=l.slice();for(var r=0;r<l.length;r++)s(l[r]);var i=c;t.push([117,0]),e()}({117:function(n,s,e){var a=e(1),o=e(65),t=e(19).default;n.exports=e(19),n.exports.default=a(t,o,[])},19:function(n,s,e){"use strict";e.r(s),function(n){e.d(s,"default",(function(){return l}));var a,o,t,p=e(0);class l extends p.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"browserslist",hash:"browserslist"},{level:2,title:"Polyfill",hash:"polyfill",children:[{level:3,title:"个性化配置",hash:"%E4%B8%AA%E6%80%A7%E5%8C%96%E9%85%8D%E7%BD%AE"}]}]})}}t={},(o="components")in(a=l)?Object.defineProperty(a,o,{value:t,enumerable:!0,configurable:!0,writable:!0}):a[o]=t}.call(this,e(2))},65:function(n,s){n.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7">浏览器兼容性</h1> <h2 id="browserslist">browserslist</h2> <p>用户可以通过项目中的 <code>package.json</code> 中 <code>browserslist</code> 字段（或 <code>.browserslistrc</code> 文件）来指定项目的目标浏览器的范围。这个配置会被 <code>@babel/preset-env</code> 和 <code>Autoprefixer</code> 用来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀（<a href="https://github.com/browserslist/browserslist" target="_blank">了解更多</a>）。</p> <h2 id="polyfill">Polyfill</h2> <p>Polyfill 是指一段 JS 代码，它提供了开发者希望浏览器能够原生提供的技术，目标是打平开发环境和用户浏览器之间的 API 兼容性差异。</p> <p>在 San CLI 中通过 @babel/preset-env 和 browserslist 配置来决定项目需要的 polyfill。</p> <p>默认情况下，我们会把 <code>useBuiltIns: \'usage\'</code> 传递给 <code>@babel/preset-env</code>，这样它会根据源代码中出现的语言特性自动检测需要的 polyfill，这确保了最终包里 polyfill 数量的最小化。</p> <h3 id="%E4%B8%AA%E6%80%A7%E5%8C%96%E9%85%8D%E7%BD%AE">个性化配置</h3> <ol> <li>使用 <code>exclude</code> 参数来去掉不需要的 polyfill；</li> </ol> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span>export <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">// ...</span>\n    loaderOptions<span class="token operator">:</span> <span class="token punctuation">{</span>\n        babel<span class="token operator">:</span> <span class="token punctuation">{</span>\n            exclude<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">\'es.promise\'</span><span class="token punctuation">]</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// ...</span>\n<span class="token punctuation">}</span></code></pre> <ol start="2"> <li>通过 <code>polyfills</code> 参数强制引入 polyfill（主要解决自动添加的情况存在的一些兼容性问题）；</li> </ol> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span>export <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">// ...</span>\n    loaderOptions<span class="token operator">:</span> <span class="token punctuation">{</span>\n        babel<span class="token operator">:</span> <span class="token punctuation">{</span>\n            polyfills<span class="token operator">:</span> <span class="token punctuation">[</span>\n                <span class="token string">\'es.promise\'</span><span class="token punctuation">,</span>\n                <span class="token comment">// #2012 es7.promise replaces native Promise in FF and causes missing finally</span>\n                <span class="token string">\'es.promise.finally\'</span><span class="token punctuation">,</span>\n                <span class="token comment">// Promise polyfill alone doesn\'t work in IE</span>\n                <span class="token string">\'es.array.iterator\'</span>\n            <span class="token punctuation">]</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token comment">// ...</span>\n<span class="token punctuation">}</span></code></pre> <ol start="3"> <li>禁用内置 polyfill 配置，即不使用 san-cli 提供的 presets，babel-loader 会自动寻找项目目录下的 babel 配置文件（<code>.babelrc</code> &gt; <code>babel.config.js</code>）：</li> </ol> <pre class="language-js"><code class="language-js">module<span class="token punctuation">.</span>export <span class="token operator">=</span> <span class="token punctuation">{</span>\n    <span class="token comment">// ...</span>\n    loaderOptions<span class="token operator">:</span> <span class="token punctuation">{</span>\n        babel<span class="token operator">:</span> <span class="token boolean">false</span>\n    <span class="token comment">// ...</span>\n<span class="token punctuation">}</span></code></pre> </div></div> '}});