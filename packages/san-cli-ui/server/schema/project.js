const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  projects: [Project]
  projectCurrent: Project
}

extend type Mutation {
  projectInitCreation: projectInitCreation
}

type projectInitCreation {
  success: Boolean
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
