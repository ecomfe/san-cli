const gql = require('graphql-tag');

module.exports = gql `
extend type Query {
  views: [View]
}

extend type Mutation {
  viewOpen (id: ID!): Boolean
}

extend type Subscription {
  viewAdded: View
  viewRemoved: View
  viewChanged: View
}

type View {
  id: ID!
  name: String!
  icon: String
  projectTypes: [ProjectType]
}
`;
