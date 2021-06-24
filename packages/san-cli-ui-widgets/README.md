# san-cli-ui-widgets

san-cli-ui-widgets 是 [San](https://github.com/baidu/san) CLI UI工具中内置部件，显示在仪表盘。

```

├── src
|   ├── components
|   |    ├── kill-port    # 终止端口
|   |    ├── news         # 新闻
|   |    ├── run-task     # 执行任务
|   |    └── welcome      # 欢迎
|   └── index.js          # 入口文件
├── ...
└── san.config.js         # 配置文件
```

## 使用文档

请移步[San-CLI 文档](https://ecomfe.github.io/san-cli) 安装san-cli-ui体验，san-cli-ui-widgets是san-cli-ui的默认依赖。

## 测试

执行命令

```bash
#执行__tests__下所有测试文件
yarn test
```
