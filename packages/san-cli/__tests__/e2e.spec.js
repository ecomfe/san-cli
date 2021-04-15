// 运行测试的时间上限设为6分钟（默认是5秒，太短了不够用）
jest.setTimeout(360000);

const path = require('path');
const child_process = require('child_process');
const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const portfinder = require('portfinder');

let browser;
let serve;

test('serve 命令和 build 命令的 E2E 测试', done => {
    // 用于创建测试项目的目录
    const cwd = path.resolve(__dirname, '../../test/e2e');

    const cmdArgs = [
        'init',
        'https://github.com/ksky521/san-project',
        cwd,
        `--project-presets='{
            "name": "e2e",
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
            throw '你网络不行啊，没能从 GitHub 上把脚手架模板下载下来，不信的话你随便 clone 个 GitHub 上的代码库试试。';
        }
    });

    init.on('close', async () => {
        const configPath = path.join(cwd, 'san.config.js');
        fse.copySync(path.resolve(__dirname, './config/san.config.js'), configPath);

        const port = await portfinder.getPortPromise();
        fse.writeFile(configPath, fse.readFileSync(configPath, 'utf8').replace('8899', port));
        serve = child_process.spawn('san', ['serve'], {cwd});

        let isFirstCompilation = true;
        let page;
        await new Promise((resolve, reject) => {
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

                    const appJSPath = path.join(cwd, 'src/pages/index/containers/app.js');
                    // 修改测试项目代码以测试 HMR
                    fse.writeFile(
                        appJSPath,
                        fse.readFileSync(appJSPath, 'utf8').replace('I am OK', 'I have been updated')
                    );
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
                        // 测试点3：HMR 好使不？
                        expect(h2Text).toMatch('Hello world, I have been updated~');

                        resolve();
                    }
                }
            });
        });

        await new Promise((resolve, reject) => {
            child_process.exec('san build --mode production --modern --report', {cwd}, () => {
                const indexTplContent = fse.readFileSync(path.join(cwd, 'output/template/index/index.tpl'), 'utf8');
                // 测试点4：产出的 tpl/html 里是否存在 <script type=module></script>、<script nomodule></script>（测 --modern）
                expect(indexTplContent).toEqual(expect.stringContaining('type=module'));
                expect(indexTplContent).toEqual(expect.stringContaining('nomodule'));

                const jsPath = path.join(cwd, 'output/static/e2e/js');
                const jsDir = fse.readdirSync(jsPath);
                // 测试点5：产出的文件的名字是否含有 hash（测 san.conifg 的 filenameHashing）
                const demoLegacyJSFileName = jsDir.find(filename => filename.match(/^(demo-legacy.)[a-z0-9]+(.js)$/));
                expect(demoLegacyJSFileName).toBeDefined();

                // 测试点6：产出的 modern 的 js 里的语法和非 modern 的 js 里的语法是否是不同的（modern 的 js 有新语法）(测 --modern)
                const demoLegacyJSContent = fse.readFileSync(path.join(jsPath, demoLegacyJSFileName), 'utf8');
                expect(demoLegacyJSContent).toEqual(expect.not.stringContaining('=>'));
                const demoJSFileName = jsDir.find(filename => filename.match(/^(demo.)[a-z0-9]+(.js)$/));
                const demoJSContent = fse.readFileSync(path.join(jsPath, demoJSFileName), 'utf8');
                expect(demoJSContent).toEqual(expect.stringContaining('=>'));

                // 测试点7：是否产出了 report.html 文件（测 --report）
                expect(fse.existsSync(path.resolve(cwd, 'output/legacy-report.html'))).toBeTruthy();

                const baseTplContent = fse.readFileSync(path.join(cwd, 'output/template/base.tpl'), 'utf8');
                // 测试点8：产出的 tpl/html 里的 css 是否压缩了（测 production mode）
                expect(baseTplContent).toEqual(expect.stringContaining('margin:0;padding:0;'));

                // 测试点9：css 是否单独打包了（测 production mode）
                expect(fse.existsSync(path.resolve(cwd, 'output/static/e2e/css'))).toBeTruthy();

                const cssPath = path.join(cwd, 'output/static/e2e/css');
                const cssDir = fse.readdirSync(cssPath);
                const indexCSSFileName = cssDir.find(filename => filename.match(/^(index.)[a-z0-9]+(.css)$/));
                const indexCSSContent = fse.readFileSync(path.join(cssPath, indexCSSFileName), 'utf8');
                // 测试点10：产出的 css 是否压缩了（测 production mode）
                expect(indexCSSContent).toEqual(expect.stringContaining('margin:0;padding:0;'));

                // 测试点11：产出的 js 是否压缩了（测 production mode）
                expect(demoJSContent).toEqual(expect.not.stringMatching(/;\n(?!\/)/));

                // 测试点12：是否产出了 .map 文件（测 san.config 的 sourceMap)
                const indexJSMapFileName = jsDir.find(filename => filename.match(/^(index.)[a-z0-9]+(.js.map)$/));
                expect(indexJSMapFileName).toBeDefined();

                // 测试点13：是否成功拆包（测 san.config 的 splitChunks)
                const vendorsLegacyJSMapFileName = jsDir.find(
                    filename => filename.match(/^(vendors-legacy.)[a-z0-9]+(.js.map)$/)
                );
                expect(vendorsLegacyJSMapFileName).toBeDefined();

                const vendorsLegacyJSMapContent = fse.readFileSync(
                    path.join(jsPath, vendorsLegacyJSMapFileName),
                    'utf8'
                );
                // 测试点14：产出的 js 是否引入了 polyfill（测 babel）
                expect(vendorsLegacyJSMapContent).toEqual(expect.stringContaining('/core-js/'));

                // 测试点15：产出中的 classname 是否正确（css module）（测 san.conifg 的 css.requireModuleExtension）
                expect(indexCSSContent).toEqual(expect.not.stringContaining('_main_'));

                resolve();
            });
        });

        child_process.exec('san build --mode development', {cwd}, () => {
            // todo 测试 development mode

            done();
        });
    });
});

afterAll(async () => {
    await browser.close();
    serve.kill();
});
