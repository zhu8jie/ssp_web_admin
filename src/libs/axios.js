import axios from 'axios'
import config from '@/config'
import router from '@/router'
import iView from 'view-design'

class HttpRequest {
    constructor(baseUrl) {
        this.baseUrl = process.env.NODE_ENV === 'development' ? config.APIUrl.dev : config.APIUrl.pro
        this.noErrMesApiList = [ // 不需要弹错误的api
            '/user_sys/info',
            '/user_sys/role',
            '/base/upload',
            '/app/import_update',
            '/app/import_add',
            '/dsp_slot/import_add',
            '/dsp_slot/import_update',
            '/ssp_slot/import_add',
            '/ssp_slot/import_update',
            '/ssp_slot/import_map',
            '/import/upload_data'
        ]
        this.waitList = ['/base/upload'] // 等待时长白名单
    }
    getInsideConfig() {
        const config = {
            // baseUrl: this.baseUrl,
            headers: {
                //
            }
        }
        return config
    }
    interceptors(instance, options) {
        // 请求拦截
        instance.interceptors.request.use(config => {
            return config
        }, error => {
            return Promise.reject(error)
        })

        let method = options.method.toLowerCase() // 转小写

        // 响应拦截
        instance.interceptors.response.use(response => {
            let code = parseInt(response.data.code)

            let _splitUrl = response.config.url.indexOf('?') > -1 ? response.config.url.split('?')[0] : response.config.url
            let _resUrl = _splitUrl.split('/api/v1')[1] // url拆分

            if (code === 401 && !(this.noErrMesApiList.includes(_resUrl))) { // 会话过期
                this.showErrMes(code)
                router.replace({
                    name: 'login',
                    query: {
                        tag: 'pass' // 登陆页面使用
                    }
                })
            }

            if (code !== 200 && !(this.noErrMesApiList.includes(_resUrl))) {
                // 需要处理403问题
                if (code === 403) {
                    if (method !== 'get') {
                        this.showErrMes(code)
                    }
                } else if (code === 400) { // 400参数错误单独处理
                    this.showErrMes(code)
                } else {
                    this.showErrMes(code, response.data.msg)
                }
            }

            return response.data
        }, error => {
            // 弹出条件
            // 1. 非403（权限）情况下的错误提示，比如500...
            // 2. 非get请求下的403

            let returnMes = false

            if (error &&
                error.response &&
                (error.response.status !== 403 || (error.response.status === 403 && method !== 'get'))
            ) { // 错误提醒
                this.showErrMes(error.response.status)
                returnMes = error.response.data
            }

            // 断网处理
            if (error.message === 'Network Error') {
                this.showErrMes(909)
            }

            return Promise.reject(returnMes)
        })
    }
    request(options) {
        // 请求
        const instance = axios.create()

        // 等待时长
        let _splitUrl = options.url.indexOf('?') > -1 ? options.url.split('?')[0] : options.url
        let _resUrl = _splitUrl.split('/api/v1')[1] // url拆分
        // instance.defaults.timeout = this.waitList.includes(_resUrl) ? 30 * 60 * 1000 : 5 * 1000 // 超时时间，单位秒
        instance.defaults.timeout = options.method === 'get' ? 10 * 1000 : 0 // 超时时间，get请求，单位秒 10 * 1000

        options = Object.assign(this.getInsideConfig(), options)

        this.interceptors(instance, options)

        return instance(options)
    }
    showErrMes(code, msg) {
        let errMes = '连接服务器失败!'

        switch (code) {
            case 400: errMes = '参数错误(400)'; break
            case 401: errMes = '未授权，请重新登录(401)'; break
            case 403: errMes = '暂无权限(403)'; break
            case 404: errMes = '请求出错(404)'; break
            case 408: errMes = '请求超时(408)'; break
            case 500: errMes = '服务器错误(500)'; break
            case 501: errMes = '服务未实现(501)'; break
            case 502: errMes = '网络错误(502)'; break
            case 503: errMes = '服务不可用(503)'; break
            case 504: errMes = '网络超时(504)'; break
            case 505: errMes = 'HTTP版本不受支持(505)'; break
            case 909: errMes = '断网了，请检测您的网络连接'; break
            default: errMes = `连接出错(${code})!`
        }

        let _msg = msg || errMes

        iView.Message.destroy()
        iView.Message.error({content: _msg, duration: _msg.length > 20 ? 5 : 3})
    }
}

export default HttpRequest
