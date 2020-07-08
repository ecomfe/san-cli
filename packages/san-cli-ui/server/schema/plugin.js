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
`;
