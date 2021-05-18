import createAuth0Client from '@auth0/auth0-spa-js'

export default async function (ctx, inject) {
  const $auth = await createAuth0Client({
    domain: ctx.$config.auth0Domain,
    client_id: ctx.$config.auth0ClientId,
    redirect_uri: `${ctx.$config.baseURL}/callback/login`,
    audience: ctx.$config.auth0Audience,
  })

  inject('auth', $auth)
  ctx.$auth = $auth
}
