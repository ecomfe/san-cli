/**
 * @file 安装依赖相关的schema
 * @author sunxiaoyu333
*/
const gql = require('graphql-tag');

module.exports = gql`
    extend type Mutation {
        dependencyInstall (id: String!, type: String!): dependency,
        dependencyUninstall (id: String!, type: String!): dependency,
        dependencyItem (id: String!): version
    }

    extend type Query {
        dependencies: [dependency]
    }

    type dependency {
        id: String!
        type: String!
        website: String
        installed: Boolean
    }
    type version {
        current: String
        latest: String
        wanted: String
        range: String
    }
`;