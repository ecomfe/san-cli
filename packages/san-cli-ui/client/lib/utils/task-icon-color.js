/**
 * @file 获取任务的图标颜色
 * @author Lohoyo
 */

export default taskName => {
    if (!taskName) {
        return '#1890ff';
    }
    const icon = taskName[0].toUpperCase();
    switch (true) {
        case /[A-F]/.test(icon):
            return '#009688';
        case /[G-L]/.test(icon):
            return '#673bb8';
        case /[M-R]/.test(icon):
            return '#c04379';
        case /[S-Z]/.test(icon):
            return '#ff8b00';
        default:
            return '#1890ff';
    }
};
