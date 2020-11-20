export default (bla, nuxtContext) => {
  console.log('Global error handler')

  if (bla.graphQLErrors) {
    for (const err of bla.graphQLErrors) {
      if (err.message === 'Signature has expired') {
        console.log('coucou')
        nuxtContext.redirect('/')
      }
    }
  }
}
