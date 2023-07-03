<template>
	<Card :bordered="false" dis-hover class="page-main">
		<div class="page-title clearfix">
			<h2>{{headTitle}}</h2>
			<div class="is-handler">
				<Button class="host" type="text" @click="columnDrawer = true">自定义列</Button>
			</div>
		</div>
		<div class="search-line">
			<Row>
				<Col span="24">
					<DatePicker
						class="i-margin-right-11 i-width-date"
						:transfer="true"
						:value="search_time"
						type="daterange"
						format="yyyy-MM-dd"
						:options="options1"
						@on-change="filterByDate"
						:clearable="false"
					/>

					<Select
						class="i-margin-right-11 i-width-select mar-bot-10"
						multiple
						filterable
						v-model="search.dsp_company_id"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						placeholder="公司名称/ID"
					>
						<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
					</Select>


					<Select 
						class="i-width-select i-margin-right-11"
						filterable 
						v-model="search.creative_type_arr"
						placeholder="广告位类型"
						multiple
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
					>
						<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
							<Option v-for="child in item.children" :key="child.value" :value="child.value">{{child.label}}</Option>
						</OptionGroup>
					</Select>

					<!-- <Treeselect 
						class="i-width-select i-margin-right-11"
						:multiple="true"
						:options="dspSlotList"
						:load-options="_getSlotList"
						:clearOnSelect="true"
						:limitText="limitText"
						:limit="1"
						v-model="search.dsp_slot_id"
						placeholder="预算位名称"
						noOptionsText="加载中"
						noResultsText="没有搜索的结果"
					>
						<div  slot="value-label" slot-scope="{ node }">{{node.raw.dsp_slot_name}}</div>
						<label class="label_checkout" slot="option-label" slot-scope="{ node }">
							<div style="display:inline-block;line-height: 30px" v-if="!node.isBranch">
								<div class="checkbox_content">
									<div class="checkbox_name" :title="node.raw.dsp_slot_name">
										<span>{{node.raw.dsp_slot_name}}</span>
									</div>
									<div class="checkbox_active">
										<span>ID:{{node.raw.id}}</span>
									</div>
								</div>
							</div>
						</label>
						<Treeselect-value :value="search.dsp_slot_id"/>
					</Treeselect> -->
					<!-- 预算位名称 -->
					<Select
						class="i-margin-right-11 i-width-select i-select-remote"
						v-model="search.dsp_slot_id"
						filterable
						clearable
						multiple
						:remote-method="searchDspSlot"
						:loading="dspSlotLoad"
						 @on-change="clearSearchDspSlot"
						:on-query-change="dspSlotQueryChange"
						:transfer="true"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						placeholder="预算位名称/ID"
					>
						<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})</Option>
					</Select>

					<Input class="i-margin-right-11" clearable v-model.trim="dsp_slot_code" type="text" placeholder="输入预算方广告位ID" style="width:160px "/>
					<Button type="primary" @click="doFilterList">查询</Button>
				</Col>
			</Row>
		</div>
		<div class="console-table data-table">
			<Table   
				highlight-row
				stripe
				border
				:columns="tableColList"
				:data="colDatList"
				ref="tableExpand"
				:loading="tableLoadFlag"
				@on-sort-change="sortChange"
				:height="tableHeight"
				:no-data-text="noDataText"
			>
				<!-- # index-->
				<template slot-scope="{ row, index }" slot="index">
					{{index + 1}}
				</template>

				<!--日期-->
				<template slot-scope="{ row }" slot="date">
					<p class="table_text">{{ row.date }}</p>
				</template>
				<!--公司名称/ID-->
				<template slot-scope="{ row }" slot="company_name">
					<p class="name-row-ellipsis" :title="row.company_name">{{ row.company_name }}</p>
					<p class="tip-row-line">ID: {{ row.company_id }}</p>
				</template>
				<!--预算位/ID-->
				<template slot-scope="{ row }" slot="dsp_slot_name">
					<p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
					<p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
				</template>
				<!--预算方广告位ID-->
				<template slot-scope="{ row }" slot="dsp_slot_code">
					<p class="table_text">{{ row.dsp_slot_code }}</p>
				</template>
				<!--广告样式-->
				<template slot-scope="{ row }" slot="ad_type">
					<p class="table_text">{{adTypeText(row.slot_ad_type_id)}}-{{creativeIdText(row.slot_creative_type)}}</p>
				</template>
				<!--广告展现-->
				<template slot-scope="{ row }" slot="show_pv">
					 <p class="table_text">{{ getNumberInt(row.show_pv)}}</p>
				</template>
				<!--广告点击-->
				<template slot-scope="{ row }" slot="click_pv">
					<p class="table_text">{{ getNumberInt(row.click_pv)}}</p>
				</template>
				<!--cpm-->
				<template slot-scope="{ row }" slot="cpm">
					<p class="table_text">{{ getNumberFloat(row.cpm)}}</p>
				</template>
				<!--cpc-->
				<template slot-scope="{ row }" slot="cpc">
					<p class="table_text">{{ getNumberFloat(row.cpc)}}</p>
				</template>
				<!--利润率-->
				<template slot-scope="{ row }" slot="profits_rates">
					<p class="table_text">{{ row.profits_rates}}%</p>
				</template>
				<!--预算方广告展现-->
				<template slot-scope="{ row }" slot="dsp_show_pv">
					<p class="table_text">{{ getNumberInt(row.dsp_show_pv)}}</p>
				</template>
				<!--预算方广告点击-->
				<template slot-scope="{ row }" slot="dsp_click_pv">
					<p class="table_text">{{ getNumberInt(row.dsp_click_pv)}}</p>
				</template>
				<!--展现gap-->
				<template slot-scope="{ row }" slot="gap_show_pv">
					<Tooltip placement="right-start" :transfer="true">
						<p :class="row.gap_show_pv_rates>10 || row.gap_show_pv_rates<-10 ?'table_text colorRed' :'table_text'">{{getNumberInt(row.gap_show_pv)}}</p>
						<div slot="content">
							<p style="font-size: 12px">gap率:{{getNumberFloat(row.gap_show_pv_rates)}}%</p>
						</div>
					</Tooltip>
				</template>
				<!--点击gap-->
				<template slot-scope="{ row }" slot="gap_click_pv">
					<Tooltip placement="right-start" :transfer="true">
						<p :class="row.gap_click_pv_rates>10 || row.gap_click_pv_rates<-10 ?'table_text colorRed' :'table_text'">{{getNumberInt(row.gap_click_pv)}}</p>
						<div slot="content">
							<p style="font-size: 12px">gap率:{{getNumberFloat(row.gap_click_pv_rates)}}%</p>
						</div>
					</Tooltip>
				</template>
				<!--预算方CPM-->
				<template slot-scope="{ row }" slot="dsp_cpm">
					<p class="table_text">{{ getNumberFloat(row.dsp_cpm)}}</p>
				</template>
				<!--预算方CPC-->
				<template slot-scope="{ row }" slot="dsp_cpc">
					<p class="table_text">{{ getNumberFloat(row.dsp_cpc)}}</p>
				</template>
				<!--cpmgap-->
				<template slot-scope="{ row }" slot="gap_cpm">
					<Tooltip placement="right-start" :transfer="true">
						<p :class="row.gap_cpm_rates>10 || row.gap_cpm_rates<-10 ?'table_text colorRed' :'table_text'" >{{getNumberFloat(row.gap_cpm)}}</p>
						<div slot="content">
							<p style="font-size: 12px">gap率:{{getNumberFloat(row.gap_cpm_rates)}}%</p>
						</div>
					</Tooltip>
				</template>
				<!--cpmgap-->
				<template slot-scope="{ row }" slot="gap_cpc">
					<Tooltip placement="right-start" :transfer="true">
						<p :class="row.gap_cpc_rates > 10 || row.gap_cpc_rates < -10 ?'table_text colorRed' :'table_text'">{{getNumberFloat(row.gap_cpc)}}</p>
						<div slot="content">
							<p style="font-size: 12px">gap率:{{getNumberFloat(row.gap_cpc_rates)}}%</p>
						</div>
					</Tooltip>
				</template>
			</Table>
			<div class="page-center">
				<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
			</div>
		</div>
		<Drawer v-model="columnDrawer" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<div class="column_content">
				<RadioGroup class="private-check-card" type="button" v-model="column_active">
					<Radio :label="1">预算位表格设置</Radio>
				</RadioGroup>
				<div class="col_detail">
					<div class="media_table" v-if="column_active === 1">
						<Row>
							<Col :span="16">
								<div class="col_title">可选择列</div>
								<div class="optional_detail">
									<div class="checkout_content">
										<div class="check_title">
											<Checkbox
												:value="mediaAll1"
												@click.prevent.native="mediaCheckAll1">数据维度</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange1">
											<Checkbox class="option_check" v-for="item in media_info" :key="'数据维度'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content">
										<div class="check_title">
											<Checkbox
												:value="mediaAll2"
												@click.prevent.native="mediaCheckAll2">基本指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange2">
											<Checkbox class="option_check" v-for="item in media_basic" :key="'基本指标'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
								</div>
							</Col>
							<Col :span="8">
								<div class="col_title">已选择列</div>
								<div class="select_con">
									<Tag v-for="(item,index) in mediaCheckData" :key="'已选择列'+index+item" :name="item" closable @on-close="mediaClose">{{item}}</Tag>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</div>
			<div class="drawer-footer">
				<Button @click="columnDrawer = false">取消</Button>
				<Button type="primary"  @click="submitData()">提交</Button>
			</div>
		</Drawer>
	</Card>
