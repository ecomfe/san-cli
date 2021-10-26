exports.command = 'build [entry]';
exports.description = 'Compiles an app into an output directory named dist';

exports.builder = {
    'no-progress': {
        type: 'boolean',
        default: false,
        hidden: true,
        describe: 'Do not show the progress bar'
    },
    config: {
        alias: 'config-file',
        type: 'string',
        hidden: true,
        describe: 'Project config file'
    },
    mode: {
        alias: 'm',
        hidden: true,
        type: 'string',
        choices: ['development', 'production'],
        describe: 'Operating environment'
    },
    profile: {
        alias: 'profiler',
        hidden: true,
        type: 'boolean',
        default: false,
        describe: 'Show Webpack profiler log'
    },
    dashboard: {
        hidden: true,
        type: 'boolean',
        default: false,
        describe: 'To send ipc message to ui-dashboard'
    },

    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Watch mode'
    },
    analyze: {
        alias: 'analyzer',
        type: 'boolean',
        default: false,
        describe: 'Enable webpack-bundle-analyzer server'
    },
    'clean': {
        type: 'boolean',
        default: false,
        describe: 'Delete the output directory before building'
    },
    'no-colors': {
        alias: 'no-color',
        type: 'boolean',
        default: false,
        describe: 'Colorless log'
    },
    modern: {
        type: 'boolean',
        default: false,
        describe: 'Modern mode'
    },
    'stats-json': {
        alias: 'stats',
        type: 'boolean',
        default: false,
        describe: 'Generate webpack stats JSON file'
    },
    report: {
        type: 'boolean',
        default: false,
        describe: 'Generate bundle report HTML/JSON file'
    },
    // 'no-minimize': {
    //     type: 'boolean',
    //     hidden: true,
    //     default: false,
    //     describe: 'Do not open minimize'
    // },
    remote: {
        type: 'string',
        alias: 'r',
        describe: 'Send compiled output to the remote target machine'
    },
    dest: {
        alias: 'd',
        type: 'string',
        describe: 'Output file path'
    }
};

exports.handler = argv => {
    if (!argv.mode) {
        if (['development', 'production'].includes(process.env.NODE_ENV)) {
            argv.mode = process.env.NODE_ENV;
        } else {
            argv.mode = 'production';
        }
    }
    const Service = require('san-cli-service');
    const service = new Service(process.cwd(), {watch: argv.watch, useDashboard: argv.dashboard});
    const run = require('./run');
    service.run('build', argv).then(run.bind(run, argv));
};
