<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('addNewCompany')" icon="ios-add" type="primary" @click="doCreate()">新建公司</Button>
				</div>
			</div>
			<div class="search-line">
				<Input class="i-margin-right-11 i-width-select" clearable v-model.trim="filterSearch.search_text" placeholder="输入公司名称或公司简称或ID"/>
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="companyColumns" :data="companyDataList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!--公司名称/ID-->
					<template slot-scope="{ row }" slot="company_name">
						<!-- {{ row.company_name }} -->
						<p class="name-row-ellipsis" :title="row.company_name">{{row.company_name}}</p>
						<p class="tip-row-line"> ID:{{ row.id }}</p>
					</template>
					<!--广告请求方式-->
					<template slot-scope="{ row }" slot="dsp_request_method">
						<span v-if="row.dsp_request_method === '1'">GET</span>
						<span v-if="row.dsp_request_method === '0'">POST</span>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('modify')" @click="doCreate(row)">修改</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.dsp_company_id ? '新建公司' : '修改公司'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">
				<FormItem label="输入公司名称：" prop="company_name">
					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.company_name" placeholder="请输入公司名称"/>
				</FormItem>
				<FormItem label="输入公司简称全拼：" prop="dsp_code">
					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.dsp_code" placeholder="请输入公司简称全拼"/>
				</FormItem>
				<FormItem label="输入广告请求地址：" prop="dsp_request_url">
					<Input :maxlength="200" v-model.trim="modalForm.dsp_request_url" placeholder="请输入http或https开头的地址"/>
				</FormItem>
				<FormItem label="选择广告请求方式：" prop="dsp_request_method">
					<Select prop="dsp_request_method" v-model="modalForm.dsp_request_method" placeholder="请选择">
						<Option value="1">GET</Option>
						<Option value="0">POST</Option>
					</Select>
				</FormItem>
				<FormItem label="数据导入模板" prop="file">
					<div class="down_export" v-if="modalForm.import_template_url">
						<div class="name"><icon class="icon icon-excel" />数据导入模板</div>
						<div class="down">
							<a class="down" download :href="modalForm.import_template_url"><icon class="icon icon-download"/>下载</a>
						</div>
						<div class="delete" title="删除" @click="deleteFile"><Icon size="16" type="md-close" /></div>
					</div>
					<Upload
						:action= "uploadUrl"
						type="drag"
						:show-upload-list="false"
						:format="['csv','xlsx','xls']"
						:on-format-error="handleFormatError"
						:on-exceeded-size="handleMaxSize"
						:before-upload="handleBeforeUpload"
						:max-size="10*1024"
						v-if="!modalForm.import_template_url"
					>
						<div class="upload-inner">
							<div class="icon-box">
								<Icon type="ios-cloud-upload" size="52" style="color: #C0C4CC"></Icon>
							</div>
							<div class="upload-txt">
								<h6>将文件拖到此处，或<span>点击上传</span></h6>
								<!-- <p>仅支持.csv为后缀的文件，大小不超过10M</p> -->
							</div>
						</div>
					</Upload>
				</FormItem>
				<FormItem v-if="!modalForm.import_template_url">
					<p>{{filename}}</p>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="setModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitCompany('modalForm')">
					<span v-if="!submitClock">提交</span>
					<span v-else>{{submitTxt}}</span>
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { showTitle, regWebUrl, regNumCnEnLine } from '@/libs/util'
import { getCompanyColumn } from './data/data'
import { saveDspCompany, getDspCompanyList } from '@/api/dsp'
import { uploadFile, uploadFileUrl } from '@/api/common'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'company-manage',
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,

			// 搜索条件
			filterSearch: {
				search_text: '', // 搜索内容
			},

			companyColumns: getCompanyColumn(this), // 列
			companyDataList: [], // 公司列表
			tableLoadFlag: true, // table的loading

			setModalFlag: false,
			modalForm: {
				company_name: '',
				dsp_code: '',
				dsp_request_url: '',
				dsp_request_method: ''
			},
			modalFormRules: { // form表单正则
				company_name: [
					{required: true,  message: '请输入公司主体名称', trigger: 'blur'},
					{pattern: regNumCnEnLine, message: '公司名称只支持汉字、数字、英文、下划线'}
				],
				dsp_code: [{required: true, message: '请输入公司对外简称', trigger: 'blur'}],
				dsp_request_url: [
					{ required: true, message: '请输入广告请求地址',trigger: 'blur'},
					{ pattern: regWebUrl, message: '请输入合法的url地址', trigger: 'blur'}
				],
				dsp_request_method: [{required: true, message: '请选择广告请求方式'}]
			},

			submitClock: false, // 保存锁
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},

			// 上传部分
			submitTxt: '提交中...', // 提交按钮的文字
			uploadUrl: uploadFileUrl,
			filename: '', // 上传文件名称
			catchFilename: '' // 上传文件的回显名称
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getDspCompanyList()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		/**
		 * [getDspCompanyList 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getDspCompanyList() {
			this.tableLoadFlag = true
			getDspCompanyList({
				search_text: this.filterSearch.search_text,
				page_num: this.currentPage,
				page_size: this.pageSize
			}).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total_count
					this.companyDataList = res.data.list
				}
			}, err=> {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [submitCompany 新建/编辑第三方平台账号信息]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitCompany(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {
					// 文件上传二次提醒
					if (!!this.filename) {

						this.submitTxt = '文档上传中...'// 提交按钮的文字

						try {
							Promise.all([this.uploadFile()]).then(res => {
								console.log(res)
								let _flag = res.every(flag => {
									return flag
								})
								if (_flag) this.submitForm()
							})
						} catch (e) {
							console.log(e)
						}
					} else {
						this.submitForm()
					}
				}
			})
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getDspCompanyList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getDspCompanyList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getDspCompanyList()
		},
		/**
		 * [toLink 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		doCreate(row) {

			this.submitTxt = '提交中...'// 提交按钮的文字
			this.setModalFlag = true
			this.uploadList = []
			this.filename = ''

			if (row && row.id) {
				// 编辑
				this.modalForm = {
					dsp_company_id: row.id,
					company_name: row.company_name,
					dsp_code: row.dsp_code,
					dsp_request_url: row.dsp_request_url,
					dsp_request_method: row.dsp_request_method,
					import_template_url: row.import_template_url
				}
			} else {
				this.modalForm = {
					company_name: '',
					dsp_code: '',
					dsp_request_url: '',
					dsp_request_method: ''
				}
			}
		},
		/**
		 * [uploadFile 上传文件]
		 * @return {[type]} [description]
		 */
		uploadFile() {
			let _this = this

			_this.submitClock = true

			let formData = new FormData()
			formData.append('files', _this.uploadList[0])
			formData.append('type', 4) // 上传文件类型，1=PDF，2=图片，3=视频， 4=excel，5=apk，6=ipa

			return new Promise((reslove, reject) => {
				uploadFile(formData).then(res => {
				// 上传
					_this.submitClock = false

					if (res.code === 200) {
						_this.modalForm.import_template_url = `${res.data.host}${res.data.url[0]}`
						reslove(true)
					} else {
						_this.$Message.error({content: '文件上传失败', duration: 3})
						reslove(false)
					}
				}, err => {
					_this.submitClock = false
					_this.$Message.error({content: '文件上传失败', duration: 3})
					reject(false)
				})
			})
		},

		/**
		 * [submitForm 新建/编辑第三方平台账号信息]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitForm() {

			this.submitClock = true
			this.submitTxt = '提交中...' // 提交按钮的文字

			saveDspCompany(this.modalForm).then(res => {

				this.submitClock = false

				if (res.code === 200) {
					this.setModalFlag = false
					this.$Message.success({ content: this.modalForm.dsp_company_id ? '修改成功' : '新建成功', duration: 3})
					this.getDspCompanyList()
				} else {
					this.$Message.error({ content: this.modalForm.dsp_company_id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
				}
			}, err=> {
				this.submitClock = false
			})
		},

		/**
		 * [handleFormatError 上传文件格式校验]
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
		handleFormatError(file) {
			this.$Message.warning({content: '不支持此文件类型', duration: 3})
		},
		/**
		 * [handleMaxSize 文件最大内容]
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
		handleMaxSize(file) {
			this.$Message.warning({content: '文件不能大于10M', duration: 3})
		},
		/**
		 * [handleBeforeUpload 文件上传前校验]
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
		handleBeforeUpload(file) {
			this.uploadList = []
			if (file && file.size > (10 * 1024 * 1024)) {
				this.$Message.warning('文件不能大于10M')
				return false
			} else {
				this.uploadList.push(file)
				this.filename = file.name
				return false
			}
		},
		/**
		 * [deleteFile 修改情况下，删除模板url]
		 * @return {[type]} [description]
		 */
		deleteFile() {
			this.modalForm.import_template_url = ''
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
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
			span
				color: #4083f8
		p
			font-size: 12px
			color: #999999
.down_export
	height: 36px
	display: flex
	background: #F3F5F9
	line-height: 36px
	color: #4083F8
	font-size: 14px
	justify-content: space-between
	padding: 0 10px
	margin-bottom: 30px
	.name
		flex: 1
	.down
		flex: 0 0 50px
		width: 50px
		text-align: center
	.delete
		flex: 0 0 16px
		width: 16px
		cursor: pointer
		margin-left: 10px
	.icon
		display: inline-block
		vertical-align: middle
		font-size: 16px
		margin-right 2px
	.icon-download
		font-size: 12px
.drawer-footer
	button
		width: auto
		padding: 0 30px
</style>
