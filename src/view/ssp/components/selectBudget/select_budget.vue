<template>
  <Modal v-model="modalSelect"
         width="1200"
         @on-cancel="cancel"
         title="选择预算位"
         class="deleteModal">
    <div>
      <div class="search-line" style="margin-bottom: 15px">
        <Select filterable @on-change="getDspProductListApi" class="i-margin-right-11 i-width-select  mar-bot-10" clearable v-model="paramCompanyArr" placeholder="公司简称">
          <Option v-for="item in companySelectList" :value="item.id" :key="item.id">{{ item.company_name }}</Option>
        </Select>
        <Select filterable class="i-margin-right-11 i-width-select  mar-bot-10" v-model="paramProductArr" @on-change="getBudgetSelectList" clearable  placeholder="产品名称">
          <Option v-for="item in productList" :value="item.id" :key="item.id">{{ item.name }}(ID:{{item.id}})</Option>
        </Select>
        <Select filterable class="i-margin-right-11 i-width-select  mar-bot-10" v-model="paramBudgetArr" clearable  placeholder="预算位名称">
          <Option v-for="item in BudgetSelectList" :value="item.id" :key="item.id">{{ item.dsp_slot_name }}(ID:{{item.id}})</Option>
        </Select>
        <Input class="i-margin-right-11 i-width-input-long mar-bot-10" v-model.trim.trim="paramSearch" clearable  placeholder="输入预算方广告位ID"/>
        <Button type="primary" @click="doFilterList">查询</Button>
      </div>
      <Table highlight-row border :columns="deleteAction" :data="deleteList"
              :loading="tableDeleteFlag" max-height="400" :row-class-name="rowClassName">
        <!--预算位名称-->
        <template slot-scope="{ row }" slot="dsp_slot_name">
          <p class="table_text" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
        </template>
        <!--关联广告位-->
        <template slot-scope="{ row }" slot="ssp_slot_count">
          <span  v-if="row.ssp_slot_list.length == 0">0</span>
          <span v-else>{{ row.ssp_slot_list.length }}</span>
        </template>
        <!--产品名称/ID-->
        <template slot-scope="{ row }" slot="product_id">
          <p class="name-row-ellipsis" :title="row.dsp_product_name">{{row.dsp_product_name}}</p>
        </template>
        <!--预算位ID-->
        <template slot-scope="{ row }" slot="dsp_slot_id">
          <p  class="table_text">{{ row.id }}</p>
        </template>
        <!--预算方广告位ID-->
        <template slot-scope="{ row }" slot="dsp_slot_code">
          <p class="table_text" :title="row.dsp_slot_code">{{ row.dsp_slot_code }}</p>
        </template>
        <!--历史最新CPM-->
        <template slot-scope="{ row }" slot="cpm">
          <p class="table_text">{{ row.last_ecpm }}</p>
        </template>
        <!--广告场景-->
        <template slot-scope="{ row }" slot="ad_type">
          <p class="table_text">{{ row.ad_type }}</p>
        </template>
        <!--广告样式-->
        <template slot-scope="{ row }" slot="creative_type">
          <p class="table_text">{{creativeId2Text(row.creative_type) }}</p>
        </template>
        <!--采买类型-->
        <template slot-scope="{ row }" slot="pickup_status">
          <span v-if="row.pickup_status === 1">联调</span>
          <span v-if="row.pickup_status === 2">测试</span>
          <span v-if="row.pickup_status === 3">正式</span>
        </template>
        <!--业务状态-->
        <template slot-scope="{ row }" slot="status">
          <span v-if="row.status === 1">正常</span>
          <span v-if="row.status === 2">停用</span>
          <span v-if="row.status === 3">封禁</span>
          <span v-if="row.status === 4">测试锁定</span>
        </template>
        <!--尺寸比例-->
        <template slot-scope="{ row }" slot="ad_ratio">
          <span v-if="row.ad_ratio.length">{{ row.ad_ratio | filterAdRatio }}</span>
