// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView, {Message} from 'view-design'
import config from '@/config'

// import 'view-design/dist/styles/iview.css'
import '@/assets/stylus/theme.less'
import '@/assets/stylus/resetView.styl'
import '@/assets/stylus/iconfont.styl'

import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Treeselect from '@riophae/vue-treeselect'
import '@/assets/stylus/tree-select.styl'

import {UTableColumn, UTable, UxGrid, UxTableColumn} from 'umy-ui'
import 'umy-ui/lib/theme-chalk/index.css';// 引入样式
Vue.use(UTableColumn)
Vue.use(UTable)
Vue.use(UxGrid)
Vue.use(UxTableColumn)

// 模拟数据
/*if (process.env.NODE_ENV !== 'production') {
    require('@/mock/index.js')
}*/

Vue.component('Treeselect', Treeselect)

Vue.config.productionTip = false

/**
 * [$config 挂载config配置]
 * @type {[type]}
 */
Vue.prototype.$config = config

// new bus 中央事件总监
Vue.prototype.$Bus = new Vue()

/**
 * 重写iview的Message方法，防止多次提醒。 使用闭包形式处理, 单例模式
 * start
 */
let messageInstance = null
const singleMessage = (options) => {
    if (messageInstance) {
        Message.destroy()
    }
    messageInstance = Message[options.type](options)
}
['error', 'success', 'info', 'warning'].forEach(type => {
    singleMessage[type] = options => {
        if (typeof options === 'string') {
            options = {
                message: options
            }
        }
        options.type = type
        return singleMessage(options)
    }
})

Vue.use(iView)
Vue.prototype.$message = singleMessage

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {
        App
    },
    store,
    template: '<App/>'
})
