import Vuetify from 'vuetify'
import { render } from '@testing-library/vue'

const renderWithVuetify = (component, options, callback) => {
  const root = document.createElement('div')
  root.setAttribute('data-app', 'true')
  root.setAttribute('id', 'app')

  return render(
    component,
    {
      container: document.body.appendChild(root),
      // for Vuetify components that use the $vuetify instance property
      vuetify: new Vuetify(),
      ...options,
    },
    callback
  )
}

export { renderWithVuetify }
