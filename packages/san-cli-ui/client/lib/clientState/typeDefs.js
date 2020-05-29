/**
 * @file typeDefs
 * @author zhangtingting12
 */

import gql from 'graphql-tag';

export default gql`
extend type Query {
  connected: Boolean!
  currentProjectId: String
}

extend type Mutation {
  connectedSet (value: Boolean!): Boolean
  currentProjectIdSet (projectId: String): Boolean
}
`;
