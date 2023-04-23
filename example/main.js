import Vue from 'vue'
import App from './App.vue'

Vue.prototype.$ELEMENT = { size: 'mini', zIndex: 3000 }
new Vue({
  render: (h) => h(App),
}).$mount('#app')
