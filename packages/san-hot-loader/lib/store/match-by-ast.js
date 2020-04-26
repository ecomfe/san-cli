/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file match-by-ast.js
 * @author clark-t
 */

const {
    isImportedAPI,
    getExportDefault,
    getTopLevelIdentifierTracker,
    isModuleImported,
    hasExport,
    hasModuleHot,
    getProgramBody
} = require('../utils/ast');

module.exports = function (ast) {
    if (!ast) {
        return false;
    }

    if (hasModuleHot(ast)) {
        return false;
    }

    if (!isModuleImported(ast, 'san-store')) {
        return false;
    }

    if (isGlobalActions(ast)) {
        return true;
    }

    if (isInstantStore(ast)) {
        return true;
    }
    return false;
};

function isGlobalActions(ast) {
    // 判断条件 1：global actions 无需 export default store
    if (hasExport(ast)) {
        return false;
    }

    const body = getProgramBody(ast);

    let result = false;
    for (let node of body) {
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

