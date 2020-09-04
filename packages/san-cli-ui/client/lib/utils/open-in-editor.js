/**
 * @file 调起编辑器，打开目标路径
*/

import $apollo from '@lib/apollo-client';
import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';

/**
 * @param {string} 文件路径
*/
export const openInEditor = path => {
    $apollo.mutate({
        mutation: PROJECT_OPEN_IN_EDITOR,
        variables: {
            path
        }
    }).then(({data}) => {
        /* eslint-disable no-console */
        console.log('PROJECT_OPEN_IN_EDITOR:', {data});
        /* eslint-enable no-console */
    });
};
