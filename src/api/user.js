import axios from '@/libs/api.request'

/**
 * 登录接口
 * @param {Object} param - 当前登录者的用户信息
 */
export const getSysUserInfo = () => {
    return axios.request({
        method: 'get',
        url: '/api/v1/user_sys/info'
    })
}

/**
 * 登录接口
 * @param {Object} param - 参数
 */
export const getLogin = (data) => {
    return axios.request({
        method: 'POST',
        url: '/api/v1/user_sys/login',
        data
    })
}

/**
 * 注销登录
 * @param {Object} param - 参数
 */
export const logout = () => {
    return axios.request({
        url: '/api/v1/user_sys/logout',
        method: 'get'
    })
}

/**
 * 获取验证码
 * @param {Object} param - 参数
 */
export const getCode = () => {
    return axios.request({
        url: '/api/v1/base/get_captcha',
        method: 'get'
    })
}

/**
 * getSysUserRole
 * @param {Object} param - 获取当前登录的权限角色
 */
export const getSysUserRole = () => {
    return axios.request({
        method: 'get',
        url: '/api/v1/user_sys/role'
    })
}

/**
 * resetPassword
 * @param {Object} param - 重置密码
 */
export const resetPassword = (data) => {
    return axios.request({
        method: 'patch',
        url: '/api/v1/user_sys/pwd/reset',
        data
    })
}
