<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<h2 class="page-title">{{titleType === 'new' ? '新建计划' : (titleType === 'view' ? '查看计划' : '修改计划')}}</h2>
			<div class="edit-content-card">
				<Form :model="formBase" :label-colon="true" label-position="right" :label-width="100" :rules="ruleBase" ref="formBase">
					<div class="pre" v-show="cardType == 'pre'">
						<FormItem label="计划模板" prop="template_id">
							<div class="flex-row">
								<Select
									placeholder="请选择模板"
									class="tem-select"
									v-model="formBase.template_id"
									:disabled="canEdit"
								>
									<Option v-for="item in templateArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
								</Select>
								<Button class="tem-btn" :disabled="!formBase.template_id" @click="checkTemplate">查看</Button>
							</div>
						</FormItem>
						<FormItem label="测试时间" prop="concatDate">
							<div class="flex-row">
								<DatePicker :disabled="canEdit" class="date-picker" type="daterange" :options="disabledDate" format="yyyy-MM-dd" placeholder="请选择测试日期" :value="formBase.concatDate" :clearable="false" @on-change="datePickerChange"></DatePicker>
								<TimePicker class="time-picker only-hour-time-picker" :disabled="canEdit" format="HH:mm" :steps="[1, 59, 60]" :value="formBase.timePickerDefault" :clearable="false" type="timerange" placeholder="请选择测试时间段" @on-change="timePickerChange"></TimePicker>
							</div>
						</FormItem>
						<FormItem label="人群定向" class="ivu-form-item-required">
							<crowd-control ref="crowd" :disabled="canEdit" :defaultCrowd="defaultCrowd" :crowdTagArr="crowdTagArr" @on-form-validate="getCrowdControl"></crowd-control>
						</FormItem>

						<FormItem label="计划名称" prop="name">
							<Input :disabled="canEdit" style="width: 520px" :maxlength="50" show-word-limit v-model.trim="formBase.name" placeholder="请输入计划名称"/>
						</FormItem>

						<FormItem class="unitClass ivu-form-item-required" label="关联广告位" prop="ssp_slot_id_arr">
							<div class="spin-card">
								<retarget-muti-cascader-ad-slot
									ref="proCity"
									class="m-l-20"
									v-model="formBase.ssp_slot_id_arr"
									:datas="dimensionList"
									:data="dimensionList"
									:order="orderText"
									:titleLoading="adTitle"
									:title="adslotString"
									:warnWidth="warnWidth"
									@input="updateMuti"
									@name="updateAdvertising"/>
								<Spin fix v-if="!isAllLoading">
									<Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
									<div>Loading</div>
								</Spin>
							</div>
						</FormItem>

						<FormItem class="unitClass unitProduct ivu-form-item-required" label="选择产品" prop="dsp_product_id_arr">
							<div class="spin-card">
								<retarget-muti-cascader-ad-slot
									ref="proCity"
									class="m-l-20"
									v-model="formBase.dsp_product_id_arr"
									:datas="productList"
									:data="productList"
									:order="orderText"
									:titleLoading="productTitle"
									:title="productString"
									@input="updateMuti"
									@name="updateAdvertising"/>
								<Spin fix v-if="!isAllLoading">
									<Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
									<div>Loading</div>
								</Spin>
							</div>
						</FormItem>
					</div>

					<div class="next" v-show="cardType == 'next'">
						<FormItem label="匹配结果">
							<!-- 匹配的table数据 -->
							<match-table ref="matchTable" @on-change="getMatchData"></match-table>
						</FormItem>
					</div>
				</Form>
			</div>
			<div class="edit-save-formItem" v-if="isAllLoading">
				<!-- 1. 首页 -->
				<template v-if="cardType === 'pre'">

					<Button size="large" type="primary" @click="toggleCardType('next')" v-if="titleType !== 'new'">查看详细配置</Button>

					<Button size="large" type="primary" :disabled="!(formBase.template_id && formBase.concatDate.length && formBase.ssp_slot_id_arr.length && formBase.dsp_product_id_arr.length && crowdValidate)" @click="toNext('new')" v-if="titleType === 'new'">下一步</Button>

					<Button size="large" type="primary" :disabled="!(formBase.template_id && formBase.concatDate.length && formBase.ssp_slot_id_arr.length && formBase.dsp_product_id_arr.length && crowdValidate)" @click="toNext('reset')" v-if="titleType === 'edit'">重新匹配</Button>
				</template>

				<!-- 1. 下一页 -->
				<template v-if="cardType === 'next'">
					<Button size="large" type="primary" :loading="submitClock" v-if="titleType !== 'view'" @click="submitFormData">{{!submitClock ? '提交' : '提交中...'}}</Button>

					<Button size="large" @click="toggleCardType('pre')">上一步</Button>
				</template>

				<Button size="large" @click="goBack">取消</Button>
			</div>

		</Card>

		<!-- 查看模板详情 -->
		<template-detail ref="templateDetail" v-if="isShowTem"></template-detail>

	</div>
