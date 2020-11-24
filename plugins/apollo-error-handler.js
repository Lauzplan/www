export default (bla, nuxtContext) => {
  if (bla.graphQLErrors) {
    for (const err of bla.graphQLErrors) {
      if (err.message === 'Signature has expired') {
        nuxtContext.redirect('/')
      }
    }
  }
}
