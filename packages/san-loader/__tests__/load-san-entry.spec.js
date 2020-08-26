/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @author harttle
 */

const loader = require('../lib/loader');
const webpackContext = require('./webpack-context.stub');

describe('.san 文件的产出', () => {
    test('整体框架', () => {
        const source = `
        <template>
            <span class="{{$style.red}}">Author: harttle</span>
        </template>
        <style module>.red { color: red }</style>
        <script>
            export default class CompComponent extends Component {
                attached() { console.log('attached') }
            }
        </script>
        `;
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('var normalize = require');
        expect(ctx.code).toContain('var template = require');
        expect(ctx.code).toContain('var script = require');
        expect(ctx.code).toContain('var style0 = require');
        expect(ctx.code).toContain('var injectStyles = [style0]');
        expect(ctx.code).toContain('module.exports = normalize(script, template, injectStyles)');
    });

    test('import <template> 部分', () => {
        const source = '<template><span>Author: harttle</span></template>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('var template = require(\'/foo.san?lang=html&san=&type=template');
    });

    test('import <style> 部分', () => {
        const source = '<style>p {color: black}</style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('require(\'/foo.san?lang=css&san=&type=style&index=0');
    });

    test('import <style module>', () => {
        const source = '<style module>p {color: black}</style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('var style0 = require(\'/foo.san?lang=css&module=&san=&type=style&index=0');
    });

    test('import <style module src="./s.less">', () => {
        const source = '<style module src="./s.less"></style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('var style0 = require(\'./s.less?module=\'');
    });

    test('import <script> 部分', () => {
        const source = '<script>console.log(1)</style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('var script = require(\'/foo.san?lang=js&san=&type=script');
    });
});
