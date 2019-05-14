# Migrating from 1.x to 2.x

首先列出 Hulk2 的变化：

1. 内置 webpack，所有配置（包括 webpack、babel、postcss 等）都使用`hulk.config.js`；
2. html-webpack-plugin 做了修改，smarty 占位发生变化；
3. 支持 modern mode；
