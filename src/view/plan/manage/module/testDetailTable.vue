<template>
	<Modal
		v-model="modelFlag"
		:mask-closable="false"
		title="测试详情"
		:width="1000"
		:footer-hide="true"
		class-name="vertical-center-modal"
		@on-cancel="cancelModal"
	>
		<div class="clause-search">
			<Input type="textarea" class="i-margin-right-11 i-width-textarea" v-model.trim="filterSearch.ssp_slot_id_arr_textarea"  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>
			<Input type="textarea" class="i-margin-right-11 i-width-textarea" v-model.trim="filterSearch.product_name_arr_textarea"  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量产品名称"/>
			<Button type="primary" @click="doFilterList">查询</Button>
		</div>
		<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :height="500">
			<!-- 广告位名称 -->
			<template slot-scope="{ row }" slot="ssp_slot_name">
				{{row.sspInfo.ssp_slot_name}}
			</template>
			<!-- 广告位ID -->
			<template slot-scope="{ row }" slot="ssp_slot_id">
				{{row.sspInfo.id}}
			</template>
			<!-- 产品名称 -->
			<template slot-scope="{ row }" slot="product_name">
				{{row.productInfo.name}}
			</template>
			<!-- 状态 -->
			<template slot-scope="{ row }" slot="status">
				<Badge v-if="row.clause.status == 1" color="yellow" text="待测试" />
				<Badge v-if="row.clause.status == 2" color="blue" text="测试中" />
				<Badge v-if="row.clause.status == 3" color="red" text="暂停中" />
				<Badge v-if="row.clause.status == 4" color="green" text="已完成" />
			</template>
			<!-- 原因详情 -->
			<template slot-scope="{ row }" slot="reason">
				{{row.clause.reason || '-'}}
			</template>
			<!-- 原因详情 -->
			<template slot-scope="{ row }" slot="action">
				<!-- 已暂停 -->
				<Button type="primary" size="small" :loading="row.loading" v-if="row.clause.status === 3" @click="changeStatus(row, 1)">开启</Button>
			</template>
		</Table>
	</Modal>
</template>

<script>
import { filterBatchQuery } from '@/libs/util'
import { getTestDetailColumns } from '../../columns'
import { modPlanClauseStatus } from '@/api/plan'

export default {
	data() {
		return {
			filterSearch: { // 搜索
				ssp_slot_id_arr: [],
				product_name_arr: [],
				ssp_slot_id_arr_textarea: null, // 批量广告位ID
				product_name_arr_textarea: null // 批量产品名称
			},
			isChangeStatus: false, // 是否更改过状态，默认false
			tableLoadFlag: true,
			modelFlag: false,
			tableColList: getTestDetailColumns(),
			colDatList: [],
			catchColDatList: [] // 缓存测试详情列表，在筛选中使用
		}
	},
	methods: {
		/**
		 * [injectDate 注入数据]
		 * @param  {[type]} date [description]
		 * @return {[type]}      [description]
		 */
		injectDate(row) {
			if(!row.test_plan_clause_list || !row.test_plan_clause_list.length) {
				return
			}

			let _arr = []

			row.test_plan_clause_list.map(item => {

				let obj = {
					loading: false, // 锁
					clause: item,
					sspInfo: {},
					productInfo: {}
				}

				// 匹配广告位
				row.ssp_slot_list.map(inItem => {
					if(item.ssp_slot_id === inItem.id) {
						obj['sspInfo'] = inItem
						obj['ssp_slot_id'] = inItem.id
					}
				})

				// 匹配产品
				row.dsp_product_list.map(inItem => {
					if(item.product_id === inItem.id) {
						obj['productInfo'] = inItem
						obj['product_name'] = inItem.name
					}
				})

				_arr.push(obj)
			})

			this.catchColDatList = _arr
			this.modelFlag = !this.modelFlag

			this.isChangeStatus = false

			this.resetFilter() // 重置筛选条件
			this.getClauseList() // 获取列表
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {

			let _filter = this.filterSearch

			// 广告位ID数组
			_filter.ssp_slot_id_arr = filterBatchQuery({value: _filter.ssp_slot_id_arr_textarea, type: 'number'})

			// 产品名称数组
			_filter.product_name_arr = filterBatchQuery({value: _filter.product_name_arr_textarea})

			this.getClauseList({type: 'search'})
		},
		/**
		 * [getClauseList 获取测试详情列表]
		 * @return {[type]} [description]
		 */
		getClauseList(params = {}) {
			let _filter = this.filterSearch
			let copyArr = [...this.catchColDatList]
			let resultArr = [] // 筛选结果

			if (params.type === 'search' && (_filter.ssp_slot_id_arr.length || _filter.product_name_arr.length)) {
				copyArr.map(item => {
					if (_filter.ssp_slot_id_arr.length && _filter.product_name_arr.length) {
						if (_filter.ssp_slot_id_arr.includes(item.ssp_slot_id) && _filter.product_name_arr.includes(item.product_name)) {
							resultArr.push(item)
						}
					} else {
						if (_filter.ssp_slot_id_arr.includes(item.ssp_slot_id) || _filter.product_name_arr.includes(item.product_name)) {
							resultArr.push(item)
						}
					}

					this.colDatList = resultArr

				})
			} else {
				this.colDatList = copyArr
			}
		},
		/**
		 * [resetFilter 重置筛选条件]
		 * @return {[type]} [description]
		 */
		resetFilter() {
			this.filterSearch = { // 搜索
				ssp_slot_id_arr: [],
				product_name_arr: [],
				ssp_slot_id_arr_textarea: null, // 批量广告位ID
				product_name_arr_textarea: null // 批量产品名称
			}
		},
		/**
		 * [drawerClose 关闭]
		 * @return {[type]} [description]
		 */
		cancelModal() {
			this.modelFlag = false
			this.colDatList = []

			if(this.isChangeStatus) {
				this.$emit('on-change')
			}
		},
		/**
		 * [changeStatus 修改测试条约状态]
		 * @param  {[type]} row    [description]
		 * @param  {[type]} status [description]
		 * @return {[type]}        [description]
		 */
		changeStatus(row, status) {
			this.$Modal.confirm({
				title: '确定开启计划？',
				onOk: () => {

					row.loading = true

					modPlanClauseStatus({
						clause_id: row.clause.id,
						status: status
					}).then(res => {

						row.loading = false

						if (res.code === 200) {
							this.$Message.success({
								content: '操作成功',
								duration: 3
							})

							row.clause.status = 2

							this.isChangeStatus = true
						}
					})
				}
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.clause-search
	margin-bottom: 20px
</style>
