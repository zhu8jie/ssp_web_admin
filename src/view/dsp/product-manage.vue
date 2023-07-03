<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('newAndEdit')" icon="ios-add" type="primary" @click="doCreate()">新建产品</Button>
				</div>
			</div>
			<div class="search-line">
				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					:max-tag-count="1"
					v-model="filterSearch.dsp_company_id_arr"
					:max-tag-placeholder="limitText"
					placeholder="公司名称/ID"
				>
					<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{ item.company_name }} (ID:{{item.id}})</Option>
				</Select>

				<Input class="i-margin-right-11 i-width-select" clearable v-model.trim="filterSearch.name_or_id" placeholder="输入产品名称或ID"/>

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!--产品名称/ID-->
					<template slot-scope="{ row }" slot="name">
						<p class="name-row-ellipsis" :title="row.name">{{row.name}}</p>
						<p class="tip-row-line"> ID:{{ row.id }}</p>
					</template>
					<!-- 公司名称/ID -->
					<template slot-scope="{ row }" slot="dsp_company_id">
						<p class="name-row-ellipsis" :title="row.dsp_company.company_name">{{row.dsp_company.company_name}}</p>
						<p class="tip-row-line"> ID:{{ row.dsp_company.id }}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('newAndEdit')" @click="doCreate(row)">修改</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="drawerFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建产品' : '修改产品'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="ruleBase" :label-width="100">
				<FormItem label="公司名称" prop="dsp_company_id">
					<Select
						filterable
						v-model="modalForm.dsp_company_id"
						placeholder="公司名称/ID"
					>
						<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{ item.company_name }} (ID:{{item.id}})</Option>
					</Select>
				</FormItem>
				<FormItem label="产品名称" prop="name">
					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.name" placeholder="请输入公司简称全拼"/>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="drawerFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
					{{!submitClock ? '提交' : '提交中...'}}
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { showTitle, regNumCnEnLine } from '@/libs/util'
import { getProductColumn } from './data/data'
import { dspProductAdd, dspProductMod, getDspProductList } from '@/api/dsp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { mapActions } from 'vuex'

export default {
	name: 'product-manage',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			dspCompanyList: [], // 筛选，公司名称

			// 搜索条件
			filterSearch: {
				product_id_arr: [], // 产品ID数组
				dsp_company_id_arr: [], // 预算方公司ID，多选
				name_or_id: '', // 搜索内容
			},

			tableColList: getProductColumn(this), // 列
			colDatList: [], // 公司列表
			tableLoadFlag: true, // table的loading

			drawerFlag: false, // 抽屉开关
			modalForm: { // 提交表单
				dsp_company_id: '',
				name: ''
			},
			ruleBase: { // form表单正则
				dsp_company_id: [{required: true, message: '请选择公司'}],
				name: [
					{required: true, message: '请输入产品名称'},
					{pattern: regNumCnEnLine, message: '产品名称只支持汉字、数字、英文、下划线'}
				]
			},

			submitClock: false, // 保存锁
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			}
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	created() {
		if (this._hasPageAccess()) {

			this.initLinkage() // 初始化联动

			this.getDspProductList()
		}
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
			this._getDspCompanyList() // 获取媒体公司数据
		},
		/**
		 * [getDspProductList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getDspProductList() {
			this.tableLoadFlag = true

			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			getDspProductList(params).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total
					this.colDatList = res.data.list
				}
			}, err=> {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [getAxiosParams 获取列表参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {}

			// 产品名称或ID
			!!_filter.name_or_id && (params.name_or_id = _filter.name_or_id)

			// 产品ID数组
			!!_filter.product_id_arr.length && (params.product_id_arr = _filter.product_id_arr)

			// DSP公司ID数组
			!!_filter.dsp_company_id_arr.length && (params.dsp_company_id_arr = _filter.dsp_company_id_arr)

			return params
		},
		/**
		 * [submitForm 新建/编辑]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitForm(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					this.submitClock = true

					let ProUrl = !!this.modalForm.id ? dspProductMod(this.modalForm) : dspProductAdd(this.modalForm)

					ProUrl.then(res => {

						this.submitClock = false

						if (res.code === 200) {

							this.drawerFlag = false

							this.$Message.success({ content: this.modalForm.id ? '修改成功' : '新建成功', duration: 3})

							this.getDspProductList()
						}
					}, err=> {
						this.submitClock = false
					})
				} else {
					this.$Message.error({content: this.$config.requiredText, duration: 3})
				}
			})
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getDspProductList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getDspProductList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getDspProductList()
		},
		/**
		 * [toLink 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		doCreate(row) {
			if (row && row.id) {
				// 编辑
				this.modalForm = {
					id: row.id,
					dsp_company_id: row.dsp_company_id,
					name: row.name
				}
			} else {
				this.modalForm = {
					dsp_company_id: '',
					name: ''
				}
			}

			this.$refs['modalForm'].resetFields()

			this.drawerFlag = true
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},

		/********************************************
		*↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
		********************************************/
		/**
		 * [_getDspCompanyList 获取媒体公司数据]
		 * @return {[type]} [description]
		 */
		async _getDspCompanyList(action) {
			let storeUser = this.$store.state.user
			let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList({page_size: 0, page_num: 1})

			this.dspCompanyList = resArr
		}
		/********************************************
		*↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		********************************************/
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
