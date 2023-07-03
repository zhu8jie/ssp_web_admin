<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}</h2>
        <div class="is-handler">
          <Button v-if="_isShow_('newAddRole')" icon="ios-add" type="primary" @click="toggleFormDraw()">新建角色</Button>
        </div>
      </div>
      <div class="console-table">
        <Table
          highlight-row
          stripe border
          :columns="spendColumns"
          :data="roleList"
          :loading="tableLoadFlag"
          :no-data-text="noDataText"
          :height="tableHeight">
          <!--关联账户-->
          <template slot-scope="{ row }" slot="related_num">
            <p> {{ row.related_num }}</p>
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
          <!--操作人-->
          <template slot-scope="{ row }" slot="operator_name">
            <p v-if="row.operator_name"> {{ row.operator_name }}</p>
            <p v-else> - </p>
          </template>
          <!--操作-->
          <template slot-scope="{ row, index }" slot="action">
            <Button type="text" v-if="_isShow_('modify')" @click="doCreate(row)">修改</Button>
            <Button type="text" v-if="_isShow_('delete')" @click="doDelete(row)">删除</Button>
          </template>
        </Table>

        <div class="page-center">
          <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage'
                :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
        </div>
      </div>
    </Card>
    <Drawer v-model="setModalFlag" class="roleDrawer" :title="drawerStatus===1?'新建角色':'修改角色'" width="600px" :mask-closable="false" :closable="false"
            :styles="drawStyles">
      <Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="80">
        <FormItem label="角色名称" prop="role_name">
          <Input type="text" :maxlength="30" v-model.trim="modalForm.role_name" placeholder="请输入角色名称"/>
        </FormItem>
        <FormItem label="菜单权限" prop="menuList" class="menuList">
          <div class="menuContent">
            <Tree :data="moduleDataList" ref="tree" show-checkbox multiple @on-check-change="menuChange" expand-node/>
          </div>
        </FormItem>
        <FormItem label="报表权限" prop="statement" v-show="reportShow">
          <RadioGroup v-model="modalForm.statement" >
            <Radio :label="1"><span>全部</span></Radio>
            <Radio :label="2"><span>自定义</span></Radio>
          </RadioGroup>
        </FormItem>
        <div class="allot_list" v-show="reportShow && modalForm.statement===2">
          <div class="allot_title">
            <span>流量数据</span>
            <span v-show="flowStatus === 1" class="allot_action" @click="flowStatus=2">展开<Icon type="ios-arrow-down" /></span>
            <span v-show="flowStatus === 2" class="allot_action" @click="flowStatus=1">收起<Icon type="ios-arrow-up" /></span>
          </div>
          <div class="allot_content" v-show="flowStatus === 2">
            <Transfer
              :data="flowList"
              :titles="['可选流量数据指标','已选流量数据指标']"
              :target-keys="targetFlow"
              filterable
              :list-style="listStyle"
              @on-change="handleChangeFlow"/>
          </div>
        </div>
        <div class="allot_list" v-show="reportShow && modalForm.statement===2">
          <div class="allot_title">
            <span>预算数据</span>
            <span v-show="budgetStatus === 1" class="allot_action" @click="budgetStatus=2">展开<Icon type="ios-arrow-down" /></span>
            <span v-show="budgetStatus === 2" class="allot_action" @click="budgetStatus=1">收起<Icon type="ios-arrow-up" /></span>
          </div>
          <div class="allot_content" v-show="budgetStatus === 2">
            <Transfer
              :data="budgetList"
              :titles="['可选预算数据指标','已选预算数据指标']"
              :target-keys="targetBudget"
              filterable
              :list-style="listStyle"
              @on-change="handleChangeBudget"/>
          </div>
        </div>
      </Form>
      <div class="drawer-footer" style="z-index: 10000">
        <Button @click="toggleFormDraw()">取消</Button>
        <Button type="primary" :loading="submitClock" @click="submitAddRole('modalForm')">
          <span v-if="!submitClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import {getSysRole, addSysRole, updateSysRole, deleteSysRole, getSysModule, detailSysRole} from '@/api/permission'
  import {formatDate} from '@/libs/tools'
  import {tableHeight} from '@/mixin/calc-table-height.js'
  import { inPageAccess } from '@/mixin/in-page-access.js'

  export default {
    name: 'spendAmendment',
    mixins: [tableHeight, inPageAccess],
    data() {
      const menuList = (rule, value, callback) => {
        let _form = this.moduleCheckout
        let showTxt = ''
        if (_form.length === 0) {
          showTxt = '请选择对应的菜单权限'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      }
      const statement = (rule, value, callback) => {
        let status = this.modalForm.statement
        let showTxt = ''
        if (status === 2 && this.targetBudget.length === 0) {
          showTxt = '请选择对应的预算数据权限'
        }
        if (status === 2 && this.targetFlow.length === 0) {
          showTxt = '请选择对应的流量数据权限'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      }
      return {
        noDataText: this.$config.noDataText,
        moduleLengthNum: 0,
        flowStatus: 1,
        budgetStatus: 1,
        drawerStatus: 1,
        reportShow: false,
        flowList: [], // 流量数据报表的列表
        targetFlow: [], // 流量数据中的数据选中值
        budgetList: [], // 预算数据中的数据列表
        targetBudget: [], // 预算数据中的数据选中值
        pageSize: 10,
        total_count: 0,
        currentPage: 1,
        listStyle: {
          width: '235px',
          height: '260px'
        },
        spendColumns: [
          {
            type: 'index',
            width: 36,
            align: 'center'
          },
          {
            title: '角色ID',
            key: 'id',
            minWidth: 60
          },
          {
            title: '角色名称',
            key: 'name',
            minWidth: 200
          },
          {
            title: '关联账号数',
            slot: 'related_num',
            minWidth: 80
          },
          {
            title: '创建时间',
            slot: 'created_at',
            minWidth: 150
          },
          {
            title: '更新时间',
            slot: 'updated_at',
            minWidth: 150
          },
          {
            title: '操作人',
            slot: 'operator_name',
            minWidth: 70
          },
          {
            title: '操作',
            slot: 'action',
            width: 90
          }
        ],
        modalFormRules: {
          role_name: [
            {required: true, message: '角色名称不能为空'}
          ],
          menuList: [
            {required: true, validator: menuList}
          ]
          // statement: [
          //   {required: true, validator: statement}
          // ]
        },
        roleList: [], // table数据
        tableLoadFlag: true, // table的loading
        modalForm: {}, // 修改表单
        dataChange: [],
        submitClock: false, // 保存锁
        spinShow: false,
        setModalFlag: false, // 抽屉开关
        moduleDataList: [],
        moduleCheckout: [],
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '54px',
          position: 'static'
        },
        detailRole: []
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
        this.flowList = this.$store.state.app.flowDataList
        this.budgetList = this.$store.state.app.budgetDataList
        this.getRoleData()
        this.getSysModule()
      }
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: false}, 'nav-handle-group': false}) // search-line的高度
    },
    methods: {
      /**
       * [getRoleData 获取列表]
       * @return {[type]} [description]
       */
      getRoleData() {
        this.tableLoadFlag = true
        getSysRole({
          page_num: this.currentPage,
          page_size: this.pageSize
        }).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.total_count = res.data.total
            this.roleList = res.data.list
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [getSysModule 获取菜单的列表]
       * @return {[type]} [description]
       */
      getSysModule() {
        getSysModule().then(res => {
          if (res.code === 200) {
            let module = []
            this.moduleLengthNum = 0
            let obj = {
              title: '全选',
              expand: true,
              checked: this.modalForm.all_models === 1,
              children: this.setModuleDataFormat(res.data.list, 1)
            }
            module.push(obj)
            this.moduleDataList = module
          }
        })
      },
      /**
       * [menuChange 获取菜单的列表]
       * @return {[type]} [description]
       */
      menuChange() {
        let data = this.$refs.tree.getCheckedAndIndeterminateNodes()
        let checkDataID = data.filter(item => {
          return item.id
        }).map((item, index) => {
          return item.id
        })
        this.moduleCheckout = checkDataID
        let checkDataRoute = data.filter(item => {
          return item.route
        }).map((item, index) => {
          return item.route
        })
        let dataCheck = ['ssp-data', 'dsp-data', 'dsp-detail-data']
        dataCheck = dataCheck.filter(item => {
          return checkDataRoute.includes(item)
        })
        if (dataCheck.length > 0) {
          this.reportShow = true
        } else {
          this.reportShow = false
        }
      },
      /**
       * [setModuleDataFormat 格式化模块数据，并且做递归遍历，]
       * [如果当前有children加上_showChildren， 可以展开]
       * @param {[type]} arr [description]
       */
      setModuleDataFormat(arr, level) {
        if (arr.length === 0) {
          return
        }
        let tempArr = []
        arr.map(item => {
          ++this.moduleLengthNum
          item.title = item.name
          item.level = level
          if ([...this.detailRole].indexOf(item.id) > -1) {
            item.checked = true
          }
          if (!!item.sub_model && item.sub_model.length) {
            let _index = level
            item.title = item.name
            if ([...this.detailRole].indexOf(item.id) > -1) {
              item.checked = true
            }
            item.children = this.setModuleDataFormat(item.sub_model, ++_index)
          }
          tempArr.push(item)
        })
        return tempArr
      },
      /**
       * [doCreate 修改角色]
       * @return {[type]} [description]
       */
      doCreate(row) {
        detailSysRole({
          id: row.id
        }).then(res => {
          if (res.code === 200) {
            let dataDetail = res.data.role
            if (!dataDetail.all_fields) {
              this.targetFlow = dataDetail.ssp_fields && dataDetail.ssp_fields.length > 0 ? [...dataDetail.ssp_fields] : []
              this.targetBudget = dataDetail.dsp_fields && dataDetail.dsp_fields.length > 0 ? [...dataDetail.dsp_fields] : []
            } else {
              this.targetFlow = []
              this.targetBudget = []
            }
            this.modalForm = {
              role_name: dataDetail.name,
              id: row.id,
              statement: dataDetail.all_fields ? 1 : 2,
              all_models: dataDetail.all_models ? 1 : 2
            }
            this.moduleCheckout = []
            this.moduleCheckoutRoute = []
            this.setModuleDataList(dataDetail.models, 1)
            let dataCheck = ['ssp-data', 'dsp-data', 'dsp-detail-data']

            dataCheck = dataCheck.filter(item => {
              return this.moduleCheckoutRoute.includes(item)
            })
            if (dataCheck.length > 0) {
              this.reportShow = true
            } else {
              this.reportShow = false
            }
            this.detailRole = []
            this.setModuleDataListFinally(dataDetail.models, 1)
            this.getSysModule()
            this.drawerStatus = 2
            this.flowStatus = 2
            this.budgetStatus = 2
            this.setModalFlag = !this.setModalFlag
          }
        })
      },
      /**
       * [doCreate 获取选中的菜单权限]
       * @return {[type]} [description]
       */
      setModuleDataList(arr, level) {
        if (arr.length === 0) {
          return
        }
        arr.map(item => {
          this.moduleCheckout.push(item.id)
          this.moduleCheckoutRoute.push(item.route)
          if (!!item.sub_model && item.sub_model.length) {
            let _index = level
            this.moduleCheckoutRoute.push(item.route)
            item.children = this.setModuleDataList(item.sub_model, ++_index)
          }
        })
      },
      /**
       * [doCreate 获取选中的菜单权限的最后一项]
       * @return {[type]} [description]
       */
      setModuleDataListFinally(arr, level) {
        if (arr.length === 0) {
          return
        }
        arr.map(item => {
          if (!!item.sub_model && item.sub_model.length) {
            let _index = level
            item.children = this.setModuleDataListFinally(item.sub_model, ++_index)
          } else {
            this.detailRole.push(item.id)
          }
        })
      },

      /**
       * [spendGetList 新建角色]
       * @return {[type]} [description]
       */
      submitAddRole(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            if (this.drawerStatus === 1) {
              this.addRoleEvent()
            } else {
              this.updateRoleEvent()
            }
          }
        })
      },
      /**
       * [addRoleEvent 新建角色]
       * @return {[type]} [description]
       */
       addRoleEvent() {
        this.submitClock = true
        let obj = {}
        obj.name = this.modalForm.role_name
        if (this.moduleCheckout.length === this.moduleLengthNum) {
           obj.all_models = true
           obj.models = this.moduleCheckout
        } else {
          obj.all_models = false
          obj.models = this.moduleCheckout
        }
        if (this.modalForm.statement === 1) {
          obj.all_fields = true
        } else {
          obj.all_fields = false
          if (this.targetFlow && this.targetFlow.length > 0) {
            obj.ssp_fields = this.targetFlow
          }
          if (this.targetBudget && this.targetBudget.length > 0) {
            obj.dsp_fields = this.targetBudget
          }
        }
        addSysRole(obj).then(res => {
          this.submitClock = false
          if (res.code === 200) {
            this.setModalFlag = false
            this.$Message.success({ content: '新建成功', duration: 3 })
            this.getRoleData()
          } else {
            this.$Message.error({ content: '新建失败，请重试', duration: 3 })
          }
        }, err => {
          this.submitClock = false
        })
      },

      /**
       * [addRoleEvent 修改角色]
       * @return {[type]} [description]
       */
      updateRoleEvent() {
        this.submitClock = true
        let obj = {}
        obj.id = this.modalForm.id
        obj.name = this.modalForm.role_name
        if (this.moduleCheckout.length === this.moduleLengthNum) {
          obj.all_models = true
          obj.models = this.moduleCheckout
        } else {
          obj.all_models = false
          obj.models = this.moduleCheckout
        }
        if (this.modalForm.statement === 1) {
          obj.all_fields = true
        } else {
          obj.all_fields = false
          if (this.targetFlow && this.targetFlow.length > 0) {
            obj.ssp_fields = this.targetFlow
          }
          if (this.targetBudget && this.targetBudget.length > 0) {
            obj.dsp_fields = this.targetBudget
          }
        }

        updateSysRole(obj).then(res => {
          this.submitClock = false
          if (res.code === 200) {
            this.setModalFlag = false
            this.$Message.success({ content: '修改成功', duration: 3 })
            this.getRoleData()
          } else {
            this.$Message.error({ content: '修改失败，请重试', duration: 3 })
          }
        }, err => {
          this.submitClock = false
        })
      },

      /**
       * [spendGetList 删除角色]
       * @return {[type]} [description]
       */
      doDelete(row) {
        this.$Modal.confirm({
          title: '如果删除当前角色，其下所有账号将不再具有 除登录外的所有权限，并立即生效，确认删除么？',
          className: 'vertical-center-modal',
          onOk: () => {
            deleteSysRole({
              id: row.id
            }).then(res => {
              if (res.code === 200) {
                this.getRoleData()
              }
            })
          },
          onCancel() {
            console.log('取消')
          }
        })
      },
      /**
       * [spendGetList 获取流量数据选中的值]
       * @return {[type]} [description]
       */
      handleChangeFlow(newDate) {
        this.targetFlow = newDate
      },
      /**
       * [spendGetList 获取预算数据选中的值]
       * @return {[type]} [description]
       */
      handleChangeBudget(newDate) {
        this.targetBudget = newDate
      },
      /**
       /**
       * [cancelSubmit form表单 重置]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      toggleFormDraw() {
        this.modalForm = {
          statement: 1,
          role_name: '',
          all_models: 2
        }
        this.drawerStatus = 1
        this.flowList = this.$store.state.app.flowDataList
        this.budgetList = this.$store.state.app.budgetDataList
        this.targetBudget = []
        this.targetFlow = []
        this.detailRole = []
        this.flowStatus = 1
        this.budgetStatus = 1
        this.reportShow = false
        this.getSysModule()
        this.setModalFlag = !this.setModalFlag
      },

      /**
       * [changePage 修改页码]
       * @param  {[type]} val [description]
       * @return {[type]}     [description]
       */
      changePage(val) {
        this.currentPage = val
        this.getRoleData()
      },
      /**
       * [sizeChange 切换每页条数时的回调]
       * @param  {[type]} size [description]
       * @return {[type]}      [description]
       */
      sizeChange(size) {
        this.pageSize = size
        this.getRoleData()
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import './transfer.styl';
  .roleDrawer {

    /deep/ .menuList{
      /deep/  .ivu-tree ul li {
        margin 0px
        font-size 12px
      }
     /deep/ .ivu-form-item-label{
       padding : 5px 12px 5px 0
     }
      .menuContent{
        max-height 350px
        overflow auto
        padding 10px
        border 1px solid #dcdee2
      }
      /deep/ .ivu-form-item-content{
        line-height 25px
      }
    }
  }
    .option-box
      .option-left
        text-overflow: ellipsis
        white-space: nowrap
        height: 20px
        line-height: 20px
        overflow: hidden
        float: left
        width: 200px

      .option-right
        float: right
        color: #ccc
        height: 20px
        line-height: 20px
</style>
