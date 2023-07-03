import axios from '@/libs/api.request'
import qs from 'qs'

// 广告物料

/**
 * 数据管理 数据导入 获取广告物料
 * @param {Object} param - 参数
 */
export const getAdMaterialList = (data) => {
	return axios.request({
		url: `/api/v1/data_material/get_ad_material?${qs.stringify(data, {arrayFormat: 'repeat'})}`,
		method: 'get'
	})
}
