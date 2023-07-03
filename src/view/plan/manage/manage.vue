<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('newAndEdit')" icon="ios-add" type="primary" @click="toNew('', 'new')">新建计划</Button>
				</div>
			</div>

			<div class="search-line" ref="search-line">
				<Input class="i-margin-right-11 i-width-select mar-bot-10" clearable v-model.trim="filterSearch.name_or_id" placeholder="计划名称或ID"/>

				<Input type="textarea" v-model.trim="filterSearch.ssp_slot_name_arr_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_id_arr_textarea"  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.product_name_arr_textarea"  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量产品名称"/>

				<DatePicker
					class="i-margin-right-11 i-width-select mar-bot-10"
					:clearable="true"
					type="date"
					format="yyyy-MM-dd"
					:transfer="true"
					placeholder="计划开始日期"
					v-model="filterSearch.start_at"
				/>

				<DatePicker
					class="i-margin-right-11 i-width-select mar-bot-10"
					:clearable="true"
					type="date"
					format="yyyy-MM-dd"
					:transfer="true"
					placeholder="计划结束日期"
					v-model="filterSearch.end_at"
				/>

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<div class="nav-handle-group">
				<RadioGroup v-model="filterSearch.status" type="button" @on-change="doFilterList">
					<Radio v-for="item in navGroupArr" :key="item.status" :label="item.status">{{item.name}}<span>({{item.count}})</span></Radio>
				</RadioGroup>
			</div>

			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!-- 计划模板 -->
					<template slot-scope="{ row }" slot="template">
						<div class="flex-row">
							<p>{{row.template.name}}</p>
							<i class="iconfont icon-view" title="查看计划模板" @click="checkTemplate(row)"></i>
						</div>
					</template>
					<!-- 广告位ID -->
					<template slot-scope="{ row }" slot="ssp_slot_id_arr">
						<div class="flex-row">
							<p class="line5-overscroll" v-if="row.ssp_slot_id_str" v-html="row.ssp_slot_id_str"></p>
							<p v-else>-</p>
							<i v-if="row.ssp_slot_id_str" class="iconfont icon-copy copy-content" title="复制" :data-clipboard-text="row.ssp_slot_id_str" @click="copyContent"></i>
						</div>
					</template>
					<!-- 广告位名称 -->
					<template slot-scope="{ row }" slot="ssp_slot_name_arr">
						<div class="flex-row">
							<p class="line5-overscroll" v-if="row.ssp_slot_name_str" v-html="row.ssp_slot_name_str"></p>
							<p v-else>-</p>
							<i v-if="row.ssp_slot_name_str" class="iconfont icon-copy copy-content" title="复制" :data-clipboard-text="row.ssp_slot_name_str" @click="copyContent"></i>
						</div>
					</template>
					<!-- 产品名称 -->
					<template slot-scope="{ row }" slot="dsp_product_name">
						<div class="flex-row">
							<p class="line5-overscroll" v-if="row.dsp_product_name" v-html="row.dsp_product_name"></p>
							<p v-else>-</p>

							<i v-if="row.dsp_product_name" class="iconfont icon-copy copy-content" title="复制" :data-clipboard-text="row.dsp_product_name" @click="copyContent"></i>
						</div>
					</template>

					<!-- 测试日期 -->
					<template slot-scope="{ row }" slot="test_time">
						{{row | timeConcatFormat}}
					</template>

					<!--业务状态-->
					<template slot-scope="{ row }" slot="status">
						<div class="status-flex">
							<Badge v-if="row.status == 1" color="yellow" text="待测试" />
							<Badge v-if="row.status == 2" color="blue" text="测试中" />
							<Badge v-if="row.status == 3" color="red" text="暂停中" />
							<Badge v-if="row.status == 4" color="green" text="已完成" />

							<i class="icon-view" v-if="(row.status == 2 || row.status === 3 || row.status === 4) && _isShow_('handle')" title="查看详情" @click="checkTestDetail(row)"></i>
						</div>
					</template>

					<!-- 测试完成时间 -->
					<template slot-scope="{ row }" slot="test_end_time">
						<template v-if="row.status == 4">{{row.completed_at | timeFormat}}</template>
						<template v-else>-</template>
					</template>

					<!-- 操作人 -->
					<template slot-scope="{ row }" slot="updater">
						{{row.updater.user_name}}
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<!-- 待测试1 修改   暂停   删除  备注 -->
						<!-- 测试中2 暂停   终止  备注 -->
						<!-- 暂停中3 查看  开启  终止 备注 -->
						<!-- 已完成4 查看 备注 -->

						<Button type="text" v-if="(row.status === 2 || row.status === 3 || row.status === 4) && _isShow_('newAndEdit')" @click="toNew(row, 'view')">查看</Button>
						<Button type="text" v-if="row.status === 3 && _isShow_('handle')" @click="changeStatus(row, 1)">开启</Button>
						<Button type="text" v-if="(row.status === 2 || row.status === 3) && _isShow_('handle')" @click="changeStatus(row, 4)">终止</Button>
						<Button type="text" v-if="row.status === 1 && _isShow_('newAndEdit')" @click="toNew(row, 'edit')">修改</Button>
						<Button type="text" v-if="(row.status === 1 || row.status === 2) && _isShow_('handle')" @click="changeStatus(row, 3)">暂停</Button>
						<Button type="text" v-if="row.status === 1 && _isShow_('delete')" @click="doDelete(row)">删除</Button>
						<Button type="text" v-if="_isShow_('note')" @click="doNote(row)">备注</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>

		<!-- 解释说明 -->
		<explain-table ref="explainTable"></explain-table>

		<!-- 测试详情 -->
		<test-detail-table ref="testDetailTable" @on-change="getPlanList"></test-detail-table>

		<!-- 备注弹窗 -->
		<note-table ref="noteTable"></note-table>

		<!-- 查看模板详情 -->
		<template-detail ref="templateDetail"></template-detail>

	</div>
