!function(e){function n(n){for(var s,o,l=n[0],r=n[1],c=n[2],E=0,u=[];E<l.length;E++)o=l[E],Object.prototype.hasOwnProperty.call(t,o)&&t[o]&&u.push(t[o][0]),t[o]=0;for(s in r)Object.prototype.hasOwnProperty.call(r,s)&&(e[s]=r[s]);for(i&&i(n);u.length;)u.shift()();return p.push.apply(p,c||[]),a()}function a(){for(var e,n=0;n<p.length;n++){for(var a=p[n],s=!0,l=1;l<a.length;l++){var r=a[l];0!==t[r]&&(s=!1)}s&&(p.splice(n--,1),e=o(o.s=a[0]))}return e}var s={},t={11:0},p=[];function o(n){if(s[n])return s[n].exports;var a=s[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,o),a.l=!0,a.exports}o.e=function(){return Promise.resolve()},o.m=e,o.c=s,o.d=function(e,n,a){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:a})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(o.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var s in e)o.d(a,s,function(n){return e[n]}.bind(null,s));return a},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="/san-cli/";var l=window.webpackJsonp=window.webpackJsonp||[],r=l.push.bind(l);l.push=n,l=l.slice();for(var c=0;c<l.length;c++)n(l[c]);var i=r;p.push([122,0]),a()}({122:function(e,n,a){var s=a(1),t=a(71),p=a(24).default;e.exports=a(24),e.exports.default=s(p,t,[])},24:function(e,n,a){"use strict";a.r(n),function(e){a.d(n,"default",(function(){return l}));var s,t,p,o=a(0);class l extends o.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"环境配置",hash:"%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE",children:[{level:3,title:"san工程",hash:"san%E5%B7%A5%E7%A8%8B"},{level:3,title:"远端机器",hash:"%E8%BF%9C%E7%AB%AF%E6%9C%BA%E5%99%A8"}]},{level:2,title:"参数配置",hash:"%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE",children:[{level:3,title:"基础参数",hash:"%E5%9F%BA%E7%A1%80%E5%8F%82%E6%95%B0"},{level:3,title:"静态域名替换相关",hash:"%E9%9D%99%E6%80%81%E5%9F%9F%E5%90%8D%E6%9B%BF%E6%8D%A2%E7%9B%B8%E5%85%B3"},{level:3,title:"fsr 相关（百度内部使用请参考fsr）",hash:"fsr-%E7%9B%B8%E5%85%B3%EF%BC%88%E7%99%BE%E5%BA%A6%E5%86%85%E9%83%A8%E4%BD%BF%E7%94%A8%E8%AF%B7%E5%8F%82%E8%80%83fsr%EF%BC%89"}]},{level:2,title:"简单说实现",hash:"%E7%AE%80%E5%8D%95%E8%AF%B4%E5%AE%9E%E7%8E%B0",children:[{level:3,title:"写法引入方式",hash:"%E5%86%99%E6%B3%95%E5%BC%95%E5%85%A5%E6%96%B9%E5%BC%8F"}]}]})}}p={},(t="components")in(s=l)?Object.defineProperty(s,t,{value:p,enumerable:!0,configurable:!0,writable:!0}):s[t]=p}.call(this,a(2))},71:function(e,n){e.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E9%83%A8%E7%BD%B2">部署</h1> <p>在执行 <code>san build [entry] --remote &lt;remote-name&gt;</code> 时，使用的就是该页面的远程部署解决方案，支持从项目本地将生产环境编译产出直接远程部署到目标开发机。</p> <p>使用时，需要进行相应的 <strong>环境配置</strong> 以及 <strong>参数配置</strong>，下面具体说明如何配置。</p> <h2 id="%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE">环境配置</h2> <h3 id="san%E5%B7%A5%E7%A8%8B">san工程</h3> <p>命令中 remote-name 对应着一组开发机配置项，通过 <code>.env.production</code> 文件 指定远端开发机的配置项，包括部署方式及路径等信息，env 文件说明参考<a href="/san-cli/env/">环境变量</a>。</p> <pre class="language-bash"><code class="language-bash"><span class="token comment"># 环境配置文件 .env.production</span>\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_DISABLE_FSR</span><span class="token operator">=</span>true\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_RECEIVER</span><span class="token operator">=</span>http://www.xiaoming.com:8080/receiver.php\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_TEMPLATE_PATH</span><span class="token operator">=</span>/home/work/nginx_static/html/test/template\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_STATIC_PATH</span><span class="token operator">=</span>/home/work/nginx_static/html/test/static\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_STATIC_DOMAIN</span><span class="token operator">=</span>http://test.bdstatic.com:8888\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_BASE_URL</span><span class="token operator">=</span>http://www.cdnstatic.com\n<span class="token assign-left variable">SAN_REMOTE_XIAOMING_HOST</span><span class="token operator">=</span>http://www.xiaoming.com:8080</code></pre> <div class="warning"><p class="info-title">上例解读</p> <ol> <li>命名规则：<strong>SAN_REMOTE_（1.大写的 remote-name 名称）_ (2.大写的参数名称，驼峰处改用下划线分隔)</strong>；其中【1】的与remote-name相同，【2】会解析为配置参数，具体含义见<strong>参数配置</strong></li> <li>将 tpl、js、css 文件代码中 http://www.cdnstatic.com 替换成了 http://test.bdstatic.com:8888 。</li> </ol> </div> <h3 id="%E8%BF%9C%E7%AB%AF%E6%9C%BA%E5%99%A8">远端机器</h3> <p>远端机器需部署可接收文件的服务，有两种方式：</p> <ol> <li>通用方式：在远端机器，部署接收脚本（或者服务），这个是脚本的 <a href="https://github.com/fex-team/fis3-deploy-http-push/blob/master/receiver.php" target="_blank">php</a> 实现版本（远端机器需要支持 php 的解析，如果需要其他语言实现，请参考这个 php 脚本实现），把脚本放到远端机器上某个 Web 服务根目录，配置一个 url 能访问到即可。</li> <li>百度内部：使用<a href="http://agroup.baidu.com/fis/md/article/196978" target="_blank">fsr</a>方式进行部署。</li> </ol> <h2 id="%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE">参数配置</h2> <h3 id="%E5%9F%BA%E7%A1%80%E5%8F%82%E6%95%B0">基础参数</h3> <h4 id="receiver"><code>receiver</code></h4> <p>远程服务的 receiver.php 地址，receiver.php 文件内容<a href="https://github.com/fex-team/fis3-deploy-http-push/blob/master/receiver.php" target="_blank">参考</a></p> <h4 id="templatepath"><code>templatePath</code></h4> <p>远程服务的模板存放地址，产出文件中的 .tpl 结尾的文件会上传到此路径下。</p> <h4 id="staticpath"><code>staticPath</code></h4> <p>远程服务的静态文件存放地址。</p> <h3 id="%E9%9D%99%E6%80%81%E5%9F%9F%E5%90%8D%E6%9B%BF%E6%8D%A2%E7%9B%B8%E5%85%B3">静态域名替换相关</h3> <h4 id="staticdomain"><code>staticDomain</code></h4> <p>静态文件服务域名。</p> <h4 id="baseurl"><code>baseUrl</code></h4> <p>需要被替换成远程静态文件服务域名的域名串</p> <h3 id="fsr-%E7%9B%B8%E5%85%B3%EF%BC%88%E7%99%BE%E5%BA%A6%E5%86%85%E9%83%A8%E4%BD%BF%E7%94%A8%E8%AF%B7%E5%8F%82%E8%80%83fsr%EF%BC%89">fsr 相关（百度内部使用请参考<a href="http://agroup.baidu.com/fis/md/article/196978?side=folder" target="_blank">fsr</a>）</h3> <h4 id="disablefsr"><code>disableFsr</code></h4> <p>是否禁用 fsr 安全部署服务，值为 true 或 false，默认是 false ，使用 fsr 安全部署服务（若远端机器使用脚本等方式接收，须禁用 fsr ，将此项置为 true ）</p> <h4 id="host"><code>host</code></h4> <p>配置此项的前提是，disableFsr 为 false，启用了 fsr 安全部署服务，用于替换原来的 reciever 配置，拼接成该此项设置的域名。</p> <h6 id="%E6%89%A7%E8%A1%8C%E9%83%A8%E7%BD%B2">执行部署</h6> <pre class="language-bash"><code class="language-bash"><span class="token comment"># 单次构建并远程部署</span>\nsan build --remote xiaoming\n<span class="token comment"># 监听产出每次变动自动执行远程部署</span>\nsan build --remote xiaoming --watch</code></pre> <h2 id="%E7%AE%80%E5%8D%95%E8%AF%B4%E5%AE%9E%E7%8E%B0">简单说实现</h2> <p>使用<a href="https://github.com/jinzhan/deploy-files" target="_blank">deploy-files</a>插件。</p> <p>安装 deploy-files (版本 &gt;= 0.1.1)：</p> <pre class="language-bash"><code class="language-bash"><span class="token function">npm</span> i deploy-files</code></pre> <h3 id="%E5%86%99%E6%B3%95%E5%BC%95%E5%85%A5%E6%96%B9%E5%BC%8F">写法引入方式</h3> <p>webpack 插件的使用方式</p> <p>引入：</p> <pre class="language-js"><code class="language-js"><span class="token keyword">const</span> DeployPlugin <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'deploy-files/webpack-plugin\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <p>方式一：webpack 链式使用方式</p> <pre class="language-js"><code class="language-js">chainConfig<span class="token punctuation">.</span><span class="token function">plugin</span><span class="token punctuation">(</span><span class="token string">\'deploy-files\'</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>DeployPlugin<span class="token punctuation">,</span> <span class="token punctuation">[</span>remoteObj<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <p>方式二：webpack Config 中配置 plugins</p> <pre class="language-js"><code class="language-js">plugins<span class="token operator">:</span> <span class="token punctuation">[</span>\n    <span class="token operator">...</span><span class="token punctuation">,</span>\n    <span class="token keyword">new</span> <span class="token class-name">DeployPlugin</span><span class="token punctuation">(</span>remoteObj<span class="token punctuation">)</span>\n<span class="token punctuation">]</span></code></pre> <div class="warning"> <p>remoteObj 即为上方部署中的相关配置参数。</p> </div> </div></div> '}});