<template>
  <Modal v-model="modalSelect"
         width="1200"
         @on-cancel="cancel"
         class="deleteModal">
    <div>
      <div slot="header">
        <p>
          <span style="color: #333333;font-size: 16px;font-weight: bold">选择广告位</span>
          <span style="color:#999999;font-size: 14px">（下表中的数值是当前广告位的实时数据，如果没有产生实时数据，则为0）</span>
        </p>
      </div>
      <div class="search-line" style="margin-bottom: 15px">
        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          filterable
          v-model="search.ud_id_arr"
          placeholder="媒体简称/ID"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
        >
          <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
        </Select>
        <!-- 应用列表 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="search.app_id_arr"
          filterable
          clearable
          multiple
          :remote-method="searchSspApp"
          :loading="sspAppLoad"
          @on-change="clearSearchApp"
          :on-query-change="appQueryChange"
          :transfer="true"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="应用名称/ID"
        >
          <Option v-for="item in sspAppList" :value="item.app_id" :key="item.app_id">{{item.app_name}} (ID:{{item.app_id}})</Option>
        </Select>
        <!-- 广告位名称 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="search.ssp_slot_id_arr"
          filterable
          clearable
          multiple
          :remote-method="searchSspSlot"
          :loading="sspSlotLoad"
          @on-change="clearSearchSspSlot"
          :on-query-change="sspSlotQueryChange"
          :transfer="true"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告位名称/ID"
        >
          <Option v-for="item in sspSlotList" :value="item.ssp_slot_id" :key="item.ssp_slot_id">{{item.ssp_slot_name}} (ID:{{item.ssp_slot_id}})</Option>
        </Select>
        <Select filterable class="i-margin-right-11 i-width-select  mar-bot-10" v-model="search.slot_support" clearable  placeholder="广告位属性">
          <Option  :value="1">一键下载</Option>
          <Option  :value="4">deeplink</Option>
        </Select>

        <Button type="primary" @click="doFilterList">查询</Button>
      </div>
      <Table highlight-row border :columns="deleteAction" :data="deleteList" 	@on-sort-change="sortChange"
              :loading="tableDeleteFlag" max-height="400" :row-class-name="rowClassName">
        <!--广告位名称/ID-->
        <template slot-scope="{ row }" slot="ssp_slot_id">
          <p class="name-row-ellipsis" :title="row.ssp_slot_name">{{ row.ssp_slot_name }}</p>
          <p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
        </template>
        <!--应用名称/ID-->
        <template slot-scope="{ row }" slot="app_id">
          <p class="name-row-ellipsis" :title="row.app_name">{{ row.app_name }}</p>
          <p class="tip-row-line">ID: {{ row.app_id }}</p>
        </template>
        <!--媒体名称/ID-->
        <template slot-scope="{ row }" slot="ud_id">
          <p class="name-row-ellipsis" :title="row.user_company_name">{{ row.user_company_name }}</p>
          <p class="tip-row-line">ID: {{ row.ud_id }}</p>
        </template>
        <!--应用平台-->
        <template slot-scope="{ row }" slot="app_os_type">
          {{row.app_os_type || '-'}}
        </template>
        <!--属性-->
        <template slot-scope="{ row }" slot="property">
          <p class="name-row-ellipsis" :title="row.slot_support_text">{{row.slot_support_text || '-'}}</p>
        </template>
        <!--结算方式-->
        <template slot-scope="{ row }" slot="settlement">
          <p v-if="row.divide_price !==-1">分成CPC</p>
          <p v-else>保价CPM</p>
        </template>
        <!--结算价格-->
        <template slot-scope="{ row }" slot="settlement_money">
          <p v-if="row.divide_price !== -1">{{row.divide_price=== -1 ? 0 : number2ThousandNumber(Number(row.divide_price)/100)}}</p>
          <p v-else>{{row.valuation_price===-1 ? 0 : number2ThousandNumber(Number(row.valuation_price)/100)}}</p>
        </template>
        <!--出价CPM-->
        <template slot-scope="{ row }" slot="cpm_price">
          {{number2ThousandNumber(row.cpm_price)}}
        </template>

        <!--当日请求量-->
        <template slot-scope="{ row }" slot="req_pv">
          {{number2ThousandNumber(row.req_pv)}}
        </template>
        <!--媒体CPC-->
        <template slot-scope="{ row }" slot="cpc_dev">
          {{number2ThousandNumber(row.cpc_dev)}}
        </template>
        <!--媒体eCPM-->
        <template slot-scope="{ row }" slot="ecpm_dev">
          {{number2ThousandNumber(row.ecpm_dev)}}
        </template>
        <!--CTR-->
        <template slot-scope="{ row }" slot="ctr">
          {{number2ThousandNumber(row.ctr)}}%
        </template>

        <!--尺寸比例-->
        <template slot-scope="{ row }" slot="ad_ratio">
          <span v-if="row.ad_ratio.length">{{ row.ad_ratio | filterAdRatio }}</span>
        </template>
