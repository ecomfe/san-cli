jest.setTimeout(10000);

const child_process = require('child_process');
const rimraf = require('rimraf');
const path = require('path');
const fse = require('fs-extra');

test('测试 build .san 文件', done => {
    const outputPath = path.join(__dirname, '../../../output');
    rimraf.sync(outputPath);
    child_process.exec('san build ./packages/san-cli/__tests__/san-file/index.san', (error, stdout, stderr) => {
        /* eslint-disable no-console */
        error && console.error(`exec error: ${error}`);
        stdout && console.log(`stdout: ${stdout}`);
        stderr && console.error(`stderr: ${stderr}`);
        /* eslint-enable no-console */

        const indexHTMLPath = path.join(outputPath, 'index.html');
        expect(fse.existsSync(indexHTMLPath)).toBeTruthy();
        const indexHTMLContent = fse.readFileSync(indexHTMLPath, 'utf8');
        expect(indexHTMLContent).toEqual(expect.stringContaining('src="/js/app.js"'));
        expect(indexHTMLContent).toEqual(expect.stringContaining('href="/css/app.css"'));
        expect(fse.existsSync(path.join(outputPath, 'js/app.js'))).toBeTruthy();
        const appCSSPath = path.join(outputPath, 'css/app.css');
        expect(fse.existsSync(appCSSPath)).toBeTruthy();
        const appCSSContent = fse.readFileSync(appCSSPath, 'utf8');
        // 测试 css 是否 import 成功了
        expect(appCSSContent).toEqual(expect.stringContaining('body{background-color:#ff0}'));

        done();
    });
});
