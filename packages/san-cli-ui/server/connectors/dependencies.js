/**
 * @file 依赖管理
 * @author jinzhan
 */

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const semver = require('semver');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const {isPlugin} = require('../utils/plugin');
const {packageManager} = require('../utils/packageManager');
const {getRegistry} = require('../utils/getRegistry');
const cwd = require('./cwd');
const {readPackage} = require('../utils/fileHelper');
const {resolveModule, resolveModuleRoot} = require('../utils/module');
const {getMetadata} = require('../utils/getMetadata');
const debug = getDebugLogger('ui:dependencies');

const PACKAGE_INSTALL_CONFIG = {
    npm: {
        install: ['install', '--loglevel', 'error'],
        add: ['install', '--loglevel', 'error'],
        upgrade: ['update', '--loglevel', 'error'],
        remove: ['uninstall', '--loglevel', 'error']
    },
    yarn: {
        install: [],
        add: ['add'],
        upgrade: ['upgrade'],
        remove: ['remove']
    }
};

class Dependencies {
    constructor() {
        this.dependencies = [];
    }

    getPath({
        id,
        file = cwd.get()
    }) {
        // 检测每个模块是否有package.json
        const getfilePath = resolveModule(path.join(id, 'package.json'), file);
        if (!getfilePath) {
            return;
        }
        // 检测node_modules是否安装该模块
        return resolveModuleRoot(getfilePath, id);
    }

    isInstalled(id) {
        const resolvedPath = this.getPath({id});
        return resolvedPath && fs.existsSync(resolvedPath);
    }

    getLink(id) {
        let idPath = this.getPath({id});
        const pkg = readPackage(idPath);
        return pkg.homepage || (pkg.repository && pkg.repository.url)
            || `https://www.npmjs.com/package/${id.replace('/', '%2F')}`;
    }

    findDependencies(deps, type, file) {
        return Object.keys(deps).filter(
            id => !isPlugin(id)
        ).map(
            id => ({
                id,
                versionRange: deps[id],
                installed: this.isInstalled(id),
                website: this.getLink(id),
                type,
                baseFir: file
            })
        );
    }

    list() {
        const pkg = readPackage(cwd.get(), true);
        this.dependencies = this.findDependencies(pkg.devDependencies || {}, 'devDependencies')
            .concat(this.findDependencies(pkg.dependencies || {}, 'dependencies'));
        return this.dependencies;
    }

    findOne(id) {
        return this.dependencies.find(
            p => p.id === id
        );
    }

    async runCommand(type, args) {
        const $cwd = cwd.get();

        debug('runCommand:', {
            type,
            args,
            cwd: $cwd
        });

        const pm = packageManager($cwd);

        // npm安装依赖
        return await execa(pm, [
            ...PACKAGE_INSTALL_CONFIG[pm][type],
            ...(args || [])
        ], {
            cwd: $cwd,
            stdio: ['inherit', 'inherit', 'inherit']
        });
    }

    async install({id, type, range}) {
        const pkg = range ? `${id}@${range}` : id;
        const dev = type === 'devDependencies' ? ['-D'] : [];
        // npm安装依赖
        await this.runCommand('add', [pkg, ...dev]);
        return this.findOne(id);
    }

    async unInstall(args) {
        let {
            id
        } = args;
        let deleteData = this.findOne(id);
        // 卸载npm安装依赖
        await this.runCommand('remove', [id]);
        return deleteData;
    }

    async getDescription({id}, context) {
        const metadata = await getMetadata(id, context) || {};
        return metadata.description;
    }

    async getVersion({id}) {
        let current;
        let pm = packageManager(cwd.get());
        const registry = await getRegistry(pm);

        let idPath = this.getPath({
            id
        });
        const pkg = readPackage(idPath);
        current = pkg.version;

        let latest = '';
        let wanted = '';
        let versionRange = '';

        const metadata = await getMetadata({
            id,
            pm,
            registry,
            filePath: cwd.get()
        });

        if (metadata) {
            latest = metadata['dist-tags'].latest;

            const versions = Array.isArray(metadata.versions) ? metadata.versions : Object.keys(metadata.versions);
            versionRange = (this.findOne(id) || {}).versionRange;
            wanted = semver.maxSatisfying(versions, versionRange);
        }

        if (!latest) {
            latest = current;
        }

        if (!wanted) {
            wanted = current;
        }

        return {
            current,
            latest,
            wanted,
            range: versionRange
        };
    }
};

module.exports = new Dependencies();