</template>

<script>
import {showTitle} from '@/libs/util'
import {setTableHeadApi, tableInfoApi, setTablePageApi} from '@/api/common'
import { debounce } from '@/libs/tools'
import {getDspSlotList} from '@/api/dsp'
import { getDspGapDataApi } from '@/api/data'
import { mapActions } from 'vuex'
import { tableHeight } from '@/mixin/calc-table-height.js'

export default {
	name: 'gap-manage',
	mixins: [tableHeight],
	data() {
		return {
			tableId: 10,
			noDataText: this.$config.noDataText,
			dspCompanyList: [], // 公司名称

			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
			adtypeList: [],
			pickerOptions: {
				disabledDate(date) {
					let curDate = (new Date()).getTime()
					let three = 30 * 24 * 3600 * 1000
					let threeMonths = curDate - three
					return date.getTime() > Date.now() || date.getTime() < threeMonths
				}
			},
			options1: {
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				},
				shortcuts: [
					{
						text: '最近七天',
						value() {
							const end = new Date()
							const start = new Date()
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
							return [start, end]
						}
					},
					{
						text: '最近30天',
						value() {
							let end = new Date()
							let start = new Date()
							let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
							if (start < disableData) {
								start = new Date(disableData)
							}
							return [start, end]
						}
					}
				]
			}, // 时间的判断方式
			search_time: '', // 时间的默认值
			search: {
				start_date: null,
				end_date: null,
				dsp_company_id: [],
				creative_type_arr: [],
				dsp_slot_id: [],
				order: null,
				group: []
			}, // 查询的内容
			dsp_slot_code: '',
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			tableLoadFlag: true,
			buttonSize: 'large',
			columnDrawer: false, // 自定义列的抽屉
			column_active: 1, // 自定义列的模块的选择
			mediaIndeterminate: true,
			submitClock: false,
			mediaAll1: false,
			mediaAll2: false,
			media_info: ['日期', '公司名称', '预算位名称', '预算方广告位ID', '广告位类型'],
			media_basic: ['广告展现', '广告点击', 'CPM', 'CPC', '利润率', '预算方广告展现', '展现gap', '预算方广告点击', '点击gap',
			'预算方CPM', 'CPMgap', '预算方CPC', 'CPCgap'],
			mediaCheckData: ['日期', '预算位名称', '预算方广告位ID', '利润率', '展现gap', '点击gap', 'CPMgap', 'CPCgap'],
			tableColList: [],
			colDatList: [],
			adSceneData: [] // 广告场景
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	created() {
		this.getTableInfo()
		this.initLinkage() // 初始化联动
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		...mapActions([
			'getDspCompanyList'
		]),
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this.getTimeData() // 初始化时间设置
			this.formartSceneAndStyle() // 获取广告位场景和样式

			this.getDspSlotList() // 预算位列表
			this._getDspCompanyList() // 预算位-公司名称
		},
		/**
		 * [sortChange 表格的排序]
		 * @param  {[type]} col   [description]
		 * @param  {[type]} key   [description]
		 * @param  {[type]} order [description]
		 * @return {[type]}	   [description]
		 */
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.search.order = col.column.slot
				this.currentPage = 1
				this.getGapData()
			} else if (col.order === 'desc') {
				this.search.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.getGapData()
			}
		},
		/**
		 * [getTableInfo 获取自定义列的数据]
		 * @return {[type]} [description]
		 */
		getTableInfo() {
			tableInfoApi().then(res => {
				let data = res.data
				if (res.code === 200) {
					let gapKey = data[`table_head_head_${this.tableId}`]
					if (gapKey) {
						this.mediaCheckData = gapKey.split(',')
						this.mediaJudgeAll()
					}

					this.pageSize = data[`table_page_page_${this.tableId}`] || 10

					this.getTableColumns()
					this.getGapData()
				}
			})
		},
		/**
		 * [adTypeText 获取广告场景]
		 * @param  {[type]} id [description]
		 * @return {[type]}	[description]
		 */
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [creativeIdText 获取广告样式]
		 * @param  {[type]} id [description]
		 * @return {[type]}	[description]
		 */
		creativeIdText(id) {
			let _arr = this.$store.state.app.adStyleData

			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getGapData()
		},

		/**
		 * [changePage 改变页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getGapData()
		},
		/**
		 * [sizeChange 页码数量]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.currentPage = 1
			this.tablePageUpdate(size)
		},
		// 页码的保存
		tablePageUpdate(size) {
			setTablePageApi({table_id: this.tableId, page_num: size}).then(res => {
				this.getGapData()
			})
		},
		/**
		 * [getGapData 获取gap的数据]
		 * @return {[type]} [description]
		 */
		getGapData() {

			let params = {
				...this.search,
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			if (this.dsp_slot_code) {
				params.dsp_slot_code = this.dsp_slot_code
			}
			
			this.tableLoadFlag = true

			getDspGapDataApi(params).then(res => {
				let date = res.data
				if (res.code === 200) {
					this.tableLoadFlag = false
					this.total_count = date.total
					this.colDatList = date.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [getTableColumns 设置数据表格的列]
		 * @return {[type]} [description]
		 */
		getTableColumns () {
			const ColumnList = [
				{title: '#', width: 36, key:'index', slot:'index', align: 'center'},
				{title: '日期', slot: 'date', minWidth: 80, sortable: 'custom'},
				{title: '公司名称', header: '公司(账号)名称/ID', slot: 'company_name', minWidth: 130},
				{title: '预算位名称', header: '预算位名称/ID', slot: 'dsp_slot_name', minWidth: 120},
				{title: '预算方广告位ID', slot: 'dsp_slot_code', minWidth: 230},
				{title: '广告位类型', slot: 'ad_type', minWidth: 200},
				{title: '广告展现', slot: 'show_pv', minWidth: 100, sortable: 'custom'},
				{title: '广告点击', slot: 'click_pv', minWidth: 120, sortable: 'custom'},
				{title: 'CPM', slot: 'cpm', minWidth: 80, sortable: 'custom'},
				{title: 'CPC', slot: 'cpc', minWidth: 80, sortable: 'custom'},
				{title: '利润率', slot: 'profits_rates', minWidth: 100, sortable: 'custom'},
				{title: '预算方广告展现', slot: 'dsp_show_pv', minWidth: 130, sortable: 'custom'},
				{title: '展现gap', slot: 'gap_show_pv', minWidth: 100, sortable: 'custom'},
				{title: '预算方广告点击', slot: 'dsp_click_pv', minWidth: 130, sortable: 'custom'},
				{title: '点击gap', slot: 'gap_click_pv', minWidth: 100, sortable: 'custom'},
				{title: '预算方CPM', slot: 'dsp_cpm', minWidth: 120, sortable: 'custom'},
				{title: 'CPMgap', slot: 'gap_cpm', minWidth: 100, sortable: 'custom'},
				{title: '预算方CPC', slot: 'dsp_cpc', minWidth: 100, sortable: 'custom'},
				{title: 'CPCgap', slot: 'gap_cpc', minWidth: 100, sortable: 'custom'}
			]


			// 筛选表格
			let resultArr = []
			let extraMust = ['date', 'index'] // 额外必须存在的字段

			ColumnList.map(item => {
				// 时间不可取消
				if(this.mediaCheckData.indexOf(item.title) >= 0 || extraMust.includes(item.slot)) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})

			this.tableColList = resultArr
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText (count) {
			return `+${count}`
		},
		
		// 流量表格的筛选
		// 数据维度的筛选
		mediaCheckAll1() {
			if (this.mediaAll1) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_info.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll1 = false
			} else {
				Object.keys(this.media_info).forEach(j => {
					this.mediaCheckData.push(this.media_info[j])
				})
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll1 = true
			}
		},
		mediaCheckAllChange1(data) {
			let dataAll = [...data].filter(item => this.media_info.indexOf(item) > -1)
			if (dataAll.length === this.media_info.length) {
				this.mediaAll1 = true
			} else {
				this.mediaAll1 = false
			}
		},
		// 基本指标的筛选
		mediaCheckAll2() {
			if (this.mediaAll2) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_basic.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll2 = false
			} else {
				Object.keys(this.media_basic).forEach(j => {
					this.mediaCheckData.push(this.media_basic[j])
				})
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll2 = true
			}
		},
		mediaCheckAllChange2(data) {
			let dataAll = [...data].filter(item => this.media_basic.indexOf(item) > -1)
			if (dataAll.length === this.media_basic.length) {
				this.mediaAll2 = true
			} else {
				this.mediaAll2 = false
			}
		},
		// 流量表格的删除
		mediaClose (event, name) {
			const index = this.mediaCheckData.indexOf(name)
			this.mediaCheckData.splice(index, 1)
			this.mediaJudgeAll()
		},
		// 判断预算位的全选
		mediaJudgeAll() {
			this.mediaCheckData = [...new Set(this.mediaCheckData)]
			let dataAll1 = [...this.mediaCheckData].filter(item => this.media_info.indexOf(item) > -1)
			if (dataAll1.length === this.media_info.length) {
				this.mediaAll1 = true
			} else {
				this.mediaAll1 = false
			}
			let dataAll2 = [...this.mediaCheckData].filter(item => this.media_basic.indexOf(item) > -1)
			if (dataAll2.length === this.media_basic.length) {
				this.mediaAll2 = true
			} else {
				this.mediaAll2 = false
			}
		},
		// 转换成千分位，保留两位小数
		getNumberFloat(val) {
			if (val) {
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
			} else {
				return 0
			}
		},
		// 获取数据的同比值
		getProportion(curVal, preVal) {
			if (!!curVal && !!preVal && !isNaN(curVal)) {
				let result = Math.round(((curVal - preVal) / preVal) * 100)
				return Math.abs(result) < 1 ? 0 : result
			} else {
				return 0
			}
		},
		/**
		 * [getNumberInt 转换成千分位]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		getNumberInt(val) {
			if (val) {
				return parseInt(val).toLocaleString()
			} else {
				return 0
			}
		},
		/**
		 * [submitData 数据提交]
		 * @return {[type]} [description]
		 */
		submitData() {
			this.submitClock = true
			this.tableUpdate()
		},
		/**
		 * [tableUpdate 数据提交]
		 * @return {[type]} [description]
		 */
		tableUpdate() {
			let obj = {}
			if (this.column_active === 1) {
				obj.table_id = this.tableId
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				obj.select_str = this.mediaCheckData.toString()
				if (this.mediaCheckData.length === 0) {
					this.$Message.error('请选择对应的列')
					this.submitClock = false
					return false
				}
			}
			setTableHeadApi(obj).then(data => {
				this.submitClock = false
				this.getTableInfo()
				this.columnDrawer = false
			}, err => {
				this.submitClock = false
			})
		},


		/********************************************
		 *↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
		 ********************************************/
		/**
		 * [formartSceneAndStyle 广告位类型]
		 * @return {[type]} [description]
		 */
		/**
		 * [getTimeData 设置时间的默认值]
		 * @return {[type]} [description]
		 */
		getTimeData() {
			const end = new Date()
			const start = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
			this.search_time = [start, end]
			this.search.start_date = this.getLocalTime(start.getTime())
			this.search.end_date = this.getLocalTime(end.getTime())
		},
		/**
		 * [getLocalTime 本地时间]
		 * @param  {[type]} tt [description]
		 * @return {[type]}	[description]
		 */
		getLocalTime(tt) {
			let date = new Date(tt)
			let Y = date.getFullYear()
			let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
			let D = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()
			let data = Y + '-' + M + '-' + D
			return data
		},
		/**
		 * [filterByDate 时间范围]
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		filterByDate(e) {
			let start = new Date(e[0]).getTime()
			let end = new Date(e[1]).getTime()
			if (end - start > 2678400000) {
				this.$Message.error('选择日期不能超过31天')
				this.getTimeData()
			} else {
				this.search.start_date = e[0]
				this.search.end_date = e[1]
			}
		},
		/**
		 * [_getDspCompanyList 获取预算方公司数据]
		 * @return {[type]} [description]
		 */
		async _getDspCompanyList(action) {
			let storeUser = this.$store.state.user
			let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList()

			this.dspCompanyList = resArr
		},
		/**
		 * [formartSceneAndStyle 格式化广告场景和样式]
		 * @return {[type]} [description]
		 */
		formartSceneAndStyle() {
			let adStyleData = this.$store.state.app.adStyleData
			let adSceneData = this.$store.state.app.adSceneData

			adSceneData.map(item => {
				let children = []
				adStyleData.map(child => {
					if (child.parentId === item.id) {
						children.push({
							label: child.title,
							value: child.id
						})
					}
				})

				item['label'] = item.title
				item['children'] = children
			})

			this.adSceneData = adSceneData
		},

		/**
		 * [searchDspSlot 预算位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		searchDspSlot(query) {
			this.dspSlotLoad = true
			this.getDspSlotList(query)
		},
		/**
		 * [clearSearchDspSlot 清空预算位]
		 * @return {[type]} [description]
		 */
		clearSearchDspSlot(arr) {
			if (arr.length === 0) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [dspSlotQueryChange 预算位-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		dspSlotQueryChange(query) {
			if(!query) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [getDspSlotList 预算位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getDspSlotList: debounce(function(query) {
			let _params = {
				page_size: !!query ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getDspSlotList(_params).then(res => {
				this.dspSlotLoad = false
				if (res.code === 200) {
					this.dspSlotList = res.data.list

					if (!query) {
						this.catchDspSlotList = res.data.list
					}
				}
			})
		}, 1000)

		/********************************************
		 *↑↑↑↑↑↑↑↑↑ 以上部分为媒体和应用联动 end *↑↑↑↑↑↑
		 ********************************************/
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
/deep/ .ivu-drawer-header{
	padding-left 38px
}
</style>
