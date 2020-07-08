/**
 * @file 终止一个进程
*/
const util = require('util');
const cp = require('child_process');
const path = require('path');
const {currentOS} = require('san-cli-utils/env');
const execFile = util.promisify(cp.execFile);
const spawn = util.promisify(cp.spawn);

module.exports = async (processX, cwd) => {
    if (currentOS.isWindows) {
        const options = {
            stdio: ['pipe', 'pipe', 'ignore']
        };
        if (cwd) {
            options.cwd = cwd;
        }
        try {
            // Windows下使用 taskkill 命令结束进程
            await execFile('taskkill', ['/T', '/F', '/PID', processX.pid.toString()], options);
        }
        catch (error) {
            return {
                success: false,
                error
            };
        }
    }
    else if (currentOS.isLinux || currentOS.isMacintosh) {
        const cmd = path.resolve(__dirname, './terminate.sh');
        try {
            const result = await spawn(cmd, [processX.pid.toString()], {
                cwd
            });
            if (result.error) {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error
            };
        }
    }
    else {
        processX.kill('SIGKILL');
    }
    return {
        success: true
    };
};