</template>

<script>
import { showTitle, regNumString, filterBatchQuery } from '@/libs/util'
import { formatDate } from '@/libs/tools'
import { getPlanManColumns } from '../columns'
import { planAdd, planMod, planDel, getPlanList, modPlanStatus } from '@/api/plan'
import explainTable from './module/explainTable.vue' // 广告位与产品状态及原因解释说明
import testDetailTable from './module/testDetailTable.vue' // 测试详情
import noteTable from './module/noteTable.vue' // 备注
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import templateDetail from './module/templateDetail.vue' // 模板详情
import Clipboard from 'clipboard'

export default {
	name: 'ssp-plan-manage',
	mixins: [tableHeight, inPageAccess],
	components: { explainTable, testDetailTable, noteTable, templateDetail },
	data() {
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			// 搜索条件
			filterSearch: {
				status: 0, // 状态
				name_or_id: '', // 名称或ID
				ssp_slot_name_arr: [], // 广告位名称
				ssp_slot_id_arr: [], // 广告位ID数组
				product_name_arr: [], // 产品名称
				start_at: null, // 开始时间
				end_at: null, // 结束时间

				ssp_slot_id_arr_textarea: null, // 广告位ID数组textarea(多个)
				ssp_slot_name_arr_textarea: null, // 广告位名称（多个）查询
				product_name_arr_textarea: null // 产品名称
			},
			navGroupArr: [ // 筛选nav
				{
					name: '全部',
					status: 0,
					count: 0
				},
				{
					name: '待测试',
					status: 1,
					count: 0
				},
				{
					name: '测试中',
					status: 2,
					count: 0
				},
				{
					name: '测试暂停中',
					status: 3,
					count: 0
				},
				{
					name: '已完成',
					status: 4,
					count: 0
				}
			],
			navGroup: { // nav的group值
				count: 0,
				valid_count: 0,
				stop_count: 0,
				invalid_count: 0,
				complete_count: 0
			},

			tableColList: getPlanManColumns(this), // 列
			colDatList: [], // 公司列表
			tableLoadFlag: true, // table的loading

			submitClock: false // 保存锁
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	filters: {
		timeConcatFormat(row) {
			return `${formatDate(row.start_at * 1000, 'yyyy年MM月dd日')} ~ ${formatDate(row.end_at * 1000, 'yyyy年MM月dd日')}`
		},
		timeFormat(time) {
			return formatDate(time * 1000, 'yyyy-MM-dd HH:mm:ss')
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getPlanList()
		}
	},
	activated() {
		this.$Bus.$off('editEmitEvent')
		this.$Bus.$on('editEmitEvent', (msg) => {
			this.getPlanList() // 默认请求一次媒体列表数据
		})
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': true})// search-line的高度
	},
	methods: {
		/**
		 * [getPlanList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getPlanList() {
			this.tableLoadFlag = true

			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			getPlanList(params).then(res => {

				this.tableLoadFlag = false

				if (res.code === 200) {
					this.formartListHtml(res.data.list || []) // 格式化处理列表
					this.formatStatus(res.data) // 格式化状态
				}
			}, err=> {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [formartListHtml 格式化列表中的html, 比如广告位ID/广告位名称/产品名称]
		 * @param  {[type]} arr [description]
		 * @return {[type]}     [description]
		 */
		formartListHtml(_list) {
			_list.map(item => {

				// 格式化数据
				let curObj = {
					dsp_product_name: [], // 产品名称
					ssp_slot_name: [], // 广告位ID
					ssp_slot_id: [] // 广告位名称
				}

				// 1. 广告位名称 + 广告位ID
				!!item.ssp_slot_list && (item.ssp_slot_list.map(inItem => {
					curObj.ssp_slot_name.push(inItem.ssp_slot_name)
					curObj.ssp_slot_id.push(inItem.id)
				}))

				// 2. 产品名称
				!!item.dsp_product_list && (item.dsp_product_list.map(inItem => {
					curObj.dsp_product_name.push(inItem.name)
				}))


				item['ssp_slot_name_str'] = curObj.ssp_slot_name.join('\n')
				item['ssp_slot_id_str'] = curObj.ssp_slot_id.join('\n')
				item['dsp_product_name'] = curObj.dsp_product_name.join('\n')

				item.created_at = formatDate(item.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') // 开始时间
				item.updated_at = formatDate(item.updated_at * 1000, 'yyyy-MM-dd HH:mm:ss') // 更新时间
			})

			this.colDatList = _list
		},
		/**
		 * [formatStatus 格式化状态]
		 * @param  {[type]} _list [description]
		 * @return {[type]}       [description]
		 */
		formatStatus(data) {
			let _status_count = data.status_count || []
			let total = 0

			_status_count.map(item => {
				total += item.count
				this.navGroupArr.map(inItem => {
					if(item.status === inItem.status) {
						inItem.count = item.count
					}
				})
			})

			this.navGroupArr[0].count = total
			this.total_count = data.total
		},
		/**
		 * [getAxiosParams 获取列表参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {
			let _filter = this.filterSearch

			let params = {}

			// 开始时间
			!!_filter.start_at && (params.start_at = new Date(_filter.start_at).getTime() / 1000)

			// 结束时间
			!!_filter.end_at && (params.end_at = (new Date(_filter.end_at).getTime() + (24 * 3600 - 1) * 1000) / 1000)

			// 状态
			!!_filter.status && (params.status = _filter.status)

			// 产品名称或ID
			!!_filter.name_or_id && (params.name_or_id = _filter.name_or_id)

			// 广告位名称
			!!_filter.ssp_slot_name_arr.length && (params.ssp_slot_name_arr = _filter.ssp_slot_name_arr)

			// 广告位名称
			!!_filter.ssp_slot_id_arr.length && (params.ssp_slot_id_arr = _filter.ssp_slot_id_arr)

			// 产品名称数组
			!!_filter.product_name_arr.length && (params.product_name_arr = _filter.product_name_arr)

			return params
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1

			let _filter = this.filterSearch

			// 广告位名称
			_filter.ssp_slot_name_arr = filterBatchQuery({value: _filter.ssp_slot_name_arr_textarea})

			// 广告位ID数组
			_filter.ssp_slot_id_arr = filterBatchQuery({value: _filter.ssp_slot_id_arr_textarea})

			// 产品名称数组
			_filter.product_name_arr = filterBatchQuery({value: _filter.product_name_arr_textarea})

			this.getPlanList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getPlanList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getPlanList()
		},
		/**
		 * [changeStatus 修改]
		 * @param  {[type]} row    [description]
		 * @param  {[type]} status [description]
		 * @return {[type]}        [description]
		 */
		changeStatus(row, status) {
			this.$Modal.confirm({
				title: status === 1 ? '确定开启计划？' : (status === 3 ? '确定暂停计划？' : '确定终止计划？'),
				onOk: () => {
					modPlanStatus({
						id: row.id,
						status: status
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({
								content: '操作成功',
								duration: 3
							})
							this.getPlanList()
						}
					})
				}
			})
		},
		/**
		 * [toggleExplain 显示隐藏解释原因]
		 * @return {[type]} [description]
		 */
		toggleExplain() {
			this.$refs['explainTable'].injectDate()
		},
		/**
		 * [checkTestDetail 查看测试详情]
		 * @return {[type]} [description]
		 */
		checkTestDetail(row) {
			this.$refs['testDetailTable'].injectDate(row)
		},
		/**
		 * [toNew 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		toNew(row, type) {
			if(!!row && row.id) {
				this.$router.push({name: 'ssp-plan-edit', query: {planId: row.id, type: type}})
			} else {
				this.$router.push({name: 'ssp-plan-edit', query: {type: type}})
			}
		},
		/**
		 * [doNote 备注]
		 * @return {[type]} [description]
		 */
		doNote(row) {
			this.$refs['noteTable'].injectDate(row)
		},
		/**
		 * [checkTemplate 查看模板详情]
		 * @return {[type]} [description]
		 */
		checkTemplate(row) {
			this.$refs['templateDetail'].injectDate(row.template) // 子组件注入数据
		},
		/**
		 * [doDelete 删除测试计划]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		doDelete(row) {
			this.$Modal.confirm({
				title: '确定删除该计划？',
				onOk: () => {
					planDel({
						id_arr: [row.id]
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({
								content: '操作成功',
								duration: 3
							})
							this.getPlanList()
						}
					})
				}
			})
		},
		/**
		 * [copyContent 复制粘贴]
		 * @return {[type]} [description]
		 */
		copyContent() {
			let clipboard = new Clipboard('.copy-content')
			clipboard.on('success', e => {
				this.$Message.success('复制成功')
				// 释放内存
				clipboard.destroy()
			})
			clipboard.on('error', e => {
				// 不支持复制
				this.$Message.success('该浏览器不支持自动复制')
				// 释放内存
				clipboard.destroy()
			})
		}
	},
	/**
	 * [beforeRouteLeave 路由跳转]
	 * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
	 * @param  {[type]}   from [description]
	 * @param  {Function} next [description]
	 * @return {[type]}        [description]
	 */
	beforeRouteLeave(to, from, next) {
		if (to.name !== 'ssp-plan-edit') {
			this.$Bus.$off('editEmitEvent')
		}
		next()
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.nav-handle-group
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
.flex-row
	display: flex
	align-items: center
	justify-content: space-between
	.iconfont
		flex: 0 0 20px
		height: 16px
		width: 20px
		text-align: right
		color: #4083F8
		cursor: pointer
	.icon-view
		font-size: 16px
	p
		white-space: pre-line
		flex: 1
.status-flex
	display: flex
	align-items: center
	justify-content: space-between
	.icon-view
		font-size: 16px
		color: #4083f8
		cursor: pointer
		margin-left: 10px
</style>
