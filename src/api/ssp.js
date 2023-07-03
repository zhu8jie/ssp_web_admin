// 流量管理接口
import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 获取媒体列表
 * @param {Object} param - 参数
 */
export const getMediaList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_dev/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * 给开发者用户重置密码
 * @param {Object} param - 参数
 */
export const mediaResetPwd = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/user_dev/reset_pwd',
		data
	})
}

/**
 * 开发者 - 注册
 * @param {Object} param - 参数
 */
export const mediaRegister = (data) => {
	return axios.request({
		url: '/api/v1/user_dev/register',
		method: 'post',
		data
	})
}

/**
 * 获取开发者用户配置信息
 * @param {Object} param - 参数
 */
export const getMediaConfigInfo = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_dev/get_config_info?${qs.stringify(data)}`
	})
}
/**
 * 获取开发者用户配置信息
 * @param {Object} param - 参数
 */
export const getFetchRealData = (data) => {
	return axios.request({
		method: 'POST',
		url: `/api/v1/ssp_slot/real_time_data/fetch`,
		data
	})
}
/**
 * 修改媒体列表配置
 * @param {Object} param - 参数
 */
export const setMediaDevConfig = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/user_dev/config',
		data
	})
}

/**
 * 媒体列表 -- 媒体用户状态变更
 * @param {Object} param - 参数
 */
export const setMediaDevStatus = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/user_dev/status',
		data
	})
}

// ↓  应用管理

/**
 * [获取应用列表]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const getAppList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/app/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * [爆出下载广告位列表url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const getAppListUrl = (data) => {
	return `/api/v1/app/list?${qs.stringify(data, {arrayFormat: 'repeat'}).replace(/%3A/g, ':')}`
}

/**
 * [修改应用列表]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const saveAppDetail = (data) => {
	return axios.request({
		method: 'PUT',
		url: `/api/v1/app/update`,
		data
	})
}

/**
 * [获取配置信息]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const getAppConfigInfo = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/app/get_platform_config?${qs.stringify(data)}`
	})
}

/**
 * [提交配置信息]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const setAppConfigInfo = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/app/set_platform_config',
		data
	})
}

/**
 * [批量新建应用]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const appImport = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/app/import_add',
		data
	})
}

/**
 * [批量新建应用的url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const appImportUrl = '/api/v1/app/import_add'

/**
 * [批量修改应用]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const appImportUpdate = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/app/import_update',
		data
	})
}

/**
 * [批量修改应用的url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const appImportUpdateUrl = '/api/v1/app/import_update'

/**
 * 应用列表 -- 应用状态变更
 * @param {Object} param - 参数
 */
export const setAppDevStatus = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/app/status',
		data
	})
}

/**
 * 获取用户信息
 * @param {Object} param - 参数
 */
export const getDevUserInfoApi = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_dev/info?${qs.stringify(data)}`
	})
}

/**
 * 修改开发者用户信息
 * @param {Object} param - 参数
 */
export const getUserUpdateApi = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/user_dev/update_info',
		data
	})
}

/**
 * 获取财务信息
 * @param {Object} param - 参数
 */
export const getFinanceInfoApi = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/user_dev/info_finance?${qs.stringify(data)}`
	})
}

/**
 * 修改用户的财务信息
 * @param {Object} param - 参数
 */
export const getFinanceUpdateApi = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/user_dev/update_info_finance',
		data
	})
}

/**
 * 获取应用详情
 * @param {Object} param - 参数
 */
export const getAppInfo = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/app/info?${qs.stringify(data)}`
	})
}

/**
 * 管理平台  广告位管理
 * 获取广告位列表
 * @param {Object} param - 参数
 */
export const getSspSlotAdList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 管理平台  广告位管理
 * 获取广告位列表
 * @param {Object} param - 参数
 */
export const getMediaSspSlotAdList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/list_v2?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 管理平台  广告位管理
 * 获取广告位操作日志
 * @param {Object} param - 参数
 */
export const getOperateLog = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/operate/logs?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 管理平台  广告位管理
 * 批量修改运营状态
 * @param {Object} param - 参数
 */
export const submitOperateStatus = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ssp_slot/operate_status/set',
		data
	})
}
/**
 * 管理平台  广告位管理
 * 批量修改产品备注
 * @param {Object} param - 参数
 */
export const submitProductRemark = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ssp_slot/dsp_product/remark',
		data
	})
}
/**
 * [爆出下载广告位列表url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const getSspSlotAdListUrl = (data) => {
	return `/api/v1/ssp_slot/list_v2?${qs.stringify(data, {arrayFormat: 'repeat'})}`
}
/**
 * 管理平台  广告位管理
 * 获取广告位配置信息
 * @param {Object} param - 参数
 */
export const getSspSlotConfigData = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/get_config?${qs.stringify(data)}`
	})
}

/**
 * 管理平台  广告位管理
 * 提交广告位配置信息
 * @param {Object} param - 参数
 */
export const submitControlApi = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/ssp_slot/set_control',
		data
	})
}
/**
 * 管理平台  广告位管理
 * 提交广告位配置信息
 * @param {Object} param - 参数
 */
export const submitConfigApi = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/ssp_slot/set_config',
		data
	})
}

/**
 * 管理平台  广告位管理 获取广告位详情
 * @param {Object} param - 参数
 */
export const getSspSlotInfo = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/info?${qs.stringify(data)}`
	})
}

/**
 * 管理平台  广告位管理 保存广告位
 * @param {Object} param - 参数
 */
export const updateSspSlot = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/ssp_slot/update',
		data
	})
}

/**
 * 管理平台  广告位管理 获取当前媒体下可选的广告场景和渲染方式
 * @param {Object} param - 参数
 */
export const getSspSlotAdType = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ssp_slot/get_ad_type?${qs.stringify(data)}`
	})
}

/**
 * 管理平台  广告位管理 广告位状态变更
 * @param {Object} param - 参数
 */
export const setSspSlotStatus = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/ssp_slot/status',
		data
	})
}

/**
 * [批量导入广告位]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImport = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ssp_slot/import_add',
		data
	})
}

/**
 * [批量导入广告位url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImportUrl = '/api/v1/ssp_slot/import_add'

/**
 * [批量修改广告位]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImportUpdate = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ssp_slot/import_update',
		data
	})
}
/**
 * [批量修改广告位的url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImportUpdateUrl = '/api/v1/ssp_slot/import_update'

/**
 * [批量配置预算位]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImportMap = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ssp_slot/import_map',
		data
	})
}

/**
 * [批量导入广告位url]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const sspSlotImportMapUrl = '/api/v1/ssp_slot/import_map'

/**
 * 获取deal组列表
 * @param {Object} param - 参数
 */
export const getDealList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/deal/get_list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}

/**
 * [添加/修改deal组]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const saveDeal = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/deal/save',
		data
	})
}

/**
 * 保存 素材尺寸列表
 * @param {Object} param - 参数
 */
export const saveAdRatio = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ad_ratio',
		data
	})
}
