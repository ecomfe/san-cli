const resolve = require('resolve');
const createRule = require('./createRule');

module.exports = chainConfig => {
    createRule(chainConfig, 'fonts', /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, [['url', {dir: 'fonts'}]]);
    createRule(chainConfig, 'img', /\.(png|jpe?g|gif|webp)(\?.*)?$/, [['url', {dir: 'img'}]]);
    createRule(chainConfig, 'media', /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, [
        [
            'url',
            {
                dir: 'media'
            }
        ]
    ]);
};
