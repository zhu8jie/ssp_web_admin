<template>
    <div class="page-main">
        <Card :bordered="false" dis-hover>
            <div class="page-title clearfix">
                <h2>{{headTitle}}</h2>
                <div class="is-handler">
                    <Button v-if="_isShow_('newAddSpend')" icon="ios-add" type="primary" @click="toggleFormDraw()">新建修正</Button>
                </div>
            </div>
            <div class="search-line">
                <DatePicker v-model="filterSearch.createDate" :options="spendOptions" :transfer="true" format="yyyy-MM-dd" type="daterange" placeholder="操作日期" class="i-margin-right-11 i-width-date"></DatePicker>
                <DatePicker v-model="filterSearch.handleDate" :options="spendOptions" :transfer="true" format="yyyy-MM-dd" type="daterange" placeholder="成本产生日期" class="i-margin-right-11 i-width-input"></DatePicker>
                <Select 
                    class="i-margin-right-11 i-width-select"
                    filterable
                    clearable
                    v-model="filterSearch.ud_id"
                    placeholder="媒体简称/ID"
                    :max-tag-count="1"
                    :max-tag-placeholder="limitText"
                >
                    <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
                </Select>

                <Select
                    class="i-margin-right-11 i-width-select i-select-remote"
                    v-model="filterSearch.app_id"
                    filterable
                    clearable
                    :remote-method="searchSspApp"
                    :loading="sspAppLoad"
                     @on-change="clearSearchSspApp"
                    :on-query-change="sspAppQueryChange"
                    :transfer="true"
                    placeholder="应用名称/ID"
                >
                    <Option v-for="item in sspAppList" :value="item.app_id" :key="item.app_id">{{item.app_name}} (ID:{{item.app_id}})</Option>
                </Select>

                <Select
                    class="i-margin-right-11 i-width-select i-select-remote"
                    v-model="filterSearch.ssp_slot_id"
                    filterable
                    clearable
                    :remote-method="searchSspSlot"
                    :loading="sspSlotLoad"
                    @on-change="clearSearchSspSlot"
                    :on-query-change="sspSlotQueryChange"
                    :transfer="true"
                    placeholder="广告位名称/ID"
                >
                    <Option v-for="item in sspSlotList" :value="item.ssp_slot_id" :key="item.ssp_slot_id">{{item.ssp_slot_name}} (ID:{{item.ssp_slot_id}})</Option>
                </Select>

                <Button type="primary" @click="doFilterList">查询</Button>
            </div>
            <div class="console-table">
                <Table highlight-row stripe border :columns="spendColumns" :data="spendDataList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
                    <!--广告位名称/ID-->
                    <template slot-scope="{ row }" slot="ssp_slot_id">
                        <p class="name-row-ellipsis" :title="row.ssp_slot_name">{{row.ssp_slot_name}}</p>
                        <p class="tip-row-line"> ID:{{ row.ssp_slot_id }}</p>
                    </template>
                     <!--应用名称/ID-->
                    <template slot-scope="{ row }" slot="app_id">
                        <p class="name-row-ellipsis" :title="row.app_name">{{row.app_name}}</p>
                        <p class="tip-row-line">ID: {{ row.app_id }}</p>
                    </template>
                    <!--应用平台-->
                    <template slot-scope="{ row }" slot="os_type">
                        {{row.os_type}}
                    </template>
                    <!--媒体名称/ID-->
                    <template slot-scope="{ row }" slot="ud_id">
                        <p class="name-row-ellipsis" :title="row.company_short_name">{{ row.company_short_name }}</p>
                        <p class="tip-row-line">ID: {{ row.ud_id }}</p>
                    </template>
                    <!--成本（支出）-->
                    <template slot-scope="{ row }" slot="spend">
                        <span>{{ row.spend }}</span>
                    </template>
                    <!--成本产生日期-->
                    <template slot-scope="{ row }" slot="date">
                        <span>{{ row.date | timeFormat('yyyy-MM-dd') }}</span>
                    </template>
                    <!--修正后成本-->
                    <template slot-scope="{ row }" slot="change_spend">
                        <span>{{ row.change_spend }}</span>
                    </template>
                    <!--操作人-->
                    <template slot-scope="{ row }" slot="user_name">
                        <span>{{ row.user_name }}</span>
                    </template>
                    <!--操作时间-->
                    <template slot-scope="{ row }" slot="created_at">
                        <span>{{ row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</span>
                    </template>
                </Table>
                <div class="page-center">
                    <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
                </div>
            </div>
        </Card>
        <Drawer v-model="setModalFlag" title="新建支出修正" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles">
            <Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="150">
                <FormItem label="选择成本产生日期" prop="date">
                    <DatePicker :options="spendOptions" v-model="modalForm.date" format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" @on-change="spendDateChange"></DatePicker>
                </FormItem>

                <FormItem label="选择媒体">
                    <Select filterable :disabled="!modalForm.date" v-model="modalForm.ud_id" placeholder="媒体简称(ID)" @on-change="companyChange">
                        <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="选择应用">
                    <Select filterable :disabled="!modalForm.date" v-model="modalForm.app_id" placeholder="应用名称(ID)" @on-change="appChange">
                        <Option v-for="item in appNameList" :label="item.app_name" :value="item.app_id" :key="item.app_id">
                             <div class="option-box clearfix" :title="item.app_name">
                                <span class="option-left">{{ item.app_name }}</span>
                                <span class="option-right">{{item.os_type_text}} ID:{{item.app_id}}</span>
                            </div>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="选择广告位" prop="ssp_slot_id">
                    <Select filterable :disabled="!modalForm.date" v-model="modalForm.ssp_slot_id" placeholder="广告位名称(ID)" @on-change="slotChange">
                        <Option v-for="item in slotNameList" :label="item.ssp_slot_name" :value="item.ssp_slot_id" :key="item.ssp_slot_id">
                            <div class="option-box clearfix" :title="item.ssp_slot_name">
                                <span class="option-left">{{ item.ssp_slot_name }}</span>
                                <span class="option-right">ID:{{item.ssp_slot_id}}</span>
                            </div>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="实际成本（支出）">
                    <template v-if="modalForm.ssp_slot_id">
                        {{modalForm.actual_spend}}
                        <Poptip trigger="hover" content="通过保价或者分成得出的成本">
                            <i class="iconfont icon-why" v-if="modalForm.ssp_slot_id"></i>
                        </Poptip>
                    </template>
                </FormItem>
                <FormItem label="上次修正后成本">
                    <template v-if="modalForm.ssp_slot_id">
                        <template v-if="modalForm.last_change_spend >= 0">{{modalForm.last_change_spend}}</template>
                        <template v-else>无</template>
                    </template>
                </FormItem>
                <FormItem label="本次修正后成本" prop="spend">
                    <InputNumber :disabled="!modalForm.date" :max="inputMaxNumber" :step="1" :min="0" v-model="modalForm.spend" placeholder="最多输入两位小数" style="width: 100%"></InputNumber>
                </FormItem>
            </Form>
            <div class="drawer-footer">
                <Button @click="toggleFormDraw()">取消</Button>
                <Button type="primary" :loading="submitClock" @click="submitAddSpend('modalForm')">
                    <span v-if="!submitClock">确定</span>
                    <span v-else>提交中...</span>
                </Button>
            </div>
            <Spin size="large" fix v-if="spinShow"></Spin>
        </Drawer>
    </div>
</template>

<script>
import { showTitle, regNumber, regNum2Precision, inputMaxNumber} from '@/libs/util'
import {commonMixin} from '@/mixin/basic-common-class.js'
import { debounce, throttle, formatDate } from '@/libs/tools'
import { getAppList, getSspSlotAdList } from '@/api/ssp'
import { spendAddChange, spendGetList, spendGetOneDaySpend } from '@/api/data'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
    name: 'spendAmendment',
    mixins: [commonMixin, tableHeight, inPageAccess],
    data() {
        return {
            inputMaxNumber: inputMaxNumber,
            pageSize: 10,
            total_count: 0,
            currentPage: 1,
            noDataText: this.$config.noDataText,

            filterSearch: { // 筛选条件
                handleDate: null,
                createDate: null,
                ud_id: [], //筛选-媒体列表
                app_id: [], // 筛选-应用列表
                ssp_slot_id: [], // 筛选- 广告位
            },
            
            appNameList: [], // 新建-选择应用
            slotNameList: [], // 新建-选择广告位

            spendOptions: { // 创建支出时不可选择的时间范围
                disabledDate(date) {
                    const time = date.getTime()
                    const curTime = new Date().getTime()
                    return time < new Date('2020-09-01 00:00:00').getTime() || time > curTime
                }
            },

            spendColumns: [
                {
                    type: 'index',
                    width: 36,
                    align: 'center'
                },
                {
                    title: '广告位名称/ID',
                    slot: 'ssp_slot_id',
                    minWidth: 200
                }, 
                {
                    title: '应用名称/ID',
                    slot: 'app_id',
                    minWidth: 100
                },
                {
                    title: '应用平台',
                    slot: 'os_type',
                    width: 80
                },
                {
                    title: '媒体名称/ID',
                    slot: 'ud_id',
                    minWidth: 100
                }, 
                {
                    title: '成本(支出)',
                    slot: 'spend',
                    width: 105
                }, 
                {
                    title: '成本产生日期',
                    slot: 'date',
                    width: 125
                }, 
                {
                    title: '修正后成本',
                    slot: 'change_spend',
                    width: 120
                }, 
                {
                    title: '操作人',
                    slot: 'user_name',
                    width: 80
                }, 
                {
                    title: '操作时间',
                    slot: 'created_at',
                    width: 150
                }
            ],
            spendDataList: [], // table数据
            tableLoadFlag: true, // table的loading

            catchSspAppList: [], // 缓存应用名称
            sspAppList: [], // 应用名称
            sspAppLoad: false, // 应用加载中

            catchSspSlotList: [], // 缓存广告位名称
            sspSlotList: [], // 广告位名称
            sspSlotLoad: false, // 广告位加载中

            modalForm: {}, // 修改表单
            modalFormRules: { // 表單正則
                date: [{ required: true, message: '请选择成本产生日期'}],
                ssp_slot_id: [{required: true, message: '请选择广告位'}],
                spend: [
                    { required: true, message: '请填写修正后成本' },
                    { pattern: regNum2Precision, message: '最多输入两位小数'}
                ]
            },
            submitClock: false, // 保存锁
            spinShow: false,
            setModalFlag: false, // 抽屉开关

            drawStyles: { // 抽屉样式
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '54px',
                position: 'static'
            }
        }
    },
    computed: {
        headTitle() {
            return showTitle(this.$route, this)
        }
    },
    filters: {
        timeFormat(time, format) {
            return formatDate(time * 1000, format)
        }
    },
    created() {
        this.spendGetList()

        this.initLinkage() // 初始化联动
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
    },
    methods: {
        /**
         * [initSearchFilter 初始化筛选联动]
         * @return {[type]} [description]
         */
        initLinkage() {
            this.getSspAppList() // 应用列表
            this.getSspSlotList() // 广告位列表
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
         * [doFilterList 筛选查询]
         * @return {[type]} [description]
         */
        doFilterList() {
            this.currentPage = 1
            this.spendGetList()
        },
        /**
         * [spendGetList 获取列表的信息]
         * @return {[type]} [description]
         */
        spendGetList() {
            let filter = this.filterSearch

            this.tableLoadFlag = true

            spendGetList({
                page_size: this.pageSize,
                page_num: this.currentPage,
                start_date: !!filter.handleDate ? formatDate(filter.handleDate[0], 'yyyy-MM-dd') : '',
                end_date: !!filter.handleDate ? formatDate(filter.handleDate[1], 'yyyy-MM-dd') : '',
                created_start_date: !!filter.createDate ? formatDate(filter.createDate[0], 'yyyy-MM-dd') : '',
                created_end_date: !!filter.createDate ? formatDate(filter.createDate[1],  'yyyy-MM-dd') : '',
                ud_id: filter.ud_id,
                app_id: filter.app_id,
                ssp_slot_id: filter.ssp_slot_id
            }).then(res => {
                this.tableLoadFlag = false
                if (res.code === 200) {
                    this.total_count = res.data.total_count
                    this.spendDataList = res.data.list
                }
            }, err=> {
                if (err.code === 403) {
                    this.noDataText = this.$config.noDataTextPer
                }
                this.tableLoadFlag = false
            })
        },
        /**
         * [submitAddSpend 新建/编辑第三方平台账号信息]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        submitAddSpend(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {

                    let params = {
                        date: formatDate(this.modalForm.date, 'yyyy-MM-dd'),
                        ssp_slot_id: this.modalForm.ssp_slot_id,
                        spend: Math.ceil(this.modalForm.spend.toFixed(2) * 100)
                    }

                    // 加入ud_id
                    !!this.modalForm.ud_id && (params.ud_id = this.modalForm.ud_id)

                    // app_id
                    !!this.modalForm.app_id && (params.app_id = this.modalForm.app_id)

                    this.submitClock = true

                    spendAddChange(params).then(res => {

                        this.submitClock = false

                        if (res.code === 200) {
                            this.setModalFlag = false
                            this.$Message.success({ content: '创建成功' , duration: 3})
                            this.spendGetList()
                        } else {
                            this.$Message.error({ content: this.modalForm.id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
                        }
                    }, err=> {
                        this.submitClock = false
                    })
                }
            })
        },

        /**
         * [cancelSubmit form表单 重置]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        toggleFormDraw(name) {
            this.modalForm = {
                date: null,
                ud_id: '',
                app_id: '',
                ssp_slot_id: '',
                actual_spend: '', // 实际成本
                last_change_spend: '', // 上次修正成本
                spend: 0  //本次修正后成本
            }

            this.setModalFlag = !this.setModalFlag
        },

        /**
         * [companyChange form表单，广告位发生变化时]
         * @return {[ud_id]} [媒体Id]
         * @return {[type]} [description]
         */
        async companyChange(ud_id) {
            // 媒体id变更后，获取媒体列表， 并且清空媒体选中数据和广告位选中数据
            this.spinShow = true

            const res = await getAppList({ ud_id: [ud_id], page_num: 1})

            this.spinShow = false

            if(res.code === 200) {
                
                // 重置
                this.modalForm.app_id = '';
                this.modalForm.ssp_slot_id = '';
                this.slotNameList = []

                this.appNameList = res.data.list
            }
        },
        /**
         * [appChange form表单，app_id发生变化]
         * @param  {[type]} app_id [description]
         * @return {[type]}        [description]
         */
        async appChange(app_id) {
            if(!app_id) {
                return
            }

            this.spinShow = true

            const res = await getSspSlotAdList({app_id_arr: [app_id], page_size: 10000, page_num: 1})

            this.spinShow = false

            if (res.code === 200) {
                // 重置
                this.modalForm.ssp_slot_id = '';

                this.slotNameList = res.data.list
            }
        },
        /**
         * [slotChange 广告位变化时，获取成本]
         * @param  {[type]} slot_id [description]
         * @return {[type]}         [description]
         */
        async slotChange() {
            if(!this.modalForm.date || !this.modalForm.ssp_slot_id) {
                return
            }
            
            this.spinShow = true

            const res = await spendGetOneDaySpend({
                date: formatDate(this.modalForm.date, 'yyyy-MM-dd'),
                ssp_slot_id: this.modalForm.ssp_slot_id
            })

            this.spinShow = false

            if(res.code === 200) {
                this.modalForm.actual_spend = res.data.spend;
                this.modalForm.last_change_spend = res.data.last_change_spend;
            }
        },
        /**
         * [spendDateChange 选择成本产生日期]
         * @return {[type]} [description]
         */
        spendDateChange(){
            this.slotChange()
        },
        /**
         * [changePage 修改页码]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        changePage(val) {
            this.currentPage = val
            this.spendGetList()
        },
        /**
         * [sizeChange 切换每页条数时的回调]
         * @param  {[type]} size [description]
         * @return {[type]}      [description]
         */
        sizeChange(size) {
            this.pageSize = size;
            this.spendGetList()
        },


        /********************************************
        *↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
        ********************************************/
        /**
         * [searchSspApp 应用搜索]
         * @param  {[type]} query [description]
         * @return {[type]}       [description]
         */
        searchSspApp(query) {
            this.sspAppLoad = true
            this.getSspAppList(query)
        },
        /**
         * [clearSearchSspApp 清空应用]
         * @return {[type]} [description]
         */
        clearSearchSspApp(arr) {
            if (!arr || arr.length === 0) {
                this.sspAppList = [...this.catchSspAppList]
            }
        },
        /**
         * [sspAppQueryChange 应用-搜索词发生变化时]
         * @param  {[type]} query [description]
         * @return {[type]}       [description]
         */
        sspAppQueryChange(query) {
            if(!query) {
                this.sspAppList = [...this.catchSspAppList]
            }
        },
        /**
         * [getSspAppList 应用列表-防抖]
         * @param  {[type]} query [description]
         * @return {[type]}       [description]
         */
        getSspAppList: debounce(function(query) {
            let _params = {
                page_size: !!query ? 10000 : 10,
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
         * @return {[type]}       [description]
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
            if (!arr || arr.length === 0) {
                this.sspSlotList = [...this.catchSspSlotList]
            }
        },
        /**
         * [sspSlotQueryChange 广告位-搜索词发生变化时]
         * @param  {[type]} query [description]
         * @return {[type]}       [description]
         */
        sspSlotQueryChange(query) {
            if(!query) {
                this.sspSlotList = [...this.catchSspSlotList]
            }
        },
        /**
         * [getSspSlotList 广告位列表-防抖]
         * @param  {[type]} query [description]
         * @return {[type]}       [description]
         */
        getSspSlotList: debounce(function(query) {
            let _params = {
                page_size: !!query ? 10000 : 10,
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
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.option-box
    .option-left
        text-overflow: ellipsis
        white-space: nowrap
        height: 20px
        line-height: 20px
        overflow: hidden
        float: left
        width: 180px
    .option-right
        float: right
        color: #ccc
        height: 20px
        line-height: 20px
</style>
