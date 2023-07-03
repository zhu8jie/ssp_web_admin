import axios from '@/libs/api.request'
import qs from 'qs'


/**
 * 待测试广告位列表  任务面板
 * @param {Object} param - 参数
 */
export const getTestWaitingList = (data) => {
	return axios.request({
		url: `/api/v1/ssp_slot/list/test_waiting?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 获取测试计划模板
 * @param {Object} param - 参数
 */
export const getPlanTemplateList = (data) => {
	return axios.request({
		url: `/api/v1/test_plan/template/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [新建测试计划模板]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planTemplateAdd = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/template/new',
		data
	})
}

/**
 * [修改测试计划模板]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planTemplateMod = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/template/mod',
		data
	})
}

/**
 * [删除测试计划模板]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planTemplateDel = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/template/del',
		data
	})
}

/**
 * 获取测试计划列表
 * @param {Object} param - 参数
 */
export const getPlanList = (data) => {
	return axios.request({
		url: `/api/v1/test_plan/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [新建测试计划]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planAdd = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/new',
		data
	})
}

/**
 * [修改测试计划]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planMod = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/mod',
		data
	})
}

/**
 * [删除测试计划]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planDel = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/del',
		data
	})
}

/**
 * [修改测试计划状态]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const modPlanStatus = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/status/set',
		data
	})
}

/**
 * 测试计划匹配预算位
 * @param {Object} param - 参数
 */
export const matchPlanDspSlot = (data) => {
	return axios.request({
		url: `/api/v1/test_plan/match?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [修改测试条约备注]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const planClauseRemark = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/clause/remark',
		data
	})
}

/**
 * [修改测试条约状态]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const modPlanClauseStatus = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/test_plan/clause/status/set',
		data
	})
}
