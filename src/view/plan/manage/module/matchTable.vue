<template>
	<div class="match-table">
		<p class="match-table-line">提示：为保证数据干净，当日已被关联的预算位，将无法匹配上</p>
		<Table highlight-row stripe border :columns="tableColList" :data="colDataList" :loading="tableLoadFlag" :max-height="700">
			<!-- 广告位名称 -->
			<template slot-scope="{ row }" slot="ssp_slot_name">
				{{row.sspInfo.ssp_slot_name}}
			</template>
			<!-- 广告位ID -->
			<template slot-scope="{ row }" slot="ssp_slot_id">
				{{row.sspInfo.ssp_slot_id}}
			</template>
			<!-- 应用平台 -->
			<template slot-scope="{ row }" slot="app_os_type">
				{{row.sspInfo.app_os_type}}
			</template>
			<!-- 广告位类型 -->
			<template slot-scope="{ row }" slot="ad_type">
				{{row.sspInfo.ad_type}}
			</template>
			<!-- 广告位类型 -->
			<template slot-scope="{ row }" slot="ad_type">
				{{row.sspInfo.ad_type}}
			</template>
			<!-- 素材尺寸比例 -->
			<template slot-scope="{ row }" slot="ad_ratio">
				{{row.sspInfo.ad_ratio | filterAdRatio}}
			</template>
			<!-- 公司名称 -->
			<template slot-scope="{ row }" slot="dsp_company_name">
				{{row.productInfo.dsp_company.company_name}}
			</template>
			<!-- 产品名称 -->
			<template slot-scope="{ row }" slot="product_name">
				{{row.productInfo.name}}
			</template>
			<!-- 预算位 -->
			<template slot-scope="{ row, index }" slot="dsp_slot_list">
				<!-- {{row.dsp_slot_id}}
				<br>
				<br>
				{{hashCheckDspId}} -->
				<div class="dsp_select" v-if="row.dsp_slot_list.length > 0">
					<Select
						:transfer="true"
						v-model="row.dsp_slot_id"
						placeholder="请选择预算位"
						@on-open-change="selectOpen(row, index)"
						@on-change="selectChange"
						:disabled="disabled"
					>
						<template v-for="item in row.dsp_slot_list">
							<!-- option显示的条件： 1. 要么未被选中； 2. item.id和row.dsp_slot_id相同 -->
							<Option :value="item.id" v-if="!hashCheckDspId.includes(item.id) || item.id === row.dsp_slot_id">{{ item.dsp_slot_name }}</Option>
						</template>
					</Select>
				</div>
				<div class="no_dsp_select" v-else>
					无，请补充
				</div>
			</template>
			<!-- 时段控制 -->
			<template slot-scope="{ row, index }" slot="time_control">
				<TimePicker :transfer="true" :disabled="disabled" class="time-picker" :transfer-class-name="'only-hour-time-picker'" format="HH:mm" :steps="[1, 59, 60]" v-model="row.timePicker" :clearable="false" @on-open-change="getRowIndex(index)" @on-change="timePickerChange" type="timerange" placeholder="请选择测试时间段"></TimePicker>
			</template>
			<!-- 人群定向 -->
			<template slot-scope="{ row, index }" slot="control">
				<div class="control-flex">
					<!-- 0=不定向，1=针对定向，2=排除定向 -->
					<span v-if="row.crowdControl.tag_orientation === 0">不限</span>
					<span v-else-if="row.crowdControl.tag_orientation === 1">定向</span>
					<span v-else-if="row.crowdControl.tag_orientation === 2">排除</span>
					<i class="iconfont icon-bianji" v-if="!disabled" @click="chooseControl(row, index)"></i>
				</div>
			</template>
		</Table>

		<Modal
			v-model="modelFlag"
			:mask-closable="false"
			title="人群定向"
			:width="700"
			:footer-hide="true"
			class-name="vertical-center-modal"
			@on-cancel="cancelModal"
		>
			<div class="crowd-control-card" v-if="modelFlag">
				<crowd-control ref="crowd" :defaultCrowd="defaultCrowd" :crowdTagArr="crowdTagArr" @on-form-validate="getCrowdControl"></crowd-control>
			</div>
			<div class="save-btn">
				<Button @click="cancelModal">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitData">{{!submitClock ? '确定' : '提交中...'}}</Button>
			</div>
		</Modal>
	</div>
</template>

<script>

import crowdControl from '@/components/control/crowd/index.vue'
import { timeTo24ToInt, int24ToTime } from '@/libs/tools'
import { matchPlanDspSlot } from '@/api/plan'
import { getSspSlotAdList } from '@/api/ssp'
import { getDspProductList, getDspSlotList } from '@/api/dsp'
import { getMatchColumns } from '../../columns'
import { getCrowdTagList } from '@/api/tag'

