/**
 * @file inspect command tests
 */

const {getReportFileName} = require('../../lib/utils');

describe('lib/utils getReportFileName', () => {
    test('default', () => {
        const filename1 = getReportFileName(false, '');
        expect(filename1).toEqual('report.html');
        const filename2 = getReportFileName(false, '', 'stats.json');
        expect(filename2).toEqual('stats.json');

    });
    test('prefixer', () => {
        const filename1 = getReportFileName(false, 'modern-');
        expect(filename1).toEqual('./modern-report.html');
        const filename2 = getReportFileName(false, 'modern-', 'stats.json');
        expect(filename2).toEqual('./modern-stats.json');
    });
    test('report.html prefixer', () => {
        const filename1 = getReportFileName(true, 'modern-');
        expect(filename1).toEqual('./modern-report.html');
        const filename2 = getReportFileName(true, 'modern-', 'stats.json');
        expect(filename2).toEqual('./modern-stats.json');
    });
    test('string path prefixer', () => {
        const filename1 = getReportFileName('test/a/b', 'modern-');
        expect(filename1).toEqual('test/a/modern-b.html');
        const filename2 = getReportFileName('test.html', 'modern-', 'stats.json');
        expect(filename2).toEqual('./modern-test.html');
        const filename3 = getReportFileName('test', '', 'stats.json');
        expect(filename3).toEqual('test.json');
        const filename4 = getReportFileName('test', 'a', 'stats.json');
        expect(filename4).toEqual('./atest.json');
    });
});
