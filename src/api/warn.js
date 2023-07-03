import axios from '@/libs/api.request'
import qs from 'qs'


/**
 * 预警中心  获取预警的详情
 * @param {Object} param - 参数
 */
export const getAlarmDetail = (data) => {
  return axios.request({
    url: `/api/v1/alarm?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
    method: 'get'
  })
}

/**
 * 预警中心  获取预警的列表
 * @param {Object} param - 参数
 */
export const getAlarmList = (data) => {
  return axios.request({
    url: `/api/v1/alarm/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
    method: 'get'
  })
}
/**
 *预警中心  新建预警
 * @param {Object} param - 参数
 */
export const addAlarmApi = (data) => {
  return axios.request({
    method: 'POST',
    url: `/api/v1/alarm/new`,
    data
  })
}

/**
 *预警中心  修改预警
 * @param {Object} param - 参数
 */
export const amendAlarmApi = (data) => {
  return axios.request({
    method: 'POST',
    url: `/api/v1/alarm/mod`,
    data
  })
}
/**
 *预警中心  删除预警
 * @param {Object} param - 参数
 */
export const deleteAlarmApi = (data) => {
  return axios.request({
    method: 'POST',
    url: `/api/v1/alarm/del`,
    data
  })
}
/**
 *预警中心  修改预算位的状态
 * @param {Object} param - 参数
 */
export const modStatusAlarm = (data) => {
  return axios.request({
    method: 'POST',
    url: `/api/v1/alarm/status/mod`,
    data
  })
}
