export default async function ({ $auth, route }) {
  const hasAuthOff = route.matched.some((m) => {
    return Object.values(m.components).some(
      (component) => component.options && component.options.auth === false
    )
  })

  if (hasAuthOff) {
    return
  }

  if (!(await $auth.isAuthenticated())) {
    await $auth.loginWithRedirect({ appState: route.path })
    return new Promise(() => {})
  }
}
