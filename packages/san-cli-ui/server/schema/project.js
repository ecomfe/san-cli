/**
 * @file 项目相关的schema
 * @author jinzhan
*/
const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  projects: [Project]
  projectCurrent: Project
}

extend type Mutation {
  projectInitTemplate: ProjectInitTemplate
  projectCreation (name: String, presets: JSON): projectCreation
  projectSetFavorite(id: ID, favorite: Int): Project
  projectImport (path: String, force: Boolean): Project!
  projectOpenInEditor (path: String, line: Int, column: Int): Boolean,
  projectRename (id: ID!, name: String!): Project!,
  projectRemove (id: ID!): Boolean!
}

type projectCreation {
  prompts: [Prompt]
}

type ProjectInitTemplate {
  prompts: [Prompt]
}

type Prompt {
  name: String
  type: String
  label: String
  message: String
  required: Boolean
  default: String
  when: String
  choices: [Choice]
}

type Choice {
  name: String
  value: String
  short: String
}

type Project {
  id: ID!
  name: String!
  path: String!
  favorite: Int
  homepage: String
  openDate: JSON
}
`;
