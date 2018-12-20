# postcss config

postcss 是一个 css 的 AST 工具，通过它可以用 JavaScript 对 css 进行编辑和批量处理，比如随机 id/class 等需求都可以通过编写 postcss 来实现。这里项目主要用了 postcss 的 `autoprefixer`和`pr2rem`，其他插件根据实际情况配置，对应的配置文件为：`postcss.config.js`
