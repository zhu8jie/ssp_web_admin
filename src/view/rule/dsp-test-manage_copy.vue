<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<div class="page-title clearfix" style="flex: 1;">
					<h2>规则列表</h2>
				</div>
				<div class="is-handler" style="flex: 0 0 auto;">
					<Button v-if="_isShow_" icon="ios-add" type="primary" @click="doCreate()">新建公司</Button>
				</div>
			</div>
			<div class="search-line">
				<Select
					class="i-margin-right-11 i-width-select"
					v-model="rule_form.type"
					placeholder="风控过滤类型"
					:clearable="true"
				>
					<Option :value="1" >IP自然天</Option>
					<Option :value="2" >IP自然小时</Option>
					<Option :value="3" >设备自然天</Option>
					<Option :value="4" >设备自然小时</Option>
				</Select>

				<Select
					class="i-margin-right-11 i-width-select"
					v-model="rule_form.type"
					placeholder="规则状态"
					:clearable="true"
				>
					<Option :value="-1" >无效</Option>
					<Option :value="1" >有效</Option>
				</Select>

			</div>

			<div class="console-table">
				<Table highlight-row stripe border :columns="getRuleColum" :data="rule_req_list" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
					公司名称/ID
					<template slot-scope="{ row }" slot="name">
						<!-- {{ row.company_name }} -->
						<p class="name-row-ellipsis" :title="row.name">{{row.name}}</p>
						<p class="tip-row-line"> ID:{{ row.id }}</p>
					</template>
					广告请求方式
					<template slot-scope="{ row }" slot="risk_type">
						<span v-if="row.risk_type === '1'">IP自然天</span>
						<span v-if="row.risk_type === '2'">IP自然小时</span>
						<span v-if="row.risk_type === '3'">设备自然天</span>
						<span v-if="row.risk_type === '4'">设备自然小时</span>
					</template>
					<template slot-scope="{ row }" slot="rule_val">
						<p class="name-row-ellipsis" :title="row.rule_val">{{row.rule_val}}</p>
					</template>

					<template slot-scope="{ row }" slot="status">
						<p class="name-row-ellipsis" :title="row.status">{{row.status}}</p>
					</template>

					操作
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" v-if="_isShow_('modify')" @click="doCreate(row)">修改</Button>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>

			<div class="edit-content-card clearfix">
				<div class="ad-left-content">
				</div>
			</div>
		</Card>

		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建规则' : '修改规则'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">
				<FormItem label="输入规则名称：" prop="name">
					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.name" placeholder="输入规则名称"/>
				</FormItem>
				<FormItem label="输入风控类型：" prop="risk_type">
