/**
 * @file 更新存储在本地的最近打开的项目的id的列表
 * @author liuhuyue
 * @date 2020-7-20
*/

export const updateRecentProjects = projectId => {
    const recentProjects = localStorage.getItem('recentProjects');
    let recentProjectsArr;
    if (recentProjects === null) {
        recentProjectsArr = [projectId];
    } else {
        recentProjectsArr = JSON.parse(recentProjects);
        const keyIndex = recentProjectsArr.indexOf(projectId)
        if (keyIndex !== -1) {
            recentProjectsArr.splice(keyIndex, 1);
        }
        if (recentProjectsArr.length === 3) {
            recentProjectsArr.pop();
        }
        recentProjectsArr.unshift(projectId);
    }
    localStorage.setItem('recentProjects', JSON.stringify(recentProjectsArr));
};
