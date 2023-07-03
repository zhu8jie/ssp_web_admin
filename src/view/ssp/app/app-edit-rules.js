import { regWebUrl, regNum2Precision, regNumPositiveInteger2, regNumPositiveInteger } from '@/libs/util'

export const formRules = {
	data() {
		// 选择应用平台和应用商店
		const osTypeCheck = (rule, value, callback) => {
			if (!value) {
				callback(new Error('请输入应用商店详情页地址'))
			} else if (!regWebUrl.test(value)) {
				callback(new Error('请输入合法的url地址'))
			} else {
				callback()
			}
		}
		const appOneTwoCheck = (rule, value, callback) => {
			let _form = this.formBase

			if (!_form.app_type_one) {
				callback(new Error('请选择应用类型'))
			} else if (!_form.app_type_two) {
				callback(new Error('请选择应用类别'))
			} else {
				callback()
			}
		}
		const userCharacterCheck = (rule, value, callback) => {
			let _form = this.formBase

			if ((_form.app_dau > 0 && !regNum2Precision.test(_form.app_dau)) ||
				(_form.app_male_rate > 0 && !regNum2Precision.test(_form.app_male_rate)) ||
				(_form.app_female_rate > 0 && !regNum2Precision.test(_form.app_female_rate))
			) {
				callback(new Error('小数点之后最多2位精度'))
			} else if (_form.app_male_rate + _form.app_female_rate > 100) {
				callback(new Error('男女用户占比总数不能超过100'))
			} else {
				callback()
			}
		}
		const appt3StoreDownCheck = (rule, value, callback) => {

			let arr = this.formBase.app_check_store
			let showTxt = ''
			for (let i = 0; i < arr.length; i++) {

				let item = arr[i]

				if (!!item.id) {
					if (!item.value) {
						showTxt = '请输入应用商店详细地址'
						break
					} else {
						if (!regWebUrl.test(item.value)) {
							showTxt = '请输入合法的url地址'
							break
						}
					}
				}
			}

			if (!!showTxt) {
				callback(new Error(showTxt))
			} else {
				callback()
			}
		}
		/**
		 * [视频播放完直接跳转/下载/拨打电话]
		 * @param  {[type]}   rule     [description]
		 * @param  {[type]}   value    [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		const checkVideoPercent = (rule, value, callback) => {
			// interact_video_goon: -1, // 视频交互，播放完后是否直接跳转或者下载拨打电话，1=是，-1=否
			let _form = this.sdkFormBase
			let _value = this.sdkFormBase.interact_video_goon_percent

			if (_form.interact_video_goon === 1) {
				if (_value <= 0 || _value > 100 || !regNumPositiveInteger2.test(_value)) {
					callback(new Error('请输入大于0小于等于100的正整数'))
				} else {
					callback()
				}
			} else {
				callback()
			}
		}
		const checkVideoDelay = (rule, value, callback) => {
			// join_group_video_delay: 3, // 视频播放页加群弹窗显示延迟时间，单位秒
			let _value = this.sdkFormBase.join_group_video_delay

			if (_value <= 0 || _value > 5 || !regNumPositiveInteger.test(_value)) {
				callback(new Error('请输入大于0小于等于5的正整数'))
			} else {
				callback()
			}
		}
		return {
			ruleBase: { // 基本配置正则
				os_type: [{required: true, message: '请选择应用平台'}],
				app_store_id: [{required: true, message: '请选择应用商店'}],
				store_detail_url: [{required: true, validator: osTypeCheck}],
				app_name: [{required: true, message: '请输入应用名称', trigger: 'blur'}],
				app_type_one: [{required: true, validator: appOneTwoCheck}],
				keyword: [{required: true, message: '请输入应用关键字', trigger: 'blur'}],
				desc: [{required: true, message: '请输入应用简介', trigger: 'blur'}],
				package_name: [{required: true, message: '请输入应用包名', trigger: 'blur'}],
				access_type: [{required: true, message: '请选择接入方式'}],
				app_platform_id: [{required: true, message: '请选择接入第三方SDK'}],
				icon: [{required: true, message: '请上传应用Icon'}],
				app_check_store: [{required: false, validator: appt3StoreDownCheck}], // 应用商店确认
				copyright_img: [{required: true, message: '填写带有广告展示的应用商店及下载地址'}],
				user_character: [{required: false, validator: userCharacterCheck}], // 应用受众用户特征信息
				no_put_type: [{required: true, message: '请输入不可投放类型', trigger: 'blur'}]
			},
			sdkRuleBase: { // sdk配置
				interact_video_goon_percent: [{required: false, validator: checkVideoPercent}], // 视频播放完直接跳转/下载/拨打电话
				join_group_video_delay: [{required: false, validator: checkVideoDelay}], // 视频播放完直接跳转/下载/拨打电话
			}
		}
	}
}