<!--					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.risk_type" placeholder="请输入风控类型"/>-->
					<Select prop="risk_type"
						v-model="rule_form.risk_type"
						placeholder="请选择风控过滤类型"

					>
						<Option :value="1" >IP自然天</Option>
						<Option :value="2" >IP自然小时</Option>
						<Option :value="3" >设备自然天</Option>
						<Option :value="4" >设备自然小时</Option>
					</Select>

				</FormItem>
				<FormItem label="输入过滤阀值：" prop="rule_val">
					<Input :maxlength="200" v-model.trim="modalForm.rule_val" placeholder="请输入规则类型"/>
				</FormItem>
				<FormItem label="选择规则状态：" prop="status">
					<Select prop="status" v-model="modalForm.status" placeholder="请选择规则状态">
						<Option :value="-1" >无效</Option>
						<Option :value="1" >有效</Option>
					</Select>
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
    import {showTitle, regNumPositiveInteger, inputMaxNumber, filterBatchQuery} from '@/libs/util'
    import {debounce, number2Thousand, createObjectURL, formatDate} from '@/libs/tools'
    import {commonMixin} from '@/mixin/basic-common-class.js'
	import {getBitColumn, dspSlotStatusEnum, getCompanyColumn, getRuleColum} from './data/data.js'
    import {pickupDspSlotStatus, bannedDspSlotStatus, getDspProductList, getDspSlotList, getDspSlotListAPI, saveDspSlot, updateDspSlotStatus, getErrSspSlot, importDspSlot, importDspSlotApi, getSspByDspList, deleteSspByDsp, dspImportAddUrl, dspImportAdd, dspImportUpdate, dspImportUpdateUrl} from '@/api/dsp'
    import {getDownLoadXls} from '@/api/common'
    import {tableHeight} from '@/mixin/calc-table-height.js'
    import {inPageAccess} from '@/mixin/in-page-access.js'
    import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
    import {columnFn} from '@/mixin/custom-column.js'
    import {mapActions} from 'vuex'
    import { dataType} from '@/libs/util'

    export default {
      name: 'filter-rule',
      mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
      components: {
        customColumn
      },
      data() {
        // const bannedTime = (rule, value, callback) => {
        //   let data = this.bannedData.bannedTime
        //   let flag = new RegExp('^[1-9]([0-9])*$').test(data)
        //   if (!flag) {
        //     callback(new Error('封禁时长必须为大于0的正整数'))
        //   } else {
        //     callback()
        //   }
        // }
        return {

			_isShow_ : true,  // 添加按钮
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			submitClock: false,
			submitTxt: '提交',
			setModalFlag: false, // 侧边弹框
			tableLoadFlag: false, // table的loading
			rule_req_list:[],     // 规则列表
			rule_form: [
				{
					type :1
				}
			],
			ruleColumns: getRuleColum(this), // 列
			modalForm: {
				id: '',    // id
				name: '',  // 规则名称
				risk_type: '', // 风控类型
				rule_val: '', // 过滤阀值
				status: '' // 规则状态
			},

			modalFormRules: { // form表单正则
				name: [
					{required: true,  message: '请输入规则名称', trigger: 'blur'},
					{pattern: regNumCnEnLine, message: '规则名称只支持汉字、数字、英文、下划线'}
				],
				// dsp_code: [{required: true, message: '请输入公司对外简称', trigger: 'blur'}],
				// dsp_request_url: [
				// 	{ required: true, message: '请输入广告请求地址',trigger: 'blur'},
				// 	{ pattern: regWebUrl, message: '请输入合法的url地址', trigger: 'blur'}
				// ],
				// dsp_request_method: [{required: true, message: '请选择广告请求方式'}]
			},
        }
      },

	  created() {
		  getRuleList()
	  },

		mounted() {
			// getRuleList()
		},
		methods: {

		  doCreate(row) {
			  this.submitTxt = '提交中...'// 提交按钮的文字
			  this.setModalFlag = true

			  if(row && row.id) {
				  // 编辑
				  this.modalForm = {
					  id : row.id,
					  name: row.name,
					  risk_type: row.row.risk_type,
					  rule_val: row.rule_val,
					  status: row.status
				  }
			  } else {
				  this.modalForm = {
					  id : '',
					  name: '',
					  risk_type: '',
					  rule_val: '',
					  status: ''
				  }
			  }
		  },
		  // 弹框提交
		  submitCompany() {
			  this.$refs[name].validate((valid) => {
				  this.subitForm()
			  })
		  },

		  getRuleList() {
			this.tableLoadFlag = true

			getRuleList({
				page_nam: this.currentPage,
				page_size: this.pageSize
			}).then(res=> {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total_count
					this.rule_req_list = res.data.list
					console.log("规则列表", this.rule_req_list)
				}
			}, error => {
				if(err.code === 403) {
					this.tableLoadFlag = false
				}
			})
		  },

		  subitForm() {
			  this.submitClock = true
			  this.submitTxt = '提交中...' // 提交按钮的文字

			  saveRule(this.modalForm).then(res => {
				  this.submitClock = false

				  if(res.code === 200) {
					  this.setModalFlag = false
					  this.$Message.success({content:this.modalForm.id ? "修改成功" : "新建成功",duration: 3})
					  getRuleList()
				  }
			  })
		  }

      },


    }
  </script>

  <style lang="stylus" rel="stylesheet/stylus" scoped>
    /deep/ .modal_status .ivu-modal-footer {
      border 0px
    }

    /deep/ .modal_status .ivu-modal-header {
      border 0px
    }

    /deep/ .modalContent .ivu-radio-wrapper {
      width 80px
    }

    /deep/ .ivu-select-default.ivu-select-multiple .ivu-select-selection
      max-height 32px
      overflow auto

    .console-table
      margin-top: 5px

    .mar-bot-10
      vertical-align: top
      margin-bottom: 10px

      /deep/ textarea.ivu-input
        height 32px

    .slot-contact-card
      dl
        word-break: word-break
        white-space: normal

        dt
          font-size: 12px
          font-weight: bold
          line-height: 20px
          margin-bottom: 6px

        dd
          align-items: flex-start
          margin-top: 4px
          display: flex
          cursor: pointer

          .dd-title
            width: 182px
            flex: 0 0 182px
            line-height: 16px
            font-size: 12px
            overflow: hidden
            display: -webkit-box
            -webkit-box-orient: vertical
            -webkit-line-clamp: 1
            word-break: break-word

          .dd-id
            width: 100px
            flex: 0 0 100px
            line-height: 16px
            font-size: 12px
            color: #999
            text-align: right

          .iconfont
            flex: 0 0 20px
            text-align: right
            line-height: 16px
            font-size: 12px
            color: #4083F8
            transform: scale(0.6)

    .size_card
      .size_box
        padding-left: 10px
        padding-right: 10px
        background-color: #EBEBEB
        display: inline-block
        vertical-align: top

      .size_diff
        margin-left: 8px
        display: inline-block
        vertical-align: top

      .size_value
        color: #999999
        font-size: 14px
        margin-right: 8px

    .log
      white-space: pre-wrap
      overflow: hidden
      display: -webkit-box
      -webkit-box-orient: vertical
      -webkit-line-clamp: 2
      word-break: break-word

    .config_header
      display flex
      justify-content space-between

    .config_content
      border 1px solid #D5D5D6
      padding 9px
      max-height 600px
      overflow auto

    /deep/ .config_content .ivu-checkbox-wrapper
      width 100%
      height: 30px;
      line-height: 30px;

    /deep/ .config_detail .ivu-checkbox-wrapper:hover
      background: #F4F5F9
      color #4083F8

    .checkbox-title
      display inline-block
      vertical-align middle
      max-width 420px
      cursor pointer
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

    .checkbox-operate
      float right
      cursor pointer



  </style>
