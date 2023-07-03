
<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}</h2>
        <div class="nav-handle-group">
          <slot name="tab"></slot>
        </div>
        <div class="is-handler">
         <Button class="host" type="text" @click="batchSetButton">
			 <icon class="icon icon-setting"/>
			 <span>批量测试不通过</span>
		 </Button>
         <Button class="host" type="text" @click="drawerModalFlag = true">自定义列</Button>
          <Button v-if="_isShow_('download')" class="host" type="text" :loading="submitClock" @click="downStatement">
            <i class="iconfont icon-download"></i>
            <span v-if="!submitClock">下载报表</span>
            <span v-else>下载中...</span>
          </Button>
        </div>
      </div>
      <div class="search-line" ref="search-line">
        <DatePicker
          ref="dd"
          class="i-margin-right-11 i-width-date mar-bot-10"
          :transfer="true"
          type="daterange"
          format="yyyy-MM-dd"
          :options="datePickerOptions"
          :value="datePickerTime"
          @on-change="datePickerChange"
          :clearable="false"
        />
        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          filterable
          v-model="filterSearch.test_plan_ids"
          placeholder="计划名称/ID"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
        >
          <Option v-for="item in planList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
        </Select>
        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          filterable
          v-model="filterSearch.ud_ids"
          placeholder="媒体简称/ID"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
        >
          <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
        </Select>

        <!-- 应用列表 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.app_ids"
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

        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          filterable
          v-model="filterSearch.dsp_company_ids"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="公司/账号名称/ID"
        >
          <Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
        </Select>
        <!-- 产品名称 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.dsp_product_ids"
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

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_id_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>
        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.ssp_slot_name_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

        <Button type="primary" @click="doFilterList">查询</Button>
      </div>

      <div class="data-table console-table">
        <Table
          highlight-row
          stripe
          border
          :loading="tableDayLoadFlag"
          :columns="trafficHourColumns"
          :data="planDayData"
          @on-sort-change="sortChange"
          show-summary
          :summary-method="handleSummary"
          :height="tableHeight"
		  @on-selection-change="selectChange"
        >
          <!-- # index-->
          <template slot-scope="{ row, index }" slot="index">
            {{index + 1}}
          </template>

          <!-- 数据维度 start ******************-->
          <!-- 时间-->
          <template slot-scope="{ row }" slot="date">
            <p class="table_text"> {{ row.date | timeFormat('yyyy-MM-dd') }}</p>
          </template>
          <!--计划 -->
          <template slot-scope="{ row }" slot="plan_name">
            <p v-if="row.plan_name" class="name-row-ellipsis" :title="row.plan_name">{{ row.plan_name }}</p>
            <p class="tip-row-line">ID: {{ row.plan_id }}</p>
          </template>
          <!--广告位名称 -->
          <template slot-scope="{ row }" slot="ssp_slot_name">
			  <div class="control-flex">
				  <div class="control-left" style="width: 75%">
					  <p v-if="row.ssp_slot_name" class="name-row-ellipsis" :title="row.ssp_slot_name">{{ row.ssp_slot_name }}</p>
					  <p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
				  </div>
				  <a class="control-right" target="_blank" :href="'/ssp/ad/manage?sspSlotId=' + row.ssp_slot_id" style="padding-right:8px">
					  <Icon type="md-create"/>
				  </a>
				  <div class="control-right" style="padding-right:5px" @click="logShow(row)">
					  <i class="iconfont icon-rizhi"/>
				  </div>
			  </div>
          </template>
          <!--应用名称 -->
          <template slot-scope="{ row }" slot="app_name">
            <p v-if="row.app_name" class="name-row-ellipsis" :title="row.app_name">{{ row.app_name }}</p>
            <p class="tip-row-line">ID: {{ row.app_id }}</p>
          </template>
          <!--媒体简称 -->
          <template slot-scope="{ row }" slot="ud_name">
            <p v-if="row.ud_name" class="name-row-ellipsis" :title="row.app_name">{{ row.ud_name }}</p>
            <p class="tip-row-line">ID: {{ row.ud_id }}</p>
          </template>
          <!--广告位类型-->
          <template slot-scope="{ row }" slot="ad_type">
            <p class="table_text">{{row.ad_type_text }} -{{row.creative_name}}</p>
          </template>
          <!--公司/账号名称 -->
          <template slot-scope="{ row }" slot="dsp_company_id">
            <p v-if="row.company_name" class="name-row-ellipsis" :title="row.company_name">{{ row.company_name }}</p>
            <p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
          </template>
          <!--产品名称 -->
          <template slot-scope="{ row }" slot="product_name">
            <p v-if="row.product_name" class="name-row-ellipsis" :title="row.product_name">{{ row.product_name }}</p>
            <p class="tip-row-line">ID: {{ row.product_id }}</p>
          </template>
          <!--预算位名称/ID -->
          <template slot-scope="{ row }" slot="dsp_slot_name">
            <div class="control-flex">
              <div class="control-left">
                <p v-if="row.dsp_slot_name" class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
                <p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
              </div>
            </div>
          </template>
          <!--预算方广告位ID-->
          <template slot-scope="{ row }" slot="dsp_slot_code">
            <p v-if="row.dsp_slot_code" class="text-row-ellipsis" :title="row.dsp_slot_code">{{ row.dsp_slot_code}}</p>
            <p v-else>-</p>
          </template>
          <!--测试状态-->
          <template slot-scope="{ row }" slot="test_status">
            <p v-if="row.test_status_text" class="text-row-ellipsis" :title="row.test_status_text">{{ row.test_status_text }}</p>
            <p v-else>-</p>
          </template>

          <!-- 数据维度 end   -------------------->

          <!-- 基本指标 start ******************-->
          <!--有效广告请求pv-->
          <template slot-scope="{ row }" slot="req_pv">
            <p class="table_text">{{row.req_pv}}</p>
          </template>
          <!--有效广告请求uv-->
          <template slot-scope="{ row }" slot="req_uv">
            <p class="table_text">{{row.req_uv}}</p>
          </template>
          <!--广告返回pv-->
          <template slot-scope="{ row }" slot="ret_pv">
            <p class="table_text">{{row.ret_pv}}</p>
          </template>
          <!--广告返回uv-->
          <template slot-scope="{ row }" slot="ret_uv">
            <p class="table_text">{{row.ret_uv}}</p>
          </template>
          <!--广告展现pv-->
          <template slot-scope="{ row }" slot="show_pv">
            <p class="table_text">{{row.show_pv}}</p>
          </template>
          <!--广告展现uv-->
          <template slot-scope="{ row }" slot="show_uv">
            <p class="table_text">{{row.show_uv}}</p>
          </template>
          <!--广告点击pv-->
          <template slot-scope="{ row }" slot="click_pv">
            <p class="table_text">{{row.click_pv}}</p>
          </template>
          <!--广告点击uv-->
          <template slot-scope="{ row }" slot="click_uv">
            <p class="table_text">{{row.click_uv}}</p>
          </template>
          <!--调起数-->
          <template slot-scope="{ row }" slot="dplsucc_pv">
            <p class="table_text">{{row.dplsucc_pv}}</p>
          </template>
          <!-- 下载完成量 -->
          <template slot-scope="{ row }" slot="complete_pv">
            <p class="table_text">{{row.complete_pv}}</p>
          </template>
          <!-- 安装量 -->
          <template slot-scope="{ row }" slot="install_pv">
            <p class="table_text">{{row.install_pv}}</p>
          </template>
          <!-- 激活量 -->
          <template slot-scope="{ row }" slot="activate_pv">
            <p class="table_text">{{row.activate_pv}}</p>
          </template>
          <!-- 基本指标 end ------------------------>

          <!-- 效果指标 start ******************* -->
          <!-- 填充率 -->
          <template slot-scope="{ row }" slot="fill_rates">
            <p class="table_text">{{row.fill_rates}}%</p>
          </template>
          <!-- 展现率 -->
          <template slot-scope="{ row }" slot="show_rates">
            <p class="table_text">{{row.show_rates}}%</p>
          </template>
          <!-- 点击率 -->
          <template slot-scope="{ row }" slot="ctr">
            <p class="table_text">{{row.ctr}}%</p>
          </template>
          <!-- 调起率 -->
          <template slot-scope="{ row }" slot="dplsucc_rates">
            <p class="table_text">{{row.dplsucc_rates}}%</p>
          </template>
          <!-- 下载完成率 -->
          <template slot-scope="{ row }" slot="complete_rates">
            <p class="table_text">{{row.complete_rates}}%</p>
          </template>
          <!-- 安装率 -->
          <template slot-scope="{ row }" slot="install_rates">
            <p class="table_text">{{row.install_rates}}%</p>
          </template>
          <!-- 激活率 -->
          <template slot-scope="{ row }" slot="activate_rates">
            <p class="table_text">{{row.activate_rates}}%</p>
          </template>
          <!-- CPm -->
          <template slot-scope="{ row }" slot="ecpm">
            <p class="table_text">{{row.ecpm}}</p>
          </template>
          <!-- CPC -->
          <template slot-scope="{ row }" slot="cpc">
            <p class="table_text">{{row.cpc}}</p>
          </template>
          <!-- 媒体eCPM -->
          <template slot-scope="{ row }" slot="ecpm_dev">
            <p class="table_text">{{row.ecpm_dev}}</p>
          </template>
          <!-- 媒体CPC -->
          <template slot-scope="{ row }" slot="cpc_dev">
            <p class="table_text">{{row.cpc_dev}}</p>
          </template>
          <!-- 效果指标 end ------------------------>

          <!-- 收益指标 start -------------------------->
          <!-- 成本 -->
          <template slot-scope="{ row }" slot="spend">
            <p class="table_text">{{row.spend}}</p>
          </template>
          <!-- 收益 -->
          <template slot-scope="{ row }" slot="income">
            <p class="table_text">{{row.income}}</p>
          </template>
          <!-- 利润 -->
          <template slot-scope="{ row }" slot="profits">
            <p class="table_text">{{row.profits}}</p>
          </template>
          <!-- 利润率 -->
          <template slot-scope="{ row }" slot="profits_rates">
            <p class="table_text">{{row.profits_rates}}%</p>
          </template>
          <!-- 收益指标 end -------------------------->
        </Table>
        <div class="page-center">
          <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
        </div>
      </div>
      <Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
        <div class="column_content">
          <div class="col_detail">
            <div class="media_table">
              <Row>
                <Col :span="16">
                  <div class="col_title">可选择列</div>
                  <div class="optional_detail">
                    <!-- 流量-数据维度 -->
                    <div class="checkout_content">
                      <div class="check_title">
                        <Checkbox
                          :value="traffic_data_dimension_isAll"
                          @click.prevent.native="trafficDataDimSelectAll">数据维度</Checkbox>
                      </div>
                      <CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficDataDimChange">
                        <Checkbox class="option_check" v-for="item in traffic_data_dimension" :key="item" :label="item">
                          <span>{{item}}</span>
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                    <!-- 流量-基本指标 -->
                    <div class="checkout_content" v-show="traffic_basic_indicators.length > 0">
                      <div class="check_title">
                        <Checkbox
                          :value="traffic_basic_indicators_isAll"
                          @click.prevent.native="trafficBasicIndiSelectAll">基本指标</Checkbox>
                      </div>
                      <CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficBasicIndiChange">
                        <Checkbox class="option_check" v-for="item in traffic_basic_indicators" :key="item" :label="item">
                          <span>{{item}}</span>
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                    <!-- 流量-效果指标 -->
                    <div class="checkout_content" v-show="traffic_effect_indicators.length > 0">
                      <div class="check_title">
                        <Checkbox
                          :value="traffic_effect_indicators_isAll"
                          @click.prevent.native="trafficEffectIndiSelectAll">效果指标</Checkbox>
                      </div>
                      <CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficEffectIndiChange">
                        <Checkbox class="option_check" v-for="item in traffic_effect_indicators" :key="item" :label="item">
                          <span>{{item}}</span>
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                    <!-- 流量-收益指标 -->
                    <div class="checkout_content" v-show="traffic_income_indicators.length > 0">
                      <div class="check_title">
                        <Checkbox
                          :value="traffic_income_indicators_isAll"
                          @click.prevent.native="trafficIncomeIndiSelectAll">收益指标</Checkbox>
                      </div>
                      <CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficIncomeIndiChange">
                        <Checkbox class="option_check" v-for="item in traffic_income_indicators" :key="item" :label="item">
                          <span>{{item}}</span>
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                  </div>
                </Col>
                <Col :span="8">
                  <div class="col_title">已选择列</div>
                  <div class="select_con">
                    <Tag v-for="item in trafficHasCheckData" :key="item" :name="item" closable @on-close="trafficToggle">{{item}}</Tag>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <Button @click="drawerModalFlag = false">取消</Button>
          <Button type="primary" :loading="submitClock" @click="submitData()">
            <span v-if="!submitClock">提交</span>
            <span v-else>提交中...</span>
          </Button>
        </div>
      </Drawer>

		<Drawer v-model="batchModalFlag" title="批量测试不通过"
				:mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500"
				:styles="drawStyles">
			<Form ref="batchForm" :model="batchForm" :rules="batchFormRules">
				<div class="batch_title" style="margin-bottom: 10px">
					<div>
						<p style="color: red">仅没有配置预算位且此刻没有创建测试计划的广告位，可执行此操作，请提前确认，否则无法修改</p>
						<p style="color: red">广告位改为测试不通过状态，系统会自动取消广告位关联的所有的预算位；</p>
						<p>如果确认不通过，请输入原因：</p>
					</div>

				</div>
				<FormItem label="" prop="reason">
					<Input v-model.trim="batchForm.reason" show-word-limit maxlength="50" type="textarea" :rows="6"
						   placeholder="请输入原因，不超过50字，必填"/>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="batchModalFlag=false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="trueBatch('batchForm')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
		<!-- 操作日志 -->
		<operationLog v-model="logModal" :ids="log_id"></operationLog>
    </Card>
  </div>
