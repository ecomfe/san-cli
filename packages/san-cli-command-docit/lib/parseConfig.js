/**
 * @file load config file
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const fs = require('fs');
const yamlParser = require('js-yaml');
const tomlParser = require('toml');


function parseConfig(file, content) {
    content = content ? content : fs.readFileSync(file, 'utf-8');
    const [extension] = /.\w+$/.exec(file);
    let data;

    switch (extension) {
        case '.yml':
        case '.yaml':
            data = yamlParser.safeLoad(content);
            break;

        case '.toml':
            data = tomlParser.parse(content);
            // reformat to match config since TOML does not allow different data type
            // https://github.com/toml-lang/toml#array
            const format = [];
            if (data.head) {
                Object.keys(data.head).forEach(meta => {
                    data.head[meta].forEach(values => {
                        format.push([meta, values]);
                    });
                });
            }
            data.head = format;
            break;
    }

    return data || {};
}

module.exports = parseConfig;
