<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="page-text">
					<span>待测试广告位：</span>今日<span class="number" style="color: #FF9900">{{sum.today_count}}</span>个， 全部<span class="number">{{sum.total_count}}</span>个
				</div>
				<div class="is-handler">
					<Button  icon="ios-add" type="primary" @click="batchCreate()">批量创建计划</Button>
				</div>
			</div>
			<div v-show="typeText" class="describe-type">
				{{typeText}}
			</div>
			<div class="search-line" ref="search-line">
				<DatePicker
					ref="dd"
					class="i-margin-right-11 i-width-date mar-bot-10"
					:transfer="true"
					type="daterange"
					format="yyyy-MM-dd"
					:value="datePickerTime"
					@on-change="datePickerChange"
					placeholder="任务创建日期"
					:clearable="true"
				/>
				<Select
					class="i-margin-right-11 i-width-select"
					v-model="filterSearch.os_type"
					placeholder="应用平台"
					:clearable="true"
				>
					<Option :value="1" >Android</Option>
					<Option :value="2" >IOS</Option>
				</Select>
				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					v-model="filterSearch.ad_type_id_arr"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="广告场景"
				>
					<Option v-for="item in adTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					v-model="filterSearch.creative_type_arr"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="广告样式"
				>
					<Option v-for="item in filterSearch.styleDataArr" :value="item.id" :key="item.id">{{ item.title }}</Option>
				</Select>
				<Input type="textarea" v-model.trim="filterSearch.dsp_company_short_name_textarea"
					   class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
					   placeholder="批量媒体简称"/>
				<Input type="textarea" v-model.trim="filterSearch.app_name_textarea"
					   class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
					   placeholder="批量应用名称"/>
				<Input type="textarea" v-model.trim="filterSearch.ssp_slot_name_textarea"
					   class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
					   placeholder="批量广告位名称"/>
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10"
					   v-model.trim="filterSearch.ssp_slot_id_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
					   placeholder="批量广告位ID"/>

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="nav-handle-group">
				<RadioGroup v-model="filterSearch.operate" type="button" @on-change="doFilterList">
					<Radio :label="0">全部<span>({{sum.total_count}})</span></Radio>
					<Radio v-for="it in operateCountStatusList" :key="it.value+'运营状态'" :label="it.value">{{it.label}}<span>({{it.number}})</span></Radio>
				</RadioGroup>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight-62" :no-data-text="noDataText" @on-selection-change="selectChange">
					<!-- 广告位名称 -->
					<template slot-scope="{ row }" slot="ssp_slot_id">
						<div class="control-flex">
							<div class="control-left">
								<p class="name-row-ellipsis" :title="row.ssp_slot_name">{{row.ssp_slot_name }}</p>
								<p class="tip-row-line">ID: {{ row.id }}</p>
							</div>
							<div class="control-right" @click="logShow(row)">
								<i class="iconfont icon-rizhi"/>
							</div>
						</div>
					</template>
					<!--触发条件-->
					<template slot-scope="{ row }" slot="operate">
						<p v-if="row.last_operate">
					 <span v-for="item in operate_text" v-if="item.value===row.last_operate.operate" :value="item.value"
						   :key="item.label +'运营状态' + row.id">{{item.label}}</span>
						</p>
						<p v-else>-</p>
					</template>
					<!--广告场景-->
					<template slot-scope="{ row }" slot="os_type">
						{{row.app.os_type === 1 ? 'Android' : row.app.os_type === 2 ? 'IOS' : '不限' }}
					</template>
					<!--广告场景-->
					<template slot-scope="{ row }" slot="ad_type_id">
						{{ adTypeId2Text(row.ad_type_id) }}
					</template>
					<!--广告样式-->
					<template slot-scope="{ row }" slot="creative_type">
						{{ creativeId2Text(row.creative_type) }}
					</template>
					<!-- 素材尺寸比例 -->
					<template slot-scope="{ row }" slot="ad_ratio">
						{{ row.ratios | filterAdRatio }}
					</template>
					<!--应用名称/ID-->
					<template slot-scope="{ row }" slot="app_id">
						<p class="name-row-ellipsis" :title="row.app.app_name">{{ row.app.app_name }}</p>
						<p class="tip-row-line">ID: {{ row.app_id }}</p>
					</template>
					<!--媒体名称/ID-->
					<template slot-scope="{ row }" slot="ud_id">
						<p class="name-row-ellipsis" :title="row.user_dev.company_short_name">{{ row.user_dev.company_short_name }}</p>
						<p class="tip-row-line">ID: {{ row.ud_id }}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row }" slot="created_at">
						<p>{{row.created_at  | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row }" slot="updated_at">
						<p v-if="row.last_operate">{{row.last_operate.created_at  | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
						<p v-else>-</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row }" slot="action">
						<Button type="text"  :to="toView(row)">查看</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<!-- 操作日志 -->
		<operationLog v-model="logModal" :ids="log_id"></operationLog>
	</div>
</template>

<script>
import {showTitle, filterBatchQuery, localRead} from '@/libs/util'
import {formatDate} from '@/libs/tools'
import { getPanelColumns } from '../columns'
import { getTestWaitingList } from '@/api/plan'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import {commonMixin} from '@/mixin/basic-common-class.js'
import operationLog from '@/components/operation-log/index.vue'
export default {
	name: 'ssp-plan-template',
	mixins: [tableHeight, inPageAccess, commonMixin],
	components: {operationLog},
	data() {
		return {
			logModal: false,
			log_id: 0,
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,
			datePickerTime: null, // 时间选择器
			// 搜索条件
			filterSearch: {
				operate: 0, // 状态
				os_type: 0, // 应用平台
				created_since: null, // 任务时间开始的时间
				created_until: null, // 任务时间结束的时间
				ad_type_id_arr: [], // 广告类型ID数组
				creative_type_arr: [], // 广告创意ID

				// 备用数组
				styleDataArr: [], // 广告样式列表 和 广告场景联动
				dsp_company_short_name_arr: [], // 媒体简称
				dsp_company_short_name_textarea: null, // 媒体简称文本
				app_name_arr: [], // 应用名称
				app_name_textarea: null, // 应用名称文本
				ssp_slot_name_arr: [], // 广告位名称
				ssp_slot_name_textarea: null, // 广告位名称文本
				ssp_slot_id_arr: [], // 广告位ID
				ssp_slot_id_textarea: null, // 广告位ID文本
			},

			tableColList: getPanelColumns(this), // 列
			colDatList: [], // 公司列表
			tableLoadFlag: true, // table的loading
			selectID: [], // 选中的值
			sum: {
				today_count: 0, // 今天的总数
				total_count: 0, // 总数
				verified_num: 0, // 审核通过
				retest_num: 0, // 重新测试
				buy_num: 0, // 恢复采买
			},
			typeText: '', // 样式的文本
			operate_text: [
				{value: 6, label: '审核通过'},
				{value: 4, label: '重新测试'},
				{value: 1, label: '恢复采买'},
			],
			operateCountStatusList: []
		}
	},
	watch: {
		/**
		 * [ad_type_id_arr 监听广告场景的变化]
		 * @param  {[type]} newVal [description]
		 * @return {[type]}        [description]
		 */
		'filterSearch.ad_type_id_arr'(newVal) {
			let styleArr = this.$store.state.app.adStyleData
			let filterArr = []

			newVal.map(item => {
				styleArr.map(child => {
					if (item === child.parentId) {
						filterArr.push(child)
					}
				})
			})

			this.filterSearch.creative_type_arr = [] // 重置数据
			this.filterSearch.styleDataArr = filterArr
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		},
		/**
		 * [filterAdRatio 列表中尺寸格式化]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		filterAdRatio(item) {
			if (!item.length) {
				return ''
			}

			let _arr = []
			item.map(_ => {
				_arr.push(`${_.width_ratio}:${_.height_ratio}`)
			})
			return _arr.join()
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getPanelList()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': true})// search-line的高度
	},
	methods: {
		batchCreate() {
			if (!this.selectID.length) {
				this.$Message.warning('请先勾选广告位')
				return
			}
			this.$Modal.confirm({
				title:'您已选择' + this.selectID.length + '个广告位，确认批量创建计划吗？',
				onOk: () => {
				localStorage.setItem('waitSelectId', this.selectID)
				this.$router.push({
					path: '/ssp/plan/edit',
					query: {
						type: 'new',
						from: 'panel',
					},
				})
				},
				onCancel: () => {

				}
			})


		},
		/**
		 * [toView 查看]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toView(row) {
			return `/ssp/ad/view?slot_id=${row.id}&ud_id=${row.ud_id}`
		},

		/**
		 * [logShow 点击显示操作日志]
		 * @return {[type]} [description]
		 */
		logShow(row) {
			this.logModal = true
			this.log_id = row.id
		},
		/**
		 * [selChange 获取选中的值]
		 * @param  {[type]} item [description]
		 * @return {[type]}     [description]
		 */
		selectChange(select) {
			let _arr = []
			select.map(item => {
				_arr.push(item.id)
			})
			this.selectID = _arr
		},
		/**
		 * [creativeId2Text 根据createId 找到对应 text]
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		creativeId2Text(id) {
			let _arr = this.$store.state.app.adStyleData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [creativeId2Text 根据createId 找到对应 text]
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		adTypeId2Text(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [getPanelList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getPanelList() {
			this.selectID = []
			this.tableLoadFlag = true

			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			getTestWaitingList(params).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total
					this.sum.total_count = res.data.total_count
					this.sum.today_count = res.data.today_count
					this.colDatList = res.data.list ? res.data.list : []
					this.selectText(res.data.group_by_ad_type)
					// 运营状态的修改
					let operateStatus = this.operate_text
					let operate_count =  res.data.group_by_operate ? res.data.group_by_operate : []
					let operateArr = []
					operate_count.map(item => { operateArr.push(item.operate) })
					let operateList = []
					operateStatus.map(item => {
						if (operateArr.includes(item.value)) {
							operate_count.map(it => {
								if (it.operate === item.value) {
									item.number = it.count
									operateList.push(item)
								}
							})
						} else {
							item.number = 0
							operateList.push(item)
						}
					})
					this.operateCountStatusList = operateList // 运营状态

				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		selectText(item) {
			if(!item){
				this.typeText = ''
				return
			}
			let select = [ //  选择广告场景
				{
					id: 3,
					title: '开屏广告',
					num: 0
				},
				{
					id: 1,
					title: '原生信息流广告',
					num: 0
				},
				{
					id: 2,
					title: 'Banner广告',
					num: 0
				},
				{
					id: 4,
					title: '插屏广告',
					num: 0
				},
				{
					id: 5,
					title: '激励视频广告',
					num: 0
				},
				{
					id: 6,
					title: '长视频广告',
					num: 0
				},
				{
					id: 8,
					title: '交互广告',
					num: 0
				}
			]
			item.map(it => {
				if (it.ad_type_id) {
					select.map(its => {
						if (its.id === it.ad_type_id) {
							its.num = it.count
						}
					})
				}
			})
			let text = ''
			select.map(its => {
				if (its.num > 0) {
					text += its.title + '类' + its.num + '个，'
				}
			})
			text = text.substring(0, text.length - 1)
			this.typeText = text
		},
		/**
		 * [getAxiosParams 获取列表参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {
			let _filter = this.filterSearch
			let params = {
				ad_type_id_arr: _filter.ad_type_id_arr, // 广告场景ID数组
				creative_type_arr: _filter.creative_type_arr, // 广告样式ID数组
			}
			!!_filter.operate && (params.operate = _filter.operate) // 广告位状态
			!!_filter.os_type && (params.os_type = _filter.os_type) // 应用平台
			_filter.created_since ? params.created_since = Date.parse(new Date(_filter.created_since)) / 1000 : '' // 创建时间的开始
			_filter.created_until ? params.created_until = Date.parse(new Date(_filter.created_until)) / 1000 : '' // 创建时间的结束

			!!_filter.ssp_slot_id_arr.length && (params.ssp_slot_id_arr = _filter.ssp_slot_id_arr) // 广告位ID数组
			!!_filter.ssp_slot_name_arr.length && (params.ssp_slot_name_arr = _filter.ssp_slot_name_arr) // 广告位名称数组

			!!_filter.dsp_company_short_name_arr.length && (params.dsp_company_short_name_arr = _filter.dsp_company_short_name_arr) // 媒体名称数组
			!!_filter.app_name_arr.length && (params.app_name_arr = _filter.app_name_arr) // 应用名称数组

			return params
		},
		/**
		 * [datePickerChange 时间的选择]
		 * @return {[type]} [description]
		 */
		datePickerChange(e) {
			if (e[0]) {
				this.filterSearch.created_since = e[0]
				this.filterSearch.created_until = e[1] + ` 23:59:59`
			} else {
				this.filterSearch.created_since = null
				this.filterSearch.created_until = null
			}
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			let _filter = this.filterSearch
			// 媒体名称数组
			_filter.dsp_company_short_name_arr = filterBatchQuery({value: _filter.dsp_company_short_name_textarea})
			// 应用名称数组
			_filter.app_name_arr = filterBatchQuery({value: _filter.app_name_textarea})
			// 广告位名称数组
			_filter.ssp_slot_name_arr = filterBatchQuery({value: _filter.ssp_slot_name_textarea})
			// 广告位名称数组
			_filter.ssp_slot_id_arr = filterBatchQuery({value: _filter.ssp_slot_id_textarea, type: 'number'})
			this.getPanelList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getPanelList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.currentPage = 1
			this.pageSize = size
			this.getPanelList()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.mar-bot-10{
		vertical-align: top
		margin-bottom: 10px
	}
	.page-text {
		font-size 14px
		display inline-block
		margin-left 10px

		span {
			font-weight bold

			&.number {
				font-size 18px
			}
		}
	}
	.describe-type{
		margin: 10px 0 15px;
		height 35px
		line-height 35px
		border: 1px solid #e6e6e6;
		border-radius: 4px;
		padding-left: 15px;
		display: flex;
		justify-content: space-between;
	}
	.control-flex{
		position relative
		display flex
		justify-content space-between
		.control-left {
			width: 85%
		}
		.name-row-ellipsis {
			margin-top 5px
		}
		.control-right{
			line-height 48px
			padding-right 2px
			color #4083F8
			font-size 16px
			cursor pointer
		}
	}
</style>
