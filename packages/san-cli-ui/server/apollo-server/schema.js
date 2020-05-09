const gql = require('graphql-tag');
const globby = require('globby');

const typeDefs = [gql`
scalar JSON

enum PackageManager {
  npm
  yarn
  pnpm
}

type Locale {
  lang: String!
  strings: JSON!
}

type Query {
  cwd: String!
}

# type Mutation {

# }

type Subscription {
  cwdChanged: String!
}
`];

// Load types in lib
const paths = globby.sync(['../schema/*.js'], {cwd: __dirname, absolute: true});

paths.forEach(file => {
    const types = require(file);
    types && typeDefs.push(types);
});

module.exports = typeDefs;