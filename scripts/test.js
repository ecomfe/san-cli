/**
 * @file test entry file
 */

const rawArgs = process.argv.slice(2);
const [packagename, filename] = rawArgs;

let regx;
if (packagename) {
    regx = `.*(${packagename}|san-cli-(${packagename}))/.*\\.spec\\.js$`;
    if (filename) {
        regx = `.*(${packagename}|san-cli-(${packagename}))/.*${filename}\\.spec\\.js$`;
    }
}

const jestArgs = [
    '--runInBand',
    '--coverage',
    ...(regx ? [regx] : [])
];

console.log(`running jest with args: ${jestArgs.join(' ')}`);

require('jest').run(jestArgs);



















