/**
 * @file source-map.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

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
    filePath,
    sourceRoot
}) {
    if (inputSourceMap) {
        // no-return-await
        const result = await appendWithSourceMap(source, suffix, inputSourceMap);
        return result;
    }

    return appendWithoutSourceMap(source, suffix, filePath, sourceRoot);
}

module.exports = {
    append,
    appendWithSourceMap,
    appendWithoutSourceMap
};

