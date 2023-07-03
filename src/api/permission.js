import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 账号权限-新建模块
 * @param {Object} param - 参数
 */
export const addSysModule = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/sys_model/new',
		data
	})
}

/**
 * 账号权限 获取模块列表
 * @param {Object} param - 参数
 */
export const getSysModule = (data) => {
	return axios.request({
		url: `/api/v1/sys_model/get?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * 账号权限-修改模块
 * @param {Object} param - 参数
 */
export const updateSysModule = (data) => {
	return axios.request({
		method: 'patch',
		url: '/api/v1/sys_model/mod',
		data
	})
}

/**
 * 账号权限 获取模块列表
 * @param {Object} param - 参数
 */
export const delelteSysModule = (data) => {
	return axios.request({
		url: '/api/v1/sys_model/del',
		method: 'delete',
		data
	})
}
/**
 * 账号权限 获取角色列表
 * @param {Object} param - 参数
 */
export const getSysRole = (data) => {
	return axios.request({
		url: `/api/v1/sys_role/get?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
/**
 * 账号权限 新建角色列表
 * @param {Object} param - 参数
 */
export const addSysRole = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/sys_role/new',
		data
	})
}
/**
 * 账号权限 更新角色列表
 * @param {Object} param - 参数
 */
export const updateSysRole = (data) => {
	return axios.request({
		method: 'PATCH',
		url: '/api/v1/sys_role/mod',
		data
	})
}
/**
 * 账号权限 删除角色
 * @param {Object} param - 参数
 */
export const deleteSysRole = (data) => {
	return axios.request({
		method: 'DELETE',
		url: '/api/v1/sys_role/del',
		data
	})
}
/**
 * 账号权限 获取角色详情
 * @param {Object} param - 参数
 */
export const detailSysRole = (data) => {
	return axios.request({
		url: `/api/v1/sys_role/detail?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
/**
 * 账号权限 获取账号的列表
 * @param {Object} param - 参数
 */
export const getSysUserList = (data) => {
	return axios.request({
		url: `/api/v1/user_sys/get?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
/**
 * 账号权限 创建账号
 * @param {Object} param - 参数
 */
export const addSysUser = (data) => {
	return axios.request({
		method: 'POST',
		url: '/api/v1/user_sys/new',
		data
	})
}
/**
 * 账号权限 修改账号
 * @param {Object} param - 参数
 */
export const updateSysUser = (data) => {
	return axios.request({
		method: 'PATCH',
		url: '/api/v1/user_sys/mod',
		data
	})
}
/**
 * 账号权限 修改账号密码
 * @param {Object} param - 参数
 */
export const updateSysUserPassWord = (data) => {
	return axios.request({
		method: 'PATCH',
		url: '/api/v1/user_sys/password/reset',
		data
	})
}
/**
 * 账号权限 分配资源
 * @param {Object} param - 参数
 */
export const getResourceAlloc = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/user_sys/resource/alloc',
		data
	})
}
/**
 * 账号权限 分配资源获取
 * @param {Object} param - 参数
 */
export const getResourceData = (data) => {
	return axios.request({
		url: `/api/v1/user_sys/resource/get?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
