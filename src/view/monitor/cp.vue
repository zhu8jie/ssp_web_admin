<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}
          <span class="small-text">（CP指我们的合作伙伴，CP希望通过平台，对推广过程中产生的数据进行检测和回传）</span>
        </h2>

        <div class="is-handler">
          <Button v-if="_isShow_('addCP')" icon="md-add" class="host" type="text" @click="doCreateCp()">新建CP
          </Button>
          <Button v-if="_isShow_('addApp')" icon="md-add" type="primary" @click="doCreateProduct()">新建推广产品
          </Button>
        </div>
      </div>
      <div class="console-table">
      <Tabs v-model="tabStatus" :animated="false">
        <TabPane label="CP" name="1"/>
        <TabPane label="推广产品" name="2"/>
      </Tabs>
      </div>
      <div class="cp_content">
        <div v-show="tabStatus==='1'">
          <div class="console-table">
            <Table highlight-row stripe border :columns="cpColumns" :data="cpListData" :loading="tableLoadFlag"
                   :no-data-text="noDataText">

              <!--更新时间-->
              <template slot-scope="{ row }" slot="created_at">
                <p v-if="row.created_at">   {{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
                <p v-else> - </p>
              </template>
              <!--操作-->
              <template slot-scope="{ row, index }" slot="action">
                <Button type="text" v-if="_isShow_('addCP')" @click="doCreateCp(row)">修改</Button>
                <Button type="text" v-if="_isShow_('addApp')" @click="doCreateProduct(row,1)">新建推广产品</Button>
              </template>
            </Table>
          </div>
          <div class="page-center" style="margin-bottom: 3px">
            <Page show-total show-sizer show-elevator placement="top" :total="cpPage.total_count"
                  :current.sync='cpPage.currentPage' :page-size="cpPage.pageSize" @on-change="cpChangePage"
                  @on-page-size-change="cpSizeChange"/>
          </div>
        </div>
        <div v-show="tabStatus==='2'">
          <div class="product_search">
            <Select class="i-margin-right-11 i-width-input" v-model="paramCPID" clearable
                    placeholder="CP">
              <Option v-for="item in cpList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
            <Input class="i-margin-right-11 i-width-input-long" v-model.trim.trim="paramSearch" clearable
                   placeholder="请输入推广产品名称或ID"/>
            <Button type="primary" @click="doFilterList">查询</Button>
          </div>
          <div class="console-table">
            <Table highlight-row stripe border :columns="productColumns" :data="appListData" :loading="tableLoadFlag"
                   :no-data-text="noDataText">

              <!--更新时间-->
              <template slot-scope="{ row }" slot="cp_name">
                <p> {{ row.cp.name  }}</p>
              </template>
              <!--更新时间-->
              <template slot-scope="{ row }" slot="created_at">
                <p v-if="row.created_at">   {{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
                <p v-else> - </p>
              </template>
              <!--操作-->
              <template slot-scope="{ row, index }" slot="action">
                <Button type="text" v-if="_isShow_('addApp')" @click="doCreateProduct(row,2)">修改</Button>
              </template>
            </Table>
          </div>
          <div class="page-center" style="margin-bottom: 3px">
            <Page show-total show-sizer show-elevator placement="top" :total="productPage.total_count"
                  :current.sync='productPage.currentPage' :page-size="productPage.pageSize"
                  @on-change="productChangePage" @on-page-size-change="productSizeChange"/>
          </div>
        </div>

      </div>

      <Drawer v-model="setModalCP" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles"
              :title="!cpForm.cpID ? '新建CP' : '编辑CP'">
        <Form ref="cpForm" label-position="left" :model="cpForm" :rules="cpRules" :label-width="85" @submit.native.prevent>
          <FormItem label="CP名称：" prop="account_cp">
            <Input show-word-limit maxlength="30" v-model.trim="cpForm.account_cp" placeholder="请输入CP名称"/>
          </FormItem>
        </Form>
        <div class="drawer-footer modal-footer">
          <Button @click="setModalCP = false">取消</Button>
          <Button type="primary" :loading="submitClock" @click="submitCP('cpForm',1)">
            <span v-if="!submitClock">提交</span>
            <span v-else>提交中...</span>
          </Button>
          <Button style="width: 167px" type="primary" :loading="submitClockTo" @click="submitCP('cpForm',2)">
            <span v-if="!submitClockTo">提交并新建推广产品</span>
            <span v-else>提交中...</span>
          </Button>
        </div>
      </Drawer>
      <Drawer v-model="setModalProduct" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles"
              :title="!productForm.productID ? '新建推广产品' : '编辑推广产品'">
        <Form ref="productForm" label-position="left" :model="productForm" :rules="productRules" :label-width="95">
          <FormItem label="选择CP：" prop="cp_id">
            <Select v-model="productForm.cp_id" placeholder="请选择" :disabled="!!productForm.productID">
              <Option v-for="item in cpList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="推广产品：" prop="productName">
            <Input show-word-limit maxlength="30" v-model.trim="productForm.productName" placeholder="请输入推广产品"/>
          </FormItem>
        </Form>
        <div class="drawer-footer modal-footer">
          <Button @click="setModalProduct = false">取消</Button>
          <Button type="primary" :loading="submitClock" @click="submitApp('productForm')">
            <span v-if="!submitClock">提交</span>
            <span v-else>提交中...</span>
          </Button>
        </div>
      </Drawer>
    </Card>
  </div>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import {getCPList, addCPNew, modCPData, getAppList, addTaskAppNew, modTaskAppNew} from '@/api/monitor'
  import {cpCols, productCols} from './colList.js'
  import {formatDate} from '@/libs/tools'
  import {inPageAccess} from '@/mixin/in-page-access.js'

  export default {
    name: 'third-account-manage',
    mixins: [inPageAccess],
    data() {
      return {
        cpForm: {
          cpID: '',
          account_cp: ''
        },
        cpRules: {
          account_cp: [{required: true, message: 'CP名称不能为空'}]
        },
        submitClockTo: false,
        tabStatus: '1',
        noDataText: this.$config.noDataText,
        setModalCP: false, // 抽屉开关
        setModalProduct: false,
        productForm: {
          productID: '',
          cp_id: '',
          productName: ''
        }, // 修改的modal的form表单
        productRules: { // modal的form正则
          cp_id: [{required: true, message: '请选择cp'}],
          productName: [{required: true, message: '推广产品不能为空'}]
        },
        paramCPID: '',
        paramSearch: '',
        tableLoadFlag: true, // table的loading
        cpColumns: cpCols(this),
        productColumns: productCols(this),
        platformList: [], // 第三方平台账号数据
        submitClock: false, // 保存锁
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          padding: '20px 25px 54px',
          position: 'static'
        },
        cpListData: [],
        appListData: [],
        cpList: [],
        cpPage: {
          pageSize: 10,
          total_count: 0,
          currentPage: 1
        },
        productPage: {
          pageSize: 10,
          total_count: 0,
          currentPage: 1
        }
      }
    },
    filters: {
      timeFormat(time, format) {
        return formatDate(time * 1000, format)
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      }
    },
    created() {
      if (this._hasPageAccess()) {
        this.getCPListData()
        this.getAppListData()
        this.getCPAllList()
      }
    },
    methods: {
      /**
       * [getPlatfromAccountList 获取cp的列表的信息]
       * @return {[type]} [description]
       */
      getCPListData() {
        this.tableLoadFlag = true
        let obj = {}
        obj.page_size = this.cpPage.pageSize
        obj.page_num = this.cpPage.currentPage
        getCPList(obj).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.cpListData = res.data.cp_list
            this.cpPage.total_count = res.data.total
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [getCPAllList 获取全部的cp的列表的信息]
       * @return {[type]} [description]
       */
      getCPAllList() {
        let obj = {}
        obj.page_size = 0
        obj.page_num = 1
        getCPList(obj).then(res => {
          if (res.code === 200) {
            this.cpList = res.data.cp_list
          }
        })
      },
      /**
       * [getAppListData 获取推广产品的列表的信息]
       * @return {[type]} [description]
       */
      doFilterList() {
        console.log(1234)
        this.productPage.pageSize = 10
        this.productPage.currentPage = 1
        this.getAppListData()
      },
      getAppListData() {
        this.tableLoadFlag = true
        let obj = {}
        let cp_id_arr = []
        cp_id_arr.push(Number(this.paramCPID))
        this.paramCPID ? obj.cp_id_arr = cp_id_arr : ''
        this.paramSearch ? obj.name_or_id = this.paramSearch : ''
        obj.page_size = this.productPage.pageSize
        obj.page_num = this.productPage.currentPage
        getAppList(obj).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.appListData = res.data.apps
            this.productPage.total_count = res.data.total
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [submitCP 新建/编辑cp信息]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      submitCP(name, type) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            type === 1 ? this.submitClock = true : this.submitClockTo = true
            if (this.cpForm.cpID) {
              this.modCP(type)
            } else {
              this.addCP(type)
            }
          }
        })
      },
      modCP(type) {
        let _form = {}
        _form.name = this.cpForm.account_cp
        _form.id = Number(this.cpForm.cpID)
        modCPData(_form).then(res => {
          type === 1 ? this.submitClock = false : this.submitClockTo = false
          this.tabStatus = '1'
          if (res.code === 200) {
            this.$Message.success({content: '修改成功', duration: 3})
            this.getCPListData()
            if (type === 1) {
              this.setModalCP = false
            } else {
              this.setModalCP = false
              this.doCreateProduct(res.data.cp, 1)
            }
          } else {
            this.$Message.error({content: '修改失败，请重试', duration: 3})
          }
        }, err => {
          type === 1 ? this.submitClock = false : this.submitClockTo = false
        })
      },
      addCP(type) {
        let _form = {}
        _form.name = this.cpForm.account_cp
        addCPNew(_form).then(res => {
          type === 1 ? this.submitClock = false : this.submitClockTo = false
          this.tabStatus = '1'
          if (res.code === 200) {
            this.setModalCP = false
            this.$Message.success({content: '新建成功', duration: 3})
            this.getCPListData()
            if (type === 1) {
              this.setModalCP = false
            } else {
              this.setModalCP = false
              this.doCreateProduct(res.data.cp, 1)
            }
          } else {
            this.$Message.error({content: '新建失败，请重试', duration: 3})
          }
        }, err => {
          type === 1 ? this.submitClock = false : this.submitClockTo = false
        })
      },
      /**
       * [submitAccount 新建/编辑第三方平台账号信息]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      submitApp(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.submitClock = true
            if (this.productForm.productID) {
              this.modApp()
            } else {
              this.addApp()
            }
          }
        })
      },
      modApp() {
        let form = {}
        form.cp_id = this.productForm.cp_id
        form.id = this.productForm.productID
        form.name = this.productForm.productName
        modTaskAppNew(form).then(res => {
          this.submitClock = false
          this.tabStatus = '2'
          if (res.code === 200) {
            this.setModalProduct = false
            this.$Message.success({content: '修改成功', duration: 3})
            this.getAppListData()
          } else {
            this.$Message.error({content: '修改失败，请重试', duration: 3})
          }
        }, err => {
          this.submitClock = false
        })
      },
      addApp() {
        let form = {}
        form.cp_id = this.productForm.cp_id
        form.name = this.productForm.productName
        addTaskAppNew(form).then(res => {
          this.submitClock = false
          this.tabStatus = '2'
          if (res.code === 200) {
            this.setModalProduct = false
            this.$Message.success({content: '新建成功', duration: 3})
            this.getAppListData()
          } else {
            this.$Message.error({content: '新建失败，请重试', duration: 3})
          }
        }, err => {
          this.submitClock = false
        })
      },
      doCreateCp(row) {
        if (row) {
          this.cpForm.cpID = row.id
          this.cpForm.account_cp = row.name
        } else {
          this.cpForm.cpID = ''
          this.cpForm.account_cp = ''
        }
        this.setModalCP = true
      },
      doCreateProduct(row, type) {
        this.getCPAllList()
        if (row) {
          if (type === 1) {
            this.productForm.cp_id = row.id
            this.productForm.productID = ''
            this.productForm.productName = ''
          } else {
            this.productForm.cp_id = row.cp_id
            this.productForm.productID = row.id
            this.productForm.productName = row.name
          }
        } else {
          this.productForm.productID = ''
          this.productForm.cp_id = ''
          this.productForm.productName = ''
        }
        this.setModalProduct = true
      },
      cpChangePage(val) {
        this.cpPage.currentPage = val
        this.getCPListData()
      },
      cpSizeChange(size) {
        this.cpPage.pageSize = size
        this.cpPage.currentPage = 1
        this.getCPListData()
      },
      productChangePage(val) {
        this.productPage.currentPage = val
        this.getAppListData()
      },
      productSizeChange(size) {
        this.productPage.pageSize = size
        this.productPage.currentPage = 1
        this.getAppListData()
      },
      /**
       * [toLink 新建/编辑]
       * @param  {[type]} el [description]
       * @return {[type]}    [description]
       */
      doCreate(row) {
        this.setModalFlag = true

        if (row && row.id) {
          this.modalForm = {
            id: row.id,
            platform_id: row.platform_id,
            account: row.account,
            status: row.status
          }
        } else {
          this.modalForm = {
            platform_id: null,
            account: '',
            status: ''
          }
        }
      },
      /**
       * [changeState 切换业务状态]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      changeState(item) {
        this.$Modal.confirm({
          title: item.status === 1 ? '确定开启该账号?' : '确定停用该账号?',
          content: '',
          onOk: () => {
            savePlatfromAccount({
              id: item.id,
              platform_id: item.platform_id,
              account: item.account,
              status: item.status
            }).then(res => {
              if (res.code === 200) {
                this.$Message.success({content: '状态修改成功', duration: 3})
                this.getPlatfromAccountList()
              }
            })
          },
          onCancel: res => {
            item.status = item.status === 1 ? 2 : 1
          }
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .mar-bot-10
    vertical-align: top
    margin-bottom: 10px

  /deep/ .ivu-drawer-header {
    padding 14px 25px
  }

  .modal-footer
    button
      width 100px
      margin 0 5px
  /deep/ .ivu-tabs-bar
    margin-bottom: 0px
  .product_search
    margin-top: 15px
</style>