<!--        选择流量拆分名称-->
        <template slot-scope="{ row }" slot="divide_list">
           <div class="divide">
               <div class="divide_left">
                  <div :class="row.divide_list.length===1 ? 'divide_detail' : ''" v-if="row.divide_list && row.divide_list.length>0">
                    <RadioGroup v-model="row.sstd_id">
                      <p v-for="(item,index) in row.divide_list" :key="row.ssp_slot_id + index">
                        <Radio :label="item.sstd_id">
                          <span class="proportionName" :title="item.name + '('+item.proportion + ')%'">{{item.name}}({{item.proportion}}%)</span>
                        </Radio>
                      </p>
                    </RadioGroup>
                  </div>
                 <div class="divide_detail" v-else>
                   <RadioGroup v-model="row.sstd_id">
                       <Radio :label="row.sstd_id">流量1(100%) </Radio>
                   </RadioGroup>
                 </div>
               </div>
               <div class="divide_right" @click="seeDetails(row)">
                  <img src="~@/assets/image/budget_icon.png" alt="">
                  <span>详情</span>
               </div>
           </div>
        </template>

        <template slot-scope="{ row }" slot="action">
          <p v-if="row.ssp_slot_id===ids" style="text-align: center">已选</p>
          <p v-else-if="deleteArr.indexOf(row.ssp_slot_id) !== -1 "  style="text-align: center">占用</p>
          <Button v-else @click="save(row)" type="text" style="color: #3F83F7;padding: 0">选择</Button>
        </template>
      </Table>
      <div class="page-center">
        <Page show-total show-sizer show-elevator placement="top"
              :total="selectPage.total_count"
              :current.sync='selectPage.currentPage'
              :page-size="selectPage.pageSize"
              @on-change="changePage"
              @on-page-size-change="sizeChange"/>
      </div>
    </div>
    <div slot="footer">
    </div>
  </Modal>
</template>

