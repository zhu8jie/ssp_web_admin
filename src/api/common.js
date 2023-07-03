import axios from '@/libs/api.request'
import config from '@/config'
import qs from 'qs'
import Vue from 'vue'

var APIUrl = '' // 所有的api 接口
var xlsAPIUrl = '' // 模板api 接口 ，区分(dev,test) 和 (gray, product)

switch (process.env.NODE_ENV) {
	case 'development': // 开发
		APIUrl = config.APIUrl.dev
		xlsAPIUrl = config.xlsApiUrl.dev
		break
	case 'production': // 生产
		APIUrl = config.APIUrl.pro
		xlsAPIUrl = config.xlsApiUrl.pro
		break
	case 'testing': // test
		APIUrl = config.APIUrl.testing
		xlsAPIUrl = config.xlsApiUrl.dev
		break
	case 'deving': // dev
		APIUrl = config.APIUrl.deving
		xlsAPIUrl = config.xlsApiUrl.dev
		break
	case 'gray': // 灰度
		APIUrl = config.APIUrl.gray
		xlsAPIUrl = config.xlsApiUrl.pro
		break
}

Vue.prototype.$APIUrl = APIUrl
Vue.prototype.$xlsAPIUrl = xlsAPIUrl

/**
 * 获取省份数据
 * @param {Object} param - 参数
 */
export const getProvinceApi = () => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/base/get_province`,
		method: 'get'
	})
}

/**
 * 获取配置页面的城市
 * @param {Object} param - 参数
 */
export const getProvinceCityApi = () => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/base/get_province_city`,
		method: 'get'
	})
}
/**
 * 获取手机品牌
 * @param {Object} param - 参数
 */
export const getPhoneBrand = () => {
  return axios.request({
	url: `${APIUrl.mediaComUrl}/api/v1/base/get_brand`,
	method: 'get'
  })
}
/**
 * 根据省份ID获取城市数据
 * @param {Object} param - 参数
 */
export const getCityApi = (data) => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/base/get_city`,
		method: 'get',
		params: data
	})
}

/**
 * 获取银行类型数据
 * @param {Object} param - 参数
 */
export const getBankTypeApi = () => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/base/get_bank_type`,
		method: 'get'
	})
}

/**
 * 根据银行类型ID和城市ID获取银行数据
 * @param {Object} param - 参数
 */
export const getBankNameApi = () => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/base/get_bank`,
		method: 'get'
	})
}

/**
 * 导出列表
 * @param {Object} param - 参数
 */
export const getDownLoadXls = (data) => {
	return axios.request({
		method: 'post',
		url: `/api/v1/base/download_xls`,
		data
	})
}
/**
 * 导出列表
 * @param {Object} param - 参数
 */
export const getUserDownLoadXls = (data) => {
  return axios.request({
	method: 'POST',
	url: `${APIUrl.userBaseUrl}/uc_api/v1/base/download_xls`,
	data
  })
}

/**
 * 文件上传
 * @param {Object} param - 参数
 */
export const uploadFile = (data) => {
	return axios.request({
		method: 'POST',
		url: `${APIUrl.mediaComUrl}/api/v1/base/upload`,
		data
	})
}

/**
 * [uploadFileUrl 文件上传 导出url]
 * @type {String}
 */
export const uploadFileUrl = `${APIUrl.mediaComUrl}/api/v1/base/upload`

/**
 * 设置用户表头记忆信息
 * @param {Object} param - 参数
 */
export const setTableHeadApi = (data) => {
	return axios.request({
		method: 'POST',
		url: `/api/v1/user_sys/set_table_head`,
		data
	})
}

/**
 * 获取用户表头记忆信息
 * @param {Object} param - 参数
 */
export const tableInfoApi = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_sys/table_info?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * 获取用户表头记忆信息
 * @param {Object} param - 参数
 */
export const getTableHead = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_sys/table_info?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * 设置用户表头记忆信息
 * @param {Object} param - 参数
 */
export const setTableHead = (data) => {
	return axios.request({
		method: 'POST',
		url: `/api/v1/user_sys/set_table_head`,
		data
	})
}
/**
 * 设置用户页码的保存
 * @param {Object} param - 参数
 */
export const setTablePageApi = (data) => {
	return axios.request({
		method: 'POST',
		url: `/api/v1/user_sys/set_table_page`,
		data
	})
}

/**
 * 获取媒体公司数据
 * @param {Object} param - 参数
 */
export const getMediaCompany = () => {
	return axios.request({
		method: 'get',
		url: '/api/v1/base/get_user_company'
	})
}

/**
 * 获取获取广告类型
 * @param {Object} param - 参数
 */
export const getAllAdType = () => {
	return axios.request({
		method: 'get',
		url: '/api/v1/base/get_ad_type'
	})
}

/**
 * 获取第三方平台名称
 * @param {Object} param - 参数
 */
export const getPlatform3rd = () => {
	return axios.request({
		method: 'get',
		url: '/api/v1/base/get_platform_3rd'
	})
}

/**
 * 获取应用商店数据
 * @param {Object} param - 参数
 */
export const getAppStore = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/base/get_app_store?${qs.stringify(data)}`
	})
}

/**
 * 获取获取应用类型
 * @param {Object} param - 参数
 */
export const getAppIndustry = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/base/get_industry?${qs.stringify(data)}`
	})
}

/**
 * 获取首页收入数据
 * @param {Object} param - 参数
 */
export const getHomeBaseIncome = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/home/get_base_income`
	})
}

/**
 * 获取首页曲线图数据
 * @param {Object} param - 参数
 */
export const getHomeLineData = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/home/get_line_data?${qs.stringify(data)}`
	})
}
/**
 * 获取首页面媒体的统计数据
 * @param {Object} param - 参数
 */
export const getHomeSspData = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/home/get_ssp_stat?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 获取首页面预算方的统计数据
 * @param {Object} param - 参数
 */
export const getHomeDspData = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/home/get_dsp_stat?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * 获取素材尺寸
 * @param {Object} param - 参数
 */
export const getAdRatio = (data) => {
	return axios.request({
		url: `${APIUrl.mediaComUrl}/api/v1/ad_ratio?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
