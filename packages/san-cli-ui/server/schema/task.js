const gql = require('graphql-tag');

module.exports = gql `
extend type Query {
  tasks: [Task]
  task (id: ID!): Task
}

extend type Mutation {
  taskRun (id: ID!): Task
  taskStop (id: ID!): Task
  taskLogsClear (id: ID!): Task
  taskOpen (id: ID!): Boolean
  taskSaveParameters (id: ID!): [Prompt]
  taskRestoreParameters (id: ID!): [Prompt]
}

extend type Subscription {
  taskChanged: Task
  taskLogAdded (id: ID!): TaskLog
}

type Task implements DescribedEntity {
  id: ID!
  status: TaskStatus!
  command: String!
  name: String
  description: String
  link: String
  icon: String
  logs: [TaskLog]
  prompts: [Prompt]
  views: [TaskView]
  defaultView: String
  project: Project
}

enum TaskStatus {
  idle
  running
  done
  error
  terminated
}

type TaskLog {
  taskId: ID!
  type: TaskLogType!
  text: String
}

enum TaskLogType {
  stdout
  stderr
}

type TaskView {
  id: ID!
  label: String!
  component: String!
  icon: String
}
`;