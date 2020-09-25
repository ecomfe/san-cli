/**
 * @file 项目表单的resolver
 * @author zttonly
*/
const prompts = require('../connectors/prompts');

module.exports = {
    Mutation: {
        promptAnswer: (root, {input}, context) => prompts.answerPrompt(input, context)
    }
};
