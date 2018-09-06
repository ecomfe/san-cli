function findNpm() {
    var npms = process.platform === 'win32' ? ['tnpm.cmd', 'cnpm.cmd', 'npm.cmd'] : ['tnpm', 'cnpm', 'npm'];
    for (var i = 0; i < npms.length; i++) {
        try {
            which.sync(npms[i]);
            console.log('use npm: ' + npms[i]);
            return npms[i];
        }
        catch (e) {}
    }
    throw new Error('please install npm');
}
