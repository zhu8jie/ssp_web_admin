<!-- by 李想 -->
<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>预算位详细数据</h2>
				<div class="is-handler">
					<Button class="host" type="text" @click="drawerModalFlag = true">自定义列</Button>
			  		<Button v-if="_isShow_('download')" class="host" type="text" :loading="submitClock" @click="downStatement">
						<i class="iconfont icon-download"></i>
						<span v-if="!submitClock">下载报表</span>
						<span v-else>下载中...</span>
					</Button>
				</div>

				<!-- tab标签切换 -->
				<slot name="tab"></slot>
			</div>
			<div class="search-line" ref="search-line">
				<DatePicker
					class="i-margin-right-11 i-width-time mar-bot-10"
					:clearable="false"
					type="date"
					:options="datePickerOptions"
					format="yyyy-MM-dd"
					:transfer="true"
					placeholder="请选择日期"
					:value="datePickerTime"
					@on-change="datePickerChange"
				/>

				<TimePicker :steps="[1, 60, 60]" placeholder="全部时间" format="HH:mm" class="i-margin-right-11 i-width-status" @on-change="timeChange"></TimePicker>

			  	<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.dsp_company_id"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="公司/账号名称/ID"
				>
					<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.dsp_slot_id_select"
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
					v-model="filterSearch.dsp_product_id_arr"
					placeholder="产品名称/ID"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<Option v-for="item in dspProductList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
				</Select>

				<!-- 广告位名称 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.ssp_slot_id_select"
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
					v-model="filterSearch.dsp_slot_creative_type"
					placeholder="广告位类型"
					multiple
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
						<Option v-for="child in item.children" :key="child.value" :value="child.value">{{child.label}}</Option>
					</OptionGroup>
				</Select>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_code_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算方广告位ID"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_id_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位ID"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_name_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位名称"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_id_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_name_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<div class="data-table console-table">
				<Table
					highlight-row
					stripe
					border
					:loading="tableLoadFlag"
					:columns="tableColList"
					:data="colDatList"
					@on-sort-change="sortChange"
					show-summary
					:summary-method="handleSummary"
					:height="tableHeight"
				>
					<!-- # index-->
					<template slot-scope="{ row, index }" slot="index">
						{{index + 1}}
					</template>
					<!-- 数据维度 start ******************-->
					<!-- 时间-->
					<template slot-scope="{ row }" slot="date">
						<p class="table_text">{{ row.date.substring(11, 19) }}</p>
					</template>
					<!--公司/账号名称 -->
					<template slot-scope="{ row }" slot="dsp_company_id">
						<p v-if="row.dsp_company_name" class="name-row-ellipsis" :title="row.dsp_company_name">{{ row.dsp_company_name }}</p>
						<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
					</template>
					<!--预算位名称/ID -->
					<template slot-scope="{ row }" slot="dsp_slot_name">
						<div class="control-flex">
							<div class="control-left">
								<p v-if="row.dsp_slot_name" class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
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
					<!-- 预算位素材尺寸比例 -->
					<template slot-scope="{ row }" slot="dsp_slot_ratio">
						<p class="table_text">{{row.dsp_slot_ratio}}</p>
					</template>

					<!-- 产品名称 -->
					<template slot-scope="{ row }" slot="dsp_product_name">
						<p class="table_text">{{ row.dsp_product_name || '-' }}</p>
					</template>

					<!--预算方广告位ID-->
					<template slot-scope="{ row }" slot="dsp_slot_code">
						<p class="text-row-ellipsis" :title="row.dsp_slot_code">{{ row.dsp_slot_code }}</p>
					</template>
					<!--广告位类型-->
					<template slot-scope="{ row }" slot="ad_type">
						<p class="table_text">{{adTypeText(row.dsp_slot_ad_type_id)}}-{{creativeIdText(row.dsp_slot_creative_type)}}</p>
					</template>
					<!--广告位名称/ID-->
					<template slot-scope="{ row }" slot="ssp_slot_name">
						<div class="control-flex">
							<div class="control-left">
								<p v-if="row.ssp_slot_name" class="name-row-ellipsis" :title="row.ssp_slot_name">{{ row.ssp_slot_name }}</p>
								<p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
							</div>
							<a class="control-right" target="_blank" :href="'/ssp/ad/config/' + row.ssp_slot_id">
								<Icon type="md-create"/>
							</a>
						</div>
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
					<!-- 广告位素材尺寸比例 -->
					<template slot-scope="{ row }" slot="ssp_slot_ratio">
						<p class="table_text">{{row.ssp_slot_ratio}}</p>
					</template>

					<!-- 数据维度 end   -------------------->

					<!-- 基本指标 start ******************-->
					<!--有效广告请求pv-->
					<template slot-scope="{ row }" slot="req_pv">
						<p class="table_text">{{row.req_pv}}</p>
					</template>
					<!--有效广告请求uv-->
					<template slot-scope="{ row }" slot="req_uv">
						<p class="table_text">{{row.req_uv}}</p>
					</template>
					<!--广告返回pv-->
					<template slot-scope="{ row }" slot="ret_pv">
						<p class="table_text">{{row.ret_pv}}</p>
					</template>
					<!--广告返回uv-->
					<template slot-scope="{ row }" slot="ret_uv">
						<p class="table_text">{{row.ret_uv}}</p>
					</template>
					<!--广告展现pv-->
					<template slot-scope="{ row }" slot="show_pv">
						<p class="table_text">{{row.show_pv}}</p>
					</template>
					<!--广告展现uv-->
					<template slot-scope="{ row }" slot="show_uv">
						<p class="table_text">{{row.show_uv}}</p>
					</template>
					<!--广告点击pv-->
					<template slot-scope="{ row }" slot="click_pv">
						<p class="table_text">{{row.click_pv}}</p>
					</template>
					<!--广告点击uv-->
					<template slot-scope="{ row }" slot="click_uv">
						<p class="table_text">{{row.click_uv}}</p>
					</template>
					<!--加群点击数-->
					<template slot-scope="{ row }" slot="jc_pv">
						<p class="table_text">{{row.jc_pv}}</p>
					</template>
					<!--调起数-->
					<template slot-scope="{ row }" slot="dplsucc_pv">
						<p class="table_text">{{row.dplsucc_pv}}</p>
					</template>
					<!-- 下载完成量 -->
					<template slot-scope="{ row }" slot="complete_pv">
						<p class="table_text">{{row.complete_pv}}</p>
					</template>
					<!-- 安装量 -->
					<template slot-scope="{ row }" slot="install_pv">
						<p class="table_text">{{row.install_pv}}</p>
					</template>
					<!-- 激活量 -->
					<template slot-scope="{ row }" slot="activate_pv">
						<p class="table_text">{{row.activate_pv}}</p>
					</template>
					<!-- 基本指标 end ------------------------>

					<!-- 效果指标 start ******************* -->
					<!-- 填充率 -->
					<template slot-scope="{ row }" slot="fill_rates">
						<p class="table_text">{{row.fill_rates}}%</p>
					</template>
					<!-- 展现率 -->
					<template slot-scope="{ row }" slot="show_rates">
						<p class="table_text">{{row.show_rates}}%</p>
					</template>
					<!-- 点击率 -->
					<template slot-scope="{ row }" slot="ctr">
						<p class="table_text">{{row.ctr}}%</p>
					</template>
					<!-- 调起率 -->
					<template slot-scope="{ row }" slot="dplsucc_rates">
						<p class="table_text">{{row.dplsucc_rates}}%</p>
					</template>
					<!-- 下载完成率 -->
					<template slot-scope="{ row }" slot="complete_rates">
						<p class="table_text">{{row.complete_rates}}%</p>
					</template>
					<!-- 安装率 -->
					<template slot-scope="{ row }" slot="install_rates">
						<p class="table_text">{{row.install_rates}}%</p>
					</template>
					<!-- 激活率 -->
					<template slot-scope="{ row }" slot="activate_rates">
						<p class="table_text">{{row.activate_rates}}%</p>
					</template>
					<!-- 媒体eCPM -->
					<template slot-scope="{ row }" slot="ssp_ecpm">
						<p class="table_text">{{row.ssp_ecpm}}</p>
					</template>
					<!-- 媒体CPC -->
					<template slot-scope="{ row }" slot="ssp_cpc">
						<p class="table_text">{{row.ssp_cpc}}</p>
					</template>
					<!-- 效果指标 end ------------------------>

					<!-- 收益指标 start -------------------------->
					<!-- 成本 -->
					<template slot-scope="{ row }" slot="spend">
						<p class="table_text">{{row.spend}}</p>
					</template>
					<!-- 收益指标 end -------------------------->
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
			<Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
				<div class="column_content">
					<div class="col_detail">
						<div class="media_table">
							<Row>
								<Col :span="16">
									<div class="col_title">可选择列</div>
									<div class="optional_detail">
										<!-- 流量-数据维度 -->
										<div class="checkout_content">
											<div class="check_title">
												<Checkbox
													:value="ssp_data_isAll"
													@click.prevent.native="sspDataSelectAll">数据维度</Checkbox>
											</div>
											<CheckboxGroup v-model="sspHasCheckData" @on-change="sspDataChange">
												<Checkbox class="option_check" v-for="item in ssp_data_dimension" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-基本指标 -->
										<div class="checkout_content" v-show="ssp_basic_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="ssp_basic_isAll"
													@click.prevent.native="sspBasicSelectAll">基本指标</Checkbox>
											</div>
											<CheckboxGroup v-model="sspHasCheckData" @on-change="sspBasicChange">
												<Checkbox class="option_check" v-for="item in ssp_basic_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-效果指标 -->
										<div class="checkout_content" v-show="ssp_effect_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="ssp_effect_isAll"
													@click.prevent.native="sspEffectSelectAll">效果指标</Checkbox>
											</div>
											<CheckboxGroup v-model="sspHasCheckData" @on-change="sspEffectChange">
												<Checkbox class="option_check" v-for="item in ssp_effect_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-收益指标 -->
										<div class="checkout_content" v-show="ssp_income_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="ssp_income_isAll"
													@click.prevent.native="sspIncomeSelectAll">收益指标</Checkbox>
											</div>
											<CheckboxGroup v-model="sspHasCheckData" @on-change="sspIncomeChange">
												<Checkbox class="option_check" v-for="item in ssp_income_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
									</div>
								</Col>
								<Col :span="8">
									<div class="col_title">已选择列</div>
									<div class="select_con">
										<Tag v-for="item in sspHasCheckData" :key="item" :name="item" closable @on-close="sspTagToggle">{{item}}</Tag>
									</div>
								</Col>
							</Row>
						</div>
					</div>
				</div>
				<div class="drawer-footer">
					<Button @click="drawerModalFlag = false">取消</Button>
					<Button type="primary" :loading="submitClock" @click="submitData()">
						<span v-if="!submitClock">提交</span>
						<span v-else>提交中...</span>
					</Button>
				</div>
			</Drawer>
		</Card>
	</div>
