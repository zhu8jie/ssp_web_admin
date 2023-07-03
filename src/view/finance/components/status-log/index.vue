<template>
	<Modal v-model="modalLog"
		   width="800"
		   @on-cancel="cancel"
		   class="deleteModal">
		<div>
			<div slot="header">
				<p style="margin-bottom: 10px">
					<span style="color: #333333;font-size: 16px;font-weight: bold">结算账单操作记录</span>
				</p>
			</div>
			<Table highlight-row border :columns="logCols" :data="logList"
				   :loading="tableDeleteFlag" max-height="400">
				<!--属性-->
				<template slot-scope="{ row }" slot="created_at">
					<p>{{row.created_at  | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
				</template>
				<template slot-scope="{ row }" slot="operate">
					<p v-if="row.os_context">{{row.os_context}}</p>
					<p v-else>-</p>
				</template>
				<!--操作人-->
				<template slot-scope="{ row }" slot="operate_name">
					{{row.user_name}}
				</template>
				<!--原因-->
				<template slot-scope="{ row }" slot="reason">
					<p class="name-row-ellipsis" :title="row.remark">{{row.remark || '-'}}</p>
				</template>

			</Table>
<!--			<div class="page-center">-->
<!--				<Page show-total show-sizer show-elevator placement="top"-->
<!--					  :total="logPage.total_count"-->
<!--					  :current.sync='logPage.currentPage'-->
<!--					  :page-size="logPage.pageSize"-->
<!--					  @on-change="changePage"-->
<!--					  @on-page-size-change="sizeChange"/>-->
<!--			</div>-->
		</div>
		<div slot="footer">
		</div>
	</Modal>
</template>

<script>
	import {getHistoryList} from '@/api/finance'
	import { formatDate } from '@/libs/tools'
	export default {
		name: 'index',
		props: {
			value: {
				type: Boolean,
				default: false
			},
			ids: {
				type: Number
			},
		},
		data() {
			return {
				productStatus: [ // ，1=未申请，2=待初审，3=待终审，4=已审核，5=结算材料不全，6=异兽结算材料，7=已打款
					{value: 1, label: '恢复采买'},
					{value: 2, label: '拒绝采买'},
					{value: 3, label: '录入有量未采买原因'},
					{value: 4, label: '重新测试'},
					{value: 5, label: '测试不通过'},
					{value: 6, label: '审核通过'}
				], // 产品状态以及运营状态
				tableDeleteFlag: true,
				modalLog: this.value,
				logPage: {
					pageSize: 10,
					total_count: 0,
					currentPage: 1
				},
				logList: [],
				logCols: [
					{
						title: '操作时间',
						slot: 'created_at',
						minWidth: 100
					},
					{
						title: '操作',
						slot: 'operate',
						minWidth: 160
					},
					{
						title: '操作人',
						slot: 'operate_name',
						minWidth: 100
					},
					{
						title: '原因',
						slot: 'reason',
						minWidth: 120
					}],
			}
		},
		created() {

		},
		filters: {
			timeFormat(time, format) {
				return formatDate(time * 1000, format)
			}
		},
		methods: {


			/**
			 * [getLogData 获取日志的数据]
			 * @param  {[type]} id [description]
			 * @return {[type]}    [description]
			 */
			getLogData() {
				let obj = {}
				this.tableDeleteFlag = true
				obj.bill_id = Number(this.ids)
				getHistoryList(obj).then(res => {
					if (res.code === 200) {
						let data = res.data ? res.data : []
						this.logList = data
					}
					this.tableDeleteFlag = false
				}, error => {
					this.tableDeleteFlag = false
				})
			},
			cancel() {
				this.$emit('input', false)
			},
			/**
			 * [changePage 修改页码]
			 * @param  {[type]} val [description]
			 * @return {[type]}     [description]
			 */
			changePage(val) {
				this.logPage.currentPage = val
				this.getLogData()
			},
			/**
			 * [sizeChange 切换每页条数时的回调]
			 * @param  {[type]} size [description]
			 * @return {[type]}      [description]
			 */
			sizeChange(size) {
				this.logPage.currentPage = 1
				this.logPage.pageSize = size
				this.getLogData()
			},

		},
		watch: {
			value(val) {
				this.modalLog = val
				if (val) {
					this.logPage.currentPage = 1
					this.getLogData()
				}
			},
		}
	}
</script>

