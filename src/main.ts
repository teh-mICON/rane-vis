import Vue from 'vue'
import XOR from './views/XOR.vue'
import Mazur from './views/Mazur.vue'

Vue.config.productionTip = false
switch (window.location.pathname) {
  default:
  case '/XOR':
    new Vue({
      render: h => h(XOR),
    }).$mount('#app')
    break;

  case '/mazur':
    new Vue({
      render: h => h(Mazur),
    }).$mount('#app')
    break;

}
