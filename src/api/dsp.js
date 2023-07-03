import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 预算管理 第三方 新建/编辑第三方平台账号信息
 * @param {Object} param - 参数
 */
export const savePlatfromAccount = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/conf_platform/save_platform_account',
		data
	})
}

/**
 * 预算管理 获取第三方平台账号数据
 * @param {Object} param - 参数
 */
export const getPlatfromAccountList = (data) => {
	return axios.request({
		url: `/api/v1/conf_platform/list_account?${qs.stringify(data)}`,
		method: 'get'
	})
}

/**
 * 预算管理 预算方 新建/修改预算方
 * @param {Object} param - 参数
 */
export const saveDspCompany = (data) => {
	return axios.request({
		url: '/api/v1/dsp_company/save',
		method: 'post',
		data
	})
}

/**
 * 预算管理 预算方 获取预算方列表
 * @param {Object} param - 参数
 */
export const getDspCompanyList = (data) => {
	return axios.request({
		url: `/api/v1/dsp_company/list?${qs.stringify(data)}`,
		method: 'get'
	})
}

/**
 * 预算管理 预算位 新建/修改预算方
 * @param {Object} param - 参数
 */
export const saveDspSlot = (data) => {
	return axios.request({
		url: '/api/v1/dsp_slot/save',
		method: 'post',
		data
	})
}

/**
 * 预算管理 预算位 获取预算方列表
 * @param {Object} param - 参数
 */
export const getDspSlotList = (data) => {
	return axios.request({
		url: `/api/v1/dsp_slot/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [getDspSlotListAPI 导出 预算管理 预算位 获取预算方列表  下载报表使用]
 * @param {Object} param - 参数
 */
export const getDspSlotListAPI = (data) => {
	return `/api/v1/dsp_slot/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
}
/**
 * 预算管理 预算位 根据预算位ID获取连连看广告位数据
 * @param {Object} param - 参数
 */
export const getSspByDspList = (data) => {
	return axios.request({
		url: `/api/v1/ssp_slot/get_ssp_by_dsp?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
/**
 * 预算管理 预算位 取消连连看
 * @param {Object} param - 参数
 */
export const deleteSspByDsp = (data) => {
	return axios.request({
		url: '/api/v1/ssp_slot/del_ssp_dsp',
		method: 'DELETE',
		data
	})
}
/**
 * 预算管理 预算位 修改预算位状态
 * @param {Object} param - 参数
 */
export const updateDspSlotStatus = (data) => {
	return axios.request({
		url: '/api/v1/dsp_slot/status',
		method: 'put',
		data
	})
}

/**
 * 预算管理 预算位 修改预算位采买状态
 * @param {Object} param - 参数
 */
export const pickupDspSlotStatus = (data) => {
  return axios.request({
    url: '/api/v1/dsp_slot/pickup_status/update',
    method: 'post',
    data
  })
}
/**
 * 预算管理 预算位 修改预算位采买状态
 * @param {Object} param - 参数
 */
export const bannedDspSlotStatus = (data) => {
  return axios.request({
    url: '/api/v1/dsp_slot/ban',
    method: 'post',
    data
  })
}
/**
 *预算位 批量导入预算位
 * @param {Object} param - 参数
 */
export const importDspSlot = (data) => {
	return axios.request({
		method: 'POST',
		url: `/api/v1/dsp_slot/import`,
		data
	})
}

/**
 * 预算管理 获取预算位的详细数据
 * @param {Object} param - 参数
 */
export const getSlotInfo = (data) => {
	return axios.request({
		url: `/api/v1/dsp_slot/info?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [importDspSlotApi 批量导入预算位 导入url]
 * @type {String}
 */
export const importDspSlotApi = '/api/v1/dsp_slot/import'

/**
 * [批量新建预算位]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspImportAdd = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/dsp_slot/import_add',
		data
	})
}

/**
 * [批量新建应用的url]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspImportAddUrl = '/api/v1/dsp_slot/import_add'

/**
 * [批量修改预算位]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspImportUpdate = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/dsp_slot/import_update',
		data
	})
}

/**
 * [批量修改应用的url]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspImportUpdateUrl = '/api/v1/dsp_slot/import_update'

/**
 * 预算管理 获取配对存在错误的广告位
 * @param {Object} param - 参数
 */
export const getErrSspSlot = (data) => {
	return axios.request({
		url: `/api/v1/dsp_slot/get_err_ssp_slot?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 预算管理  获取已删除匹配的预算位
 * @param {Object} param - 参数
 */
export const getDspHistory = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/dsp_map_history?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * 获取产品列表
 * @param {Object} param - 参数
 */
export const getDspProductList = (data) => {
	return axios.request({
		url: `/api/v1/product/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [新建产品]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspProductAdd = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/product/new',
		data
	})
}

/**
 * [修改产品]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const dspProductMod = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/product/mod',
		data
	})
}
