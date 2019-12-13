import Vue from 'vue'
import control from './views/control.vue'


// bootswatch & fonts
import "bootswatch/dist/lux/bootstrap.css";
import "typeface-roboto";
import "typeface-source-sans-pro";
import "typeface-montserrat";

interface Function {
  name: string;
}

import Trend from "vuetrend";
Vue.use(Trend)

import TrendChart from "vue-trend-chart";
Vue.use(TrendChart);

Vue.config.productionTip = false
new Vue({
  render: h => h(control),
}).$mount('#app')