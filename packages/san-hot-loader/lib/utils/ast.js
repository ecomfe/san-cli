/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ast.js
 * @author clark-t
 */

/**
 * 获取 property 的关键字，property 可能是 string 也可能是 字符串
 *
 * @param {ASTNode} id property 节点
 * @return {string|null} 关键字
 */
function val(id) {
    return (id.type === 'Identifier' && id.name)
        || (id.type === 'StringLiteral' && id.value);
}

/**
 * 获取 Program 下面的 body 节点
 *
 * @param {ASTNode} ast File || Program
 * @return {Array.<ASTNode>|undefined} body
 */
function getProgramBody(ast) {
    return (ast.program || ast).body;
}

function isImportedAPI(ast, nodeOrTrackers, moduleName, api) {
    let trackers = Array.isArray(nodeOrTrackers) ? nodeOrTrackers : getTopLevelIdentifierTracker(ast, nodeOrTrackers);

    if (!trackers
        || typeof trackers[0] !== 'string'
        || trackers[0] !== moduleName
    ) {
        return false;
    }

    if (!api) {
        return true;
    }

    if (trackers.length < 2) {
        return false;
    }

    return api === val(trackers[1]);
}

function getExportDefault(ast) {
    const body = getProgramBody(ast);
    for (let node of body) {
        // export default xxx
        if (node.type === 'ExportDefaultDeclaration') {
            return node.declaration;
        }
        // module.exports = xxx
        if (node.type === 'ExpressionStatement' && isModuleExports(node.expression)) {
            return node.expression.right;
        }
    }
}

function getTopLevelIdentifierTracker(ast, inputNode) {
    const body = getProgramBody(ast);
    let results;

    if (inputNode.type === 'Identifier') {
        results = [inputNode];
    }
    else if (inputNode.type === 'MemberExpression') {
        results = getPropertyList(inputNode);
    }
    else {
        return [inputNode];
    }

    if (!results) {
        return;
    }

    let identifier = results[0];

    for (let i = body.length - 1; i > -1; i--) {
        let node = body[i];
        if (node.start > identifier.start) {
            continue;
        }
        // EXP:
        // import san from 'san'
        // import * as san from 'san'
        // import {defineComponent as defComp} from 'san'
        if (node.type === 'ImportDeclaration') {
            for (let specifier of node.specifiers) {
                if (specifier.type === 'ImportNamespaceSpecifier'
                    || specifier.type === 'ImportDefaultSpecifier'
                ) {
                    if (specifier.local.name === val(identifier)) {
                        results[0] = node.source.value;
                        return results;
                    }
                }
                else if (specifier.type === 'ImportSpecifier') {
                    if (specifier.local.name === val(identifier)) {
                        results[0] = specifier.imported;
                        results.unshift(node.source.value);
                        return results;
                    }
                }
            }

        }
        // EXP:
        // var san = require('san')
        // var {defineComponent: def} = require('san')
        if (node.type === 'VariableDeclaration') {
            for (let declarator of node.declarations) {
                if (isRequire(declarator.init)) {
                    if (declarator.id.type === 'Identifier') {
                        if (declarator.id.name === val(identifier)) {
                            results[0] = declarator.init.arguments[0].value;
                            return results;
                        }
                    }
                    else if (declarator.id.type === 'ObjectPattern') {
                        // 先不考虑 var {a: {b: c}} = require('xxx') 这种深层的情况，因为目前在 san HMR 的模块判断上用不到
                        for (let property of declarator.id.properties) {
                            if (property.value.type !== 'Identifier') {
                                continue;
                            }
                            if (property.value.name === val(identifier)) {
                                results[0] = property.key;
                                results.unshift(declarator.init.arguments[0].value);
                                return results;
                            }
                        }
                    }
                }
            }

        }

        if (node.type === 'ExpressionStatement'
            && node.expression.type === 'AssignmentExpression'
            && node.expression.left.type === 'Identifier'
            && val(identifier) === node.expression.left.name
        ) {
            if (node.expression.right.type === 'Identifier') {
                identifier = node.expression.right;
                results[0] = identifier;
                continue;
            }

            if (node.expression.right.type === 'MemberExpression') {
                let list = getPropertyList(node.expression.right);
                // 不处理复杂的 MemberExpression
                if (!list) {
                    return;
                }
                results.shift();
                results = [...list, ...results];
                identifier = list[0];
                continue;
            }
            // 遇到了其他类型，将其返回到外部做进一步处理
            results[0] = node.expression.right;
            return results;
        }

        if (node.type === 'VariableDeclaration') {
            for (let j = node.declarations.length - 1; j > -1; j--) {
                let declarator = node.declarations[j];

                if (declarator.id.type === 'ObjectPattern') {
                    let list = getObjectPatternList(declarator.id, identifier);
                    if (!list) {
                        continue;
                    }
                    results.shift();
                    results = [...list, ...results];
                }
                else if (declarator.id.type !== 'Identifier' || declarator.id.name !== val(identifier)) {
                    continue;
                }

                if (!declarator.init) {
                    return;
                }

                if (declarator.init.type === 'Identifier') {
                    identifier = declarator.init;
                    if (declarator.id.type === 'ObjectPattern') {
                        results.unshift(identifier);
                    }
                    else {
                        results[0] = identifier;
                    }
                    continue;
                }

                if (declarator.init.type === 'MemberExpression') {
                    let list = getPropertyList(declarator.init);
                    // 不处理复杂的 MemberExpression
                    if (!list) {
                        return;
                    }
                    if (declarator.id.type === 'Identifier') {
                        results.shift();
                    }
                    results = [...list, ...results];
                    identifier = list[0];
                    continue;
                }

                if (declarator.id.type === 'ObjectPattern') {
                    results.unshift(declarator.init);
                }
                else {
                    results[0] = declarator.init;
                }

                return results;
            }
        }

        if (node.type === 'ClassDeclaration'
            || node.type === 'ClassExpression'
            || node.type === 'FunctionDeclaration'
        ) {
            if (node.id.name === val(identifier)) {
                results[0] = node;
                return results;
            }
        }
    }
    return results;
}

