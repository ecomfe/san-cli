/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file service
 * @author ksky521
 */

module.exports = (name, api, callback) => {
    const Service = require('san-cli-service');
    const flatten = require('san-cli-utils/utils').flatten;
    const cwd = api.getCwd();

    const {configFile, noProgress, profile, mode = process.env.NODE_ENV, watch} = api;

    // 处理 rc 文件传入的 Service Class arguments
    let {servicePlugins: plugins, useBuiltInPlugin = true, projectOptions} = api.getPresets() || {};

    const service = new Service(name, {
        cwd,
        configFile,
        watch,
        mode,
        useBuiltInPlugin,
        projectOptions,
        plugins: flatten(plugins),
        useProgress: !noProgress,
        useProfiler: profile
    });
    service.run(callback);
    return service;
};
