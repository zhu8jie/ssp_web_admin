<template>
	<div>
		<Card dis-hover :bordered="false">
			<div class="page-title">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button class="host" type="text" @click="doColumns">自定义列</Button>
				</div>
			</div>
			<div class="search-line">
				<Select
					class="i-margin-right-11 i-width-select"
					filterable
					multiple
					v-model="filterSearch.ud_id"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="公司简称/ID"
				>
					<Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
				</Select>
				<Select
					class="i-margin-right-11 i-width-select"
					v-model="filterSearch.type"
					placeholder="媒体类型"
					:clearable="true"
				>
					<Option :value="1" >直媒</Option>
					<Option :value="2" >ssp</Option>
				</Select>
				<Input class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.search_text" placeholder="请输入账户名称或ID" :clearable="true" />
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<div class="nav-handle-group">
				<RadioGroup v-model="filterSearch.status" type="button" @on-change="doFilterList">
					<Radio label="">全部<span>({{count}})</span></Radio>
					<Radio label="1">正常<span>({{valid_count}})</span></Radio>
					<Radio label="3">封禁<span>({{stop_count}})</span></Radio>
					<Radio label="2">未激活<span><span style="color:#F72D17">({{invalid_count}})</span></span></Radio>
				</RadioGroup>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!--账户名称/ID-->
					<template slot-scope="{ row }" slot="ud_id">
						<div class="ud-handle clearfix">
							<!-- 未激活，不能登录 -->
							<div class="exit-box" title="登录" @click="toLoginMedia(row)" v-if="_isShow_('mediaLogin')">
								<i class="iconfont icon-exit"></i>
							</div>
							<div class="ud-account">
								<p class="name-row-ellipsis" :title="row.dev_account">{{row.dev_account}}</p>
								<p class="tip-row-line">ID: {{ row.ud_id }}</p>
							</div>
						</div>
					</template>

					<!--公司主体名称-->
					<template slot-scope="{ row }" slot="company_name">
						<p class="name-row-ellipsis" :title="row.company_name">{{row.company_name}}</p>
					</template>

					<!--账户状态-->
					<template slot-scope="{ row }" slot="status">
						<Badge v-if="row.status == 1" color="#339900" text="正常" />
						<Badge v-if="row.status == 2" color="#999999" text="未激活" />
						<Badge v-if="row.status == 3" color="#F72D17" text="封禁" />
						<Poptip v-if="row.status == 3 && row.status_desc" trigger="hover" :content="row.status_desc">
							<i class="iconfont icon-why"></i>
						</Poptip>
					</template>
				  <!--媒体类型-->
				  <template slot-scope="{ row }" slot="type">
					 <p v-if="row.type">{{row.type === 1 ? '直媒' : 'SSP'}}</p>
					 <p v-else>-</p>
				  </template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('view')" :to="toView(row)">查看</Button>
						<Button type="text" v-if="_isShow_('modify')" :to="toEdit(row)">修改</Button>
						<Button type="text" v-if="_isShow_('setting')" @click="showSetModal(row)">配置</Button>
						<Button type="text" v-if="row.status == 1 && _isShow_('banned')" @click="toBanned(row)">封禁</Button>
						<Button type="text" v-if="row.status == 3 && _isShow_('enable')" @click="toEnable(row)">启用</Button>
						<Button type="text" v-if="_isShow_('resetPsw')" @click="resetPsw(row)">重置密码</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<!--配置弹窗-->
		<Drawer class="setModal" title="配置" v-model="setModalFlag" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="700" :styles="drawStyles">
			<Form :label-width="120" ref="setModalForm" :label-colon="true" :model="setModalForm" :rules="setRuls">
				<FormItem label="账户名称(ID)">
					<Input disabled :value="`${setModalForm.dev_account}(${setModalForm.ud_id})`" placeholder="账户名称（ID）"></Input>
				</FormItem>
				<FormItem label="公司主体名称" >
					<Input disabled v-model.trim="setModalForm.company_name" placeholder="公司主体名称"></Input>
				</FormItem>
				<FormItem label="媒体类型" prop="type">
					<!-- {{setModalForm.status}} -->
					<RadioGroup v-model="setModalForm.type">
						<Radio :label="1">直媒</Radio>
						<Radio :label="2">ssp</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="账户状态" prop="status">
					<!-- {{setModalForm.status}} -->
					<RadioGroup v-model="setModalForm.status">
						<Radio label="1">正常</Radio>
						<Radio label="3">封禁</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="业务权限" prop="business">
					<div class="permiss-box">
						<div class="per-item">
							<p>接入方式</p>
							<!-- {{accessType}} -->
							<CheckboxGroup v-model="accessType">
								<Checkbox v-for="item in accessTypeList" :label="item.id" :key="item.id">{{item.name}}</Checkbox>
							</CheckboxGroup>
						</div>
						<!-- {{platform_third}} -->
						<div class="per-item" v-if="isShowSDKFlag">
							<p>第三方SDK权限</p>
							<CheckboxGroup v-model="platform_third">
								<Checkbox v-for="item in platform3rdList" :label="item.id" :key="item.id">{{item.name}}</Checkbox>
							</CheckboxGroup>
						</div>
						<div class="per-item">
							<p>广告场景</p>
							<!-- {{ad_type_support}} -->
							<CheckboxGroup v-model="ad_type_support">
								<Checkbox v-for="item in catchAdTypeList" :label="item.id" :key="item.id">{{item.name}}</Checkbox>
							</CheckboxGroup>
						</div>
						<div class="per-item" v-if="isShowRenderFlag">
							<p>渲染方式</p>
							<!-- {{render_type}} -->
							<CheckboxGroup v-model="render_type">
								<Checkbox v-for="item in renderTypeList" :label="item.id" :key="item.id">{{item.name}}</Checkbox>
							</CheckboxGroup>
						</div>
					</div>
				</FormItem>

				<FormItem label="合作主体" prop="cooperation_company">
					<RadioGroup v-model="setModalForm.cooperation_company">
						<Radio :label="1">聚量</Radio>
						<Radio :label="2">鼎广</Radio>
					</RadioGroup>
				</FormItem>

				<FormItem label="合同有效期" prop="cooperation_time">
					<DatePicker type="daterange" format="yyyy-MM-dd" v-model="setModalForm.cooperation_time" placeholder="请选择合同有效期" style="width: 240px"></DatePicker>
				</FormItem>

				<!-- 发票类型-{{setModalForm.invoice_type}}, 发票项目-{{setModalForm.invoice_project}},
				是否补扣其他税税率-{{setModalForm.is_cut_other_tax}}, 结算周期-{{setModalForm.settlement_period}} -->
				<FormItem label="财务信息" prop="invoice_type">
					<div class="permiss-box">
						<div class="per-item">
							<p>发票类型（发票税率）</p>
							<RadioGroup v-model="setModalForm.invoice_type">
								<Radio :label="1">增值税普通发票</Radio>
								<Radio :label="2">增值税专用发票（3%）</Radio>
								<Radio :label="3">增值税专用发票（6%）</Radio>
							</RadioGroup>
						</div>
						<div class="per-item">
							<p>发票项目</p>
							<RadioGroup v-model="setModalForm.invoice_project">
								<Radio :label="1">广告发布费</Radio>
								<Radio :label="2">非广告发布费的其他项目</Radio>
							</RadioGroup>
						</div>
						<div class="per-item">
							<p>其他税税率&nbsp;&nbsp;{{otherTax}}%</p>
							<Checkbox v-model="setModalForm.is_cut_other_tax" :true-value="1" :false-value="2">是否补扣</Checkbox>
							<p>补扣其他税税率&nbsp;&nbsp;{{setModalForm.is_cut_other_tax === 1 ?  otherTax : 0}}%</p>
						</div>

						<div class="per-item">
							<p>结算周期</p>
							<RadioGroup v-model="setModalForm.settlement_period">
								<Radio :label="1">预付</Radio>
								<Radio :label="2">次月月底</Radio>
								<Radio :label="3">次次25日前</Radio>
								<Radio :label="4">次次月底</Radio>
							</RadioGroup>
						</div>
					</div>
				</FormItem>

			</Form>
			<div class="drawer-footer">
				<Button style="margin-right: 20px" @click="closeSetModal">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitSet('setModalForm')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>

		<!--重置密码-->
		<Drawer v-model="pswModalFlag" :mask-closable="false" :closable="false" title="重置密码" width="500" :styles="drawStyles">
			<Form :label-width="120" :rules="pswRuleCustom" :model="pswFormCustom" ref="pswFormCustom">
				<FormItem label="输入密码:" prop="passwd">
					<Input type="password" :maxlength="20" v-model.trim="pswFormCustom.passwd" placeholder="请输入密码"></Input>
				</FormItem>
				<FormItem label="确认密码:" prop="passwdCheck">
					<Input type="password" :maxlength="20" v-model.trim="pswFormCustom.passwdCheck" placeholder="请输入确认密码"></Input>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="closePswModal" style="margin-right: 20px">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitPasswd('pswFormCustom')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>

		<!--审核拒绝/封禁弹窗-->
		<Drawer v-model="bannedModalFlag" title="确定封禁该账户么？" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500" :styles="drawStyles">
			<Form ref="bannedForm">
				<FormItem label="">
					<Input v-model.trim="bannedReason" show-word-limit maxlength="50" type="textarea" :rows="6" placeholder="封禁原因，不超过50字，必填" />
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancleBanned">取消</Button>
				<Button type="primary" :loading="submitClock" @click="trueBanned('banned')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>

		<!--自定义列-->
		<custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { getUnion, randomNumber, formatDate } from '@/libs/tools'
