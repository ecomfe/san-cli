/**
 * @file hulk doc 生成文档
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = program => {
    program
        .command('doc')
        .description('根据san组件的MD文档生成组件文档静态网站')
        .option('-s, --set <path>', '指定配置文件set.js的路径')
        .action(cmd => {
            loadCommand('gendoc', cleanArgs(cmd));
        });
};
