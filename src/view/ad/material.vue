<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
			</div>
			<div class="search-line" ref="search-line">
				<DatePicker class="i-margin-right-11 i-width-date mar-bot-10" :value="datePickerTime" :options="materialOptions" :transfer="true" :clearable="false" format="yyyy-MM-dd" type="daterange" placeholder="请选择日期" @on-change="datePickerChange"></DatePicker>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					filterable
					v-model="filterSearch.creative_type_arr"
					placeholder="广告位类型"
					multiple
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
						<Option v-for="child in item.children" :key="child.value" :value="child.value" >{{ child.label }}</Option>
					</OptionGroup>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.dsp_company_id_arr"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="公司名称/ID"
				>
					<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
				</Select>

				<!-- 预算位名称 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.dsp_slot_id_arr"
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

				<!-- 广告位名称 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.ssp_slot_id_arr"
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

				<Input class="i-width-input-small i-margin-right-11 mar-bot-10" clearable v-model.trim="filterSearch.title" type="text" maxlength="2000" placeholder="请输入标题" />
				<Input class="i-width-input-small i-margin-right-11 mar-bot-10" clearable v-model.trim="filterSearch.desc" type="text" maxlength="2000" placeholder="请输入描述" />
				<Input class="i-width-input-small i-margin-right-11 mar-bot-10" clearable v-model.trim="filterSearch.landing_page" type="text" maxlength="2000" placeholder="请输入落地页链接" />

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="materialColumns" :data="materialDataList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!--日期-->
					<template slot-scope="{ row }" slot="date">
						{{row.date}}
					</template>
					<!--公司名称/ID-->
					<template slot-scope="{ row }" slot="dsp_company_id">
						<p class="name-row-ellipsis" :title="row.company_name">{{ row.company_name }}</p>
						<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
					</template>
					<!--预算位名称/ID-->
					<template slot-scope="{ row }" slot="dsp_slot_id">
						<p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
						<p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
					</template>
					<!--广告位名称/ID-->
					<template slot-scope="{ row }" slot="ssp_slot_id">
						<p class="name-row-ellipsis" :title="row.ssp_slot_name">{{row.ssp_slot_name}}</p>
						<p class="tip-row-line"> ID:{{ row.ssp_slot_id }}</p>
					</template>
					<!--广告位类型-->
					<template slot-scope="{ row }" slot="ad_type_text">
						{{adTypeText(row.ad_type_id)}}-{{creativeId2Text(row.creative_type)}}
					</template>
					<!--广告交互-->
					<!-- 交互类型，1=打开网页，2=落地页下载，3=从落地页中获取下载地址与参数，4=deeplink -->
					<template slot-scope="{ row }" slot="ad_interaction">
						<template v-if="row.ad_interaction == 1">跳转</template>
						<template v-if="row.ad_interaction == 2">下载</template>
						<template v-if="row.ad_interaction == 3 || row.ad_interaction == 4">调起</template>
					</template>
					<!--素材-->
					<template slot-scope="{ row }" slot="material_json">
						<template v-if="row._source.pic.length || row._source.video.length">

							<div class="material-img-flex">
								<!-- 图片 -->
								<div class="material-column" v-for="(item, index) in row._source.pic" v-if="!!item" :key="`${index}_${item}`">
									<img :src="item">
									<div class="img-handle">
										<a href="javascript:void(0)" class="iconfont icon-zoom-up" @click="showImg(row, item, index, 'pic')"></a>
										<a :href="row.landing_page" target="_blank" class="iconfont icon-turn-link"></a>
									</div>
								</div>
								<!-- 视频 -->
								<div class="material-column" v-for="(item, index) in row._source.video" v-if="!!item" :key="`${index}_${item}`">
									<video :src="item" controls="controls">
										您的浏览器不支持 video 标签。
									</video>

									<div class="img-handle">
										<a href="javascript:void(0)" class="iconfont icon-zoom-up" @click="showImg(row, item, index, 'video')"></a>
										<a :href="row.landing_page" target="_blank" class="iconfont icon-turn-link"></a>
									</div>
								</div>
							</div>
							<p v-if="row.sizeText">{{row.sizeText}}</p>
							<p v-else :ref="row._source.ref"></p>
						</template>
					</template>
					<!--标题-->
					<template slot-scope="{ row }" slot="title">
						<a class="text-row-ellipsis" :title="row.title" :href="row.landing_page" target="_blank">{{row.title}}</a>
					</template>
					<!--描述-->
					<template slot-scope="{ row }" slot="desc">
						<a class="text-row-ellipsis" :title="row.title" :href="row.landing_page" target="_blank" v-html="row.desc"></a>
					</template>
					<!--物料数量-->
					<template slot-scope="{ row }" slot="ad_count">
						{{row.ad_count}}
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>

		<!-- 点击放大图片或者视频 -->
		<Modal
			v-model="modalFlag"
			:mask-closable="false"
			:width="646"
			:footer-hide="true"
			@on-cancel="modalToggle"
			class-name="vertical-center-modal"
		>
			<div class="modal-inner">
				<img v-if="modalObj.type === 'pic'" :src="modalObj.source">
				<video v-if="modalObj.type === 'video'" :src="modalObj.source" controls="controls">
					您的浏览器不支持 video 标签。
				</video>
			</div>
		</Modal>
	</div>