<!--          <Icon v-if="scaleChange(row.ad_ratio) === -1"-->
<!--                type="ios-close-circle" style="color: #F72D17"/>-->
<!--          <Icon v-if="scaleChange(row.ad_ratio) === 1" type="ios-checkmark-circle" style="color: #339900"/>-->
        </template>
        <template slot-scope="{ row }" slot="action">
          <p v-if="row.id===ids">已选</p>
          <p v-else-if="deleteArr.indexOf(row.id) !== -1 ">占用</p>
		  <p v-else-if="row.pickup_status === 2" >测试不可用</p>
          <p v-else @click="save(row)" type="text" style="color: #3F83F7;cursor: pointer">选择</p>
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
  import {getSelectCols} from '../../data/adConfig'
  import {getDspCompanyList, getDspSlotList, getDspProductList} from '@/api/dsp'
  import {number2Thousand} from '@/libs/tools'
  export default {
    name: 'select_budget',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      ids: {
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
    data() {
      return {
        search_text: '',
        tableDeleteFlag: true,
        modalSelect: this.value,
        selectPage: {
          pageSize: 10,
          total_count: 0,
          currentPage: 1
        },
        paramCompanyArr: '', // 搜索中的公司
        paramBudgetArr: '', // 搜索中的预算位
        paramProductArr: '', // 搜索中的产品
        paramSearch: '', // 搜索输入框的内容
        deleteList: [],
        deleteAction: getSelectCols(this),
        ssp_slot_id: '',
        except_dsp_slot_id: [],
        companySelectList: [],
        BudgetSelectList: [],
        productList: []
      }
    },
    filters: {
      /**
       * [filterAdRatio 列表中尺寸格式化]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      filterAdRatio(item) {
        let _temp = item[item.length - 1]
        return `${_temp.width}:${_temp.height}`
      }
    },
    created() {

    },
    methods: {
      rowClassName (row, index) {
        if (row.id === this.ids) {
          return 'demo-table-info-row'
        }
        return ''
      },
      /**
       * [getDspProductList 获取列表的信息]
       * @return {[type]} [description]
       */
      getDspProductListApi() {
        let params = {page_num: 1, page_size: 0}
        let dsp_company_id = []
        dsp_company_id.push(this.paramCompanyArr)
        this.paramCompanyArr ? params.dsp_company_id_arr = dsp_company_id : ''
        getDspProductList(params).then(res => {
          if (res.code === 200) {
            this.productList = res.data.list
          }
        })
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
      /**
       * [_getDspCompanyList 获取媒体公司数据]
       * @return {[type]} [description]
       */
      _getDspCompanyList() {
        getDspCompanyList({
          ad_type_id: parseInt(this.dataList.ad_type),
          os_type: this.dataList.os_type === 'Android' ? 1 : 2
        }).then(res => {
          if (res.code === 200) {
            this.companySelectList = res.data.list
          }
        })
      },
      /**
       * [getBudgetSelectList 获取预算位的搜索]
       * @return {[type]} [description]
       */
      getBudgetSelectList() {
        let obj = {}
        let os_type = [0]
        os_type.push(this.dataList.os_type === 'Android' ? 1 : 2)
        obj.ad_type_id = this.dataList.ad_type
        obj.os_type = os_type
        let product_id_arr = []
        product_id_arr.push(this.paramProductArr)
        this.paramProductArr ? obj.product_id_arr = product_id_arr : ''
        getDspSlotList(obj).then(res => {
          if (res.code === 200) {
            this.BudgetSelectList = res.data.list
          }
        })
      },

      save(row) {
        this.$emit('input', false)
        this.$emit('name', row)
      },
      cancel() {
        this.$emit('input', false)
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
        this.getSelectData()
      },
      /**
       * [getBudgetFirstList 获取预算位列表数据]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */

      getBudgetFirstList(val) {
        let obj = {}
        let os_type = [0]
        os_type.push(this.dataList.os_type === 'Android' ? 1 : 2)
        obj.ad_type_id = this.dataList.ad_type
        obj.os_type = os_type
        obj.status = 1
        let scale = []
        this.sizeRatio.filter(its => {
          let text = its.width && its.height ? its.width + ':' + its.height : ''
          text ? scale.push(text) : ''
        })
        scale && scale.length > 0 ? obj.ratio_arr = scale : ''
        getDspSlotList(obj).then(res => {
          if (res.code === 200) {
            this.BudgetSelectList = res.data.list
          }
        })
      },
      /**
       * [getSelectData 获取预算位列表数据]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      getSelectData(type) {
        let obj = {}
        this.tableDeleteFlag = true
        let os_type = [0]
        os_type.push(this.dataList.os_type === 'Android' ? 1 : 2)
        obj.ad_type_id = this.dataList.ad_type
        obj.os_type = os_type
        let selected_ids = []
        selected_ids.push(this.ids)
        this.ids ? obj.selected_ids = selected_ids : ''
        let dsp_company_id = []
        dsp_company_id.push(this.paramCompanyArr)
        this.paramCompanyArr ? obj.dsp_company_id = dsp_company_id : ''
         let scale = []
         this.sizeRatio.filter(its => {
          let text = its.width && its.height ? its.width + ':' + its.height : ''
          text ? scale.push(text) : ''
        })
        scale && scale.length > 0 ? obj.ratio_arr = scale : ''
        let dsp_slot_code_arr = []
        dsp_slot_code_arr.push(this.paramBudgetArr)
        this.paramBudgetArr ? obj.dsp_slot_id_arr = dsp_slot_code_arr : ''

        let product_id_arr = []
        product_id_arr.push(this.paramProductArr)
        this.paramProductArr ? obj.product_id_arr = product_id_arr : ''

        let dsp_slot_id_arr = []
        dsp_slot_id_arr.push(this.paramSearch)
        this.paramSearch ? obj.dsp_slot_code_arr = dsp_slot_id_arr : ''
        obj.page_num = this.selectPage.currentPage
        obj.page_size = this.selectPage.pageSize
        obj.status = 1
        getDspSlotList(obj).then(res => {
          if (res.code === 200) {
            this.deleteList = res.data.list
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
      }
    },
    watch: {
      value(val) {
        this.modalSelect = val
        if (val) {
          this.selectPage.currentPage = 1
          this.paramCompanyArr = ''
          this.paramBudgetArr = ''
          this.paramSearch = ''
          this.getSelectData(1)
          this.getBudgetFirstList()
          this._getDspCompanyList()
          this.getDspProductListApi()
        }
      }
    }
  }
</script>
<style scoped>
  .table_text{
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-word;
    max-height: 40px;
  }
  /deep/ .ivu-table .demo-table-info-row td{
    background-color: #FFE899FF;
  }

</style>
