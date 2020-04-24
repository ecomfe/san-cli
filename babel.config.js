/**
 * @file babel config
 */
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ],
    plugins: [
        require('@babel/plugin-proposal-class-properties')
    ],
    exclude: 'node_modules'
};
