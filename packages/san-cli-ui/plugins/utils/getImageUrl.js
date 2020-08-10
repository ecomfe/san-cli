/**
 * @file 为开发环境和生成环境生成不同的图片地址
 * @author Lohoyo
 */

module.exports = url => {
    if (process.env.SAN_CLI_UI_DEV && url[0] === '/') {
        return `http://localhost:${process.env.SAN_APP_GRAPHQL_PORT}${url}`
    }
    return url
}
