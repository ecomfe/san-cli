const path = require('path');
const spawn = require('cross-spawn');
const httpServer = require('http-server');
const server = httpServer.createServer({
    root: path.resolve(__dirname, './cypress/docs/output')
});

server.listen(8899);

let args = process.argv.slice(2);
const runner = spawn('./node_modules/.bin/cypress', args, {
    stdio: 'inherit'
});

runner.on('exit', function (code) {
    server.close();
    process.exit(code);
});

runner.on('error', function (err) {
    server.close();
    throw err;
});