</template>

<script>
import { showTitle, regNum2Precision} from '@/libs/util'
import {commonMixin} from '@/mixin/basic-common-class.js'
import { debounce, throttle, formatDate, getImgNaturalDimension, getQueryString, miniCommonDivisor } from '@/libs/tools'
import { getSspSlotAdList } from '@/api/ssp'
import { getDspSlotList } from '@/api/dsp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { getAdMaterialList } from '@/api/ad'
import { inPageAccess } from '@/mixin/in-page-access.js'
import {mapActions} from 'vuex'

export default {
	name: 'ad-material',
	mixins: [commonMixin, tableHeight, inPageAccess],
	data() {
		return {
			tableId: 12,
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			datePickerTime: [], // 时间选择器
			filterSearch: { // 筛选条件
				creative_type_arr: [], // 广告样式ID多选
				dsp_company_id_arr: [], //预算方公司ID 多选
				dsp_slot_id_arr: [], //预算位ID 多选
				ssp_slot_id_arr: [], // 广告位ID 多选
				title: '', // 标题
				desc: '', // 描述
				landing_page: '' // 落地页
			},

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中

			dspCompanyList: [], // 预算位公司名称列表


			materialOptions: { // 创建支出时不可选择的时间范围
				disabledDate(date) {
					const time = date.getTime()
					const curTime = new Date().getTime()
					return time < new Date('2020-09-01 00:00:00').getTime() || time > curTime
				}
			},
			materialColumns: [
				{
					type: 'index',
					width: 36,
					align: 'center'
				},
				{
					title: '日期',
					slot: 'date',
					width: 90
				},
				{
					title: '公司名称/ID',
					slot: 'dsp_company_id',
					minWidth: 100
				},
				{
					title: '预算位名称/ID',
					slot: 'dsp_slot_id',
					width: 200
				},
				{
					title: '广告位名称/ID',
					slot: 'ssp_slot_id',
					width: 200,
				},
				{
					title: '广告位类型',
					slot: 'ad_type_text',
					width: 135
				},
				{
					title: '广告交互',
					slot: 'ad_interaction',
					width: 80
				},
				{
					title: '素材',
					slot: 'material_json',
					width: 300
				},
				{
					title: '标题',
					slot: 'title',
					minWidth: 200
				},
				{
					title: '描述',
					slot: 'desc',
					minWidth: 200
				},
				{
					title: '物料数量',
					slot: 'ad_count',
					width: 100
				}
			],
			materialDataList: [], // table数据
			tableLoadFlag: true, // table的loading

			modalFlag: false,
			modalObj: {} // 弹出层对象
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
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
			this.initData()
		}

		this.initLinkage() // 初始化联动
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		...mapActions([
			'getDspCompanyList',
			'tableInfoApi',
			'setTablePageApi'
		]),

		/**
		 * [initData 初始化加载数据]
		 * @return {[type]} [description]
		 */
		initData() {
			this.initDatePickerTime() // 初始化时间
			this._tableInfoApi() // 获取抽屉 表头
		},
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this._getDspCompanyList() // 预算位-公司名称
			this.getDspSlotList() // 预算位列表
			this.getSspSlotList() // 广告位列表
		},
		/**
		 * [_tableInfoApi 获取页面数据]
		 * @return {[type]} [description]
		 */
		async _tableInfoApi() {
			let storeUser = this.$store.state.user;
			let resArr = storeUser.pageCommonMemory ? storeUser.pageCommonMemory : await this.tableInfoApi()

			this.pageSize = resArr[`table_page_page_${this.tableId}`] || 10

			this.getAdMaterialList()
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
		 * [getTimeData 筛选-设置时间的默认值 - 默认当天]
		 * @return {[type]} [description]
		 */
		initDatePickerTime() {
			const localDate = formatDate(new Date(), 'yyyy-MM-dd') // 当前天
			this.datePickerTime = [localDate, localDate]
		},

		/**
		 * [datePickerChange 时间选择器发生变化]
		 * @param  {[type]} time [description]
		 * @return {[type]}      [description]
		 */
		datePickerChange(time) {
			this.datePickerTime = time
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
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getAdMaterialList()
		},
		/**
		 * [getAdMaterialList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getAdMaterialList() {
			this.tableLoadFlag = true

			getAdMaterialList({
				page_size: this.pageSize,
				page_num: this.currentPage,
				start_date: this.datePickerTime[0],
				end_date: this.datePickerTime[1],
				creative_type_arr: this.filterSearch.creative_type_arr,
				dsp_company_id_arr: this.filterSearch.dsp_company_id_arr,
				dsp_slot_id_arr: this.filterSearch.dsp_slot_id_arr,
				ssp_slot_id_arr: this.filterSearch.ssp_slot_id_arr,
				title: this.filterSearch.title,
				desc: this.filterSearch.desc,
				landing_page: this.filterSearch.landing_page
			}).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {

					res.data.list.map((item, index)=> {
						let _material_json = JSON.parse(item.material_json)

						let imgArr = []
						if(_material_json.pic && _material_json.pic.length) {
							_material_json.pic.map(src=> {
								if(!!src) {
									imgArr.push(src.replace(/u0026/g, '&'))
								}
							})
						}

						item._source = {
							pic: imgArr,
							video: !!_material_json.video ? [...[_material_json.video]] : [],
							ref: `table_ssp_slot_id_${item.dsp_slot_id}_${item.ssp_slot_id}_${index}`
						}
					})

					this.materialDataList = res.data.list
					this.total_count = res.data.total_count

					this.getImgSize()
				}
			}, err=> {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getAdMaterialList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size

			this.setTablePageApi({table_id: this.tableId, page_num: size}).then(res=> {
				this.getAdMaterialList()
			})
		},
		/**
		 * [getImgSize 显示图片尺寸]
		 * @return {[type]} [description]
		 */
		getImgSize() {
			try {
				let _this = this
				let isFirst = false // 默认只加载第一张图片尺寸即可

				this.materialDataList.map(item => {
					item._source.pic.map(child => {
						if (!!child) {
							// 此次可以优化处理，因为图片url中含有&w=和&h=, 可以直接从参数中获取尺寸
							let _w = getQueryString('w', child)
							let _h = getQueryString('h', child)
							if (!!_w && !!_h) {

								// 只加载第一张图片的尺寸
								if (!item.sizeText) {
									let _d = miniCommonDivisor(_w, _h)
									// 因为此处页面还未渲染
									item.sizeText = `${_w}*${_h} (${_w/_d}:${_h/_d})`
								}
							} else {

								if (!isFirst) {
									getImgNaturalDimension(child, function(size) {
										isFirst = true
										let _d = miniCommonDivisor(size.width, size.height)
										_this.$refs[`${item._source.ref}`].innerHTML = `${size.width}*${size.height} (${size.width/_d}:${size.height/_d})`
									})
								}
							}
						}
					})
				})
			} catch (e) {
				console.log(e)
			}
		},
		/**
		 * [showImg 放大图片]
		 * @param  {[type]} row   [description]
		 * @param  {[type]} item  [当前link]
		 * @param  {[type]} index [当前index]
		 * @param  {[type]} type [显示类型  pic/video]
		 * @return {[type]}       [description]
		 */
		showImg(row, item, index, type) {
			this.modalFlag = !this.modalFlag

			this.modalObj = {
				type,
				source: item
			}
		},
		/**
		 * [modalToggle 关闭浮层]
		 * @return {[type]} [description]
		 */
		modalToggle() {
			this.modalFlag = false
			this.modalObj = {}
		},
		/**
		 * [adTypeText 获取广告场景]
		 * @param  {[type]} id [id=>text]
		 * @return {[type]}    [description]
		 */
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [creativeId2Text 根据createId 找到对应 text]
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		creativeId2Text(id) {
			let _arr = this.$store.state.app.adStyleData;
			let result = _arr.filter(item=> item.id == id)
			return result[0] ? result[0].title : ''
		},



		/********************************************
		*↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
		********************************************/
		/**
		 * [searchDspSlot 预算位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}       [description]
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
		 * @return {[type]}       [description]
		 */
		dspSlotQueryChange(query) {
			if(!query) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [getDspSlotList 预算位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}       [description]
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
		}, 1000),
		/**
		 * [searchSspSlot 广告位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}       [description]
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
		 * @return {[type]}       [description]
		 */
		sspSlotQueryChange(query) {
			if(!query) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
		},
		/**
		 * [getSspSlotList 广告位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}       [description]
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
		}, 1000)
		/********************************************
		*↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		********************************************/
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
/deep/ .ivu-select-default.ivu-select-multiple .ivu-select-selection
	max-height 32px
	overflow auto
.option-box
	.option-left
		text-overflow: ellipsis
		white-space: nowrap
		height: 20px
		line-height: 20px
		overflow: hidden
		float: left
		width: 200px
	.option-right
		float: right
		color: #ccc
		height: 20px
		line-height: 20px

a.text-row-ellipsis
	overflow: hidden
	display: -webkit-box
	-webkit-box-orient: vertical
	-webkit-line-clamp: 2
	word-break: break-word
.modal-inner
	margin-top: 40px
	text-align: center
	font-size: 0px
	height: 500px
	line-height: 500px
	img, video
		vertical-align: middle
		max-height: 100%
		max-width: 100%
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
.material-img-flex
	font-size: 0px
	text-align: left
	.material-column
		max-width: 80px
		cursor: pointer
		display: inline-block
		vertical-align: top
		margin-right: 6px
		height: 50px
		line-height: 50px
		font-size: 0px
		position: relative
		&:hover
			.img-handle
				display: block
	img, video
		max-width: 100%
		max-height: 100%
		vertical-align: middle
	.img-handle
		display: none
		position: absolute
		left: 0px
		top: 0px
		width: 100%
		height: 100%
		background-color: rgba(0,0,0,0.5)
		.iconfont
			display: block
			height: 25px
			line-height: 25px
			font-size: 12px
			color: #FFF
			text-align: center
			&:hover
				background-color: #4084F8
.console-table
	margin-top: 5px
</style>
