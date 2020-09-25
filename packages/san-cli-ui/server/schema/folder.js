const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  folderCurrent: Folder
  foldersFavorite: [Folder]
  folderExists (file: String!): Boolean
}

extend type Mutation {
  folderOpen (path: String!): Folder
  folderSetFavorite (path: String!, favorite: Boolean!): Folder
  folderCreate(name: String!): Folder
}

type Folder {
  name: String!
  path: String!
  isPackage: Boolean
  isSanProject: Boolean
  favorite: Boolean
  children: [Folder]
  hidden: Boolean
}
`;
