<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}</h2>
        <div class="is-handler">
          <Button class="host" type="text" @click="doColumns">自定义列</Button>
          <Button v-if="_isShow_('download')" @click="downStatement" :loading="downClock" class="host" type="text"
                  ghost>
            <i class="iconfont icon-download"></i>
            <span v-if="!downClock">下载列表</span>
            <span v-else>下载中...</span>
          </Button>
          <Button class="host" type="text" @click="batchSetButton">
            <icon class="icon icon-setting"/>
            <span>批量设置</span>
          </Button>
          <Button style="background:#EAAE30;color: #ffffff "   v-if="_isShow_('batchNewBudget')" type="text"
                  @click="showImportModal({'type': 'add', 'title': '批量新建预算位'})">
            <icon class="icon icon-new-create"/>
            批量新建预算位
          </Button>

          <Button style="background:#EAAE30;color: #ffffff "  v-if="_isShow_('batchNewBudget')" type="text"
                  @click="showImportModal({type: 'update', title: '批量修改预算位'})">
            <icon class="icon icon-new-create"/>
            批量修改预算位
          </Button>
          <Button v-if="_isShow_('addNewBudget')" icon="ios-add" type="primary" @click="toNew()">新建预算位</Button>
        </div>
      </div>
      <div class="search-line" ref="search-line">
        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          filterable
          :max-tag-count="1"
          v-model="filterSearch.dsp_company_id"
          :max-tag-placeholder="limitText"
          placeholder="公司名称/ID"
        >
          <Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{ item.company_name }}
            (ID:{{item.id}})
          </Option>
        </Select>
        <!-- 预算位名称 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.product_id_arr"
          filterable
          clearable
          multiple
          :remote-method="searchProduct"
          :loading="productLoad"
          @on-change="clearSearchProduct"
          :on-query-change="productQueryChange"
          :transfer="true"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="产品名称/ID"
        >
          <Option v-for="item in productList" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
        </Select>

        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          v-model="filterSearch.ad_type_id"
          multiple
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告场景"
        >
          <Option v-for="item in adTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
        </Select>
        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          v-model="filterSearch.creative_type"
          multiple
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告样式"
        >
          <Option v-for="item in filterSearch.styleDataArr" :value="item.id" :key="item.id">{{ item.title }}</Option>
          styleDataArr
        </Select>

        <Select class="i-margin-right-11 i-width-status mar-bot-10" v-model="filterSearch.status" clearable
                placeholder="业务状态">
          <Option :value="1">正常</Option>
          <Option :value="2">停用</Option>
          <Option :value="3">封禁</Option>
          <Option :value="4">测试锁定</Option>
        </Select>
        <Select class="i-margin-right-11 i-width-status mar-bot-10" v-model="filterSearch.pickup_status" clearable
                placeholder="采买类型">
          <Option :value="1">联调</Option>
          <Option :value="2">测试</Option>
          <Option :value="3">正式</Option>
        </Select>
        <!-- 预算位名称 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.dsp_slot_id_arr_select"
          filterable
          clearable
          multiple
          :remote-method="searchDspSlot"
          :loading="dspSlotLoad"
          @on-change="clearSearchDspSlot"
          :on-query-change="dspSlotQueryChange"
          :transfer="true"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="预算位名称/ID"
        >
          <Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})
          </Option>
        </Select>

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable
               v-model.trim="filterSearch.dsp_slot_id_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量预算位ID"/>

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable
               v-model.trim="filterSearch.dsp_slot_code_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量预算方广告位ID"/>

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable
               v-model.trim="filterSearch.dsp_slot_name_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量预算位名称"/>

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable
               v-model.trim="filterSearch.ratio_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量尺寸比例"/>
        <InputNumber :min="0" class="i-margin-right-11 i-width-input-small mar-bot-10"
                     v-model.trim="filterSearch.related_ssp_slot_num" placeholder="关联的广告位个数"/>
        <Button type="primary" @click="doFilterList">查询</Button>
      </div>
      <div class="batch-line" v-show="batchStatus">
        <div class="batch-handle ">
          <div @click="changePickup()" class="batch-item">
            <Icon type="ios-settings" />
            <span>批量修改采买类型</span>
          </div>
          <div @click="changeBanned()" class="batch-item">
            <Icon type="ios-settings" />
            <span>批量封禁</span>
          </div>
          <div @click="changeState(null, 'open')" class="batch-item">
            <Icon type="ios-settings" />
            <span>批量启用</span>
          </div>
          <div @click="changeState(null, 'close')" class="batch-item">
            <Icon type="ios-settings" />
            <span>批量停用</span>
          </div>
        </div>
        <div class="batch-close " @click="batchStatus = false">
          <Icon type="md-close"/>
        </div>
      </div>
      <div class="console-table">
        <Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag"
               :height="tableHeight" :no-data-text="noDataText" @on-selection-change="selectChange">
          <!--预算位名称/ID-->
          <template slot-scope="{ row }" slot="dsp_slot_name">
            <p class="name-row-ellipsis" :title="row.dsp_slot_name">{{row.dsp_slot_name}}</p>
            <p class="tip-row-line"> ID:{{ row.id }}</p>
          </template>
          <!-- 应用平台 1=Android 2=iOS -->
          <!--应用平台-->
          <template slot-scope="{ row }" slot="os_type">
            <span v-if="row.os_type === 1">Android</span>
            <span v-if="row.os_type === 2">IOS</span>
            <span v-if="row.os_type === 0">不限</span>
          </template>
          <!--公司名称/ID-->
          <template slot-scope="{ row }" slot="dsp_company_id">
            <p class="name-row-ellipsis" :title="row.company_name">{{row.company_name}}</p>
            <p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
          </template>
          <!--产品名称/ID-->
          <template slot-scope="{ row }" slot="product_id">
            <p class="name-row-ellipsis" :title="row.dsp_product_name">{{row.dsp_product_name}}</p>
            <p class="tip-row-line">ID: {{ row.dsp_product_id }}</p>
          </template>
          <!--广告样式-->
          <template slot-scope="{ row }" slot="creative_type">
            {{ creativeId2Text(row.creative_type) }}
            <p class="tip-row-line">ID:{{ row.creative_type }}</p>
          </template>

          <!--关联广告位-->
          <template slot-scope="{ row }" slot="ssp_slot_count">
            <span style="color:#2d8cf0" v-if="row.ssp_slot_list.length == 0">0</span>
            <span style="display:inline-block; width:100%;color:#2d8cf0;vertical-align: middle;cursor: pointer;" v-else
                  @click="configModalData(row.id,'open',row.status)">
                          {{ row.ssp_slot_list.length }}
                          <Icon style="font-size: 16px" type="ios-arrow-forward"/>
                        </span>
          </template>
          <!--素材尺寸比例-->
          <template slot-scope="{ row }" slot="ad_ratio">
            <span v-if="row.ad_ratio.length">{{ row.ad_ratio | filterAdRatio }}</span>
          </template>
          <!--采买类型-->
          <template slot-scope="{ row }" slot="pickup_status">
            <span v-if="row.pickup_status === 1">联调</span>
            <span v-if="row.pickup_status === 2">测试</span>
            <span v-if="row.pickup_status === 3">正式</span>
          </template>
          <!-- 封禁时间 -->
          <template slot-scope="{ row }" slot="banned_at">
            <span v-if="row.status === 3">{{ row.banned_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</span>
            <span v-else>-</span>
          </template>
          <!--业务状态-->
          <template slot-scope="{ row }" slot="status">
            <span v-if="row.status === 1">正常</span>
            <span v-if="row.status === 2">停用</span>
            <Tooltip v-if="row.status === 3" placement="top" :transfer="true" max-width="300">
              封禁
              <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>
              <div slot="content">
                <p style="font-size: 12px">该预算位被封禁，无法做正式投放，待封禁期过后，自动变更为正常状态，或者可手动强制启用该预算位，即可正常投放</p>
              </div>
            </Tooltip>
            <span v-if="row.status === 3">{{row.ban_days || 0}}天</span>
            <Tooltip v-if="row.status === 4" placement="top" :transfer="true" max-width="300">
              测试锁定
              <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>
              <div slot="content">
                <p style="font-size: 12px">该预算位正用于流量测试，无法做正式投放，预算位信息无法修改，仅可查看；过了测试期，预算位状态自动变更为正常状态，即可正式投放</p>
              </div>
            </Tooltip>

          </template>
          <!--更新日志-->
          <template slot-scope="{ row }" slot="dsp_slot_alias">
            <div class="log" v-html="row.dsp_slot_alias" :title="row.dsp_slot_alias"></div>
          </template>
          <!--操作-->
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="_isShow_('modify')" type="text" :to="toEdit(row.id)">{{row.status === 4 ? '查看' : '修改'}}
            </Button>
          </template>
        </Table>
        <div class="page-center">
          <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage'
                :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
        </div>
      </div>
    </Card>
    <!--批量导入预算位-->
    <Drawer v-model="exportModalFlag" :title="importDrawObj.title" :mask-closable="false" :closable="false"
            class="newBatch" width="600" :styles="drawStyles">
      <Form ref="exportForm" :label-width="130" :label-colon="true">
        <div class="down_export">
          <div v-if="importDrawObj.type === 'add'">
            <icon class="icon icon-excel" style="font-size: 20px"/>
            新建预算位模板
          </div>
          <div v-if="importDrawObj.type === 'update'">
            <icon class="icon icon-excel" style="font-size: 20px"/>
            修改预算位模板
          </div>
          <div>
            <a v-if="importDrawObj.type === 'add'" download
               :href="`${this.$xlsAPIUrl}/%E6%96%B0%E5%BB%BA%E9%A2%84%E7%AE%97%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx?v=3`">
              <icon class="icon download"/>
              下载
            </a>
            <a v-if="importDrawObj.type === 'update'" download
               :href="`${this.$xlsAPIUrl}/%E4%BF%AE%E6%94%B9%E9%A2%84%E7%AE%97%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx?v=3`">
              <icon class="icon download"/>
              下载
            </a>
          </div>
        </div>
        <FormItem label="请上传预算位表格" prop="file">
          <Upload
            :action="importDrawObj.type === 'add' ? dspImportAddUrl : dspImportUpdateUrl"
            type="drag"
            :show-upload-list="false"
            :format="['csv','xlsx','xls']"
            :on-format-error="handleFormatError"
            :before-upload="handleBeforUpload"
            :max-size="10*1024"
          >
            <div class="upload-inner">
              <div class="icon-box">
                <icon class="icon icon-cloud-upload"/>
              </div>
              <div class="upload-txt">
                <p>将文件拖到此处，或<span>点击上传</span></p>
              </div>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="">
          <p>{{filename}}</p>
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button @click="cancleExport">取消</Button>
        <Button type="primary" :loading="exportClock" @click="uploadPublic()">
          <span v-if="!exportClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Drawer>
    <!--批量取消关联广告位-->
    <Drawer v-model="configModalFlag" title="关联广告位信息" :mask-closable="false" class="newBatch" width="600"
            :styles="drawStyles">
      <div class="config_header">
        <Input type="textarea" style="width: 475px" class="i-margin-right-11 mar-bot-10" clearable
               v-model.trim="config_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="输入广告位id,多个用回车分隔"/>
        <Button type="primary" @click="configSearch">查询</Button>
      </div>
      <div class="config_content">
        <div style="display:flex;">
          <Checkbox
            :value="configCheckAll"
            @click.prevent.native="configHandCheckAll">
            <span>全选</span>
          </Checkbox>
          <span v-if="configStatus !==4 " @click="batchCancel('','batch')"
                style="cursor:pointer;color: #4083F8;float: right;margin-right: 0px;width: 65px">批量取关</span>
        </div>
        <div class="config_detail">
          <CheckboxGroup v-model="configCheckAllGroup" @on-change="configGroupChange">
            <p v-for="(item,index) in configDatList" :key="'练练看'+index">
              <Checkbox :label="item.sstc_id" class="checkout_box">
                <span @click="toConfig(item.id)" class="checkbox-title" :title="item.ssp_slot_name +'('+item.id + ')'">{{item.ssp_slot_name}}({{item.id}})</span>
                <span v-if="configStatus !==4 " @click="batchCancel(item.sstc_id,'single')" class="checkbox-operate">取消关联</span>
              </Checkbox>
            </p>
          </CheckboxGroup>
        </div>
      </div>
    </Drawer>
    <!--自定义列-->
    <custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>
    <Modal class="modal_status"
           v-model="pickupModal"
           :closable="false"
           :mask-closable="false"
           title="修改采买类型"
           width="450">
      <div class="modalContent">
        <p style="margin-bottom:10px;color: red">仅当日没有关联任何广告位的预算位才可以修改其采买状态类型，否则无法修改成功</p>
        <RadioGroup v-model="pickup_status">
          <Radio :label="1">联调</Radio>
          <Radio :label="2">测试</Radio>
          <Radio :label="3">正式</Radio>
        </RadioGroup>
      </div>
      <div slot="footer">
        <Button @click="pickupModal = false">取消</Button>
        <Button type="primary" :loading="exportClock" @click="pickupSubmit()">
          <span v-if="!exportClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Modal>
    <Modal class="modal_status"
           v-model="bannedModal"
           :closable="false"
           :mask-closable="false"
           title="封禁提醒"
           width="350">
      <div class="modalContent">
        <p style="margin-bottom: 10px">如果确认封禁该预算位，请填写封禁时长</p>
        <Form ref="formValidate" :model="bannedData" :rules="bannedRule" :label-width="0">
          <FormItem label="" prop="bannedTime">
            <InputNumber :min="0" :max="1000" v-model.trim="bannedData.bannedTime" placeholder="只允许添加数字，不超过1000"
                         style="width: 250px;"/>
            <span style="margin-left: 10px">天</span>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="bannedModal = false">取消</Button>
        <Button type="primary" :loading="exportClock" @click="bannedSubmit()">
          <span v-if="!exportClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {showTitle, regNumPositiveInteger, inputMaxNumber, filterBatchQuery} from '@/libs/util'
  import {debounce, number2Thousand, createObjectURL, formatDate} from '@/libs/tools'
  import {commonMixin} from '@/mixin/basic-common-class.js'
  import {getBitColumn} from './data/data'
  import {pickupDspSlotStatus, bannedDspSlotStatus, getDspProductList, getDspSlotList, getDspSlotListAPI, saveDspSlot, updateDspSlotStatus, getErrSspSlot, importDspSlot, importDspSlotApi, getSspByDspList, deleteSspByDsp, dspImportAddUrl, dspImportAdd, dspImportUpdate, dspImportUpdateUrl} from '@/api/dsp'
  import {getDownLoadXls} from '@/api/common'
  import {tableHeight} from '@/mixin/calc-table-height.js'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
  import {columnFn} from '@/mixin/custom-column.js'
  import {mapActions} from 'vuex'

  export default {
    name: 'dsp-slot-manage',
    mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
    components: {
      customColumn
    },
    data() {
      const bannedTime = (rule, value, callback) => {
        let data = this.bannedData.bannedTime
        let flag = new RegExp('^[1-9]([0-9])*$').test(data)
        if (!flag) {
          callback(new Error('封禁时长必须为大于0的正整数'))
        } else {
          callback()
        }
      }
      return {
        batchStatus: false,
        bannedModal: false, // 批量封禁
        bannedData: {
          bannedTime: null
        },
        bannedRule: {
          bannedTime: [{required: true, validator: bannedTime}]
        },
        pickupModal: false, // 采买类型的修改
        pickup_status: 1, // 修改采买类型
        dspImportAddUrl: dspImportAddUrl,
        dspImportUpdateUrl: dspImportUpdateUrl,
        inputMaxNumber: inputMaxNumber,
        importDspSlotApi: importDspSlotApi,
        exportModalFlag: false,
        pageSize: 10,
        total_count: 0,
        currentPage: 1,
        noDataText: this.$config.noDataText,

        dspCompanyList: [], // 筛选，公司名称
        selectID: [], // 批量id
        // 搜索联动使用
        catchProductList: [], // 缓存产品名称
        productList: [], // 产品名称
        productLoad: false, // 产品加载中
        // 搜索联动使用
        catchDspSlotList: [], // 缓存预算位名称
        dspSlotList: [], // 预算位名称
        dspSlotLoad: false, // 预算位加载中

        // 搜索条件
        filterSearch: {
          dsp_company_id: [], // 预算方公司ID，多选
          product_id_arr: [], // 产品ID，多选
          ad_type_id: [], // 广告类型ID，多选
          creative_type: [], // 广告创意编号，多选
          status: 0, // 状态
          search_text: '', // 搜索输入框
          dsp_slot_id_arr: [], // 预算位ID数组批量搜索
          dsp_slot_code_arr: [], // 预算方广告位ID查询
          dsp_slot_name_arr: [], // 预算位名称查询
          ratio_arr: [], // 素材尺寸比例
          pickup_status: 0, // 采买类型
          related_ssp_slot_num: null, // 关联的广告位个数

          dsp_slot_id_arr_select: [], // 预算位名称/ID(单个)
          dsp_slot_id_arr_textarea: null, // 预算位ID数组textarea
          dsp_slot_code_arr_textarea: null, // 预算方广告位ID数组textarea
          dsp_slot_name_arr_textarea: null, // 预算位名称查询textarea
          ratio_arr_textarea: null, // 素材尺寸比例textarea

          // 备用数组
          styleDataArr: [] // 广告样式列表
        },

        catchTableColList: getBitColumn(this), // 自定义列
        colDatList: [],
        tableLoadFlag: true, // table的loading
        submitClock: false, // 保存锁
        setModalFlag: false, // 抽屉开关
        isNewCreateFlag: false, // 新建或者修改
        ratioErrSlotList: [], // 素材尺寸比例 获取配对存在错误的广告位
        osTypeErrSlotList: [], // 素材尺寸比例 获取配对存在错误的广告位
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '54px',
          paddingLeft: '25px',
          paddingRight: '25px',
          position: 'static'
        },
        uploadList: [], // 上传的文件
        filename: '',
        exportClock: false,
        configModalFlag: false, // 关联广告位的弹框
        configDatList: [], // 连连看的数据
        configCheckAll: false, // 连连看全选
        configCheckAllGroup: [], // 连连看选中的值
        config_textarea: null, // 批量搜索的文件
        config_ssp_slot_id_arr: [], // 批量搜搜的ID
        configStatus: 1, // 批量连连看的状态
        config_dsp_slot_id: null,
        importDrawObj: {}, // 导入应用相关（批量新建应用/批量修改应用）
        downClock: false
      }
    },
    filters: {
      timeFormat(time, format) {
        return formatDate(time * 1000, format)
      },
      /**
       * [filterAdRatio 列表中尺寸格式化]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      filterAdRatio(item) {
        let _temp = item[item.length - 1]
        return `${_temp.width}:${_temp.height} (${number2Thousand(_temp.width / _temp.height)})`
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      },
      /**
       * [filterStyleData 选择广告样式]
       * @return {[type]} [description]
       */
      styleData() {
        let data = [...this.$store.state.app.adStyleData]

        let result = data.filter(item => {
          return item.parentId === this.modalForm.ad_type_id
        })

        return result
      },
      /**
       * [sizeProportion 尺寸比例]
       * @return {[type]} [description]
       */
      sizeProportion() {
        return number2Thousand(this.modalForm.dsp_ad_ratio_width / this.modalForm.dsp_ad_ratio_height)
      },
      /**
       * [osType 应用平台]
       * @return {[type]} [description]
       */
      osType() {
        return this.$store.getters.osType
      }
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
    },
    activated() {
      this.$Bus.$off('dspSlotEmitEvent')
      this.$Bus.$on('dspSlotEmitEvent', (msg) => {
        this.getDspSlotList() // 默认请求一次媒体列表数据
      })
    },
    created() {

      this.getTableColumns()

      if (this._hasPageAccess()) {

        this.initLinkage() // 初始化联动

        this.getDspSlotList()
      }
    },
    methods: {
      ...mapActions([
        'getDspCompanyList'
      ]),
      /**
       * [batchSetButton 批量设置]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      batchSetButton() {
        this.selectID.length > 0 ? this.batchStatus = true : this.$Message.warning('请选择对应的设置的预算位')
      },
      /**
       * [initSearchFilter 初始化筛选联动]
       * @return {[type]} [description]
       */
      initLinkage() {
        this._getDspCompanyList() // 获取媒体公司数据
        this._getDspSlotList() // 预算方-预算位
        this._getProductList() // 产品
      },
      /**
       * [configSearch 批量取消的查询]
       * @return {[type]} [description]
       */
      configSearch() {
        this.config_ssp_slot_id_arr = filterBatchQuery({value: this.config_textarea})
        this.configModalData()
      },
      batchCancel(id, type) {
        if (type === 'batch' && this.configCheckAllGroup.length === 0) {
          this.$Message.warning('请选择取消关联的广告位')
          return false
        }
        let sstc_id_arr = []
        type === 'batch' ? sstc_id_arr = this.configCheckAllGroup : sstc_id_arr.push(id)
        this.$Modal.confirm({
          title: '确定要取消所对应的广告位吗？',
          onOk: () => {
            deleteSspByDsp({
              sstc_id_arr: sstc_id_arr
            }).then(res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: '取消关联广告位成功',
                  duration: 3
                })
              }
              this.configModalFlag = false
              this.config_textarea = null
              this.getDspSlotList()
              this.$Bus.$emit('sspAdvEmitEvent') // ssp-adv
            })
          },
          onCancel: res => {

          }
        })

      },
      /**
       * [configHandCheckAll 连连看的全选]
       * @return {[type]} [description]
       */
      configHandCheckAll() {
        this.configCheckAll = !this.configCheckAll
        if (this.configCheckAll) {
          let data = []
          this.configDatList.filter(item => {
            data.push(item.sstc_id)
          })
          this.configCheckAllGroup = data
        } else {
          this.configCheckAllGroup = []
        }
      },
      /**
       * [configGroupChange 连连看的单选]
       * @return {[type]} [description]
       */
      configGroupChange(data) {
        this.configCheckAll = data.length === this.configDatList.length
      },
      /**
       * [configModalData 预算位ID获取连连看广告位数据]
       * @return {[type]} [description]
       */
      configModalData(id, type, status) {
        id ? this.config_dsp_slot_id = Number(id) : ''
        if (type === 'open') {
          this.configModalFlag = true
          this.config_textarea = null
          this.config_ssp_slot_id_arr = []
          this.configCheckAllGroup = []
          this.configCheckAll = false
          this.configStatus = status
        }
        let params = {}
        params.page_num = 1
        params.page_size = 0
        params.dsp_slot_id = this.config_dsp_slot_id
        // 广告位id
        !!this.config_ssp_slot_id_arr.length && (params.ssp_slot_id_arr = this.config_ssp_slot_id_arr)
        getSspByDspList(params).then(res => {
          if (res.code === 200) {
            this.configDatList = res.data.list
          }
        })
      },
      /**
       * [selChange 获取选中的值]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      selectChange(select) {
        let _arr = []
        select.map(item => {
          _arr.push(item.id)
        })
        this.selectID = _arr
      },
      /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}       [description]
       */
      limitText(count) {
        return `${count}+`
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
       * [getDspSlotList 获取列表的信息]
       * @return {[type]} [description]
       */
      getDspSlotList() {
        // 参数
        let params = this.getAxiosParams()
        params.page_num = this.currentPage
        params.page_size = this.pageSize

        this.tableLoadFlag = true

        getDspSlotList(params).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.total_count = res.data.total_count
            let dspList = []
            if (res.data.list) {
              dspList = res.data.list.map(item => {
                if (item.status === 4) {
                  item._disabled = true
                }
                return item
              })
            }
            this.colDatList = dspList
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [getAxiosParams 获取下载和列表的url参数]
       * @return {[type]} [description]
       */
      getAxiosParams() {

        let _filter = this.filterSearch

        let params = {
          dsp_company_id: _filter.dsp_company_id,
          product_id_arr: _filter.product_id_arr,
          ad_type_id: _filter.ad_type_id,
          creative_type: _filter.creative_type,
          search_text: _filter.search_text,
          status: _filter.status,
          pickup_status: _filter.pickup_status
        }
        _filter.related_ssp_slot_num > -1 && _filter.related_ssp_slot_num !== null ? (params.related_ssp_slot_num = _filter.related_ssp_slot_num) : ''
        // 预算位ID数组
        !!_filter.dsp_slot_id_arr.length && (params.dsp_slot_id_arr = _filter.dsp_slot_id_arr)

        // 预算方广告位ID数组
        !!_filter.dsp_slot_code_arr.length && (params.dsp_slot_code_arr = _filter.dsp_slot_code_arr)

        // 预算位名称
        !!_filter.dsp_slot_name_arr.length && (params.dsp_slot_name_arr = _filter.dsp_slot_name_arr)

        // 素材尺寸比例
        !!_filter.ratio_arr.length && (params.ratio_arr = _filter.ratio_arr)

        return params
      },
      /**
       * [submitDspSlot 新建/编辑 新建预算位]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      submitDspSlot(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {

            this.submitClock = true

            let params = {...this.modalForm}

            // 尺寸比例
            if (!!params.dsp_ad_ratio_height && !!params.dsp_ad_ratio_width) {
              params.dsp_ad_ratio_height = [params.dsp_ad_ratio_height]
              params.dsp_ad_ratio_width = [params.dsp_ad_ratio_width]
            }

            saveDspSlot(params).then(res => {

              this.submitClock = false

              if (res.code === 200) {
                this.setModalFlag = false
                this.$Message.success({content: params.id ? '新建成功' : '保存成功', duration: 3})
                this.resetModalForm() // 重置表单
                this.getDspSlotList()
              }
            }, err => {
              this.submitClock = false
            })
          }
        })
      },
      /**
       * [changePickup 批量修改采买类型]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      changePickup() {
        if (!this.selectID.length) {
          this.$Message.warning('请先勾选预算位')
          return
        }
        this.pickupModal = true
        this.pickup_status = 1
        this.exportClock = false
      },
      pickupSubmit() {
        this.exportClock = true
        if (!this.selectID.length) {
          return
        }
        pickupDspSlotStatus({
          dsp_slot_id_arr: [...this.selectID],
          pickup_status: this.pickup_status
        }).then(res => {
          if (res.code === 200) {
            this.$Message.success({content: '采买类型修改成功', duration: 3})
          }
          this.pickupModal = false
          this.selectID = [] // 重置批量
          this.exportClock = false
          this.getDspSlotList()
        }, err => {
          this.exportClock = false
          this.selectID = [] // 重置批量
        })
      },
      /**
       * [changePickup 批量封禁]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      changeBanned() {
        if (!this.selectID.length) {
          this.$Message.warning('请先勾选预算位')
          return
        }
        this.bannedModal = true
        this.bannedData.bannedTime = null
        this.$refs['formValidate'].resetFields()
        this.exportClock = false
      },
      bannedSubmit() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            this.exportClock = true
            if (!this.selectID.length) {
              return
            }
            bannedDspSlotStatus({
              dsp_slot_id_arr: [...this.selectID],
              days: Number(this.bannedData.bannedTime)
            }).then(res => {
              this.exportClock = false
              this.bannedModal = false
              if (res.code === 200) {
                this.$Message.success({content: '封禁成功', duration: 3})
              }
              this.selectID = [] // 重置批量
              this.getDspSlotList()
            }, error => {
              this.exportClock = false
              this.selectID = [] // 重置批量
            })
          }
        })

      },

      /**
       * [changeState 切换业务状态, 此处包含单个和批量]
       * @param  {[type]} item [description]
       * @param  {[type]} type [批量处理时，type=open/close对应改变status值，无type值为单个处理]
       * @return {[type]}     [description]
       */
      changeState(item, type) {

        let title = '' // 二次确认弹出title
        let status // 修改的状态值
        let dsp_slot_id = [] // 修改的数组

        if (type === 'open' || type === 'close') { // 批量处理
          // 需要判断selectID是否为空
          if (!this.selectID.length) {
            this.$Message.warning('请先勾选预算位')
            return
          }

          status = type === 'open' ? 1 : 2
          title = type === 'open' ? '确定开启该预算位?' : '确定停用该预算位?'
          dsp_slot_id = [...this.selectID]

        } else { // 单个处理
          status = item.status
          title = item.status === 1 ? '确定开启该预算位?' : '确定停用该预算位?'
          dsp_slot_id = [item.id]
        }

        this.$Modal.confirm({
          title: title,
          onOk: () => {
            updateDspSlotStatus({
              dsp_slot_id: dsp_slot_id,
              status: status // 1=正常,2=停用
            }).then(res => {
              if (res.code === 200) {
                this.$Message.success({content: '状态修改成功', duration: 3})
              }

              this.selectID = [] // 重置批量

              this.getDspSlotList()
            }, err => {
              this.selectID = [] // 重置批量
            })
          },
          onCancel: res => {

            // this.selectID = [] // 重置批量

            // 只有在单个改变状态时，点击取消时，返回未点击时的状态
            if (!type) {
              item.status = item.status === 1 ? 2 : 1
            }
          }
        })
      },
      /**
       * [changePage 修改页码]
       * @param  {[type]} val [description]
       * @return {[type]}     [description]
       */
      changePage(val) {
        this.currentPage = val
        this.getDspSlotList()
      },
      /**
       * [sizeChange 切换每页条数时的回调]
       * @param  {[type]} size [description]
       * @return {[type]}      [description]
       */
      sizeChange(size) {
        this.pageSize = size
        this.getDspSlotList()
      },
      /**
       * [doFilterList 查询]
       * @return {[type]} [description]
       */
      doFilterList() {
        this.currentPage = 1

        let _filter = this.filterSearch

        // 此处有容处理
        // 预算位ID查询
        // 1. 预算位Id多选和单选，最后统一按照 ssp_slot_id_arr 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_arr_select 两个筛选条件）
        let textSplitArr = filterBatchQuery({value: _filter.dsp_slot_id_arr_textarea, type: 'number'})
        _filter.dsp_slot_id_arr = Array.from(new Set([...textSplitArr, ..._filter.dsp_slot_id_arr_select]))

        // 预算方广告位ID数组
        _filter.dsp_slot_code_arr = filterBatchQuery({value: _filter.dsp_slot_code_arr_textarea})
        // 预算位名称
        _filter.dsp_slot_name_arr = filterBatchQuery({value: _filter.dsp_slot_name_arr_textarea})
        // 素材尺寸比例
        _filter.ratio_arr = filterBatchQuery({value: _filter.ratio_arr_textarea, ratio: true})

        this.getDspSlotList()
      },
      /**
       * [toConfig 跳转到配置页]
       * @return {[type]} [description]
       */
      toConfig(slot_id) {
        let routerJump = this.$router.resolve({
          path: '/ssp/ad/config/' + slot_id
        })
        window.open(routerJump.href, '_blank')
      },
      /**
       * [toAdConfig 跳转到配置页]
       * @return {[type]} [description]
       */
      toAdConfig(slot_id) {
        this.resetModalForm()

        setTimeout(() => {
          // 有效期内，跳转到首页
          this.$router.push({
            name: 'ad-config',
            params: {
              slot_id
            }
          })
        }, 500)
      },
      /**
       * [toNew 创建预算位]
       * @return {[type]} [description]
       */
      toNew() {
        this.$router.push({
          name: 'dsp-slot-edit'
        })
      },
      /**
       * [toEdit 编辑预算位]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      toEdit(id) {
        return `/dsp/slot/edit?slot_id=${id}`
      },
      /**
       * [resetModalForm 重置form表单]
       * @return {[type]} [description]
       */
      resetModalForm() {
        this.setModalFlag = false
        this.isNewCreateFlag = false
        this.ratioErrSlotList = []
        this.osTypeErrSlotList = []

        this.$refs['modalForm'].resetFields()
      },

      /********************************************
       *↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
       ********************************************/
      /**
       * [_getDspCompanyList 获取媒体公司数据]
       * @return {[type]} [description]
       */
      async _getDspCompanyList(action) {
        let storeUser = this.$store.state.user
        let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList({
          page_size: 0,
          page_num: 1
        })

        this.dspCompanyList = resArr
      },
      /**
       * [searchProduct 产品搜索]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      searchProduct(query) {
        this.productLoad = true
        this._getProductList(query)
      },
      /**
       * [clearSearchProduct 清空产品]
       * @return {[type]} [description]
       */
      clearSearchProduct(arr) {
        if (arr.length === 0) {
          this.productList = [...this.catchProductList]
        }
      },
      /**
       * [productQueryChange 产品发生变化时]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      productQueryChange(query) {
        if (!query) {
          this.productList = [...this.catchProductList]
        }
      },

      /**
       * [searchDspSlot 预算位搜索]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      searchDspSlot(query) {
        this.dspSlotLoad = true
        this._getDspSlotList(query)
      },
      /**
       * [clearSearchDspSlot 清空预算位]
       * @return {[type]} [description]
       */
      clearSearchDspSlot(arr) {
        if (arr.length === 0) {
          this.dspSlotList = [...this.catchDspSlotList]
        }
      },
      /**
       * [dspSlotQueryChange 预算位-搜索词发生变化时]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      dspSlotQueryChange(query) {
        if (!query) {
          this.dspSlotList = [...this.catchDspSlotList]
        }
      },
      /**
       * [getDspSlotList 产品列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      _getProductList: debounce(function (query) {
        let _params = {
          dsp_company_id_arr: this.filterSearch.dsp_company_id,
          page_size: (!!query || this.filterSearch.dsp_company_id.length) ? 10000 : 10,
          page_num: 1,
          name_or_id: query || ''
        }

        getDspProductList(_params).then(res => {
          this.productLoad = false
          if (res.code === 200) {
            this.productList = res.data.list

            if (!query) {
              this.catchProductList = res.data.list
            }
          }
        })
      }, 1000),
      /**
       * [getDspSlotList 预算位列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      _getDspSlotList: debounce(function (query) {
        let _params = {
          product_id_arr: this.filterSearch.product_id_arr,
          page_size: (!!query || this.filterSearch.product_id_arr.length) ? 10000 : 10,
          page_num: 1,
          search_text: query || ''
        }

        getDspSlotList(_params).then(res => {
          this.dspSlotLoad = false
          if (res.code === 200) {
            this.dspSlotList = res.data.list

            if (!query) {
              this.catchDspSlotList = res.data.list
            }
          }
        })
      }, 1000),
      /********************************************
       *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
       ********************************************/

      /********************************************
       *↓↓↓↓↓↓↓↓↓↓ 上传文件 start *↓↓↓↓↓↓↓
       ********************************************/
      /**
       * [cancleExport 取消导入]
       * @return {[type]} [description]
       */
      /**
       * [showImportModal 显示批量导入]
       * @param  {[type]} type [description]
       * @return {[type]}      [description]
       */
      showImportModal(obj) {
        this.importDrawObj = obj
        this.exportModalFlag = true
      },
      // 上传的错误判断
      handleFormatError(file) {
        this.$Message.error({
          content: '不支持此文件类型',
          duration: 3
        })
      },
      /**
       * [checkFormat 校验文件类型, 必须满足]
       * @param  {[type]} type [description]
       * @return {[type]}      [description]
       */
      checkFormat(type) {
        let format = ['csv', 'xlsx', 'xls']
        if (!format.includes(type)) {
          this.$Message.error({
            content: '文件格式错误',
            duration: 3
          })
          return false
        }

        return true
      },
      // 上传前的判断
      handleBeforUpload(file) {
        // let type = file.name && file.name.indexOf('.') ? file.name.split('.')[1].toLowerCase() : ''
        let type = file.name && file.name.indexOf('.') ? file.name.split('.') : ''
        let finallyType = type[type.length - 1].toLowerCase()
        if (!this.checkFormat(finallyType)) {
          return false
        }
        this.uploadList = []
        if (file && file.size > (10 * 1024 * 1024)) {
          this.$Message.warning('文件不能大于' + 10 + 'M')
          return false
        } else {
          this.uploadList.push(file)
          this.filename = file.name
          return false
        }
      },
      uploadPublic() { // 图片、视频公共批量上传
        if (this.uploadList.length === 0) {
          this.$Message.error('请上传文件')
          return false
        } else {
          this.upload()
        }
      },
      /**
       * [upload 批量导入预算位]
       * @return {[type]} [description]
       */
      upload() {
        // formdata
        let formData = new FormData()
        formData.append('file', this.uploadList[0])
        let proAxios = this.importDrawObj.type === 'add' ? dspImportAdd(formData) : (this.importDrawObj.type === 'update' ? dspImportUpdate(formData) : '')
        this.exportClock = true

        proAxios.then(res => {
          if (res.code === 200) {
            this.$Message.success('上传成功')
            this.getDspSlotList()
          } else if (res.code === 405) {

            let _arr = !!res.msg ? res.msg.split(';') : []

            if (_arr.length) {

              let html = '<div style="max-height: 400px;overflow: auto;">'
              _arr.map(_ => {
                html += `<p style="line-height:20px">${_}</p>`
              })
              html += '</div>'

              this.$Modal.warning({
                title: '错误提示',
                content: html,
                width: 500,
                className: 'hintModal',
                onOk: () => {
                  this.getDspSlotList()
                }
              })
            }

          } else {
            this.$Message.error({
              content: res.msg,
              duration: 5
            })
          }
          this.resetExport() // 重置导入
        }, err => {
          this.resetExport() // 重置导入
        })
      },
      /**
       * [cancleExport 取消导入]
       * @return {[type]} [description]
       */
      cancleExport() {
        this.resetExport() // 重置导入
      },
      /**
       * [resetExport 重置导入]
       * @return {[type]} [description]
       */
      resetExport() {
        this.uploadList = []
        this.filename = ''
        this.exportClock = false
        this.exportModalFlag = false
        this.importDrawObj = {}
      },
      /**
       * [downStatement 下载报表]
       * @return {[type]} [description]
       */
      downStatement() {
        // params参数
        let params = this.getAxiosParams()
        params.page_num = 1
        params.page_size = this.total_count

        let down = {
          url: getDspSlotListAPI(params),
          method: 'GET'
        }
        this.downClock = true

        getDownLoadXls(down).then(res => {
          if (res.code === 200) {
            let filename = '预算位列表.xlsx'
            createObjectURL(res.data.url, filename)
          }
          this.downClock = false
        })
      }
      /********************************************
       *↑↑↑↑↑↑↑↑↑ 上传文件 end *↑↑↑↑↑↑
       ********************************************/
    },
    watch: {
      /**
       * [ad_type_id 监听广告场景的变化]
       * @param  {[type]} newVal [description]
       * @return {[type]}        [description]
       */
      'filterSearch.ad_type_id'(newVal) {
        let styleArr = this.$store.state.app.adStyleData
        let filterArr = []

        newVal.map(item => {
          styleArr.map(child => {
            if (item === child.parentId) {
              filterArr.push(child)
            }
          })
        })

        this.filterSearch.creative_type = [] // 重置数据
        this.filterSearch.styleDataArr = filterArr
      },
      /**
       * 选择预算方
       */
      'filterSearch.dsp_company_id': {
        handler: function (val) {
          console.log(val)
          this._getProductList()
        }
      },
      /**
       * 选择预算方
       */
      'filterSearch.product_id_arr': {
        handler: function (val) {
          console.log(val)
          this._getDspSlotList()
        }
      }
    }
    /**
     * [beforeRouteLeave 路由跳转]
     * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
     * @param  {[type]}   from [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    // beforeRouteLeave(to, from, next) {
    //   if (to.name !== 'dsp-slot-edit') {
    //     this.$Bus.$off('editSlotEvent')
    //   }
    //   next()
    // }
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