</template>

<script>
  import {showTitle, dataType, filterBatchQuery} from '@/libs/util'
  import { debounce, throttle, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
  import {getDownLoadXls, setTableHeadApi, tableInfoApi} from '@/api/common'
  import {getAppList, submitOperateStatus} from '@/api/ssp'
  import { getPlanList } from '@/api/plan'
  import { getTestPlanList, getTestPlanListUrl } from '@/api/data'
  import { getDspProductList } from '@/api/dsp'
  import { commonMixin } from '@/mixin/basic-common-class.js'
  import { tableHeight } from '@/mixin/calc-table-height.js'
  import { customColumn } from '../custom-column.js'
  import { inPageAccess } from '@/mixin/in-page-access.js'
  import {mapActions} from 'vuex'
  import operationLog from '@/components/operation-log/index.vue'

  export default {
    name: 'ssp-plan-day-data',
    mixins: [tableHeight, customColumn, inPageAccess, commonMixin],
	components: {operationLog},
    data() {
      return {
      	logModal: false,
		log_id: 0,
        // 搜索联动使用
        catchSspAppList: [], // 缓存应用列表，在清空媒体下拉时重新赋值
        sspAppList: [], // 媒体列表
        sspAppLoad: false, // 媒体列表加载中

        productLoad: false, // 产品列表的加载
        productList: [],
        catchProductList: [],

        pageSize: 10, // 默认10条
        total_count: 0,
        currentPage: 1,
        planList: [], // 计划的列表

        datePickerOptions: { // 时间容器，禁止选择时间
          disabledDate(date) {
            let disableData = Date.parse(new Date('2020-09-01 00:00:00'))
            return date.valueOf() >= Date.now() || date.valueOf() < disableData
          }
        },
        filterTime: null, // 时间选择器
        datePickerTime: null, // 时间选择器
        filterSearch: { // 筛选条件
          ud_ids: [], // 媒体ID
          test_plan_ids: [], // 计划ID
          app_ids: [], // 应用的ID
          dsp_company_ids: [], // 预算方公司ID
          dsp_product_ids: [], // 预算方产品ID
          ssp_slot_ids: [], // 广告位ID批量修改
          ssp_slot_names: [], // 广告位名称批量修改
          start_date: null,
          end_date: null,
          order: null,
          ssp_slot_id_textarea: null, // 广告位ID多个
          ssp_slot_name_textarea: null // 广告位名称批量查询
        },

        dspCompanyList: [], // 预算位公司账号

        sspSlotLoad: false, // 广告位加载中
        planDayData: [], // 表格数据
        planDayDataStatics: [], // 表格数据合计
        trafficHourColumns: [], // 表格 - columns
        trafficHourSourceColumns: [], //  子表格 - columns

        tableDayLoadFlag: true,

        drawerModalFlag: false, // 抽屉开关
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '54px',
          position: 'static'
        },

        // 抽屉 - 自定义
        traffic_data_dimension_isAll: false, // 流量-数据维度是否全选
        traffic_basic_indicators_isAll: false, // 流量-基本指标是否全选
        traffic_effect_indicators_isAll: false, // 流量-效果指标是否全选
        traffic_income_indicators_isAll: false, // 流量-收益指标是否全选

        submitClock: false,
        flowArr: [], // 流量
		selectID: [], // 批量设置的选中的ID
		batchModalFlag: false,
		batchForm: {
        	reason: '' // 批量的原因
		},
		batchFormRules: {
			reason: [{required: true, message: '请输入原因'}]
		}
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      },
      osType() { // 应用平台
        return this.$store.getters.osType
      },
      adSceneData() { // 广告位类型 - 格式化
        let adStyleData = this.$store.state.app.adStyleData
        let adSceneData = this.$store.state.app.adSceneData
        adSceneData.map(item => {
          let children = []
          adStyleData.map(child => {
            if (child.parentId === item.id) {
              children.push({
                label: child.title,
                value: child.id
              })
            }
          })

          item['label'] = item.title
          item['children'] = children
        })
        return adSceneData
      }
    },
    created() {
      if (this._hasPageAccess()) {

        if (!this.$store.getters.getUserAllFields) {
          this.getReportTitle()
        }

        this.initLinkage() // 初始化联动
        this._tableInfoApi() // 获取抽屉 表头
      }
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true}) // search-line的高度
    },
    filters: {
      timeFormat(time, format) {
        return formatDate(time * 1000, format)
      }
    },
    methods: {
      ...mapActions([
        'getDspCompanyList',
        'tableInfoApi',
        'setTableHeadApi',
        'setTablePageApi'
      ]),
      /**
       * [initSearchFilter 初始化筛选联动]
       * @return {[type]} [description]
       */
      initLinkage() {
        this.initDatePickerTime() // 初始化筛选时间
        this._getDspCompanyList() // 预算方-公司名称
        this.getSspAppList()
        this.getProductList()
        this.getPlanListApi()
      },
		/**
		 * [logShow 点击显示操作日志]
		 * @return {[type]} [description]
		 */
		logShow(row) {
			this.logModal = true
			this.log_id = row.ssp_slot_id
		},
		/**
		 * [selChange 获取选中的值]
		 * @param  {[type]} item [description]
		 * @return {[type]}     [description]
		 */
		selectChange(select) {
			let _arr = []
			select.map(item => {
				_arr.push(item.ssp_slot_id)
			})
			this.selectID = [...new Set(_arr)]
		},
		/**
		 * [batchSetButton 批量设置]
		 * @param  {[type]} item [description]
		 * @return {[type]}     [description]
		 */
		batchSetButton() {
			this.selectID.length > 0 ? this.batchModalFlag = true : this.$Message.warning('请选择广告位')
			this.$refs['batchForm'].resetFields()
			this.batchForm.reason = ''
		},
		/**
		 * [trueBatch 批量操作]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		trueBatch(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {
					let list = []
					let ssp_slot_id_arr = this.selectID
					ssp_slot_id_arr.map(it => {
						let obj = {}
						obj.ssp_slot_id = it
						obj.operate_status = -3
						obj.operate_reason = this.batchForm.reason
						list.push(obj)
					})
					submitOperateStatus({
						list: list
					}).then(res => {
						this.batchModalFlag = false
						if (res.code === 200) {
							this.$Message.success({content: '操作成功', duration: 3})
							this.selectID = []
							this.initGetPlanData() // 刷新列表
						}
					})
				}
			})
		},
      /**
       * [getPlanList 获取列表的信息]
       * @return {[type]} [description]
       */
      getPlanListApi() {
        let params = {page_num: 1, page_size: 0}
        getPlanList(params).then(res => {
          if (res.code === 200) {
              this.planList = res.data.list
          }
        })
      },

      /**
       * [getReportTitle 权限表头]
       * @return {[type]} [description]
       */
      getReportTitle() {
        /**
         * 此处 注意置换
         *
         * 因早期开发 是按照 流量表格设置（flowDataList） +  预算表格设置 （budgetDataList） 的顺序
         * 后续因为调整 要两个表格调换顺序 导致   getUserDspFields <=> getUserSspFields 互换
         */
        let flowFields = this.$store.getters.getUserDspFields // 流量权限
        let flowList = this.$store.state.app.flowDataList // 流量全部表
        // 流量
        let flowArr = []
        flowList.map(item => {
          if (flowFields.includes(item.key)) {
            flowArr.push(item.label)
          }
        })
        this.flowArr = flowArr

        // 流量
        this.traffic_basic_indicators = this.traffic_basic_indicators.filter(item => flowArr.indexOf(item) > -1)
        this.traffic_effect_indicators = this.traffic_effect_indicators.filter(item => flowArr.indexOf(item) > -1)
        this.traffic_income_indicators = this.traffic_income_indicators.filter(item => flowArr.indexOf(item) > -1)
        let allFlow = flowArr.concat(this.traffic_data_dimension)
        this.trafficHasCheckData = this.trafficHasCheckData.filter(item => allFlow.indexOf(item) > -1)
      },
      /**
       * [doFilterList 筛选查询]
       * @return {[type]} [description]
       */
      doFilterList() {
        this.currentPage = 1

        let _filter = this.filterSearch

        // 此处有容处理
        // 广告位ID查询
        // 1. 广告位Id多选和单选，最后统一按照 ssp_slot_id 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_select 两个筛选条件）
        _filter.ssp_slot_ids = filterBatchQuery({
          value: _filter.ssp_slot_id_textarea,
          type: 'number'
        })

        // 广告位名称
        _filter.ssp_slot_names = filterBatchQuery({
          value: _filter.ssp_slot_name_textarea
        })

        this.initGetPlanData()
      },

      /**
       * [changePage 改变页码]
       * @param  {[type]} val [description]
       * @return {[type]}	 [description]
       */
      changePage(val) {
        this.currentPage = val
        this.initGetPlanData()
      },

      /**
       * [sizeChange 切换每页条数时的回调]
       * @param  {[type]} size [description]
       * @return {[type]}	  [description]
       */
      sizeChange(size) {
        this.currentPage = 1
        this.pageSize = size
        this.initGetPlanData()
      },
      /**
       * [initGetPlanListData 获取表格数据]
       * @return {[type]} [description]
       */
      initGetPlanListData() {
        let _filter = this.filterSearch

        let params = {
          ...this.getAxiosParams(),
          ...{
            start_date: _filter.start_date,
            end_date: _filter.end_date,
            order: _filter.order,
            group: ['date', 'ssp_slot_id', 'dsp_slot_id'],
            page_num: this.currentPage,
            page_size: this.pageSize
          }
        }
        getTestPlanList(params).then(curRes => {

          this.tableDayLoadFlag = false

          if (curRes.code === 200) {
            this.total_count = curRes.data.total_count // 总数

            this.planDayData = this.tableDataMatch(curRes.data.list) // 列表
          }
        }, err => {
          this.tableDayLoadFlag = false
        })
      },
      /**
       * [initGetPlanData 获取总计的数据]
       * @return {[type]} [description]
       */
      initGetPlanData() {
        let _filter = this.filterSearch
        this.tableDayLoadFlag = true
        let params = {
          ...this.getAxiosParams(),
          ...{
            start_date: _filter.start_date,
            end_date: _filter.end_date,
            order: _filter.order,
            page_num: 1,
            page_size: this.pageSize
          }
        }
        getTestPlanList(params).then(curRes => {
          if (curRes.code === 200) {
            this.initGetPlanListData()
            this.planDayDataStatics = this.tableDataMatch(curRes.data.list) // 合计
          } else {
            this.tableDayLoadFlag = false
          }
        }, error => {
          this.tableDayLoadFlag = false
        })
      },
      /**
       * [getAxiosParams 获取下载和列表的url参数]
       * @return {[type]} [description]
       */
      getAxiosParams() {

        let _filter = this.filterSearch

        let params = {}
        params.data_type = 1

        // 计划名称/ID
        !!_filter.test_plan_ids.length && (params.test_plan_ids = _filter.test_plan_ids)

        // 媒体名称/ID
        !!_filter.ud_ids.length && (params.ud_ids = _filter.ud_ids)

        // 应用名称/ID
        !!_filter.app_ids.length && (params.app_ids = _filter.app_ids)

        // 预算方公司ID
        !!_filter.dsp_company_ids.length && (params.dsp_company_ids = _filter.dsp_company_ids)

        // 预算方产品ID
        !!_filter.dsp_product_ids.length && (params.dsp_product_ids = _filter.dsp_product_ids)

        // 广告位ID
        !!_filter.ssp_slot_ids.length && (params.ssp_slot_ids = _filter.ssp_slot_ids)

        // 广告位名称
        !!_filter.ssp_slot_names.length && (params.ssp_slot_names = _filter.ssp_slot_names)

        return params
      },

      /**
       * [tableDataMatch 当前数据和前一小时的数据匹配]
       * @param  {[type]} curArr [description]
       * @param  {[type]} preArr [description]
       * @param  {[type]} group [作为聚合条件]
       * @return {[type]}		[description]
       */
      tableDataMatch(curArr) {
        // 需要计算千分位的数据
        let _calcArr = []
        this.trafficHourColumns.map(item => {
          if (!item.noNeedCalcThou) {
            _calcArr.push(item.slot)
          }
        })

        // 耦合前一小时的数据
        let tempArr = []
        curArr.map(item => {
          for (let key in item) {
            if (_calcArr.includes(key) && dataType(item[key]) === 'number') {
              item[key] = this.number2Thousand(item[key])
            }
          }
          tempArr.push(item)
        })
        return tempArr
      },

      /**
       * [datePickerChange 时间选择器发生变化]
       * @param  {[type]} time [description]
       * @return {[type]}	  [description]
       */
      datePickerChange(e) {
        let start = new Date(e[0]).getTime()
        let end = new Date(e[1]).getTime()
        if (end - start > 2678400000) {
          this.$Message.error('选择日期不能超过31天')
          this.getTimeData()
        } else {
          this.filterSearch.start_date = e[0]
          this.filterSearch.end_date = e[1]
        }
      },
      /**
       * [initDatePickerTime 设置时间的默认值]
       * @param  {[type]} time [description]
       * @return {[type]}	  [description]
       */
      initDatePickerTime() {
        let curTime = new Date()
        let endTime = formatDate(curTime, 'yyyy-MM-dd')
        let startTime = formatDate(curTime.getTime() - 3600 * 1000 * 24 * 7, 'yyyy-MM-dd')

        this.datePickerTime = [startTime, endTime]
        this.filterSearch.end_date = endTime
        this.filterSearch.start_date = startTime
      },
      /**
       * [adTypeText 获取广告场景]
       * @param  {[type]} id [id=>text]
       * @return {[type]}	[description]
       */
      adTypeText(id) {
        let _arr = this.$store.state.app.adSceneData
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },

      /**
       * [creativeId2Text 根据createId 找到对应 text]
       * @param  {[type]} id [description]
       * @return {[type]}	[description]
       */
      creativeId2Text(id) {
        let _arr = this.$store.state.app.adStyleData
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },

      /**
       * [getParentColumns 设置父级 数据表格的列]
       * @return {[type]} [description]
       */
      getParentColumns () {
        const ColumnList = [
          {title: '#', width: 36, key: 'index', slot: 'index', align: 'center', noNeedCalcThou: true},
		  {type: 'selection', width: 50, align: 'center', title: '', isHideInColumn: true, noNeedCalcThou: true},

          // 数据维度
          {title: '日期', slot: 'date', key: 'date', minWidth: 100, sortable: 'custom', noNeedCalcThou: true},
          {title: '计划名称', slot: 'plan_name', header: '计划名称/ID', key: 'plan_name', minWidth: 210, noNeedCalcThou: true},
          {title: '广告位名称', slot: 'ssp_slot_name', header: '广告位名称/ID', key: 'ssp_slot_name', minWidth: 200, noNeedCalcThou: true},
          {title: '应用名称', key: 'app_name', header: '应用名称/ID', slot: 'app_name', minWidth: 120, noNeedCalcThou: true},
          {title: '媒体简称', key: 'ud_name', header: '媒体简称/ID', slot: 'ud_name', minWidth: 100, noNeedCalcThou: true},
          {title: '广告位类型', slot: 'ad_type', key: 'ad_type', minWidth: 150, noNeedCalcThou: true},
          {title: '公司/账号名称', header: '公司/账号名称/ID', slot: 'dsp_company_id', key: 'dsp_company_id', minWidth: 130, noNeedCalcThou: true},
          {title: '产品名称', header: '产品名称/ID', slot: 'product_name', key: 'product_name', minWidth: 160, noNeedCalcThou: true},
          {title: '预算位名称', header: '预算位名称/ID', slot: 'dsp_slot_name', key: 'dsp_slot_name', minWidth: 200, noNeedCalcThou: true},
          {title: '预算方广告位ID', slot: 'dsp_slot_code', key: 'dsp_slot_code', minWidth: 120, noNeedCalcThou: true},
          {title: '测试状态', slot: 'test_status', key: 'test_status', minWidth: 90, noNeedCalcThou: true},

          // 基本指标
          {title: '有效广告请求pv', slot: 'req_pv', key: 'req_pv', minWidth: 130, sortable: 'custom'},
          {title: '有效广告请求uv', slot: 'req_uv', key: 'req_uv', minWidth: 130, sortable: 'custom'},
          {title: '广告返回pv', slot: 'ret_pv', key: 'ret_pv', minWidth: 130, sortable: 'custom'},
          {title: '广告返回uv', slot: 'ret_uv', key: 'ret_uv', minWidth: 130, sortable: 'custom'},
          {title: '广告展现pv', slot: 'show_pv', key: 'show_pv', minWidth: 130, sortable: 'custom'},
          {title: '广告展现uv', slot: 'show_uv', key: 'show_uv', minWidth: 130, sortable: 'custom'},
          {title: '广告点击pv', slot: 'click_pv', key: 'click_pv', minWidth: 130, sortable: 'custom'},
          {title: '广告点击uv', slot: 'click_uv', key: 'click_uv', minWidth: 130, sortable: 'custom'},
          {title: '调起数', slot: 'dplsucc_pv', key: 'dplsucc_pv', minWidth: 130, sortable: 'custom'},
          {title: '下载完成量', slot: 'complete_pv', key: 'complete_pv', minWidth: 130, sortable: 'custom'},
          {title: '安装量', slot: 'install_pv', key: 'install_pv', minWidth: 130, sortable: 'custom'},
          {title: '激活量', slot: 'activate_pv', key: 'activate_pv', minWidth: 130, sortable: 'custom'},

          // 效果指标
          {title: '填充率', slot: 'fill_rates', key: 'fill_rates', minWidth: 100, sortable: 'custom'},
          {title: '展现率', slot: 'show_rates', key: 'show_rates', minWidth: 100, sortable: 'custom'},
          {title: '点击率', slot: 'ctr', key: 'ctr', minWidth: 100, sortable: 'custom'},
          {title: '调起率', slot: 'dplsucc_rates', key: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
          {title: '下载完成率', slot: 'complete_rates', key: 'complete_rates', minWidth: 130, sortable: 'custom'},
          {title: '安装率', slot: 'install_rates', key: 'install_rates', minWidth: 130, sortable: 'custom'},
          {title: '激活率', slot: 'activate_rates', key: 'activate_rates', minWidth: 130, sortable: 'custom'},
          {title: 'eCPM', slot: 'ecpm', key: 'ecpm', minWidth: 100, sortable: 'custom'},
          {title: 'CPC', slot: 'cpc', key: 'cpc', minWidth: 90, sortable: 'custom'},
          {title: '媒体eCPM', slot: 'ecpm_dev', key: 'ecpm_dev', minWidth: 100, sortable: 'custom'},
          {title: '媒体CPC', slot: 'cpc_dev', key: 'cpc_dev', minWidth: 90, sortable: 'custom'},

          // 收益指标
          {title: '收益', key: 'income', slot: 'income', minWidth: 100, sortable: 'custom'},
          {title: '成本', key: 'spend', slot: 'spend', minWidth: 90, sortable: 'custom'},
          {title: '利润', key: 'profits', slot: 'profits', minWidth: 90, sortable: 'custom'},
          {title: '利润率', key: 'profits_rates', slot: 'profits_rates', minWidth: 90, sortable: 'custom'}
        ]

        // 筛选表格
        let resultArr = []
        let extraMust = ['date', 'index'] // 额外必须存在的字段

        ColumnList.map(item => {
          if (item.type === 'selection' || extraMust.includes(item.slot) || this.trafficHasCheckData.indexOf(item.title) > -1) {
            item.title = item.header || item.title
            resultArr.push(item)
          }
        })

        this.trafficHourColumns = resultArr
      },

      /**
       * [handleSummary 合计计算]
       * @param  {[type]} options.columns [description]
       * @param  {[type]} options.data	[description]
       * @return {[type]}				 [description]
       */
      handleSummary({columns, data}) {
        let sumData = this.planDayDataStatics[0]
        let sums = {}
        columns.forEach((column, index) => {
          let key = column.key
          if (key === 'date') {
            sums[key] = {
              key,
              value: '总计'
            }
            return
          }

          sums[key] = {
            key,
            value: column.title.indexOf('率') > -1 ? `${sumData[key]}%` : (!!column.noNeedCalcThou ? '-' : sumData[key])
          }

        })
        return sums
      },

      // 表格的排序
      sortChange(col, key, order) {
        if (col.order === 'asc') {
          this.filterSearch.order = col.column.slot
          this.currentPage = 1
          this.initGetPlanData()
        } else if (col.order === 'desc') {
          this.filterSearch.order = col.column.slot + ' ' + col.order
          this.currentPage = 1
          this.initGetPlanData()
        }
      },

      // 获取广告样式
      creativeIdText(id) {
        let _arr = this.$store.state.app.adStyleData
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [_tableInfoApi 获取媒体公司数据]
       * @return {[type]} [description]
       */
      async _tableInfoApi() {
        let storeUser = this.$store.state.user
        let resArr = storeUser.pageCommonMemory ? storeUser.pageCommonMemory : await this.tableInfoApi()

        // 流量表格 - 设置  -  主要是用来判断是否全选
        if (resArr.table_head_head_15) {
          let curArr = resArr.table_head_head_15.split(',')

          // 流量
          if (!this.$store.getters.getUserAllFields) {
            let allFlow = this.flowArr.concat(this.traffic_data_dimension)
            this.trafficHasCheckData = curArr.filter(item => allFlow.indexOf(item) > -1)
          } else {
            this.trafficHasCheckData = curArr
          }
        }

        this.trafficJudgeAll() // 判断流量是否全选

        this.getParentColumns() // 初始化表格数据
        this.tableDayLoadFlag = false
        this.initGetPlanData() // 初始化获取table数据
      },

      /**
       * [trafficJudgeAll 流量判断是否全选]
       * @return {[type]} [description]
       */
      trafficJudgeAll() {
        this.trafficHasCheckData = [...new Set(this.trafficHasCheckData)]

        // 接下来判断维度是否全选
        let data_dimension_arr = [] // 数据维度
        let basic_indicators = [] // 基本指标
        let effect_indicators = [] // 效果指标
        let income_indicators = [] // 收益指标
        this.trafficHasCheckData.map(item => {

          // 流量表格 - 数据维度
          if (this.traffic_data_dimension.indexOf(item) > -1) {
            data_dimension_arr.push(item)
          }

          // 流量表格 - 基本指标
          if (this.traffic_basic_indicators.indexOf(item) > -1) {
            basic_indicators.push(item)
          }

          if (this.traffic_effect_indicators.indexOf(item) > -1) {
            effect_indicators.push(item)
          }

          if (this.traffic_income_indicators.indexOf(item) > -1) {
            income_indicators.push(item)
          }
        })

        this.traffic_data_dimension_isAll = data_dimension_arr.length === this.traffic_data_dimension.length // 流量-数据维度
        this.traffic_basic_indicators_isAll = basic_indicators.length === this.traffic_basic_indicators.length // 流量-基本指标
        this.traffic_effect_indicators_isAll = effect_indicators.length === this.traffic_effect_indicators.length // 流量-效果指标
        this.traffic_income_indicators_isAll = income_indicators.length === this.traffic_income_indicators.length // 流量-收益指标
      },
      /**
       * [trafficDataDimSelectAll 流量表格  数据维度 选择全部]
       * @return {[type]} [description]
       */
      trafficDataDimSelectAll() {
        let resultArr = this.traffic_data_dimension_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_data_dimension.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_data_dimension]

        this.trafficHasCheckData = [...new Set(resultArr)]
        this.traffic_data_dimension_isAll = !this.traffic_data_dimension_isAll
      },
      /**
       * [trafficDataDimChange 流量表格  数据维度 单选]
       * @param  {[type]} data [description]
       * @return {[type]}	  [description]
       */
      trafficDataDimChange(data) {
        let dataAll = [...data].filter(item => this.traffic_data_dimension.indexOf(item) > -1)

        this.traffic_data_dimension_isAll = dataAll.length === this.traffic_data_dimension.length
      },
      /**
       * [trafficBasicIndiSelectAll 流量表格  基本指标 选择全部]
       * @return {[type]} [description]
       */
      trafficBasicIndiSelectAll() {
        let resultArr = this.traffic_basic_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_basic_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_basic_indicators]

        this.trafficHasCheckData = [...new Set(resultArr)]
        this.traffic_basic_indicators_isAll = !this.traffic_basic_indicators_isAll
      },
      /**
       * [trafficBasicIndiChange 流量表格  基本指标 单选]
       * @param  {[type]} data [description]
       * @return {[type]}	  [description]
       */
      trafficBasicIndiChange(data) {
        let dataAll = [...data].filter(item => this.traffic_basic_indicators.indexOf(item) > -1)

        this.traffic_basic_indicators_isAll = dataAll.length === this.traffic_basic_indicators.length
      },
      /**
       * [trafficEffectIndiSelectAll 流量表格  基本指标 选择全部]
       * @return {[type]} [description]
       */
      trafficEffectIndiSelectAll() {
        let resultArr = this.traffic_effect_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_effect_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_effect_indicators]

        this.trafficHasCheckData = [...new Set(resultArr)]
        this.traffic_effect_indicators_isAll = !this.traffic_effect_indicators_isAll
      },
      /**
       * [trafficEffectIndiSelectAll 流量表格  基本指标 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      trafficEffectIndiChange(data) {
        let dataAll = [...data].filter(item => this.traffic_effect_indicators.indexOf(item) > -1)

        this.traffic_effect_indicators_isAll = dataAll.length === this.traffic_effect_indicators.length
      },
      /**
       * [trafficEffectIndiSelectAll 流量表格  收益指标的筛选 选择全部]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      trafficIncomeIndiSelectAll() {
        let resultArr = this.traffic_income_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_income_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_income_indicators]

        this.trafficHasCheckData = [...new Set(resultArr)]
        this.traffic_income_indicators_isAll = !this.traffic_income_indicators_isAll
      },
      /**
       * [trafficEffectIndiSelectAll 流量表格  收益指标的筛选 单选]
       * @param  {[type]} data [description]
       * @return {[type]} [description]
       */
      trafficIncomeIndiChange(data) {
        let dataAll = [...data].filter(item => this.traffic_income_indicators.indexOf(item) > -1)

        this.traffic_income_indicators_isAll = dataAll.length === this.traffic_income_indicators.length
      },
      // 流量表格的删除
      trafficToggle (event, name) {
        const index = this.trafficHasCheckData.indexOf(name)
        this.trafficHasCheckData.splice(index, 1)
      },
      /**
       * [submitData 自定义列表 提交数据, 需要同时提交两个自定义表单]
       * @return {[type]} [description]
       */
      submitData() {
        this.submitClock = true
        this.setTableHeadApi({table_id: 15, select_str: this.trafficHasCheckData.join(',')}).then(() => {
          this.submitClock = false
          this.drawerModalFlag = false

          this.tableInfoApi().then(() => { // 重置一次页面公共记忆
            this._tableInfoApi() // 重新获取数据
          })
        })
      },
      /**
       * [downStatement 下载报表]
       * @return {[type]} [description]
       */
      downStatement() {

        let _filter = this.filterSearch

        let params = {
          ...this.getAxiosParams(),
          ...{
            start_date: _filter.start_date,
            end_date: _filter.end_date,
            page_size: this.total_count,
            group: ['date', 'ssp_slot_id', 'dsp_slot_id'],
            page_num: 1
          }
        }

        let down = {
          method: 'GET',
          url: getTestPlanListUrl(params)
        }

        this.submitClock = true

        getDownLoadXls(down).then(data => {
          if (data.code === 200) {
            let url = data.data.url
            let filename = _filter.start_date + '~' + _filter.end_date + '计划报表天数据.xlsx'
            createObjectURL(url, filename)
          }

          this.submitClock = false
        }, err => {
          this.submitClock = false
        })
      },
      /**
       * [number2Thousand 数字转千分位]
       * @param  {[type]} val [description]
       * @return {[type]}	 [description]
       */
      number2Thousand(number) {
        return number2Thousand(number)
      },
      /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}	   [description]
       */
      limitText (count) {
        return `+ ${count}`
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
        let params = {
          ud_id: this.filterSearch.ud_ids,
          page_size: (!!query || this.filterSearch.ud_ids.length) ? 10000 : 10,
          page_num: 1,
          search_text: query || ''
        }

        getAppList(params).then(res => {
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
       * [_getDspCompanyList 获取预算方公司数据]
       * @return {[type]} [description]
       */
      async _getDspCompanyList(action) {
        let storeUser = this.$store.state.user
        let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList()
        this.dspCompanyList = resArr
      },
      /**
       * [searchProduct 产品搜索]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      searchProduct(query) {
        this.productLoad = true
        this.getProductList(query)
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
       * [getProductList 产品列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}    [description]
       */
      getProductList: debounce(function (query) {
        let _params = {
          dsp_company_id_arr: this.filterSearch.dsp_company_ids,
          page_size: (!!query || this.filterSearch.dsp_company_ids.length) ? 10000 : 10,
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
      }, 1000)
      /********************************************
       *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
       ********************************************/
    },
    watch: {
      'filterSearch.ud_ids': {
        handler: function(val) {
          this.getSspAppList()
        }
      },
      /**
       * 选择预算方
       */
      'filterSearch.dsp_company_ids': {
        handler: function(val) {
          this.getProductList()
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import '../../table.styl'
  /deep/ .data-table
    .ivu-table-tbody
      tr:last-child
        td
          border-bottom 1px solid #e8eaec
  .console-table
    margin-top: 5px
  .mar-bot-10
    vertical-align: top
    margin-bottom: 10px
    /deep/ textarea.ivu-input
      height: 32px
  .text-row-ellipsis
    font-size: 12px
    overflow: hidden
    display: -webkit-box
    -webkit-box-orient: vertical
    -webkit-line-clamp: 2
    word-break: break-word
</style>
