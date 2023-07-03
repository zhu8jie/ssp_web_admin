<template>
	<div>
		<Card dis-hover :bordered="false">
			<div class="page-title">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button  type="primary" v-if="_isShow_('remit')" @click="batchRemit()">批量打款</Button>
					<Button class="host" type="text" @click="doColumns">自定义列</Button>
				</div>
			</div>
			<div class="search-line">
				<DatePicker
					ref="dd"
					class="i-margin-right-11 i-width-date mar-bot-10"
					:transfer="true"
					type="month"
					format="yyyy-MM"
					:value="datePickerTime"
					@on-change="datePickerChange"
					placeholder="账单的时间"
					:clearable="true"
				/>

				<Select
					class="i-margin-right-11 i-width-select"
					filterable
					multiple
					v-model="filterSearch.ud_ids"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="媒体简称/ID"
				>
					<Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
				</Select>

				<Input class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.company_name" placeholder="请输入公司全称" :clearable="true" />

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<div class="nav-handle-group">
				<RadioGroup v-model="filterSearch.status" type="button" @on-change="doFilterList">
					<Radio label="">全部<span>({{count}})</span></Radio>
					<Radio label="1">未申请<span>({{status_count[1]}})</span></Radio>
					<Radio label="2">待初审<span>({{status_count[2]}})</span></Radio>
					<Radio label="3">待终审<span>({{status_count[3]}})</span></Radio>
					<Radio label="4">已审核<span>({{status_count[4]}})</span></Radio>
					<Radio label="5">结算材料不全<span>({{status_count[5]}})</span></Radio>
					<Radio label="6">已收结算材料<span>({{status_count[6]}})</span></Radio>
					<Radio label="7">已打款<span>({{status_count[7]}})</span></Radio>

				</RadioGroup>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border
					   :columns="tableColList"
					   :data="colDatList"
					   :loading="tableLoadFlag"
					   :height="tableHeight - 49"
					   :no-data-text="noDataText"
					   @on-selection-change="selectChange"
					   show-summary
					   sum-text="总计"
					   :summary-method="handleSummary"
				>
					<!--账单年月-->
					<template slot-scope="{ row }" slot="date">
						<p class="table_text"> {{ row.date | timeFormat('yyyy年MM月') }}</p>
					</template>

					<!--公司主体名称-->
					<template slot-scope="{ row }" slot="company_short_name">
						<a v-if="_isShow_('viewMedia')" class="name-row-ellipsis" :href="'/ssp/media/view/'+row.ud_id" style="cursor: pointer;text-decoration: underline;color: #333333" target="_blank" :title="row.company_short_name">{{row.company_short_name}}</a>
						<a style="color:#333333" v-else href="javascript:void(0)" :title="row.company_short_name">{{row.company_short_name}}</a>
					</template>
					<!--公司主体名称-->
					<template slot-scope="{ row }" slot="company_name">
						<p class="name-row-ellipsis"  :title="row.company_name">{{row.company_name}}</p>
					</template>

					<!--合作主体-->
					<template slot-scope="{ row }" slot="cooperation_company">
						<p v-if="row.cooperation_company">{{row.cooperation_company === 1 ? '聚量' : '鼎广'}}</p>
						<p v-else>-</p>
					</template>
					<!--合作时间-->
					<template slot-scope="{ row }" slot="cooperation_time">
						<p v-if="row.cooperation_since && row.cooperation_until">{{row.cooperation_since.substring(0,10)}}~{{row.cooperation_until.substring(0,10)}}</p>
						<p v-else>-</p>
					</template>
					<!--发票类型（税率）-->
					<template slot-scope="{ row }" slot="invoice_type">
						<p v-if="row.invoice_type">{{row.invoice_type === 1 ? '增值税普通发票' :row.invoice_type === 2 ? '增值税专用发票（3%）' : '增值税专用发票（6%）' }}</p>
						<p v-else>-</p>
					</template>
					<!--发票项目-->
					<template slot-scope="{ row }" slot="invoice_project">
						<p v-if="row.invoice_project">{{row.invoice_project === 1 ? '广告发布费' : '非广告发布费的其他项目'}}</p>
						<p v-else>-</p>
					</template>
					<!--补扣其他税税率-->
					<template slot-scope="{ row }" slot="otherTax">
						<p v-if="row.other_tax_rate && row.is_cut_other_tax===1">{{getNumberFloat(row.other_tax_rate)}}%</p>
						<p v-else-if="row.is_cut_other_tax===2">0%</p>
						<p v-else>-</p>
					</template>
					<!--结算周期-->
					<template slot-scope="{ row }" slot="settlement_period">
						<p v-if="row.settlement_period">{{row.settlement_period === 1 ? '预付' : row.settlement_period === 2 ? '次月月底'  : row.settlement_period === 3 ? '次次25日前' : '次次月底'}}</p>
						<p v-else>-</p>
					</template>
				  <!--媒体类型-->
				  <template slot-scope="{ row }" slot="type">
					 <p v-if="row.type">{{row.type === 1 ? '直媒' : 'SSP'}}</p>
					 <p v-else>-</p>
				  </template>
					<!--税前金额-->
					<template slot-scope="{ row }" slot="pretax_amount">
						<p v-if="row.pretax_amount">{{getNumberFloat(row.pretax_amount /100) }}</p>
						<p v-else>-</p>
					</template>
					<!--税前修正金额-->
					<template slot-scope="{ row }" slot="pretax_amount_corrected">
						<p v-if="row.pretax_amount_corrected">{{getNumberFloat(row.pretax_amount_corrected /100) }}</p>
						<p v-else>-</p>
					</template>
					<!--实际税后金额-->
					<template slot-scope="{ row }" slot="real_amount">
						<p v-if="row.real_amount">{{getNumberFloat(row.real_amount /100) }}</p>
						<p v-else>-</p>
					</template>
					<!--状态-->
					<template slot-scope="{ row }" slot="status">
						<p style="display: flex;justify-content: space-between;line-height: 20px">
							<span style="vertical-align: middle">{{row.status_text ? row.status_text :  '-' }}</span>
							<span @click="statusShow(row)" style="cursor: pointer;vertical-align: middle;color: #3F83F7">
								   <i class="iconfont icon-rizhi"/>
							</span>
						</p>
					</template>
					<template slot-scope="{ row }" slot="material_date">
						<p v-if="row.material_date">{{row.material_date | timeFormat('yyyy年MM月dd日') }}</p>
						<p v-else>-</p>
					</template>
					<template slot-scope="{ row }" slot="code">
						<p v-if="row.mail_code">{{row.mail_code }}</p>
						<p v-else>-</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="row.status == 2 && _isShow_('trial')" @click="toBanned(row, '媒体月结算单初审', 1)">初审</Button>
						<Button type="text" v-if="row.status == 3 && _isShow_('lastTrial')" @click="toBanned(row, '媒体月结算单终审', 2)">终审</Button>
						<Button type="text" v-if="(row.status == 1 || row.status == 2 || row.status == 3) && _isShow_('modify')" @click="toBanned(row, '修正税前金额', 3)">修正</Button>
						<Button type="text" v-if="(row.status == 4 || row.status == 5 || row.status == 6 || row.status == 7) && row.pdf_file && _isShow_('viewFill')" @click="toPdfFile(row)">查看账单</Button>
						<Button type="text" v-if="(row.status == 4 || row.status == 5) && _isShow_('checkFill') " @click="toBanned(row, '媒体月结算材料确认', 4)">核对结算材料</Button>
						<Button type="text" v-if="row.status == 6 && _isShow_('remit') " @click="remitOne(row)">打款</Button>
						<Button type="text" v-if="row.status == 7 &&  _isShow_('uploadFill')" @click="uploadBanned(row)">上传回单</Button>
						<Button type="text"  v-if="row.status == 7 && _isShow_('downloadFill') && row.back_url" @click="downUrl(row)"  >下载回单</Button>
						<Button type="text" v-if="row.status == 7 && _isShow_('writeFill')" @click="mailShow(row)">填写回寄单号</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<!--操作-->
		<Drawer class="setModal"
				:title="setTitle"
				v-model="setModalFlag" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="600" :styles="drawStyles">
			<Form :label-width="135" ref="setModalForm" :model="setModalForm" :label-colon="true">
				<FormItem label="结算月份">
					<span>{{ setModalForm.date | timeFormat('yyyy年MM月') }}</span>
				</FormItem>
				<FormItem label="媒体简称" >
					<span>{{setModalForm.company_short_name}}(ID:{{setModalForm.ud_id}})</span>
				</FormItem>
				<FormItem label="公司全称" >
					<span>{{setModalForm.company_name}}</span>
				</FormItem>
				<FormItem label="适用税率" >
					<p v-if="setModalForm.invoice_type && setModalForm.invoice_project ">
						{{otherTax}}% 【{{setModalForm.invoice_type === 1 ? '增值税普通发票' :setModalForm.invoice_type === 2 ? '增值税专用发票（3%）' : '增值税专用发票（6%）' }} -
						{{setModalForm.invoice_project === 1 ? '广告发布费' : '非广告发布费的其他项目'}}】
					</p>
                     <p v-else>-</p>
				</FormItem>
				<FormItem label="补扣其他税税率">
					<p v-if="setModalForm.other_tax_rate && setModalForm.is_cut_other_tax===1">{{getNumberFloat(setModalForm.other_tax_rate)}}%</p>
					<p v-else-if="setModalForm.is_cut_other_tax===2">0%</p>
					<p v-else>-</p>
				</FormItem>
				<FormItem label="系统税前金额" v-show="setType !== 4">
					<span>{{getNumberFloat(setModalForm.pretax_amount /100) }}元</span>
				</FormItem>
				<FormItem label="修正税前金额" v-show="setType === 1 || setType === 2">
					<span v-if="setModalForm.pretax_amount_corrected">{{getNumberFloat(setModalForm.pretax_amount_corrected /100) }} 元</span>
					<span v-else>-</span>
				</FormItem>
				<FormItem label="修正税前金额" v-show="setType === 3">
					<InputNumber :min="0.01"   type="number" v-model="setModalForm.pretax_amount_num"  style="width: 150px"/>  元
				</FormItem>
				<FormItem label="税后实结" v-show="setType !== 3">
					<span>{{getNumberFloat(setModalForm.real_amount /100) }} 元</span>
				</FormItem>
				<FormItem label="合作主体" v-show="setType !== 3">
					<span v-if="setModalForm.cooperation_company">{{setModalForm.cooperation_company === 1 ? '聚量' : '鼎广'}}</span>
					<span v-else>-</span>
				</FormItem>
				<FormItem label="合作日期" v-show="setType !== 3">
					<p v-if="setModalForm.cooperation_since && setModalForm.cooperation_until">{{setModalForm.cooperation_since.substring(0,10)}}~{{setModalForm.cooperation_until.substring(0,10)}}
					<span :style="timeStatus===2 ? 'color:green' : 'color:red'">{{timeStatus===2 ? '在有效期内！' : '不在有效期内！'}}</span>
					</p>
					<p v-else>-</p>
				</FormItem>

				<FormItem label="已收结算材料" v-show="setType === 4">
					<RadioGroup v-model="setModalForm.material_ok">
						<Radio :label="1">是</Radio>
						<Radio :label="-1">否</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="已收结算材料日期" v-show="setType === 4 && setModalForm.material_ok ===1">
					<DatePicker type="date"  placeholder="请选择" :value="materialTime" style="width: 200px"  @on-change="dataMaterials"/>
				</FormItem>
				<FormItem label="结算材料核实" v-show="setType === 4 && setModalForm.material_ok ===-1">
					<RadioGroup v-model="setModalForm.material_error">
						<Radio :label="1">无账单</Radio>
						<Radio :label="2">无发票</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="备注">
					<Input v-model.trim="set_remark" show-word-limit maxlength="50" type="textarea" :rows="6" placeholder="不超过50字" />
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button style="margin-right: 20px" @click="setModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitSet('setModalForm')">
					<span v-if="!submitClock">
						<span v-if="setType===1">初审通过</span>
						<span v-else-if="setType===2">终审通过</span>
						<span v-else-if="setType===3">确认修正</span>
						<span v-else>确认</span>
					</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>


		<!--确认打款申请-->
		<Drawer v-model="remitModalFlag" title="确认打款" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500" :styles="drawStyles">
			<p style="color:red">注意：如果确认打款，账单状态会变更为“已打款”，媒体将实时看到已打款的状态</p>
			<p>确认该结算账单已打款吗？</p>
			<Form ref="bannedForm">
				<FormItem label="">
					<Input v-model.trim="remitReason" show-word-limit maxlength="50" type="textarea" :rows="6" placeholder="不超过50字" />
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="remitModalFlag=false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="trueBanned('banned')">
					<span v-if="!submitClock">确定打款</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
		<!--导入数据-->
		<Drawer v-model="exportModalFlag" title="上传打款凭证-电子回单" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="600" :styles="drawStyles">
			<Form ref="exportForm" :model="exportForm" :label-width="0">
				<FormItem label="" prop="file">
					<upload-image :idVal="1" refName="icp_url" :bit="2 * 1024" v-model="back_url" :widthVal="400" :heightVal="200">
						<Icon type="md-add" size="30"/>
						<p>点击上传打款凭证-电子回单</p>
					</upload-image>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancleExport">取消</Button>
				<Button type="primary" :loading="submitClock" @click="uploadFileBanned()">
					<span v-if="!submitClock">确定上传</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>

		<!--填写回寄单号-->
		<Drawer v-model="mailModalFlag" title="填写回寄单号" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500" :styles="drawStyles">
			<p style="color:red">注意：如媒体需要账单回寄，请回寄结算账单，并将回寄单号填写到如下输入框</p>
			<p>填写回寄单号</p>
			<Form ref="bannedForm">
				<FormItem label="">
					<Input v-model.trim="mailNumber" show-word-limit maxlength="100" type="text"  placeholder="不超过100字" />
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="mailModalFlag=false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="mailBanned()">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>

		<!-- 状态日志 -->
		<statusLog v-model="logModal" :ids="log_id"></statusLog>
		<!--自定义列-->
		<custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { uploadFile, uploadFileUrl } from '@/api/common'
