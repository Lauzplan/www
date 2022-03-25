import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - www',
    title: 'www',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/vee-validate.js',
    '~/plugins/auth0.js',
    '~/plugins/vue-rx.js',
    '~/plugins/formaters.js',
    '~/plugins/observable-openlayers.js',
    '~/plugins/error-handler.js',
    '~/plugins/vee-validate.js',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/apollo',
  ],

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  apollo: {
    clientConfigs: {
      default: '~/plugins/apollo-config.js',
    },
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: ['vee-validate/dist/rules'],
    loaders: {
      vue: {
        transpileOptions: {
          transforms: {
            dangerousTaggedTemplateString: true,
          },
        },
      },
    },
  },
  router: {
    middleware: ['auth'],
    extendRoutes(routes, resolve) {
      const gardensId = routes.find((r) => r.name === 'gardens-id')
      if (gardensId) {
        gardensId.redirect = { name: 'gardens-id-parcels' }
      }
    },
  },
  auth0: {
    domain: 'lauzplan.eu.auth0.com',
    clientId: 'K3Dj19AQ3Q7WAUz5kIv0UfSut7ccRkO0',
    audience: 'https://lauzplan.eu.auth0.com/login/callback',
  },
  publicRuntimeConfig: {
    baseURL:
      process.env.BASE_URL || process.env.NODE_ENV === 'production'
        ? 'https://tfe-moffarts.info.ucl.ac.be'
        : 'http://localhost:3000',
    apiURL:
      process.env.API_URL || process.env.NODE_ENV === 'production'
        ? 'https://tfe-moffarts.info.ucl.ac.be/graphql'
        : 'http://127.0.0.1:8000/graphql',
    auth0Domain: 'lauzplan.eu.auth0.com',
    auth0ClientId: 'K3Dj19AQ3Q7WAUz5kIv0UfSut7ccRkO0',
    auth0Audience: 'localhost:8080',
  },
}
