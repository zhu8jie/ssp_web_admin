<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<h2 class="page-title">{{dealId ? '编辑Deal组' : '新建Deal组'}}</h2>
			<div class="edit-content-card">
				<Form :model="formBase" :label-colon="true" label-position="right" :label-width="100" :rules="ruleBase" ref="formBase">
					<FormItem label="Deal组名称" prop="name">
						<Input style="width: 1000px" show-word-limit maxlength="50" v-model.trim="formBase.name"></Input>
					</FormItem>
					<div class="deal-group">
						<div class="deal-flex" v-for="(item, index) in formBase.deal_ids" :key="index">
							<FormItem class="flex-fix" label="DealID" :prop="'deal_ids.' + index + '.deal_id'" :rules = "{required: true, validator: validateDealId}">
								<Input class="deal-input" show-word-limit maxlength="50" v-model.trim="item.deal_id"></Input>
							</FormItem>
							<FormItem class="flex-fix" label="CPM" :prop="'deal_ids.' + index + '.cpm_price'" :rules = "{required: true, validator: validatePrice}">
								<InputNumber class="deal-input" :min="0" :max="inputMaxNumber" :step="0.01" placeholder="大于0，最多可填两位小数" v-model="item.cpm_price"></InputNumber>
							</FormItem>
							<FormItem label="失效时间" class="ivu-form-item-required flex-fix-1">
								<div class="flex-fix-inner">
									<FormItem class="expire-radio">
										<RadioGroup v-model="item.isExpire" >
											<Radio :label="0">无</Radio>
											<Radio :label="1">自定义</Radio>
										</RadioGroup>
									</FormItem>

									<FormItem
										v-if="item.isExpire"
										:prop="'deal_ids.' + index + '.expire_at'"
										class="expire-date"
										:rules = "{required: true, message: '请选择日期'}"
									>
										<DatePicker
											class="deal-input"
											v-model="item.expire_at"
											:options="disabledDate"
											:transfer="true"
											:clearable="true"
											format="yyyy-MM-dd"
											type="date"
											placeholder="请选择日期"
										></DatePicker>
									</FormItem>
								</div>
							</FormItem>
							<div class="flex-button">
								<Button v-if="index === 0" @click="addDeal(index)">增加</Button>
								<Button v-else @click="deleteDeal(index)">删除</Button>
							</div>
						</div>
					</div>
					<FormItem class="unitClass ivu-form-item-required" label="关联广告位" prop="ssp_slot_ids">
						<retarget-muti-cascader-ad-slot
							ref="proCity"
							class="m-l-20"
							v-model="formBase.ssp_slot_ids"
							:datas="DimensionList"
							:data="DimensionList"
							:order="orderText"
							:titleLoading="adTitle"
							:title="adslotString"
							:warnWidth="warnWidth"
							@input="updateMuti"
							@name="updateAdvertising"/>
					</FormItem>
					<FormItem class="edit-save-formItem">
						<Button size="large" @click="goBack">取消</Button>
						<Button size="large" type="primary" :loading="submitClock" @click="submitFormData('formBase')">
							{{!submitClock ? '提交' : '提交中...'}}
						</Button>
					</FormItem>
				</Form>
			</div>
		</Card>
	</div>
</template>

<script>
import {inputMaxNumber} from '@/libs/util'
import { formatDate } from '@/libs/tools'
import { getDealList, saveDeal, getSspSlotAdList, getAppList, getMediaSspSlotAdList} from '@/api/ssp.js'
import { formRules } from './deal-edit-rules.js' // 正则校验
import { inPageAccess } from '@/mixin/in-page-access.js'
import retargetMutiCascaderAdSlot from '@/components/cascader-retarget'
import { BigNumber } from 'bignumber.js'

