<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('add')" icon="ios-add" type="primary" @click="doCreate()">新建渠道</Button>
				</div>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
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
			<Drawer v-model="setModalFlag" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建渠道' : '编辑渠道'">
				<Form ref="modalForm" label-position="left" :model="modalForm" :rules="rules" :label-width="90" @submit.native.prevent>
					<FormItem label="渠道名称" prop="name">
						<Input maxlength="30" show-word-limit v-model.trim="modalForm.name" placeholder="请输入渠道名称"/>
					</FormItem>
				</Form>
				<div class="drawer-footer">
					<Button @click="setModalFlag = false">取消</Button>
					<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
						{{!submitClock ? '提交' : '保存中...'}}
					</Button>
				</div>
			</Drawer>
		</Card>
	</div>
</template>

<script>

import { formatDate } from '@/libs/tools'
import { showTitle } from '@/libs/util'
import { getChannelList, addNewChannel, modChannel } from '@/api/monitor'
import { getChannelCol } from './colList.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'channel-manage',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,
			setModalFlag: false, // 抽屉开关
			modalForm: { // modal的form表单
				name: '' // 渠道名称
			},
			rules: { // modal的form正则
				name: [{required: true, message: '请输入渠道名称'}]
			},
			tableLoadFlag: true, // table的loading
			tableColList: getChannelCol(this),
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
		}
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getChannelList()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isInclude: false}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		/**
		 * [getChannelList 获取渠道列表]
		 * @return {[type]} [description]
		 */
		getChannelList() {
			this.tableLoadFlag = true
			getChannelList({
				page_num: this.currentPage,
				page_size: this.pageSize
			}).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total
					this.colDatList = res.data.channels
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

					this.submitClock = true

					let proUrl = form.id ? modChannel(form) : addNewChannel(form)

					proUrl.then(res => {
						this.submitClock = false

						if (res.code === 200) {
							this.setModalFlag = false
							this.$Message.success({content: form.id ? '新建成功' : '保存成功', duration: 3})
							this.getChannelList()
						} else {
							this.$Message.error({content: form.id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
						}
					}, err => {
						console.log(err)
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getChannelList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getChannelList()
		},
		/**
		 * [toLink 新建/编辑]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		doCreate(row) {
			this.setModalFlag = true

			if (row && row.id) {
				this.modalForm = {
					id: row.id,
					name: row.name
				}
			} else {
				this.modalForm = {
					name: ''
				}
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
