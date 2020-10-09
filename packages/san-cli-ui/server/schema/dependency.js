/**
 * @file 安装依赖相关的schema
 * @author sunxiaoyu333
*/
const gql = require('graphql-tag');

module.exports = gql`
    extend type Mutation {
        dependencyInstall (input: DependencyInstall!): Dependency
        dependencyUninstall (id: String!, type: String!): Dependency
        dependencyItem (id: String!): Version
        dependencyUpdate (input: DependencyUpdate!): Dependency
        dependenciesUpdate: [Dependency]
    }

    extend type Query {
        dependencies: [Dependency]
    }

    enum DependencyType {
        dependencies
        devDependencies
    }

    input DependencyInstall {
        id: ID!
        type: DependencyType!
        range: String
    }

    input DependencyUninstall {
        id: ID!
    }

    input DependencyUpdate {
        id: ID!
    }

    type Dependency {
        id: ID!
        type: DependencyType!
        version: Version!
        installed: Boolean
        website: String
        description: String
    }
`;
