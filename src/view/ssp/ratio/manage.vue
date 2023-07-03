<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button v-if="_isShow_('newAdd')" icon="ios-add" type="primary" @click="doAdd()">新建尺寸比例</Button>
				</div>
			</div>
			<div class="search-line">

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					filterable
					v-model="filterSearch.creative_types"
					placeholder="广告位类型"
					multiple
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
						<Option v-for="child in item.children" :key="child.value" :value="child.value">{{child.label}}</Option>
					</OptionGroup>
				</Select>

				<Input type="textarea" v-model.trim="filterSearch.ad_ratios_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable  :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量尺寸比例" />

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					<!--素材尺寸比例-->
					<template slot-scope="{ row }" slot="size">
						{{row.width_ratio}}:{{row.height_ratio}}
					</template>
					<!--创建时间-->
					<template slot-scope="{ row, index }" slot="created_at">
						{{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" title="新建尺寸比例">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalRules" :label-width="80">
				<FormItem label="广告场景" prop="creative_scene">
					<Select
						filterable
						v-model="modalForm.creative_scene"
						placeholder="请选择广告场景"
					>
						<Option v-for="item in adSceneArr" :value="item.id" :key="item.id">{{ item.title }}</Option>
					</Select>
				</FormItem>
				<FormItem label="广告样式" prop="creative_type">
					<Select
						filterable
						v-model="modalForm.creative_type"
						placeholder="请选择广告样式"
					>
						<Option v-for="item in adStyleArr" :value="item.id" :key="item.id">{{ item.title }}</Option>
					</Select>
				</FormItem>

				<h3 class="add-size-label">素材尺寸比例<span>(注意：尺寸比例一经创建则无法修改，请确认是否正确!)</span></h3>

				<FormItem label="宽" prop="width_ratio">
					<Input :maxlength="3" v-model.trim="modalForm.width_ratio" placeholder="大于0且小于100的正整数"/>
				</FormItem>

				<FormItem label="高" prop="height_ratio">
					<Input :maxlength="3" v-model.trim="modalForm.height_ratio" placeholder="大于0且小于100的正整数"/>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="setModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
					{{!submitClock ? '提交' : '提交中...'}}
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { showTitle, regNumPositiveInteger, filterBatchQuery } from '@/libs/util'
import { formatDate, miniCommonDivisor } from '@/libs/tools'
import { saveAdRatio } from '@/api/ssp'
import { getAdRatio } from '@/api/common'
import { uploadFile, uploadFileUrl } from '@/api/common'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	mixins: [tableHeight, inPageAccess],
	data() {
		const validateNumber = (rule, value, callback) => {
			if (!value || !regNumPositiveInteger.test(value) || value <= 0 || value > 100) {
				callback(new Error('请输入大于0且小于100的正整数'))
			} else {
				if (rule.field === 'height_ratio') {
					
					let width = this.modalForm.width_ratio
					let height = this.modalForm.height_ratio

					if(!!width && !!height) {

						let divisor = miniCommonDivisor(width, height) // 公约数

						if(divisor > 1) {
							callback(new Error(`存在公约数${divisor}, 可输入宽高比${width/divisor}:${height/divisor}`))
						} else {
							callback()
						}
					} else {
						callback()
					}
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
				creative_types: [], // 广告位类型
				ad_ratios: [], // 素材尺寸比例
				ad_ratios_textarea: null, // 素材尺寸比例textarea
			},

			tableColList: [ // 列
				{
					title: 'ID',
					key: 'id',
					width: 80,
				},
				{
					title: '素材尺寸比例',
					slot: 'size',
					width: 170
				},
				{
					title: '广告位类型',
					key: 'ad_type_text',
					minWidth: 150
				},
				{
					title: '创建时间',
					slot: 'created_at',
					width: 170
				}
			],
			colDatList: [],
			tableLoadFlag: true, // table的loading

			setModalFlag: false,
			adStyleArr: [], // 广告样式
			modalForm: {
				creative_scene: '', // 广告场景
				creative_type: '', // 广告样式
				width_ratio: '', // 宽
				height_ratio: '' // 高
			},
			modalRules: { // form表单正则
				creative_scene: [ {required: true,  message: '请选择广告场景'}],
				creative_type: [{required: true, message: '请选择广告样式'}],
				width_ratio: [{required: true, validator: validateNumber}],
				height_ratio: [{required: true, validator: validateNumber}]
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
		},
		/**
		 * [adSceneData  广告位类型 - 格式化]
		 * @return {[type]} [description]
		 */
		adSceneData() {
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
		},
		/**
		 * [adSceneArr 广告场景]
		 * @return {[type]} [description]
		 */
		adSceneArr() {
			return this.$store.state.app.adSceneData
		}
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		}
	},
	created() {
		if (this._hasPageAccess()) {
			this.getAdRatio()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		/**
		 * [getAdRatio 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getAdRatio() {

			let params = {
				...this.getAxiosParams(),
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			this.tableLoadFlag = true

			getAdRatio(params).then(res => {
				this.tableLoadFlag = false
				
				if (res.code === 200) {
					this.total_count = res.data.total_count
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
		 * [getAxiosParams 媒体库数据-参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {}

			// 广告位类型
			!!_filter.creative_types.length && (params.creative_types = _filter.creative_types)

			// 素材尺寸比例
			!!_filter.ad_ratios.length && (params.ad_ratios = _filter.ad_ratios)

			return params
		},
		/**
		 * [submitForm 新建尺寸比例]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitForm(name) {
			this.$refs[name].validate((valid) => {

				if (valid) {

					this.submitClock = true

					let {width_ratio, height_ratio, creative_type} = this.modalForm

					let params = {
						creative_type,
						width_ratio: Number(width_ratio),
						height_ratio: Number(height_ratio)
					}

					saveAdRatio(params).then(res => {
						
						this.submitClock = false

						if (res.code === 200) {
							this.setModalFlag = false
							this.$Message.success({content: '新建成功', duration: 3})
							this.getAdRatio()
						}

					}, err=> {
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			
			this.currentPage = 1

			let _filter = this.filterSearch

			// 素材尺寸比例
			_filter.ad_ratios = filterBatchQuery({value: _filter.ad_ratios_textarea, ratio: true})

			this.getAdRatio()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getAdRatio()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getAdRatio()
		},
		/**
		 * [toLink 新建尺寸比例]
		 * @param  {[type]} el [description]
		 * @return {[type]}	[description]
		 */
		doAdd(row) {

			this.setModalFlag = true
			this.$refs['modalForm'].resetFields()

			this.modalForm = {
				creative_scene: '', // 广告场景
				creative_type: '', // 广告样式
				width_ratio: '', // 宽
				height_ratio: '' // 高
			}
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText(count) {
			return `+ ${count}`
		}
	},
	watch: {
		'modalForm.creative_scene': {
			handler: function(val) {

				let data = [...this.$store.state.app.adStyleData]

				let result = data.filter(item => {
					return item.parentId === val
				})

				this.adStyleArr = result
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.drawer-footer
	button
		width: auto
		padding: 0 30px
.add-size-label
	font-weight: normal
	margin-bottom: 20px
	font-size: 15px
	span
		color: #FF0000
		font-size: 14px
		margin-left: 10px
</style>
