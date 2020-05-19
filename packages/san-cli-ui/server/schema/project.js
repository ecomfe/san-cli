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
  projectInitCreation: ProjectInitCreation
  projectInitTemplate: ProjectInitTemplate
}

type ProjectInitCreation {
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
