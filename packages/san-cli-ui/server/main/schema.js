/**
 * @file 主schema入口，集成了./schema下全部文件
 * @author jinzhan
*/
const gql = require('graphql-tag');
const globby = require('globby');

const typeDefs = [gql`
scalar JSON

enum PackageManager {
  npm
  yarn
  pnpm
}

interface DescribedEntity {
  name: String
  description: String
  link: String
}

type Version {
  current: String
  latest: String
  wanted: String
  range: String
  localPath: String
}


type GitHubStats {
  stars: Int
}

type ClientAddon {
  id: ID!
  url: String!
}

type Locale {
  lang: String!
  strings: JSON!
}

type Query {
  cwd: String!
  clientAddons: [ClientAddon]
}

input OpenInEditorInput {
  file: String!
  line: Int
  column: Int
}

type Mutation {
  fileOpenInEditor (input: OpenInEditorInput!): Boolean
}

type Subscription {
  cwdChanged: String!
  clientAddonAdded: ClientAddon
}
`];

// Load all types
const paths = globby.sync(['../schema/*.js'], {cwd: __dirname, absolute: true});

paths.forEach(file => {
    const types = require(file);
    types && typeDefs.push(types);
});

module.exports = typeDefs;
