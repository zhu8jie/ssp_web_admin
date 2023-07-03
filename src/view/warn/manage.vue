<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>{{headTitle}}<span class="small-text">（针对数字欢喜所有资源的数据异常预警设置，设置成功5分钟后生效）</span>
				</h2>
				<div class="is-handler">
					<Button class="host" type="text" @click="doColumns">自定义列</Button>
						<Button icon="ios-add" type="primary" v-if="_isShow_('addAndEdit')" @click="toEdit()">新建预警</Button>
				</div>
			</div>
			<div class="search-line" ref="search-line">
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="filterSearch.status" clearable placeholder="预警状态">
					<Option :value="1">开启</Option>
					<Option :value="-1">暂停</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="filterSearch.scan_target" clearable placeholder="预警维度">
					<Option :value="1">大盘流量</Option>
					<Option :value="2">广告位&预算位</Option>
					<Option :value="3">应用</Option>
					<Option :value="4">广告位</Option>
					<Option :value="5">公司</Option>
					<Option :value="6">预算位</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="filterSearch.scan_freq" clearable placeholder="时间维度">
					<Option :value="1">日</Option>
					<Option :value="2">时</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="remindPeople" clearable placeholder="被提醒人">
					<Option v-for="item in userList" :value="item.id" :key="'remindPeople'+item.id">{{ item.user_name }}</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="createPeople" clearable placeholder="创建人">
					<Option v-for="item in userList" :value="item.id" :key="'createPeople'+item.id">{{ item.user_name }}</Option>
				</Select>
				<Select class="i-margin-right-11 i-width-time mar-bot-10" v-model="updatePeople" clearable placeholder="修改人">
					<Option v-for="item in userList" :value="item.id" :key="'updatePeople'+item.id">{{ item.user_name }}</Option>
				</Select>
				<DatePicker
					class="i-margin-right-11 i-width-date mar-bot-10"
					:transfer="true"
					:value="create_time"
					type="daterange"
					format="yyyy-MM-dd"
					@on-change="filterByCreate"
					placeholder="创建时间"
					:clearable="true"
				/>
				<DatePicker
					class="i-margin-right-11 i-width-date mar-bot-10"
					:transfer="true"
					:value="update_time"
					type="daterange"
					format="yyyy-MM-dd"
					@on-change="filterByUpdate"
					placeholder="修改时间"
					:clearable="true"
				/>
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="warnTextarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预警名称或编号" />
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="advertiseTextarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称或ID" />
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="budgetTextarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位名称或ID" />
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="applyTextarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量应用名称或ID" />
				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="companyTextarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量公司名称或ID" />
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="tableColList" :data="warnData" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
						<!--名称-->
						<template slot-scope="{ row }" slot="name">
							<p class="text text-row-ellipsis" :title="row.name">{{row.name}}</p>
						</template>
					<!-- 状态 -->
					<template slot-scope="{ row }" slot="status">
						<span v-if="row.status === 1">开启</span>
						<span v-if="row.status === -1">暂停</span>
						<i-switch  v-if="_isShow_('status')" size="small" :true-value="1" :false-value="-1" v-model="row.status" @on-change="changeState(row)"/>
					</template>
						<!--预警维度-->
						<template slot-scope="{ row }" slot="scan_target">
								<p class="text" v-if="row.scan_target === 1">大盘流量</p>
								<p class="text" v-if="row.scan_target === 2">广告位&预算位</p>
								<p class="text" v-if="row.scan_target === 3">应用</p>
								<p class="text" v-if="row.scan_target === 4">广告位</p>
								<p class="text" v-if="row.scan_target === 5">公司</p>
								<p class="text" v-if="row.scan_target === 6">预算位</p>
						</template>
						<!--数据维度-->
						<template slot-scope="{ row }" slot="alarm_scan_val_list">
							<div v-if="row.scan_target === 1"> - </div>
							<div v-else>
								<p class="dataText">
									<span v-for="(item,index) in getScanvalList(row)" :key="item+row.id+index"><span v-if="index!==0"> / </span>{{item}} </span>
								 </p>
							</div>
						</template>
					<!--时间维度-->
					<template slot-scope="{ row }" slot="scan_freq">
						 <p class="text" v-if="row.scan_freq === 1">日</p>
						 <p class="text" v-if="row.scan_freq === 2">小时</p>
					</template>
					<!--预警规则-->
					<template slot-scope="{ row }" slot="alarm_rule_list">
						<div class="dataText">
							 <p v-for="item in getWarnRule(row.alarm_rule_list)" :key="item+row._index" class="text">{{item}}</p>
						</div>
					</template>
					<!--规则关系-->
					<template slot-scope="{ row }" slot="rule_type">
						<p class="text" v-if="row.rule_type === 1">同时满足(与)</p>
						<p class="text" v-if="row.rule_type === 2">满足其一(或)</p>
					</template>
					<!--预警次数-->
					<template slot-scope="{ row }" slot="alarm_count">
						<p class="text" v-if="row.alarm_count">每小时{{row.alarm_count}}次</p>
						<p v-else>-</p>
					</template>
          <!--预警时间间隔-->
          <template slot-scope="{ row }" slot="alarm_min">
            <p class="text" v-if="row.alarm_min">{{row.alarm_min}}分钟</p>
            <p v-else>-</p>
          </template>
					<!--被提醒人-->
					<template slot-scope="{ row }" slot="alarm_user_list">
						<div class="dataText">
							<span v-for="(item,index) in row.alarm_user_list" :key="item.user_name+index"><span v-if="index!==0"> / </span>{{item.user_name}} </span>
						</div>
					</template>
					<!--提醒方式-->
					<template slot-scope="{ row }" slot="alarm_type">
						<p class="text" v-if="row.alarm_type === 1">邮件提醒</p>
                    	<!-- <p class="text" v-if="row.alarm_type === 2">短信提醒</p> -->
						<p class="text" v-if="row.alarm_type === 4">钉钉提醒</p>
                    	<!-- <p class="text" v-if="row.alarm_type === 3">邮件提醒，短信提醒</p> -->
						<p class="text" v-if="row.alarm_type === 5">邮件提醒，钉钉提醒</p>
	                    <!-- <p class="text" v-if="row.alarm_type === 6">短信提醒，钉钉提醒</p>
	                    <p class="text" v-if="row.alarm_type === 7">邮件提醒，短信提醒，钉钉提醒</p> -->
					</template>
					<!--创建人-->
					<template slot-scope="{ row }" slot="creator">
						<span v-if="row.creator">{{ row.creator.user_name }}</span>
						<span v-else>-</span>
					</template>
					<!--修改人-->
					<template slot-scope="{ row }" slot="updater">
						<span v-if="row.updater">{{ row.updater.user_name }}</span>
						<span v-else>-</span>
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
						<!--备注-->
						<template slot-scope="{ row }" slot="comment">
							 <p  class="text-row-ellipsis" :title="row.comment">{{ row.comment }}</p>
						</template>
						<!--操作-->
						<template slot-scope="{ row, index }" slot="action">
							<Button v-if="_isShow_('addAndEdit')" type="text" @click="toEdit(row)">修改</Button>
							<Button v-if="_isShow_('delete')" type="text" @click="deleteAccess(row)">删除</Button>
						</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<!--自定义列-->
		<custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { formatDate, number2Thousand } from '@/libs/tools'
