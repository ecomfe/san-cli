/**
 * @file 表单相关的schema
 * @author zttonly
*/
const gql = require('graphql-tag');

module.exports = gql`

type PromptCommon implements DescribedEntity {
  id: ID!
  type: PromptType!
  visible: Boolean!
  enabled: Boolean
  name: String
  message: String
  group: String
  description: String
  link: String
  choices: [PromptChoice]
  value: String
  valueChanged: Boolean
  error: PromptError
  tabId: String
}

type PromptChoice {
  value: String!
  name: String
  checked: Boolean
  disabled: Boolean
  isDefault: Boolean
}

type PromptError {
  message: String!
  link: String
}

enum PromptType {
  input
  confirm
  list
  rawlist
  expand
  checkbox
  password
  editor
  color
}
`;
