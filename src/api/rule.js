import axios from '@/libs/api.request'
import qs from 'qs'
/**
 *  规则列表
 * @param {Object} param - 参数
 */
export const getRuleList = (data) => {

	return axios.request({
		url: `/api/v1/rule/list?${qs.stringify(data)}`,
		method: 'get'
	})
}


/**
 * 规则管理 预算位 新建/修改预算方
 * @param {Object} param - 参数
 */
export const saveRule = (data) => {
	return axios.request({
		url: '/api/v1/rule/save',
		method: 'post',
		data
	})
}


/**
 *  广告位规则列表
 * @param {Object} param - 参数
 */
export const getSspRuleList = (data) => {

	return axios.request({
		url: `/api/v1/rule_ssp/list?${qs.stringify(data)}`,
		method: 'get'
	})
}

/**
 * 广告规则管理 预算位 新建/修改预算方
 * @param {Object} param - 参数
 */
export const saveSspRule = (data) => {
	return axios.request({
		url: '/api/v1/rule_ssp/save',
		method: 'post',
		data
	})
}

/**
 *  媒体位规则列表
 * @param {Object} param - 参数
 */
export const getDspRuleList = (data) => {

	return axios.request({
		url: `/api/v1/rule_dsp/list?${qs.stringify(data)}`,
		method: 'get'
	})
}


/**
 * 媒体位规则管理 预算位 新建/修改预算方
 * @param {Object} param - 参数
 */
export const saveDspRule = (data) => {
	return axios.request({
		url: '/api/v1/rule_dsp/save',
		method: 'post',
		data
	})
}

