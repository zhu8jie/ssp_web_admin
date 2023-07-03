<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('newAndEdit')" icon="ios-add" type="primary" @click="doCreate()">新建模板</Button>
				</div>
			</div>
			<div class="search-line">
				<Input class="i-margin-right-11 i-width-select" clearable v-model.trim="filterSearch.name_or_id" placeholder="请输入模板名称或ID"/>

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!-- 展现控制 -->
					<template slot-scope="{ row }" slot="show_pv">
						{{row.show_pv}}次/天
					</template>
					<!-- 点击控制 -->
					<template slot-scope="{ row }" slot="click_pv">
						{{row.click_pv}}次/天
					</template>
					<!-- 成本 -->
					<template slot-scope="{ row }" slot="spend">
						{{row.spend / 100}}元/天
					</template>
					<!-- 前置条件 -->
					<template slot-scope="{ row }" slot="check_show_pv">
						<p v-if="row.check_show_pv > 0">广告展现大于{{row.check_show_pv}}次</p>
						<p v-if="row.check_click_pv > 0">广告点击大于{{row.check_click_pv}}次</p>
						<p v-if="row.check_show_pv === 0 && row.check_click_pv === 0">-</p>
					</template>
					<!-- 规则 -->
					<template slot-scope="{ row }" slot="ctr">
						<p v-if="row.cpc > 0">媒体CPC{{row.cpc_rule === 1 ? '小于' : '大于'}}{{row.cpc}}元</p>
						<p v-if="row.ctr > 0">点击率{{row.ctr_rule === 1 ? '小于' : '大于'}}{{row.ctr}}%</p>
						<p v-if="row.ctr === 0 && row.cpc === 0">-</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('newAndEdit') && row.related_test_plan_num === 0" @click="doCreate(row)">修改</Button>
						<Button type="text" v-if="_isShow_('delete') && row.related_test_plan_num === 0" @click="doDelete(row)">删除</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="drawerFlag" width="700" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建模板' : '修改模板'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="ruleBase" :label-width="90">
				<FormItem label="模板名称:" prop="name">
					<Input :maxlength="50" show-word-limit v-model.trim="modalForm.name" placeholder="请输入模板名称"/>
				</FormItem>
				<FormItem label="展现控制:" prop="show_pv">
					<div class="flex-row">
						<Input class="span-23" :maxlength="10" v-model.trim="modalForm.show_pv" placeholder="不超过100,000次"/>
						<div class="span-1">次/天</div>
					</div>
				</FormItem>

				<FormItem label="点击控制:" prop="click_pv">
					<div class="flex-row">
						<Input class="span-23" :maxlength="10" v-model.trim="modalForm.click_pv" placeholder="不超过100,000次"/>
						<div class="span-1">次/天</div>
					</div>
				</FormItem>

			 <FormItem label="成本控制:" prop="spend">
					<div class="flex-row">
						<Input class="span-23" :maxlength="10" v-model.trim="modalForm.spend" placeholder="不超过100,000元"/>
						<div class="span-1">元/天</div>
					</div>
				</FormItem>

				<div class="rule-group-name">
					<label>规则设置</label>
					<span class="red-tips">每半小时【规则脚本】执行一次</span>
				</div>

				<FormItem label="前置条件:" class="margin-bot-12" prop="check_show_pv">
					<div class="flex-row-4">
						<div class="span-3">广告展现pv</div>
						<Select
							class="span-2"
							filterable
							:value="2"
						>
							<Option v-for="item in prelimitRule" :value="item.value" :key="item.value">{{ item.name }}</Option>
						</Select>
						<Input class="span-18" :maxlength="10" v-model.trim="modalForm.check_show_pv" placeholder="不超过100,000次, 默认0表示不展示"/>
						<div class="span-1">次</div>
					</div>
				</FormItem>
				<FormItem prop="check_click_pv">
					<div class="flex-row-4">
						<div class="span-3">广告点击pv</div>
						<Select
							class="span-2"
							filterable
							:value="2"
						>
							<Option v-for="item in prelimitRule" :value="item.value" :key="item.value">{{ item.name }}</Option>
						</Select>

						<Input class="span-18" :maxlength="10" v-model.trim="modalForm.check_click_pv" placeholder="不超过100,000次, 默认0表示不展示"/>
						<div class="span-1">次</div>
					</div>
				</FormItem>

				<FormItem label="规则:" class="margin-bot-12" prop="cpc">
					<div class="flex-row-4">
						<div class="span-3">媒体CPC</div>
						<Select
							class="span-2"
							:clearable="true"
							v-model="modalForm.cpc_rule"
						>
							<Option v-for="item in limitRule" :value="item.value" :key="item.value">{{ item.name }}</Option>
						</Select>
						<Input class="span-18" :maxlength="10" v-model.trim="modalForm.cpc" placeholder="最多可填两位小数的数字, 默认0表示不限制"/>
						<div class="span-1">元</div>
					</div>
				</FormItem>

				<FormItem prop="ctr">
					<div class="flex-row-4">
						<div class="span-3">点击率</div>
						<Select
							class="span-2"
							:clearable="true"
							v-model="modalForm.ctr_rule"
						>
							<Option v-for="item in limitRule" :value="item.value" :key="item.value">{{ item.name }}</Option>
						</Select>
						<Input class="span-18" :maxlength="5" v-model.trim="modalForm.ctr" placeholder="最多可填两位小数的数字, 默认0表示不限制"/>
						<div class="span-1">%</div>
					</div>
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
import { showTitle, regNum2Precision, regNumber, regNumCnEnLine } from '@/libs/util'
import { getPlanTemColumns } from '../columns'
import { planTemplateAdd, planTemplateMod, planTemplateDel, getPlanTemplateList } from '@/api/plan'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { BigNumber } from 'bignumber.js'

