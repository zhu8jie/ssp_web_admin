import {regNum2Precision } from '@/libs/util'

export const formRules = {
	data() {
		return {
			ruleBase: { // 正则
				template_id: [{required: true, message: '请选择计划模板'}],
				concatDate: [{required: true, message: '请选择测试时间'}],
				name: [{required: true, message: '请输入计划名称'}],
				ssp_slot_id_arr: [{required: true, message: '请选择关联广告位'}],
				dsp_product_id_arr: [{required: true, message: '请选择关联产品'}]
			}
		}
	},
	methods: {
		/**
		 * [validatePrice 校验cpm]
		 * @param  {[type]}   rule     [description]
		 * @param  {[type]}   value    [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		validatePrice(rule, value, callback) {
			if (value === null || value === undefined) {
				callback(new Error('请填写CPM价格'))
			} else if (!regNum2Precision.test(value) || value <= 0) {
				callback(new Error('大于0，最多可填两位小数'))
			} else {
				callback()
			}
		},
		/**
		 * [validateDealId 正则DealID  不能输入中文，特殊符号]
		 * @param  {[type]}   rule     [description]
		 * @param  {[type]}   value    [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		validateDealId(rule, value, callback) {
			const reg = /^[0-9a-zA-Z_]{1,}$/

			if (!value) {
				callback(new Error('请输入DealID'))
			} else if (!reg.test(value)) {
				callback(new Error('DealID只支持数字、英文、下划线'))
			} else {
				callback()
			}
		},
	}
}
