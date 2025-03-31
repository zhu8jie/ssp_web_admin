<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<div class="page-title clearfix" style="flex: 1;">
					<h2>规则列表</h2>
				</div>
				<div class="is-handler" style="flex: 0 0 auto;">
					<Button  icon="ios-add" type="primary" @click="doCreate()">新建规则</Button>
				</div>
			</div>
			<div class="search-line">
				<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.rule_id" placeholder="输入规则ID"/>
				<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.rule_name" placeholder="输入规则名称"/>
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<div class="console-table">
				<Table highlight-row stripe border :columns="ruleColumns" :data="rule_req_list"  :loading="tableLoadFlag" :height="tableHeight">
					<template slot-scope="{ row }" slot="id">
						<p class="name-row-ellipsis" :title="row.id">{{row.id}}</p>
					</template>

					<template slot-scope="{ row }" slot="rule_type">
						<span v-if="row.rule_type == '1' ">IP自然天</span>
						<span v-if="row.rule_type == '2' ">IP自然小时</span>
						<span v-if="row.rule_type == '3' ">设备自然天</span>
						<span v-if="row.rule_type == '4' ">设备自然小时</span>
					</template>
					<template slot-scope="{ row }" slot="rule_val">
						<p class="name-row-ellipsis" :title="row.rule_val">{{row.rule_val}}</p>
					</template>

					<template slot-scope="{ row }" slot="status">
						<span v-if="row.status === -1">已停用</span>
						<span v-if="row.status === 1">运行中</span>
					</template>
					<template slot-scope="{ row }" slot="rule_name">
						<p class="name-row-ellipsis" :title="row.rule_name">{{row.rule_name}}</p>
						<p class="tip-row-line"> ID:{{ row.id }}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text"  @click="doCreate(row)">修改</Button>
						<Button type="text" v-if="row.status === 1"  @click="onData(row)">停用</Button>
						<Button type="text" v-if="row.status === -1" @click="onData(row)">启用</Button>
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

		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :title="!modalForm.rule_id ? '新建规则' : '修改规则'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">

				<FormItem label="输入风控类型：" prop="rule_type">
					<Select prop="rule_type" v-model="modalForm.rule_type" clearable placeholder="请选择风控过滤类型"
					>
						<Option :value= 1>IP自然天</Option>
						<Option :value= 2>IP自然小时</Option>
						<Option :value= 3>设备自然天</Option>
						<Option :value= 4>设备自然小时</Option>
					</Select>
				</FormItem>
				<FormItem label="输入过滤阀值：" prop="rule_value">
					<Input :maxlength="200" v-model.trim="modalForm.rule_value"  type="number"
						   @keyup.enter.native="handleEnter"
						   clearable placeholder="请输入规则类型(按enter生成规则名称)"/>
				</FormItem>

				<FormItem label="输入规则名称：" prop="rule_name">
					<Input :maxlength="30" show-word-limit v-model.trim="modalForm.rule_name"
						    clearable placeholder="输入规则名称"/>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancelCard">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
					{{!submitClock ? '提交' : '提交中...'}}
				</Button>
<!--				<Button type="primary" :loading="submitClock" @click="submitCompany('modalForm')">-->
<!--					<span v-if="!submitClock">提交</span>-->
<!--					<span v-else>{{submitTxt}}</span>-->
<!--				</Button>-->
			</div>
		</Drawer>


		<div>
			<el-button type="text" @click="open">点击打开 Message Box</el-button>
		</div>
	</div>
