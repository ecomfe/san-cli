/**
 * @file 项目相关的schema
 * @author jinzhan, Lohoyo
*/
const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  projects: [Project]
  projectCurrent: Project
  projectTemplateList: JSON
}

extend type Mutation {
  projectInitTemplate (template: String, useCache: Boolean): ProjectInitTemplate
  projectCreation (name: String, template: String, presets: JSON): ProjectCreation
  projectSetFavorite(id: ID, favorite: Int): Project
  projectImport (path: String, force: Boolean): Project!
  projectOpen (id: ID!): Project!,
  projectOpenInEditor (path: String, line: Int, column: Int): projectOpenInEditor,
  projectRename (id: ID!, name: String!): Project!,
  projectRemove (id: ID!): Boolean!,
  projectCwdReset: String
}

type ProjectTemplate {
  label: String
  value: String
}

type ProjectCreation {
  prompts: [ProjectPrompt]
}

type ProjectInitTemplate {
  prompts: [ProjectPrompt]
}

type ProjectPrompt {
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
  type: ProjectType
  path: String!
  favorite: Int
  plugins: [Plugin]
  homepage: String
  openDate: JSON
}

enum ProjectType {
  san
  unknown
}

type projectOpenInEditor {
  errMsg: String
}
`;
