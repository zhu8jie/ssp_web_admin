<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
			</div>
			<div class="search-line">
				<DatePicker
					class="i-margin-right-11 i-width-input"
					:transfer="true"
					format="yyyy-MM-dd"
					:value="search.time"
					placeholder="统计日期"
					:options="options1"
					@on-change="timeChange"
				/>
				<Select class="i-margin-right-11 i-width-input" v-model="search.platform_id" placeholder="预算方" clearable @on-change="dspChange">
					<Option :value="-1">预算方</Option>
					<Option v-for="item in platform3rdList" :value="item.id" :key="'预算方'+item.name">{{ item.name }}</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-input" v-show="dspStatus === 1" v-model="search.dsp_company_id" placeholder="账号/公司名称" clearable>
					<Option v-for="item in companyDataList" :value="item.id" :key="'公司'+item.company_name">{{ item.company_name }}</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-input" v-show="dspStatus === 2" v-model="search.account" placeholder="账号/公司名称" clearable>
					<Option v-for="item in platformList" :value="item.account" :key="'账号'+item.account">{{ item.account }}</Option>
				</Select>
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border
               :columns="exportDataColumns"
               :data="exportDataList"
               :loading="tableLoadFlag"
               :height="tableHeight"
               :no-data-text="noDataText"
        >
					<template slot-scope="{ row, index }" slot="platform_name">
						 <p v-if="row.platform_id === 0">预算方</p>
						 <p v-else>{{ row.platform_name }}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button v-if="row.file_url && _isShow_('download')" @click="uploadData(row)" type="text">下载</Button>
						<Button v-if="!row.file_url && _isShow_('import')" type="text" @click="toExport(row)">导入</Button>
						<Button v-if="row.file_url && _isShow_('reimport')" @click="toExport(row)" type="text">重新导入</Button>
					</template>
				</Table>
				<div class="page-center" style="text-align: center">
					<Page show-total show-elevator show-sizer placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange" />
				</div>
			</div>
		</Card>
		<!--导入数据-->
		<Drawer v-model="exportModalFlag" title="导入数据" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="600" :styles="drawStyles">
			<Form ref="exportForm" :model="exportForm" :label-width="120" :label-colon="true" :rules="exportRuls">
				<FormItem label="统计时间">
					<p>{{exportForm.date}}</p>
				</FormItem>
				<FormItem label="预算方">
					<p v-if="exportForm.platform_id === 0">预算方</p>
					<p v-else>{{ exportForm.platform_name }}</p>
				</FormItem>
				<FormItem label="账号/公司名称">
					<p>{{exportForm.name}}</p>
				</FormItem>
				<FormItem label="下载模板" v-if="exportForm.import_template_url">
					<a class="down_temp" download :href="exportForm.import_template_url">下载
						<span v-if="exportForm.platform_id === 0">{{exportForm.name}}</span>
						<span v-else>{{ exportForm.platform_name }}</span>数据导入模板 <Icon type="md-arrow-down" />
					</a>
				</FormItem>
				<FormItem label="文件" prop="file">
					<Upload
						:action="actionUrl"
						type="drag"
						:show-upload-list="false"
						:format="['csv','xlsx','xls']"
						:on-format-error="handleFormatError"
						:before-upload="handleBeforUpload"
						:max-size="10*1024"
					>
						<div class="upload-inner">
							<div class="icon-box">
								<Icon type="ios-cloud-upload" size="52" style="color: #C0C4CC"></Icon>
							</div>
							<div class="upload-txt">
								<h6>将文件拖到此处，或<span>点击上传</span></h6>
								<p>仅支持.csv为后缀的文件，大小不超过10M</p>
							</div>
						</div>
					</Upload>
				</FormItem>
				<FormItem label="" >
					<p>{{filename}}</p>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancleExport">取消</Button>
				<Button type="primary" :loading="submitClock" @click="uploadPublic()">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import {showTitle} from '@/libs/util'
import {getImportList, uploadImportData, uploadImportDataUrl} from '@/api/data'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { getDspCompanyList, getPlatfromAccountList } from '@/api/dsp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import axios from '@/libs/api.request'

