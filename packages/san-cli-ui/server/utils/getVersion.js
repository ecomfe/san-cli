/**
 * @file 远程获取包版本信息
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/dependencies.js
 */
const path = require('path');
const LRU = require('lru-cache');
const fs = require('fs');
const ini = require('ini');

const metadataCache = new LRU({
    max: 200,
    maxAge: 1000 * 60 * 30
});

function request(uri, opts) {
    const request = require('util').promisify(require('request'));
    const reqOpts = {
        method: 'GET',
        timeout: 30000,
        resolveWithFullResponse: true,
        json: true,
        uri,
        ...opts
    };
    return request(reqOpts);
}

async function getMetadata(args, full = false) {
    let {id, tool, registry, filePath} = args;
    const authToken = await getAuthToken(registry, filePath);

    const metadataKey = `${tool}-${registry}-${id}`;
    let metadata = metadataCache.get(metadataKey);

    if (metadata) {
        return metadata;
    }

    const headers = {};
    if (!full) {
        headers.Accept = 'application/vnd.npm.install-v1+json;q=1.0, application/json;q=0.9, */*;q=0.8';
    }

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const url = `${registry.replace(/\/$/g, '')}/${id}`;
    try {
        metadata = (await request(url, {headers})).body;

        if (metadata.error) {
            throw new Error(metadata.error);
        }
        metadataCache.set(metadataKey, metadata);
        return metadata;
    } catch (e) {
        throw e;
    }
}
async function getAuthToken(registry, filePath) {
    const possibleRcPaths = [
        path.resolve(filePath, '.npmrc'),
        path.resolve(require('os').homedir(), '.npmrc')
    ];

    let npmConfig = {};
    for (const loc of possibleRcPaths) {
        if (fs.existsSync(loc)) {
            try {
                npmConfig = Object.assign({}, ini.parse(fs.readFileSync(loc, 'utf-8')), npmConfig);
            } catch (e) {
            }
        }
    }

    const registryWithoutProtocol = registry
        .replace(/https?:/, '')
        .replace(/([^/])$/, '$1/');
    const authTokenKey = `${registryWithoutProtocol}:_authToken`;
    return npmConfig[authTokenKey];
}

module.exports = {
    getMetadata
};
