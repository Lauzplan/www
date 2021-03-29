export default (bla, nuxtContext) => {
  console.log('An error occured')
  if (bla.graphQLErrors) {
    for (const err of bla.graphQLErrors) {
      if (err.message === 'Signature has expired') {
        nuxtContext.redirect('/')
      }
    }
  }
}
