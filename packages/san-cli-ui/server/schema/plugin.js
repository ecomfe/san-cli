/**
 * @file 项目配置相关的schema
 * @author zttonly
*/
const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  plugins: [Plugin]
  plugin (id: ID!): Plugin
}

extend type Mutation {
  pluginActionCall (id: ID!, params: JSON): PluginActionResult
  pluginItem (id: String!): Version
}

extend type Subscription {
  pluginActionCalled: PluginActionCall
  pluginActionResolved: PluginActionResult
}

type Plugin {
  id: ID!
  version: Version!
  official: Boolean
  installed: Boolean
  website: String
  description: String
  githubStats: GitHubStats
  logo: String
}

type PluginActionCall {
  id: ID!
  params: JSON
}

type PluginActionResult {
  id: ID!
  params: JSON
  results: [JSON]
  errors: [JSON]
}
`;
