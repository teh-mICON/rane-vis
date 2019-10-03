import Vue from 'vue'
import App from './App.vue'
import XOR from './XOR.vue'

Vue.config.productionTip = false
switch (window.location.pathname) {
  default:
    new Vue({
      render: h => h(App),
    }).$mount('#app')
    break;

  case '/XOR':
    new Vue({
      render: h => h(XOR),
    }).$mount('#app')
    break;
}
