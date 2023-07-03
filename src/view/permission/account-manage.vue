<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('newAddAccount')" style="float: right" icon="ios-add" type="primary" @click="toggleFormDraw()">新建账号</Button>
				</div>
			</div>
			<div class="search-line">
				<Row>
					<Col span="24">
						<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="search.name" placeholder="输入账户名称或姓名"/>
						<Select
							class="i-margin-right-11 i-width-select ad_type_select"
							filterable
							multiple
							v-model="search.role_id"
							:max-tag-count="1"
							:max-tag-placeholder="limitText"
							placeholder="请选择角色"
						>
							<Option v-for="item in roleList" :value="item.id" :key="'select'+item.id">{{ item.name }}</Option>
						</Select>
						<Button type="primary" @click="doFilterList">查询</Button>
					</Col>
				</Row>
			</div>

		 <div class="console-table">
			 <Table
				 highlight-row
				 stripe border
				 :columns="spendColumns"
				 :data="userList"
				 :loading="tableLoadFlag"
				 :no-data-text="noDataText"
				 :height="tableHeight">
					<!--账号名称/ID-->
				 <template slot-scope="{ row }" slot="account_name">
					 <p class="name-row-ellipsis" :title="row.sys_account">{{ row.sys_account }}</p>
					 <p class="tip-row-line">ID: {{ row.id }}</p>
				 </template>
				 <template slot-scope="{ row }" slot="status">
					 <span v-if="row.status === 1">正常</span>
					 <span v-if="row.status === 2">停用</span>
					 <i-switch v-if="_isShow_('modify')" size="small" :true-value="1" :false-value="2" v-model="row.status" @on-change="changeState(row)"/>
				 </template>
					<!--关联媒体-->
				 <template slot-scope="{ row }" slot="related_ssp">
					 <p v-if="row.all_resource"> 全部 </p>
					 <p v-else>{{ row.related_ssp }}</p>
				 </template>
					<!--关联应用-->
				 <template slot-scope="{ row }" slot="related_app">
					 <p v-if="row.all_resource"> 全部 </p>
					 <p v-else>{{ row.related_app }}</p>
				 </template>
					<!--关联广告位-->
				 <template slot-scope="{ row }" slot="related_ssp_slot">
					 <p v-if="row.all_resource"> 全部 </p>
					 <p v-else>{{ row.related_ssp_slot }}</p>
				 </template>
					<!--关联公司-->
				 <template slot-scope="{ row }" slot="related_dsp_company">
					 <p v-if="row.all_resource"> 全部 </p>
					 <p v-else>{{ row.related_dsp_company }}</p>
				 </template>
					<!--关联预算位-->
				 <template slot-scope="{ row }" slot="related_dsp_slot">
					 <p v-if="row.all_resource"> 全部 </p>
					 <p v-else>{{ row.related_dsp_slot }}</p>
				 </template>
				 <!--创建时间-->
				 <template slot-scope="{ row }" slot="created_at">
					 <p v-if="row.created_at">  {{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
					 <p v-else> - </p>
				 </template>
				 <!--更新时间-->
				 <template slot-scope="{ row }" slot="updated_at">
					 <p v-if="row.updated_at"> {{ row.updated_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
					 <p v-else> - </p>
				 </template>
				 <!--最后的IP-->
				 <template slot-scope="{ row }" slot="last_ip">
					 <p v-if="row.last_ip"> {{ row.last_ip }}</p>
					 <p v-else> - </p>
				 </template>
				 <!--操作人-->
				 <template slot-scope="{ row }" slot="operator_name">
					 <p v-if="row.operator_name"> {{ row.operator_name }}</p>
					 <p v-else> - </p>
				 </template>
				 <!--操作-->
				 <template slot-scope="{ row, index }" slot="action">
					 <Button v-if="_isShow_('modify')" type="text" @click="doCreate(row)">修改</Button>
					 <Button v-if="_isShow_('resetPsw')" type="text" @click="doPassword(row)">重置密码</Button>
				 </template>
			 </Table>
			 <div class="page-center">
				 <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
			 </div>
		 </div>
		</Card>
		<Modal v-model="passWordModal" :mask-closable="false"  :closable="false"  width="400">
				<div class="content" style="margin-top: 15px">
					<Form :label-width="80" :model="passwordData" :rules="passwordDataRules" ref="passwordData">
						<FormItem label="输入密码" prop="passwd">
							<Input type="password" :maxlength="20" v-model.trim="passwordData.passwd" password/>
						</FormItem>
						<FormItem label="确认密码" prop="passwdCheck">
							<Input type="password" :maxlength="20" v-model.trim="passwordData.passwdCheck" password/>
						</FormItem>
					</Form>
				</div>
			 <div slot="footer">
				 <Button @click="passWordModal=false">取消</Button>
				 <Button type="primary" :loading="submitPassWordStatus" @click="submitPassWord('passwordData')">
					 <span v-if="!submitPassWordStatus">确定</span>
					 <span v-else>提交中...</span>
				 </Button>
			 </div>
		</Modal>
		<Drawer v-model="setModalFlag" :title="drawerStatus===1?'新建账号':'修改账号'" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="80">
				<FormItem label="账号名称" prop="sys_account">
					<Input type="text" :maxlength="30" v-model.trim="modalForm.sys_account" placeholder="请输入账号名称"/>
				</FormItem>
				<FormItem label="密码" prop="password" v-show="drawerStatus===1">
					<Input type="password"  v-model.trim="modalForm.password" password placeholder="请输入您的密码"/>
				</FormItem>
				<FormItem label="姓名" prop="user_name">
					<Input type="text" :maxlength="30" v-model.trim="modalForm.user_name" placeholder="请输入您的姓名"/>
				</FormItem>
				<FormItem label="手机号" prop="phone">
					<Input type="text" v-model.trim="modalForm.phone" placeholder="请输入您的手机号"/>
				</FormItem>
				<FormItem label="邮箱" prop="email">
					<Input type="text" v-model.trim="modalForm.email" placeholder="请输入您的邮箱"/>
				</FormItem>
				<FormItem label="账号状态" prop="status">
					<RadioGroup v-model="modalForm.status">
						<Radio :label="1"><span>正常</span></Radio>
						<Radio :label="2"><span>停用</span></Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="角色" prop="role_id">
					<Select filterable  v-model="modalForm.role_id" placeholder="请选择角色">
						<Option v-for="item in roleList" :value="item.id" :key="'modal'+item.id">{{ item.name }}</Option>
					</Select>
				</FormItem>
				<FormItem label="资源分配" prop="resource_allot">
					<RadioGroup v-model="resource_allot">
						<Radio :label="1"><span>全部</span></Radio>
						<Radio :label="2"><span>自定义</span></Radio>
					</RadioGroup>
				</FormItem>
				<div v-show="resource_allot === 2">
					<div class="allot_list">
						<div class="allot_title">
							<span>媒体</span>
							<span v-show="mediaStatus === 1" class="allot_action" @click="mediaStatus=2">展开<Icon
								type="ios-arrow-down"/></span>
							<span v-show="mediaStatus === 2" class="allot_action" @click="mediaStatus=1">收起<Icon
								type="ios-arrow-up"/></span>
						</div>
						<div class="allot_content" v-show="mediaStatus === 2">
							<Transfer
								:data="mediaList"
								:titles="['可选媒体','已选媒体']"
								:target-keys="targetMedia"
								@mouseover.native="addTitle"
								filterable
								:list-style="listStyle"
								@on-change="handleChangeMedia"/>
						</div>
					</div>
					<div class="allot_list">
						<div class="allot_title">
							<span>应用</span>
							<span v-show="applyStatus === 1" class="allot_action" @click="applyStatus=2">展开<Icon
								type="ios-arrow-down"/></span>
							<span v-show="applyStatus === 2" class="allot_action" @click="applyStatus=1">收起<Icon
								type="ios-arrow-up"/></span>
						</div>
						<div class="allot_content" v-show="applyStatus === 2">
							<Transfer
								:data="applyList"
								:titles="['可选应用','已选应用']"
								:target-keys="targetApply"
								@mouseover.native="addTitle"
								filterable
								:list-style="listStyle"
								@on-change="handleChangeApply"/>
						</div>
					</div>
					<div class="allot_list">
						<div class="allot_title">
							<span>广告位</span>
							<span v-show="adStatus === 1" class="allot_action" @click="adStatus=2">展开<Icon
								type="ios-arrow-down"/></span>
							<span v-show="adStatus === 2" class="allot_action" @click="adStatus=1">收起<Icon
								type="ios-arrow-up"/></span>
						</div>
						<div class="allot_content" v-show="adStatus === 2">
							<Transfer
								:data="adList"
								:titles="['可选广告位','已选广告位']"
								:target-keys="targetAd"
								@mouseover.native="addTitle"
								filterable
								:list-style="listStyle"
								@on-change="handleChangeAd"/>
						</div>
					</div>
					<div class="allot_list">
						<div class="allot_title">
							<span>预算-公司名称</span>
							<span v-show="companyStatus === 1" class="allot_action" @click="companyStatus=2">展开<Icon
								type="ios-arrow-down"/></span>
							<span v-show="companyStatus === 2" class="allot_action" @click="companyStatus=1">收起<Icon
								type="ios-arrow-up"/></span>
						</div>
						<div class="allot_content" v-show="companyStatus === 2">
							<Transfer
								:data="companyList"
								:titles="['可选预算-公司名称','已选预算-公司名称']"
								:target-keys="targetCompany"
								@mouseover.native="addTitle"
								filterable
								:list-style="listStyle"
								@on-change="handleChangeCompany"/>
						</div>
					</div>
					<div class="allot_list">
						<div class="allot_title">
							<span>预算位</span>
							<span v-show="budgetStatus === 1" class="allot_action" @click="budgetStatus=2">展开<Icon
								type="ios-arrow-down"/></span>
							<span v-show="budgetStatus === 2" class="allot_action" @click="budgetStatus=1">收起<Icon
								type="ios-arrow-up"/></span>
						</div>
						<div class="allot_content" v-show="budgetStatus === 2">
							<Transfer
								:data="budgetList"
								:titles="['可选预算位','已选预算位']"
								:target-keys="targetBudget"
								@mouseover.native="addTitle"
								filterable
								:list-style="listStyle"
								@on-change="handleChangeBudget"/>
						</div>
					</div>
				</div>
			</Form>
			<div class="drawer-footer" style="z-index: 10000">
				<Button @click="toggleFormDraw()">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitAddUser('modalForm')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
	import {showTitle} from '@/libs/util'
	import { tableHeight } from '@/mixin/calc-table-height.js'
	import {getMediaList, getAppList, getSspSlotAdList} from '@/api/ssp'
	import {getDspCompanyList, getDspSlotList} from '@/api/dsp'
	import {formatDate, validatePhone} from '@/libs/tools'
	import {getSysRole, getSysUserList, addSysUser, updateSysUser, updateSysUserPassWord, getResourceData, getResourceAlloc} from '@/api/permission'
	import { inPageAccess } from '@/mixin/in-page-access.js'

	export default {
		name: 'spendAmendment',
		mixins: [tableHeight, inPageAccess],
		data() {
			const validatePassCheck = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'))
				} else if (value !== this.passwordData.passwd) {
					callback(new Error('两次输入密码不一致!'))
				} else {
					callback()
				}
			}
			return {
				noDataText: this.$config.noDataText,
				passwordData: {
					passwd: '',
					passwdCheck: ''
				},
				passwordDataRules: {
					passwd: [
						{required: true, message: '请输入密码'},
						{ min: 6, message: '长度至少6位', trigger: 'blur' },
						{pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '密码必须是字母或数字的6-20位字符组成', trigger: 'blur'}
					],
					passwdCheck: [{required: true, validator: validatePassCheck}]
				},
				passWordModal: false, // 密码的按钮
				mediaList: [], // 媒体分配的列表
				targetMedia: [], // 媒体选中的值
				mediaStatus: 1,
				applyList: [], // 应用分配的列表
				targetApply: [], // 应用选中的值
				applyStatus: 1,
				adList: [], // 广告位的列表
				targetAd: [], // 广告位选中的值
				adStatus: 1,
				companyList: [], // 预算公司的列表
				targetCompany: [], // 预算公司选中的值
				companyStatus: 1,
				budgetList: [], // 预算位的列表
				targetBudget: [], // 预算位选中的值
				budgetStatus: 1,
				resource_allot: 1,
				search: {
					name: '',
					role_id: []
				},
				listStyle: {
					width: '235px',
					height: '260px'
				},
				pageSize: 10,
				total_count: 0,
				currentPage: 1,
				spendColumns: [
					{
						type: 'index',
						width: 36,
						fixed: 'left',
						align: 'center'
					},
					{
						title: '账号名称/ID',
						slot: 'account_name',
						minWidth: 120,
						fixed: 'left'
					},
					{
						title: '账号状态',
						slot: 'status',
						minWidth: 100
					},
					{
						title: '姓名',
						key: 'user_name',
						minWidth: 100
					},
					{
						title: '手机号码',
						key: 'phone',
						minWidth: 110
					},
					{
						title: '角色',
						key: 'role_name',
						minWidth: 100
					},
					{
						title: '关联媒体',
						slot: 'related_ssp',
						minWidth: 100
					},
					{
						title: '关联应用',
						slot: 'related_app',
						minWidth: 100
					},
					{
						title: '关联广告位',
						slot: 'related_ssp_slot',
						minWidth: 100
					},
					{
						title: '关联公司',
						slot: 'related_dsp_company',
						minWidth: 100
					},
					{
						title: '关联预算位',
						slot: 'related_dsp_slot',
						minWidth: 100
					},
					{
						title: '创建时间',
						slot: 'created_at',
						minWidth: 150
					},
					{
						title: '最后登陆时间',
						slot: 'updated_at',
						minWidth: 150
					},
					{
						title: '最后登陆IP',
						slot: 'last_ip',
						minWidth: 120
					},
					{
						title: '操作人',
						slot: 'operator_name',
						minWidth: 80
					},
					{
						title: '操作',
						slot: 'action',
						width: 120,
						fixed: 'right'
					}
				],
				tableLoadFlag: false, // table的loading

				modalForm: {}, // 修改表单
				modalFormRules: {
					sys_account: [
						{required: true, message: '账户名称不能为空'}
					],
					password: [
						{required: true, message: '密码不能为空'},
						{ min: 6, message: '长度至少6位', trigger: 'blur' },
						{pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '密码必须是字母或数字的6-20位字符组成', trigger: 'blur'}
					],
					user_name: [
						{required: true, message: '姓名不能为空'}
					],
					phone: [
						{required: true, message: '手机号不能为空'},
						{validator: validatePhone}
					],
					email: [
						{required: true, message: '邮箱不能为空'},
						{type: 'email', message: '请输入正确的邮箱地址'}
					],
					status: [
						{required: true, message: '请选择账号状态'}
					],
					role_id: [
						{required: true, message: '请选择角色'}
					],
					// resource_allot: [
					//   {required: true, message: '请选择对应的资源'}
					// ]
				},
				submitClock: false, // 保存锁
				submitPassWordStatus: false, // 保存锁
				spinShow: false,
				setModalFlag: false, // 抽屉开关
				roleList: [], // 角色的列表
				userList: [], // 账号的列表
				drawerStatus: 1,
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
		filters: {
			timeFormat(time, format) {
				return formatDate(time * 1000, format)
			}
		},
		created() {
			if (this._hasPageAccess()) {
				this.getRoleData()
				this.getUesrData()
				this.getMediaData()
				this.getCompanyData()
			}
		},
		mounted() {
			this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
		},
		methods: {
			addTitle(e) {
				let target_el = e.target
				if (target_el.title) return
				if (target_el.tagName === 'LI') {
					target_el.title = target_el.innerText
				}
			},
			/**
			 * [doPassword 重置密码显示]
			 * @return {[type]} [description]
			 */
			doPassword(row) {
				this.passwordData.passwd = ''
				this.passwordData.passwdCheck = ''
				this.passwordData.id = row.id
				this.passWordModal = true
			},
			/**
			 * [doPassword 重置密码提交]
			 * @return {[type]} [description]
			 */
			submitPassWord(name) {
				this.$refs[name].validate((valid) => {
					console.log(valid)
					if (valid) {
						this.submitPassWordStatus = true
						let id = this.passwordData.id
						let password = this.passwordData.passwd
						updateSysUserPassWord({
							id,
							password
						}).then(res => {
							this.passWordModal = false
							this.submitPassWordStatus = false
							if (res.code === 200) {
								this.$Message.success({ content: '密码修改成功', duration: 3 })
								this.getUesrData()
							} else {
								this.$Message.error({ content: '密码修改失败，请重试', duration: 3 })
							}
						}, err => {
							this.submitPassWordStatus = false
						})
					} else {
						console.log(1234)
					}
				})
			},
			/**
			 * [getRoleData 获取角色的列表]
			 * @return {[type]} [description]
			 */
			getRoleData() {
				getSysRole({}).then(res => {
					if (res.code === 200) {
						this.roleList = res.data.list
					}
				})
			},
			/**
			 * [changeState 切换业务状态]
			 * @param  {[type]} item [description]
			 * @return {[type]}     [description]
			 */
			changeState(item) {
				this.$Modal.confirm({
					title: item.status === 1 ? '确定开启该账号?' : '确定停用该账号?',
					content: '',
					onOk: () => {
						updateSysUser({
							id: item.id,
							status: item.status
						}).then(res => {
							if (res.code === 200) {
								this.$Message.success({ content: '状态修改成功', duration: 3 })
								this.getUesrData()
							}
						})
					},
					onCancel: res => {
						item.status = item.status === 1 ? 2 : 1
					}
				})
			},
			/**
			 * [getuesrData 获取账户的列表]
			 * @return {[type]} [description]
			 */
			getUesrData() {
				this.tableLoadFlag = true
				getSysUserList({
					page_num: this.currentPage,
					page_size: this.pageSize,
					name: this.search.name,
					role_id: this.search.role_id
				}).then(res => {
					this.tableLoadFlag = false
					if (res.code === 200) {
						this.total_count = res.data.total
						this.userList = res.data.list
					}
				}, err => {
					if (err.code === 403) {
						this.noDataText = this.$config.noDataTextPer
					}
					this.tableLoadFlag = false
				})
			},
			/**
			 * [getuesrData 修改账号]
			 * @return {[type]} [description]
			 */
			doCreate(row) {
				if (this.modalFormRules.password.length > 0) {
					this.modalFormRules.password = []
				}
				this.modalForm = row
				this.drawerStatus = 2
				this.getMediaData()
				this.getCompanyData()
				this.getResourceData(row.id)
			},
			/**
			 * [getRoleData 获取账号下的资源信息]
			 * @return {[type]} [description]
			 */
			getResourceData(data) {
				getResourceData({
						user_id: data
				}).then(res => {
					if (res.code === 200) {
						let resource = res.data
						this.resource_allot = resource.all_resource ? 1 : 2
						this.modalForm.resource_allot = resource.all_resource ? 1 : 2
						if (!resource.all_resource) {
							if (resource.resources_ssp && resource.resources_ssp.length > 0) {
								this.targetMedia = resource.resources_ssp
								this.getApplyData()
								if (resource.resources_app && resource.resources_ssp.length > 0) {
									this.targetApply = resource.resources_app
									this.applyStatus = 2
									this.getAdData()
									if (resource.resources_ssp_slot && resource.resources_ssp_slot.length > 0) {
										this.targetAd = resource.resources_ssp_slot
										this.applyStatus = 2
									}
								}
								this.mediaStatus = 2
							} else {
								this.targetMedia = []
								this.targetApply = []
								this.targetAd = []
								this.mediaStatus = 1
								this.applyStatus = 1
								this.adStatus = 1
							}
							if (resource.resources_dsp && resource.resources_ssp.length > 0) {
								this.targetCompany = resource.resources_dsp
								this.targetBudget = resource.resources_dsp_slot
								this.getBudgetData()
								this.companyStatus = 2
								this.budgetStatus = 2
							} else {
								this.targetCompany = []
								this.targetBudget = []
								this.companyStatus = 1
								this.budgetStatus = 1
							}
						}
						this.setModalFlag = !this.setModalFlag
					}
				})
			},
			/**
			 * [spendGetList 新建角色]
			 * @return {[type]} [description]
			 */
			submitAddUser(name) {
				this.$refs[name].validate((valid) => {
					if (valid) {
						if (this.drawerStatus === 1) {
							this.addUserEvent()
						} else {
							this.updateUserEvent()
						}
					}
				})
			},
			addUserEvent() {
				this.submitClock = true
				let obj = this.modalForm
				addSysUser(obj).then(res => {
					if (res.code === 200) {
						this.modalForm = res.data.user_sys
						this.addResourceData()
					} else {
						this.$Message.error({ content: '新建失败，请重试', duration: 3 })
					}
				}, err => {
					this.submitClock = false
				})
			},
			updateUserEvent() {
				this.submitClock = true
				let obj = this.modalForm
				updateSysUser(obj).then(res => {
					if (res.code === 200) {
					 this.addResourceData()
					} else {
						this.$Message.error({content: '修改失败，请重试', duration: 3})
					}
				}, err => {
					this.submitClock = false
				})
			},
			/**
			 * [spendGetList 提交资源]
			 * @return {[type]} [description]
			 */
			addResourceData() {
				let obj = {}
				obj.user_id = this.modalForm.id
				obj.all_resource = this.resource_allot === 1
				obj.resources_ssp = this.targetMedia
				obj.resources_app = this.targetApply
				obj.resources_ssp_slot = this.targetAd
				obj.resources_dsp = this.targetCompany
				obj.resources_dsp_slot = this.targetBudget
				getResourceAlloc(obj).then(res => {
					this.setModalFlag = false
					this.submitClock = false
					if (res.code === 200) {
						if (this.drawerStatus === 1) {
							this.$Message.success({content: '新建成功', duration: 3})
						} else {
							this.$Message.success({content: '修改成功', duration: 3})
						}
						this.getUesrData()
					} else {
						if (this.drawerStatus === 1) {
							this.$Message.error({content: '新建失败，请重试', duration: 3})
						} else {
							this.$Message.error({content: '修改失败，请重试', duration: 3})
						}
					}
				}, err => {
					this.submitClock = false
				})
			},

			/**
			 * [spendGetList 获取媒体的信息]
			 * @return {[type]} [description]
			 */
			getMediaData () {
				let mediaData = []
				getMediaList().then(res => {
					if (res.code === 200) {
						res.data.list.map(item => {
							mediaData.push({
								key: item.ud_id,
								label: item.company_short_name + '(' + item.ud_id + ')'
							})
						})
						this.mediaList = mediaData
					}
				})
			},
			/**
			 * [spendGetList 获取媒体的信息选择结果]
			 * @return {[type]} [description]
			 */
			handleChangeMedia(newTargetKeys) {
				this.targetMedia = newTargetKeys
				if (newTargetKeys.length > 0) {
					this.getApplyData()
				} else {
					this.applyList = []
					this.targetApply = []
				}
			},
			/**
			 * [spendGetList 获取应用的信息]
			 * @return {[type]} [description]
			 */
			getApplyData () {
				let applyData = []
				let obj = {}
				if (this.targetMedia.length > 0) {
					obj.ud_id = this.targetMedia
				}
				getAppList(obj).then(res => {
					if (res.code === 200) {
						res.data.list.map(item => {
							applyData.push({
								key: item.app_id,
								label: item.app_name + '(' + item.app_id + ')'
							})
						})
						this.applyList = applyData
					}
				})
			},
			/**
			 * [spendGetList 获取应用的信息选择结果]
			 * @return {[type]} [description]
			 */
			handleChangeApply(newTargetKeys) {
				this.targetApply = newTargetKeys
				this.getAdData()
			},
			/**
			 * [spendGetList 获取广告位的信息]
			 * @return {[type]} [description]
			 */
			getAdData () {
				let adData = []
				let obj = {}
				if (this.targetMedia.length > 0) {
					obj.ud_id_arr = this.targetMedia
				}
				if (this.targetApply.length > 0) {
					 obj.app_id_arr = this.targetApply
				}
				obj.page_size = parseInt(10000)
				obj.page_num = parseInt(1)
				getSspSlotAdList(obj).then(res => {
					if (res.code === 200) {
						res.data.list.map(item => {
							adData.push({
								key: item.ssp_slot_id,
								label: item.ssp_slot_name + '(' + item.ssp_slot_id + ')'
							})
						})
						this.adList = adData
					}
				})
			},
			/**
			 * [spendGetList 获取广告位的信息选择结果]
			 * @return {[type]} [description]
			 */
			handleChangeAd(newTargetKeys) {
				this.targetAd = newTargetKeys
			},

			/**
			 * [spendGetList 获取预算公司名称的信息]
			 * @return {[type]} [description]
			 */
			getCompanyData () {
				let companyData = []
				getDspCompanyList().then(res => {
					if (res.code === 200) {
						res.data.list.map(item => {
							companyData.push({
								key: item.id,
								label: item.company_name + '(' + item.id + ')'
							})
						})
						this.companyList = companyData
					}
				})
			},
			/**
			 * [spendGetList 获取预算公司名称选择结果]
			 * @return {[type]} [description]
			 */
			handleChangeCompany(newTargetKeys) {
				this.targetCompany = newTargetKeys
				this.getBudgetData()
			},
			getBudgetData () {
				let budgetData = []
				let obj = {}
				if (this.targetCompany.length > 0) {
					obj.dsp_company_id = this.targetCompany
				}
				getDspSlotList(obj).then(res => {
					if (res.code === 200) {
						res.data.list.map(item => {
							budgetData.push({
								key: item.id,
								label: item.dsp_slot_name + '(' + item.id + ')'
							})
						})
						this.budgetList = budgetData
					}
				})
			},
			/**
			 * [spendGetList 获取预算公司名称选择结果]
			 * @return {[type]} [description]
			 */
			handleChangeBudget(newTargetKeys) {
				this.targetBudget = newTargetKeys
			},
			/**
			 * [doFilterList 查询]
			 * @return {[type]} [description]
			 */
			doFilterList() {
				this.getUesrData()
			},
			/**
			 * [spendGetList 获取列表的信息]
			 * @return {[type]} [description]
			 */

			/**
			 /**
			 * [cancelSubmit form表单 重置]
			 * @param  {[type]} name [description]
			 * @return {[type]}      [description]
			 */
			toggleFormDraw(name) {
				if (this.modalFormRules.password.length === 0) {
					let data = [
						{required: true, message: '密码不能为空'},
						{ min: 6, message: '长度至少6位' },
						{pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '密码必须是字母或数字的6-20位字符组成', trigger: 'blur'}]
					this.modalFormRules.password = data
				}
				this.modalForm = {
					sys_account: '',
					password: '',
					user_name: '',
					phone: '',
					email: '',
					status: 1,
					role_id: '',
					resource_allot: 1
				}
				this.resource_allot = 1
				this.targetMedia = []
				this.targetApply = []
				this.targetAd = []
				this.targetCompany = []
				this.targetBudget = []
				this.drawerStatus = 1
				this.mediaStatus = 1
				this.applyStatus = 1
				this.adStatus = 1
				this.companyStatus = 1
				this.budgetStatus = 1
				this.setModalFlag = !this.setModalFlag
			},

			/**
			 * [changePage 修改页码]
			 * @param  {[type]} val [description]
			 * @return {[type]}     [description]
			 */
			changePage(val) {
				this.currentPage = val
				this.getUesrData()
			},
			/**
			 * [sizeChange 切换每页条数时的回调]
			 * @param  {[type]} size [description]
			 * @return {[type]}      [description]
			 */
			sizeChange(size) {
				this.pageSize = size
				this.getUesrData()
			},
			/**
			 * [limitText 剩余项数量]
			 * @param  {[type]} count [description]
			 * @return {[type]}       [description]
			 */
			limitText(count) {
				return `${count}+`
			}
		}
	}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import './transfer.styl';
/deep/ .ivu-select-default.ivu-select-multiple .ivu-select-selection{
	max-height 32px
	overflow auto
}
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
</style>
