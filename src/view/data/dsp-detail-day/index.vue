<template>
	<Card :bordered="false" dis-hover class="page-main">
		<div class="page-title clearfix">
			<h2>预算位详细数据</h2>
			<div class="is-handler">
				<Button class="host" type="text" @click="columnDrawer = true">自定义列</Button>
				<Button v-if="_isShow_('download')" class="host" type="text" :loading="downClock" @click="downStatement">
					<i class="iconfont icon-download"></i>
					<span v-if="!downClock">下载报表</span>
					<span v-else>下载中...</span>
				</Button>
			</div>

			<!-- tab标签切换 -->
			<slot name="tab"></slot>
		</div>
		<div class="search-line" ref="search-line">
			<DatePicker
				class="i-margin-right-11 i-width-date mar-bot-10"
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
				placeholder="公司/账号名称/ID"
			>
				<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
			</Select>

			<Select
				class="i-margin-right-11 i-width-select i-select-remote"
				v-model="dsp_slot_id_select"
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

			<!-- 产品名称/ID -->
			<Select
				class="i-margin-right-11 i-width-select mar-bot-10"
				multiple
				filterable
				v-model="search.dsp_product_id_arr"
				placeholder="产品名称/ID"
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
			>
				<Option v-for="item in dspProductList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
			</Select>

			<!-- 广告位名称/ID -->
			<Select
				class="i-margin-right-11 i-width-select i-select-remote"
				v-model="ssp_slot_id_select"
				filterable
				clearable
				multiple
				:remote-method="searchSspSlot"
				:loading="sspSlotLoad"
				 @on-change="clearSearchSspSlot"
				:on-query-change="sspSlotQueryChange"
				:transfer="true"
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
				placeholder="广告位名称/ID"
			>
				<Option v-for="item in sspSlotList" :value="item.ssp_slot_id" :key="item.ssp_slot_id">{{item.ssp_slot_name}} (ID:{{item.ssp_slot_id}})</Option>
			</Select>

			<Select
				class="i-margin-right-11 i-width-select mar-bot-10"
				filterable
				v-model="search.dsp_slot_creative_type"
				placeholder="广告位类型"
				multiple
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
			>
				<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
					<Option v-for="child in item.children" :key="child.value" :value="child.value" >{{ child.label }}</Option>
				</OptionGroup>
			</Select>

			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_code_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算方广告位ID"/>

			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_id_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位ID"/>

			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_name_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位名称"/>

			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_id_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>

			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_name_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

			<Button type="primary" @click="doFilterList">查询</Button>
		</div>
		<div class="console-table data-table">
			<Table
				highlight-row
				stripe
				border
				:columns="columns1"
				:data="dayData"
				ref="tableExpand"
				:loading="tableLoadFlag"
				@on-sort-change="sortChange"
				show-summary
				sum-text="总计"
				:height="tableHeight"
				:summary-method="handleSummary"
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
					<p class="name-row-ellipsis" :title="row.dsp_company_name">{{ row.dsp_company_name }}</p>
					<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
				</template>
				<!--预算位/ID-->
				<template slot-scope="{ row }" slot="dsp_slot_name">
					<div class="control-flex">
						<div class="control-left">
							<p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
							<p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
						</div>
						<a v-if="row.dsp_company_id && row.dsp_slot_id" class="control-right" target="_blank" :href="`/dsp/slot/edit?slot_id=${row.dsp_slot_id}`">
							<Icon type="md-create"/>
							<div v-if="row.controlled > 0 && row.tag_ctrl > 0" class="control-img" title="控量+人群定向"><img src="~@/assets/image/kr.png"></div>
							<div v-else-if="row.controlled > 0 && row.tag_ctrl === 0" class="control-img" title="控量"><img src="~@/assets/image/k.png"></div>
							<div v-else-if="row.controlled === 0 && row.tag_ctrl > 0" class="control-img" title="人群定向"><img src="~@/assets/image/r.png"></div>
						</a>
					</div>
				</template>

				<!--预算位素材尺寸比例-->
				<template slot-scope="{ row }" slot="dsp_slot_ratio">
					<p v-if="row.dsp_slot_ratio && mediaCheckData.indexOf('预算位名称') >= 0 " class="table_text">{{ row.dsp_slot_ratio }}</p>
					<p v-else class="table_text">-</p>
				</template>

				<!-- 产品名称 -->
				<template slot-scope="{ row }" slot="dsp_product_name">
					<p class="table_text">{{ row.dsp_product_name || '-' }}</p>
				</template>

				<!--预算方广告位ID-->
				<template slot-scope="{ row }" slot="dsp_slot_code">
					<p class="table_text">{{ row.dsp_slot_code }}</p>
				</template>
				<!--媒体简称/ID-->
				<template slot-scope="{ row }" slot="company_short_name">
					<p class="name-row-ellipsis" :title="row.ssp_company_short_name">{{ row.ssp_company_short_name }}</p>
					<p class="tip-row-line">ID: {{ row.ud_id }}</p>
				</template>
				<!--应用名称/ID-->
				<template slot-scope="{ row }" slot="app_name">
					<p class="name-row-ellipsis" :title="row.app_name">{{ row.app_name }}</p>
					<p class="tip-row-line">ID: {{ row.app_id }}</p>
				</template>
				<!--应用平台-->
				<template slot-scope="{ row }" slot="app_os_type">
					<p class="table_text" v-if="row.app_os_type === 0">不限</p>
					<p class="table_text" v-if="row.app_os_type === 1">Android</p>
					<p class="table_text" v-if="row.app_os_type === 2">IOS</p>
				</template>
				<!--广告位名称/ID-->
				<template slot-scope="{ row }" slot="ssp_slot_name">
					<div class="control-flex">
						<div class="control-left">
							<p v-if="row.ssp_slot_name" class="name-row-ellipsis" :title="row.ssp_slot_name">{{ row.ssp_slot_name }}</p>
							<p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
						</div>
						<a v-if="row.app_id && row.ssp_slot_id" class="control-right" target="_blank" :href="'/ssp/ad/config/' + row.ssp_slot_id">
							<Icon type="md-create"/>
						</a>
					</div>
				</template>
				<!--广告位素材尺寸比例-->
				<template slot-scope="{ row }" slot="ssp_slot_ratio">
					<p v-if="row.ssp_slot_ratio && mediaCheckData.indexOf('广告位名称') >= 0 " class="table_text">{{ row.ssp_slot_ratio }}</p>
					<p v-else class="table_text">-</p>
				</template>

				<!--广告样式-->
				<template slot-scope="{ row }" slot="ad_type">
					<p class="table_text">{{adTypeText(row.dsp_slot_ad_type_id)}}-{{creativeIdText(row.dsp_slot_creative_type)}}</p>
				</template>
				<!--有效广告请求pv-->
				<template slot-scope="{ row }" slot="req_pv">
					<p class="data_value">{{getNumberInt(row.req_pv)}}</p>
				</template>
				<!--有效广告请求uv-->
				<template slot-scope="{ row }" slot="req_uv">
					<p class="data_value">{{getNumberInt(row.req_uv)}}</p>
				</template>
				<!--广告返回pv-->
				<template slot-scope="{ row }" slot="ret_pv">
					<p class="data_value">{{getNumberInt(row.ret_pv)}}</p>
				</template>
				<!--广告返回uv-->
				<template slot-scope="{ row }" slot="ret_uv">
					<p class="data_value">{{getNumberInt(row.ret_uv)}}</p>
				</template>
				<!--广告展现pv-->
				<template slot-scope="{ row }" slot="show_pv">
					<p class="data_value">{{getNumberInt(row.show_pv)}}</p>
				</template>
				<!--广告展现uv-->
				<template slot-scope="{ row }" slot="show_uv">
					<p class="data_value">{{getNumberInt(row.show_uv)}}</p>
				</template>
				<!--  广告点击pv-->
				<template slot-scope="{ row }" slot="click_pv">
					<p class="data_value">{{getNumberInt(row.click_pv)}}</p>
				</template>
				<!--广告点击uv-->
				<template slot-scope="{ row }" slot="click_uv">
					<p class="data_value">{{getNumberInt(row.click_uv)}}</p>
				</template>
				<!--加群点击率-->
				<template slot-scope="{ row }" slot="jc_pv">
					<p class="data_value">{{getNumberInt(row.jc_pv)}}</p>
				</template>
				<!--调起数-->
				<template slot-scope="{ row }" slot="dplsucc_pv">
					<p class="data_value">{{getNumberInt(row.dplsucc_pv)}}</p>
				</template>
				<!--下载完成量-->
				<template slot-scope="{ row }" slot="complete_pv">
					<p class="data_value">{{getNumberInt(row.complete_pv)}}</p>
				</template>
				<!--安装量-->
				<template slot-scope="{ row }" slot="install_pv">
					<p class="data_value">{{getNumberInt(row.install_pv)}}</p>
				</template>
				<!--激活量-->
				<template slot-scope="{ row }" slot="activate_pv">
					<p class="data_value">{{getNumberInt(row.activate_pv)}}</p>
				</template>
				<!--填充率-->
				<template slot-scope="{ row }" slot="fill_rates">
					<p class="data_value">{{getNumberFloat(row.fill_rates)}}%</p>
				</template>
				<!--展现率-->
				<template slot-scope="{ row }" slot="show_rates">
					<p class="data_value">{{getNumberFloat(row.show_rates)}}%</p>
				</template>
				<!--点击率-->
				<template slot-scope="{ row }" slot="ctr">
					<p class="data_value">{{getNumberFloat(row.ctr)}}%</p>
				</template>
				<!--调起率-->
				<template slot-scope="{ row }" slot="dplsucc_rates">
					<p class="data_value">{{getNumberFloat(row.dplsucc_rates)}}%</p>
				</template>
				<!--下载完成率-->
				<template slot-scope="{ row }" slot="complete_rates">
					<p class="data_value">{{getNumberFloat(row.complete_rates)}}%</p>
				</template>
				<!--安装率-->
				<template slot-scope="{ row }" slot="install_rates">
					<p class="data_value">{{getNumberFloat(row.install_rates)}}%</p>
				</template>
				<!--激活率-->
				<template slot-scope="{ row }" slot="activate_rates">
					<p class="data_value">{{getNumberFloat(row.activate_rates)}}%</p>
				</template>
				<!--eCPM-->
				<template slot-scope="{ row }" slot="ecpm">
					<p class="data_value">{{getNumberFloat(row.ecpm)}}</p>
				</template>
				<!--CPC-->
				<template slot-scope="{ row }" slot="cpc">
					<p class="data_value">{{getNumberFloat(row.cpc)}}</p>
				</template>
				<!--媒体eCPM-->
				<template slot-scope="{ row }" slot="ssp_ecpm">
					<p class="data_value">{{getNumberFloat(row.ssp_ecpm)}}</p>
				</template>
				<!--媒体CPC-->
				<template slot-scope="{ row }" slot="ssp_cpc">
					<p class="data_value">{{getNumberFloat(row.ssp_cpc)}}</p>
				</template>
				<!--收益-->
				<template slot-scope="{ row }" slot="income">
					<p class="data_value">{{getNumberFloat(row.income)}}</p>
				</template>
				<!--成本-->
				<template slot-scope="{ row }" slot="spend">
					<p class="data_value">{{getNumberFloat(row.spend)}}</p>
				</template>
				<!--利润-->
				<template slot-scope="{ row }" slot="profits">
					<p class="data_value">{{getNumberFloat(row.profits)}}</p>
				</template>
				<!--利润率-->
				<template slot-scope="{ row }" slot="profits_rates">
					<p class="data_value">{{getNumberFloat(row.profits_rates)}}%</p>
				</template>
			</Table>
			<div class="page-center">
				<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
			</div>
		</div>
		<Drawer v-model="columnDrawer" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<div class="column_content">
				<div class="col_detail">
					<div class="media_table">
						<Row>
							<Col :span="16">
								<div class="col_title">可选择列</div>
								<div class="optional_detail">
									<div class="checkout_content" v-show="media_info.length>0">
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
									<div class="checkout_content" v-show="media_basic.length>0">
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
									<div class="checkout_content" v-show="media_effect.length>0">
										<div class="check_title">
											<Checkbox
												:value="mediaAll3"
												@click.prevent.native="mediaCheckAll3">效果指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange3">
											<Checkbox class="option_check" v-for="item in media_effect" :key="'效果指标'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="media_income.length>0">
										<div class="check_title">
											<Checkbox
												:value="mediaAll4"
												@click.prevent.native="mediaCheckAll4">收益指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange4">
											<Checkbox class="option_check" v-for="item in media_income" :key="'收益指标'+item" :label="item">
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
				<Button type="primary" :loading="submitClock" @click="submitData()">
					<span v-if="!submitClock">提交</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
	</Card>
