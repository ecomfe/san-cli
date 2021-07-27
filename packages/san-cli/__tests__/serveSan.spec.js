jest.setTimeout(30000);

const child_process = require('child_process');
const puppeteer = require('puppeteer');
const rimraf = require('rimraf');
const path = require('path');

const isWindows = process.platform === 'win32';

test('测试 serve .san 文件', done => {
    rimraf.sync(path.join(__dirname, '../../../node_modules/.cache'));
    const serve = child_process.spawn(
        'san',
        ['serve', './packages/san-cli/__tests__/san-file/hello.san'],
        {shell: isWindows}
    );
    serve.stderr.on('data', data => {
        // eslint-disable-next-line no-console
        console.error(`stderr: ${data}`);
    });
    serve.stdout.on('data', async data => {
        // eslint-disable-next-line no-console
        console.log(`stdout: ${data}`);
        const urlMatch = data.toString().match(/http:\/\/[\d\.:]+/);
        if (urlMatch) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(urlMatch[0]);
            const text = await page.evaluate(() => document.querySelector('.content').textContent);
            expect(text).toMatch('Hello San!');
            await browser.close();
            if (isWindows) {
                child_process.spawn('taskkill', ['/pid', serve.pid, '/f', '/t']);
            } else {
                serve.kill();
            }
            done();
        }
    });
});
