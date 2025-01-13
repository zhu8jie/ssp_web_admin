<template>
    <div class="page-main">
        <Card :bordered="false" dis-hover>
            <div class="page-title clearfix">
                <!-- <h2>{{ headTitle }}</h2> -->
                    <h2>测试预算位</h2>
                <div class="is-handler">
                    <!-- <Button class="host" type="text" @click="doColumns">自定义列</Button> -->
                    <!-- <Button v-if="_isShow_('addNewBudget')" icon="ios-add" type="primary" @click="toNew()">新建预算位</Button> -->
                    <Button icon="ios-add" type="primary" @click="toNew()">新建预算位</Button>  
                </div>
                <div class="search-line" ref = "search-line">
                    <Select
                        class="i-margin-right-11 i-width-select mar-bot-10"
                        multiple
                        filterable
                        :max-tag-count="1"
            
                        :max-tag-placeholder="limitText"
                        placeholder="公司名称/ID"
                        >
                        <Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{ item.company_name }}
                            (ID:{{item.id}})
                        </Option>
                    </Select>

                        <!-- 广告场景 -->
                    <Select
                    class="i-margin-right-11 i-width-select mar-bot-10"
                    v-model="filterSearch.product_id_arr"
                    multiple
                    :max-tag-count="1"
                    :max-tag-placeholder="limitText"
                    placeholder="广告场景"
                    >
                    <Option v-for="item in adTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>

                    <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable
                    v-model.trim="filterSearch.dsp_slot_id_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
                    placeholder="批量预算位ID"/>
                    <Button type="primary" @click="doFilterList">查询</Button>
                </div> 
            </div>
            <div>
                <div class="mar"></div>
            </div>
            <div class ="console-table">
                <Table highlight-row stripe border :columns="TableColList" :data="colDatList" :loading="tableLoadFlag"
               :height="tableHeight">
                <!--预算位名称/ID-->
               </Table>  
            </div>
        </Card>
    </div>
</template>
<script>
  import {showTitle, regNumPositiveInteger, inputMaxNumber, filterBatchQuery} from '@/libs/util'
  import {debounce, number2Thousand, createObjectURL, formatDate} from '@/libs/tools'
  import {commonMixin} from '@/mixin/basic-common-class.js'
  import {getCompanyColumns, dspSlotStatusEnum} from './data/data.js'
  import {pickupDspSlotStatus, bannedDspSlotStatus, getDspProductList, getDspSlotList, getDspSlotListAPI, saveDspSlot, updateDspSlotStatus, getErrSspSlot, importDspSlot, importDspSlotApi, getSspByDspList, deleteSspByDsp, dspImportAddUrl, dspImportAdd, dspImportUpdate, dspImportUpdateUrl} from '@/api/dsp'
  import {getDownLoadXls} from '@/api/common'
  import {tableHeight} from '@/mixin/calc-table-height.js'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
  import {columnFn} from '@/mixin/custom-column.js'
  import {mapActions} from 'vuex'
  import { dataType} from '@/libs/util'

export default {
    name: 'dsp-sour-me',
    mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
    data() {
        return {
            TableColList: getCompanyColumns(this), // 自定义列
            dspCompanyList: [], // 筛选，公司名称
            adTypeList:[],
            doFilterList:[],
            doFilterList:[],
            colDatList:[],
            tableLoadFlag: false, // table的loading
             // 搜索条件
            filterSearch: {
            dsp_company_id: [], // 预算方公司ID，多选
            product_id_arr: [], // 产品ID，多选
            }
        }
    },
    computed: {
    //   headTitle() {
    //     return showTitle(this.$route, this)
    //   },
      /**
       * [filterStyleData 选择广告样式]
       * @return {[type]} [description]
       */
    //   styleData() {
    //     let data = [...this.$store.state.app.adStyleData]

    //     let result = data.filter(item => {
    //       return item.parentId === this.modalForm.ad_type_id
    //     })

    //     return result
    //   },
      /**
       * [sizeProportion 尺寸比例]
       * @return {[type]} [description]
       */
    //   sizeProportion() {
    //     return number2Thousand(this.modalForm.dsp_ad_ratio_width / this.modalForm.dsp_ad_ratio_height)
    //   },
      /**
       * [osType 应用平台]
       * @return {[type]} [description]
       */
    //   osType() {
    //     return this.$store.getters.osType
    //   }
    },
    methods : {
             /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}       [description]
       */
      limitText(count) {
        return `${count}+`
      }, 
    }
    // mounted() {
    //   this.initTableHeight( // search-line的高度
    //     {
    //       'search-line': {isAutoCalc: true, isInclude: true}, 
    //       'nav-handle-group': true,
    //       'randomNum': -15
    //     }
    //   )
    // },
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
  .search-line
    margin-top: 5px
    nav-handle-group: false
  .mar 
    padding: 20px
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