</template>

<script>
import { formatDate, timeTo24ToInt, int24ToTime } from '@/libs/tools'
import { getAppList, getMediaSspSlotAdList } from '@/api/ssp'
import { getPlanTemplateList, planAdd, planMod, getPlanList } from '@/api/plan'
import { getDspCompanyList, getDspProductList } from '@/api/dsp'
import { formRules } from './deal-edit-rules.js' // 正则校验
import { inPageAccess } from '@/mixin/in-page-access.js'
import retargetMutiCascaderAdSlot from '@/components/cascader-retarget'
import crowdControl from '@/components/control/crowd/index.vue'
import templateDetail from './module/templateDetail.vue' // 模板详情
import matchTable from './module/matchTable.vue' // 匹配的table数据
import { BigNumber } from 'bignumber.js'
import { getCrowdTagList } from '@/api/tag'

export default {
	name: 'ssp-plan-edit',
	mixins: [formRules, inPageAccess],
	components: {retargetMutiCascaderAdSlot, crowdControl, templateDetail, matchTable},
	data() {
		return {
			isAllLoading: false, // 是否加载完毕
			disabledDate: { // 不可选择的时间范围
				disabledDate(date) {
					return date.getTime() < new Date().getTime() - 1 * 24 * 3600 * 1000
				}
			},
			titleType: this.$route.query.type, // 标题类型
			from: this.$route.query.from ? this.$route.query.from : '', // 来自任务面板
			planId: this.$route.query.planId ? Number(this.$route.query.planId) : '', // planId
			cardType: 'pre',
			adslotString: '应用',
			orderText: 'first',
			adTitle: '加载中',
			warnWidth: '预警中心',
			productString: '公司',
			productTitle: '加载中',
			dimensionList: [],
			productList: [],
			templateArr: [], // 模板列表
			canEdit: false, // 是否可编辑, 默认可以
			formBase: {
				template_id: '', // 模板Id
				name: '', // 计划名称
				start_at: '', // 开始时间
				end_at: '', // 结束时间
				concatDate: [], // 合并开时间和结束时间
				ssp_slot_id_arr: [], // 广告位
				dsp_product_id_arr: [], // dsp产品
				control_time_custom: '', // 时间区间
				timePickerDefault: ['00:00', '23:59'], // 时间默认值
				tag_orientation: 0, // 标签定向，0=不定向，1=针对定向，2=排除定向
				tag_proportion: 0, // 0~100整数，默认0
				tag_list: [], // 定向标签
				tag_relation: 1, // 人群定向关系，1=命中其一，2=全部命中
				clauses: {} // 条款
			},
			matchClauses: {}, // 返回的匹配数据
			catchTimePicker: [], // 缓存时间，在name中使用
			defaultCrowd: {}, // 人群标签
			crowdValidate: false, // 人群标签是否填写完整
			submitClock: false, // 保存锁
			isShowTem: false, // 是否显示模板
			crowdTagArr: [] // 人群标签
		}
	},
	created() {
		// 判断是否有修改权限
		let resultArr = this._isPageShow()
		if (this._isSuperAdmin() || !!resultArr.includes('newAndEdit')) {
			this.getApplyData() // 初始化数据
			this.getDspCompanyListApi()
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
			getAppList().then(res => {
				if (res.code === 200) {
					let fatherList = res.data.list
					if (fatherList && fatherList.length > 0) {
						let obj = {
							page_size: 0,
							page_num: 1
						}
						obj.test_plan_id = this.planId ? this.planId : 0
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
			this.dimensionList = dataList

			this.initData() // 基本数据

		},
		/**
		 * [getDspCompanyList 获取应用的信息]
		 * @return {[type]} [description]
		 */
		getDspCompanyListApi() {
			getDspCompanyList().then(res => {
				if (res.code === 200) {
					let fatherList = res.data.list
					if (fatherList && fatherList.length > 0) {
						let obj = {
							page_size: 0,
							page_num: 1
						}
						getDspProductList(obj).then(res => {
							if (res.code === 200) {
								let adData = res.data.list
								this.productData(fatherList, adData)
							}
						})
					}
				}
			})
		},
		/**
		 * [productData 选择产品]
		 * @param  {[type]} fatherList   [description]
		 * @param  {[type]} childrenList [description]
		 * @return {[type]}              [description]
		 */
		productData(fatherList, childrenList) {
			let dataList = []
			fatherList.map(item => {
				let slot = {
					label: item.company_name + '(' + item.id + ')',
					value: item.id + item.company_name,
					check: false,
					little: false,
					type: 'app',
					childrenName: '产品',
					children: []
				}
				childrenList.map(list => {
					if (list.dsp_company.id === item.id) {
						let obj = {
							value: list.id,
							label: list.name + '(' + list.id + ')',
							type: 'slot',
							check: false,
							little: false
						}

						slot['children'].push(obj)
					}
				})

				if (slot['children'].length > 0) {
					dataList.push(slot)
				}
			})

			this.productTitle = '加载完成'
			this.productList = dataList
		},
		/**
		 * [initData 初始化加载数据]
		 * @return {[type]} [description]
		 */
		initData() {

			// 1. 获取模板列表
			let ProArr = [
				getPlanTemplateList(),
				getCrowdTagList() // 人群标签
			]

			// 2. 详情
			if (!!this.planId) {
				ProArr.push(getPlanList({
					id: this.planId
				}))
			}
			if(localStorage.getItem('waitSelectId') && this.from==='panel'){
				let select = localStorage.getItem('waitSelectId').split(',')
				let selectArr = select.map(item=>{
					return Number(item)
				})
				this.$nextTick(function () {
					this.formBase.ssp_slot_id_arr = selectArr
				})
			}
			Promise.all(ProArr).then(res => {

				this.isAllLoading = true

				if (res[0].code === 200) {
					this.templateArr = res[0].data.list || []
				}

				// 人群标签
				if(res[1].code === 200) {
					this.crowdTagArr = res[1].data.list || []
				}

				if (res[2] && res[2].code === 200 && res[2].data.list.length) {
					this.setPlanInfo(res[2].data.list[0])
				} else {
					this.canEdit = false
				}
			})
		},
		/**
		 * [setPlanInfo 设置计划管理详情]
		 * @param {[type]} res [description]
		 */
		setPlanInfo(res) {
			// 1待测试; 2测试中; 3暂停中; 4已完成
			this.canEdit = res.status !== 1 // 新建/待测试可编辑

			let concatTime = int24ToTime(res.control_time_custom)
			let pre = concatTime[0]
			let next = `${concatTime[1].slice(0,2)}:59`

			let form = {
				id: res.id, // 计划ID
				template_id: res.template_id, // 模板ID
				name: res.name, // 计划名称
				concatDate: [formatDate(res.start_at * 1000, 'yyyy-MM-dd'), formatDate(res.end_at * 1000, 'yyyy-MM-dd')], // 合并开始结束时间

				control_time_custom: res.control_time_custom,
				timePickerDefault: [pre, next],  //int24ToTime(res.control_time_custom), // 转成时间段

				ssp_slot_id_arr: res.ssp_slot_id_arr || [], // 广告位
				dsp_product_id_arr: res.dsp_product_id_arr || [], // dsp产品

				tag_orientation: res.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
				tag_proportion: res.tag_proportion, // 0~100整数，默认0
				tag_list: res.tag_list || [], // 定向标签
				tag_relation: res.tag_relation, // 人群定向关系，1=命中其一，2=全部命中

				status: res.status, // 匹配数据反显使用
				clauseArr: res.test_plan_clause_list // 已匹配的table数据
			}

			// 默认数据
			this.defaultCrowd = {
				tag_orientation: res.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
				tag_proportion: res.tag_proportion, // 0~100整数，默认0
				tag_list: res.tag_list || [], // 定向标签
				tag_relation: res.tag_relation // 人群定向关系，1=命中其一，2=全部命中
			}

			this.formBase = form

			this.$refs['matchTable'].injectDate(this.formBase)

		},
		/**
		 * [submitSet 提交表单]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitFormData(name) {
			this.$refs['formBase'].validate((valid) => {
				if (valid) {

					// 1. 先匹配子组件结果
					this.$refs['matchTable'].validateData()

					// 1. 错误
					if (!this.matchClauses.isValid) {
						return
					}

					// 2. 不完整
					this.$Modal.confirm({
						title: this.matchClauses.yesDspLength < this.matchClauses.clauses.length ? '您的测试计划中，有部分广告位未匹配上，请补充库存重新提交计划，或者删除该广告位/产品并重新匹配；如果不进行以上操作，将会有部分广告位的产品测试无法进行，确认提交么' : '确认提交么？',
						onOk: () => {
							this.formBase.clauses = [...this.matchClauses.clauses]
							this.trueSubmitFormData() // 确认提交
						}
					})
				}
			})
		},
		/**
		 * [trueSubmitFormData 确认提交]
		 * @return {[type]} [description]
		 */
		trueSubmitFormData() {
			this.$refs['formBase'].validate((valid) => {
				if (valid) {

					let params = {...this.formBase}

					// 1. 日期转init
					params.start_at = new Date(`${params.concatDate[0]} 00:00:00`).getTime() / 1000
					params.end_at = new Date(`${params.concatDate[1]} 23:59:59`).getTime() / 1000

					// 2. 时间转24
					params.control_time_custom = timeTo24ToInt(params.timePickerDefault)

					// 3.删除多余字段
					delete params.timePickerDefault
					delete params.status
					delete params.clauseArr

					this.submitClock = true

					let promise = !!params.id ? planMod(params) : planAdd(params)

					promise.then(res => {

						this.submitClock = false

						if (res.code === 200) {
							this.$Bus.$emit('editEmitEvent')
							this.$Message.success({content: params.id ? '修改成功' : '保存成功', duration: 3})
							if(this.from==='panel'){
								this.$router.push({
									path: '/ssp/plan/manage',
								})
							}else{
								this.goBack()
							}
						}
					}, err => {
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [getCrowdControl 获取返回数据]
		 * @param  {[type]} obj [description]
		 * @return {[type]}     [description]
		 */
		getCrowdControl(obj) {

			let {valid, form} = obj

			this.crowdValidate = valid // 用于校验人群标签填写是否完整

			this.formBase.tag_orientation = form.tag_orientation
			this.formBase.tag_proportion = form.tag_proportion || 0
			this.formBase.tag_list = form.tag_list || []
			this.formBase.tag_relation = form.tag_relation || 1

		},
		/**
		 * [getMatchData 获取返回的match数据]
		 * @param  {[type]} obj [description]
		 * @return {[type]}     [description]
		 */
		getMatchData(obj) {
			this.matchClauses = obj
		},
		/**
		 * [checkTemplate 查看模板详情]
		 * @return {[type]} [description]
		 */
		checkTemplate() {
			let result = this.templateArr.filter(item => {
				return item.id === this.formBase.template_id
			})[0]

			this.isShowTem = true

			this.$nextTick(() => {
				this.$refs['templateDetail'].injectDate(result) // 子组件注入数据
			})
		},
		/**
		 * [timePickerChange 时间选择器发生改变, 生成24进制]
		 * @return {[type]} [description]
		 */
		timePickerChange(time) {
			let pre = `${time[0].slice(0,2)}:00`
			let next = `${time[1].slice(0,2)}:59`

			this.formBase.timePickerDefault = [pre, next] //time
		},
		/**
		 * [datePickerChange 日期选择器发生改变]
		 * @param  {[type]} date [description]
		 * @return {[type]}      [description]
		 */
		datePickerChange(date) {
			this.formBase.concatDate = date

			// 新建的情况下，自动生成name的部分值
			if (!this.planId) {
				this.formBase.name = `${date[0].slice(5, 10)} ~ ${date[1].slice(5, 10)} - `
			}
		},
		/**
		 * [toNext 下一步，匹配生成的预算位]
		 * @return {[type]} [description]
		 */
		toNext(type) {
			if (!this.formBase.ssp_slot_id_arr.length || !this.formBase.dsp_product_id_arr.length) {
				this.$Message.error({
					content: '请先选择广告位或产品',
					duration: 3
				})
			}

			// 重新匹配时，状态为0
			// if(type === 'reset') {
			// 	this.formBase.status = 0
			// }
			this.formBase.status = 0

			this.cardType = 'next'

			this.$refs['matchTable'].injectDate(this.formBase)
		},
		/**
		 * [toggleCardType 切换上一页下一页]
		 * @return {[type]} [description]
		 */
		toggleCardType(type) {
			this.cardType = type
		},
		/**
		 * [goBack 返回上一页]
		 * @return {[type]} [description]
		 */
		goBack() {
			this.$router.back(-1)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.page-title
	font-size: 16px
.flex-row
	display: flex
	.tem-select
		flex: 0 0 520px
		width: 300px
	.tem-btn
		margin-left: 20px
		width: 100px
	.date-picker
		flex: 0 0 250px
		width: 250px
	.time-picker
		margin-left: 20px
		flex: 0 0 250px
		width: 250px
.tem-msg
	h6
		padding-left: 10px
		margin-top: 24px
		margin-bottom: 14px
		font-size: 14px
	.tem-item
		overflow: hidden
		padding: 8px 0
		line-height: 2
		.tem-label
			font-weight: bold
			display: inline
			float: left
			width: 80px
			text-align: right
			margin-right: 10px
		.tem-val

			overflow: hidden
.unitClass
	margin-bottom: 28px
.spin-card
	display: inline-block
	vertical-align: top
	position: relative
	/deep/ .cascader_wrapper
		width: 1002px
/deep/ .ivu-form-item
	margin-bottom: 30px
.edit-save-formItem
	margin-top: 30px
	margin-left: 100px
.demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
</style>
