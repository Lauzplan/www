module.exports = {
  client: {
    service: {
      name: 'my-app',
      // URL to the GraphQL API
      url: 'http://127.0.0.1:8000/graphql',
    },
    // Files processed by the extension
    includes: ['./**/*.vue'],
  },
}