import { getUnion, randomNumber, formatDate } from '@/libs/tools'
import { getMediaList, mediaResetPwd, getMediaConfigInfo, setMediaDevConfig, setMediaDevStatus } from '@/api/ssp'
import { getUdBillList,  saveUdBillStatus, saveStatusRemit, uploadBackBill, inputMailCode, statusMaterial, statusCorrect , saveLastCheck , getUdSumList} from '@/api/finance'
import { uploadImportDataUrl } from '@/api/data'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { columnFn } from '@/mixin/custom-column.js'
import statusLog from '../components/status-log'
import uploadImage from '_c/upload-image'
import customColumn from '@/components/local-custom-column/custom-column' // 自定义列

export default {
	name: 'midia-manage',
	mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
	components: {
		customColumn,
		statusLog,
		uploadImage
	},
	data() {
		return {
			obj:{type:4},
			set_remark: null,
			mailModalFlag: false,
			mailNumber: null,
			actionUrl: uploadFileUrl,
			exportForm: {},
			filename: '',
			exportDataList: [],
			uploadList:[],
			back_url: '',
			materialTime: null,

			exportModalFlag: false, // 导入弹窗
			remitModalFlag: false, // 打款弹框的
			remitType: 1,
			remitReason: '', // 打款弹框的备注
			pageSize: 10,
			selectID: [],
			total_count: 0,
			currentPage: 1,
			logModal: false,
			log_id: 1,
			noDataText: this.$config.noDataText,
			datePickerTime: null, // 时间选择器
			filterSearch: { // 搜索条件
				status: '', // 标签栏用户状态，1=正常，2=未激活，3=封禁
				ud_ids: [], // 公司id
				company_name: '', // 模糊查询输入框
				end_date: '',
				start_date: '',
			},

			count: 0, // 全部数量

			tableLoadFlag: true, // table的loading
			catchTableColList: [
				{
					type: 'index',
					key: 'index',
					width: 36,
					align: 'center',
					fixed: 'left',
					isHideInColumn: true
				},
				{
					type: 'selection',
					key:'selection',
					width: 50,
					align: 'center',
					fixed: 'left',
					isHideInColumn: true
				},
				{
					title: '账单年月',
					slot: 'date',
					key: 'date',
					fixed: 'left',
					width: 100,
				},
				{
					title: '媒体简称',
					key: 'company_short_name',
					slot: 'company_short_name',
					fixed: 'left',
					minWidth: 130,
				},
				{
					title: '账户ID',
					key: 'ud_id',
					minWidth: 90,
				},
				{
					title: '公司主体名称',
					slot: 'company_name',
					key: 'company_name',
					minWidth: 170
				},
				{
					title: '媒体类型',
					slot: 'type',
					key: 'type',
					minWidth: 80
				},
				{
					title: '合作主体',
					slot: 'cooperation_company',
					key: 'cooperation_company',
					minWidth: 80
				},
				{
					title: '合同有效期',
					slot: 'cooperation_time',
					key: 'cooperation_time',
					minWidth: 180
				},
				{
					title: '发票类型（税率）',
					slot: 'invoice_type',
					key: 'invoice_type',
					minWidth: 180
				},
				{
					title: '发票项目',
					slot: 'invoice_project',
					key: 'invoice_project',
					minWidth: 175
				},
				{
					title: '补扣其他税税率',
					slot: 'otherTax',
					key: 'otherTax',
					minWidth: 160
				},
				{
					title: '结算周期',
					slot: 'settlement_period',
					key: 'settlement_period',
					minWidth: 120
				},
				{
					title: '税前金额（元）',
					slot: 'pretax_amount',
					key: 'pretax_amount',
					minWidth: 160
				},

				{
					title: '修正税前金额（元）',
					slot: 'pretax_amount_corrected',
					key: 'pretax_amount_corrected',
					width: 150,
				},
				{
					title: '税后实结（元）',
					slot: 'real_amount',
					key: 'real_amount',
					width: 120,
				},
				{
					title: '状态',
					slot: 'status',
					key: 'status',
					minWidth: 175,
				},
				{
					title: '结算材料接收日期',
					slot: 'material_date',
					key: 'material_date',
					minWidth: 130,
				},
				{
					title: '回寄单号',
					slot: 'code',
					key: 'code',
					minWidth: 120,
				},
				{
					title: '操作',
					slot: 'action',
					key: 'action',
					width: 240,
					minWidth: 240,
					fixed: 'right',
					isHideInColumn: true
				}
			],
			colDatList: [], // table列表数据

			catchRowData: '', // 点击配置和重置密码时的缓存row数据

			submitClock: false, // 重置密码锁

			setModalFlag: false, // 配置弹窗
			setTitle: '',
			setType: '',
			setModalForm: {
				material_ok: 1,
				material_error: 1
			}, // 配置form表单
			sumData:{},
			status_count:{},

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
			this.getTimeData()
			this.getMediaList() // 默认请求一次媒体列表数据
		}
	},
	activated() {
		this.$Bus.$off('editEmitEvent')
		this.$Bus.$on('editEmitEvent', (msg) => {
			this.getMediaList() // 默认请求一次媒体列表数据
		})
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': true}) // search-line的高度
	},
	computed: {
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
		},
		/**
		 * [otherTax 时间的判断]
		 * @return {[type]} [description]
		 */
		timeStatus() {
			let curTime = new Date()
			let Time = formatDate(curTime, 'yyyy-MM-dd')
			let endTime = this.setModalForm.cooperation_until.substring(0,10)
			let newTime = Date.parse(new Date(Time))
			let modalTime = Date.parse(new Date(endTime))
			let number = 2
			if(modalTime<newTime){
				number = 1
			}
			return number

		},

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
		}
	},
	methods: {

		downUrl(row){
			let img = new Image()
			img.onload = function() {
				var canvas = document.createElement('canvas')
				canvas.width = img.width
				canvas.height = img.height
				var ctx = canvas.getContext('2d')
				// 将img中的内容画到画布上
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
				// 将画布内容转换为Blob
				canvas.toBlob((blob) => {
					// blob转为同源url
					var blobUrl = window.URL.createObjectURL(blob)
					// 创建a链接
					var a = document.createElement('a')
					a.href = blobUrl
					a.download = ''     //文件名称，不填默认为当前请求名称
					// 触发a链接点击事件，浏览器开始下载文件
					a.click()
				})
			}
			img.src = row.back_url
			// 必须设置，否则canvas中的内容无法转换为blob
			img.setAttribute('crossOrigin', 'Anonymous')

		},
		handleSummary({columns, data}) {
			const sums = {}
			columns.forEach((column, index) => {
				let key = column.key
				if (key === 'date') {
					sums[key] = {
						key,
						value: '合计'
					}
					return
				}
				if (column.title && column.title.indexOf('元') > -1) {
					sums[key] = {
						key,
						value: this.getNumberFloat(this.sumData[key]/100)
					}
				} else {
					sums[key] = {
						key,
						value: '-'
					}
				}
			})
			return sums
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},
		uploadPublic() { // 图片、视频公共批量上传
			let formData = new FormData()
			for (let i = 0; i < this.uploadList.length; i++) {
				formData.append('files', this.uploadList[i]) // 文件对象
			}
			formData.append('type', 4)

			this.loading = true

			uploadFile(formData).then(res => {
				let date = res
				if (date.code === 200) {
					this.$Message.success('上传成功')
					let imgUrl = date.data.host + date.data.url[0]
					this.back_url = imgUrl
				} else {
					this.loading = false
					this.$Message.error(date.msg)
				}

				this.uploadList = []
				this.loading = false
			}).catch(error => {
				this.uploadList = []
				this.loading = false
				this.$Message.error(error)
			})
		},
		toPdfFile(row){
			window.open(row.pdf_file)
		},
		handleBeforeUpload(file) {

			this.uploadList = []

			let type = file.name && file.name.indexOf('.') ? file.name.split('.') : ''
			let finallyType = type[type.length - 1].toLowerCase()

				let bitFlag = this.checkMaxBit(file.size) // 检查文件大小 ,kb单位
				let typeFlag = this.checkFormat(finallyType) // 检验文件类型
                this.filename = file.name
				if(bitFlag && typeFlag) {
					this.uploadList.push(file)
				}

		},


		uploadFileBanned(){
			this.submitClock = true
			let params ={}
			params.bill_id = this.setModalForm.id
			params.back_url = this.back_url
			uploadBackBill(params).then(res => {
				this.submitClock = false
				this.exportModalFlag = false
				if (res.code === 200) {
					this.getMediaList()
					this.$Message.success({content: '操作成功', duration: 3})
				}
			}, err => {
				this.submitClock = false
				this.exportModalFlag = false
			})
		},

		uploadBanned(row){
			this.setModalForm = row
			this.exportModalFlag = true
			this.uploadList = []
			this.back_url = null
			this.loading = false
		},

		/**
		 * [checkMaxBite 校验大小]
		 * return true / false
		 * @return {[type]} [description]
		 */
		checkMaxBit(bit) {

			if ((bit / 1000) > this.bit) {
				this.$Message.error({
					content: '超过文件大小限制',
					duration: 3
				})
				return false
			}

			return true
		},
		/**
		 * [checkFormat 校验文件类型, 必须满足
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		checkFormat(type) {
			let formot = ['csv','xlsx','xls']
			if (!formot.includes(type)) {
				this.$Message.error({
					content: '格式错误',
					duration: 3
				})
				return false
			}

			return true
		},
		dataMaterials(val){
			this.setModalForm.material_date = val
			this.materialTime = val
		},
		/**
		 * [cancleExport 取消导入]
		 * @return {[type]} [description]
		 */
		cancleExport() {
			this.exportModalFlag = false
		},
		/**
		 * [batchRemit 批量打款]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		batchRemit(){
			if (!this.selectID.length) {
				this.$Message.warning('请先勾选账单')
				return
			} else {
                this.remitModalFlag = true
				this.remitReason = ''
				this.remitType = 1
			}
		},

		/**
		 * [statusShow 状态的操作]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		statusShow(row){
			this.logModal = true
			this.log_id = row.id
		},
		/**
		 * [selChange 获取选中的值]
		 * @param  {[type]} item [description]
		 * @return {[type]}     [description]
		 */
		selectChange(select) {
			let _arr = []
			select.map(item => {
				_arr.push(item.id)
			})
			this.selectID = _arr
		},

		// 转换成千分位，保留两位小数
		getNumberFloat(num) {
			if (!num || num === Infinity || num === -Infinity) {
				return 0
			} else {
				if (Number.isInteger(num)) {
					return parseInt(num).toLocaleString() // 数字
				} else {
					return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
				}
			}
		},
		// /**
		//  * [getTimeData 设置时间的默认值]
		//  * @return {[type]} [description]
		//  */
		getTimeData() {
			let curTime = new Date()
			let endTime = formatDate(curTime, 'yyyy-MM-dd')

			this.materialTime = endTime
			this.setModalForm.material_date = endTime
		},
		/**
		 * [datePickerChange 时间的选择]
		 * @return {[type]} [description]
		 */
		datePickerChange(e) {
			if (e) {

				let arr = e.split('-')
				let lastDay= new Date(arr[0],arr[1],0).getDate()
				let num = lastDay.toString()
				this.filterSearch.start_date = e + '-01 00:00:00'
				this.filterSearch.end_date = e + `-`+lastDay+` 23:59:59`
			} else {
				this.filterSearch.start_date = null
				this.filterSearch.end_date = null
			}
		},
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
		remitOne(row){
			this.setModalForm = row
			this.remitModalFlag = true
			this.remitReason = ''
			this.remitType = 2

		},

		/**
		 * [trueBanned 批量打款]
		 * @param  {[type]} type ['open 开启', 'banned' 禁用]
		 * @return {[type]}      [description]
		 */
		trueBanned() {
			this.submitClock = true
            let params ={}
            let bill_ids = []
			this.setModalForm.id ? bill_ids.push(this.setModalForm.id) : ''
			this.remitType === 1 ? params.bill_ids = this.selectID : params.bill_ids = bill_ids
			params.remark = this.remitReason
			saveStatusRemit(params).then(res => {
				this.submitClock = false
				this.remitModalFlag = false
				if (res.code === 200) {
					this.getMediaList()
					this.$Message.success({content: '操作成功', duration: 3})
				}
			}, err => {
				this.submitClock = false
				this.remitModalFlag = false
			})
		},
		/**
		 * [mailShow 快递单号弹框的显示]
		 * @param  {[type]} type ['open 开启', 'banned' 禁用]
		 * @return {[type]}      [description]
		 */
		mailShow(row){
			this.setModalForm = row
			this.mailModalFlag = true
			this.mailNumber = row.mail_code ?  row.mail_code : null
		},
		/**
		 * [mailBanned 填写快递单号]
		 * @param  {[type]} type ['open 开启', 'banned' 禁用]
		 * @return {[type]}      [description]
		 */
		mailBanned(){
			this.submitClock = true
			let params ={}
			params.bill_id = this.setModalForm.id
			params.code = this.mailNumber
			inputMailCode(params).then(res => {
				this.submitClock = false
				this.mailModalFlag = false
				if (res.code === 200) {
					this.getMediaList()
					this.$Message.success({content: '操作成功', duration: 3})
				}
			}, err => {
				this.mailModalFlag = false
				this.submitClock = false
			})
		},

		/**
		 * [toBanned 封禁]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toBanned(row, title , type) {
			this.setModalFlag = true
			this.setModalForm = row
			this.setTitle = title
			this.setType = type
			this.set_remark = null
			this.setModalForm.pretax_amount_num = this.setModalForm.pretax_amount_corrected ?  this.setModalForm.pretax_amount_corrected / 100 : null
		},
		submitSet(){
		  let obj = {}
		  obj.bill_id = this.setModalForm.id
		  obj.remark = this.set_remark
			if(this.setType === 3 && !this.setModalForm.pretax_amount_num){
				this.$Message.warning('修正金额不能为空')
				return false
			}

          this.setType === 3 ? obj.amount = parseInt(this.setModalForm.pretax_amount_num *100) : ''
          this.setType === 4 ? obj.material_ok = this.setModalForm.material_ok : ''
          this.setType === 4 ? obj.material_error = this.setModalForm.material_error : ''
          this.setType === 4 && this.setModalForm.material_ok === 1 &&  this.materialTime ? obj.material_date = Date.parse(new Date(this.materialTime)) / 1000  : ''

		  let url = this.setType === 1 ? saveUdBillStatus : this.setType === 2 ? saveLastCheck  :  this.setType === 3 ? statusCorrect :  statusMaterial
			url(obj).then(res => {
				this.submitClock = false
				this.setModalFlag = false
				if (res.code === 200) {
					this.getMediaList()
					this.$Message.success({content: '操作成功', duration: 3})
				}
			}, err => {
				this.setModalFlag = false
				this.submitClock = false
			})
		},
		/**
		 * [getMediaList description]
		 * @return {[type]} [description]
		 */
		getMediaList() {
			this.tableLoadFlag = true
			let obj = {
				ud_ids: this.filterSearch.ud_ids,
				page_size: this.pageSize,
				page_num: this.currentPage,
			}
			let _filter = this.filterSearch
			!!_filter.status && (obj.status = _filter.status) // 广告位状态
			!!_filter.company_name && (obj.company_name = _filter.company_name) // 公司的全称
			_filter.start_date ? obj.start_date = Date.parse(new Date(_filter.start_date)) / 1000 : '' // 时间的开始
			_filter.end_date ? obj.end_date = Date.parse(new Date(_filter.end_date)) / 1000 : '' // 时间的结束
            this.getSumList()
			getUdBillList(obj).then(res => {

				this.tableLoadFlag = false

				let data = res.data

				if (res.code === 200) {
					this.colDatList = data.list.length ?  data.list : []
					this.total_count = data.total_count
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		// 获取总计
		getSumList(){
			let obj = {
				ud_ids: this.filterSearch.ud_ids,
				page_size: 1,
				page_num: 1,
			}
			let _filter = this.filterSearch
			!!_filter.status && (obj.status = _filter.status) // 广告位状态
			!!_filter.company_name && (obj.company_name = _filter.company_name) // 公司的全称
			_filter.start_date ? obj.start_date = Date.parse(new Date(_filter.start_date)) / 1000 : '' // 时间的开始
			_filter.end_date ? obj.end_date = Date.parse(new Date(_filter.end_date)) / 1000 : '' // 时间的结束
			getUdSumList(obj).then(res => {
				let data = res.data

				if (res.code === 200) {
					this.sumData = data
					this.status_count = data.status_count
					let obj = data.status_count
					let sum = 0
					for (let item in obj){
						sum = sum + obj[item]
					}
					this.count = sum
				}
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

	},
	watch: {
		uploadList(val) {
			if (val.length > 0) {
				this.uploadPublic()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	/deep/ .console-table
		.ivu-table-tbody
			tr:last-child
				td
					border-bottom 1px solid #e8eaec
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
	.ivu-form-item
		margin-bottom: 14px
	.permiss-box
		.per-item
			margin-bottom: 14px
		.ivu-checkbox-group
			label
				color: #999
	label.ivu-radio-wrapper
		color: #999
</style>
