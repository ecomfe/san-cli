# 初衷

## AOT vs JIT

大概是2015年，Angular率先使用了AOT（构建时编译）替代了JIT（运行时编译，非浏览器的即时优化），随后vue也紧随而至。

他们选择在构建时将模板编译成可执行的渲染函数发送至浏览器端，这样做有两个好处：

1. 避免运行时编译的代价
2. 避免把编译器发送到浏览器里

所以这使得类库的体积进一步缩小，浏览器解析模板的时间缩短，代价是会让业务代码体积稍微增加，但从性能的角度来看，构建时编译无疑是值得的。

## san-loader的编译结果??

如果你在业务中使用过san-loader提供的`.san`文件式的开发，那么下面一段对比相信会让你有所思考。

来看一个简单的san组件：

```html

<template>
    <div class="cmpt-a">
        <p class="a-title">{{title}}</p>
        <p>${literal.str}</p>
    </div>
</template>

<script>
import '../styl.styl';
import '../test.css';
import {literal} from '../shake';

export default {
    initData() {
        return {
            title: 'hi~ ComponentA.san'
        };
    },

    attached() {
        console.log('组件attached');
    }
};
</script>

<style lang="stylus">
$color = red

.a-title
    color $color

.cmpt-a
    background-color #42b983
    border 10px solid $color

</style>


```

这个组件最终会被编译成什么样？需要哪些配置项？san-loader内部是如何完成这些转换的？

来看下编译结果：


```js
(window.webpackJsonp = window.webpackJsonp || []).push([[2], [, , function (n, t, o) {
    var e, a, s = {};
    o(16), (e = o(3)) && e.__esModule && Object.keys(e).length > 1 && console.warn("[san-loader] src/components/ComponentA.san: named exports in *.san files are ignored."), a = o(7);
    var r = {};
    e && (r = e.__esModule ? e.default : e), a && (r.template = a);
    var c = o(0).defineComponent(r);
    n.exports = c, n.exports.__esModule && (n.exports = n.exports.default), c.computed || (c.computed = {}), Object.keys(s).forEach(function (n) {
        var t = s[n];
        c.computed[n] = function () {
            return t;
        };
    });
}, function (n, t, o) {
    "use strict";
    o.r(t);
    o(11), o(9), t.default = {
        initData: function () {
            return {title: "hi~ ComponentA.san"};
        }, attached: function () {
            console.log("组件attached");
        }
    };
}, , , , function (n, t) {
    n.exports = '\n<div class="cmpt-a">\n    <p class="a-title">{{title}}</p>\n    <p>${literal.str}</p>\n</div>\n';
}, , function (n, t, o) {
}, , function (n, t, o) {
}, , , , function (n, t, o) {
    (n.exports = o(14)(!1)).push([n.i, ".a-title {\n  color: #f00;\n}\n.cmpt-a {\n  background-color: #42b983;\n  border: 10px solid #f00;\n}\n", ""]);
}, function (n, t, o) {
    var e = o(15);
    "string" == typeof e && (e = [[n.i, e, ""]]);
    var a = {hmr: !0, transform: void 0, insertInto: void 0};
    o(13)(e, a);
    e.locals && (n.exports = e.locals);
}, function (n, t, o) {
    "use strict";
    o.r(t);
    var e = o(2), a = o.n(e), s = o(0), r = o.n(s);
    (new (r.a.defineComponent(a.a))).attach(document.body), window.san = r.a;
}], [[17, 0, 1]]]);
//# sourceMappingURL=app.js.map

```

最终编译体积1.32k，构建后的文件中充斥着无用的模块引用、无意义的字符串缩进、运行时解析以及复杂的配置项带来的奇怪的可能永远不会执行的代码。

哦，还没有文档。

## 存在的意义

**事实上，我们真正想要的是什么？**

**我们希望`san-loader`可以仅仅把`template`转换成模块对象的一个属性存在，在构建时候搞定代码转换以及模块引用，以及不那么复杂的配置。**

**如果`.san`文件构建出来的模块，就像`san.defineComponent`定义的js模块一样清爽，同时又可以提供更好的开发体验呢？**

**这就是`san-webpack-loader`。**


## san-webpack-loader的编译结果 🎁

```js
(window.webpackJsonp = window.webpackJsonp || []).push([[2], [, , function (t, n, a) {
    "use strict";
    a.r(n);
    a(11), a(9), a(7);
    var e = {
        initData: function () {
            return {title: "hi~ ComponentA.san"};
        }, attached: function () {
            console.log("组件attached");
        }, template: '<div class="cmpt-a"><p class="a-title">{{title}}</p><p>引入的template literal 模板字符串</p></div>'
    }, i = a(0), o = a.n(i);
    (new (o.a.defineComponent(e))).attach(document.body), window.san = o.a;
}, , , , , function (t, n, a) {
}, , function (t, n, a) {
}, , function (t, n, a) {
}], [[2, 0, 1]]]);
//# sourceMappingURL=app.js.map


```

最终编译体积513bytes，相比上一个编译结果，体积缩减了60%多。同时更小的体积意味着更短的执行时间，这对移动端的浏览器来说至关重要。

同时，只需按照快速开始中引入，根本无需任何配置项，真正的开箱即用。
