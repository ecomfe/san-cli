/**
 * @file server 入口文件
 * @author zttonly
 */
const path = require('path');
const http = require('http');

const express = require('express');
const portfinder = require('portfinder');
const fallback = require('express-history-api-fallback');

const {getDebugLogger, warn} = require('san-cli-utils/ttyLogger');
const {textBold} = require('san-cli-utils/randomColor');

const server = require('./main');
const debug = getDebugLogger('ui server');
const app = express();

function createServer(options) {
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

    return new Promise(async (resolve, reject) => {
        // 静态资源 & public & fallback
        app.use(express.static(distPath));
        app.use('/public', express.static(publicPath));
        app.use(fallback(path.join(distPath, 'index.html')));

        // 集成Apollo GraphQL中间件
        apolloServer.applyMiddleware({
            app,
            path: graphqlPath,
            cors
        });

        // 查找空闲的 port
        const origPort = (portfinder.basePort = parseInt(port, 10));
        const serverPort = await portfinder.getPortPromise();
        if (origPort !== serverPort) {
            warn(`${port} is already in used, using ${textBold(serverPort)} to start server`);
        }

        // Start server
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
}
module.exports = createServer;
