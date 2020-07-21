/**
 * @file 在编辑器中打开项目
 * @author Lohoyo
 * @date 2020-7-21
*/

/**
 * @example
 * openInEditor.call(this, path);
 */

import PROJECT_OPEN_IN_EDITOR from '@graphql/project/projectOpenInEditor.gql';

export const openInEditor = function (path) {
    this.$apollo.mutate({
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
