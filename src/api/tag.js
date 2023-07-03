import axios from '@/libs/api.request'
import qs from 'qs'

/**
 * 获取人群定向标签
 * @param {Object} param - 参数
 */
export const getCrowdTagList = (data) => {
	return axios.request({
		url: `/api/v1/direct_tag/list?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}

/**
 * [新建人群标签]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const crowdTagAdd = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/direct_tag/new',
		data
	})
}

/**
 * [修改人群标签]
 * @param  {[type]} data [description]
 * @return {[type]}	  [description]
 */
export const crowdTagMod = (data) => {
	return axios.request({
		method: 'post',
		url: '/api/v1/direct_tag/mod',
		data
	})
}