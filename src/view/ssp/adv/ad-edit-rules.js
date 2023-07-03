import {
	regWebUrl
} from '@/libs/util'
export const formRules = {
	data() {
		return {
			ruleBase: { // 正则
				app_id: [{ required: true, message: '请选择应用'}],
				ad_type_id: [{ required: true, message: '请选择广告场景'}],
				render_type: [{ required: true, message: '请选择广告渲染方式'}],
				creative_type: [{ required: true, message: '请选择广告样式'}],
				need_callback: [{ required: true, message: '请选择奖励发放设置'}],
				ad_material_type: [{ required: true, type: 'array', message: '请选择广告素材类型' }],
				ad_ratios: [{ required: true, message: '请选择素材尺寸比例' }],
				callback_url: [
					{ required: true, message: '请输入回调URL', trigger: 'blur'},
					{ pattern: regWebUrl, message: '请输入合法的url地址', trigger: 'blur'}
				],
				ad_image_url: [{ required: true, message: '请上传广告位截图'}],
				ssp_slot_name: [{ required: true, message: '请填写广告位名称', trigger: 'blur'}]
			}
		}
	}
}