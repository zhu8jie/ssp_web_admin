<template>
	<div class="control-card" v-if="crowdTagArr.length">
		<div class="control-nav">
			<RadioGroup v-model="formBase.tag_orientation" @on-change="radioChange">
				<Radio v-for="item in tagOrientationArr" :label="item.id" :key="item.id" :disabled="disabled">{{item.name}}</Radio>
			</RadioGroup>
		</div>
		<div class="control-table" v-if="formBase.tag_orientation !== 0">
			<div class="item-list" v-if="formBase.tag_orientation !== 2">
				<div class="item-label">
					定向外流量占比
					<Tooltip max-width="300" content="定向外流量指非目标人群的流量，此处占比目的是在定向流量里掺入非目标人群流量，保证CTR在合理稳定的数据范围内">
						<i class="iconfont icon-why"></i>
					</Tooltip>
					:
				</div>
				<div class="item-content">
					<Input :maxlength="5" class="percent-input" v-model="formBase.tag_proportion" :disabled="disabled"></Input>&nbsp;&nbsp;%
				</div>
			</div>
			<div class="item-list" v-if="formBase.tag_orientation !== 2">
				<div class="item-label">
					逻辑关系
					<Tooltip max-width="300" :content="`满足其一：流量满足任一人群标签则投放\t全部满足：流量必须同时满足所有人群标签才投放`">
						<i class="iconfont icon-why"></i>
					</Tooltip>
					:
				</div>
				<div class="item-content">
					<RadioGroup v-model="formBase.tag_relation">
						<Radio v-for="item in tagRelationArr" :label="item.id" :key="item.id" :disabled="disabled">{{item.name}}</Radio>
					</RadioGroup>
				</div>
			</div>
			<div class="item-list">
				<div class="item-label">
					选择人群标签:
				</div>
				<div class="item-content">
					<div class="tag-select">
						<Select
							multiple
							filterable
							:max-tag-count="1"
							:label-in-value="true"
							:max-tag-placeholder="limitText"
							@on-change="tagSelectChange"
							v-model="formBase.tag_list"
							placeholder="请选择人群标签"
							:disabled="disabled"
						>
							<Option v-for="item in crowdTagArr" :value="item.code" :key="item.code">{{item.name}}</Option>
						</Select>
					</div>
					<div class="tag-check">
						<div class="tag-item" v-for="(item, index) in hasCheckTag"><span>{{item.label}}</span><i class="iconfont icon-close" @click="toggleTag(item)"></i></div>
					</div>
				</div>
			</div>
		</div>
		<p class="ivu-form-item-error-tip" v-show="!!errorMsg && errShow">{{errorMsg}}</p>
	</div>
</template>

<script>

import { debounce } from '@/libs/tools'
import { regNumber } from '@/libs/util'
import { BigNumber } from 'bignumber.js'

