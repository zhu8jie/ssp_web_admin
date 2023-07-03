import Vue from 'vue'
import Router from 'vue-router'
import {constantRouterMap, asyncRouterMap, noFoundRouterMap} from './routers'
import store from '@/store'
import iView from 'view-design'
import {localRead} from '@/libs/util'
import config from '@/config'

Vue.use(Router)

/**
 * 重写路由的push方法
 */
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}

const router = new Router({
    routes: [...constantRouterMap, ...asyncRouterMap, ...noFoundRouterMap],
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
        return { x: 0, y: 0 };
    }
})

const whiteList = [] // 路由白名单

// 路由判断
router.beforeEach((to, from, next) => {
    iView.LoadingBar.start()


    // console.log(localRead('userId'), config.loginEnterId, config.loginEnterName)
    if (!!localRead(config.loginEnterId)) { // 已登录
        if (to.name === 'login' || to.name === 'noPermission') { // 访问登录页面, 或者无权限
            next()
        } else { // 非登录页
            // console.log(store.getters.getUserRoute)
            if (store.getters.getUserRoute.length === 0) { //判断当前用户是否已拉取完role信息
                store.dispatch('getSysUserRole').then(res => {
                    if (res.code === 200) {
                        if (store.getters.getUserRoute.length === 0) {
                            next({path: '/permission/error/log'})
                        } else {
                            next()
                        }
                    } else {
                        next({path: '/account/login'})
                    }
                }, err=> {
                    next()
                })
            } else { // 已获取role
                next()
            }
        }
    } else {
        // console.log(8)
        if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
            // console.log(9)
            next()
        } else {
            // 如果没有登录，访问非登录页面,则跳转到登录页面
            if (!to.path.match('/account/')) {
                // console.log(11)
                next({
                    path: '/account/login'
                })
            } else {
                // console.log(12)
                // 如果没有登录，但访问的是登录页面,直接进入
                next()
            }
        }
    }
})

router.afterEach(route => {
    iView.LoadingBar.finish()
})

export default router