function getPropertyList(memberExpression) {
    let arr = [];
    while (memberExpression.property) {
        if (memberExpression.computed === false && memberExpression.property.type === 'Identifier') {
            arr.unshift(memberExpression.property);
        }
        else if (memberExpression.computed === true && memberExpression.property.type === 'StringLiteral') {
            arr.unshift(memberExpression.property);
        }
        else {
            // 不考虑过于复杂的计算属性，比如 san['defi' + 'neComponent']，因为去做这种检测就会没完没了并且可能会存在误判的问题，因此不如通过文档限定写法
            return;
        }

        if (memberExpression.object.type === 'MemberExpression') {
            memberExpression = memberExpression.object;
            continue;
        }

        if (memberExpression.object.type === 'Identifier') {
            arr.unshift(memberExpression.object);
            return arr;
        }

        return;
    }
}

function getObjectPatternList(objectPattern, identifier) {
    for (let node of objectPattern.properties) {
        if (node.value.type === 'Identifier'
            && node.value.name === val(identifier)
        ) {
            if (node.key.type === 'Identifier' || node.key.type === 'StringLiteral') {
                return [node.key];
            }
            // 不处理复杂型解构，如 let {[a + 1]: def} = xxx
            return;
        }

        if (node.value.type === 'ObjectPattern') {
            let result = getObjectPatternList(node.value, identifier);
            if (result) {
                return [node.key, ...result];
            }
        }
    }
}

function isModuleImported(ast, moduleName) {
    const body = getProgramBody(ast);
    for (let node of body) {
        if (isImport(node) && node.source.value === moduleName) {
            return true;
        }

        if (node.type === 'VariableDeclaration') {
            for (let declarator of node.declarations) {
                if (isRequire(declarator.init) && declarator.init.arguments[0].value === moduleName) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isImport(node) {
    return node.type === 'ImportDeclaration';
}

function isRequire(node) {
    return node
        && node.type === 'CallExpression'
        && node.callee.type === 'Identifier'
        && node.callee.name === 'require'
        && node.arguments
        && node.arguments.length === 1
        && node.arguments[0].type === 'StringLiteral';
}

function isExports(node) {
    return node.type === 'AssignmentExpression'
        && node.left.type === 'MemberExpression'
        && node.left.object.name === 'exports';
}

function isModuleExports(node) {
    return node.type === 'AssignmentExpression'
        && node.left.type === 'MemberExpression'
        && node.left.object.name === 'module'
        && node.left.property.name === 'exports';
}

function hasExport(ast) {
    if (getExportDefault(ast)) {
        return true;
    }
    const body = getProgramBody(ast);
    for (let node of body) {
        if (node.type === 'ExportNamedDeclaration') {
            return true;
        }
        // commonjs
        // exports.xxx = function () {}
        if (node.type === 'ExpressionStatement' && isExports(node.expression)) {
            return true;
        }
        // commonjs
        // exports.a = 1, exports.b = 2
        if (node.type === 'ExpressionStatement'
            && node.expression.type === 'SequenceExpression'
        ) {
            for (let subNode of node.expression.expressions) {
                if (isExports(subNode)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function hasModuleHot(ast) {
    const body = getProgramBody(ast);
    for (let node of body) {
        if (node.type === 'IfStatement'
            && node.test.type === 'MemberExpression'
            && node.test.object.name === 'module'
            && node.test.property.name === 'hot'
        ) {
            return true;
        }
    }
    return false;
}

function hasComment(ast, text) {
    const body = getProgramBody(ast);

    let comments = [];

    for (let node of body) {
        if (node.leadingComments) {
            comments = comments.concat(node.leadingComments);
        }
        if (node.trailingComments) {
            comments = comments.concat(node.trailingComments);
        }
    }

    for (let comment of comments) {
        if (comment.value.trim() === text) {
            return true;
        }
    }

    return false;
}

module.exports = {
    val,
    getProgramBody,
    isImportedAPI,
    getExportDefault,
    getTopLevelIdentifierTracker,
    getPropertyList,
    getObjectPatternList,
    isModuleImported,
    hasExport,
    hasModuleHot,
    hasComment
};