export default {
	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		errShow: {
			type: Boolean,
			default: true
		},
		crowdTagArr: Array,
		defaultCrowd: Object
	},
	data() {
		return {
			hasCheckTag: [], // 已选择的标签

			tagOrientationArr: [ // 定向状态
				{
					id: 0,
					name: '不限'
				},
				{
					id: 1,
					name: '定向'
				},
				{
					id: 2,
					name: '排除'
				}
			],
			tagRelationArr: [ // 逻辑关系
				{
					id: 1,
					name: '满足其一'
				},
				{
					id: 2,
					name: '全部满足'
				}
			],
			errorMsg: '', // 错误信息
			formBase: {}, // form表单
			formFlag: false // form填写状态
		}
	},
	methods: {
		/**
		 * [returnForm 返回数据]
		 * @return {[type]} [description]
		 */
		returnForm() {

			let _form = { ...this.formBase}

			let returnForm = {
				tag_orientation: 0 // 默认值 0 不限
			}

			// 处理数据
			if (_form.tag_orientation === 1) {
				returnForm = {
					tag_orientation: 1,
					tag_proportion: !!_form.tag_proportion ? BigNumber(_form.tag_proportion).toNumber() : 0,
					tag_relation: _form.tag_relation === 2 ? _form.tag_relation : 1, // 逻辑关系 1 满足其一 2 全部满足
					tag_list: _form.tag_list || []
				}
			} else if (_form.tag_orientation === 2) {
				returnForm = {
					tag_orientation: 2,
					tag_list: _form.tag_list || []
				}
			}

			// 返回数据
			this.$emit('on-form-validate', {
				valid: !this.errorMsg,
				form: returnForm
			})
		},
		/**
		 * [validateDealId 判断是否已选择]
		 * @param  {[type]}   rule     [description]
		 * @param  {[type]}   value    [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		validatorRule() {
			let _form = {...this.formBase}
			let msg = ''

			if (_form.tag_orientation !== 0) {

				// 2. 选择标签
				if (!_form.tag_list.length) {
					msg = '请选择人群标签'
				}

				// 1. 定向外流量占比
				if (_form.tag_orientation === 1) {
					let _pro = _form.tag_proportion
					if (!!_pro && (!regNumber.test(_pro) || _pro > 100 || _pro < 0)) {
						msg = '请输入不超过100的整数'
					}
				}
			}

			this.errorMsg = msg

			this.returnForm() // 向外发送事件
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},
		/**
		 * [toggleTag 删除标签]
		 * @return {[type]} [description]
		 */
		toggleTag(item) {
			if (this.disabled) {
				return
			}

			let concatName = item.value
			let index = this.formBase.tag_list.indexOf(concatName)

			if (index > -1) {
				this.formBase.tag_list.splice(index, 1)
			}
		},
		/**
		 * [tagSelectChange 清空标签列表]
		 * @return {[type]} [description]
		 */
		tagSelectChange: debounce(function(arr) {
			if (arr.length > 5) {
				this.$Message.error('人群标签不允许超过5条')
				this.formBase.tag_list.pop()
			} else {
				this.hasCheckTag = arr
			}
		}, 100),
		/**
		 * [radioChange radio变化]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		radioChange(val) {
			let obj = {}

			switch (val) {
				case 1: // 定向
					obj = {
						tag_orientation: 1, // 判断定向的状态  0 不限 1 定向  2 排除
						tag_proportion: 0, // 定向流量占比
						tag_relation: 1, // 逻辑关系 1 满足其一 2 全部满足
						tag_list: [] // 标签
					}
					break
				case 2: // 排除
					obj = {
						tag_orientation: 2,
						tag_list: []
					}
					break
				default:
					obj = {
						tag_orientation: 0
					}
			}

			this.hasCheckTag = []
			this.formBase = obj
		}
	},
	watch: {
		/**
		 * [defaultCrowd 默认返回值]
		 * @type {Object}
		 */
		defaultCrowd: {
			immediate: true,
			handler: function(newVal) {

				let obj = {}

				if (!!newVal && newVal.tag_orientation === undefined) {
					obj.tag_orientation = 0 // 判断定向的状态  0 不限 1 定向  2 排除
				} else {

					obj = {...newVal}

					// 处理 逻辑关系
					if (obj.tag_orientation === 1) {
						obj.tag_relation = obj.tag_relation || 1
					}
				}

				this.formBase = obj
				this.validatorRule() // 正则校验
			}
		},
		/**
		 * [formBase 监听数据变化]
		 * @type {Object}
		 */
		formBase: {
			deep: true,
			handler: function(newVal) {
				this.validatorRule() // 正则校验
			}
		}
	}
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.control-nav
	/deep/ .ivu-radio-wrapper
		margin-right: 30px
.control-table
	margin-top: 20px
.item-list
	margin-top: 20px
	display: flex
	.item-label
		flex: 0 0 140px
		width: 140px
	.icon-why
		margin-left: 4px
		color: #999
		cursor: pointer
	.item-content
		position: relative
		flex: 1
		max-width: 100%
		.percent-input
			width: 300px
		/deep/ .ivu-radio-wrapper
			margin-right: 30px
.tag-check
	position: relative
	margin-top: 8px
	width: 70%
	flex-direction: row
	white-space: nowrap
	overflow: auto
	overflow-y: hidden
.tag-select
	/deep/ .ivu-select
		width: 300px
	/deep/ .ivu-select-selection
		background-color: #FFF !important
		.ivu-select-input
			border: none
			background-color: #FFF !important
.control-card
	/deep/ .ivu-form-item-error
		.ivu-select-selection
			border: 1px solid #ed4014
	/deep/
		.ivu-form-item
			margin-bottom: 0px
.tag-item
	display: inline-block
	vertical-align: top
	overflow: hidden
	margin-right: 4px
	border: 1px solid #e8eaec
	border-radius: 2px
	font-size: 0px
	span
		display: inline
		float: left
		vertical-align: top
		height: 24px
		line-height: 24px
		font-size: 12px
		padding: 0 8px
		color: #515a6e
	.icon-close
		float: left
		width: 24px
		height: 24px
		display: inline
		line-height: 24px
		font-size: 12px
		text-align: center
		border-left: 1px solid #e8eaec
		color: #999
		cursor: pointer
/deep/ .ivu-form-item-error-tip
	padding-top: 0px

/deep/ .ivu-form-item-validating
	.ivu-input-icon-validate
		display: none
</style>
