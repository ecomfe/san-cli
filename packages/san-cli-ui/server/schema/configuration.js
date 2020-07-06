/**
 * @file 项目配置相关的schema
 * @author zttonly
*/
const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  configurations: [Configuration]
  configuration (id: ID!): Configuration
}


type Configuration implements DescribedEntity {
  id: ID!
  name: String!
  description: String
  link: String
  icon: String
  plugin: Plugin
  tabs: [ConfigurationTab]!
}

type ConfigurationTab {
  id: ID!
  label: String!
  icon: String
  prompts: [PromptCommon]
}
`;
