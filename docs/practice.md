
# 一些编码的建议

## 善用 Webpack 的路径别名
```js
import FooBar from '../../../../components/FooBar' // Bad
import FooBar from '@/components/FooBar'           // Good
```

## 引入文件时，省略默认解析的文件后缀
```js
import FooBar from './FooBar.js'  // No good enough
import FooBar from './FooBar'     // Good
```

## 最小化引入类库，ES6 类库

```js
import _ from 'lodash'               // Bad
import isEmpty from 'lodash-es/isEmpty' // Good
```

这里推荐使用 [xbox](./xbox.md)

> Tips：使用 ES6 类库可以增强 Webpack 的 Tree-Shaking 功能

## HTML 过长拆开写

```html
<input type="text" class="form-control" placeholder="Please enter your name..." required>
<!-- ↑ Bad · Good ↓ -->
<input
  type="text"
  class="form-control"
  placeholder="Please enter your name..."
  required>
```

## 单组件文件代码量若超 200 行，一般都有优化的空间
> 关键是 **拆**，前提是粒度要合理

## 恪守代码、模块分离，DRY 的开发理念

##（未完待续，欢迎 PR 共建）