export default {
	name: 'ssp-plan-template',
	mixins: [tableHeight, inPageAccess],
	data() {
		const validateNum = (rule, value, callback) => {
			if(!!value && (!regNumber.test(value) || value > 100000 || value < 0)) {
				callback(new Error(`请输入不超过100,000的整数`))
			} else {
				callback()
			}
		}
		const validatePre = (rule, value, callback) => {
			if(!!value && (!regNum2Precision.test(value) || value > 100000 || value < 0)) {
				callback(new Error(`请输入不超过100,000，最多两位小数的数字`))
			} else {
				callback()
			}
		}
		const validateNextRule = (rule, value, callback) => {
			if (value !== '' && (!regNum2Precision.test(value) || value > (rule.type === 'ctr' ? 100 : 100000))) {
				callback(new Error(`请输入不超过${rule.type === 'ctr' ? '100' : '100,000'}，最多两位小数的数字`))
			} else {
				if (this.modalForm[`${rule.type}_rule`] === '' && value !== '') {
					callback(new Error('请选择限制关系'))
				} else {
					callback()
				}
			}
		}
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			// 搜索条件
			filterSearch: {
				name_or_id: '' // 名称或code
			},

			tableColList: getPlanTemColumns(this), // 列
			colDatList: [], // 公司列表
			tableLoadFlag: true, // table的loading

			drawerFlag: false, // 抽屉开关
			modalForm: { // 提交表单
				name: '', // 模板名称
				show_pv: '', // 展现控制
				click_pv: '', // 点击控制
				spend: '', // 成本控制
				check_show_pv: '', // 规则前置-广告展现
				check_click_pv: '', // 规则前置-广告点击
				cpc_rule: '', // 规则设置-媒体CPC条件, 1小于, 2大于
				cpc: '', // 规则设置-媒体CPC，单位：分
				ctr_rule: '', // 规则设置-点击率条件, 1小于, 2大于
				ctr: '' // 规则设置-点击率
			},
			ruleBase: { // form表单正则
				name: [
					{required: true, message: '请输入标签名称'},
					{pattern: regNumCnEnLine, message: '标签名称只支持汉字、数字、英文、下划线'}
				],
				show_pv: [{required: false, validator: validateNum}],
				click_pv: [{required: false, validator: validateNum}],
				spend: [{required: false, validator: validatePre}],
				check_show_pv: [{required: false, validator: validateNum}],
				check_click_pv: [{required: false, validator: validateNum}],
				cpc: [{required: false, type: 'cpc', validator: validateNextRule}],
				ctr: [{required: false, type: 'ctr', validator: validateNextRule}]
			},
			prelimitRule: [
				{
					name: '大于',
					value: 2
				}
			],
			limitRule: [ // 大于/小于
				{
					name: '大于',
					value: 2
				},
				{
					name: '小于',
					value: 1
				}
			],

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
			this.getPlanTemplateList()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		/**
		 * [getPlanTemplateList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getPlanTemplateList() {
			this.tableLoadFlag = true

			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			getPlanTemplateList(params).then(res => {
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

			return params
		},
		/**
		 * [submitForm 新建/编辑]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitForm(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					let _form = {...this.modalForm}

					// 格式化处理数字
					_form.show_pv = !!_form.show_pv ? BigNumber(_form.show_pv).toNumber() : 0 // 展现控制
					_form.click_pv = !!_form.click_pv ? BigNumber(_form.click_pv).toNumber() : 0 // 点击控制
					_form.spend = !!_form.spend ? BigNumber(_form.spend).multipliedBy(100).toNumber() : 0 // 成本控制

					_form.check_show_pv = !!_form.check_show_pv ? BigNumber(_form.check_show_pv).toNumber() : 0 // 广告展现pv
					_form.check_click_pv = !!_form.check_click_pv ? BigNumber(_form.check_click_pv).toNumber() : 0 // 广告点击pv

					// 媒体CPC
					if(!!_form.cpc_rule) {
						_form.cpc = !!_form.cpc ? BigNumber(_form.cpc).toNumber() : 0 // 广告展现pv
					} else {
						delete _form.cpc_rule
						delete _form.cpc
					}

					// 点击率
					if(!!_form.ctr_rule) {
						_form.ctr = !!_form.ctr ? BigNumber(_form.ctr).toNumber() : 0 // 广告展现pv
					} else {
						delete _form.ctr_rule
						delete _form.ctr
					}

					this.submitClock = true

					let ProUrl = !!_form.id ? planTemplateMod(_form) : planTemplateAdd(_form)

					ProUrl.then(res => {

						this.submitClock = false

						if (res.code === 200) {

							this.drawerFlag = false

							this.$Message.success({ content: this.modalForm.id ? '修改成功' : '新建成功', duration: 3})

							this.getPlanTemplateList()
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
			this.getPlanTemplateList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getPlanTemplateList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getPlanTemplateList()
		},
		/**
		 * [toLink 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		doCreate(row) {
			if(row && row.id) {
				this.modalForm = {
					id: row.id,
					name: row.name, // 模板名称
					show_pv: row.show_pv || '', // 展现控制
					click_pv: row.click_pv || '', // 点击控制
					spend: !!row.spend ? BigNumber(row.spend).dividedBy(100).toNumber() : '', // 成本控制
					check_show_pv: row.check_show_pv || '', // 规则前置-广告展现
					check_click_pv: row.check_click_pv || '', // 规则前置-广告点击
					cpc_rule: row.cpc_rule || '', // 规则设置-媒体CPC条件, 1小于, 2大于
					cpc: !!row.cpc ? BigNumber(row.cpc).toNumber() : '', // 规则设置-媒体CPC，单位：分
					ctr_rule: row.ctr_rule || '', // 规则设置-点击率条件, 1小于, 2大于
					ctr: row.ctr || '' // 规则设置-点击率
				}
			} else {
				this.modalForm = {
					name: '', // 模板名称
					show_pv: '', // 展现控制
					click_pv: '', // 点击控制
					spend: '', // 成本控制
					check_show_pv: '', // 规则前置-广告展现
					check_click_pv: '', // 规则前置-广告点击
					cpc_rule: '', // 规则设置-媒体CPC条件, 1小于, 2大于
					cpc: '', // 规则设置-媒体CPC，单位：分
					ctr_rule: '', // 规则设置-点击率条件, 1小于, 2大于
					ctr: '' // 规则设置-点击率
				}
			}

			this.$refs['modalForm'].resetFields()
			this.drawerFlag = true
		},
		/**
		 * [doDelete 删除模块计划]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		doDelete(row) {
			this.$Modal.confirm({
				title: ' 确定删除计划模板？',
				content: '',
				onOk: () => {
					planTemplateDel({
						id_arr: [row.id]
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({ content: '删除成功', duration: 3 })
						}
						this.getPlanTemplateList()
					})
				}
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.flex-row
	display: flex
	.span-23
		flex: 1
	.span-1
		flex: 0 0 36px
		text-align: right
.flex-row-4
	display: flex
	.span-3
		flex: 0 0 78px
	.span-2
		margin: 0 10px
		flex: 0 0 100px
	.span-1
		flex: 0 0 36px
		text-align: right
.rule-group-name
	margin-top: 40px
	margin-bottom: 10px
	display: flex
	align-items: center
	line-height: 34px
	label
		text-align: right
		width: 76px
		font-weight: bold
	.red-tips
		color: #ff0000
		margin-left: 15px
</style>
