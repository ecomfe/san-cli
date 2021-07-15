<div align="center">
    <h1>San-CLI</h1>
    <blockquote>A CLI Tooling based on <a href="https://baidu.github.io/san/">San.js</a> for rapid development</blockquote>
    <a href="https://github.com/ecomfe/san-cli/actions?query=workflow%3A%22Node.js+CI%22">
        <img src="https://github.com/ecomfe/san-cli/workflows/Node.js%20CI/badge.svg">
    </a>
    <a href="https://www.npmjs.com/package/san-cli">
        <img src="http://img.shields.io/npm/v/san-cli.svg?style=flat-square" alt="NPM version">
    </a>
    <a href="https://github.com/ecomfe/san-cli/issues">
        <img src="https://img.shields.io/github/issues/ecomfe/san-cli.svg?style=flat-square" alt="Issues">
    </a>
    <a href="https://www.npmjs.com/package/san-cli">
        <img src="https://img.shields.io/github/license/ecomfe/san-cli.svg?style=flat-square" alt="License">
    </a>
</div>

English | [简体中文](./README-zh_CN.md)

## 🎉 Features

-   Complete project scaffolding.
-   webpack-based with zero configuration.
-   Extensible command line and webpack packaging plugins.

San CLI takes into account the San ecosystem while trying to achieve universal configuration. At the beginning of the design phase, we aimed to be not limited to the San application scope, but to make a general and customizable front-end development tooling.

## 📦 Installation

> San CLI requires Node.js version 12.0 or above (12.0+ recommended).

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

## 🍻 Companions

-   [san-devtools](https://github.com/baidu/san-devtools/blob/master/docs/user_guide.md) - Chrome DevTools extension
-   [san-router](https://github.com/baidu/san-router) - SPA Router
-   [san-store](https://github.com/baidu/san-store) - Application States Management
-   [san-update](https://github.com/baidu/san-update) - Immutable Data Update
-   [san-factory](https://github.com/baidu/san-factory) - Component register and instantiation
-   [santd](https://ecomfe.github.io/santd/) - Components Library following the [Ant Design](https://ant.design/) specification
-   [san-mui](https://ecomfe.github.io/san-mui/) - [Material Design](https://www.material.io/) Components Library
-   [san-xui](https://ecomfe.github.io/san-xui/) - A Set of SAN UI Components that widely used on Baidu Cloud Console
-   [drei](https://github.com/ssddi456/drei/) - VSCode extension for SAN
-   [san-cli](https://github.com/ecomfe/san-cli) - A CLI tooling based on SAN for rapid development
-   [san-test-utils](https://github.com/ecomfe/san-test-utils) - The unit testing utility library for SAN
-   [san-loader](https://github.com/ecomfe/san-loader) - Webpack loader for single-file SAN components
-   [san-hot-loader](https://github.com/ecomfe/san-hot-loader) - Webpack loader for SAN components HMR

## ☀️ License

MIT
