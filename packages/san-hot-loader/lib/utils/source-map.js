/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file source-map.js
 * @author clark-t
 */

const path = require('path');

const sourceMap = require('source-map');
const splitRE = /\r?\n/g;
const emptyRE = /^(?:\/\/)?\s*$/;

async function appendWithSourceMap(source, suffix, map) {
    let consumer = await new sourceMap.SourceMapConsumer(map);
    let node = sourceMap.SourceNode.fromStringWithSourceMap(source, consumer);
    node.add(suffix);
    let result = node.toStringWithSourceMap();
    return {
        code: result.code,
        map: result.map.toJSON()
    };
}

function appendWithoutSourceMap(source, suffix, filePath, sourceRoot) {
    let generator = new sourceMap.SourceMapGenerator({
        filePath,
        sourceRoot
    });

    generator.setSourceContent(filePath, source);
    let output = source + '\n' + suffix;

    let sourceLen = source.split(splitRE).length;
    output.split(splitRE).forEach((line, index) => {
        if (emptyRE.test(line)) {
            return;
        }

        if (index < sourceLen) {
            generator.addMapping({
                source: filePath,
                original: {
                    line: index + 1,
                    column: 0
                },
                generated: {
                    line: index + 1,
                    column: 0
                }
            });
        }
        else {
            generator.addMapping({
                source: filePath,
                original: {
                    line: sourceLen,
                    column: 0
                },
                generated: {
                    line: index + 1,
                    column: 0
                }
            });
        }
    });

    return {
        code: output,
        map: generator.toJSON()
    };
}

async function append(source, suffix, {
    inputSourceMap,
    resourcePath
}) {
    if (inputSourceMap) {
        // no-return-await
        const result = await appendWithSourceMap(source, suffix, inputSourceMap);
        return result;
    }
    const sourceRoot = path.dirname(resourcePath);
    return appendWithoutSourceMap(source, suffix, resourcePath, sourceRoot);
}

module.exports = {
    append,
    appendWithSourceMap,
    appendWithoutSourceMap
};

