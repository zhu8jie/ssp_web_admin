<!-- by 李想 -->
<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>

				<div class="nav-handle-group">
					<RadioGroup v-model="filterSearch.day" type="button" @on-change="doFilterList('day')">
						<Radio :label="1">今日</Radio>
						<Radio :label="7">过去7日</Radio>
						<Radio :label="30">过去30日</Radio>
					</RadioGroup>
				</div>

				<div class="is-handler">
					<Button class="host" type="text" @click="drawerModalFlag = true">自定义列</Button>

					<Button class="host" type="text" v-if="_isShow_('download')" :loading="submitClock" @click="downStatement">
						<i class="iconfont icon-download"></i>
						<span>{{!submitClock ? '下载报表' : '下载中...'}}</span>
					</Button>
				</div>
			</div>

			<div class="search-line" ref="search-line">

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.ud_ids"
					placeholder="媒体简称/ID"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
				</Select>

				<!-- 应用列表 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.app_ids"
					filterable
					clearable
					multiple
					:remote-method="searchSspApp"
					:loading="sspAppLoad"
					 @on-change="clearSearchApp"
					:on-query-change="appQueryChange"
					:transfer="true"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="应用名称/ID"
				>
					<Option v-for="item in sspAppList" :value="item.app_id" :key="item.app_id">{{item.app_name}} (ID:{{item.app_id}})</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					v-model="filterSearch.ad_type_ids"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="广告场景"
				>
					<Option v-for="item in adTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					v-model="filterSearch.creative_types"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="广告样式"
				>
					<Option v-for="item in adStyleList" :value="item.id" :key="item.id">{{ item.title }}</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.dsp_product_ids"
					placeholder="产品名称/ID"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<Option v-for="item in dspProductList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
				</Select>
				<!-- 业务状态 -->
				<Select class="i-margin-right-11 i-width-select mar-bot-10"
						clearable
						v-model="filterSearch.ssp_slot_status_dev"
						placeholder="广告位状态">
					<Option  :value="-1">暂停</Option>
					<Option  :value="1">启用</Option>
				</Select>
				<!-- 运营状态 -->
				<Select class="i-margin-right-11 i-width-select mar-bot-10"
						clearable
						v-model="filterSearch.ssp_slot_operate_status"
						placeholder="运营状态">
					<Option v-for="item in productStatus" :value="item.value" :key="'yun'+item.label">{{item.label}}</Option>
				</Select>
				<!-- 广告位状态 -->
				<Select class="i-margin-right-11 i-width-select mar-bot-10"
						clearable
						v-model="filterSearch.ssp_slot_status"
						placeholder="业务状态">
					<Option v-for="item in adStatusList" :key="'yun'+item.label" :value="item.value">{{item.label}}</Option>
				</Select>

				<Input type="textarea" v-model.trim="filterSearch.ssp_slot_ids_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>

		  		<Input type="textarea" v-model.trim="filterSearch.ssp_slot_name_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

		  		<Input type="textarea" v-model.trim="filterSearch.ex_slot_ids_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量外部广告位ID"/>

				<Input type="textarea" v-model.trim="filterSearch.ratios_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量尺寸比例" />

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<!-- table数据 -->
			<div class="data-table console-table">
				<div class="u-table-center">
					<u-table
						border
						use-virtual
						row-id="id"
						:max-height="tableHeight"
						:data="colDataList"
						:data-changes-scroll-top="false"
						:summary-method="summaryMethod"
						@sort-change="sortProduct"
						stripe
						show-summary
					>
						<u-table-column :resizable="false" type="index" :min-width="40" align="center"></u-table-column>

						<template v-for="item in tableColList">
							<!-- 非产品 -->
							<u-table-column
								v-if="!item.isProduct"
								:prop="item.prop"
								:label="item.label"
								:min-width="item.minWidth"
								:resizable="false"
								:sortable="item.sortable"
								v-slot="scope"
							>
								<!-- 广告位名称/ID -->
								<template v-if="item.prop === 'ssp_slot_name'">
									<div class="control-flex">
										<div class="control-left">
											<p v-if="scope.row.ssp_slot_name" class="name-row-ellipsis" :title="scope.row.ssp_slot_name">{{ scope.row.ssp_slot_name }}</p>
											<p class="tip-row-line">ID: {{ scope.row.ssp_slot_code }}</p>
										</div>
										<a class="control-right" target="_blank" :href="'/ssp/ad/config/' + scope.row.ssp_slot_code">
											<Icon type="md-create"/>
										</a>
									</div>
								</template>

								<!--应用名称/ID-->
								<template v-if="item.prop === 'app_name'">
									<p class="name-row-ellipsis" :title="scope.row.app_name">{{ scope.row.app_name }}</p>
									<p class="tip-row-line">ID: {{ scope.row.app_id }}</p>
								</template>

								<!--媒体简称/ID-->
								<template v-if="item.prop === 'ud_name'">
									<p class="name-row-ellipsis" :title="scope.row.ud_name">{{ scope.row.ud_name }}</p>
									<p class="tip-row-line">ID: {{ scope.row.ud_id }}</p>
								</template>

								<!--广告位类型-->
								<template v-if="item.prop === 'ad_type'">
									{{adTypeText(scope.row.ad_type_id)}}-{{creativeIdText(scope.row.creative_type)}}
								</template>

								<!--业务状态-->
								<template v-if="item.prop ==='status'">
									<Badge v-if="scope.row.status == 1" color="#339900" text="有效"/>
									<Badge v-if="scope.row.status == 2" color="#015D16" text="修改审核中"/>
									<Badge v-if="scope.row.status == 3" color="#999999" text="待审核"/>
									<Badge v-if="scope.row.status == 4" color="#B5291A" text="已拒绝"/>
									<Badge v-if="scope.row.status == 5" color="#F72D17" text="封禁"/>
									<Badge v-if="scope.row.status == -1" status="error" text="暂停合作"/>
									<Poptip v-if="(scope.row.status == 4 || scope.row.status == 5) && scope.row.status_desc" trigger="hover"
											:transfer="true" :content="scope.row.status_desc">
										<i class="iconfont icon-why"></i>
									</Poptip>
								</template>
								<!--广告位状态-->
								<template v-if="item.prop ==='status_dev'">
									<Badge v-if="scope.row.status_dev == 1" color="#339900" text="启用"/>
									<!-- 2暂停，0默认暂停 -->
									<Badge v-else color="#F72D17" text="暂停"/>
								</template>

								<!--运营状态-->
								<template v-if="item.prop ==='operate_status'">
									<div class="divide">
										<div class="divide_left">
											<p v-if="scope.row.operate_status===-4">-</p>
											<p v-else>
                                             <span v-for="item in productStatus" v-if="item.value===scope.row.operate_status" :value="item.value"
							                   :key="item.label +'运营状态' + scope.row.id">{{item.label}}</span>
											</p>
										</div>
									</div>

								</template>

								<!-- 素材尺寸比例 -->
								<template v-if="item.prop === 'ratios'">
									<p class="name-row-ellipsis" :title="scope.row.ratios">{{scope.row.ratios}}</p>
								</template>

								<!-- 外部广告位ID -->
								<template v-if="item.prop === 'ex_slot_id'">
									<p class="text-row-ellipsis-2" :title="scope.row.ex_slot_id || '-'">{{scope.row.ex_slot_id || '-'}}</p>
								</template>

								<!-- 关联产品 -->
								<template v-if="item.prop === 'dsp_product_name'">
									<p class="text-row-ellipsis-2" :title="scope.row.dsp_product_name">{{scope.row.dsp_product_name || '-'}}</p>
								</template>

								<!-- 总广告请求pv -->
								<template v-if="item.prop === 'total_req_pv'">
									<!-- {{scope.row.product_list.length ? scope.row.total_req_pv : '-'}} -->
									{{scope.row.total_req_pv}}
								</template>

							</u-table-column>
							<!-- 产品 -->
							<u-table-column
								v-if="item.isProduct"
								:header-align="'center'"
								:label="item.label"
								:min-width="600"
							>
								<u-table-column
									v-for="child in item.childHeader"
									:key="child.prop"
									:prop="child.prop"
									:label="child.label"
									:sortable="child.sortable"
									:min-width="child.minWidth"
									:resizable="false"
									v-slot="scope"
								>
									<!-- 有效广告请求pv -->
									<template v-if="child.prop === `req_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`req_pv_${item.product_id}`) ? scope.row[`req_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 广告返回pv -->
									<template v-if="child.prop === `ret_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ret_pv_${item.product_id}`) ? scope.row[`ret_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 广告展现pv -->
									<template v-if="child.prop === `show_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`show_pv_${item.product_id}`) ? scope.row[`show_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 广告点击pv -->
									<template v-if="child.prop === `click_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`click_pv_${item.product_id}`) ? scope.row[`click_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 调起数 -->
									<template v-if="child.prop === `dplsucc_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`dplsucc_pv_${item.product_id}`) ? scope.row[`dplsucc_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 激活量 -->
									<template v-if="child.prop === `activate_pv_${item.product_id}`">
										{{scope.row.hasOwnProperty(`activate_pv_${item.product_id}`) ? scope.row[`activate_pv_${item.product_id}`] : '-'}}
									</template>

									<!-- 填充率 -->
									<template v-if="child.prop === `fill_rates_${item.product_id}`">
										{{scope.row.hasOwnProperty(`fill_rates_${item.product_id}`) ? scope.row[`fill_rates_${item.product_id}`] : '-'}}
									</template>

									<!-- 展现率 -->
									<template v-if="child.prop === `show_rates_${item.product_id}`">
										{{scope.row.hasOwnProperty(`show_rates_${item.product_id}`) ? scope.row[`show_rates_${item.product_id}`] : '-'}}
									</template>

									<!-- 调起率 -->
									<template v-if="child.prop === `dplsucc_rates_${item.product_id}`">
										{{scope.row.hasOwnProperty(`dplsucc_rates_${item.product_id}`) ? scope.row[`dplsucc_rates_${item.product_id}`] : '-'}}
									</template>

									<!-- 激活率 -->
									<template v-if="child.prop === `activate_rates_${item.product_id}`">
										{{scope.row.hasOwnProperty(`activate_rates_${item.product_id}`) ? scope.row[`activate_rates_${item.product_id}`] : '-'}}
									</template>

									<!-- 点击率 -->
									<template v-if="child.prop === `ctr_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ctr_${item.product_id}`) ? scope.row[`ctr_${item.product_id}`] : '-'}}
									</template>

									<!-- 媒体eCPM -->
									<template v-if="child.prop === `ssp_ecpm_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ssp_ecpm_${item.product_id}`) ? scope.row[`ssp_ecpm_${item.product_id}`] : '-'}}
									</template>

									<!-- 媒体CPC -->
									<template v-if="child.prop === `ssp_cpc_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ssp_cpc_${item.product_id}`) ? scope.row[`ssp_cpc_${item.product_id}`] : '-'}}
									</template>

									<!-- CPM -->
									<template v-if="child.prop === `ecpm_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ecpm_${item.product_id}`) ? scope.row[`ecpm_${item.product_id}`] : '-'}}
									</template>

									<!-- CPC -->
									<template v-if="child.prop === `cpc_${item.product_id}`">
										{{scope.row.hasOwnProperty(`cpc_${item.product_id}`) ? scope.row[`cpc_${item.product_id}`] : '-'}}
									</template>

									<!-- 状态 -->
									<template v-if="child.prop === `ssp_product_status_text_${item.product_id}`">
										{{scope.row.hasOwnProperty(`ssp_product_status_text_${item.product_id}`) ? scope.row[`ssp_product_status_text_${item.product_id}`] : '-'}}
									</template>

								</u-table-column>
							</u-table-column>
						</template>
					</u-table>
					<Spin size="large" v-if="tableLoadFlag" fix></Spin>
				</div>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<div class="column_content">
				<div class="col_detail" v-if="columnData.length">
					<div class="media_table">
						<Row>
							<Col :span="16">
								<div class="col_title">可选择列</div>
								<div class="optional_detail">
									<div class="checkout_content" v-for="(item, index) in columnData" :key="index">
										<!-- {{item.hasCheckArr}} -->
										<div class="check_title">
											<Checkbox
												:value="item.checkArr.length === item.hasCheckArr.length"
												@click.prevent.native="columnToggleAll(item)"
											>{{item.name}}<span v-if="item.type === 'product' || item.type === 'productId'" class="column-red">({{item.type === 'productId' ? '选择产品后，请至少选择一个产品指标' : '选择产品指标后，请至少选择一个产品'}})</span></Checkbox>
										</div>
										<CheckboxGroup
											v-model="item.hasCheckArr"
											@on-change="checkChange"
										>
											<Checkbox
												class="option_check"
												v-for="child in item.checkArr"
												:key="child.prop"
												:label="child.prop"
											>
												<span>{{child.label}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
								</div>
							</Col>
							<Col :span="7" :offset="1">
								<!-- {{columnTag}} -->
								<div class="col_title">已选择列</div>
								<div class="select_con">
									<Tag v-for="(item, index) in columnTag" :title="item.label" :key="item.prop" closable @on-close="toggleTag(item, index)">{{item.label}}</Tag>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</div>
			<div class="drawer-footer">
				<Button @click="drawerModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitData">
					{{!submitClock ? '提交' : '提交中...'}}
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { showTitle, dataType, filterBatchQuery, arrayUnique } from '@/libs/util'
import { debounce, throttle, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import { setTableHead, getTableHead, getDownLoadXls, getMediaCompany} from '@/api/common'
import { getAppList, getSspSlotAdList } from '@/api/ssp'
import { getDspProductList } from '@/api/dsp'
import { getSspLibrayData, getSspLibrayDataUrl, getDspDetailDayData, getSspFlowData, downSspLibrayData } from '@/api/data'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { catchTableColumn, productProp, fixedProp } from './custom-column.js'
import {mapActions} from 'vuex'
import {adStatusList, productStatus} from "../../ssp/data/adConfig";

export default {
	name: 'media-libray-data',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			tableHeadId: 17, // 设置头信息的id
			pageSize: 10, // 默认10条
			total_count: 0,
			currentPage: 1,
			productStatus: productStatus(this), // 产品状态以及运营状态
			adStatusList: adStatusList(this), // 广告位的状态
			datePickerOptions: { // 时间容器，禁止选择时间
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 00:00:00'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				}
			},
			adTypeList: [], // 广告场景
			adStyleList: [], // 广告样式
			filterSearch: { // 筛选条件
				day: 1, // 默认今天数据
				ssp_slot_status: null,
				ssp_slot_status_dev: null,
				ssp_slot_operate_status: null,
				group: [], // 分组聚合字段
				ud_ids: [], //筛选-媒体列表
				app_ids: [], // 筛选-应用ID
				ad_type_ids: [], // 广告场景
				creative_types: [], // 阳光好样式
				dsp_product_ids: [], // 产品名称

				ssp_slot_ids: [], // 广告位id
				ssp_slot_name: [], // 广告位名称
				ex_slot_ids: [], // 外部广告位id
				ratios: [], // 素材尺寸比例

				ssp_slot_ids_textarea: null, // 广告位ID(多个)查询
				ssp_slot_name_textarea: null, // 广告位名称（多个）查询
				ex_slot_ids_textarea: null, // 外部广告位id
				ratios_textarea: null, // 素材尺寸比例textarea

				order_product_id: null, // 排序产品ID
				order_column: null, // 排序字段，举例，总广告请求PV：total_req_pv，产品下的请求PV：req_pv
				order_type: 'asc' // 排序类型，举例，倒序：desc，正序：asc或不填
			},

			colDataList: [], // 表格数据
			colDataListStatics: {}, // 表格数据-合计
			columnData: [], // 自定义列
			columnDataId2Name: {}, // 自定义列中对应的Id => Name， 在生成table时，在多表头时显示产品名称
			columnTag: [], // 自定义列 已选择标签
			sspMediaLibraryStatic: [], // 表格数据合计

			// 搜索联动使用
			meidaCompanyArr: [], // 媒体公司列表
			catchSspAppList: [], // 缓存应用列表，在清空媒体下拉时重新赋值
			sspAppList: [], // 媒体列表
			sspAppLoad: false, // 媒体列表加载中
			dspProductList: [], // 产品列表

			catchMemoryTable: {}, // 缓存记忆表头
			tableColList: [], // 表格 - columns
			tableLoadFlag: true,

			drawerModalFlag: false, // 抽屉开关
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},

			submitClock: false,

			flowArr: [], // 流量
			budgetArr: [], // 预算
			echartArr: [] // 数据表筛选列表
		}
	},
	filters: {
		formatUnit(val) {
			console.log(val)
			return number2Thousand(val)
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.initColumnData() // 初始化自定义列所需内容
			this.initLinkage() // 初始化联动

			this.getSspLibrayData() // 媒体库数据
			this.getDspLibrayStaticData() // 合计
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		...mapActions([
			'getAllAdType'
		]),
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this._getAllAdType() // 获取广告类型
			this.getSspAppList() // 应用列表列表
			this.getMediaCompany() // 获取媒体公司
		},
		/**
		 * [initColumnData 初始化自定义列所需内容]
		 * @return {[type]} [description]
		 */
		initColumnData() {
			Promise.all([
				getDspProductList(),
				getTableHead()
			]).then(res => {

				// 产品数据
				if (res[0].code === 200) {
					this.dspProductList = res[0].data.list.reverse()
				}

				// 记忆数据
				if (res[1].code === 200) {
					let memoryVal = res[1].data[`table_head_head_${this.tableHeadId}`]

					this.catchMemoryTable = !!memoryVal ? JSON.parse(memoryVal) : {
						"dimension" : fixedProp // 默认
					}
				}

				// 1. 自定义列数据匹配（初始化产品自定义列 + 记忆选中）
				this.matchCustomColumn()

				// 2. 设置table表头
				this.setTableColumn()

			})
		},
		/**
		 * [getSspLibrayData 2. 初始化表格列表数据]
		 * @return {[type]} [description]
		 */
		getSspLibrayData() {
			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			this.tableLoadFlag = true

			getSspLibrayData(params).then(res => {
				if (res.code === 200) {
					this.total_count = res.data.total_count // 总数

					this.colDataList = this.formatSspLibrayData(res.data.list || [])
				}

				this.tableLoadFlag = false
			})
		},
		/**
		 * [getDspLibrayStaticData 获取数据合计]
		 * @return {[type]} [description]
		 */
		getDspLibrayStaticData() {
			let ProArr = [
				getSspFlowData({ //  流量数据 总光广告请求pv
					...this.getSspAxiosParams()
				}),
				getDspDetailDayData({ // 产品
					...this.getDspAxiosParams(),
					...{
						group: ['dsp_product_id']
					}
				})
			]

			Promise.all(ProArr).then(res => {
				if(res[0].code === 200 && res[1].code === 200) {
					this.colDataListStatics = {  // 格式化合计
						...{total_req_pv: number2Thousand(res[0].data.total.total_req_pv)},
						...this.formatDspLibrayStaticData(res[1].data.list)
					}
				}
			})
		},
		/**
		 * [formatSspLibrayData 格式化媒体数据]
		 * @param  {[type]} sspMediaData [description]
		 * @return {[type]}			  [description]
		 */
		formatSspLibrayData(resData) {
			resData.map(sspItem => {

				let dsp_product_name = [] // 管理产品

				sspItem.product_list.map(proItem => {

					Object.assign(sspItem, this.splitProductKey(proItem)) // 合并 -- 与table的自产品prop相同  比如："prop": "click_pv_7003"

					dsp_product_name.unshift(proItem.dsp_product_name) // 关联的产品name
				})

				sspItem.total_req_pv = number2Thousand(sspItem.total_req_pv) // 总广告请求pv
				sspItem.dsp_product_name = dsp_product_name.join('、') // 关联产品名称
				sspItem.ratios = sspItem.ratios.length ? sspItem.ratios.join('、') : '-'
			})

			return resData
		},
		/**
		 * [formatDspLibrayStaticData 格式化媒体数据- 合计]
		 * @param  {[type]} sspData [ssp合计]
		 * @param  {[type]} dspData [dsp产品数据]
		 * @return {[type]}			  [description]
		 */
		formatDspLibrayStaticData(dspData) {

			let returnObj = {}

			dspData.map(sspItem => {
				Object.assign(returnObj, this.splitProductKey(sspItem)) // 合并 -- 与table的自产品prop相同  比如："prop": "click_pv_7003"
			})

			return returnObj
		},
		/**
		 * [splitProductKey 拆分产品的key值, 并返回prop_productId的组合， 类似：click_pv_7003 ]
		 * @return {[type]} [description]
		 */
		splitProductKey(obj) {
			let resultObj = {}

			for (let key in obj) {
				if (productProp.hasOwnProperty(key)) {

					let propKey = productProp[key]

					resultObj[`${key}_${obj.dsp_product_id}`] = !!propKey.calcThou ? number2Thousand(obj[key]) : (!!propKey.unit ? `${obj[key]}${propKey.unit}` : obj[key])
				}
			}

			return resultObj
		},
		/**
		 * [setTableColumn 设置table表头]
		 * @return {[type]} [description]
		 */
		setTableColumn() {

			let copyMemoryTable = this.catchMemoryTable // 记忆数据
			let columnDataId2Name = this.columnDataId2Name // 在生成table时，在多表头时显示产品名称

			let tableList = [] // 最后渲染的table

			// 1. 遍历记忆数据
			let calcMemory = false // 是否计算过产品名称和产品指标

			for (let ikey in copyMemoryTable) {

				let memoryVal = copyMemoryTable[ikey] // 记忆数据

				if (ikey === 'dimension' || ikey === 'indicator') { // 固有维度

					catchTableColumn[ikey].map(item => {
						if (memoryVal.includes(item.prop)) { // 筛选出已选中的记忆Checkbox
							tableList.push(item)
						}
					})
				} else if (!calcMemory && copyMemoryTable.hasOwnProperty('product') && copyMemoryTable.hasOwnProperty('productId')) { // 产品维度

					// 产品名称和产品列表必须同时存在
					calcMemory = true

					copyMemoryTable['productId'].map(item => {

						let pId = item.split('productId_')[1] // 产品Id

						let obj = {
							product_id: pId, // 产品Id
							isProduct: true,
							label: columnDataId2Name[pId]['name'], // 产品的name
							childHeader: []
						}

						catchTableColumn['product'].map(child => {
							if (copyMemoryTable['product'].includes(child.prop)) {
								obj.childHeader.push({
									...child,
									...{
										prop: `${child.prop}_${pId}`
									}
								})
							}
						})

						if (obj.childHeader.length) {
							tableList.push(obj)
						}
					})
				}
			}

			this.tableColList = tableList
		},
		/**
		 * [matchCustomColumn description]
		 * @return {[type]} [description]
		 */
		matchCustomColumn() {

			let hasCheckedTagArr = [] // 在tag中已经选择的自定义列
			let Id2Name = {}

			// 2. 加入产品的自定义列
			let productIdArr = []
			this.dspProductList.map(item => {
				productIdArr.push({
					prop: `productId_${item.id}`,
					label: item.name
				})

				Id2Name[item.id] = {id: item.id, name: item.name}
			})

			// 1. 默认数据维度和数据指标
			let column = [
				{
					name: '数据维度',
					type: 'dimension',
					checkArr: [...catchTableColumn.dimension],
					hasCheckArr: []
				},
				{
					name: '数据指标',
					type: 'indicator',
					checkArr: [...catchTableColumn.indicator],
					hasCheckArr: []
				},
				{
					name: '产品指标',
					type: 'product',
					checkArr: [...catchTableColumn.product],
					hasCheckArr: []
				},
				{
					name: '产品名称',
					type: 'productId',
					checkArr: [...productIdArr],
					hasCheckArr: []
				}
			]


			// 3. 根据记忆匹配已选中的
			column.map((item, index) => {

				let _cur = this.catchMemoryTable[item.type]

				if (!!_cur) {

					item['hasCheckArr'] = [..._cur]

					// 遍历数据放入tag中
					item['checkArr'].map(child => {
						if (_cur.includes(child.prop)) {
							hasCheckedTagArr.push({
								...child,
								...{
									type: item.type
								}
							})
						}
					})
				}
			})

			this.columnData = column // 自定义列
			this.columnDataId2Name = Id2Name // 在生成table时，在多表头时显示产品名称
			this.columnTag = hasCheckedTagArr // 已选择的tag
		},
		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [区分过去]
		 */
		doFilterList(type) {

			this.currentPage = 1

			let _filter = this.filterSearch

			// 广告位ID
			_filter.ssp_slot_ids = filterBatchQuery({value: _filter.ssp_slot_ids_textarea, type: 'number'})

			// 广告位名称
			_filter.ssp_slot_name = filterBatchQuery({value: _filter.ssp_slot_name_textarea})

			// 外部广告位ID
			_filter.ex_slot_ids = filterBatchQuery({value: _filter.ex_slot_ids_textarea})

			// 素材尺寸比例
			_filter.ratios = filterBatchQuery({value: _filter.ratios_textarea, ratio: true})

			this.getSspLibrayData()
			this.getDspLibrayStaticData()

			// 如果是过去七天，还需要重置合计
			// if(type === 'day') {
			// 	this.getDspLibrayStaticData()
			// }
		},

		/**
		 * [changePage 改变页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getSspLibrayData()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getSspLibrayData()
		},
		/**
		 * [getAxiosParams 媒体库数据-参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {
				...this.getAxiosDate()
			}

			// 媒体列表
			!!_filter.ud_ids.length && (params.ud_ids = _filter.ud_ids)

			// 应用ID
			!!_filter.app_ids.length && (params.app_ids = _filter.app_ids)

			// 产品Id
			!!_filter.dsp_product_ids.length && (params.dsp_product_ids = _filter.dsp_product_ids)

			// 广告场景
			!!_filter.ad_type_ids.length && (params.ad_type_ids = _filter.ad_type_ids)

			// 广告样式
			!!_filter.creative_types.length && (params.creative_types = _filter.creative_types)

			// 广告位ID数组
			!!_filter.ssp_slot_ids.length && (_filter.ssp_slot_ids.length > 1 ? (params.ssp_slot_ids = _filter.ssp_slot_ids) : (params.ssp_slot_id = _filter.ssp_slot_ids))

			// 广告位名称
			!!_filter.ssp_slot_name.length && (_filter.ssp_slot_name.length > 1 ? (params.ssp_slot_names = _filter.ssp_slot_name) : (params.ssp_slot_name = _filter.ssp_slot_name))

			// 外部广告位id
			!!_filter.ex_slot_ids.length && (_filter.ex_slot_ids.length > 1 ? (params.ex_slot_ids = _filter.ex_slot_ids) : (params.ex_slot_id = _filter.ex_slot_ids))

			// 素材尺寸比例
			!!_filter.ratios.length && (params.ratios = _filter.ratios)

            // 广告位业务状态
			!!_filter.ssp_slot_status && (params.ssp_slot_status = _filter.ssp_slot_status)

			// 广告位状态
			!!_filter.ssp_slot_status_dev && (params.ssp_slot_status_dev = _filter.ssp_slot_status_dev)

			// 广告位运营状态
			_filter.ssp_slot_operate_status!==null && (params.ssp_slot_operate_status = _filter.ssp_slot_operate_status)

			// 排序
			!!_filter.order_product_id && (params.order_product_id = _filter.order_product_id)
			!!_filter.order_column && (params.order_column = _filter.order_column)
			!!_filter.order_type && (params.order_type = _filter.order_type)

			return params
		},
		/**
		 * [getAxiosParams 流量数据-总广告请求-参数]
		 * @return {[type]} [description]
		 */
		getSspAxiosParams() {

			let _filter = this.filterSearch

			let params = {
				...this.getAxiosDate()
			}

			// 媒体列表
			!!_filter.ud_ids.length && (params.ud_id_arr = _filter.ud_ids) // √

			// 应用ID
			!!_filter.app_ids.length && (params.app_id_arr = _filter.app_ids) // √

			// 产品Id
			!!_filter.dsp_product_ids.length && (params.dsp_product_id_arr = _filter.dsp_product_ids) // √

			// 广告场景
			!!_filter.ad_type_ids.length && (params.ad_type_id_arr = _filter.ad_type_ids) // √

			// 广告样式
			!!_filter.creative_types.length && (params.creative_type_arr = _filter.creative_types) // √

			// 广告位ID数组
			!!_filter.ssp_slot_ids.length && (params.ssp_slot_id_arr = _filter.ssp_slot_ids) // √

			// 广告位名称
			!!_filter.ssp_slot_name.length && (params.ssp_slot_name_arr = _filter.ssp_slot_name) // √

			// 外部广告位id
			!!_filter.ex_slot_ids.length && (params.ssp_slot_ex_id_arr = _filter.ex_slot_ids) // √

			// 素材尺寸比例
			!!_filter.ratios.length && (params.ratio_arr = _filter.ratios) // √

			return params
		},
		/**
		 * [getDspAxiosParams 获取预算位详细数据， 产品]
		 * @return {[type]} [description]
		 */
		getDspAxiosParams() {
			let _filter = this.filterSearch

			let params = {
				...this.getAxiosDate()
			}

			// 媒体列表
			!!_filter.ud_ids.length && (params.ssp_id_arr = _filter.ud_ids) // √

			// 应用ID
			!!_filter.app_ids.length && (params.app_id_arr = _filter.app_ids) // √

			// 产品Id
			!!_filter.dsp_product_ids.length && (params.dsp_product_id_arr = _filter.dsp_product_ids) // √

			// 广告场景
			!!_filter.ad_type_ids.length && (params.dsp_slot_ad_type_arr = _filter.ad_type_ids) // √

			// 广告样式
			!!_filter.creative_types.length && (params.dsp_slot_creative_type = _filter.creative_types) // √

			// 广告位ID数组
			!!_filter.ssp_slot_ids.length && (params.ssp_slot_id = _filter.ssp_slot_ids) // √

			// 广告位名称
			!!_filter.ssp_slot_name.length && (params.ssp_slot_name = _filter.ssp_slot_name) // √

			// 外部广告位id
			!!_filter.ex_slot_ids.length && (params.ssp_slot_ex_slot_id_arr = _filter.ex_slot_ids) // √

			// 素材尺寸比例
			!!_filter.ratios.length && (params.ssp_slot_ratio_arr = _filter.ratios) // √

			return params
		},
		/**
		 * [getAxiosDate 获取请求参数的时间]
		 * @return {[type]} [description]
		 */
		getAxiosDate() {
			let _filter = this.filterSearch

			let params = {}

			let curDate = new Date()

			if (_filter.day > 1) { // 过往
				params.start_date = formatDate(curDate.getTime() - 3600 * 1000 * 24 * _filter.day, 'yyyy-MM-dd')
				params.end_date = formatDate(curDate.getTime() - 3600 * 1000 * 24 * 1, 'yyyy-MM-dd')
			} else { // 今天
				params.start_date = formatDate(curDate, 'yyyy-MM-dd')
				params.end_date = formatDate(curDate, 'yyyy-MM-dd')
			}

			return params
		},
		/**
		 * [handleSummary 合计计算]
		 * @param  {[type]} options.columns [description]
		 * @param  {[type]} options.data	[description]
		 * @return {[type]}				 [description]
		 */
		summaryMethod({columns, data}) {

			let returnArr = []

			columns.forEach((column, index) => {
				if (column.type === 'index') {
					returnArr.push('合计')
				} else if (fixedProp.includes(column.property)) {
					returnArr.push('-')
				} else {

					let _col = this.colDataListStatics
					let val = (_col[column.property] === undefined || _col[column.property] === '') ? '-' : `${_col[column.property]}`

					returnArr.push(val)
				}
			})

			return [returnArr]
		},
		/**
		 * [sortProduct 排序]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		sortProduct(row) {

			let _filter = this.filterSearch

			let splitArr = row.prop.split(/(?:_[0-9])/)  // 如果是产品（["req_pv", "000"]）, 如果是总广告请求pv (["total_req_pv"])
			let order_product_id

			if (splitArr.length > 1) { // 子产品排序
				let splitChar = row.prop.split(`${splitArr[0]}_`)
				order_product_id = Number(splitChar[splitChar.length - 1])
			} else { // 外部的总广告请求pv
				order_product_id = null
			}

			let order_column = splitArr[0]

			if (!!row.order) {
				_filter.order_product_id = order_product_id
				_filter.order_column = order_column
			} else {
				_filter.order_product_id = null
				_filter.order_column = null
			}

			_filter.order_type = row.order === 'descending' ? 'desc' : (row.order === 'ascending' ? 'asc' : null) // 排序类型

			this.currentPage = 1
			this.getSspLibrayData()
		},
		/**
		 * [downStatement 下载流量表格]
		 * @return {[type]} [description]
		 */
		downStatement() {
			let params = {
				...this.getAxiosParams(),
				...{
					page_size: this.total_count,
					page_num: 1
				}
			}

			this.submitClock = true

			downSspLibrayData(params).then(res => {
				if (res.code === 200) {
					createObjectURL(res.data.url, '媒体库数据.xlsx')
				}
				this.submitClock = false
			}, err => {
				this.submitClock = false
			})
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
		 * [checkChange 复选框单个选中]
		 * @param  {[type]} item [description]
		 * @return {[type]}	  [description]
		 */
		checkChange() {
			let resultTagArr = []

			this.columnData.map(item => {
				item.checkArr.map(child => {
					if (item.hasCheckArr.includes(child.prop)) {
						resultTagArr.push({
							...child,
							...{
								type: item.type
							}
						})
					}
				})
			})

			this.columnTag = resultTagArr
		},
		/**
		 * [columnToggleAll 自定义列选择全部]
		 * @param  {[type]} item [description]
		 * @return {[type]}	  [description]
		 */
		columnToggleAll(row) {

			let _propArr = [] // prop的name值
			let _tagArr = [] // 存储已选择列
			let copyTag = [...this.columnTag] // 复制已选择标签

			// 1. 把_tagArr存储，用于最后赋值在已选择列
			row.checkArr.map((child, index) => {
				_propArr.push(child.prop)

				_tagArr.push({
					...child,
					...{
						id: row.id,
						type: row.type
					}
				})
			})

			if (row.checkArr.length === row.hasCheckArr.length) { // 全不选

				row.hasCheckArr = [] // 清空

				let curTag = copyTag.filter(item => {
					return !_propArr.includes(item.prop)
				})

				this.columnTag = curTag

			} else { // 全选
				row.hasCheckArr = _propArr // 赋值
				this.columnTag = arrayUnique([...copyTag, ..._tagArr], 'prop') // 去重
			}
		},
		/**
		 * [toggleTag 自定义列，删除标签]
		 * @param  {[type]} item [description]
		 * @return {[type]}	  [description]
		 */
		toggleTag(row, index) {
			let _columnIndex

			// 0. 不管是否找到，优先删除自个
			this.columnTag.splice(index, 1)

			// 2. 遍历查询自定义列，然后删除
			let copyData = this.columnData

			for (let i = 0, len = copyData.length; i < len; i++) {

				let iData = copyData[i]

				if (iData.id === row.id) { // 遍历到id

					let _index = iData.hasCheckArr.indexOf(row.prop)

					if (_index > -1) { // 把已经选择的自定义列删除
						iData.hasCheckArr.splice(_index, 1)
						break
					}
				}
			}
		},
		/**
		 * [submitData 自定义列表 提交数据, 需要同时提交两个自定义表单]
		 * @return {[type]} [description]
		 */
		submitData() {
			// 只需要传入id+prop即可保证唯一
			let jsonObj = {}

			this.columnTag.map(item => {

				let typeKey = item.type

				if (!!jsonObj[typeKey]) {
					jsonObj[typeKey].push(item.prop)
				} else {
					jsonObj[typeKey] = [item.prop]
				}
			})

			this.catchMemoryTable = jsonObj

			// 2. 设置table表头
			this.setTableColumn()

			this.drawerModalFlag = false

			setTableHead({
				table_id: this.tableHeadId,
				select_str: JSON.stringify(jsonObj)
			})
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
		 * [searchSspApp 应用列表-搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		searchSspApp(query) {
			this.sspAppLoad = true
			this.getSspAppList(query)
		},
		/**
		 * [clearSearchApp 清空应用列表]
		 * @return {[type]} [description]
		 */
		clearSearchApp(arr) {
			if (arr.length === 0) {
				this.sspAppList = [...this.catchSspAppList]
			}
		},
		/**
		 * [sspQueryChange 应用-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		appQueryChange(query) {
			if(!query) {
				this.sspAppList = [...this.catchSspAppList]
			}
		},
		/**
		 * [getSspAppList 应用列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getSspAppList: debounce(function(query) {
			let _params = {
				ud_id: this.filterSearch.ud_ids,
				page_size: (!!query || this.filterSearch.ud_ids.length) ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getAppList(_params).then(res => {
				this.sspAppLoad = false
				if (res.code === 200) {
					this.sspAppList = res.data.list

					if (!query) {
						this.catchSspAppList = res.data.list
					}
				}
			})
		}, 1000),

		/**
		 * [getMediaCompany 获取媒体公司数据]
		 * @return {[type]} [description]
		 */
		getMediaCompany() {
			getMediaCompany().then(res => {
				if (res.code === 200) {
					this.meidaCompanyArr = res.data.list
				}
			})
		},
		/**
		 * [_getAllAdType 获取广告类型]
		 * @return {[type]} [description]
		 */
		async _getAllAdType() {
			let storeUser = this.$store.state.user
			let resArr = storeUser.adTypeArr.length ? storeUser.adTypeArr : await this.getAllAdType()

			this.adTypeList = resArr
		},
		/********************************************
		*↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		********************************************/
	},
	watch: {
		/**
		 * 选择媒体
		 */
		'filterSearch.ud_ids': {
			handler: function(val) {
				this.getSspAppList()
			}
		},
		/**
		 * [ad_type_id_arr 监听广告场景的变化]
		 * @param  {[type]} newVal [description]
		 * @return {[type]}        [description]
		 */
		'filterSearch.ad_type_ids' (newVal) {
			let styleArr = this.$store.state.app.adStyleData
			let filterArr = []

			newVal.map(item => {
				styleArr.map(child => {
					if (item === child.parentId) {
						filterArr.push(child)
					}
				})
			})

			this.filterSearch.creative_types = [] // 重置数据
			this.adStyleList = filterArr
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
.tool-size12
	font-size: 12px
.console-table
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height: 32px
.chart-card
	width: 100%
.column_content
	.select_con
		/deep/ .ivu-tag
			span
				flex: 1
				height: 30px
				overflow: hidden
				display: -webkit-box
				-webkit-box-orient: vertical
				-webkit-line-clamp: 1
				word-break: break-all
.column-red
	color: #FF0000
	margin-left: 4px
/deep/ .column_content
	padding-left: 0px
	margin-top: 0px
	.col_detail
		margin-top: 0px
</style>
