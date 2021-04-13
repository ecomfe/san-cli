// 运行测试的时间上限设为5分钟（默认是5秒，太短了不够用）
jest.setTimeout(300000);

const path = require('path');
const child_process = require('child_process');
const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const portfinder = require('portfinder');

test('测试 serve 命令', done => {
    // 用于创建测试项目的目录
    const cwd = path.resolve(__dirname, '../../test/e2e');

    const cmdArgs = [
        'init',
        'https://github.com/ksky521/san-project',
        cwd,
        `--project-presets='{
            "name": "e2e-serve",
            "description": "A San project",
            "author": "Lohoyo",
            "tplEngine": "smarty",
            "lint": false,
            "demo": true,
            "demoType": "normal",
            "cssPreprocessor": "less"
        }'`,
        '--install'
    ];
    // 创建测试项目
    const init = child_process.spawn('san', cmdArgs);

    init.stderr.on('data', data => {
        if (data.toString().includes('Download timeout')) {
            throw '你网络不行啊，没能从 GitHub 上把脚手架模板下载下来。';
        }
    });

    init.on('close', async () => {
        const configPath = path.join(cwd, 'san.config.js');
        fse.copySync(path.resolve(__dirname, './config/san.config.js'), configPath);
        const port = await portfinder.getPortPromise();
        fse.writeFile(configPath, fse.readFileSync(configPath, 'utf8').replace('8899', port));
        const serve = child_process.spawn('san', ['serve'], {cwd});

        let isFirstCompilation = true;
        let browser;
        let page;
        serve.stdout.on('data', async data => {
            const urlMatch = data.toString().match(/http:\/\/[\d\.:]+/);
            // 是否输出了 URL（输出了 URL 意味着服务起来了）
            if (urlMatch) {
                const url = urlMatch[0];
                // 测试点1：是否用的 san.config 里配置端口的起的服务？（测 san.config 的 devserver.port）
                expect(url).toEqual(expect.stringContaining('' + port));

                browser = await puppeteer.launch();
                page = await browser.newPage();
                await page.goto(url + '/template/index/index.tpl');
                const h2Text = await page.evaluate(() => document.querySelector('h2').textContent);
                // 测试点2：页面正常跑起来了没？
                expect(h2Text).toMatch('Hello world, I am OK~');

                const appPath = path.join(cwd, 'src/pages/index/containers/app.js');
                // 修改测试项目代码以测试 HMR
                fse.writeFile(appPath, fse.readFileSync(appPath, 'utf8').replace('I am OK', 'I have been updated'));
            }
            // 测试 HMR
            if (data.toString().match('Compiled successfully')) {
                // 第二次编译成功时才是 HMR（第一次编译成功时是初次起服务）
                if (isFirstCompilation) {
                    isFirstCompilation = false;
                } else {
                    // 等待页面内容更新
                    await page.waitForFunction(
                        selector => document.querySelector(selector).textContent.includes('updated'), {}, 'h2'
                    );
                    const h2Text = await page.evaluate(() => document.querySelector('h2').textContent);
                    // 测试点1：HMR 好使不？
                    expect(h2Text).toMatch('Hello world, I have been updated~');

                    browser.close();
                    serve.kill();
                    done();
                }
            }
        });
    });
});
