<h1 align="center">San-CLI</h1>

<div align="center">
A CLI Tooling based on <a href="https://baidu.github.io/san/">San.js</a> for rapid development

</div>

[Full Docs](https://ecomfe.github.io/san-cli/)

## 🎉 Features

-   Complete project scaffolding.
-   webpack-based with zero configuration.
-   Extensible command line and webpack packaging plugins.

San CLI takes into account the San ecosystem while trying to achieve universal configuration. At the beginning of the design phase, we aimed to be not limited to the San application scope, but to make a general and customizable front-end development tooling.

## 📦 Installation

> San CLI requires Node.js version 8.16.0 or above (8.16.0+ recommended).

```bash
# use npm
npm install -g san-cli
# or use yarn
yarn global add san-cli
```

> If you want to use San CLI only in the project, you can add it to the devDependencies of the project package.json and then use [npm-scripts](https://docs.npmjs.com/misc/scripts).

After installation, you can view the help information with the following command:

```bash
san -h
```

For more information, visit [https://ecomfe.github.io/san-cli](https://ecomfe.github.io/san-cli).

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/ecomfe/san-cli/pulls)

San CLI uses [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) for local development.

First clone the project to your computer, then install dependencies：

```bash
# install dependencies
yarn
```

For design details, please read _[architecture](./docs/architecture.md)_.

### 🔨 Testing

```bash
# test all
yarn test
# or test one specific package
yarn test [packageName]
# such as
yarn test san-cli
```

### 🐛 Debug Log

The [debug](https://npmjs.org/package/debug) module is used in the San CLI, so if you need to debug or see some information you can use the `DEBUG` variable. In San CLI, the scope of debug is `san-cli:`, and common variables include:

-   `perf`: Output performance log of San CLI itself.
-   `babel`: Output Babel related configuration.
-   `service`: Output service layer log.
-   `webpack:closeDevtool`: Close Devtools and no longer output `eval` type code. Directly output the packaged code for debugging.
-   `webpack:build`: Output webpack build related configuration.
-   `webpack:serve`: Output webpack serve related configuration.
-   `webpack:config`: Output the final config object of webpack.

## 📝 Documentation

For detailed documentation, please check the [San CLI docs](./docs/README.md).

## ☀️ License

MIT
