jest.setTimeout(32000);

const child_process = require('child_process');
const puppeteer = require('puppeteer');
const rimraf = require('rimraf');
const path = require('path');

const isWindows = process.platform === 'win32';

test('测试 serve .san 文件', done => {
    rimraf.sync(path.join(__dirname, '../../../node_modules/.cache'));
    const serve = child_process.spawn(
        'san',
        ['serve', './packages/san-cli/__tests__/san-file/index.san'],
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
            const contentText = await page.evaluate(() => document.querySelector('.content').textContent);
            expect(contentText).toMatch('Hello San!');
            const subComponentText = await page.evaluate(() => document.querySelector('.sub-component').textContent);
            // 测试子组件是否 import 成功了
            expect(subComponentText).toMatch('I am a sub component!');

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
