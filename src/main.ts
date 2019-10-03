import Vue from 'vue'
import XOR from './views/XOR.vue'

Vue.config.productionTip = false
switch (window.location.pathname) {
  default:
  case '/XOR':
    new Vue({
      render: h => h(XOR),
    }).$mount('#app')
    break;
}
