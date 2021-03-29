import Vue from 'vue'

Vue.filter('formatLength', (value) => {
  if (value > 1000) {
    return Math.round((value / 1000) * 100) / 100 + ' ' + 'km'
  } else {
    return Math.round(value * 10) / 10 + ' ' + 'm'
  }
})

Vue.filter('formatArea', (value) => {
  if (value > 10000) {
    return Math.round((value / 1000000) * 100) / 100 + ' ' + 'km²'
  } else {
    return Math.round(value) + ' ' + 'm²'
  }
})
