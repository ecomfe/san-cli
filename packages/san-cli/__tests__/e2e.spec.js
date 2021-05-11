// 运行测试的时间上限设为3分钟（默认是5秒，太短了不够用）
jest.setTimeout(180000);

const path = require('path');
const child_process = require('child_process');
const puppeteer = require('puppeteer');
const fse = require('fs-extra');
const portfinder = require('portfinder');
const rimraf = require('rimraf');

let browser;
let serve;

test('serve 命令和 build 命令的 E2E 测试', done => {
    // 用于创建测试项目的目录
    const cwd = path.join(__dirname, '../../test/e2e');

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

    try {
        init.stderr.on('data', data => {
            if (data.toString().includes('Download timeout')) {
                throw '你网络不行，用 HTTPS clone GitHub 的代码库时失败了，可以通过配置代理解决，不会配置的话可以找胡粤。';
            }
        });
    } catch (err) {
        throw err;
    }

    init.on('close', async () => {
        const configPath = path.join(cwd, 'san.config.js');
        fse.copySync(path.join(__dirname, './config/san.config.js'), configPath);

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
                    // 测试点1：是否用的 san.config 里配置的端口起的服务？（测 san.config 的 devserver.port）
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

        const outputPath = path.join(cwd, 'output');
        const baseTplPath = path.join(outputPath, 'template/base.tpl');
        const cssPath = path.join(outputPath, 'static/e2e/css');

        await new Promise((resolve, reject) => {
            fse.writeFileSync(path.join(cwd, '.env'), 'ONE=1');
            child_process.exec('san build --mode production --modern --report', {cwd}, (error, stdout, stderr) => {
                // 测试点4：产出目录的名字是否正确（测 san.config 的 outputDir）
                expect(fse.existsSync(outputPath)).toBeTruthy();

                const indexTplContent = fse.readFileSync(path.join(outputPath, 'template/index/index.tpl'), 'utf8');
                // 测试点5：产出的 tpl/html 里是否存在 <script type="module"></script>、<script nomodule></script>（测 --modern）
                expect(indexTplContent).toEqual(expect.stringContaining(' type="module"'));
                expect(indexTplContent).toEqual(expect.stringContaining('nomodule'));

                // 测试点6：smarty 的产出的 head 和 body 的 js 和 css 放对了吗（测 smarty）
                expect(indexTplContent).toEqual(expect.stringContaining('{%block name="__head_asset"%}<link'));
                expect(indexTplContent).toEqual(expect.stringContaining('{%block name="__body_asset"%}<script'));

                // 测试点7：静态资源路径是否正确（测 san.config 的 assetsDir）
                expect(fse.existsSync(path.join(outputPath, 'static/e2e'))).toBeTruthy();

                // 测试点8：多页面打包（除了 index 文件夹还应该有 demo 文件夹）（测 san.config 的 pages）
                expect(fse.existsSync(path.join(outputPath, 'template/demo'))).toBeTruthy();

                const jsPath = path.join(outputPath, 'static/e2e/js');
                const jsDir = fse.readdirSync(jsPath);
                const demoLegacyJSFileName = jsDir.find(filename => filename.match(/^(demo-legacy.)[a-z0-9]+(.js)$/));
                // 测试点9：产出的文件的名字是否含有 hash（测 san.conifg 的 filenameHashing）
                expect(demoLegacyJSFileName).toBeDefined();

                // 测试点10：产出的 modern 的 js 里的语法和非 modern 的 js 里的语法是否是不同的（modern 的 js 有新语法）(测 --modern)
                const demoLegacyJSContent = fse.readFileSync(path.join(jsPath, demoLegacyJSFileName), 'utf8');
                expect(demoLegacyJSContent).toEqual(expect.not.stringContaining('=>'));
                const demoJSFileName = jsDir.find(filename => filename.match(/^(demo.)[a-z0-9]+(.js)$/));
                const demoJSContent = fse.readFileSync(path.join(jsPath, demoJSFileName), 'utf8');
                expect(demoJSContent).toEqual(expect.stringContaining('=>'));

                // 测试点11：是否产出了 report.html 文件（测 --report）
                expect(fse.existsSync(path.join(outputPath, 'legacy-report.html'))).toBeTruthy();

                const baseTplContent = fse.readFileSync(baseTplPath, 'utf8');
                // 测试点12：产出的 tpl/html 里的 css 是否压缩了（测 production mode）
                expect(baseTplContent).toEqual(expect.stringContaining('margin:0;padding:0;'));

                // 测试点13：css 是否单独打包了（测 production mode）
                expect(fse.existsSync(cssPath)).toBeTruthy();

                const cssDir = fse.readdirSync(cssPath);
                const indexCSSFileName = cssDir.find(filename => filename.match(/^(index.)[a-z0-9]+(.css)$/));
                const indexCSSContent = fse.readFileSync(path.join(cssPath, indexCSSFileName), 'utf8');
                // 测试点14：产出的 css 是否压缩了（测 production mode）
                expect(indexCSSContent).toEqual(expect.stringContaining('margin:0;padding:0;'));

                // 测试点15：产出的 js 是否压缩了（测 production mode）
                expect(demoJSContent).toEqual(expect.not.stringMatching(/;\n(?!\/)/));

                const indexJSMapFileName = jsDir.find(filename => filename.match(/^(index.)[a-z0-9]+(.js.map)$/));
                // 测试点16：是否产出了 .map 文件（测 san.config 的 sourceMap)
                expect(indexJSMapFileName).toBeDefined();

                const vendorsLegacyJSMapFileName = jsDir.find(
                    filename => filename.match(/^(vendors-legacy.)[a-z0-9]+(.js.map)$/)
                );
                // 测试点17：是否成功拆包（测 san.config 的 splitChunks)
                expect(vendorsLegacyJSMapFileName).toBeDefined();

                const vendorsLegacyJSMapContent = fse.readFileSync(
                    path.join(jsPath, vendorsLegacyJSMapFileName),
                    'utf8'
                );
                // 测试点18：产出的 js 是否引入了 polyfill（测 babel）
                expect(vendorsLegacyJSMapContent).toEqual(expect.stringContaining('/core-js/'));

                // 测试点19：产出中的 classname 是否正确（css module）（测 san.conifg 的 css.requireModuleExtension）
                expect(indexCSSContent).toEqual(expect.not.stringContaining('_main_'));

                // 测试点20：产出的 tpl/html 是否引入了配置的拆包（测 san.config 的 pages.chunks）
                expect(indexTplContent).toEqual(expect.stringContaining('vendors'));

                const indexJSMapContent = fse.readFileSync(path.join(jsPath, indexJSMapFileName), 'utf8');
                // 测试点21：图片是否编译成了 base64（默认小于 1024 的图片会编译成 base64）
                expect(indexJSMapContent).toEqual(expect.stringContaining('data:image'));

                // 测试点22：是否编译了配置的 NPM 包里的 ES6 语法（测 san.config 的 transpileDependencies）
                expect(vendorsLegacyJSMapContent).toEqual(
                    expect.stringContaining('/core-js/modules/es.array.iterator.js')
                );

                const demoCSSFileName = cssDir.find(filename => filename.match(/^(demo.)[a-z0-9]+(.css)$/));
                const demoCSSContent = fse.readFileSync(path.join(cssPath, demoCSSFileName), 'utf8');
                // 测试点23：产出的 css 是否按配置自动补全了浏览器前缀（测 postcss 的 autoprefixer 和 browserslist）
                expect(demoCSSContent).toEqual(expect.stringContaining('display:-webkit-box;'));

                // 测试点24：.env 文件的环境变量是否被成功读取（测 .env 文件）
                expect(stdout).toEqual(expect.stringContaining('process.env.ONE: 1'));

                resolve();
            });
        });

        rimraf(outputPath, () => {
            let configContent = fse.readFileSync(configPath, 'utf8');
            configContent = configContent.replace('css: {', 'css: {requireModuleExtension: false,');
            configContent = configContent.replace('module.exports = {', 'module.exports = {largeAssetSize: 1,');
            fse.writeFile(configPath, configContent);
            child_process.exec('san build --mode development', {cwd}, () => {
                const baseTplContent = fse.readFileSync(baseTplPath, 'utf8');
                // 测试点25：产出的 tpl/html 里的 js 是否没压缩（测 development mode）
                expect(baseTplContent).toEqual(expect.stringMatching(/<script>[\s\S]+;\n[\s\S]+<\/script>/));
                // 测试点26：产出的 tpl/html 里的 css 是否没压缩（测 development mode）
                expect(baseTplContent).toEqual(expect.not.stringContaining('margin:0;padding:0;'));

                // 测试点27：css 是否没单独打包（测 development mode）
                expect(fse.existsSync(cssPath)).toBeFalsy();

                const indexJSPath = path.join(outputPath, 'index.js');
                // 测试点28：产出的文件的名字是否不含 hash（测 san.conifg 的 filenameHashing)
                expect(fse.existsSync(indexJSPath)).toBeTruthy();

                const indexJSContent = fse.readFileSync(indexJSPath, 'utf8');
                // 测试点29：产出的 js 是否没压缩（测 development mode）
                expect(indexJSContent).toEqual(expect.stringMatching(/;\n(?!\/)/));

                const indexJSMapPath = path.join(outputPath, 'index.js.map');
                // 测试点30：是否没产出 .map 文件（测 san.config 的 sourceMap)
                expect(fse.existsSync(indexJSMapPath)).toBeFalsy();

                // 测试点31：产出中的 classname 是否正确（css module）（测 san.conifg 的 css.requireModuleExtension）
                expect(indexJSContent).toEqual(expect.stringContaining('_main_'));

                // 测试点32：大于配置大小的图片是否没编译成 base64
                expect(indexJSContent).toEqual(expect.not.stringContaining('data:image'));

                done();
            });
        });
    });
});

afterAll(() => {
    browser && browser.close();
    serve && serve.kill();
});
