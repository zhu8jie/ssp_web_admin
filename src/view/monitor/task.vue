<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}<span class="small-text">即监测任务，每一个数据监测需求都需要创建一个任务</span></h2>
				<div class="is-handler">
					<Button class="host" type="text" @click="doColumns">自定义列</Button>
					<Button v-if="_isShow_('add')" icon="ios-add" type="primary" @click="doCreate()">新建任务</Button>
				</div>
			</div>
			<div class="search-line" ref="search-line">
				<Select 
					class="i-margin-right-11 i-width-select mar-bot-10" 
					filterable
					clearable
					v-model="filterSearch.cp_id_arr"
					:transfer="true"
					placeholder="CP">
					<Option v-for="item in cpList" :value="item.id" :key="item.id">{{ item.name }}({{ item.id }})</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10" 
					filterable
					clearable
					v-model="filterSearch.product_id_arr"
					:transfer="true"
					placeholder="推广产品">
					<Option v-for="item in productList" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<Select 
					class="i-margin-right-11 i-width-select mar-bot-10"
					filterable
					clearable
					v-model="filterSearch.channel_id_arr"
					:transfer="true"
					placeholder="渠道">
					<Option v-for="item in channelList" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					filterable
					clearable
					v-model="filterSearch.os"
					:transfer="true"
					placeholder="推广平台">
					<Option v-for="item in osType" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<Input 
					type="textarea" 
					v-model.trim="filterSearch.task_id_arr_area" 
					class="i-margin-right-11 i-width-input-long mar-bot-10" 
					clearable 
					:rows="1" 
					:autosize="{maxRows:1, minRows: 1}" 
					placeholder="输入任务ID,多个用回车分隔"
				/>

				<Button type="primary" class="mar-bot-10" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!-- 任务ID -->
					<template slot-scope="{ row, index }" slot="id">
						<div class="flex-row">
							<span>{{row.id}}</span>
							<i class="iconfont icon-book" v-if="_isShow_('add')" title="查看任务" @click="viewTask(row)"></i>
						</div>
					</template>

					<!-- 推广产品 -->
					<template slot-scope="{ row, index }" slot="product_name">
						{{row.product.name}}
					</template>

					<!-- CP -->
					<template slot-scope="{ row, index }" slot="cp">
						{{row.cp.name}}
					</template>

					<!-- 渠道 -->
					<template slot-scope="{ row, index }" slot="channel">
						{{row.channel.name}}
					</template>

					<!-- 推广链接 -->
					<template slot-scope="{ row, index }" slot="cp_landing_page">
						<div class="flex-row" v-if="row.cp_landing_page">
							<p class="text-row-ellipsis" :title="row.cp_landing_page">{{row.cp_landing_page}}</p>
							<i class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="row.cp_landing_page" @click="copyContent"></i>
						</div>
					</template>

					<!-- CP监测链接 -->
					<template slot-scope="{ row, index }" slot="cp_click_url">
						<div class="flex-row" v-if="row.cp_click_url">
							<p class="text-row-ellipsis" :title="row.cp_click_url">{{row.cp_click_url}}</p>
							<i class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="row.cp_click_url" @click="copyContent"></i>
						</div>
					</template>

					<!-- 渠道监测链接 -->
					<template slot-scope="{ row, index }" slot="task_url">
						<div class="flex-row" v-if="row.task_url">
							<p class="text-row-ellipsis" :title="row.task_url">{{row.task_url}}</p>
							<i class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="row.task_url" @click="copyContent"></i>
						</div>
					</template>

					<!-- 推广平台 -->
					<template slot-scope="{ row, index }" slot="os_type">
						<span v-if="row.os === 1">Android</span>
						<span v-if="row.os === 2">IOS</span>
						<span v-if="row.os === 0">不限</span>
					</template>
					
					<!-- 入价(元) -->
					<template slot-scope="{ row, index }" slot="cp_price">
						{{row.cp_price | number2Thousand}}
					</template>

					<!-- 出价(元) -->
					<template slot-scope="{ row, index }" slot="channel_price">
						{{row.channel_price | number2Thousand}}
					</template>

					<!-- 需求量级 -->
					<template slot-scope="{ row, index }" slot="demand">
						<p class="text-row-ellipsis" :title="row.demand">{{row.demand}}</p>
					</template>

					<!-- 投放时间 -->
					<template slot-scope="{ row, index }" slot="timestamp">
						<p class="text-row-ellipsis" :title="row.timestamp">{{row.timestamp}}</p>
					</template>

					<!-- 考核内容 -->
					<template slot-scope="{ row, index }" slot="content">
						<p class="text-row-ellipsis" :title="row.content">{{row.content}}</p>
					</template>

					<!--创建时间-->
					<template slot-scope="{ row, index }" slot="created_at">
						{{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}
					</template>

					<!--操作-->
					<template slot-scope="{ row, index }" slot="handle">
						<Button type="text" v-if="_isShow_('add')" @click="doCreate(row)">编辑</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>

		<!-- 新建任务 -->
		<Drawer v-model="drawModalFlag" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建任务' : '编辑任务'">
			<Form ref="modalForm" :label-colon="true" :model="modalForm" :rules="rules" :label-width="125">
				<FormItem label="渠道" prop="channel_id">
					<Select v-model="modalForm.channel_id" :disabled="!!modalForm.id" placeholder="请选择渠道">
						<Option v-for="item in channelList" :value="item.id" :key="item.id">{{ item.name }}({{ item.id }})</Option>
					</Select>
				</FormItem>

				<FormItem label="CP" prop="cp_id">
					<Select v-model="modalForm.cp_id" :disabled="!!modalForm.id" placeholder="请选择CP">
						<Option v-for="item in cpList" :value="item.id" :key="item.id">{{ item.name }}({{ item.id }})</Option>
					</Select>
				</FormItem>

				<FormItem label="推广产品" prop="product_id">
					<Select v-model="modalForm.product_id" :disabled="!!modalForm.id" placeholder="请选择推广产品">
						<Option v-for="item in productList" :value="item.id" :key="item.id">{{ item.name }}</Option>
					</Select>
				</FormItem>

				<FormItem label="推广链接" prop="cp_landing_page">
					<Input maxlength="10000" v-model.trim="modalForm.cp_landing_page" placeholder="请输入推广链接"/>
				</FormItem>

				<FormItem label="CP监测链接" prop="cp_click_url">
					<Input maxlength="10000" v-model.trim="modalForm.cp_click_url" placeholder="请输入CP监测链接"/>
				</FormItem>

				<FormItem label="推广地区" prop="region">
					<Input maxlength="30" v-model.trim="modalForm.region" placeholder="请输入推广地区"/>
				</FormItem>

				<FormItem label="推广平台" prop="os">
					<Select filterable v-model="modalForm.os" placeholder="推广平台">
						<Option v-for="item in osType" :value="item.id" :key="item.id">{{ item.name }}</Option>
					</Select>
				</FormItem>

				<FormItem label="推广单价(入价)" prop="cp_price">
					<div class="form-item-flex">
						<InputNumber :min="0.01" :max="inputMaxNumber" placeholder="大于0，最多可填2位小数" :step="0.01" v-model="modalForm.cp_price"></InputNumber>
						<span class="unit">元</span>
					</div>
				</FormItem>

				<FormItem label="出价" prop="channel_price">
					<div class="form-item-flex">
						<InputNumber :min="0.01" :max="inputMaxNumber" placeholder="大于0，最多可填2位小数" :step="0.01" v-model="modalForm.channel_price"></InputNumber>
						<span class="unit">元</span>
					</div>
				</FormItem>

				<FormItem label="折扣系数" prop="discount_rate">
					<div class="form-item-flex">
						<InputNumber :max="100" :min="1" :step="1" placeholder="大于0小于等于100的整数，单位%" v-model="modalForm.discount_rate"></InputNumber>
						<span class="unit">%</span>
					</div>
				</FormItem>

				<FormItem label="需求量级" prop="demand">
					<Input maxlength="50" show-word-limit v-model.trim="modalForm.demand" placeholder="请输入需求量级"/>
				</FormItem>

				<FormItem label="投放时间" prop="timestamp">
					<Input maxlength="50" show-word-limit v-model.trim="modalForm.timestamp" placeholder="请输入需求量级"/>
				</FormItem>

				<FormItem label="考核内容" prop="content">
					<Input type="textarea" maxlength="100" show-word-limit v-model.trim="modalForm.content" :rows="4" :autosize="{maxRows:4, minRows: 4}" placeholder="请输入考核内容"/>
				</FormItem>

			</Form>
			<div class="drawer-footer">
				<Button @click="drawModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
					{{!submitClock ? '提交' : '保存中...'}}
				</Button>
			</div>
		</Drawer>

		<!--自定义列-->
		<custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>

		<!-- 查看任务 -->
		<view-task ref="viewTask" @on-success="successFn"></view-task>
	</div>
</template>

<script>
import { formatDate, debounce, number2Thousand } from '@/libs/tools'
import { showTitle, regNum2Precision, regNumPositiveInteger, inputMaxNumber } from '@/libs/util'
import { getTaskList, addNewTask, modTask, getCPList, getAppList, getChannelList } from '@/api/monitor'
import Clipboard from 'clipboard'
import { getTaskCol } from './colList.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { columnFn } from '@/mixin/custom-column.js'
import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
import viewTask from './module/view-task' // 查看任务

export default {
	name: 'task-manage',
	mixins: [ tableHeight, inPageAccess, columnFn],
	components: {
		customColumn,
		viewTask
	},
	data() {
		const validatePrice = (rule, value, callback) => {
			if (value === null) {
				callback(new Error('请填写价格'));
			} else if (!regNum2Precision.test(value) || value <= 0 || value > inputMaxNumber) {
				callback(new Error('大于0的任意实数，最多可填两位小数'))
			} else {
				callback()
			}
		};
		const validateRate = (rule, value, callback) => {
			if (value === null) {
				callback(new Error('请输入折扣系数'));
			} else if (value <= 0 || value > 100 || !regNumPositiveInteger.test(value)) {
				callback(new Error('大于0小于等于100的整数'))
			} else {
				callback()
			}
		};
		return {
			inputMaxNumber: inputMaxNumber,
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,
			drawModalFlag: false, // 抽屉开关
			tableLoadFlag: true, // table的loading
			catchTableColList: getTaskCol(this), // 列

			cpList: [], // CP列表
			productList: [], // 推广产品列表
			channelList: [], // 渠道列表

			modalForm: { // 修改的modal的form表单
				channel_id: '', // 渠道
				cp_id: '', // CP
				product_id: '', // 推广产品
				cp_landing_page: '', // 推广链接
				cp_click_url: '', // CP监测链接
				region: '', // 推广地区
				os: '', // 推广平台
				cp_price: 0.01, // 推广单价(入价)
				channel_price: 0.01, // 出价
				discount_rate: 1, // 折扣系数
				demand: '', // 需求量级
				timestamp: '', // 投放时间
				content: '' // 考核内容
			},
			rules: { // modal的form正则
				channel_id: [{required: true, message: '请选择渠道'}],
				cp_id: [{required: true, message: '请选择CP'}],
				product_id: [{required: true, message: '请选择推广产品'}],
				cp_landing_page: [{required: true, message: '请输入推广链接'}],
				cp_click_url: [{required: true, message: '请输入CP监测链接'}],
				region: [{required: true, message: '请输入推广地区'}],
				os: [{required: true, message: '请选择推广平台'}],
				cp_price: [{required: true, validator: validatePrice}],
				channel_price: [{required: true, validator: validatePrice}],
				discount_rate: [{required: true, validator: validateRate}]
			},
			filterSearch: { // 筛选条件
				cp_id_arr: '', // CP ID数组
				product_id_arr: '', // 产品ID数组
				channel_id_arr: '', // 渠道ID数组
				task_id_arr_area: '', // 任务ID数组
				os: '' // 操作系统, 1=Android, 2=iOS
			},

			colDatList: [], // 第三方平台账号数据
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
		},
		/**
		 * [osType 应用平台]
		 * @return {[type]} [description]
		 */
		osType() {
			return this.$store.getters.osType
		}
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		},
		number2Thousand(val) {
			return number2Thousand(val / 100)
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	created() {
		this.initData()
	},
	methods: {
		initData() {

			this.getTableColumns()

			if (this._hasPageAccess()) {
				this.getTaskList()

				this.getCPList()
				this.getAppList()
				this.getChannelList()
			}
		},
		/**
		 * [getTaskList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getTaskList() {
			this.tableLoadFlag = true

			let _filter = this.filterSearch

			let params = {
				page_size: this.pageSize,
				page_num: this.currentPage
			}

			!!_filter.cp_id_arr && (params.cp_id_arr = [_filter.cp_id_arr])
			!!_filter.product_id_arr && (params.product_id_arr = [_filter.product_id_arr])
			!!_filter.channel_id_arr && (params.channel_id_arr = [_filter.channel_id_arr])
			!!_filter.task_id_arr && (params.task_id_arr = [_filter.task_id_arr])
			!!_filter.os && (params.os = _filter.os)

			getTaskList(params).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total
					this.colDatList = res.data.tasks
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [submitForm 新建/编辑渠道]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitForm(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					let form = {...this.modalForm}

					// 1.强制处理入价和出价
					form.cp_price = Math.round(form.cp_price * 100)
					form.channel_price = Math.round(form.channel_price * 100)

					// 2.强制处理折扣系数, 取整
					form.discount_rate = parseInt(form.discount_rate)

					let proUrl = !!form.id ? modTask(form) : addNewTask(form)

					this.submitClock = true

					proUrl.then(res => {
						
						this.submitClock = false

						if (res.code === 200) {
							this.drawModalFlag = false
							this.$Message.success({content: !!form.id ? '新建成功' : '保存成功', duration: 3})
							this.getTaskList()
						} else {
							this.$Message.error({content: !!form.id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
						}
					}, err => {
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [viewTask 查看任务]
		 * @param  {[type]} row [description]
		 * @return {[type]}	 [description]
		 */
		viewTask(row) {
			this.$refs['viewTask'].initInject(row.id)
		},
		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList(val) {
			this.currentPage = 1

			// 多个广告位id，格式化
			let _idArr = []
			let _textIdTxt = this.filterSearch.task_id_arr_area
			if (!!_textIdTxt) {
				// _idArr = _textIdTxt.split(/[(\r\n)|(\ +)|(，)|(,,)]/).map(Number).filter(item => {
				_idArr = _textIdTxt.split(/[(\r\n)|(\ +)|(,,)]/).filter(item => {
					return !!item
				})
			}
			this.filterSearch.task_id_arr = Array.from(new Set([..._idArr]))

			this.getTaskList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getTaskList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getTaskList()
		},
		/**
		 * [successFn 修改系数]
		 * @return {[type]} [description]
		 */
		successFn() {
			this.getTaskList()
		},
		/**
		 * [copyContent 赋值粘贴]
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
		},
		/**
		 * [toLink 新建/编辑]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		doCreate(row) {
			this.drawModalFlag = true

			if (row && row.id) {
				this.modalForm = {
					id: row.id,
					channel_id: row.channel_id, // 渠道
					cp_id: row.cp_id, // CP
					product_id: row.product_id, // 推广产品
					cp_landing_page: row.cp_landing_page, // 推广链接
					cp_click_url: row.cp_click_url, // CP监测链接
					region: row.region || '中国', // 推广地区
					os: row.os, // 推广平台
					cp_price: row.cp_price / 100, // 推广单价(入价)
					channel_price: row.channel_price / 100, // 出价
					discount_rate: row.discount_rate, // 折扣系数
					demand: row.demand, // 需求量级
					timestamp: row.timestamp, // 投放时间
					content: row.content // 考核内容
				}
			} else {
				this.modalForm = {
					channel_id: '', // 渠道
					cp_id: '', // CP
					product_id: '', // 推广产品
					cp_landing_page: '', // 推广链接
					cp_click_url: '', // CP监测链接
					region: '中国', // 推广地区
					os: '', // 推广平台
					cp_price: 0.01, // 推广单价(入价)
					channel_price: 0.01, // 出价
					discount_rate: 1, // 折扣系数
					demand: '', // 需求量级
					timestamp: '', // 投放时间
					content: '' // 考核内容
				}
			}
		},

		/****************以下为筛选内容，获取CP, 推广产品，渠道等 start**************************/
		/**
		 * [getCPList CP列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getCPList: debounce(function(query) {
			getCPList({page_num: 1}).then(res => {
				if (res.code === 200) {
					this.cpList = res.data.cp_list
				}
			})
		}, 1000),
		/**
		 * [getAppList 获取产品列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getAppList: debounce(function(query) {
			getAppList({page_num: 1}).then(res => {
				if (res.code === 200) {
					this.productList = res.data.apps
				}
			})
		}, 1000),
		/**
		 * [getChannelList 获取渠道列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getChannelList: debounce(function(query) {
			getChannelList({page_num: 1}).then(res => {
				if (res.code === 200) {
					this.channelList = res.data.channels
				}
			})
		}, 1000),
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.console-table
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
.form-item-flex
	display: flex
	align-items: center
	justify-content: space-between
	/deep/ .ivu-input-number
		flex: 1
		
	.unit
		margin-left: 10px
</style>
