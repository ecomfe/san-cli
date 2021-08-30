/**
 * @file 部件相关的schema
 * @author zttonly
*/
const gql = require('graphql-tag');

module.exports = gql`
extend type Query {
  widgetDefinitions: [WidgetDefinition]
  widgets: [Widget]
}

extend type Mutation {
  widgetAdd (input: WidgetAddInput!): Widget!
  widgetRemove (id: ID!): Widget
  widgetMove (input: WidgetMoveInput!): [Widget]!
  widgetConfigOpen (id: ID!): Widget!
  widgetConfigSave (id: ID!): Widget!
  widgetConfigReset (id: ID!): Widget!
}

type WidgetDefinition {
  id: ID!
  title: String!
  description: String
  longDescription: String
  link: String
  icon: String
  screenshot: String
  component: String!
  detailsComponent: String
  canAddMore: Boolean!
  hasConfigPrompts: Boolean!
  count: Int!
  maxCount: Int
  minWidth: Int!
  minHeight: Int!
  maxWidth: Int!
  maxHeight: Int!
  openDetailsButton: Boolean
}

type Widget {
  id: ID!
  definition: WidgetDefinition!
  x: Int!
  y: Int!
  width: Int!
  height: Int!
  prompts: [Prompt]
  config: JSON
  configured: Boolean!
  pkgName: String
}

input WidgetAddInput {
  definitionId: ID!
}

input WidgetMoveInput {
  id: ID!
  x: Int
  y: Int
  width: Int
  height: Int
}
`;