import { getMediaList, mediaResetPwd, getMediaConfigInfo, setMediaDevConfig, setMediaDevStatus } from '@/api/ssp'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { columnFn } from '@/mixin/custom-column.js'
import customColumn from '@/components/local-custom-column/custom-column' // 自定义列

export default {
	name: 'midia-manage',
	mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
	components: {
		customColumn
	},
	data() {
		const validatePassCheck = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请再次输入密码'))
			} else if (value !== this.pswFormCustom.passwd) {
				callback(new Error('两次输入密码不一致!'))
			} else {
				callback()
			}
		}
		const validateBusCheck = (rule, value, callback) => {
			if (!this.accessType.length) {
				callback(new Error('请选择接入方式'))
				return
			}

			if (!this.ad_type_support.length) {
				callback(new Error('请选择广告场景'))
				return
			}

			// 选择原生信息流的情况
			if (this.accessType.includes(2) && this.ad_type_support.includes(1) && !this.render_type.length) {
				callback(new Error('请选择渲染方式'))
				return
			}
			callback()
		}
		const invoiceCheck = (rule, value, callback) => {
			let _form = this.setModalForm

			if (!_form.invoice_type) {
				callback(new Error('请选择发票类型'))
				return
			}

			if (!_form.invoice_project) {
				callback(new Error('请选择发票项目'))
				return
			}

			if (!_form.settlement_period) {
				callback(new Error('请选择结算周期'))
				return
			}

			callback()
		}
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			filterSearch: { // 搜索条件
				status: '', // 标签栏用户状态，1=正常，2=未激活，3=封禁
				type: '', // 媒体类型   1=直媒 2=ssp
				ud_id: [], // 公司id
				search_text: '' // 模糊查询输入框
			},

			valid_count: 0, // 正常数量
			stop_count: 0, // 封禁数
			invalid_count: 0, // 未激活数量
			count: 0, // 全部数量

			tableLoadFlag: true, // table的loading
			catchTableColList: [
				{
					type: 'index',
					width: 36,
					fixed: 'left',
					align: 'center',
					isHideInColumn: true
				},
				{
					title: '账户名称/ID',
					slot: 'ud_id',
					width: 150,
					fixed: 'left',
					isHideInColumn: true
				},
				{
					title: '公司主体名称',
					slot: 'company_name',
					minWidth: 170
				},
				{
					title: '公司简称',
					key: 'company_short_name',
					minWidth: 150
				},
				{
					title: '账户状态',
					slot: 'status',
					minWidth: 80
				},
				{
					title: '媒体类型',
					slot: 'type',
					minWidth: 80
				},
				{
					title: '联系人',
					key: 'dev_name',
					minWidth: 80
				},
				{
					title: '手机号',
					key: 'dev_phone',
					minWidth: 120
				},
				{
					title: '产品名单',
					key: 'product_list',
					minWidth: 200
				},
				{
					title: '注册时间',
					key: 'created_time',
					minWidth: 150
				},
				{
					title: '更新时间',
					key: 'updated_time',
					minWidth: 150
				},
				{
					title: '更新人',
					key: 'last_updater',
					minWidth: 80
				},
				{
					title: '操作',
					slot: 'action',
					width: 240,
					minWidth: 240,
					fixed: 'right',
					isHideInColumn: true
				}
			],
			colDatList: [], // table列表数据

			catchRowData: '', // 点击配置和重置密码时的缓存row数据

			pswModalFlag: false, // 重置密码
			pswFormCustom: { // 密码form表单
				passwd: '',
				passwdCheck: ''
			},
			submitClock: false, // 重置密码锁
			pswRuleCustom: { // 密码校验
				passwd: [
					{ required: true, message: '请输入密码', trigger: 'blur' },
					{ min: 6, message: '长度至少6位', trigger: 'blur' },
					// {pattern: /^(?![a-z0-9]+$)(?![A-Za-z]+$)(?![A-Z0-9]+$)[a-zA-Z0-9\W]{8,20}$/, message: '密码必须是包含大小写字母、数字的8-20位字符组成', trigger: 'blur'}
					{pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '密码必须是字母或数字的6-20位字符组成', trigger: 'blur'}
				],
				passwdCheck: [{required: true, validator: validatePassCheck, trigger: 'blur'}]
			},

			setModalFlag: false, // 配置弹窗
			setModalForm: {}, // 配置form表单

			accessType: [], // 接入方式
			platform_third: [], // 第三方SDK权限
			platform_third_back: [], // 第三方SDK权限备份数据，用于区分add_platform，
			ad_type_support: [], // 广告场景
			render_type: [], // 渲染方式
			isShowSDKFlag: false, // 配置-是否显示第三方sdk\
			setRuls: { // 配置正则
				status: [{required: true, message: '请选择账户状态', trigger: 'change'}],
				type: [{type: 'number', required: true, message: '请选择媒体类型', trigger: 'change'}],
				business: [{required: true, validator: validateBusCheck, trigger: 'blur'}],
				cooperation_company: [{required: true, message: '请选择合作主体'}],
				cooperation_time: [{required: true, message: '请选择合同有效期'}],
				invoice_type: [{required: true, validator: invoiceCheck, trigger: 'change'}],
			},

			bannedModalFlag: false,
			bannedReason: '', // 紧闭的理由

			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			}
		}
	},
	created() {
		this.getTableColumns()

		if (this._hasPageAccess()) {
			this.getMediaList() // 默认请求一次媒体列表数据
		}
	},
	activated() {
		this.$Bus.$off('editEmitEvent')
		this.$Bus.$on('editEmitEvent', (msg) => {
			this.getMediaList() // 默认请求一次媒体列表数据
		})
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': true}) // search-line的高度
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		},
		// 广告场景
		catchAdTypeList() {
			let thirdArr = this.platform_third
			let typeArr = [...this.ad_type_support]

			if (!!thirdArr && thirdArr.indexOf(3) > -1) {
				return this.adTypeList
			} else {
				// 关闭交互通，去除 互动
				let result = typeArr.filter(item => {
					return item !== 8
				})
				this.ad_type_support = result

				return this.adTypeList.filter(item => {
					return item.id !== 8
				})
			}
		},
		/**
		 * [isShowRenderFlag 抽屉 - 配置 是否显示渲染方式  [模板，自渲染]]
		 * sdk - 原声信息流 -
		 * @return {Boolean} [description]
		 */
		isShowRenderFlag() {
			// 只有选择sdk  并且选择了原生信息流 才会显示 渲染方式。  默认 false
			if (this.accessType.includes(2) && this.ad_type_support.includes(1)) {
				return true
			} else {
				this.render_type = []
				return false
			}
		},
		/**
		 * [otherTax 其他汇率]
		 * @return {[type]} [description]
		 */
		otherTax() {

			let invoice_type = this.setModalForm.invoice_type
			let invoice_project = this.setModalForm.invoice_project

			let concatVal = `${invoice_type}-${invoice_project}`
			let returnVal = '-'

			switch (concatVal) {
				case '1-1':
					returnVal = 6.72
					break
				case '2-1':
					returnVal = 3.36
					break
				case '3-1':
					returnVal = 0
					break
				case '1-2':
					returnVal = 9.72
					break
				case '2-2':
					returnVal = 6.36
					break
				case '3-2':
					returnVal = 3.00
					break
			}

			return returnVal
		}
	},
	methods: {
		/**
		 * [cancleBanned 取消封禁]
		 * @return {[type]} [description]
		 */
		cancleBanned(type) {
			this.bannedModalFlag = false
			this.catchRowData = ''
			if (type === 'clear') {
				this.bannedReason = ''
			}
		},
		/**
		 * [trueBanned description]
		 * @param  {[type]} type ['open 开启', 'banned' 禁用]
		 * @return {[type]}      [description]
		 */
		trueBanned(type) {
			if (!this.bannedReason && type === 'banned') {
				this.$Message.error({content: '请输入封禁原因', duration: 3})
				return
			}

			let params = {
				ud_id: this.catchRowData.ud_id,
				status_desc: type === 'banned' ? this.bannedReason : ''
			}

			if (type === 'open') {
				params.status = 1
			} else if (type === 'banned') {
				params.status = 3
			}

			this.submitClock = true

			setMediaDevStatus(params).then(res => {
				this.submitClock = false
				this.cancleBanned('clear')

				if (res.code === 200) {
					this.getMediaList()
					this.$Message.success({content: '操作成功', duration: 3})
					this.cancleBanned('clear')
				}
			}, err => {
				this.submitClock = false
			})
		},
		/**
		 * [toBanned 封禁]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toBanned(row) {
			this.bannedModalFlag = true
			this.catchRowData = row
		},
		/**
		 * [toEnable 开启]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toEnable(row) {
			this.catchRowData = row
			this.$Modal.confirm({
				title: '确定重新启用该账户么？',
				onOk: () => {
					this.trueBanned('open')
				},
				onCancel: () => {
					this.catchRowData = ''
				}
			})
		},
		/**
		 * [showSetModal 点击配置按钮]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		async showSetModal(row) {
			this.$Spin.show()

			let res = await getMediaConfigInfo({ud_id: row.ud_id})

			this.$Spin.hide()

			if (res.code === 200) {
				let {
					status,
					access_api,
					access_sdk,
					ad_type_support,
					platform,
					render_type
				} = res.data

				// 接入方式 api, sdk
				let accArr = []
				if (access_api === 1) {
					accArr.push(1)
				}
				if (access_sdk === 1) {
					accArr.push(2)
				}

				this.accessType = accArr

				// adtype
				let adArr = []
				ad_type_support.map(item => {
					if (item.value === 1) {
						adArr.push(item.id)
					}
				})
				this.ad_type_support = adArr

				// 第三方SDK权限, 因为CheckboxGroup为数组[1,2,3]这种，所以格式化处理
				let platArr = []
				platform.map(item => {
					if (item.value === 1) {
						platArr.push(item.id)
					}
				})
				this.platform_third = platArr
				this.platform_third_back = platArr

				// 渲染方式
				let renderArr = []
				render_type.map(item => {
					if (item.value === 1) {
						renderArr.push(item.id)
					}
				})
				this.render_type = renderArr

				this.setModalForm = {
					ud_id: row.ud_id,
					dev_account: row.dev_account,
					company_name: row.company_name,
					type: row.type ? row.type : 1,
					status: status === 2 ? 0 : String(status), // 此处特殊处理: 初始化创建的媒体，默认状态是待审核，而实际保存时需要选择
					cooperation_company: row.cooperation_company || null, // 合作主体，1=聚量，2=鼎广
					cooperation_time: (row.cooperation_since && row.cooperation_until) ? [row.cooperation_since, row.cooperation_until] : [],
					invoice_type: row.invoice_type, // 发票类型，1=增值税普通发票，2=增值税专用发票（3%），3=增值税专用发票（6%）
					invoice_project: row.invoice_project, // 发票项目，1=广告发布费，2=非广告发布费的其他项目
					is_cut_other_tax: row.is_cut_other_tax === 1 ? 1 : 2, // 是否补扣其他税额，1=补扣，2=不扣
					settlement_period: row.settlement_period // 结算周期，1=预付，2=次月月底，3=次次25日前，4=次次月底
				}

				this.setModalFlag = true
			}
		},
		/**
		 * [closeSetModal 关闭设置弹出]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		closeSetModal(row) {
			this.setModalFlag = false
			// this.setModalForm = {}

			this.$refs['setModalForm'].resetFields()
		},
		/**
		 * [submitSet 提交设置]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitSet(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					let _form = {...this.setModalForm}

					// 提交时需要格式转化地方
					// 1. 当选择sdk时，才会出现第三方sdk权限， 并且格式转化为{key, value}形式
					// 1.1 另外注意点： 当增加或减少选项时，对应在add_platform、del_platform传入id
					let platform = []
					let _thirdNew = this.platform_third // 改变的数据
					let _thirdBack = this.platform_third_back // 备份的数据
					let union = getUnion(_thirdNew, _thirdBack) // 已选和备选合集
					let _add = union.filter(x => !(_thirdBack.indexOf(x) > -1)) // 新增
					let _del = union.filter(x => !(_thirdNew.indexOf(x) > -1)) // 减少

					// 接入方式 选择了 sdk
					if (this.accessType.indexOf(2) > -1) {
						this.platform3rdList.map(oRes => {
							let _obj = {id: oRes.id, value: -1}
							_thirdNew.map(iRes => {
								if (oRes.id === iRes) {
									_obj.value = 1
								}
							})
							platform.push(_obj)
						})
					}

					// 广告类型, 格式转化为{key, value}形式
					let ad_type_support = []
					this.adTypeList.map(oRes => {
						let _obj = {id: oRes.id, value: -1}
						this.ad_type_support.map(iRes => {
							if (oRes.id === iRes) {
								_obj.value = 1
							}
						})

						ad_type_support.push(_obj)
					})

					// 2020.9.27日 注释： VR 暂时去掉，强制 传参 {id: 7, value: -1}
					ad_type_support.push({id: 7, value: -1})

					// 渲染方式, 格式转化为{key, value}形式
					let render_type = []
					this.renderTypeList.map(oRes => {
						let _obj = { id: oRes.id, value: -1 }
						this.render_type.map(iRes => {
							if (oRes.id === iRes) {
								_obj.value = 1
							}
						})
						render_type.push(_obj)
					})

					let status = Number(_form.status)


					// 处理 财务信息
					// a. 增值税专用发票(6%) 发票项目必须为非广告发布费的其他项目
					// b. 处理时间
					let startTime = formatDate(_form.cooperation_time[0], 'yyyy-MM-dd')
					let endTime = formatDate(_form.cooperation_time[1], 'yyyy-MM-dd')

					let params = {
						ud_id: Number(_form.ud_id),
						status: status,
						type: Number(_form.type),
						access_api: this.accessType.indexOf(1) > -1 ? 1 : -1,
						access_sdk: this.accessType.indexOf(2) > -1 ? 1 : -1,
						platform,
						add_platform: _add,
						del_platform: _del,
						ad_type_support,
						render_type,
						cooperation_company: _form.cooperation_company, // 合作主体，1=聚量，2=鼎广
						cooperation_since: startTime,
						cooperation_until: endTime,
						invoice_type: _form.invoice_type,
						invoice_project: _form.invoice_project,
						is_cut_other_tax: _form.is_cut_other_tax === 1 ? 1 : 2,
						other_tax_rate: _form.is_cut_other_tax === 1 ? parseFloat(this.otherTax) : null,
						settlement_period: _form.settlement_period
					}

					console.log(params)

					this.submitClock = true

					setMediaDevConfig(params).then(res => {

						this.submitClock = false

						if (res.code === 200) {
							this.$Message.success({content: status === 1 ? '配置成功' : '配置成功', duration: 3})
							this.getMediaList() // 刷新列表

							this.closeSetModal() // 重置form表单
						} else {
							this.$Message.error({content: '配置失败，请重试', duration: 3})
						}
					}, err => {
						this.submitClock = false
					})
				} else {
					this.$Message.error({content: this.$config.requiredText, duration: 3})
				}
			})
		},
		/**
		 * [resetPsw 重置密码]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		resetPsw(row) {
			this.pswModalFlag = true
			this.catchRowData = row
		},
		/**
		 * [closePswModal 关闭设置密码弹窗]
		 * @return {[type]} [description]
		 */
		closePswModal() {
			this.pswFormCustom.passwd = ''
			this.pswFormCustom.passwdCheck = ''
			this.pswModalFlag = false
			this.catchRowData = ''
		},
		/**
		 * [submitPasswd 修改密码提交]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitPasswd(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {
					this.submitClock = true

					mediaResetPwd({
						ud_id: this.catchRowData.ud_id,
						password: this.pswFormCustom.passwd
					}).then(res => {
						this.submitClock = false
						this.closePswModal()
						this.$Message.success({content: '密码重置成功！', duration: 3})
					}, err => {
						this.submitClock = false
						this.closePswModal()
						this.$Message.error({content: '密码重置失败，请重试', duration: 3})
					})
				}
			})
		},
		/**
		 * [getMediaList description]
		 * @return {[type]} [description]
		 */
		getMediaList() {

			this.tableLoadFlag = true

			getMediaList({
				status: this.filterSearch.status,
				ud_id: this.filterSearch.ud_id,
				search_text: this.filterSearch.search_text,
				page_size: this.pageSize,
				page_num: this.currentPage,
				type:this.filterSearch.type
			}).then(res => {

				this.tableLoadFlag = false

				let data = res.data

				if (res.code === 200) {
					this.valid_count = data.valid_count
					this.count = data.count
					this.stop_count = data.stop_count
					this.total_count = data.total_count
					this.invalid_count = data.invalid_count
					this.colDatList = data.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getMediaList()
		},
		/**
		 * [changePage 切换页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			// 切换页码
			this.currentPage = val
			this.getMediaList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getMediaList()
		},
		/**
		 * [toEdit 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		toEdit(row) {
			return `/ssp/media/edit/${row.ud_id}`

			// this.$router.push({name: 'media-edit', params: {ud_id: row.ud_id}})
		},
		/**
		 * [toView 查看]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toView(row) {
			return `/ssp/media/view/${row.ud_id}`

			// this.$router.push({name: 'media-view', params: {ud_id: row.ud_id}})
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
		 * [randomString 随机生成字符串]
		 * @return {[type]} [description]
		 */
		randomString(sign) {
			const s = 'ABCDEFGHIJKLMNOPQRSTUVWXVZabcdefghijklmnopqrstuvwxyz'
			let result = ''

			for (let i = 0; i < sign.length; i++) {
				let random = randomNumber(2, 5)
				for (let j = 0; j < random; j++) {
					let codeRandow = randomNumber(0, s.length)
					let code = s.substring(codeRandow, codeRandow + 1)
					result += code
				}
				result += sign[i]
			}
			return result
		},
		/**
		 * [toLoginMedia 登录到媒体平台]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toLoginMedia(row) {
			const curTime = String(new Date().getTime())
			const startSign = curTime.slice(5, 10)
			const endSign = curTime.slice(0, 5)
			const secret = this.randomString(startSign) + this.randomString(endSign)

			let decode = encodeURIComponent(row.dev_account)

			window.open(`${this.$APIUrl.mediaComUrl}/account/adminLogin?dev_account=${decode}&secret=${secret}`, '_blank')
		}
	},
	watch: {
		/**
		 * [isChooseSDk 判断接入方式是否选择sdk，从而显示隐藏第三方sdk权限]
		 * @return {Boolean} [description]
		 */
		accessType(newVal) {
			let resultArr = [...this.platform_third]

			// sdk 默认选择 交互通
			if (newVal.indexOf(2) > -1) {
				this.isShowSDKFlag = true
			} else {
				this.isShowSDKFlag = false
				resultArr = []
			}

			this.platform_third = resultArr
		}
	},
	/**
	 * [beforeRouteLeave 路由跳转]
	 * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
	 * @param  {[type]}   from [description]
	 * @param  {Function} next [description]
	 * @return {[type]}        [description]
	 */
	beforeRouteLeave(to, from, next) {
		if (to.name !== 'media-edit') {
			this.$Bus.$off('editEmitEvent')
		}
		next()
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import '../data/select.styl';
.ud-handle
	.ud-account
		overflow: hidden
	.exit-box
		height: 42px
		width: 30px
		line-height: 42px
		text-align: right
		display: inline
		float: right
	.icon-exit
		font-size: 12px
		width: 30px
		height: 30px
		line-height: 30px
		color: #4083F8
		display: inline-block
		vertical-align: middle
		cursor: pointer
.setModal
	.permiss-box
		.per-item
			margin-bottom: 14px
		.ivu-checkbox-group
			label
				color: #999
	label.ivu-radio-wrapper
		color: #999
</style>
