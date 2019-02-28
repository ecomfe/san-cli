/**
 * @file gendoc 生成文档网站静态文件
 */
const path = require('path');
const fs = require('fs-extra');

const home = require('user-home');
const inquirer = require('inquirer');

const exists = fs.existsSync;
const rm = fs.removeSync;
// const debug = require('debug')('command:init');

const generate = require('../lib/generate');
const exec = require('child_process').execSync;

const resolve = path.resolve;
const {
    chalk,
    isLocalPath,
    getTemplatePath,
    error,
    updateSpinner,
    logWithSpinner,
    stopSpinner,
    log,
    downloadRepo,
    clearConsole
} = require('@baidu/hulk-utils');

const createMenuFile = ({menu, pathMap}) => {
    const tab = '  ';
    const tabDep = [];
    let content = '';
    let node = menu;
    const readNode = node => {
        if (Array.isArray(node)) {
            tabDep.push(tab);
            for (let item of node) {
                readNode(item);
            }
            tabDep.shift();
        } else {
            content += `\n${tabDep.join('')}-`;
            tabDep.push(tab);
            Object.keys(node).forEach(key => {
                let val = node[key];
                if (typeof val === 'string') {
                    content += `\n${tabDep.join('')}${key}: ${val}`;
                } else {
                    content += `\n${tabDep.join('')}${key}:`;
                    readNode(val);
                }
            });
            tabDep.shift();
        }
    }
    readNode(menu);
    fs.writeFileSync(resolve(pathMap.navPath, 'nav.yml'), content, 'utf8');
};
const refreshDir = dir => {
    if (fs.existsSync(dir)) {
        fs.removeSync(dir);
    }
    fs.ensureDirSync(dir);
    // fs.mkdirSync(dir);
};
const createDocFile = set => {
    const {pathMap, title} = set;
    refreshDir(pathMap.sourcePath);
    // const compoList = fs.readdirSync(options.compoPath).map(jsfile => jsfile.substr(0, jsfile.length - 3));
    fs.readdirSync(pathMap.compoOutputPath).forEach(sourceFile => {
        let compoName = sourceFile.substr(0, sourceFile.length - 3);
        let content = `---
title: ${title} - ${compoName}
header: ${set.menu.name}
nav: components
sidebar: ${compoName}
---
<div id="app"></div><script src="${set.root}js/${compoName}.js"/>;`;
        if (set.compoList[compoName]) {
            const compoDocFile = resolve(pathMap.docPath, `${set.compoList[compoName].folder}/${compoName}.html`);
            fs.writeFileSync(compoDocFile, content, 'utf8');
            fs.copyFileSync(resolve(pathMap.compoOutputPath, sourceFile), resolve(pathMap.sourcePath, sourceFile));
        }
    });
};

const getCompoList = set => {
    const nav = set.menu.nav;
    const compoList = {};
    const folderList = [];
    nav.forEach(nitem => {
        if (!nitem.sidebar) {
            return;
        }
        folderList.indexOf(nitem.name) < 0 && folderList.push(nitem.name);
        nitem.sidebar.forEach(sidebar => {
            if (sidebar.link && sidebar.name) {
                compoList[sidebar.name] =  {
                    folder: nitem.name,
                    link: sidebar.link
                };
            }
            Array.isArray(sidebar.leaf) && sidebar.leaf.forEach(leaf => {
                if (leaf.link && leaf.name) {
                    compoList[leaf.name] = {
                        folder: nitem.name,
                        link: leaf.link
                    };
                }
            });
        });
    });
    return {
        folderList,
        compoList
    }
};
const replaceFileStr = (filePath, reg, value) => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(reg, value);
    fs.writeFileSync(filePath, content, 'utf8');
};

const replaceHexoConfig = (set) => {
    const urlReg = /{{{::HEXO-CONFIG-URL::}}}/g;
    const rootReg = /{{{::HEXO-CONFIG-ROOT::}}}/g;
    const compoPathReg = /{{{::COMPO-PATH::}}}/g;
    const configFile = resolve(set.pathMap.hexoPath, '_config.yml');
    const docEntry = resolve(set.pathMap.hexoPath, '_script/doc-entry.js');
    replaceFileStr(configFile, urlReg, set.url);
    replaceFileStr(configFile, rootReg, set.root);
    replaceFileStr(docEntry, compoPathReg, resolve(process.cwd(), set.compoPath));
};
module.exports = async (cmd) => {
    let setFilePath = resolve(process.cwd(), cmd.set);
    let set = require(setFilePath);
    const distPath = resolve(process.cwd(), './dist');
    const hexoPath = resolve(distPath, 'hexo');
    const pathMap = {
        distPath,
        hexoPath,
        sourcePath: resolve(hexoPath, 'themes/docs/source/js'),
        docPath: resolve(hexoPath, 'source/_posts'),
        navPath: resolve(hexoPath, 'source/_data'),
        compoPath: set.compoPath,
        compoOutputPath: resolve(distPath, 'source')
    };
    const {folderList, compoList} = getCompoList(set);
    set.pathMap = pathMap;
    set.compoList = compoList;

    refreshDir(distPath);
    refreshDir(pathMap.hexoPath);
    logWithSpinner('🗃', '下载模板...');
    // exec('npm run gen_doc');
    downloadRepo('hexo-doc-template', pathMap.hexoPath, {}, err => {
        updateSpinner('🗃', '模板下载成功!');
        stopSpinner();
        console.log();
        if (!err) {
            updateSpinner('🗃', '模板下载成功!');

            replaceHexoConfig(set);
            log('开始编译组件...');
            exec(`./node_modules/.bin/webpack --config ${resolve(hexoPath, '_script/webpack.doc.conf.js')}`);
            log('编译组件成功...');

            refreshDir(pathMap.docPath);

            folderList.forEach(folder => refreshDir(resolve(pathMap.docPath, folder)));
            if (set.menu) {
                createMenuFile(set);
            }
            if (set.compoPath) {
                createDocFile(set);
            }
            log('安装依赖...');
            exec('cd ./dist/hexo && npm install');
            log('安装完成...');

        } else {
            // console.log(err);
            error('拉取代码失败，请检查路径和代码权限是否正确');
            if (!process.env.DEBUG) {
                log(`使用「${chalk.bgYellow.black('DEBUG=*')}」 ，查看报错信息`);
            }
        }
    });
};
