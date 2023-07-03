<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('addNewAccount')" icon="ios-add" type="primary" @click="doCreate()">新建账号</Button>
				</div>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="platformColumns" :data="platformList" :loading="tableLoadFlag" :no-data-text="noDataText">
					<!--状态-->
					<template slot-scope="{ row }" slot="status">
						<span v-if="row.status === 1">正常</span>
						<span v-if="row.status === 2">停用</span>
						<i-switch v-if="_isShow_('modify')" size="small" :true-value="1" :false-value="2" v-model="row.status" @on-change="changeState(row)"/>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('modify')" @click="doCreate(row)">修改</Button>
					</template>
				</Table>
			</div>
			<Drawer v-model="setModalFlag" width="500px" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建账号' : '修改账号'">
				<Form ref="modalForm" label-position="left" :model="modalForm" :rules="modalFormRules" :label-width="90">
					<FormItem label="账号类型" prop="platform_id">
						<RadioGroup v-model="modalForm.platform_id">
							<Radio v-for="item in platform3rdList" :label="item.id" :key="item.id">{{item.name}}</Radio>
						</RadioGroup>
					</FormItem>
					<FormItem label="账号名称" prop="account">
						<Input maxlength="30" show-word-limit v-model.trim="modalForm.account" placeholder="请输入账号"/>
					</FormItem>
					<FormItem label="账号状态" prop="status">
						<RadioGroup v-model="modalForm.status">
							<Radio :label="1">启用</Radio>
							<Radio :label="2">停用</Radio>
						</RadioGroup>
					</FormItem>
				</Form>
				<div class="drawer-footer">
					<Button @click="setModalFlag = false">取消</Button>
					<Button type="primary" :loading="submitClock" @click="submitAccount('modalForm')">
						<span v-if="!submitClock">提交</span>
						<span v-else>提交中...</span>
					</Button>
				</div>
			</Drawer>
		</Card>
	</div>
</template>
<script>
import { showTitle } from '@/libs/util'
import { getPlatfromAccountList, savePlatfromAccount } from '@/api/dsp'
import { getThirdCols } from './data/data'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'third-account-manage',
	mixins: [commonMixin, inPageAccess],
	data() {
		return {
			noDataText: this.$config.noDataText,
			setModalFlag: false, // 抽屉开关
			modalForm: {}, // 修改的modal的form表单
			modalFormRules: { // modal的form正则
				platform_id: [{required: true, message: '请选择账户类型'}],
				account: [{required: true, message: '请输入账户名称'}],
				status: [{required: true, message: '请选择账户状态'}]
			},
			tableLoadFlag: true, // table的loading
			platformColumns: getThirdCols(this),
			platformList: [], // 第三方平台账号数据
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
			this.getPlatfromAccountList()
		}
	},
	methods: {
		/**
		 * [getPlatfromAccountList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getPlatfromAccountList() {
			this.tableLoadFlag = true
			getPlatfromAccountList().then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.platformList = res.data.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [submitAccount 新建/编辑第三方平台账号信息]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitAccount(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {
					let _form = this.modalForm
					this.submitClock = true

					savePlatfromAccount(_form).then(res => {
						this.submitClock = false

						if (res.code === 200) {
							this.setModalFlag = false
							this.$Message.success({content: _form.id ? '新建成功' : '保存成功', duration: 3})
							this.getPlatfromAccountList()
						} else {
							this.$Message.error({content: _form.id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
						}
					}, err => {
						this.submitClock = false
						console.log(err)
					})
				}
			})
		},
		/**
		 * [toLink 新建/编辑]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		doCreate(row) {
			this.setModalFlag = true

			if (row && row.id) {
				this.modalForm = {
					id: row.id,
					platform_id: row.platform_id,
					account: row.account,
					status: row.status
				}
			} else {
				this.modalForm = {
					platform_id: null,
					account: '',
					status: ''
				}
			}
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
					savePlatfromAccount({
						id: item.id,
						platform_id: item.platform_id,
						account: item.account,
						status: item.status
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({content: '状态修改成功', duration: 3})
							this.getPlatfromAccountList()
						}
					})
				},
				onCancel: res => {
					item.status = item.status === 1 ? 2 : 1
				}
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
