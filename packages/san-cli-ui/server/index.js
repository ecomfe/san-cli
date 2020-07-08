/**
 * @file san cli ui入口
 * @author jinzhan, zttonly
 */
const path = require('path');
const http = require('http');
const express = require('express');
const portfinder = require('portfinder');
const fallback = require('express-history-api-fallback');
const {getDebugLogger, warn} = require('san-cli-utils/ttyLogger');
const {textBold} = require('san-cli-utils/randomColor');

const server = require('./main');
const debug = getDebugLogger('UI Server');
const app = express();

module.exports = options => {
    const {
        host = '0.0.0.0',
        port = 8333,
        distPath,
        publicPath,
        graphqlPath,
        subscriptionsPath,
        cors
    } = options;

    const apolloServer = server(subscriptionsPath);
    app.use(express.static(distPath));
    app.use('/public', express.static(publicPath));

    // 默认页面为dist/index.html
    app.use(fallback(path.join(distPath, 'index.html')));

    // 集成Apollo GraphQL中间件
    apolloServer.applyMiddleware({
        app,
        path: graphqlPath,
        cors
    });

    return new Promise(async (resolve, reject) => {
        // 查找空闲的 port
        const origPort = (portfinder.basePort = parseInt(port, 10));
        const serverPort = await portfinder.getPortPromise();

        if (origPort !== serverPort) {
            warn(`${port} is already in used, using ${textBold(serverPort)} to start server`);
        }

        const httpServer = http.createServer(app);
        apolloServer.installSubscriptionHandlers(httpServer);
        httpServer.listen(
            {
                host,
                port: serverPort
            },
            () => {
                debug(`Server ready on http://localhost:${port}${graphqlPath}`);
                debug(`Subscriptions ready on ws://localhost:${port}${subscriptionsPath}`);
                resolve({
                    host,
                    port: serverPort
                });
            }
        );
    });
};