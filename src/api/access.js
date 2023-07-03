// 接入中心接口
import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * docJoinUsList
 * @param {Object} param - 获取接入列表
 */
export const docJoinUsList = (data) => {
    return axios.request({
        method: 'get',
        url: `/api/v1/doc_join_us/list?${qs.stringify(data)}`
    })
}

/**
 * docJoinUsSave 接入中心保存
 * @param {Object} param - 参数
 */
export const docJoinUsSave = (data) => {
    return axios.request({
        url: '/api/v1/doc_join_us/save',
        method: 'post',
        data
    })
}

/**
 * docJoinUsSave 接入中心 改变状态
 * @param {Object} param - 参数
 */
export const docJoinUsChangeStatus = (data) => {
    return axios.request({
        url: '/api/v1/doc_join_us/change_status',
        method: 'patch',
        data
    })
}
