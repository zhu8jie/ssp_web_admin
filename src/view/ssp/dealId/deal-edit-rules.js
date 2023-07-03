import {regNum2Precision, regNumString } from '@/libs/util'

export const formRules = {
	data() {
		return {
			ruleBase: { // 正则
				name: [{required: true, message: '请输入Deal组名称'}],
				ssp_slot_ids: [{required: true, message: '请选择关联广告位'}]
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
			if (!value) {
				callback(new Error('请输入DealID'))
			} else if (!regNumString.test(value)) {
				callback(new Error('DealID只支持数字、英文、下划线'))
			} else {
				callback()
			}
		}
	}
}
