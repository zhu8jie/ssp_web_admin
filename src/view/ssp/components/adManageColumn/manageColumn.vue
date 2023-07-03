<template>
  <Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="750px" :mask-closable="false"
          :closable="false" :styles="drawStyles">
    <div class="column_content">
      <div class="col_detail">
        <div class="media_table">
          <Row>
            <Col :span="17">
              <div class="col_title">可选择列</div>
              <div class="optional_detail">
                <!-- 基本信息 -->
                <div class="checkout_content">
                  <div class="check_title">
                    <Checkbox
                      :value="basic_information_isAll"
                      @click.prevent.native="basicInformationSelectAll">基本信息</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="basicInformationChange">
                    <Checkbox class="option_check" v-for="item in basic_information" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <!-- 数据指标 -->
                <div class="checkout_content" v-show="data_indicator.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="data_indicator_isAll"
                      @click.prevent.native="dataIndicatorSelectAll">数据指标</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="dataIndicatorChange">
                    <Checkbox class="option_check" v-for="item in data_indicator" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <!-- 结算及价格 -->
                <div class="checkout_content" v-show="settlement_price.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="settlement_price_isAll"
                      @click.prevent.native="settlementPriceSelectAll">结算及价格</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="settlementPriceChange">
                    <Checkbox class="option_check" v-for="item in settlement_price" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <!-- 运营情况 -->
                <div class="checkout_content" v-show="operation_situation.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="operation_situation_isAll"
                      @click.prevent.native="operationSituationSelectAll">运营情况</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="operationSituationChange">
                    <Checkbox class="option_check" v-for="item in operation_situation" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <!-- 扣量策略 -->
                <div class="checkout_content" v-show="batch_tactics.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="batch_tactics_isAll"
                      @click.prevent.native="batchTacticsSelectAll">扣量策略</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="batchTacticsChange">
                    <Checkbox class="option_check" v-for="item in  batch_tactics" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <!-- SDK相关的内容 -->
                <div class="checkout_content" v-show="SDK_platform.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="SDK_platform_isAll"
                      @click.prevent.native="SDKPlatformSelectAll">SDK相关内容</Checkbox>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="SDKPlatformChange">
                    <Checkbox class="option_check" v-for="item in  SDK_platform" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <div class="checkout_content" v-show="product_information.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="product_information_isAll"
                      @click.prevent.native="productInformationSelectAll">产品信息</Checkbox>
                    <span style="color: red">（选择产品信息后，请至少选择一个产品）</span>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="productInformationChange">
                    <Checkbox class="option_check" v-for="item in  product_information" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
                <div class="checkout_content" v-show="product_name.length > 0">
                  <div class="check_title">
                    <Checkbox
                      :value="product_name_isAll"
                      @click.prevent.native="productNameSelectAll">产品名称</Checkbox>
                    <span style="color: red">（选择产品后，请至少选择一个产品信息）</span>
                  </div>
                  <CheckboxGroup v-model="adManageHasCheckData" @on-change="productNameChange">
                    <Checkbox class="option_check" v-for="item in  product_name" :key="item" :label="item">
                      <span>{{item}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
              </div>
            </Col>
            <Col :span="7">
              <div class="col_title">已选择列</div>
              <div class="select_con">
                <Tag v-for="item in adManageHasCheckData" :key="item" :name="item" closable @on-close="trafficToggle">{{item}}</Tag>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <Button @click="drawerModalFlag = false">取消</Button>
      <Button type="primary" :loading="submitClock" @click="submitData()">
        <span v-if="!submitClock">确定</span>
        <span v-else>提交中...</span>
      </Button>
    </div>
  </Drawer>
</template>

<script>
  import {localSave, localRead} from '@/libs/util'
  import { customColumn } from './col'
  import { getDspProductList } from '@/api/dsp'

  export default {
    props: {
      datalist: Array // 勾选的列表
    },
    mixins: [customColumn],
    data() {
      return {
        submitClock: false,
        drawerModalFlag: false, // 抽屉开关
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          padding: '10px 25px 54px 10px',
          position: 'static'
        },
        hasCheckArr: [], // 已选择列

        // 抽屉 - 自定义
        basic_information_isAll: false, // 基本信息是否全选
        data_indicator_isAll: false, // 数据指标是否全选
        settlement_price_isAll: false, // 结算与价格是否全选
        operation_situation_isAll: false, // 运营情况是否全选
        batch_tactics_isAll: false, // 扣量策略
        SDK_platform_isAll: false, // sdk接入相关
        product_name_isAll: false, // 产品名称
        product_information_isAll: false, // 产品信息

        product_name: [] // 产品名称
      }
    },
    methods: {
      /**
       * [getTableColumns 获取自定义列表]
       * @return {[type]} [description]
       */
      getTableColumns() {
        this.drawerModalFlag = !this.drawerModalFlag
        let _local = localRead(this.$route.name.toUpperCase())
        // 默认
        if (!_local) {
        } else {
          this.adManageHasCheckData = _local.split(',')
        }
        this.trafficJudgeAll()
      },
      /**
       * [getDspProductList 获取列表的信息]
       * @return {[type]} [description]
       */
      getDspProductList() {
        let params = {page_num: 1, page_size: 0}
        getDspProductList(params).then(res => {
          if (res.code === 200) {
            let listData = res.data.list
            let product_name = []
             if (listData && listData.length) {
               listData.map(item => {
                 product_name.push(item.name)
               })
             }
             this.product_name = product_name
          }
        })
      },
      /**
       * [trafficJudgeAll 流量判断是否全选]
       * @return {[type]} [description]
       */
      trafficJudgeAll() {
        this.adManageHasCheckData = [...new Set(this.adManageHasCheckData)]

        // 接下来判断维度是否全选
        let basic_information_arr = [] // 基本信息
        let data_indicator_arr = [] // 数据指标
        let settlement_price_arr = [] // 结算及价格
        let operation_situation_arr = [] // 运营情况
        let batch_tactics_arr = [] // 扣量策略
        let SDK_platform_arr = [] // sdk接入相关
        let product_name_arr = [] // 产品名称
        let product_information_arr = [] // 产品信息
        this.adManageHasCheckData.map(item => {
          // 基本信息
          if (this.basic_information.indexOf(item) > -1) {
            basic_information_arr.push(item)
          }
          // 数据指标
          if (this.data_indicator.indexOf(item) > -1) {
            data_indicator_arr.push(item)
          }
          // 结算及价格
          if (this.settlement_price.indexOf(item) > -1) {
            settlement_price_arr.push(item)
          }
          // 运营情况
          if (this.operation_situation.indexOf(item) > -1) {
            operation_situation_arr.push(item)
          }
          // 扣量策略
          if (this.batch_tactics.indexOf(item) > -1) {
            batch_tactics_arr.push(item)
          }
          // sdk接入相关
          if (this.SDK_platform.indexOf(item) > -1) {
            SDK_platform_arr.push(item)
          }
          // 产品名称
          if (this.product_name.indexOf(item) > -1) {
            product_name_arr.push(item)
          }
          // 产品信息
          if (this.product_information.indexOf(item) > -1) {
            product_information_arr.push(item)
          }
        })

        this.basic_information_isAll = basic_information_arr.length === this.basic_information.length // 基本信息
        this.data_indicator_isAll = data_indicator_arr.length === this.data_indicator.length // 数据指标
        this.settlement_price_isAll = settlement_price_arr.length === this.settlement_price.length // 结算及价格
        this.operation_situation_isAll = operation_situation_arr.length === this.operation_situation.length // 运营情况
        this.batch_tactics_isAll = batch_tactics_arr.length === this.batch_tactics.length // 扣量信息
        this.SDK_platform_isAll = SDK_platform_arr.length === this.SDK_platform.length // sdk接入相关
        this.product_name_isAll = product_name_arr.length === this.product_name.length // 产品名称
        this.product_information_isAll = product_information_arr.length === this.product_information.length // 产品信息
      },
      /**
       * [basicInformationSelectAll 基本数据 选择全部]
       * @return {[type]} [description]
       */
      basicInformationSelectAll() {
        let resultArr = this.basic_information_isAll ? this.adManageHasCheckData.filter(x => !this.basic_information.includes(x)) : [...this.adManageHasCheckData, ...this.basic_information]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.basic_information_isAll = !this.basic_information_isAll
      },
      /**
       * [trafficDataDimChange 基本数据 单选]
       * @param  {[type]} data [description]
       * @return {[type]}	  [description]
       */
      basicInformationChange(data) {
        let dataAll = [...data].filter(item => this.basic_information.indexOf(item) > -1)

        this.basic_information_isAll = dataAll.length === this.basic_information.length
      },
      /**
       * [dataIndicatorSelectAll 数据指标 选择全部]
       * @return {[type]} [description]
       */
      dataIndicatorSelectAll() {
        let resultArr = this.data_indicator_isAll ? this.adManageHasCheckData.filter(x => !this.data_indicator.includes(x)) : [...this.adManageHasCheckData, ...this.data_indicator]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.data_indicator_isAll = !this.data_indicator_isAll
      },
      /**
       * [dataIndicatorChange 数据指标 单选]
       * @param  {[type]} data [description]
       * @return {[type]}	  [description]
       */
      dataIndicatorChange(data) {
        let dataAll = [...data].filter(item => this.data_indicator.indexOf(item) > -1)

        this.data_indicator_isAll = dataAll.length === this.data_indicator.length
      },
      /**
       * [trafficEffectIndiSelectAll 结算与单选 选择全部]
       * @return {[type]} [description]
       */
      settlementPriceSelectAll() {
        let resultArr = this.settlement_price_isAll ? this.adManageHasCheckData.filter(x => !this.settlement_price.includes(x)) : [...this.adManageHasCheckData, ...this.settlement_price]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.settlement_price_isAll = !this.settlement_price_isAll
      },
      /**
       * [settlementPriceChange 结算与单选 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      settlementPriceChange(data) {
        let dataAll = [...data].filter(item => this.settlement_price.indexOf(item) > -1)

        this.settlement_price_isAll = dataAll.length === this.settlement_price.length
      },
      /**
       * [operationsituationSelectAll  运营状态 选择全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      operationSituationSelectAll() {
        let resultArr = this.operation_situation_isAll ? this.adManageHasCheckData.filter(x => !this.operation_situation.includes(x)) : [...this.adManageHasCheckData, ...this.operation_situation]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.operation_situation_isAll = !this.operation_situation_isAll
      },
      /**
       * [operationSituationChange 运营状态 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      operationSituationChange(data) {
        let dataAll = [...data].filter(item => this.operation_situation.indexOf(item) > -1)

        this.operation_situation_isAll = dataAll.length === this.operation_situation.length
      },
      /**
       * [batchTacticsSelectAll  扣量策略 选择全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      batchTacticsSelectAll() {
        let resultArr = this.batch_tactics_isAll ? this.adManageHasCheckData.filter(x => !this.batch_tactics.includes(x)) : [...this.adManageHasCheckData, ...this.batch_tactics]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.batch_tactics_isAll = !this.batch_tactics_isAll
      },
      /**
       * [batchTacticsChange 扣量策略 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      batchTacticsChange(data) {
        let dataAll = [...data].filter(item => this.batch_tactics.indexOf(item) > -1)

        this.batch_tactics_isAll = dataAll.length === this.batch_tactics.length
      },
      /**
       * [SDKPlatformSelectAll  sdk接入相关 选择全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      SDKPlatformSelectAll() {
        let resultArr = this.SDK_platform_isAll ? this.adManageHasCheckData.filter(x => !this.SDK_platform.includes(x)) : [...this.adManageHasCheckData, ...this.SDK_platform]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.SDK_platform_isAll = !this.SDK_platform_isAll
      },
      /**
       * [SDKPlatformChange sdk接入相关 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      SDKPlatformChange(data) {
        let dataAll = [...data].filter(item => this.SDK_platform.indexOf(item) > -1)

        this.SDK_platform_isAll = dataAll.length === this.SDK_platform.length
      },

      /**
       * [productNameSelectAll  产品名称 选择全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      productNameSelectAll() {
        let resultArr = this.product_name_isAll ? this.adManageHasCheckData.filter(x => !this.product_name.includes(x)) : [...this.adManageHasCheckData, ...this.product_name]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.product_name_isAll = !this.product_name_isAll
      },
      /**
       * [productNameChange 产品名称 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      productNameChange(data) {
        let dataAll = [...data].filter(item => this.product_name.indexOf(item) > -1)

        this.product_name_isAll = dataAll.length === this.product_name.length
      },

      /**
       * [productInformationSelectAll  产品信息 全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      productInformationSelectAll() {
        let resultArr = this.product_information_isAll ? this.adManageHasCheckData.filter(x => !this.product_information.includes(x)) : [...this.adManageHasCheckData, ...this.product_information]

        this.adManageHasCheckData = [...new Set(resultArr)]
        this.product_information_isAll = !this.product_information_isAll
      },
      /**
       * [productInformationChange 产品信息 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      productInformationChange(data) {
        let dataAll = [...data].filter(item => this.product_information.indexOf(item) > -1)

        this.product_information_isAll = dataAll.length === this.product_information.length
      },
      // 流量表格的删除
      trafficToggle (event, name) {
        const index = this.adManageHasCheckData.indexOf(name)
        this.adManageHasCheckData.splice(index, 1)
      },
      /**
       * [submitData 数据确定]
       * @return {[type]} [description]
       */
      submitData() {
        this.drawerModalFlag = false
        localSave(this.$route.name.toUpperCase(), this.adManageHasCheckData.length ? this.adManageHasCheckData.toString() : null)
        this.$emit('on-change')
      }
    },
    created() {
      this.getDspProductList()
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .drawer-footer {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    border 0px
  }
</style>
