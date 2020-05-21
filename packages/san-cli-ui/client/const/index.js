/**
 * @file 静态常量
 * @author zhangtingting12 <zhangtingting12@baidu.com>
*/
import logo from '@assets/logo.svg';

// 将所有gql收敛到这里
import CWD from '@graphql/cwd/cwd.gql';
import CWD_CHANGE from '@graphql/cwd/cwdChanged.gql';
import FOLDER_CURRENT from '@graphql/folder/folderCurrent.gql';
import FOLDERS_FAVORITE from '@graphql/folder/foldersFavorite.gql';
import FOLDER_OPEN from '@graphql/folder/folderOpen.gql';
import FOLDER_SET_FAVORITE from '@graphql/folder/folderSetFavorite.gql';
import FOLDER_CREATE from '@graphql/folder/folderCreate.gql';
import PROJECT_INIT_CREATION from '@graphql/project/projectInitCreation.gql';

export {
    logo,
    CWD,
    CWD_CHANGE,
    FOLDER_CURRENT,
    FOLDERS_FAVORITE,
    FOLDER_OPEN,
    FOLDER_SET_FAVORITE,
    FOLDER_CREATE,
    PROJECT_INIT_CREATION
};