export default {
	name: 'export-data',
	mixins: [commonMixin, tableHeight, inPageAccess],
	data() {
		return {
			actionUrl: uploadImportDataUrl,
			filename: '',
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,
			tableLoadFlag: true,
			options1: {
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				}
			},
			companyDataList: [],
			platformList: [],
			dspStatus: 1,
			search: {
				time: null,
				dsp_company_id: null,
				platform_id: null,
				account: null
			},
			search_time: null,
			exportDataColumns: [
				{
					type: 'index',
					width: 36,
					align: 'center'
				},
				{
					title: '统计日期',
					key: 'date',
					width: 120
				},
				{
					title: '预算方',
					slot: 'platform_name',
					minWidth: 120
				},
				{
					title: '账号名称/公司名称',
					key: 'name',
					minWidth: 160
				},
				{
					title: '导入数据条数',
					key: 'import_count',
					minWidth: 130
				},
				{
					title: '导入时间',
					key: 'import_datetime',
					minWidth: 170
				},
				{
					title: '操作人',
					key: 'sys_user_name',
					minWidth: 100
				},
				{
					title: '操作',
					slot: 'action',
					width: 120
				}
			],
			exportDataList: [],
			exportRuls: {
				file: [{required: true}]
			},

			exportModalFlag: false, // 导入弹窗
			submitClock: false, // 保存并通过 锁
			exportForm: {}, // 数据导入

			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
			uploadList: [] // 上传的文件
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		// 下载
		uploadData(row) {
			window.location.href = row.file_url
		},
		// 查询
		doFilterList() {
			this.pageSize = 10
			this.currentPage = 1
			this.getListData()
		},
		// 获取时间
		timeChange(e) {
			this.search.time = e
		},
		// 预算位变化
		dspChange(val) {
			if (val === -1) {
				this.dspStatus = 1
				this.getDspCompany()
			} else {
				this.dspStatus = 2
				this.getThirdCompany(val)
			}
		},
		// 获取预算位中公司的id
		getDspCompany() {
			getDspCompanyList({}).then(res => {
				if (res.code === 200) {
					this.companyDataList = res.data.list
				}
			})
		},
		// 获取第三方平台中的公司id
		getThirdCompany(val) {
			let platform_id = val
			getPlatfromAccountList({platform_id}).then(res => {
				if (res.code === 200) {
					this.platformList = res.data.list
				}
			})
		},
		// 上传的错误判断
		handleFormatError(file) {
			this.$Message.error({content: '不支持此文件类型', duration: 3})
			this.$Spin.hide()
		},
		// 上传前的判断
		handleBeforUpload(file) {
			this.uploadList = []
			if (file && file.size > (10 * 1024 * 1024)) {
				this.$Message.warning('文件不能大于' + 10 + 'M')
				return false
			} else {
				this.uploadList.push(file)
				this.filename = file.name
				return false
			}
		},
		/**
		 * [uploadPublic 图片、视频公共批量上传]
		 * @return {[type]} [description]
		 */
		uploadPublic() {
			
			if (this.uploadList.length === 0) {
				this.$Message.error('请上传文件')
				return false
			}

			this.$Modal.confirm({
				title: '确认上传?',
				content: !!this.exportForm.file_url ? '重新上传后，之前导入数据将会清空' : '',
				onOk: () => {
					this.upload()
				},
				onCancel: () => {
					return false
				}
			})
		},
		/**
		 * [upload 上传文件]
		 * @return {[type]} [description]
		 */
		upload() {
			this.submitClock = true

			let formData = new FormData()
			formData.append('id', parseInt(this.exportForm.id))
			formData.append('file', this.uploadList[0])

			uploadImportData(formData).then(res => {

				if (res.code === 200) {
					this.$Message.success('上传成功')
					this.exportModalFlag = false
					this.getListData()
				} else {
					this.$Message.error(res.msg)
				}

				this.uploadList = []
				this.submitClock = false
				this.filename = ''
			}).catch(error => {
				this.uploadList = []
				this.submitClock = false
				this.filename = ''
			})
		},
		/**
		 * [toExport 导入]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toExport(row) {
			this.exportModalFlag = true
			this.exportForm = {...row}
			this.uploadList = []
			this.submitClock = false
			this.filename = ''
		},
		changePage(val) {
			this.currentPage = val
			this.getListData()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getListData()
		},
		/**
		 * [cancleExport 取消导入]
		 * @return {[type]} [description]
		 */
		cancleExport() {
			this.exportModalFlag = false
		},
		/**
		 * [trueExport 获取列表]
		 * @return {[type]} [description]
		 */
		getListData() {
			let params = {
				date: this.search.time,
				page_num: this.currentPage,
				page_size: this.pageSize
			}
			
			this.tableLoadFlag = true

			if (this.search.platform_id === -1) {
				params.dsp_company_id = this.search.dsp_company_id
				params.platform_id = ''
				params.account = ''
			} else {
				params.dsp_company_id = ''
				params.platform_id = this.search.platform_id
				params.account = this.search.account
			}

			getImportList(params).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.exportDataList = res.data.list
					this.total_count = res.data.total_count
				}
			}, err => {
				this.tableLoadFlag = false
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
			})
		}
	},
	created() {
		this.getListData()
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.down_temp
    color #3F83F7
	.upload-inner
		display: flex
		align-items: center
		justify-content: center
		padding: 30px 0
		height: 150px
		background: #FAFAFA
		font-size: 0px

		.upload-txt
			margin-left: 20px
			display: inline-block
			vertical-align: middle
			line-height: 24px
			text-align: left

			h6
				font-size: 14px

				font-weight: normal

			p
				font-size: 12px
				color: #999999

</style>