import {getSysUserList} from '@/api/permission'
import { getAlarmList, deleteAlarmApi, modStatusAlarm } from '@/api/warn'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
import { columnFn } from '@/mixin/custom-column.js'
import {getRuleList, getWarnColumn, getRuleEq} from './data'

export default {
	name: 'access-manage',
	mixins: [tableHeight, inPageAccess, columnFn],
	components: {
		customColumn
	},
	data() {
		return {
			rule_eq: getRuleEq(this),
			getRuleData: getRuleList(this),
			catchTableColList: getWarnColumn(this),
			tableLoadFlag: true, // table的loading
			warnData: [],
			noDataText: this.$config.noDataText,
			pageSize: 10,
			total_count: 0,
			currentPage: this.$route.query.page ? Number(this.$route.query.page) : 1, // 页码
			warnTextarea: null, // 预警名称或编号
			advertiseTextarea: null, // 广告位名称或ID
			budgetTextarea: null, // 预算位名称或ID
			applyTextarea: null, // 应用名称或ID
			companyTextarea: null, // 公司名称或ID
			create_time: null, // 创建时间
			update_time: null, // 修改时间
			filterSearch: {
				status: null, // 预警状态
				scan_target: null, // 预警维度
				scan_freq: null, // 时间维度
				created_since: null, // 创建的起始时间
				created_until: null, // 创建的终止时间
				updated_since: null, // 更新的起始时间
				updated_until: null // 更新的终止时间
			},
			remindPeople: null, // 被提醒人
			createPeople: null, // 创建人
			updatePeople: null, // 修改人
			userList: [] // 账户的名称
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
		this.getTableColumns()
		if (this._hasPageAccess()) {
			this.getUserData()
			this.getAlarmListData()
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
	},
	methods: {
		number2Thousand(number) {
			return number2Thousand(number)
		},
		/**
		 * [toEdit 新建以及编辑]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toEdit(row) {
			if (!!row) {
				this.$router.push({name: 'warn-edit', query: {alarm_id: row.id, scan_target: row.scan_target, page: this.currentPage}})
			} else {
				this.$router.push({name: 'warn-edit'})
			}
		},
		/**
		 * [deleteAccess 删除]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		deleteAccess(row) {
			this.$Modal.confirm({
				title: '确认删除当前预警么？',
				className: 'vertical-center-modal',
				onOk: () => {
					deleteAlarmApi({
						alarm_id: row.id
					}).then(res => {
						if (res.code === 200) {
							this.getAlarmListData()
						}
					})
				}
			})
		},
		/**
		 * [getWarnRule 预警规则格式化]
		 * @return {[type]} [description]
		 */
		getWarnRule(row) {
			let list = []
			row.map(item => {
				let value = item.rule_type === 3 ? this.number2Thousand(item.rule_value / 100) : this.number2Thousand(item.rule_value)
				let i = item.rule_eq - 1
				let word = ''
				let unit = ''
        let rule_eq = ''
				this.getRuleData.map((it, index) => {
					if (it.key === item.rule_field) {
						word = it.label
						unit = it.unit
					}
				})
        rule_eq = item.rule_field >= 9 && item.rule_field <= 14 ? item.rule_eq === 3 || item.rule_eq === 5 ? '上升' : '下降' : this.rule_eq[i].label
				let text = word + rule_eq + value + unit
				list.push(text)
			})
			return list
		},
		/**
		 * [getScanvalList 数据维度的格式化]
		 * @return {[type]} [description]
		 */
		getScanvalList(row) {
			let list = []
			let data = row.alarm_scan_val_arr
			data.map(item => {
				let text = ''
				if (row.scan_target === 2) {
					text = item.ssp_slot.ssp_slot_name + '&' + item.dsp_slot.dsp_slot_name
				} else if (row.scan_target === 3) {
					text = item.ssp_app.app_name
				} else if (row.scan_target === 4) {
					text = item.ssp_slot.ssp_slot_name
				} else if (row.scan_target === 5) {
					text = item.dsp_company.company_name
				} else if (row.scan_target === 6) {
					text = item.dsp_slot.dsp_slot_name
				}
				list.push(text)
			})
			return list
		},
		/**
		 * [getuesrData 获取账户的列表]
		 * @return {[type]} [description]
		 */
		getUserData() {
			getSysUserList({
				page_num: 1,
				page_size: 0
			}).then(res => {
				if (res.code === 200) {
					this.userList = res.data.list
				}
			})
		},
		/**
		 * [filterByCreate 创建时间的赋值]
		 * @return {[type]} [description]
		 */
		filterByCreate(e) {
			this.filterSearch.created_since = e[0] ? `${e[0]} 00:00:00` : ''
			this.filterSearch.created_until = e[1] ? `${e[1]} 23:59:59` : ''
		},
		/**
		 * [filterByCreate 更新时间的赋值]
		 * @return {[type]} [description]
		 */
		filterByUpdate(e) {
			this.filterSearch.updated_since = e[0] ? `${e[0]} 00:00:00` : ''
			this.filterSearch.updated_until = e[1] ? `${e[1]} 23:59:59` : ''
		},
		/**
		 * [doFilterList 查询列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getAlarmListData()
		},
		/**
		 * [getAlarmListData 获取预警中心列表]
		 * @return {[type]} [description]
		 */
		getAlarmListData() {
			this.tableLoadFlag = true
			let form = {
				status: this.filterSearch.status,
				scan_target: this.filterSearch.scan_target,
				scan_freq: this.filterSearch.scan_freq,
				created_since: this.filterSearch.created_since,
				created_until: this.filterSearch.created_until,
				updated_since: this.filterSearch.updated_since,
				updated_until: this.filterSearch.updated_until,
				page_num: this.currentPage,
				page_size: this.pageSize
			}
			// 被提醒人
			if (this.remindPeople) {
				let data = []
				data.push(this.remindPeople)
				form.user_id_arr = data
			}
			// 创建人
			if (this.createPeople) {
				let data = []
				data.push(this.createPeople)
				form.created_uid = data
			}
			// 修改人
			if (this.updatePeople) {
				let data = []
				data.push(this.updatePeople)
				form.updated_uid = data
			}
			// 预警名称或编号
			this.warnTextarea ? form.alarm_name_or_id = this.warnTextarea.split(/[(\r\n)|(，)|(,,)]/) : ''
			// 广告位名称或编号
			this.advertiseTextarea ? form.ssp_slot_name_or_id = this.advertiseTextarea.split(/[(\r\n)|(，)|(,,)]/) : ''
			// 预算位名称或编号
			this.budgetTextarea ? form.dsp_slot_name_or_id = this.budgetTextarea.split(/[(\r\n)|(,)|(,,)]/) : ''
			// 应用名称或编号
			this.applyTextarea ? form.app_slot_name_or_id = this.applyTextarea.split(/[(\r\n)|(，)|(,,)]/) : ''
			// 公司名称或编号
			this.companyTextarea ? form.dsp_company_name_or_id = this.companyTextarea.split(/[(\r\n)|(，)|(,,)]/) : ''
			getAlarmList(form).then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total
					this.warnData = res.data.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}

				this.tableLoadFlag = false
			})
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getAlarmListData()
		},
		/**
		 * [changeState 切换业务状态]
		 * @param  {[type]} item [description]
		 * @return {[type]}     [description]
		 */
		changeState(item) {
			this.$Modal.confirm({
				title: item.status === 1 ? '确定开启?' : '确定停用?',
				onOk: () => {
					let arr = []
					arr.push(item.id)
					modStatusAlarm({
						alarm_id_arr: arr,
						status: item.status
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({content: '状态修改成功', duration: 3})
						}
						this.getAlarmListData()
					})
				},
				onCancel: res => {
					item.status = item.status === 1 ? -1 : 1
				}
			})
		},

		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getAlarmListData()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height 32px
.console-table
	margin-top: 5px
.dataText
	width 100%
	display inline-block
	max-height 150px
	overflow auto
	line-height 25px
</style>