</template>

<script>
import { filterBatchQuery } from '@/libs/util'
import { getDownLoadXls, setTableHeadApi, tableInfoApi, setTablePageApi } from '@/api/common'
import { debounce, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import { getDspSlotList, getDspProductList } from '@/api/dsp'
import { getDspDetailDayData, getDspDetailDayDataUrl } from '@/api/data'
import { getSspSlotAdList } from '@/api/ssp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { mapActions } from 'vuex'

export default {
	name: 'dsp-detail-day',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			dspTableId: 13,
			dspCompanyList: [],
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				paddingTop: '0px',
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
			dsp_slot_id_select: [], // 预算位的选择
			ssp_slot_id_select: [], // 广告位的选择
			search: {
				start_date: null, // 开始时间
				end_date: null, // 结束时间
				dsp_company_id: [], // 公司账户
				dsp_slot_creative_type: [], // 广告位类型
				dsp_slot_id: [], // 预算位名称
				dsp_product_id_arr: [], // 产品名称

				order: null, // 排序
				group: [], // 聚合的内容
				ssp_slot_id: [], // 广告位ID
				dsp_slot_code: [], // 预算方广告位ID
				dsp_slot_name: [], // 预算位名称
				ssp_slot_name: [] // 广告位名称
			}, // 查询的内容
			filterSearch: {
				dsp_slot_code_textarea: null, // 预算方广告位ID
				dsp_slot_id_textarea: null, // 预算位ID
				dsp_slot_name_textarea: null, // 预算位名称
				ssp_slot_id_textarea: null, // 广告位ID
				ssp_slot_name_textarea: null // 广告位名称
			},

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中

			dspProductList: [], // 产品列表

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
			mediaAll3: false,
			mediaAll4: false, // app_os_typ
			media_info: ['公司/账号名称', '预算位名称', '预算位素材尺寸比例', '预算方广告位ID', '产品名称', '广告位类型', '广告位名称', '广告位素材尺寸比例', '应用名称', '应用平台', '媒体简称'],
			media_basic: ['有效广告请求pv', '有效广告请求uv', '广告返回pv', '广告返回uv',
				'广告展现pv', '广告展现uv', '广告点击pv', '广告点击uv', '加群点击数', '调起数', '下载完成量', '安装量', '激活量'
			],
			media_effect: ['填充率', '展现率', '点击率', '调起率', '下载完成率', '安装率', '激活率', 'CPM', 'CPC', '媒体eCPM', '媒体CPC'],
			media_income: ['收益', '成本', '利润', '利润率'],
			mediaCheckData: ['预算位名称', '广告位类型', '广告展现pv', '广告展现uv', '广告点击pv', '广告点击uv', '点击率', 'CPM', 'CPC', '收益', '成本', '利润'],
			columns1: [],
			columns2: [],
			dayData: [],
			sumData: {},
			hourDataList: [],
			budgetArr: [],
			downClock: false // 下载报表的loading
		}
	},
	computed: {
		adSceneData() { // 广告位类型 - 格式化
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
			return adSceneData
		}
	},
	created() {
		if (this._hasPageAccess()) {

			if (!this.$store.getters.getUserAllFields) {
				this.getReportTitle()
			}

			this.getTableInfo()
			this.initLinkage() // 初始化联动
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true}) // search-line的高度
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
			this.getTimeData()
			this._getDspCompanyList() // 预算方-公司名称
			this.getDspSlotList() // 预算方-预算位
			this.getSspSlotList() // 广告位列表
			this.getDspProductList() // 产品列表
		},
		// 报表权限的设置
		getReportTitle() {
			let budgetFields = this.$store.getters.getUserDspFields
			let budgetList = this.$store.state.app.budgetDataList
			let budgetArr = budgetList.filter(item => {
				return budgetFields.includes(item.key)
			}).map((item, index) => {
				return item.label
			})
			this.budgetArr = budgetArr
			this.media_basic = this.media_basic.filter(item => budgetArr.indexOf(item) > -1)
			this.media_effect = this.media_effect.filter(item => budgetArr.indexOf(item) > -1)
			this.media_income = this.media_income.filter(item => budgetArr.indexOf(item) > -1)
			let allFlow = budgetArr.concat(this.media_info)
			this.mediaCheckData = this.mediaCheckData.filter(item => allFlow.indexOf(item) > -1)
		},
		handleSummary({ columns, data }) {
			const sums = {}
			columns.forEach((column, index) => {
				let key = column.slot
				if (key === 'date') {
					sums[key] = {
						key,
						value: '合计'
					}
					return
				}
				if (!column.noNeedCalcThou) {
					if (column.title.indexOf('率') > -1) {
						sums[key] = {
							key,
							value: this.number2Thousand(this.sumData[key]) + '%'
						}
					} else {
						sums[key] = {
							key,
							value: this.number2Thousand(this.sumData[key])
						}
					}
				} else {
					sums[key] = {
						key,
						value: '-'
					}
				}
			})
			return sums
		},
		getDayData() {
			let _filter = this.search

			let params = {
				...this.getAxiosParams(),
				...{
					start_date: _filter.start_date,
					end_date: _filter.end_date,
					order: _filter.order,
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}
			getDspDetailDayData(params).then(res => {
				let date = res.data
				if (res.code === 200) {
					this.tableLoadFlag = false
					this.total_count = date.total
					this.dayData = date.list
					this.sumData = date.statistic
				}
				// eslint-disable-next-line handle-callback-err
			}, error => {
				this.tableLoadFlag = false
			})
		},
		// 表格的排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.search.order = col.column.slot
				this.currentPage = 1
				this.getDayData()
			} else if (col.order === 'desc') {
				this.search.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.getDayData()
			}
		},
		// 获取自定义列的数据
		getTableInfo() {
			tableInfoApi().then(res => {
				let data = res.data
				if (res.code === 200) {

					let dspKey = data[`table_head_head_${this.dspTableId}`]
					this.pageSize = data[`table_page_page_${this.dspTableId}`] || 10

					if (dspKey) {
						if (!this.$store.getters.getUserAllFields) {
							let selectBudget = dspKey.split(',')
							let allBudget = this.budgetArr.concat(this.media_info)
							this.mediaCheckData = selectBudget.filter(item => allBudget.indexOf(item) > -1)
						} else {
							this.mediaCheckData = dspKey.split(',')
						}
						this.mediaJudgeAll()
					}

					this.getTable1Columns()
					this.getDayData()
				}
			})
		},

		// 获取广告场景
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		// 获取广告样式
		creativeIdText(id) {
			let _arr = this.$store.state.app.adStyleData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		// 查询
		doFilterList() {
			let _filter = this.filterSearch
			// 此处有容处理
			// 广告位ID查询
			// 1. 广告位Id多选和单选，最后统一按照 ssp_slot_id 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_select 两个筛选条件）
			let textSplitArr_ssp = filterBatchQuery({
				value: _filter.ssp_slot_id_textarea,
				type: 'number'
			})
			this.search.ssp_slot_id = Array.from(new Set([...textSplitArr_ssp, ...this.ssp_slot_id_select]))

			// 同理上面的逻辑，处理预算位ID
			let textSplitArr_dsp = filterBatchQuery({
				value: _filter.dsp_slot_id_textarea,
				type: 'number'
			})
			this.search.dsp_slot_id = Array.from(new Set([...textSplitArr_dsp, ...this.dsp_slot_id_select]))

			// 预算位名称
			this.search.dsp_slot_name = filterBatchQuery({
				value: _filter.dsp_slot_name_textarea
			})

			// 广告位名称
			this.search.ssp_slot_name = filterBatchQuery({
				value: _filter.ssp_slot_name_textarea
			})

			// 预算方广告位ID
			this.search.dsp_slot_code = filterBatchQuery({
				value: _filter.dsp_slot_code_textarea
			})

			this.currentPage = 1
			this.getDayData()
		},
		/**
		 * [getAxiosParams 获取下载和列表的url参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.search

			let params = {}

			// 预算方公司ID
			!!_filter.dsp_company_id.length && (params.dsp_company_id = _filter.dsp_company_id)

			// 预算位名称/ID
			!!_filter.dsp_slot_id.length && (params.dsp_slot_id = _filter.dsp_slot_id)

			// 预算位广告类型ID
			!!_filter.dsp_slot_creative_type.length && (params.dsp_slot_creative_type = _filter.dsp_slot_creative_type)

			// 产品Id
			!!_filter.dsp_product_id_arr.length && (params.dsp_product_id_arr = _filter.dsp_product_id_arr)

			// 预算方广告位ID
			!!_filter.dsp_slot_code.length && (params.dsp_slot_code = _filter.dsp_slot_code)

			// 广告位ID
			!!_filter.ssp_slot_id.length && (params.ssp_slot_id = _filter.ssp_slot_id)

			// 广告位名称
			!!_filter.ssp_slot_name.length && (params.ssp_slot_name = _filter.ssp_slot_name)

			// 预算方名称
			!!_filter.dsp_slot_name.length && (params.dsp_slot_name = _filter.dsp_slot_name)

			return params
		},
		/**
		 * [downStatement 下载报表]
		 * @return {[type]} [description]
		 */
		downStatement() {
			this.downClock = true

			let params = {
				...this.getAxiosParams(),
				...{
					order: this.search.order,
					page_size: this.total_count,
					page_num: 1,
					start_date: this.search.start_date,
					end_date: this.search.end_date
				}
			}

			let down = {
				url: getDspDetailDayDataUrl(params),
				method: 'GET'
			}

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = `${this.search.start_date}～${this.search.end_date}预算位详细数据.xlsx`
					createObjectURL(res.data.url, filename)
				}
				this.downClock = false
			}, err=> {
				this.downClock = false
			})
		},
		/**
		 * [filterByDate 查询]
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
		 * [changePage 页面发生变化]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getDayData()
		},
		/**
		 * [sizeChange size变化]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.currentPage = 1
			this.tablePageUpdate(size)
		},
		/**
		 * [tablePageUpdate description]
		 * @param  {[type]} size页码的保存description]
		 * @return {[type]}      [description]
		 */
		tablePageUpdate(size) {
			setTablePageApi({table_id: this.dspTableId, page_num: size}).then(data => {
				this.getDayData()
			})
		},
		/**
		 * [getTable1Columns 设置数据表格的列]
		 * @return {[type]} [description]
		 */
		getTable1Columns () {
			const ColumnList = [
				{title: '#', width: 36, key:'index', slot:'index', align: 'center', noNeedCalcThou: true},
				{title: '日期', key: 'date', slot: 'date', width: 80, minWidth: 80, sortable: 'custom'},
				{title: '公司/账号名称', key: 'company_name', header: '公司(账号)名称/ID', slot: 'company_name', minWidth: 150, noNeedCalcThou: true},
				{title: '产品名称', key: 'dsp_product_name', slot: 'dsp_product_name', minWidth: 180, noNeedCalcThou: true},
				{title: '预算位名称', key: 'dsp_slot_name', header: '预算位名称/ID', slot: 'dsp_slot_name', width: 200, noNeedCalcThou: true},
				{title: '预算位素材尺寸比例', key: 'dsp_slot_ratio', slot: 'dsp_slot_ratio', minWidth: 140, noNeedCalcThou: true},
				{title: '预算方广告位ID', key: 'dsp_slot_code', slot: 'dsp_slot_code', minWidth: 230, noNeedCalcThou: true},
				{title: '广告位类型', key: 'ad_type', slot: 'ad_type', minWidth: 200, noNeedCalcThou: true},
				{title: '广告位名称', key: 'ssp_slot_name', header: '广告位名称/ID', slot: 'ssp_slot_name', minWidth: 200, noNeedCalcThou: true},
				{title: '广告位素材尺寸比例', key: 'ssp_slot_ratio', slot: 'ssp_slot_ratio', minWidth: 140, noNeedCalcThou: true},
				{title: '应用名称', key: 'app_name', header: '应用名称/ID', slot: 'app_name', minWidth: 180, noNeedCalcThou: true},
				{title: '应用平台', key: 'app_os_type', slot: 'app_os_type', width: 80, noNeedCalcThou: true},
				{title: '媒体简称', key: 'company_short_name', header: '媒体简称/ID', slot: 'company_short_name', minWidth: 180, noNeedCalcThou: true},
				{title: '有效广告请求pv', key: 'req_pv', slot: 'req_pv', minWidth: 130, sortable: 'custom'},
				{title: '有效广告请求uv', key: 'req_uv', slot: 'req_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回pv', key: 'ret_pv', slot: 'ret_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回uv', key: 'ret_uv', slot: 'ret_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现pv', key: 'show_pv', slot: 'show_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现uv', key: 'show_uv', slot: 'show_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击pv', key: 'click_pv', slot: 'click_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击uv', key: 'click_uv', slot: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', key: 'jc_pv', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', key: 'dplsucc_pv', slot: 'dplsucc_pv', minWidth: 100, sortable: 'custom'},
				{title: '下载完成量', key: 'complete_pv', slot: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', key: 'install_pv', slot: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', key: 'activate_pv', slot: 'activate_pv', minWidth: 130, sortable: 'custom'},
				{title: '填充率', key: 'fill_rates', slot: 'fill_rates', minWidth: 100, sortable: 'custom'},
				{title: '展现率', key: 'show_rates', slot: 'show_rates', minWidth: 100, sortable: 'custom'},
				{title: '点击率', key: 'ctr', slot: 'ctr', minWidth: 100, sortable: 'custom'},
				{title: '调起率', key: 'dplsucc_rates', slot: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
				{title: '下载完成率', key: 'complete_rates', slot: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', key: 'install_rates', slot: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', key: 'activate_rates', slot: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: 'CPM', key: 'ecpm', slot: 'ecpm', minWidth: 90, sortable: 'custom'},
				{title: 'CPC', key: 'cpc', slot: 'cpc', minWidth: 90, sortable: 'custom'},
				{title: '媒体eCPM', key: 'ssp_ecpm', slot: 'ssp_ecpm', minWidth: 100, sortable: 'custom'},
				{title: '媒体CPC', key: 'ssp_cpc', slot: 'ssp_cpc', minWidth: 90, sortable: 'custom'},
				{title: '收益', key: 'income', slot: 'income', minWidth: 100, sortable: 'custom'},
				{title: '成本', key: 'spend', slot: 'spend', minWidth: 90, sortable: 'custom'},
				{title: '利润', key: 'profits', slot: 'profits', minWidth: 90, sortable: 'custom'},
				{title: '利润率', key: 'profits_rates', slot: 'profits_rates', minWidth: 100, sortable: 'custom'}
			]

			// 筛选表格
			let resultArr = []
			let extraMust = ['date', 'index'] // 额外必须存在的字段

			ColumnList.map(item => {
				if(extraMust.includes(item.slot) || this.mediaCheckData.indexOf(item.title) >= 0) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})
			this.columns1 = resultArr
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText(count) {
			return `+${count}`
		},
		// 设置时间的默认值
		getTimeData() {
			let curTime = new Date()
			let endTime = formatDate(curTime, 'yyyy-MM-dd')
			let startTime = formatDate(curTime.getTime() - 3600 * 1000 * 24 * 7, 'yyyy-MM-dd')

			this.search_time = [startTime, endTime]
			this.search.end_date = endTime
			this.search.start_date = startTime
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
		// 效果指标的筛选
		mediaCheckAll3() {
			if (this.mediaAll3) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_effect.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll3 = false
			} else {
				Object.keys(this.media_effect).forEach(j => {
					this.mediaCheckData.push(this.media_effect[j])
				})
				this.mediaAll3 = true
			}
		},
		mediaCheckAllChange3(data) {
			let dataAll = [...data].filter(item => this.media_effect.indexOf(item) > -1)
			if (dataAll.length === this.media_effect.length) {
				this.mediaAll3 = true
			} else {
				this.mediaAll3 = false
			}
		},
		// 收益指标的筛选
		mediaCheckAll4() {
			if (this.mediaAll4) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_income.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll4 = false
			} else {
				Object.keys(this.media_income).forEach(j => {
					this.mediaCheckData.push(this.media_income[j])
				})
				this.mediaAll4 = true
			}
		},
		mediaCheckAllChange4(data) {
			let dataAll = [...data].filter(item => this.media_income.indexOf(item) > -1)
			if (dataAll.length === this.media_income.length) {
				this.mediaAll4 = true
			} else {
				this.mediaAll4 = false
			}
		},
		// 流量表格的删除
		mediaClose(event, name) {
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
			let dataAll3 = [...this.mediaCheckData].filter(item => this.media_effect.indexOf(item) > -1)
			if (dataAll3.length === this.media_effect.length) {
				this.mediaAll3 = true
			} else {
				this.mediaAll3 = false
			}
			let dataAll4 = [...this.mediaCheckData].filter(item => this.media_income.indexOf(item) > -1)
			if (dataAll4.length === this.media_income.length) {
				this.mediaAll4 = true
			} else {
				this.mediaAll4 = false
			}
		},
		number2Thousand(number) {
			return number2Thousand(number)
		},
		// 转换成千分位，保留两位小数
		getNumberFloat(val) {
			if (val) {
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
			} else {
				return 0
			}
		},
		// 转换成千分位
		getNumberInt(val) {
			if (val) {
				return parseInt(val).toLocaleString()
			} else {
				return 0
			}
		},
		submitData() {
			this.submitClock = true
			if (this.mediaCheckData.length === 0) {
				this.$Message.error('请选择对应的列')
				this.submitClock = false
				return false
			}
			this.tableMediaUpdate()
		},
		tableMediaUpdate() {
			let obj = {
				table_id: this.dspTableId
			}
			this.mediaCheckData = [...new Set(this.mediaCheckData)]
			obj.select_str = this.mediaCheckData.toString()
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
		 * [_getDspCompanyList 获取预算方公司数据]
		 * @return {[type]} [description]
		 */
		async _getDspCompanyList(action) {
			let storeUser = this.$store.state.user
			let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList()
			this.dspCompanyList = resArr
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
			if (!query) {
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
				dsp_company_id: this.search.dsp_company_id,
				page_size: (!!query || this.search.dsp_company_id.length) ? 10000 : 10,
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
		}, 1000),
		/**
		 * [searchSspSlot 广告位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		searchSspSlot(query) {
			this.sspSlotLoad = true
			this.getSspSlotList(query)
		},
		/**
		 * [clearSearchSspSlot 清空广告位]
		 * @return {[type]} [description]
		 */
		clearSearchSspSlot(arr) {
			if (arr.length === 0) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
		},
		/**
		 * [sspSlotQueryChange 广告位-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		sspSlotQueryChange(query) {
			if (!query) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
		},
		/**
		 * [getSspSlotList 广告位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getSspSlotList: debounce(function(query) {
			let _params = {
				page_size: !!query ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getSspSlotAdList(_params).then(res => {
				this.sspSlotLoad = false
				if (res.code === 200) {
					this.sspSlotList = res.data.list

					if (!query) {
						this.catchSspSlotList = res.data.list
					}
				}
			})
		}, 1000),
		/**
		 * [getDspProductList 获取产品列表]
		 * @return {[type]} [description]
		 */
		getDspProductList() {
			getDspProductList().then(res => {
				if(res.code === 200) {
					this.dspProductList = res.data.list || []
				}
			})
		}
		/********************************************
		*↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		********************************************/
	},
	watch: {
		/**
		 * 选择预算方
		 */
		'search.dsp_company_id': {
			handler: function(val) {
				this.getDspSlotList()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
.console-table
	margin-top: 5px
/deep/ .data-table {
	.ivu-table-tbody {
		tr:last-child {
			td {
				border-bottom 1px solid #e8eaec
			}
		}
	}
}
/deep/ .ivu-drawer-header{
	padding-left 38px
}
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
/deep/ textarea.ivu-input{
	height 32px
}

</style>
