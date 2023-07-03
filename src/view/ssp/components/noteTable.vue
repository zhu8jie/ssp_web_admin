<template>
  <Modal
    v-model="modelFlag"
    :mask-closable="false"
    title="备注"
    :width="900"
    :footer-hide="true"
    class-name="vertical-center-modal"
    @on-cancel="cancelModal"
  >
    <p class="note_title">广告位：{{adList.ssp_slot_name}}(ID:{{adList.id}})</p>
    <div class="search-line" ref="search-line">
      <Input type="textarea" v-model.trim="filterSearch.product_name_arr_textarea" style="width: 250px"
             class="i-margin-right-11  mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
             placeholder="批量产品名称"/>
      <Button class="i-margin-right-11 mar-bot-10" type="primary" @click="doFilterList">查询</Button>
    </div>
    <div class="console-table">
      <Table highlight-row stripe border :columns="tableColList" :data="colDatList" :height="400">
      <!-- 产品名称 -->
      <template slot-scope="{ row }" slot="product_name">
        {{row.dsp_product.name}}
      </template>
      <!-- 备注信息 -->
      <template slot-scope="{ row, index }" slot="action">
        <Input v-model="colDatList[index].remark" :maxlength="30" placeholder="请输入备注信息" style="width: 100%" />
      </template>
    </Table>
    </div>
    <div class="save-btn">
      <Button @click="cancelModal">取消</Button>
      <Button type="primary" :loading="submitClock" @click="submitData">{{!submitClock ? '提交' : '提交中...'}}</Button>
    </div>
  </Modal>
</template>

<script>

  import { submitProductRemark } from '@/api/ssp'
  import {filterBatchQuery} from '@/libs/util'

  export default {
    data() {
      return {
        submitClock: false, // 保存锁
        tableLoadFlag: true, // table的loading
        modelFlag: false,
        tableColList: [
          {type: 'index', width: 36, align: 'center'
          },
          {title: '产品名称', slot: 'product_name', minWidth: 220},
          {title: '备注', slot: 'action', minWidth: 320}
        ],
        filterSearch: {
          product_name_arr_textarea: null, // 批量搜索的文本
          product_name_arr: []
        },
        colDatList: [],
        colDatListCopy: [],
        adList: {}
      }
    },
    methods: {
      // 搜索
      doFilterList() {
        let _filter = this.filterSearch
        // 广告位名称数组
        _filter.product_name_arr = filterBatchQuery({value: _filter.product_name_arr_textarea})
        let colDatList = this.colDatListCopy
        let searchList = []
        if (_filter.product_name_arr.length > 0) {
          colDatList.map(item => {
            if (_filter.product_name_arr.includes(item.dsp_product.name)) {
              searchList.push(item)
            }
          })
          this.colDatList = searchList
        } else {
          this.colDatList = this.colDatListCopy
        }

      },
      /**
       * [injectDate 注入数据]
       * @param  {[type]} date [description]
       * @return {[type]}      [description]
       */
      injectDate(row) {
        this.adList = row
        if (!row.ssp_slot_dsp_product_list || !row.ssp_slot_dsp_product_list.length) {
          return
        }
        this.filterSearch.product_name_arr_textarea = null
        this.filterSearch.product_name_arr = []
        this.colDatList = row.ssp_slot_dsp_product_list
        this.colDatListCopy = row.ssp_slot_dsp_product_list
        this.modelFlag = !this.modelFlag
      },
      /**
       * [drawerClose 关闭]
       * @return {[type]} [description]
       */
      cancelModal() {
        this.modelFlag = false
        this.submitClock = false
        this.colDatList = []
        this.$emit('on-change')
      },
      /**
       * [submitData 提交数据]
       * @return {[type]} [description]
       */
      submitData() {
        // 格式化处理数据
        let list = []

        this.colDatList.map(item => {
          list.push({
            ssp_slot_id: item.ssp_slot_id,
            dsp_product_id: item.dsp_product_id,
            remark: item.remark
          })
        })

        this.submitClock = true

        submitProductRemark({list}).then(res => {
          if (res.code === 200) {
            this.$Message.success({content: '保存成功', duration: 3})
            this.cancelModal()
          }
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .note_title
    margin-bottom 10px
  .save-btn
    margin-top: 30px
    text-align: right
    button
      margin-left: 20px
</style>
