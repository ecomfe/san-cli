/**
 * @file 向entryFiles中注入polyfill，补充core-js自动添加的不足
 *    比较典型的场景：es.promise这个polyfill的一些浏览器兼容性问题
 */

const {addSideEffect} = require('@babel/helper-module-imports');

const modulePathMap = {
    'regenerator-runtime': 'regenerator-runtime/runtime.js'
};

function createImport(path, mod) {
    const modulePath = modulePathMap[mod] || `core-js/modules/${mod}`;
    return addSideEffect(path, modulePath);
}

module.exports = ({types}, {polyfills, entryFiles = []}) => {
    return {
        name: 'san-cli-inject-polyfills',
        visitor: {
            Program(path, state) {
                // console.log({entryFiles, stateFilename: state.filename})

                if (!entryFiles.includes(state.filename)) {
                    return;
                }

                // 复制一份进行倒序，保证添加的语句是按照之前的顺序
                polyfills.slice().reverse().forEach(polyfill => {
                    createImport(path, polyfill);
                });
            }
        }
    };
};
