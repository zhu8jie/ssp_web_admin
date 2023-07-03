<template>
  <Modal v-model="modalDelete"
         width="800"
         @on-cancel="cancel"
         class="deleteModal">
    <div slot="header">
      已删除预算位
    </div>
    <div>
      <div style="margin-bottom: 10px">
        <Input type="text" v-model="search_text" style="width:250px" placeholder="请输入预算位ID或者预算方广告位ID" />
        <Button type="primary" @click="getHistory()">查询</Button>
      </div>
      <Table highlight-row border :columns="deleteAction" :data="deleteList"
             style="max-width:800px"  :loading="tableDeleteFlag" max-height="400">
        <!--预算位名称/ID-->
        <template slot-scope="{ row }" slot="budget">
          <p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
          <p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
        </template>
        <!--日期-->
        <template slot-scope="{ row }" slot="dsp_slot_code">
          <p class="table_text">{{ row.dsp_slot_code }}</p>
        </template>
        <template slot-scope="{ row }" slot="delete_time">
          <p class="table_text">{{ row.deleted_at }}</p>
        </template>
        <template slot-scope="{ row }" slot="operator_name">
          <p class="table_text">{{ row.us_name }}</p>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button @click="save(row)" type="text" style="color: #3F83F7">恢复</Button>
        </template>
      </Table>
      <div class="page-center">
        <Page show-total show-sizer show-elevator placement="top"
              :total="deletePage.total_count"
              :current.sync='deletePage.currentPage'
              :page-size="deletePage.pageSize"
              @on-change="changePage"
              @on-page-size-change="sizeChange"/>
      </div>
    </div>
    <div slot="footer">
    </div>
  </Modal>
</template>

<script>
  import {getDeleteCols} from '../../data/adConfig'
  import {getDspHistory} from '@/api/dsp'
    export default {
        name: 'delete_config',
      props: {
        value: {
          type: Boolean,
          default: false
        },
        deleteIndex: {
          type: String,
          default: ''
        },
        ids: {
          type: Number
        },
        deleteArr: {
          type: Array,
          default: () => []
        }
      },
       data() {
          return {
            search_text: '',
            tableDeleteFlag: true,
            modalDelete: this.value,
            deletePage: {
              pageSize: 10,
              total_count: 0,
              currentPage: 1
            },
            deleteList: [],
            deleteAction: getDeleteCols(this),
            ssp_slot_id: '',
            except_dsp_slot_id: []
          }
       },
      methods: {
        save(row) {
          this.$emit('input', false)
          this.$emit('name', row)
        },
        cancel() {
          this.$emit('input', false)
        },
        getHistory() {
          let obj = {}
           this.tableDeleteFlag = true
           obj.search_text = this.search_text
           obj.ssp_slot_id = this.ids
           obj.except_dsp_slot_id = this.deleteArr
           obj.page_num = this.deletePage.currentPage
           obj.page_size = this.deletePage.pageSize
          getDspHistory(obj).then(res => {
            if (res.code === 200) {
              this.deleteList = res.data.list
              this.deletePage.total_count = res.data.total_count
            }
            this.tableDeleteFlag = false
          },error => {
            this.tableDeleteFlag = false
          })
        },

        /**
         * [changePage 修改页码]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        changePage(val) {
          this.currentPage = val
          this.getHistory()
        },
        /**
         * [sizeChange 切换每页条数时的回调]
         * @param  {[type]} size [description]
         * @return {[type]}      [description]
         */
        sizeChange(size) {
          this.pageSize = size
          this.getHistory()
        }
      },
      watch: {
        value(val) {
          this.modalDelete = val
          if (val) {
            this.deletePage.currentPage = 1
            this.getHistory()
          }
        }
      }
    }
</script>

<style scoped>

</style>
