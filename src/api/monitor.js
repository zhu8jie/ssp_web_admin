// 数据监测
import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 获取任务列表
 * @param {Object} param - 参数
 */
export const getTaskReporting = (data) => {
	return axios.request({
		url: `/api/v1/task/reporting?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [getTaskReportingAPI 导出获取任务列表url ]
 * @param {Object} param - 参数
 */
export const getTaskReportingAPI = (data) => {
	return `/api/v1/task/reporting?${qs.stringify(data, {arrayFormat: 'repeat'})}`
}
/**
 * 获取cp的列表
 * @param {Object} param - 参数
 */
export const getCPList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/task/cp/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 新建cp
 * @param {Object} param - 参数
 */
export const addCPNew = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/task/cp/new',
		data
	})
}
/**
 * 修改cp
 * @param {Object} param - 参数
 */
export const modCPData = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/task/cp/mod',
		data
	})
}
/**
 * 获取cp的推广产品
 * @param {Object} param - 参数
 */
export const getAppList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/task/apps?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 新建产品
 * @param {Object} param - 参数
 */
export const addTaskAppNew = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/task/app/new',
		data
	})
}
/**
 * 修改产品
 * @param {Object} param - 参数
 */
export const modTaskAppNew = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/task/app/mod',
		data
	})
}
/**
 * 获取渠道列表
 * @param {Object} param - 参数
 */
export const getChannelList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/task/channels?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 新建渠道
 * @param {Object} param - 参数
 */
export const addNewChannel = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/task/channel/new',
		data
	})
}
/**
 * 修改渠道
 * @param {Object} param - 参数
 */
export const modChannel = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/task/channel/mod',
		data
	})
}
/**
 * 任务列表
 * @param {Object} param - 参数
 */
export const getTaskList = (data) => {
	return axios.request({
		method: 'get',
		url: `/api/v1/task/tasks?${qs.stringify(data, {arrayFormat: 'repeat'})}`
	})
}
/**
 * 新建任务
 * @param {Object} param - 参数
 */
export const addNewTask = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/task/task/new',
		data
	})
}
/**
 * 修改任务
 * @param {Object} param - 参数
 */
export const modTask = (data) => {
	return axios.request({
		method: 'put',
		url: '/api/v1/task/task/mod',
		data
	})
}
