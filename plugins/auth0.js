// import Vue from 'vue'
// import { Auth0Plugin } from '~/auth'

// const domain = 'lauzplan.eu.auth0.com'
// const clientId = 'K3Dj19AQ3Q7WAUz5kIv0UfSut7ccRkO0'

// export default (context) => {
//   const {
//     app: { router },
//   } = context
//   Vue.use(Auth0Plugin, {
//     domain,
//     clientId,
//     onRedirectCallback: (appState) => {
//       router.push(
//         appState && appState.targetUrl
//           ? appState.targetUrl
//           : window.location.pathname
//       )
//     },
//   })
// }

import createAuth0Client from '@auth0/auth0-spa-js'

export default async function (ctx, inject) {
  const $auth = await createAuth0Client({
    domain: 'lauzplan.eu.auth0.com',
    client_id: 'K3Dj19AQ3Q7WAUz5kIv0UfSut7ccRkO0',
    redirect_uri: 'http://localhost:3000/callback/login',
    audience: 'localhost:8080',
  })

  inject('auth', $auth)
  ctx.$auth = $auth
}
