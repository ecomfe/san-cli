const boxen = require('boxen');
const chalk = require('chalk');

exports.newVersionLog = (currentVersion, latestVersion) => {
    const message = `Update available ${chalk.dim(currentVersion)} ${chalk.reset('→')} ${chalk.green(latestVersion)}
Run ${chalk.cyan('npm i -g @baidu/hulk-cli')} to update`;

    console.log(
        boxen(message, {
            padding: 1,
            margin: 1,
            align: 'center',
            borderColor: 'yellow',
            borderStyle: 'round'
        })
    );
};
