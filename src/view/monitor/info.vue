<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}
          <span class="small-text">（每5分钟自动刷新）</span>
        </h2>
        <div class="is-handler">
          <Button class="host" type="text" @click="doColumns">自定义列</Button>
          <Button v-if="_isShow_('download')" type="primary" :loading="downClock" @click="downStatement">
            <i class="iconfont icon-download"></i>
            <span v-if="!downClock">下载报表</span>
            <span v-else>下载中...</span>
          </Button>
        </div>
      </div>
      <div class="search-line">
        <DatePicker
          class="i-margin-right-11 mar-bot-10 i-width-date"
          :transfer="true"
          :value="search_time"
          type="daterange"
          format="yyyy-MM-dd"
          :options="options1"
          @on-change="filterByDate"
          :clearable="false"
        />
        <Select class="i-margin-right-11 i-width-select mar-bot-10" filterable clearable v-model="paramCPId" placeholder="请选择CP" @on-change="getAppData">
          <Option v-for="item in cpList" :value="item.id" :key="'cp'+item.id">{{ item.name }}</Option>
        </Select>
        <Select class="i-margin-right-11 i-width-select mar-bot-10" filterable clearable  v-model="paramAppId" placeholder="请选择推广产品">
          <Option v-for="item in appList" :value="item.id" :key="'推广产品'+item.id">{{ item.name }}</Option>
        </Select>
        <Select class="i-margin-right-11 i-width-select mar-bot-10" filterable clearable v-model="paramTaskId" placeholder="请选择渠道">
          <Option v-for="item in taskList" :value="item.id" :key="'渠道'+item.id">{{ item.name }}</Option>
        </Select>
        <Select class="i-margin-right-11 i-width-select mar-bot-10" clearable v-model="paramPlatform" placeholder="请选择推广平台">
          <Option value="1" >Android</Option>
          <Option value="2" >IOS</Option>
        </Select>
        <Input style="width: 280px" type="textarea" class="i-margin-right-11 mar-bot-10" clearable
               v-model.trim="taskNumber" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="输入任务编号,多个用回车分隔"/>
        <Button class="mar-bot-10" type="primary" @click="doFilterList">查询</Button>
      </div>
      <div class="console-table">
        <Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag"
               :no-data-text="noDataText"
               :height="tableHeight"
               show-summary
               sum-text="总计"
               :summary-method="handleSummary"
        >
          <!--时间-->
          <template slot-scope="{ row }" slot="date">
            <p v-if="row.date">   {{ row.date }}</p>
            <p v-else> - </p>
          </template>
          <!-- 任务ID -->
          <template slot-scope="{ row, index }" slot="id">
            <div class="flex-row">
              <span>{{row.task_id}}</span>
              <i class="iconfont icon-book" title="查看任务" @click="viewTask(row)"></i>
            </div>
          </template>

          <!--产品-->
          <template slot-scope="{ row }" slot="product_name">
            <p class="text-row-ellipsis" :title="row.product_name" v-if="row.product_name">{{ row.product_name }}</p>
            <p v-else> - </p>
          </template>
          <!--cp-->
          <template slot-scope="{ row }" slot="cp_name">
            <p class="text-row-ellipsis" :title="row.cp_name" v-if="row.cp_name">{{ row.cp_name }}</p>
            <p v-else> - </p>
          </template>
          <!--渠道-->
          <template slot-scope="{ row }" slot="channel_name">
            <p class="text-row-ellipsis" :title="row.channel_name" v-if="row.channel_name">{{ row.channel_name }}</p>
            <p v-else> - </p>
          </template>
          <!--产品-->
          <template slot-scope="{ row }" slot="os">
            <p v-if="row.os===1">Android</p>
            <p v-else>IOS</p>
          </template>
          <!--入价-->
          <template slot-scope="{ row }" slot="cp_price">
            <p>{{ number2Thousand(row.cp_price) }}</p>
          </template>
          <!--出价-->
          <template slot-scope="{ row }" slot="channel_price">
            <p>{{ number2Thousand(row.channel_price) }}</p>
          </template>
          <!--点击数-->
          <template slot-scope="{ row }" slot="click">
            <p>{{ getNumberInt(row.click) }}</p>
          </template>
          <!--转化数-->
          <template slot-scope="{ row }" slot="action">
            <p>{{ getNumberInt(row.action) }}</p>
          </template>
          <!--转化数-->
          <template slot-scope="{ row }" slot="action">
            <p>{{ getNumberInt(row.action) }}</p>
          </template>
          <!--点转率-->
          <template slot-scope="{ row }" slot="click_action_rate">
            <p>{{ number2Thousand(row.click_action_rate) }}%</p>
          </template>
          <!--实际折扣系数-->
          <template slot-scope="{ row }" slot="actual_discount_rate">
            <p>{{ getNumberInt(row.actual_discount_rate) }}</p>
          </template>
          <!--实时折扣系数-->
          <template slot-scope="{ row }" slot="current_discount_rate">
            <p>{{ getNumberInt(row.current_discount_rate) }}</p>
          </template>
          <!--预测利润率-->
          <template slot-scope="{ row }" slot="profit_rate">
            <p>{{ number2Thousand(row.profit_rate) }}%</p>
          </template>
          <!--回调数-->
          <template slot-scope="{ row }" slot="action_channel">
            <p>{{ getNumberInt(row.action_channel) }}</p>
          </template>

          <!--误差-->
          <template slot-scope="{ row }" slot="action_gap">
            <p>{{ getNumberInt(row.action_gap) }}</p>
          </template>
          <!--预测收入-->
          <template slot-scope="{ row }" slot="income">
            <p>{{ number2Thousand(row.income) }}</p>
          </template>
          <!--预测支出-->
          <template slot-scope="{ row }" slot="cost">
            <p>{{ number2Thousand(row.cost) }}</p>
          </template>
          <!--更新时间-->
          <template slot-scope="{ row }" slot="updated_at">
            <p v-if="row.updated_at">{{ row.updated_at }}</p>
            <p v-else> - </p>
          </template>
        </Table>
        <div class="page-center">
          <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
        </div>
      </div>
    </Card>
    <!--自定义列-->
    <custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>

    <!-- 查看任务 -->
    <view-task ref="viewTask" @on-success="successFn"></view-task>

  </div>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
  import {columnFn} from '@/mixin/custom-column.js'
  import {getDownLoadXls} from '@/api/common'
  import {getInfoColumn} from './colList'
  import {formatDate, number2Thousand, createObjectURL} from '@/libs/tools'
  import { tableHeight } from '@/mixin/calc-table-height.js'
  import {getCPList, getAppList, getChannelList, getTaskReporting, getTaskReportingAPI} from '@/api/monitor'
  import viewTask from './module/view-task' // 查看任务

  export default {
    name: 'third-account-manage',
    mixins: [inPageAccess, columnFn, tableHeight],
    components: {
      customColumn,
      viewTask
    },
    data() {
      return {
        options1: {
          disabledDate(date) {
            let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
            return date.valueOf() >= Date.now() || date.valueOf() < disableData
          }
        }, // 时间的判断方式
        search_time: '', // 时间的默认值
        search: {
          start_date: null,
          end_date: null
        }, // 查询的内容
        pageSize: 10,
        total_count: 0,
        currentPage: 1,
        noDataText: this.$config.noDataText,
        catchTableColList: getInfoColumn(this),
        colDatList: [],
        tableLoadFlag: false, // table的loading
        submitClock: false, // 保存锁
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '54px',
          position: 'static'
        },
        paramCPId: '',
        paramAppId: '',
        paramTaskId: '',
        paramPlatform: '',
        taskNumber: '',
        taskCode: [],
        cpList: '',
        appList: '',
        taskList: '',
        sumData: {},
        updateInterval: null, // 定时器的事件
        dataInterval: 5 * 60 * 1000, // 定时器的时间
        downClock: false // 下载报表的loading
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      }
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': true, 'table-has-amount': true}) // search-line的高度
      const self = this
      this.updateInterval = setInterval(function() {
        self.getInfoList()
      }, self.dataInterval)// 定时刷新
    },
    beforeDestroy() {
      clearInterval(this.updateInterval) // 清楚定时刷新，不清除会一直运行，关闭页面也会定时刷新
    },
    filters: {
      timeFormat(time, format) {
        return formatDate(time * 1000, format)
      }
    },
    created() {
      if (this._hasPageAccess()) {
        this.getTableColumns()
        this.getTimeData()
        this.getInfoList()
        this.getCPAllList()
        this.getTaskAllList()
      }
    },
    methods: {
      successFn() {
        this.getInfoList()
      },
      /**
       * [viewTask 查看任务]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      viewTask(row) {
        this.$refs['viewTask'].initInject(row.task_id)
      },
      number2Thousand(number) {
        return number2Thousand(number)
      },
      // 转换成千分位，保留两位小数
      getNumberFloat(val) {
        if (val) {
          return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        } else {
          return 0
        }
      },
      // 转换成千分位
      getNumberInt(val) {
        if (val) {
          return parseInt(val).toLocaleString()
        } else {
          return 0
        }
      },
      handleSummary ({ columns, data }) {
        const sums = {}
        if (columns) {
          columns.forEach((column, index) => {
            let key = column.key
            if (key === 'date') {
              sums[key] = {
                key,
                value: '合计'
              }
              return
            }
            if (!column.noNeedCalcThou) {
              if (column.title.indexOf('元') > -1) {
                sums[key] = {
                  key,
                  value: this.number2Thousand(this.sumData[key])
                }
              } else if (column.title.indexOf('率') > -1) {
                sums[key] = {
                  key,
                  value: this.number2Thousand(this.sumData[key]) + '%'
                }
              } else {
                sums[key] = {
                  key,
                  value: this.number2Thousand(this.sumData[key])
                }
              }
            } else {
              sums[key] = {
                key,
                value: '-'
              }
            }
          })
          return sums
        }
      },
      /**
       * [getCPAllList 获取cp的信息]
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
      getAppData(val) {
        this.getAppAllList(val)
      },
      /**
       * [getAppAllList 获取推广产品的信息]
       * @return {[type]} [description]
       */
      getAppAllList(val) {
        let obj = {}
        let cp_id_arr = []
        cp_id_arr.push(Number(val))
        val ? obj.cp_id_arr = cp_id_arr : ''
        obj.page_size = 0
        obj.page_num = 1
        getAppList(obj).then(res => {
          if (res.code === 200) {
            this.appList = res.data.apps
          }
        })
      },
      /**
       * [getAppAllList 获取渠道的列表]
       * @return {[type]} [description]
       */
      getTaskAllList() {
        let obj = {}
        obj.page_size = 0
        obj.page_num = 1
        getChannelList(obj).then(res => {
          if (res.code === 200) {
            this.taskList = res.data.channels
          }
        })
      },
      doFilterList() {
        this.currentPage = 1
        if (this.taskNumber) {
          let textareaCode = this.taskNumber
          this.taskCode = textareaCode.split(/[(\r\n)|(\ +)|(,,)]/)
        } else {
          this.taskCode = []
        }
        this.getInfoList()
      },
      getInfoList() {
        this.tableLoadFlag = true
        let obj = {}
        let cpArr = []
        cpArr.push(Number(this.paramCPId))
        this.paramCPId ? obj.cp_id_arr = cpArr : ''
        let appArr = []
        appArr.push(Number(this.paramAppId))
        this.paramAppId ? obj.product_id_arr = appArr : ''
        let channelArr = []
        channelArr.push(Number(this.paramTaskId))
        this.paramTaskId ? obj.channel_id_arr = channelArr : ''
        this.paramPlatform ? obj.os = Number(this.paramPlatform) : ''
        this.taskNumber ? obj.task_id_arr = this.taskCode : ''
        let start_date = this.search.start_date.replace(/-/g, '/')
        let end_date = this.search.end_date.replace(/-/g, '/')
        obj.since = (new Date(start_date).getTime()) / 1000
        obj.until = (new Date(end_date).getTime()) / 1000
        obj.page_size = this.pageSize
        obj.page_num = this.currentPage
        getTaskReporting(obj).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.colDatList = res.data.list ? res.data.list : []
            this.total_count = res.data.total
            this.sumData = res.data.statistic
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [getPlatfromAccountList 获取列表的信息]
       * @return {[type]} [description]
       */
      filterByDate(e) {
        let start = new Date(e[0]).getTime()
        let end = new Date(e[1]).getTime()
        if (end - start > 2678400000) {
          this.$Message.error('选择日期不能超过31天')
          this.getTimeData()
        } else {
          this.search.start_date = e[0]
          this.search.end_date = e[1]
        }
      },
      changePage(val) {
        this.currentPage = val
        this.getInfoList()
      },
      sizeChange(size) {
        this.pageSize = size
        this.currentPage = 1
        this.getInfoList()
      },
      // 设置时间的默认值
      getTimeData() {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        this.search_time = [start, end]
        this.search.start_date = this.getLocalTime(start.getTime())
        this.search.end_date = this.getLocalTime(end.getTime())
      },
      getLocalTime(tt) {
        let date = new Date(tt)
        let Y = date.getFullYear()
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let D = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()
        let data = Y + '-' + M + '-' + D
        return data
      },
      /**
       * [submitAccount 新建/编辑第三方平台账号信息]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */

      /**
       * [downStatement 下载报表]
       * @return {[type]} [description]
       */
      downStatement() {
        this.downClock = true
        let obj = {}
        let cpArr = []
        cpArr.push(Number(this.paramCPId))
        this.paramCPId ? obj.cp_id_arr = cpArr : ''
        let appArr = []
        appArr.push(Number(this.paramAppId))
        this.paramAppId ? obj.product_id_arr = appArr : ''
        let channelArr = []
        channelArr.push(Number(this.paramTaskId))
        this.paramTaskId ? obj.channel_id_arr = channelArr : ''
        this.paramPlatform ? obj.os = Number(this.paramPlatform) : ''
        this.taskNumber ? obj.task_id_arr = this.taskCode : ''
        let start_date = this.search.start_date.replace(/-/g, '/')
        let end_date = this.search.end_date.replace(/-/g, '/')
        obj.since = (new Date(start_date).getTime()) / 1000
        obj.until = (new Date(end_date).getTime()) / 1000
        obj.page_num = 1
        obj.page_size = this.total_count

        let down = {
          url: getTaskReportingAPI(obj),
          method: 'GET'
        }
        getDownLoadXls(down).then(res => {
          if (res.code === 200) {
            let filename = '监测概况.xlsx'
            createObjectURL(res.data.url, filename)
          }
          this.downClock = false
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  /deep/ .console-table {
    .ivu-table-tbody {
      tr:last-child {
        td {
          border-bottom 1px solid #e8eaec
        }
      }
    }
  }
  .mar-bot-10
    vertical-align: top
    margin-bottom: 10px
  .console-table
    margin-top: 5px
  .mar-bot-10
    vertical-align: top
    margin-bottom: 10px
  .flex-row
    display: flex
    align-items: center
    justify-content: space-between
    .iconfont
      flex: 0 0 20px
      height: 16px
      width: 20px
      text-align: right
      color: #4083F8
      cursor: pointer
  .form-item-flex
    display: flex
    align-items: center
    justify-content: space-between
    /deep/ .ivu-input-number
      flex: 1

    .unit
      margin-left: 10px
</style>