export default {
	name: 'dealId-edit',
	mixins: [formRules, inPageAccess],
	components: {retargetMutiCascaderAdSlot},
	data() {
		return {
			inputMaxNumber: inputMaxNumber,
			adslotString: '应用',
			orderText: 'first',
			adTitle: '加载中',
			warnWidth: '预警中心',
			DimensionList: [],

			dealId: this.$route.query.dealId ? Number(this.$route.query.dealId) : '', // dealId
			hasIdNoEdit: !!this.$route.query.dealId, // 不可编辑内容
			disabledDate: { // 不可选择的时间范围
				disabledDate(date) {
					return date.getTime() < new Date().getTime() - 1 * 24 * 3600 * 1000
				}
			},

			formBase: {
				name: '',
				deal_ids: [
					{
						deal_id: '',
						cpm_price: 0,
						isExpire: 0,
						expire_at: ''
					}
				],
			  ssp_slot_ids: [] // 广告位id
			},
			submitClock: false // 保存锁
		}
	},
	created() {
		// 判断是否有修改权限
		let resultArr = this._isPageShow()
		if (this._isSuperAdmin() || !!resultArr.includes('edit')) {
			this.getApplyData() // 初始化数据
		} else {
			this._gotoNoAccess()
		}
	},
	methods: {
		updateMuti() {

		},
		updateAdvertising() {

		},
		/**
		 * [getApplyData 获取应用的信息]
		 * @return {[type]} [description]
		 */
		getApplyData() {
			if (this.dealId) {
				this.$Spin.show()
			}
			getAppList().then(res => {
				if (res.code === 200) {
					let fatherList = res.data.list
					if (fatherList && fatherList.length > 0) {
						let obj = {page_size: 0, page_num: 1}
            getMediaSspSlotAdList(obj).then(res => {
							if (res.code === 200) {
								let adData = res.data.list
								this.setSlotData(fatherList, adData)
							}
						})
					}
				}
			})
		},
		/**
		 * [setSlotData 获取广告位的信息]
		 * @return {[type]} [description]
		 */
		setSlotData(fatherList, childrenList) {
			let dataList = []
			fatherList.map(item => {
				let slot = {
					label: item.app_name + '(' + item.app_id + ')',
					value: item.app_id,
					check: false,
					little: false,
					type: 'app',
					childrenName: '广告位',
					children: []
				}
				childrenList.map(list => {
					if (list.app_id === item.app_id) {
						let obj = {
							value: list.id,
							label: list.ssp_slot_name + '(' + list.id + ')',
							type: 'slot',
							check: false,
							ad_type_id: list.ad_type_id,
							little: false
						}

						slot['children'].push(obj)
					}
				})

				if (slot['children'].length > 0) {
					dataList.push(slot)
				}
			})

			this.adTitle = '加载完成'
			this.DimensionList = dataList

			if (this.dealId) {
				this.initData() // 获取关联广告位
			}

		},
		/**
		 * [initData 初始化加载数据]
		 * @return {[type]} [description]
		 */
		initData() {
			Promise.all([
				getDealList({
					dg_ids: [this.dealId],
					page_size: 1,
					page_num: 1
				})
			]).then(res => {

				this.$Spin.hide()

				if (res[0].code === 200) {
					this.setDealInfo(res[0].data.list[0]) // 设置当前媒体方的信息
				}
			})
		},

		/**
		 * [addDeal 添加deal]
		 * @param {[type]} index [description]
		 */
		addDeal(index) {
			this.formBase.deal_ids.push(this.addDealOnce())
		},
		/**
		 * [addDealOnce 添加deal]
		 */
		addDealOnce() {
			return {
				deal_id: '',
				cpm_price: 0,
				isExpire: 0,
				expire_at: ''
			}
		},
		/**
		 * [deleteDeal 删除deal]
		 * @param  {[type]} index [description]
		 * @return {[type]}	   [description]
		 */
		deleteDeal(index) {
			this.formBase.deal_ids.splice(index, 1)
		},
		/**
		 * [setDealInfo 设置deal信息]
		 * @param {[type]} data [description]
		 */
		setDealInfo(data) {

			let curObj = {
				name: data.name
			}

			// deal_ids 格式化处理
			let dealIdArr = []
			let mapDealArr = data.DealIds

			if (!!mapDealArr && mapDealArr.length) {
				mapDealArr.map(item => {
					dealIdArr.push({
						deal_id: item.deal_id,
						cpm_price: BigNumber(item.cpm_price).dividedBy(100).toNumber(),
						isExpire: item.expire_at <= 0 ? 0 : 1,
						expire_at: item.expire_at > 0 ? formatDate(new Date(item.expire_at).getTime() * 1000, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd')
					})
				})
			} else {
				dealIdArr.push(this.addDealOnce())
			}

			curObj.deal_ids = dealIdArr

			// sspSlot 格式化处理
			let sspSlotIdArr = []
			let sspSlotArr = data.SspSlots || []
			sspSlotArr.map(item => {
				sspSlotIdArr.push(item.id)
			})
			curObj.ssp_slot_ids = sspSlotIdArr

			this.formBase = curObj
		},
		/**
		 * [submitSet 提交表单]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitFormData(name) {

			this.$refs[name].validate((valid) => {
				if (valid) {

					let form = this.formBase

					let params = {
						name: form.name,
						ssp_slot_ids: form.ssp_slot_ids
					}

					// 1. 格式化处理 deal_ids
					let deal_ids_arr = []
					form.deal_ids.map(item => {
						deal_ids_arr.push({
							deal_id: item.deal_id,
							cpm_price: BigNumber(item.cpm_price).multipliedBy(100).toNumber(),
							expire_at: item.isExpire === 1 ? (new Date(item.expire_at).getTime()) / 1000 + 1 * 24 * 3600 - 1 : 0
						})
					})
					params.deal_ids = deal_ids_arr

					// 2. 编辑时，传入id
					if (!!this.dealId) {
						params.id = this.dealId
					}

					this.submitClock = true

					saveDeal(params).then(res => {
						this.submitClock = false
						if (res.code === 200) {
							this.$Bus.$emit('editEmitEvent') // 列表数据刷新

							this.$Message.success({content: form.app_id ? '修改成功' : '保存成功', duration: 3})
							this.goBack()
						}
					}, err => {
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [goBack 返回上一页]
		 * @return {[type]} [description]
		 */
		goBack() {
			this.$router.push({name: 'dealId-manage'})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.page-title
	font-size: 16px
.item-flex
	display: flex
	justify-content: space-between
	/deep/ > .ivu-form-item
		width: 100%
.deal-group
	.deal-flex
		display: flex
		.flex-fix-1
			flex: 0 0 460px
		.flex-fix
			flex: 0 0 320px
	.flex-fix-inner
		display: flex
		.expire-radio
			flex: 0 0 140px
		.expire-date
			flex: 1
	.flex-button
		flex: 0 0 100px
		text-align: right
	.deal-input
		width: 220px
</style>
