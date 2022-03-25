import Vue from 'vue'

class ErrorManager {
  constructor() {
    this.handler = () => {}
  }

  setHandler(handler) {
    this.handler = handler
  }

  displayError(error) {
    this.handler(error)
  }
}

export default function ({ app }, inject) {
  inject('errorManager', new ErrorManager())
  Vue.config.errorHandler = function (msg) {
    app.$errorManager.displayError({ message: msg })
    console.error(msg)
  }
}