</template>

  <script>
    import {showTitle, regNumPositiveInteger, inputMaxNumber, filterBatchQuery} from '@/libs/util'
    import {debounce, number2Thousand, createObjectURL, formatDate} from '@/libs/tools'
    import {commonMixin} from '@/mixin/basic-common-class.js'
	import {getRuleColum} from '../dsp/data/data.js'
	import {getRuleList,saveRule} from '@/api/rule.js'
    import {tableHeight} from '@/mixin/calc-table-height.js'
    import {inPageAccess} from '@/mixin/in-page-access.js'
    import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
    import {columnFn} from '@/mixin/custom-column.js'
    import {mapActions} from 'vuex'
    import {dataType} from '@/libs/util'

    export default {
      name: 'dsp-test-manage',
      mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
      components: {
        customColumn
      },
      data() {
        return {

			deleteButton: false,
			onoffButton: 1, // 停用开启这条规则
			// _isShow_ : true,  // 添加按钮
			pageSize: 10,
			total_count: 0,
			currentPage: 1,


			submitClock: false, // 保存锁
			setModalFlag: false, // 侧边弹框
			tableLoadFlag: false, // table的loading

			// 搜索条件
			filterSearch: {
				rule_name: '', // 规则名称
				rule_id: '',
			},
			rule_req_list:[],     // 规则列表
			rule_form: [
				{
					type :1
				}
			],
			ruleColumns: getRuleColum(this), // 列
			modalForm: {
				rule_id: '',    // id
				rule_name: '',  // 规则名称
				rule_type: '', // 风控类型
				rule_value: '', // 过滤阀值
				rule_status: '', // 规则状态
				type: false  // 是否手动命名
			},

			modalFormRules: { // form表单正则
				rule_name: [
					{required: true, message: '规则名称不能为空'}
					  // {pattern: regNumCnEnLine, message: '规则名称只支持汉字、数字、英文、下划线'}
				],
				rule_value:[
					// {required: true, message: '风控过滤值输入不合法'}
					{required: true, message: '请输入阀值'},
					{pattern: /^[0-9]\d*$/ ,message: '规则阈值中能输入大于0的数'}
				],
				rule_type:[
					{required: true, message: '风控类型不能为空'}
					// {required: true, message: '请选择规则类型',trigger: 'blur'},
					// {pattern: /^[0-9]\d*$/ ,message: '必须选择'}
				],
			},
        }
      },
		//
		mounted() {
			this.getRuleList()
		},

		computed: {

		},
		// watch: {
		// 	modalForm: {
		// 		deep: true,
		// 		handler(newValue, oldValue) {
		// 			// if( newValue.rule_status === 1 || newValue.rule_status === -1 ) {
		// 			// 	console.log("sdfsa", newValue)
		// 			// 	return
		// 			// }
		// 			console.log("newValue",newValue)
		// 			console.log("oldValue",oldValue)
		//
		// 			if(this.modalForm.rule_name != ""){
		// 				console.log("不等于空")
		// 				if(newValue.rule_name != oldValue.rule_name) {
		// 					this.modalForm.type = true
		// 				}
		// 			}
		//
		// 			if (this.modalForm.type == true) {
		// 				return
		// 			}
		// 			if (newValue.rule_value != '' && newValue.rule_type != ''){
		// 				if(newValue.rule_type === 1) {
		// 					this.modalForm.rule_name = `${newValue.rule_value}次/IP自然天`;
		//
		// 				} else if (newValue.rule_type === 2) {
		// 					this.modalForm.rule_name = `${newValue.rule_value}次/IP自然小时`;
		//
		// 				} else if (newValue.rule_type === 3) {
		// 					this.modalForm.rule_name = `${newValue.rule_value}次/设备自然天`;
		//
		// 				}else if (newValue.rule_type === 4) {
		// 					this.modalForm.rule_name = `${newValue.rule_value}次/设备自然小时`;
		//
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		methods: {
			// 更新默认规则名称
			// updateDefaultName() {
			// 	if (!this.modalForm.type) {
			// 		if(this.modalForm.rule_type === 1) {
			// 			this.modalForm.rule_name = `${this.modalForm.rule_value}次/IP自然天`;
			// 		} else if (this.modalForm.rule_type === 2) {
			// 			this.modalForm.rule_name = `${this.modalForm.rule_value}次/IP自然小时`;
			// 		} else if (this.modalForm.rule_type === 3) {
			// 			this.modalForm.rule_name = `${this.modalForm.rule_value}次/设备自然天`;
			// 		}else if (this.modalForm.rule_type === 4) {
			// 			this.modalForm.rule_name = `${this.modalForm.rule_value}次/设备自然小时`;
			// 		}
			// 		// 如果未自定义名称，则自动生成
			// 		this.modalForm.type = true
			// 	}
			// },
			handleEnter(event) {
				console.log('Enter 键',event)
				event.preventDefault(); // 阻止默认行为
				// if (this.modalForm.type == false) {
					if(this.modalForm.rule_type === 1) {
						this.modalForm.rule_name = `${this.modalForm.rule_value}次/IP自然天`;
					} else if (this.modalForm.rule_type === 2) {
						this.modalForm.rule_name = `${this.modalForm.rule_value}次/IP自然小时`;
					} else if (this.modalForm.rule_type === 3) {
						this.modalForm.rule_name = `${this.modalForm.rule_value}次/设备自然天`;
					}else if (this.modalForm.rule_type === 4) {
						this.modalForm.rule_name = `${this.modalForm.rule_value}次/设备自然小时`;
					}
				// }
				// this.modalForm.type = true
				console.log('Enter 键被按下，规则名称是：', this.modalForm.rule_name);
			},

		  doCreate(row) {
			  this.submitTxt = '提交中...'// 提交按钮的文字
			  this.setModalFlag = true



			  if(row && row.id) {

				  // 编辑
				  this.modalForm = {
					  rule_id : row.id,
					  rule_name: row.rule_name,
					  rule_type:  row.rule_type,

					  rule_value: row.rule_val,
					  rule_status: row.status,
					  type: true
				  }
				  console.log("this.modalForm:", this.modalForm)
			  } else {
				  this.modalForm = {
					  rule_id : '',
					  rule_name: '',
					  rule_type: '',
					  rule_value: '',
					  rule_status: 1,
					  type: false
				  }
			  }
		  },

		// 取消card
			cancelCard() {
				this.submitClock = false
				this.setModalFlag = false
			},


		  doFilterList() {
			  this.currentPage = 1
			  this.getRuleList()
		  },

			/**
			 * [sizeChange 切换每页条数时的回调]
			 * @param  {[type]} size [description]
			 * @return {[type]}      [description]
			 */
			sizeChange(size) {
				this.pageSize = size;
				this.getRuleList()
			},

		  /**
		   * [changePage 修改页码]
		   * @param  {[type]} val [description]
		   * @return {[type]}     [description]
		   */
		  changePage(val) {
			  this.currentPage = val
			  this.getRuleList()
		  },

		  // 弹框提交
		  submitCompany(name) {
			  console.log("modalForm",this.modalForm)
			  this.$refs[name].validate((valid) => {
				  this.subitForm()
			  })
		  },

		  getRuleList() {

			this.tableLoadFlag = true
			getRuleList({
				rule_name  : this.filterSearch.rule_name,
				rule_id : this.filterSearch.rule_id,
				page_num: this.currentPage,
				page_size: this.pageSize,


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

			onData(row) {
			    // console.log("rowrowrow:",row)
				if(row.status === 1) {
						this.modalForm.rule_status = -1
						// row.status = -1
				} else {
						this.modalForm.rule_status = 1
						// row.status = 1
				}
			    this.modalForm.rule_name = row.rule_name
				this.modalForm.rule_id = row.id
				this.modalForm.rule_value = row.rule_val
				this.modalForm.rule_type = row.rule_type
				console.log(this.modalForm)
				saveRule(this.modalForm).then(res => {
					this.submitClock = false

					if(res.code === 200) {
						this.setModalFlag = false
						this.$Message.success({content:this.modalForm.rule_id ? "修改成功" : "新建成功",duration: 3})

						this.filterSearch.rule_id = ''
						this.filterSearch.rule_name = ''
						// this.getRuleList()
						if (this.modalForm.rule_status == -1) {
							row.status = -1
						} else {
							row.status = 1
						}
					} else if(res.code ===500) {
						row.status = 1
						this.modalForm.rule_status = 1
					}
				})
			},
			submitForm(name) {
				// if(this.modalForm.rule_value == "" && )
				console.log("this.modalForm:",this.modalForm)
				// this.modalForm.rule_value = this.modalForm.rule_value
				this.$refs[name].validate((valid)=>{
				  if(valid) {
					  this.submitClock = true
					  this.submitTxt = '提交中...' // 提交按钮的文字
					  console.log("this.modalForm:",this.modalForm)

					  this.modalForm.rule_value = +this.modalForm.rule_value
					  if (!this.modalForm.rule_id) {
						  this.modalForm.rule_id = 0
					  }
					  saveRule(this.modalForm).then(res => {
						  this.submitClock = false

						  if(res.code === 200) {
							  this.setModalFlag = false
							  this.$Message.success({content:this.modalForm.rule_id ? "修改成功" : "新建成功",duration: 3})

							  this.filterSearch.rule_id = ''
							  this.filterSearch.rule_name = ''
							  this.getRuleList()
						  }
					  })
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
