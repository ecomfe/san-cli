!function(e){function t(t){for(var r,o,i=t[0],c=t[1],u=t[2],p=0,d=[];p<i.length;p++)o=i[p],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&d.push(a[o][0]),a[o]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(e[r]=c[r]);for(s&&s(t);d.length;)d.shift()();return l.push.apply(l,u||[]),n()}function n(){for(var e,t=0;t<l.length;t++){for(var n=l[t],r=!0,i=1;i<n.length;i++){var c=n[i];0!==a[c]&&(r=!1)}r&&(l.splice(t--,1),e=o(o.s=n[0]))}return e}var r={},a={4:0},l=[];function o(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.e=function(){return Promise.resolve()},o.m=e,o.c=r,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)o.d(n,r,function(t){return e[t]}.bind(null,r));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/san-cli/";var i=window.webpackJsonp=window.webpackJsonp||[],c=i.push.bind(i);i.push=t,i=i.slice();for(var u=0;u<i.length;u++)t(i[u]);var s=c;l.push([120,0]),n()}({120:function(e,t,n){var r=n(1),a=n(68),l=n(21).default;e.exports=n(21),e.exports.default=r(l,a,[])},21:function(e,t,n){"use strict";n.r(t),function(e){n.d(t,"default",(function(){return i}));var r,a,l,o=n(0);class i extends o.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"分析结果",hash:"%E5%88%86%E6%9E%90%E7%BB%93%E6%9E%9C"},{level:2,title:"打包性能分析",hash:"%E6%89%93%E5%8C%85%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90"}]})}}l={},(a="components")in(r=i)?Object.defineProperty(r,a,{value:l,enumerable:!0,configurable:!0,writable:!0}):r[a]=l}.call(this,n(2))},68:function(e,t,n){var r=' <div class="content"><div class="markdown"><h1 id="bundle-%E5%88%86%E6%9E%90"><a class="header-anchor" href="#bundle-%E5%88%86%E6%9E%90">#</a> Bundle 分析</h1> <p>很多团队在使用 Webpack 的时候，不会关注打包后的性能问题，使用<a href="https://github.com/webpack-contrib/webpack-bundle-analyzer/" target="_blank">webpack-bundle-analyzer</a>可以帮忙排查打包不合理的情况，一般会遇见下面的问题：</p> <ol> <li>打入不必要的包，引入过多的内容，比如<code>lodash</code>，需要使用<code>lodash</code> babel 插件来解决；</li> <li>打包优先级错误，导致本来不需提前引入的包，可以使用动态加载的方式来引入；</li> <li>多页面情况下没有拆包，每个页面一个包，这种情况可以使用<code>spiltChunks</code>来进行拆包，将公共内容拆成一个包。</li> </ol> <p>San CLI 内置了<a href="https://github.com/webpack-contrib/webpack-bundle-analyzer/" target="_blank">webpack-bundle-analyzer</a>，方便使用，只需要在<code>san build --analyze</code></p> <p><img src="https://cloud.githubusercontent.com/assets/302213/20628702/93f72404-b338-11e6-92d4-9a365550a701.gif" alt=""/></p> <h2 id="%E5%88%86%E6%9E%90%E7%BB%93%E6%9E%9C"><a class="header-anchor" href="#%E5%88%86%E6%9E%90%E7%BB%93%E6%9E%9C">#</a> 分析结果</h2> <p>除了直接使用 webpack-bundle-analyzer 查看结果，还可以将 Bundle 结果保存下来，用于分析和比较两次打包的结果，查找是否打包合理，San CLI 的 build 使用下面的两个方式来将分析结果进行保存：</p> <ul> <li><code>--stats-json，--stats</code>：生成 Webpack stats JSON 文件到 stats.json，值为 true 或 false，默认是 false</li> <li><code>--report</code>：是否输将包分析报表生成为单个 HTML 文件，值为 true 或 false，默认 false，仅生成 Webpack Stats JSON 文件</li> </ul> <p>关于 Bundle 结果的分析可以查看<a href="https://survivejs.com/webpack/optimizing/build-analysis/" target="_blank">这篇文章</a>介绍了很多 Bundle 分析工具。这些工具的使用方法都是将生成的报告 JSON 地址上传上去，然后分析，这里就不再赘余了。</p> <h2 id="%E6%89%93%E5%8C%85%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90"><a class="header-anchor" href="#%E6%89%93%E5%8C%85%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90">#</a> 打包性能分析</h2> <p>如果需要排查 loader 或者 plugin 的性能问题，可以使用 <code>san build --profile</code>，打包后会出现对应的性能表格。</p> <p><img src="'+n(4)(n(69))+'" alt=""/></p> </div></div> ';e.exports=r},69:function(e,t,n){"use strict";n.r(t),t.default=n.p+"static/img/profile.png"}});