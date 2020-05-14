/**
 * @file server 入口文件
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const http = require('http');

const express = require('express');
const portfinder = require('portfinder');
const fallback = require('express-history-api-fallback');

const {warn} = require('san-cli-utils/ttyLogger');
const {textBold} = require('san-cli-utils/randomColor');

const server = require('./apollo-server');

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
        app.get('/', (req, res) => {
            res.send('Hello World');
        });

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
            warn(`${port} 被占用，使用${textBold(serverPort)}启动 server`);
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
                console.log(`🚀 Server ready at http://localhost:${port}${graphqlPath}`);
                console.log(`🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`);
                resolve({
                    host,
                    port: serverPort
                });
            }
        );
    });
}
module.exports = createServer;
