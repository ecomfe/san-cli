const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  consoleLogs: [ConsoleLog]
  consoleLogLast: ConsoleLog
}

extend type Mutation {
  consoleLogsClear: [ConsoleLog]
}

extend type Subscription {
  consoleLogAdded: ConsoleLog!
}

type ConsoleLog {
  id: ID!
  message: String!
  type: ConsoleLogType!
  date: String
}

enum ConsoleLogType {
  log
  warn
  error
  info
  done
}
`;