</template>

<script>
import { dataType, filterBatchQuery} from '@/libs/util'
import { debounce, throttle, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import { getDownLoadXls, setTableHeadApi, tableInfoApi } from '@/api/common'
import { getSspSlotAdList } from '@/api/ssp'
import { getDspDetailHourData, getDspDetailHourDataUrl } from '@/api/data'
import { getDspSlotList, getDspProductList } from '@/api/dsp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { customColumn } from './custom-column.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import {mapActions} from 'vuex'

export default {
	name: 'dsp-detail-hour',
	mixins: [tableHeight, customColumn, inPageAccess],
	data() {
		return {
			dspTableId: 14,
			pageSize: 10, // 默认10条
			total_count: 0,
			currentPage: 1,

			datePickerOptions: { // 时间容器，禁止选择时间
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 00:00:00'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				}
			},
			filterTime: null, // 时间选择器
			datePickerTime: '', // 时间选择器
			filterSearch: { // 筛选条件
				dsp_company_id: [], // 预算方公司ID
				dsp_slot_id: [], // 预算位ID, 合集
				ssp_slot_id: [], // 广告位ID, 合集
				dsp_slot_code: [], // 预算方广告位ID
				dsp_slot_creative_type: [], // 预算位广告类型ID
				dsp_slot_name: [], // 预算方名称
				ssp_slot_name: [], // 广告位名称
				dsp_product_id_arr: [], // 产品名称
				start_date: null,
				end_date: null,
				order: null,


				dsp_slot_id_select: [], // 预算位ID, 下拉选择
				ssp_slot_id_select: [], // 广告位ID, 下拉选择
				dsp_slot_id_textarea: null, // 预算位ID多个
				ssp_slot_id_textarea: null, // 广告位ID多个

				dsp_slot_code_textarea: null, // 预算方广告位ID批量查询
				dsp_slot_name_textarea: null, // 预算位名称批量查询
				ssp_slot_name_textarea: null // 广告位名称批量查询
			},

			dspCompanyList: [], // 预算位公司账号

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中

			colDatList: [], // 表格数据
			colDatListStatics: [], // 表格数据合计
			tableColList: [], // 表格 - columns

			dspProductList: [], // 产品列表

			tableLoadFlag: true,

			drawerModalFlag: false, // 抽屉开关
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},

			// 抽屉 - 自定义
			ssp_data_isAll: false, // 流量-数据维度是否全选
			ssp_basic_isAll: false, // 流量-基本指标是否全选
			ssp_effect_isAll: false, // 流量-效果指标是否全选
			ssp_income_isAll: false, // 流量-收益指标是否全选

			submitClock: false,
			flowArr: [] // 流量
		}
	},
	computed: {
		osType() { // 应用平台
			return this.$store.getters.osType
		},
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

			this.initLinkage() // 初始化联动
			this._tableInfoApi() // 获取抽屉 表头
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true}) // search-line的高度
	},
	methods: {
		...mapActions([
			'getDspCompanyList',
			'tableInfoApi',
			'setTableHeadApi',
			'setTablePageApi'
		]),
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this.initDatePickerTime() // 初始化筛选时间
			this._getDspCompanyList() // 预算方-公司名称
			this.getDspSlotList() // 预算方-预算位
			this.getSspSlotList() // 广告位列表
			this.getDspProductList() // 产品列表
		},

		/**
		 * [getReportTitle 权限表头]
		 * @return {[type]} [description]
		 */
		getReportTitle() {
			/**
			 * 此处 注意置换
			 *
			 * 因早期开发 是按照 流量表格设置（flowDataList） +  预算表格设置 （budgetDataList） 的顺序
			 * 后续因为调整 要两个表格调换顺序 导致   getUserDspFields <=> getUserSspFields 互换
			 */
			let flowFields = this.$store.getters.getUserDspFields // 流量权限
			let flowList = this.$store.state.app.flowDataList // 流量全部表
			// 流量
			let flowArr = []
			flowList.map(item => {
				if (flowFields.includes(item.key)) {
					flowArr.push(item.label)
				}
			})
			this.flowArr = flowArr

			// 流量
			this.ssp_basic_indicators = this.ssp_basic_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.ssp_effect_indicators = this.ssp_effect_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.ssp_income_indicators = this.ssp_income_indicators.filter(item => flowArr.indexOf(item) > -1)
			let allFlow = flowArr.concat(this.ssp_data_dimension)
			this.sspHasCheckData = this.sspHasCheckData.filter(item => allFlow.indexOf(item) > -1)
		},
		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1

			let _filter = this.filterSearch

			// 此处有容处理
			// 广告位ID查询
			// 1. 广告位Id多选和单选，最后统一按照 ssp_slot_id 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_select 两个筛选条件）
			let textSplitArr_ssp = filterBatchQuery({
				value: _filter.ssp_slot_id_textarea,
				type: 'number'
			})
			_filter.ssp_slot_id = Array.from(new Set([...textSplitArr_ssp, ..._filter.ssp_slot_id_select]))

			// 同理上面的逻辑，处理预算位ID
			let textSplitArr_dsp = filterBatchQuery({
				value: _filter.dsp_slot_id_textarea,
				type: 'number'
			})
			_filter.dsp_slot_id = Array.from(new Set([...textSplitArr_dsp, ..._filter.dsp_slot_id_select]))

			// 预算方名称
			_filter.dsp_slot_name = filterBatchQuery({
				value: _filter.dsp_slot_name_textarea
			})
			// 广告位名称
			_filter.ssp_slot_name = filterBatchQuery({
				value: _filter.ssp_slot_name_textarea
			})

			// 预算方广告位ID
			_filter.dsp_slot_code = filterBatchQuery({
				value: _filter.dsp_slot_code_textarea
			})

			this.initDspDetailHourData()
		},

		/**
		 * [changePage 改变页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.initDspDetailHourData()
		},

		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.setTablePageApi({table_id: this.dspTableId, page_num: size}).then(()=> {
				this.initDspDetailHourData()
			})
		},
		/**
		 * [initDspDetailHourData 获取表格数据]
		 * @return {[type]} [description]
		 */
		initDspDetailHourData() {

			let _filter = this.filterSearch

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

			this.tableLoadFlag = true

			getDspDetailHourData(params).then(curRes => {

				this.tableLoadFlag = false

				if (curRes.code === 200) {
					this.total_count = curRes.data.total // 总数

					this.colDatList = this.tableDataMatch(curRes.data.list || []) // 列表
					this.colDatListStatics = this.tableDataMatch([curRes.data.statistic]) // 合计
				}
			}, err => {
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
		 * [tableDataMatch 当前数据和前一小时的数据匹配]
		 * @param  {[type]} curArr [description]
		 * @param  {[type]} preArr [description]
		 * @param  {[type]} group [作为聚合条件]
		 * @return {[type]}		[description]
		 */
		tableDataMatch(curArr) {
			// 需要计算千分位的数据
			let _calcArr = []
			this.tableColList.map(item => {
				if (!item.noNeedCalcThou) {
					_calcArr.push(item.slot)
				}
			})

			// 耦合前一小时的数据
			let tempArr = []
			curArr.map(item => {
				for (let key in item) {
					if (_calcArr.includes(key) && dataType(item[key]) === 'number') {
						item[key] = this.number2Thousand(item[key])
					}
				}
				tempArr.push(item)
			})

			return tempArr
		},
		/**
		 * [getTimeData 筛选-设置时间的默认值 - 默认当天]
		 * @return {[type]} [description]
		 */
		initDatePickerTime() {
			const localDate = formatDate(new Date(), 'yyyy-MM-dd') // 当前天

			this.datePickerTime = localDate
			this.filterSearch.start_date = `${localDate} 00:00:00`
			this.filterSearch.end_date = `${localDate} 23:59:59`
		},

		/**
		 * [datePickerChange 时间选择器发生变化]
		 * @param  {[type]} time [description]
		 * @return {[type]}	  [description]
		 */
		datePickerChange(time) {
			this.datePickerTime = time
			this.concatFilterData()
		},
		/**
		 * [timeChange 时间发生变化时触发]
		 * @return {[type]} [description]
		 */
		timeChange(time) {
			this.filterTime = time.slice(0, 2)
			this.concatFilterData()
		},
		/**
		 * [concatFilterData 合并筛选时间]
		 * @return {[type]} [description]
		 */
		concatFilterData() {
			let time = this.datePickerTime
			this.filterSearch.start_date = !!this.filterTime ? `${time} ${this.filterTime}:00:00` : `${time} 00:00:00`
			this.filterSearch.end_date = !!this.filterTime ? `${time} ${this.filterTime}:59:59` : `${time} 23:59:59`
		},
		/**
		 * [adTypeText 获取广告场景]
		 * @param  {[type]} id [id=>text]
		 * @return {[type]}	[description]
		 */
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},

		/**
		 * [creativeId2Text 根据createId 找到对应 text]
		 * @param  {[type]} id [description]
		 * @return {[type]}	[description]
		 */
		creativeId2Text(id) {
			let _arr = this.$store.state.app.adStyleData;
			let result = _arr.filter(item=> item.id == id)
			return result[0] ? result[0].title : ''
		},

		/**
		 * [getParentColumns 设置父级 数据表格的列]
		 * @return {[type]} [description]
		 */
		getParentColumns () {
			const ColumnList = [
				{title: '#', width: 36, key:'index', slot:'index', align: 'center', noNeedCalcThou: true},

				//数据维度
				{title: '时间', slot: 'date', key: 'date', width: 80, minWidth: 80, sortable: 'custom', noNeedCalcThou: true},
		  		{title: '公司/账号名称', header: '公司/账号名称/ID', slot: 'dsp_company_id', key: 'dsp_company_id', minWidth: 130, noNeedCalcThou: true},
				{title: '产品名称', key: 'dsp_product_name', slot: 'dsp_product_name', minWidth: 180, noNeedCalcThou: true},
		  		{title: '预算位名称', header: '预算位名称/ID', slot: 'dsp_slot_name', key: 'dsp_slot_name', width: 200, noNeedCalcThou: true},
		  		{title: '预算位素材尺寸比例', key: 'dsp_slot_ratio', slot: 'dsp_slot_ratio', width: 150, noNeedCalcThou: true},
		  		{title: '预算方广告位ID', slot: 'dsp_slot_code', key: 'dsp_slot_code', width: 230, noNeedCalcThou: true},
		  		{title: '广告位类型', slot: 'ad_type', key: 'ad_type', width: 200, noNeedCalcThou: true},
		  		{title: '广告位名称', slot: 'ssp_slot_name', key: 'ssp_slot_name', minWidth: 200, noNeedCalcThou: true},
				{title: '应用名称', key: 'app_name', header: '应用名称/ID', slot: 'app_name', minWidth: 180, noNeedCalcThou: true},
				{title: '应用平台', slot: 'app_os_type', key: 'app_os_type', width: 80, noNeedCalcThou: true},
				{title: '媒体简称', key: 'company_short_name', header: '媒体简称/ID', slot: 'company_short_name', minWidth: 180, noNeedCalcThou: true},

				{title: '广告位素材尺寸比例', key: 'ssp_slot_ratio', slot: 'ssp_slot_ratio', width: 150, noNeedCalcThou: true},

				// 基本指标
		  		{title: '有效广告请求pv', slot: 'req_pv', key: 'req_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '有效广告请求uv', slot: 'req_uv', key: 'req_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回pv', slot: 'ret_pv', key: 'ret_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回uv', slot: 'ret_uv', key: 'ret_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现pv', slot: 'show_pv', key: 'show_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现uv', slot: 'show_uv', key: 'show_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击pv', slot: 'click_pv', key: 'click_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击uv', slot: 'click_uv', key: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', key: 'jc_pv', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', slot: 'dplsucc_pv', key: 'dplsucc_pv', minWidth: 130, sortable: 'custom'},
				{title: '下载完成量', slot: 'complete_pv', key: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', slot: 'install_pv', key: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', slot: 'activate_pv', key: 'activate_pv', minWidth: 130, sortable: 'custom'},

				// 效果指标
		  		{title: '填充率', slot: 'fill_rates', key: 'fill_rates', minWidth: 100, sortable: 'custom'},
		  		{title: '展现率', slot: 'show_rates', key: 'show_rates', minWidth: 100, sortable: 'custom'},
		 		{title: '点击率', slot: 'ctr', key: 'ctr', minWidth: 100, sortable: 'custom'},
		  		{title: '调起率', slot: 'dplsucc_rates', key: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
		  		{title: '下载完成率', slot: 'complete_rates', key: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', slot: 'install_rates', key: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', slot: 'activate_rates', key: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: '媒体eCPM', slot: 'ssp_ecpm', key: 'ssp_ecpm', minWidth: 100, sortable: 'custom'},
		  		{title: '媒体CPC', slot: 'ssp_cpc', key: 'ssp_cpc', minWidth: 90, sortable: 'custom'},

				// 收益指标
				{title: '成本', slot: 'spend', key: 'spend', minWidth: 90, sortable: 'custom'}
			]

			// 筛选表格
			let resultArr = []
			let extraMust = ['date', 'index'] // 额外必须存在的字段

			ColumnList.map(item => {
				if(extraMust.includes(item.slot) || this.sspHasCheckData.indexOf(item.title) > -1) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})

			this.tableColList = resultArr
		},

		/**
		 * [handleSummary 合计计算]
		 * @param  {[type]} options.columns [description]
		 * @param  {[type]} options.data	[description]
		 * @return {[type]}				 [description]
		 */
		handleSummary({columns, data}) {
			let sumData = this.colDatListStatics[0]
			let sums = {}

			columns.forEach((column, index) => {
				let key = column.key
				if (key === 'date') {
					sums[key] = {
						key,
						value: '总计'
					}
					return
				}

				sums[key] = {
					key,
					value: column.title.indexOf('率') > -1 ? `${sumData[key]}%` : (!!column.noNeedCalcThou ? '-' : sumData[key])
				}

			})
			return sums
		},

		// 表格的排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.filterSearch.order = col.column.slot
				this.currentPage = 1
				this.initDspDetailHourData()
			} else if (col.order === 'desc') {
				this.filterSearch.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.initDspDetailHourData()
			}
		},

		// 获取广告样式
		creativeIdText(id) {
			let _arr = this.$store.state.app.adStyleData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [_tableInfoApi 获取媒体公司数据]
		 * @return {[type]} [description]
		 */
		async _tableInfoApi() {
			let storeUser = this.$store.state.user;
			let resArr = storeUser.pageCommonMemory ? storeUser.pageCommonMemory : await this.tableInfoApi()

			this.pageSize = resArr[`table_page_page_${this.dspTableId}`] || 10

			let dspKey = resArr[`table_head_head_${this.dspTableId}`]
			// 流量表格 - 设置  -  主要是用来判断是否全选
			if (!!dspKey) {
				let curArr = dspKey.split(',')

				// 流量
				if (!this.$store.getters.getUserAllFields) {
					let allFlow = this.flowArr.concat(this.ssp_data_dimension)
					this.sspHasCheckData = curArr.filter(item => allFlow.indexOf(item) > -1)
				} else {
					this.sspHasCheckData = curArr
				}
			}

			this.sspColumnJudgeAll() // 判断流量是否全选

			this.getParentColumns() // 初始化表格数据
			this.initDspDetailHourData() // 初始化获取table数据
		},

		/**
		 * [sspColumnJudgeAll 流量判断是否全选]
		 * @return {[type]} [description]
		 */
		sspColumnJudgeAll() {
			this.sspHasCheckData = [...new Set(this.sspHasCheckData)]

			// 接下来判断维度是否全选
			let data_dimension_arr = [] // 数据维度
			let basic_indicators = [] // 基本指标
			let effect_indicators = [] // 效果指标
			let income_indicators = [] // 收益指标
			this.sspHasCheckData.map(item => {

				// 流量表格 - 数据维度
				if (this.ssp_data_dimension.indexOf(item) > -1) {
					data_dimension_arr.push(item)
				}

				// 流量表格 - 基本指标
				if (this.ssp_basic_indicators.indexOf(item) > -1) {
					basic_indicators.push(item)
				}

				if (this.ssp_effect_indicators.indexOf(item) > -1) {
					effect_indicators.push(item)
				}

				if (this.ssp_income_indicators.indexOf(item) > -1) {
					income_indicators.push(item)
				}
			})

			this.ssp_data_isAll = data_dimension_arr.length === this.ssp_data_dimension.length // 流量-数据维度
			this.ssp_basic_isAll = basic_indicators.length === this.ssp_basic_indicators.length // 流量-基本指标
			this.ssp_effect_isAll = effect_indicators.length === this.ssp_effect_indicators.length // 流量-效果指标
			this.ssp_income_isAll = income_indicators.length === this.ssp_income_indicators.length // 流量-收益指标
		},
		/**
		 * [sspDataSelectAll 流量表格  数据维度 选择全部]
		 * @return {[type]} [description]
		 */
		sspDataSelectAll() {
			let resultArr = this.ssp_data_isAll ? this.sspHasCheckData.filter(x => !this.ssp_data_dimension.includes(x)) : [...this.sspHasCheckData, ...this.ssp_data_dimension]

			this.sspHasCheckData = [...new Set(resultArr)]
			this.ssp_data_isAll = !this.ssp_data_isAll
		},
		/**
		 * [sspDataChange 流量表格  数据维度 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		sspDataChange(data) {
			let dataAll = [...data].filter(item => this.ssp_data_dimension.indexOf(item) > -1)

			this.ssp_data_isAll = dataAll.length === this.ssp_data_dimension.length
		},
		/**
		 * [sspBasicSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		sspBasicSelectAll() {
			let resultArr = this.ssp_basic_isAll ? this.sspHasCheckData.filter(x => !this.ssp_basic_indicators.includes(x)) : [...this.sspHasCheckData, ...this.ssp_basic_indicators]

			this.sspHasCheckData = [...new Set(resultArr)]
			this.ssp_basic_isAll = !this.ssp_basic_isAll
		},
		/**
		 * [sspBasicChange 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		sspBasicChange(data) {
			let dataAll = [...data].filter(item => this.ssp_basic_indicators.indexOf(item) > -1)

			this.ssp_basic_isAll = dataAll.length === this.ssp_basic_indicators.length
		},
		/**
		 * [sspEffectSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		sspEffectSelectAll() {
			let resultArr = this.ssp_effect_isAll ? this.sspHasCheckData.filter(x => !this.ssp_effect_indicators.includes(x)) : [...this.sspHasCheckData, ...this.ssp_effect_indicators]

			this.sspHasCheckData = [...new Set(resultArr)]
			this.ssp_effect_isAll = !this.ssp_effect_isAll
		},
		/**
		 * [sspEffectChange 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		sspEffectChange(data) {
			let dataAll = [...data].filter(item => this.ssp_effect_indicators.indexOf(item) > -1)

			this.ssp_effect_isAll = dataAll.length === this.ssp_effect_indicators.length
		},
		/**
		 * [sspIncomeSelectAll 流量表格  收益指标的筛选 选择全部]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		sspIncomeSelectAll() {
			let resultArr = this.ssp_income_isAll ? this.sspHasCheckData.filter(x => !this.ssp_income_indicators.includes(x)) : [...this.sspHasCheckData, ...this.ssp_income_indicators]

			this.sspHasCheckData = [...new Set(resultArr)]
			this.ssp_income_isAll = !this.ssp_income_isAll
		},
		/**
		 * [sspIncomeChange 流量表格  收益指标的筛选 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		sspIncomeChange(data) {
			let dataAll = [...data].filter(item => this.ssp_income_indicators.indexOf(item) > -1)

			this.ssp_income_isAll = dataAll.length === this.ssp_income_indicators.length
		},
		/**
		 * [sspTagToggle 流量表格的删除]
		 * @param  {[type]} event [description]
		 * @param  {[type]} name  [description]
		 * @return {[type]}       [description]
		 */
		sspTagToggle (event, name) {
			const index = this.sspHasCheckData.indexOf(name)
			this.sspHasCheckData.splice(index, 1)
		},
		/**
		 * [submitData 自定义列表 提交数据, 需要同时提交两个自定义表单]
		 * @return {[type]} [description]
		 */
		submitData() {
			this.submitClock = true
			this.setTableHeadApi({table_id: this.dspTableId, select_str: this.sspHasCheckData.join(',')}).then(()=> {
				this.submitClock = false
				this.drawerModalFlag = false

				this.tableInfoApi().then(() => { // 重置一次页面公共记忆
					this._tableInfoApi() // 重新获取数据
				})
			})
		},
		/**
		 * [downStatement 下载报表]
		 * @return {[type]} [description]
		 */
		downStatement() {

			let _filter = this.filterSearch

			let params = {
				...this.getAxiosParams(),
				...{
					start_date: _filter.start_date,
					end_date: _filter.end_date,
					page_size: this.total_count,
					page_num: 1
				}
			}

			let down = {
				method: 'GET',
				url: getDspDetailHourDataUrl(params)
			}

			this.submitClock = true

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = `${this.datePickerTime}预算位详细数据.xlsx`
					createObjectURL(res.data.url, filename)
				}
				this.submitClock = false
			}, err => {
				this.submitClock = false
			})
		},
		/**
 		 * [number2Thousand 数字转千分位]
 		 * @param  {[type]} val [description]
 		 * @return {[type]}	 [description]
 		 */
		number2Thousand(number) {
			return number2Thousand(number)
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText (count) {
			return `+ ${count}`
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
				dsp_company_id: this.filterSearch.dsp_company_id,
				page_size: (!!query || this.filterSearch.dsp_company_id.length) ? 10000 : 10,
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
			if(!query) {
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
		'filterSearch.dsp_company_id': {
			handler: function(val) {
				this.getDspSlotList()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
/deep/ .data-table
	.ivu-table-tbody
		tr:last-child
			td
				border-bottom 1px solid #e8eaec
.console-table
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height: 32px
.text-row-ellipsis
	font-size: 12px
	overflow: hidden
	display: -webkit-box
	-webkit-box-orient: vertical
	-webkit-line-clamp: 2
	word-break: break-word
</style>