export default {
	data() {
		return {
			disabled: false, // 是否可编辑
			tableLoadFlag: true, // 表格加载
			tableColList: getMatchColumns(),
			colDataList: [],
			rowIndex: 0, // 操作时间控制的index
			selectIndex: 0, // 操作下来控制的index
			crowdIndex: 0, // 修改人群定向的index
			defaultCrowd: {}, // 人群定向默认值
			catchCrowd: {}, // 缓存返回的人群定向数据
			crowdValidate: false, // 人群标签是否填写完整
			modelFlag: false, // 弹窗 
			submitClock: false, // 保存锁
			hashCheckDspId: [], // 记录已经匹配的预算位
			crowdTagArr: [], // 人群标签
		}
	},
	components: {
		crowdControl
	},
	filters: {
		/**
		 * [filterAdRatio 素材尺寸]
		 * @param  {[type]} item [description]
		 * @return {[type]}      [description]
		 */
		filterAdRatio(item) {
			if (!item.length) {
				return '-'
			}
			let _arr = item.map(_ => {
				return `${_.width}:${_.height}`
			})

			return _arr.join()
		}
	},
	methods: {
		/**
		 * [injectDate 根据dsp_id 和 product_id_arr 生成table数组]
		 * @param  {[type]} clauseArr [反显的列表数据]
		 * @return {[type]}                 [description]
		 */
		injectDate(form) {

			console.log(form)

			let {ssp_slot_id_arr, dsp_product_id_arr, status} = form

			this.tableLoadFlag = true
			this.disabled = !(!status || status === 1) // 不可编辑

			this.hashCheckDspId = [] // 重置已选择的预算位

			let ProArr = [
				getSspSlotAdList({ // 广告位
					ssp_slot_id_arr: ssp_slot_id_arr
				}),
				getDspProductList({ // 预算产品
					product_id_arr: dsp_product_id_arr
				}),
				getCrowdTagList() // 人群标签
			]

			// 新建/编辑
			if (!status || status === 1) {
				ProArr.push(matchPlanDspSlot({
					ssp_slot_id_arr: ssp_slot_id_arr,
					dsp_product_id_arr: dsp_product_id_arr
				}))
			} else { // 查看详情
				let dspIdArr = form.clauseArr.map(item => {
					if(!!item.dsp_slot_id) {
						return item.dsp_slot_id
					}
				})

				// 获取dsp数据，在反显时使用
				ProArr.push(getDspSlotList({
					dsp_slot_id_arr: dspIdArr
				}))
			}

			// 备注
			// 1. 新建时，用匹配的dsp_slot_list数据, 但是dsp_id、时间段、定向 用上面编辑的信息
			// 2. 编辑时，用匹配的dsp_slot_list数据，但是dsp_id、时间段、定向 用反显值
			// 3. 查看时，用返回的dsp_slot_list数据，同里dsp_id、时间段、定向 用反显值
			Promise.all(ProArr).then(res => {

				// 人群标签
				if(res[2].code === 200) {
					this.crowdTagArr = res[2].data.list || []
				}

				// 匹配数据
				if (res[0].code === 200 && res[1].code === 200 && res[3].code === 200) {
					if (!status || status === 1) { // 新建/编辑
						this.concatData({
							sspSlotArr: res[0].data.list,
							productArr: res[1].data.list,
							matchArr: res[3].data.matched_items,
							form: form,
							isEdit: status === 1
						})
					} else { // 反显
						this.concatDataBack({
							sspSlotArr: res[0].data.list,
							productArr: res[1].data.list,
							matchArr: form.clauseArr,
							dspList: res[3].data.list,
							form: form,
							isEdit: false
						})
					}
				}
			})
		},
		/**
		 * [concatData 匹配数据, 只适用于 新建和编辑]
		 * @param  {[type]} res   []
		 * @return {[type]}          [description]
		 */
		concatData(res) {

			let {sspSlotArr, productArr, matchArr, form, isEdit} = res


			matchArr.map((item, index) => {

				// 挂载-广告位
				sspSlotArr.map(inItem => {
					if(item.ssp_slot_id === inItem.ssp_slot_id) {
						item['sspInfo'] = inItem
					}
				})

				// 挂载-产品
				productArr.map(inItem => {
					if(item.product_id === inItem.id) {
						item['productInfo'] = inItem
					}
				})

				if (isEdit) { // 反显值 -- 编辑

					form.clauseArr.map(inItem => {
						if (inItem.product_id === item.product_id && inItem.ssp_slot_id === item.ssp_slot_id) {

							//dsp
							item['dsp_slot_id'] = inItem.dsp_slot_id

							this.hashCheckDspId.push(inItem.dsp_slot_id)

							// 时间控制
							let concatTime = int24ToTime(inItem.control_time_custom)
							let pre = concatTime[0]
							let next = `${concatTime[1].slice(0,2)}:59`
							item['timePicker'] = [pre, next] // int24ToTime(inItem.control_time_custom) // 转成时间段

							// 人群定向
							item['crowdControl'] = {
								tag_orientation: inItem.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
								tag_proportion: inItem.tag_proportion, // 0~100整数，默认0
								tag_list: inItem.tag_list, // 定向标签
								tag_relation: inItem.tag_relation // 人群定向关系，1=命中其一，2=全部命中
							}
						}
					})

				} else { // 新建
					
					if (item.dsp_slot_list.length) {

						// * 1. 优先匹配相同公司
						// * 2. 默认选中第一条预算位。 选中的预算位之后的下拉列表中要隐藏(前置条件，把选中过的删除)
						// 1. 前置条件，把选中过的删除
						let _filterDsp = []
						let dspSlotObj = {} // 优先匹配相同公司

						item.dsp_slot_list.map(child => {
							if (!this.hashCheckDspId.includes(child.id)) {
								_filterDsp.push(child)

								if( child.dsp_company_id ===  item['productInfo'].dsp_company_id) {
									dspSlotObj = child
								}
							}
						})

						// item.dsp_slot_list = _filterDsp

						// 2. 默认选中预算位第一个 (此处解决：有可能item.dsp_slot_list有且仅有一条数据，但是过滤之后为空了)
						if (_filterDsp.length) {
							
							let _id = dspSlotObj.id || item.dsp_slot_list[0].id

							item['dsp_slot_id'] = _id
							
							this.hashCheckDspId.push(_id)

						} else {
							item['dsp_slot_id'] = null
						}

					} else {
						item['dsp_slot_id'] = null
					}

					// 时间控制 - 默认
					item['timePicker'] = form.timePickerDefault

					// 人群定向
					item['crowdControl'] = {
						tag_orientation: form.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
						tag_proportion: form.tag_proportion, // 0~100整数，默认0
						tag_list: form.tag_list, // 定向标签
						tag_relation: form.tag_relation // 人群定向关系，1=命中其一，2=全部命中
					}
				}
			})

			this.colDataList = matchArr
			this.tableLoadFlag = false
		},
		/**
		 * [concatData 匹配数据, 适用于查看]
		 * @param  {[type]} res   []
		 * @return {[type]}          [description]
		 */
		concatDataBack(res) {

			let {sspSlotArr, productArr, matchArr, form, dspList} = res
			let arr = []

			matchArr.map((item, index) => {

				let obj = {
					dsp_slot_list: []
				}

				//dsp
				obj['dsp_slot_id'] = item.dsp_slot_id

				// 时间控制
				let concatTime = int24ToTime(item.control_time_custom)
				let pre = concatTime[0]
				let next = `${concatTime[1].slice(0,2)}:59`
				obj['timePicker'] = [pre, next] // int24ToTime(item.control_time_custom) // 转成时间段

				// 人群定向
				obj['crowdControl'] = {
					tag_orientation: item.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
					tag_proportion: item.tag_proportion, // 0~100整数，默认0
					tag_list: item.tag_list, // 定向标签
					tag_relation: item.tag_relation // 人群定向关系，1=命中其一，2=全部命中
				}
				
				// 挂载-广告位
				sspSlotArr.map(inItem => {
					if(item.ssp_slot_id === inItem.ssp_slot_id) {
						obj['sspInfo'] = inItem
					}
				})

				// 挂载-产品
				productArr.map(inItem => {
					if(item.product_id === inItem.id) {
						obj['productInfo'] = inItem
					}
				})

				//挂载-dsp列表
				dspList.map(inItem => {
					if(item.dsp_slot_id === inItem.id) {
						obj['dsp_slot_list'] = [inItem]
					}
				})

				arr.push(obj)
			})

			this.colDataList = arr
			this.tableLoadFlag = false
		},
		/**
		 * [returnData 校验数据]
		 * @return {[type]} [description]
		 */
		validateData() {
			// 1. 先判断预算位是否有相同
			let hash = {}
			let preIndex = 0
			let index = 0 // 比如：1和10重复
			let flag = true
			let oriFlag = false // 判断是否都填写了定向

			let copyColData = this.colDataList

			for (let i = 0; i < copyColData.length; i++) {
				if (!!copyColData[i]['dsp_slot_id']) {

					if (!!hash[copyColData[i]['dsp_slot_id']]) {
						preIndex = Number(hash[copyColData[i]['dsp_slot_id']].split('-')[1]) + 1
						index = i + 1
						flag = false
						break
					}

					hash[copyColData[i]['dsp_slot_id']] = `true-${i}`
				}

				if(!(copyColData[i].crowdControl.tag_orientation >= 0 && copyColData[i].crowdControl.tag_orientation <= 2)) {
					flag = false
					break
				}
			}

			// 错误提示
			if (!flag) {
				this.$Message.error({
					content: `第${preIndex}行和第${index}行, 不可选择相同预算位`,
					duration: 3
				})

				this.$emit('on-change', {
					isValid: false
				})
				return
			}

			// 2. 判断是否有空预算位, 并且返回数据
			let clausesArr = [] // 条款
			let yesDspLength = 0 // 已经匹配预算位个数
			
			for (let j = 0; j < copyColData.length; j++) {
				if (!!copyColData[j].dsp_slot_id) {
					++yesDspLength
				}

				let cur = copyColData[j]

				clausesArr.push({
					ssp_slot_id: cur.ssp_slot_id,
					product_id: cur.product_id,
					dsp_slot_id: cur.dsp_slot_id,
					control_time_custom: timeTo24ToInt(cur.timePicker),
					tag_orientation: cur.crowdControl.tag_orientation, // 标签定向，0=不定向，1=针对定向，2=排除定向
					tag_proportion: cur.crowdControl.tag_proportion,
					tag_list: cur.crowdControl.tag_list,
					tag_relation: cur.crowdControl.tag_relation
				})
			}

			/*if(yesDspLength === 0) {
				this.$Message.error({
					content: '至少选中一个预算位',
					duration: 3
				})

				this.$emit('on-change', {
					isValid: false
				})
				return
			}*/


			this.$emit('on-change', {
				isValid: true,
				yesDspLength: yesDspLength,
				clauses: clausesArr
			})
		},
		/**
		 * [chooseControl 选择控量]
		 * @param  {[type]} row   [description]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */
		chooseControl(row, index) {
			this.modelFlag = true
			this.crowdIndex = index

			this.defaultCrowd = {...row.crowdControl}
		},
		/**
		 * [getCrowdControl 获取返回数据]
		 * @param  {[type]} obj [description]
		 * @return {[type]}     [description]
		 */
		getCrowdControl(obj) {

			let { valid, form } = obj

			this.crowdValidate = valid // 用于校验人群标签填写是否完整
			this.catchCrowd = form
		},
		/**
		 * [submitData 确定选择]
		 * @return {[type]} [description]
		 */
		submitData() {
			if(!this.crowdValidate) {
				return
			}

			this.$set(this.colDataList[this.crowdIndex], 'crowdControl', this.catchCrowd) // 赋值定向

			this.cancelModal()
		},
		/**
		 * [cancelModal 关闭弹窗]
		 * @return {[type]} [description]
		 */
		cancelModal() {
			this.defaultCrowd = {}
			this.catchCrowd = {}
			this.modelFlag = false
			this.crowdValidate = false
			this.crowdIndex = 0
		},
		/**
		 * [getRowIndex 获取当前row的index]
		 * @param  {[type]} index [description]
		 * @return {[type]}     [description]
		 */
		getRowIndex(index) {
			this.rowIndex = index
		},
		/**
		 * [selectOpen 下拉框展开]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */
		selectOpen(row, index) {
			this.selectIndex = index
		},
		/**
		 * [timePickerChange 时间选择器变化]
		 * @return {[type]}       [description]
		 */
		timePickerChange(time) {
			let pre = `${time[0].slice(0,2)}:00`
			let next = `${time[1].slice(0,2)}:59`

			this.$set(this.colDataList[this.rowIndex], 'timePicker', [pre, next])
		},
		/**
		 * [selectChange 下拉选择]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		selectChange(val) {
			this.$set(this.colDataList[this.selectIndex], 'dsp_slot_id', val)

			// 替换已选择的预算位值
			let dspIdArr = []
			this.colDataList.map(item => {
				if (!!item['dsp_slot_id']) {
					dspIdArr.push(item['dsp_slot_id'])
				}
			})

			this.hashCheckDspId = dspIdArr

		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.match-table-line
	color: #ff0000
	margin-bottom: 12px
	font-size: 16px
.no_dsp_select
	color: #ed4014
.control-flex
	display: flex
	justify-content: space-between
	i
		flex: 0 0 30px
		width: 30px
		height: 30px
		line-height: 30px
		cursor: pointer
		text-align: center
		font-size: 14px
	span
		flex: 1
		line-height: 30px
		text-align: left
.crowd-control-card
	position: relative
	/deep/ .tag-check
		width: 500px
.save-btn
	margin-top: 30px
	text-align: right
	button
		margin-left: 20px
</style>
