import {
	logout,
	getSysUserInfo,
	getSysUserRole
} from '@/api/user'

import {
	getAllAdType,
	getMediaCompany,
	getPlatform3rd,
	tableInfoApi,
	setTableHeadApi,
	setTablePageApi,
	getProvinceCityApi,
	getPhoneBrand
} from '@/api/common'

import {
	getMenuByRouter,
	getKeyByRouter,
	adminGetMenuByRouter
} from '@/libs/util'

import {
	asyncRouterMap
} from '@/router/routers'

import { getDspCompanyList } from '@/api/dsp'

import config from '@/config'

export default {
	state: {
		userName: localStorage.getItem(config.loginEnterName) || '', // 用户姓名
		userId: localStorage.getItem(config.loginEnterId) || '', // 用户id
		userInfo: '', // 系统用户基本信息

		userRoute: [], // 用户路由
		catchMenuByRouter: [], // 缓存路由
		userRouteKeyObj: {}, // 用户路由key值
		userDspFields: [], // 用户dsp自定义权限
		userSspFields: [], // 用户ssp自定义权限
		userAllFields: false, // 用户报表权限的全选
		userAllModels: false, // 用户菜单的全选

		adTypeArr: [], // 广告类型
		meidaCompanyArr: [], // 媒体公司
		provinceCityArr: [], // 城市的选择
		phoneBrandArr: [], // 手机品牌
		platform3rdArr: [], // 第三方平台名称
		allDspCompanyArr: [], // 预算管理->公司管理 ，所有的公司列表， 缓存使用

		pageCommonMemory: '', // 页面公告记忆
		accessTypeArr: [ // 接入方式
			{
				id: 1,
				name: 'API'
			},
			{
				id: 2,
				name: 'SDK'
			}
		],
		renderTypeArr: [ // 渲染方式
			{
				id: 1,
				name: '模板'
			},
			{
				id: 2,
				name: '自渲染'
			}
		],
		osTypeArr: [ // 应用商店数据
			{
				id: 1,
				name: 'Android'
			},
			{
				id: 2,
				name: 'IOS'
			}
		]
	},
	getters: {
		renderType: state => state.renderTypeArr,
		accessType: state => state.accessTypeArr,
		osType: state => state.osTypeArr,
		menuList: state => state.catchMenuByRouter, // 用户路由
		userInPageRole: state => state.userRouteKeyObj, // 用户页面内权限
		getUserRoute: state => state.userRoute, // 用户路由
		getUserDspFields: state => state.userDspFields, // 用户dsp自定义权限 - 预算表格
		getUserSspFields: state => state.userSspFields, // 用户ssp自定义权限 - 流量表格
		getUserAllFields: state => state.userAllFields, // 用户报表的全选
		getUserAllModels: state => state.userAllModels // 用户菜单的全选
	},
	mutations: {
		/**
		 * @param {[type]}
		 * @param {[type]}
		 */
		setUserId(state, id) {
			localStorage.setItem(config.loginEnterId, id)
			state.userId = id
		},
		setUserName(state, name) {
			localStorage.setItem(config.loginEnterName, name)
			state.userName = name
		},
		setUserInfo(state, info) { // 用户基本信息
			state.userInfo = info
		},
		setUserRole(state, info) { // 用户权限
			let role = info.role
			state.userRoute = !!role && !!role.models && role.models.length ? role.models : [] // 用户路由
			state.userDspFields = !!role && !!role.dsp_fields && role.dsp_fields.length ? role.dsp_fields : [] // 用户dsp自定义权限 - 预算表格
			state.userSspFields = !!role && !!role.ssp_fields && role.ssp_fields.length ? role.ssp_fields : [] // 用户ssp自定义权限 - 流量表格

			state.userAllFields = state.userName === config.superName ? true : (!!role && !!role.all_fields) // 用户报表的全选
			state.userAllModels = state.userName === config.superName ? true : (!!role && !!role.all_models) // 用户菜单的全选

			state.userRouteKeyObj = getKeyByRouter(state.userRoute)
			state.catchMenuByRouter = state.userName === config.superName ? adminGetMenuByRouter(asyncRouterMap) : getMenuByRouter(asyncRouterMap, state.userRouteKeyObj) // 左侧导航路由

			// console.log(state.userAllFields)
			// console.log('预算表格', state.userDspFields)
			// console.log('流量表格', state.userSspFields)
		},

		/**
		 * [resetUserRole 重置用户角色]
		 * @param  {[type]} state [description]
		 * @return {[type]}       [description]
		 */
		resetUserRole(state) {
			state.userRoute = [] // 用户路由
			state.catchMenuByRouter = []
			state.userRouteKeyObj = {} // 用户路由key值

			state.userDspFields = [] // 用户dsp自定义权限
			state.userSspFields = [] // 用户ssp自定义权限

			state.userAllFields = false // 用户ssp自定义权限
			state.userAllModels = false // 用户ssp自定义权限
		},

		/**
		 * [setLoginOut 退出登录]
		 * @param {[type]} state [description]
		 * @param {[type]} name  [description]
		 */
		setLoginOut(state, name) {
			localStorage.removeItem(config.loginEnterName)
			localStorage.removeItem(config.loginEnterId)
			state.userId = ''
			state.userName = ''
			state.userInfo = ''
		},
		setAdType(state, arr) { // 设置媒体类型
			state.adTypeArr = arr
		},
		setAllMediaCompany(state, arr) { // 设置媒体公司数据
			state.meidaCompanyArr = arr
		},
		setAllProvinceCity(state, arr) { // 设置城市
			state.provinceCityArr = arr
		},
		setAllPhoneBrand(state, arr) { // 手机品牌
			state.phoneBrandArr = arr
		},
		setPlatform3rd(state, arr) { // 获取第三方平台名称
			state.platform3rdArr = arr
		},
		setAllDspCompany(state, arr) { // 获取预算管理->公司管理 ，所有的公司列表， 缓存使用
			state.allDspCompanyArr = arr
		},
		/**
		 * [pageCustomMemory 页面公告记忆]
		 * @param  {[type]} state [description]
		 * @param  {[type]} obj   [description]
		 * @return {[type]}       [description]
		 */
		pageCustomMemory(state, obj) {
			state.pageCommonMemory = obj
		}
	},
	actions: {
		/**
		 * [getPhoneBrand 获取省市的列表]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		getPhoneBrand({state, commit}) {
			return new Promise((resolve, reject) => {
				try {
					getPhoneBrand().then(res => {
						commit('setAllPhoneBrand', res.data.list)
						resolve(res.data.list)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [getProvinceCityApi 获取省市的列表]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		getProvinceCityApi({state, commit}) {
			return new Promise((resolve, reject) => {
				try {
					getProvinceCityApi().then(res => {
						commit('setAllProvinceCity', res.data.list)
						resolve(res.data.list)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},

		/**
		 * [logout 退出登录]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		logout({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					logout().then(res => {
						resolve(res)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * @param  {获取系统用户信息}
		 * @param  {[type]}
		 * @return {[type]}
		 */
		getSysUserInfo({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					getSysUserInfo().then(res => {
						if (res.code === 200) {
							commit('setUserName', res.data.sys_account)
							commit('setUserId', res.data.id)
							commit('setUserInfo', res.data)
						}
						resolve(res.data)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * @param  {获取系统用户信息}
		 * @param  {[type]}
		 * @return {[type]}
		 */
		getSysUserRole({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					getSysUserRole().then(res => {
						if (res.code === 200) {
							commit('setUserRole', res.data)
						}
						resolve(res)
					}).catch(err => {
						commit('setUserRole', err)
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [getMediaCompany 获取媒体公司数据]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		getMediaCompany({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					getMediaCompany().then(res => {
						let result = res.code === 200 ? res.data.list : []
						commit('setAllMediaCompany', result)
						resolve(result)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [getAllAdType 获取广告类型]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		getAllAdType({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					getAllAdType().then(res => {
						let result = [] // 过滤掉 VR广告
						if (res.data && res.data.list.length > 0) {
							result = res.data.list.filter(item => {
								return item.id !== 7
							})
						}
						commit('setAdType', result)
						resolve(result)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [getPlatform3rd 获取第三方平台名称]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @return {[type]}                [description]
		 */
		getPlatform3rd({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					getPlatform3rd().then(res => {
						let result = res.code === 200 ? res.data.list : []
						commit('setPlatform3rd', result)
						resolve(result)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [getDspCompanyList 缓存所有的预算位公司列表，在预算位管理搜索中使用]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @param  {[type]} payload        [description]
		 * @return {[type]}                [description]
		 */
		getDspCompanyList({ state, commit }, payload) {
			return new Promise((resolve, reject) => {
				try {
					getDspCompanyList(payload).then(res => {
						commit('setAllDspCompany', res.code === 200 ? res.data.list : [])
						resolve(res.code === 200 ? res.data.list : [])
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},
		/**
		 * [tableInfoApi 表头和页码记忆]
		 * @param  {[type]} options.state  [description]
		 * @param  {[type]} options.commit [description]
		 * @param  {[type]} payload        [description]
		 * @return {[type]}                [description]
		 */
		tableInfoApi({ state, commit }) {
			return new Promise((resolve, reject) => {
				try {
					tableInfoApi().then(res => {
						commit('pageCustomMemory', res.code === 200 ? res.data : '')
						resolve(res.code === 200 ? res.data : '')
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},

		/**
		 * [setTableHeadApi 表头记忆 保存]
		 * @param {[type]} options.state  [description]
		 * @param {[type]} options.commit [description]
		 * @param {[type]} payload        [description]
		 */
		setTableHeadApi({ state, commit }, payload) {
			return new Promise((resolve, reject) => {
				try {
					setTableHeadApi(payload).then(res => {
						resolve(res)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		},

		/**
		 * [setTableHeadApi 页码记忆 保存]
		 * @param {[type]} options.state  [description]
		 * @param {[type]} options.commit [description]
		 * @param {[type]} payload        [description]
		 */
		setTablePageApi({ state, commit }, payload) {
			return new Promise((resolve, reject) => {
				try {
					setTablePageApi(payload).then(res => {
						resolve(res)
					}).catch(err => {
						reject(err)
					})
				} catch (error) {
					reject(error)
				}
			})
		}
	}
}
