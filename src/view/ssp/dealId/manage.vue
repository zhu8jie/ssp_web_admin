<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<div class="page-title">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('edit')" icon="ios-add" type="primary" @click="toNew()">新建Deal组</Button>
				</div>
			</div>
			<div class="search-line" ref="search-line">
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.names_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量Deal组名称" />

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.deal_ids_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量DealID" />

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.ssp_slot_names_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称" />

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.ssp_slot_ids_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID" />

				<Button type="primary" class="mar-bot-10" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="catchTableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">

					<!--DealID/CPM-->
					<template slot-scope="{ row }" slot="DealIds">
						<p class="dataText" v-html="row.DealIdString"></p>
						<!-- <Input v-if="row.DealIdString" v-model="row.DealIdString" :rows="2" :autosize="{maxRows:2, minRows: 2}" type="textarea"/> -->
					</template>

					<!--广告位ID-->
					<template slot-scope="{ row }" slot="slotId">
						<p class="dataText" v-html="row.slotIdString"></p>
					</template>

					<!--广告位名称-->
					<template slot-scope="{ row }" slot="slotName">
						<p class="dataText" v-html="row.slotNameString"></p>
					</template>

					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" :to="toEdit(row)" v-if="_isShow_('edit')">修改</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
	</div>
</template>

<script>
import { showTitle, filterBatchQuery } from '@/libs/util'
import { formatDate } from '@/libs/tools'
import { getDealList } from '@/api/ssp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { BigNumber } from 'bignumber.js'

export default {
	name: 'dealId-manage',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			filterSearch: { // 搜索条件
				names: [], // Deal组名称
				deal_ids: [], // DealID
				ssp_slot_names: [], // 广告位名称
				ssp_slot_ids: [], // 广告位ID

				names_textarea: null, // Deal组名称textarea
				deal_ids_textarea: null, // DealID-textarea
				ssp_slot_names_textarea: null, // 广告位名称textarea
				ssp_slot_ids_textarea: null // 广告位ID-textarea
			},

			tableLoadFlag: true, // table的loading
			catchTableColList: [
				{
					title: 'Deal组ID',
					key: 'id',
					width: 80
				},
				{
					title: 'Deal组名称',
					key: 'name',
					width: 200
				},
				{
					title: 'DealID / CPM / 失效时间',
					slot: 'DealIds',
					minWidth: 200
				},
				{
					title: '广告位ID',
					slot: 'slotId',
					width: 150
				},
				{
					title: '广告位名称',
					slot: 'slotName',
					minWidth: 200
				},
				{
					title: '创建时间',
					key: 'created_at',
					width: 150
				},
				{
					title: '更新时间',
					key: 'updated_at',
					width: 150
				},

				{
					title: '操作',
					slot: 'action',
					fixed: 'right',
					width: 50
				}
			],
			colDatList: [] // table列表数据
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getDealList() // 默认请求一次媒体列表数据
		}
	},
	activated() {
		this.$Bus.$off('editEmitEvent')
		this.$Bus.$on('editEmitEvent', (msg) => {
			this.getDealList() // 默认请求一次媒体列表数据
		})
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}}) // search-line的高度
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	methods: {
		/**
		 * [getDealList description]
		 * @return {[type]} [description]
		 */
		getDealList() {
			let params = {
				...this.getAxiosParams(),
				...{
					page_size: this.pageSize,
					page_num: this.currentPage
				}
			}

			this.tableLoadFlag = true

			getDealList(params).then(res => {

				this.tableLoadFlag = false

				if (res.code === 200) {
					this.total_count = res.data.total_count

					res.data.list.map(item => {

						// 广告位
						let slotIdArr = []
						let slotNameArr = []
						if (item.SspSlots) {
							item.SspSlots.map(child => {
								slotIdArr.push(child.id)
								slotNameArr.push(child.ssp_slot_name)
							})
						}

						// DealID/CPM
						let dealIdArr = []
						if (item.DealIds) {
							item.DealIds.map(child => {
								dealIdArr.push(`DealID: ${child.deal_id} / ${BigNumber(child.cpm_price).dividedBy(100).toNumber()}元 / ${child.expire_at === 0 ? '长期有效' : formatDate(child.expire_at * 1000, 'yyyy-MM-dd')}`)
							})
						}

						item.created_at = formatDate(item.created_at * 1000, 'yyyy-MM-dd HH:mm:ss') // 创建时间
						item.updated_at = formatDate(item.updated_at * 1000, 'yyyy-MM-dd HH:mm:ss') // 更新时间

						item.slotIdString = slotIdArr.length ? slotIdArr.join('<br/>') : '' // 广告位ID
						item.slotNameString = slotNameArr.length ? slotNameArr.join('<br/>') : '' // 广告位名称

						item.DealIdString = dealIdArr.length ? dealIdArr.join('<br/>') : '' // DealID/CPM
					})

					this.colDatList = res.data.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [getAxiosParams 获取下载和列表的url参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {}

			!!_filter.names.length && (params.names = _filter.names) // Deal组名称
			!!_filter.deal_ids.length && (params.deal_ids = _filter.deal_ids) // DealID
			!!_filter.ssp_slot_names.length && (params.ssp_slot_names = _filter.ssp_slot_names) // 广告位名称
			!!_filter.ssp_slot_ids.length && (params.ssp_slot_ids = _filter.ssp_slot_ids) // 广告位ID

			return params
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1

			let _filter = this.filterSearch
			
			_filter.names = filterBatchQuery({value: _filter.names_textarea})// Deal组名称
			_filter.deal_ids = filterBatchQuery({value: _filter.deal_ids_textarea}) // DealID
			_filter.ssp_slot_names = filterBatchQuery({value: _filter.ssp_slot_names_textarea}) // 广告位名称
			_filter.ssp_slot_ids = filterBatchQuery({value: _filter.ssp_slot_ids_textarea, type: 'number'}) // 广告位名称

			this.getDealList()
		},
		/**
		 * [changePage 切换页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			// 切换页码
			this.currentPage = val
			this.getDealList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getDealList()
		},
		/**
		 * [toNew 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		toNew(row) {
			if(!!row && row.id) {
				this.$router.push({name: 'dealId-edit', query: {dealId: row.id}})
			} else {
				this.$router.push({name: 'dealId-edit'})
			}
		},
		/**
		 * [toEdit 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		toEdit(row) {
			return `/ssp/dealId/edit?dealId=${row.id}`
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText(count) {
			return `${count}+`
		}
	},
	/**
	 * [beforeRouteLeave 路由跳转]
	 * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
	 * @param  {[type]}   from [description]
	 * @param  {Function} next [description]
	 * @return {[type]}		[description]
	 */
	beforeRouteLeave(to, from, next) {
		if (to.name !== 'dealId-edit') {
			this.$Bus.$off('editEmitEvent')
		}
		next()
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
.console-table
	margin-top: 5px
.dataText
	width 100%
	display inline-block
	max-height 125px
	overflow auto
	line-height 25px
</style>
