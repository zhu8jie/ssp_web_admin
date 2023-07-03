// 数据管理全部接口
import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 数据管理 数据导入 获取导入列表
 * @param {Object} param - 参数
 */
export const getImportList = (data) => {
	return axios.request({
		url: `/api/v1/import/init_list?${qs.stringify(data)}`,
		method: 'get'
	})
}

/**
 * 数据管理 数据导入 导入接口
 * @param {Object} param - 参数
 */
export const uploadImportData = (data) => {
	return axios.request({
		url: '/api/v1/import/upload_data',
		method: 'post',
		data
	})
}

/**
 * [数据管理 数据导入 导入接口 链接]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const uploadImportDataUrl = '/api/v1/import/upload_data'

/**
 * 数据管理 流量数据 获取流量方数据报表
 * @param {Object} param - 参数
 */
export const getSspFlowData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_ssp_data_day?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 数据管理 流量数据 获取流量方数据报表 下载报表
 * @param {Object} param - 参数
 */
export const getSspFlowDataUrl = (data) => {
  return `/api/v1/data_ssp/get_ssp_data_day?${qs.stringify(data, {arrayFormat: 'repeat'})}`
}

/**
 * 数据管理 流量数据 获取流量方数据来源子表
 * @param {Object} param - 参数
 */
export const getSspSourceData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_ssp_data_source?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
/**
 * 数据管理 预算数据 获取预算方数据报表
 * @param {Object} param - 参数
 */
export const getSspBudgetData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_dsp_data_day?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 数据管理 预算数据 获取预算方数据报表 下载报表
 * @param {Object} param - 参数
 */
export const getSspBudgetDataUrl = (data) => {
  return `/api/v1/data_ssp/get_dsp_data_day?${qs.stringify(data, {arrayFormat: 'repeat'})}`
}

/**
 * 数据管理 预算数据 获取预算方数据来源子表
 * @param {Object} param - 参数
 */
export const getSspBudgetSourceData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_dsp_data_source?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 数据管理 计划报表 获取计划报表的数据
 * @param {Object} param - 参数
 */
export const getTestPlanList = (data) => {
  return axios.request({
	url: `/api/v1/data_test_plan/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
	method: 'get'
  })
}
/**
 * 数据管理 计划报表 获取计划报表的数据 下载报表
 * @param {Object} param - 参数
 */
export const getTestPlanListUrl = (data) => {
  return `/api/v1/data_test_plan/list?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}
/**
 * 支出修正 添加成本修正
 * @param {Object} param - 参数
 */
export const spendAddChange = (data) => {
	return axios.request({
		url: '/api/v1/data_change/add_change',
		method: 'post',
		data
	})
}

/**
 * 支出修正 获取广告位指定某天的成本
 * @param {Object} param - 参数
 */
export const spendGetOneDaySpend = (data) => {
	return axios.request({
		url: `/api/v1/data_change/get_spend?${qs.stringify(data)}`,
		method: 'get'
	})
}

/**
 * 支出修正 获取广告位指定某天的成本
 * @param {Object} param - 参数
 */
export const spendGetList = (data) => {
	return axios.request({
		url: `/api/v1/data_change/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 数据管理 流量数据 获取流量方小时数据报表
 * @param {Object} param - 参数
 */
export const getSspHourData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_ssp_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 流量数据 获取流量方小时数据报表 下载报表
 * @param {Object} param - 参数
 */
export const getSspHourDataUrl = (data) => {
	return `/api/v1/data_ssp/get_ssp_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * 数据管理 流量数据 获取流量方小时数据来源子表
 * @param {Object} param - 参数
 */
export const getSspHourDataSource = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_ssp_data_hour_source?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 预算数据 获取预算方小时数据报表
 * @param {Object} param - 参数
 */
export const getDspHourData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_dsp_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 预算数据 获取预算方小时数据报表 下载报表
 * @param {Object} param - 参数
 */
export const getDspHourDataUrl = (data) => {
	return `/api/v1/data_ssp/get_dsp_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * 数据管理 预算数据 获取预算方小时数据来源子表
 * @param {Object} param - 参数
 */
export const getDspHourDataSource = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp/get_dsp_data_hour_source?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 平台与预算方数据 获取平台与预算方gap数据
 * @param {Object} param - 参数
 */
export const getDspGapDataApi = (data) => {
	return axios.request({
		url: `/api/v1/data_dsp/get_gap?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 预算数据 获取预算位详细数据(时)
 * @param {Object} param - 参数
 */
export const getDspDetailHourData = (data) => {
	return axios.request({
		url: `/api/v1/data_dsp/get_detail_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 预算数据 获取预算位详细数据(时) 导出url
 * @param {Object} param - 参数
 */
export const getDspDetailHourDataUrl = (data) => {
	return `/api/v1/data_dsp/get_detail_data_hour?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * 数据管理 预算数据 获取预算位详细数据(天)
 * @param {Object} param - 参数
 */
export const getDspDetailDayData = (data) => {
	return axios.request({
		url: `/api/v1/data_dsp/get_detail_data?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * [数据管理 预算数据 获取预算位详细数据(天) 下载url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const getDspDetailDayDataUrl = (data) => {
	return `/api/v1/data_dsp/get_detail_data?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * 数据管理 取消广告位关联
 * @param {Object} param - 参数
 */
export const deleteSspUnlink = (data) => {
	return axios.request({
		url: '/api/v1/ssp_slot/unlink',
		method: 'delete',
		data
	})
}

/**
 * 数据管理 媒体库管理
 * @param {Object} param - 参数
 */
export const getSspLibrayData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp_slot/list?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}

/**
 * 数据管理 媒体库管理 下载报表
 * @param {Object} param - 参数
 */
export const getSspLibrayDataUrl = (data) => {
	return `/api/v1/data_ssp_slot/list?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * 数据管理 下载媒体库数据
 * @param {Object} param - 参数
 */
export const downSspLibrayData = (data) => {
	return axios.request({
		url: `/api/v1/data_ssp_slot/list/xlsx?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`,
		method: 'get'
	})
}