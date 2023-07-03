import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 财务中心  财务中心列表
 * @param {Object} param - 参数
 */
export const getUdBillList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ud_bill/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 财务中心  总计的列表
 * @param {Object} param - 参数
 */
export const getUdSumList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ud_bill/cnt_data?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 财务中心  财务状态列表
 * @param {Object} param - 参数
 */
export const getHistoryList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/ud_bill_history/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 财务中心 打款
 * @param {Object} param - 参数
 */
export const saveStatusRemit = (data) => {
		return axios.request({
			method: 'post',
			url: '/api/v1/ud_bill/status_remit',
			data
		})
	}
/**
 * 财务中心 上传电子凭证
 * @param {Object} param - 参数
 */
export const uploadBackBill = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/upload_back_bill',
		data
	})
}
/**
 * 财务中心 填写的电子凭证
 * @param {Object} param - 参数
 */
export const inputMailCode = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/input_mail_code',
		data
	})
}

/**
 * 财务中心 账单操作历史
 * @param {Object} param - 参数
 */
export const saveUdBillHistory = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill_history/list',
		data
	})
}
/**
 * 财务中心 初审通过
 * @param {Object} param - 参数
 */
export const saveUdBillStatus = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/status_check',
		data
	})
}
/**
 * 财务中心 终审
 * @param {Object} param - 参数
 */
export const saveLastCheck = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/status_check_last',
		data
	})
}
/**
 * 财务中心 修正税前金额
 * @param {Object} param - 参数
 */
export const statusCorrect = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/status_correct',
		data
	})
}
/**
 * 财务中心 结算材料审核确认
 * @param {Object} param - 参数
 */
export const statusMaterial = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/ud_bill/status_material',
		data
	})
}
