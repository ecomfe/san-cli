/**
 * @file match-by-ast.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const parser = require('../utils/ast-parser');
const {
    val,
    isImportedAPI,
    getExportDefault,
    getTopLevelIdentifierTracker,
    isModuleImported
} = require('../utils/ast');

module.exports = function (source) {
    let ast;

    try {
        ast = parser.parse(source);
    }
    catch (e) {
        return;
    }

    if (!isModuleImported(ast, 'san-store')) {
        return;
    }

    if (isGlobalActions(ast)) {
        return {
            type: 'globalAction'
        };
    }

    if (isInstantStore(ast)) {
        let instantActionsPath = getInstantActionsPath(ast);
        if (!instantActionsPath) {
            return;
        }

        return {
            type: 'instantSotre',
            actionPath: instantActionsPath
        };
    }
};

function isGlobalActions(ast) {
    // 判断条件 1：global actions 无需 export default store
    let defaultModule = getExportDefault(ast);
    if (defaultModule) {
        return false;
    }

    let result = false;
    for (let node of ast.program.body) {
        // import {store} from 'san-store'
        // store.addAction(XX, XX)
        if (node.type === 'ExpressionStatement'
            && node.expression.type === 'CallExpression'
            && node.expression.callee.type === 'MemberExpression'
            && node.expression.callee.property.name === 'addAction'
            && node.expression.arguments.length === 2
        ) {
            result = isImportedAPI(ast, node.expression.callee.object, 'san-store', 'store');
            if (!result) {
                return false;
            }
        }

    }

    return result;
}

function isInstantStore(ast) {
    // 判断条件
    // import {Store} from 'san-store'
    // export default new Store({})
    let defaultModule = getExportDefault(ast);
    if (!defaultModule) {
        return false;
    }

    let trackers = getTopLevelIdentifierTracker(ast, defaultModule);
    if (!trackers || trackers.length !== 1) {
        return false;
    }

    let newStore = trackers[0];
    if (newStore.type !== 'NewExpression') {
        return false;
    }

    if (!isImportedAPI(ast, newStore.callee, 'san-store', 'Store')) {
        return false;
    }

    if (newStore.arguments.length !== 1) {
        return false;
    }

    return true;
}

function getInstantActionsPath(ast) {
    // 获取条件
    // import xx from 'path-to-action'
    // export default new Store({actions: xxx})
    let defaultModule = getExportDefault(ast);
    let defaultTrackers = getTopLevelIdentifierTracker(ast, defaultModule);
    let newStore = defaultTrackers[0];
    let argTrackers = getTopLevelIdentifierTracker(ast, newStore.arguments[0]);
    if (!argTrackers || argTrackers.length !== 1) {
        return;
    }
    let storeOptions = argTrackers[0];
    if (storeOptions.type !== 'ObjectExpression') {
        return;
    }
    for (let property of storeOptions.properties) {
        if (val(property.key) === 'actions'
            && property.value.type === 'Identifier'
        ) {
            let trackers = getTopLevelIdentifierTracker(ast, property.value);
            if (typeof trackers[0] === 'string') {
                return trackers[0];
            }
        }
    }
}

