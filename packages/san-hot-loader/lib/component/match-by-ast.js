/**
 * @file check-component-by-ast.js
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
        return false;
    }

    if (!isModuleImported(ast, 'san')) {
        return false;
    }

    const defaultModule = getExportDefault(ast);
    if (!defaultModule) {
        return false;
    }

    let trackers = getTopLevelIdentifierTracker(ast, defaultModule);
    if (!trackers) {
        return false;
    }

    let component = getSanStoreConnectComponent(ast, trackers[0]) || trackers[0];
    return isSanComponent(ast, component);
};

function isSanComponent(ast, node) {
    let trackers = getTopLevelIdentifierTracker(ast, node);
    if (!trackers) {
        return false;
    }

    let apiName;
    let subNode;

    let component = trackers[0];
    // san.defineComponent({})
    if (component.type === 'CallExpression') {
        apiName = 'defineComponent';
        subNode = component.callee;
    }
    // class Comp extends san.Component {}
    else if (component.type === 'ClassDeclaration' || component.type === 'ClassExpression') {
        apiName = 'Component';
        subNode = component.superClass;
    }
    // function Comp(options) { san.Component(this, options) }
    else if (component.type === 'FunctionDeclaration'
        && component.params.length === 1
    ) {
        for (let statement of component.body.body) {
            if (statement.type === 'ExpressionStatement'
                && statement.expression.type === 'CallExpression'
                && statement.expression.arguments.length === 2
                && statement.expression.arguments[0]
                && statement.expression.arguments[0].type === 'ThisExpression'
                && statement.expression.arguments[1]
                && (statement.expression.callee.type === 'Identifier'
                || statement.expression.callee.type === 'MemberExpression')
            ) {
                apiName = 'Component';
                subNode = statement.expression.callee;
            }
        }
    }

    if (!subNode) {
        return false;
    }

    return isImportedAPI(ast, subNode, 'san', apiName);
}

function getSanStoreConnectComponent(ast, node) {
    if (!isModuleImported(ast, 'san-store')) {
        return;
    }

    let trackers = getTopLevelIdentifierTracker(ast, node);
    if (!trackers || trackers.length !== 1) {
        return;
    }

    let connectNode = trackers[0];
    if (connectNode.type !== 'CallExpression'
        || connectNode.callee.type !== 'CallExpression'
    ) {
        return;
    }

    trackers = getTopLevelIdentifierTracker(ast, connectNode.callee.callee);
    if (!trackers) {
        return;
    }
    // 示例:
    // import {connect} from 'san-store'
    // connect.san({}, {})(component)
    if (val(trackers[trackers.length - 1]) === 'san'
        && isImportedAPI(ast, trackers.slice(0, -1), 'san-store', 'connect')
    ) {
        return connectNode.arguments[0];
    }
    // 示例:
    // import {connect} from 'san-store'
    // let connector = connect.createConnector(store)
    // connector({})(component)
    if (trackers.length !== 1
        || trackers[0].type !== 'CallExpression'
    ) {
        return;
    }

    trackers = getTopLevelIdentifierTracker(ast, trackers[0].callee);
    if (trackers
        && val(trackers[trackers.length - 1]) === 'createConnector'
        && isImportedAPI(ast, trackers.slice(0, -1), 'san-store', 'connect')
    ) {
        return connectNode.arguments[0];
    }
}

