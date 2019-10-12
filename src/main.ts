import Vue from 'vue'
import control from './views/control.vue'


// bootswatch & fonts
import "bootswatch/dist/darkly/bootstrap.css";
import "typeface-roboto";
import "typeface-source-sans-pro";
import "typeface-montserrat";

Vue.config.productionTip = false
new Vue({
  render: h => h(control),
}).$mount('#app')