<script>
  import {getAppList, getSspSlotAdList} from '@/api/ssp'
  import {number2Thousand, debounce} from '@/libs/tools'
  import { commonMixin } from '@/mixin/basic-common-class.js'
  import { getSelectCols } from '../../data/data'
  export default {
    name: 'select_advertising',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      ids: {
        type: Number
      },
      std: {
        type: Number
      },
      dataList: {
        type: Object,
        default: () => {}
      },
      deleteArr: {
        type: Array,
        default: () => []
      },
      sizeRatio: {
        type: Array,
        default: () => []
      }
    },
    mixins: [commonMixin],
    data() {
      return {
        tableDeleteFlag: true,
        modalSelect: this.value,
        selectPage: {
          pageSize: 10,
          total_count: 0,
          currentPage: 1
        },
        search: {
          ud_id_arr: [], // 媒体id
          app_id_arr: [], // 应用id
          ssp_slot_id_arr: [], // 广告位id
          slot_support: null // 广告位属性
        },
        // 搜索联动使用
        catchSspAppList: [], // 缓存应用列表，在清空媒体下拉时重新赋值
        sspAppList: [], // 媒体列表
        sspAppLoad: false, // 媒体列表加载中

        catchSspSlotList: [], // 缓存广告位名称
        sspSlotList: [], // 广告位名称
        sspSlotLoad: false, // 广告位加载中

        deleteList: [],
        deleteAction: getSelectCols(this),
        ssp_slot_id: '',
        except_dsp_slot_id: [],
        companySelectList: [],
        BudgetSelectList: []
      }
    },
    filters: {
      /**
       * [filterAdRatio 列表中尺寸格式化]
       * @param  {[type]} row [description]
       * @return {[type]}	 [description]
       */
      filterAdRatio(item) {
        if (!item.length) {
          return ''
        }

        let _arr = []
        item.map(_ => {
          _arr.push(`${_.width}:${_.height}`)
        })
        return _arr.join()
      }
    },
    created() {

    },
    methods: {
      rowClassName (row, index) {
        if (row.ssp_slot_id === this.ids) {
          return 'demo-table-info-row'
        }
        return ''
      },
      // 表格的排序
      sortChange(col, key, order) {
        if (col.order === 'asc') {
          if (col.column.slot === 'settlement_money') {
            this.search.order = 'divide_price+valuation_price'
          } else {
            this.search.order = col.column.slot
          }
          this.currentPage = 1
          this.getSelectData()
        } else if (col.order === 'desc') {
          if (col.column.slot === 'settlement_money') {
            this.search.order = 'divide_price+valuation_price ' + col.order
          } else {
            this.search.order = col.column.slot + ' ' + col.order
          }
          this.currentPage = 1
          this.getSelectData()
        }
      },
      /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}	   [description]
       */
      limitText(count) {
        return `+ ${count}`
      },
      /**
       * [number2ThousandNumber 变成千分位]
       * @return {[type]} [description]
       */
      number2ThousandNumber(num) {
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
      number2Thousand(num) {
        // 非零/ 正负无穷
        if (!num || num === Infinity || num === -Infinity) {
          return 0
        } else {
          if (Number.isInteger(num)) {
            return parseInt(num)
          } else {
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
          }
        }
      },
      /**
       * [素材尺寸比列的控制]
       * @return {[type]} [description]
       */
      scaleChange(item) {
        let scale = this.sizeRatio.map(its => {
          return Number(its.scale)
        })
        let ratio_is_ok = 1
        let _temp = item[item.length - 1]
        let size = _temp ? Number(number2Thousand(_temp.width / _temp.height)) : 0
        if (size) {
          let scaleStatus = 1
          scale.forEach(it => {
            if (Math.abs(size - it) < 0.05) {
              scaleStatus = 2
            }
          })
          if (scaleStatus === 2) {
            ratio_is_ok = 1
          } else {
            ratio_is_ok = -1
          }
        } else {
           ratio_is_ok = -1
        }
        return ratio_is_ok
      },
      save(row) {
        this.$emit('input', false)
        this.$emit('name', row)
      },
      cancel() {
        this.$emit('input', false)
      },
      seeDetails(row) {
        this.$emit('see', row)
      },
      /**
       * [creativeId2Text 根据createId 找到对应 text]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      creativeId2Text(id) {
        let _arr = this.$store.state.app.adStyleData
        let result = _arr.filter(item => item.id === id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [doFilterList 搜索查看]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      doFilterList() {
        this.selectPage.currentPage = 1
        this.getSelectData()
      },
      /**
       * [getSelectData 获取预算位列表数据]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      getSelectData(type) {
        let obj = this.search
        this.tableDeleteFlag = true
        let os_type = []
         // 应用平台
        os_type.push(this.dataList.os_type)
        this.dataList.os_type ? obj.app_os_type = this.dataList.os_type : ''
        obj.ad_type_id_arr = this.dataList.ad_type_id
        // 已经选中的值
        let selected_ids = []
        selected_ids.push(this.ids)
        this.ids ? obj.selected_ids = selected_ids : ''
        // 尺寸比列
        let scale = []
        let text = this.dataList.dsp_ad_ratio_width && this.dataList.dsp_ad_ratio_height ? this.dataList.dsp_ad_ratio_width + ':' + this.dataList.dsp_ad_ratio_height : ''
        text ? scale.push(text) : ''
        scale && scale.length > 0 ? obj.ratio_arr = scale : ''
        obj.page_num = this.selectPage.currentPage
        obj.page_size = this.selectPage.pageSize
        obj.status = 1
        getSspSlotAdList(obj).then(res => {
          if (res.code === 200) {
            let data = res.data.list
            data.map(item => {
              if (item.divide_list && item.divide_list.length > 0) {
                this.ids === item.ssp_slot_id ? item.sstd_id = this.std : item.sstd_id = item.divide_list[0].sstd_id
              } else {
                item.sstd_id = 1
              }
              return item
            })
            this.deleteList = data
            this.selectPage.total_count = res.data.total_count
          }
          this.tableDeleteFlag = false
        }, error => {
          this.tableDeleteFlag = false
        })
      },

      /**
       * [changePage 修改页码]
       * @param  {[type]} val [description]
       * @return {[type]}     [description]
       */
      changePage(val) {
        this.selectPage.currentPage = val
        this.getSelectData()
      },
      /**
       * [sizeChange 切换每页条数时的回调]
       * @param  {[type]} size [description]
       * @return {[type]}      [description]
       */
      sizeChange(size) {
        this.selectPage.currentPage = 1
        this.selectPage.pageSize = size
        this.getSelectData()
      },
      /********************************************
       *↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
       ********************************************/
      /**
       * [searchSspApp 应用列表-搜索]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      searchSspApp(query) {
        this.sspAppLoad = true
        this.getSspAppList(query)
      },
      /**
       * [clearSearchApp 清空应用列表]
       * @return {[type]} [description]
       */
      clearSearchApp(arr) {
        if (arr.length === 0) {
          this.sspAppList = [...this.catchSspAppList]
        }
      },
      /**
       * [sspQueryChange 应用-搜索词发生变化时]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      appQueryChange(query) {
        if (!query) {
          this.sspAppList = [...this.catchSspAppList]
        }
      },
      /**
       * [getSspAppList 应用列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      getSspAppList: debounce(function(query) {
        let _params = {
          ud_id: this.search.ud_id_arr,
          page_size: (!!query || this.search.ud_id_arr.length) ? 10000 : 10,
          page_num: 1,
          search_text: query || ''
        }

        getAppList(_params).then(res => {
          this.sspAppLoad = false
          if (res.code === 200) {
            this.sspAppList = res.data.list

            if (!query) {
              this.catchSspAppList = res.data.list
            }
          }
        })
      }, 1000),
      /**
       * [searchSspSlot 广告位搜索]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      searchSspSlot(query) {
        this.sspSlotLoad = true
        this.getSspSlotList(query)
      },
      /**
       * [clearSearchSspSlot 清空广告位]
       * @return {[type]} [description]
       */
      clearSearchSspSlot(arr) {
        if (arr.length === 0) {
          this.sspSlotList = [...this.catchSspSlotList]
        }
      },
      /**
       * [sspSlotQueryChange 广告位-搜索词发生变化时]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      sspSlotQueryChange(query) {
        if (!query) {
          this.sspSlotList = [...this.catchSspSlotList]
        }
      },
      /**
       * [getSspSlotList 广告位列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}	   [description]
       */
      getSspSlotList: debounce(function(query) {

        let filter = this.search

        let _params = {
          ud_id_arr: filter.ud_id_arr,
          app_id_arr: filter.app_id_arr,
          page_size: (!!query || filter.ud_id_arr.length || filter.app_id_arr.length) ? 10000 : 10,
          page_num: 1,
          search_text: query || ''
        }

        getSspSlotAdList(_params).then(res => {
          this.sspSlotLoad = false
          if (res.code === 200) {
            this.sspSlotList = res.data.list

            if (!query) {
              this.catchSspSlotList = res.data.list
            }
          }
        })
      }, 1000)
      /********************************************
       *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
       ********************************************/
    },
    watch: {
      value(val) {
        this.modalSelect = val
        if (val) {
          this.deleteList = []
          this.selectPage.currentPage = 1
          this.getSelectData(1)
          this.getSspAppList()
          this.getSspSlotList()
        }
      },
      /**
       * 选择媒体
       */
      'search.ud_id_arr': {
        handler: function(val) {
          this.getSspAppList()
          this.getSspSlotList()
        }
      },
      /**
       * 选择应用
       */
      'search.app_id_arr': {
        handler: function(val) {
          this.getSspSlotList()
        }
      }
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  .table_text{
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-word;
    max-height: 40px;
  }
    .proportionName{
      vertical-align: middle;
      display: inline-block;
      width: 113px;
      white-space:nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  /deep/ .ivu-table{
    font-size 12px
  }
  /deep/ .ivu-table .ivu-table-cell{
    padding 0 4px
  }
  /deep/ .ivu-table .ivu-radio-wrapper {
    font-size 12px
  }
  /deep/ .ivu-table .demo-table-info-row td{
    background-color: #FFE899FF;
  }
  /deep/ .ivu-select-default.ivu-select-multiple .ivu-select-selection{
    max-height 32px
    overflow auto
  }
  .divide{
    height 100%
    display:flex
    justify-content space-between
    .divide_left{
      min-height 40px
      flex:1
      position relative
      .divide_detail{
        position absolute
        top: 50%
        transform:translateY(-50%)
      }
    }

    .divide_right{
      width 26px
      min-height: 48px;
      font-size: 12px;
      line-height 1
      text-align: center;
      background: #4083F8;
      color: #ffffff;
      cursor pointer
      img{
        margin 4px 0
        vertical-align bottom
      }
      span{
        display inline-block
        line-height 1.5
      }
    }
  }

</style>
