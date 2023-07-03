<template>
    <div class="page-main">
        <Card :bordered="false" dis-hover>
            <div class="page-title clearfix">
                <h2>{{headTitle}}</h2>
                <div class="is-handler">
                    <Button v-if="_isShow_('newAndEdit')" icon="ios-add" type="primary" @click="doCreate()">新建标签</Button>
                </div>
            </div>
            <div class="search-line">
                <Input class="i-margin-right-11 i-width-select" clearable v-model.trim="filterSearch.name_or_code" placeholder="请输入标签名称或code"/>

                <Button type="primary" @click="doFilterList">查询</Button>
            </div>
            <div class="console-table">
                <Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
                    <!--标签code-->
                    <template slot-scope="{ row }" slot="code">
                        {{row.code}}
                    </template>
                    <!-- 标签名称 -->
                    <template slot-scope="{ row }" slot="name">
                        <p class="name-row-ellipsis" :title="row.name">{{row.name}}</p>
                    </template>
                    <!--操作-->
                    <template slot-scope="{ row, index }" slot="action">
                        <Button type="text" v-if="_isShow_('newAndEdit')" @click="doCreate(row)">修改</Button>
                    </template>
                </Table>
                <div class="page-center">
                    <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
                </div>
            </div>
        </Card>
        <Drawer v-model="drawerFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.code ? '新建标签' : '修改标签'">
            <Form ref="modalForm" label-position="right" :model="modalForm" :rules="ruleBase" :label-width="100">
                <FormItem label="标签code" prop="code">
                    <Input :disabled="modalForm.isEdit" :maxlength="50" show-word-limit v-model.trim="modalForm.code" placeholder="只允许录入数字、英文和下划线"/>
                </FormItem>
                <FormItem label="标签名称" prop="name">
                    <Input :maxlength="30" show-word-limit v-model.trim="modalForm.name" placeholder="请输入标签名称"/>
                </FormItem>
            </Form>
            <div class="drawer-footer">
                <Button @click="drawerFlag = false">取消</Button>
                <Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
                    {{!submitClock ? '提交' : '提交中...'}}
                </Button>
            </div>
        </Drawer>
    </div>
</template>

<script>
import { showTitle, regNumString } from '@/libs/util'
import { getCrowdColumn } from '../columns'
import { crowdTagAdd, crowdTagMod, getCrowdTagList } from '@/api/tag'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
    name: 'product-manage',
    mixins: [tableHeight, inPageAccess],
    data() {
        /**
         * [validateCode 正则DealID  不能输入中文，特殊符号]
         * @param  {[type]}   rule     [description]
         * @param  {[type]}   value    [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        const validateCode = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入标签code'))
            } else if (!regNumString.test(value)) {
                callback(new Error('标签code只支持数字、英文、下划线'))
            } else {
                callback()
            }
        }
        return {
            pageSize: 10,
            total_count: 0,
            currentPage: 1,
            noDataText: this.$config.noDataText,

            // 搜索条件
            filterSearch: {
                name_or_code: '' // 搜索内容
            },

            tableColList: getCrowdColumn(this), // 列
            colDatList: [], // 公司列表
            tableLoadFlag: true, // table的loading

            drawerFlag: false, // 抽屉开关
            modalForm: {}, // 提交表单
            ruleBase: { // form表单正则
                code: [{required: true, validator: validateCode}],
                name: [{required: true, message: '请输入标签名称'}]
            },

            submitClock: false, // 保存锁
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
    created() {
        if (this._hasPageAccess()) {
            this.getCrowdTagList()
        }
    },
    mounted() {
        this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': false}) // search-line的高度
    },
    methods: {
        /**
         * [getCrowdTagList 获取列表的信息]
         * @return {[type]} [description]
         */
        getCrowdTagList() {
            this.tableLoadFlag = true

            let params = {
                ...this.getAxiosParams(),
                ...{
                    page_num: this.currentPage,
                    page_size: this.pageSize
                }
            }

            getCrowdTagList(params).then(res => {
                this.tableLoadFlag = false
                if (res.code === 200) {
                    this.total_count = res.data.total
                    this.colDatList = res.data.list
                }
            }, err=> {
                if (err.code === 403) {
                    this.noDataText = this.$config.noDataTextPer
                }
                this.tableLoadFlag = false
            })
        },
        /**
         * [getAxiosParams 获取列表参数]
         * @return {[type]} [description]
         */
        getAxiosParams() {
            let _filter = this.filterSearch
            let params = {}

            // 产品名称或ID
            !!_filter.name_or_code && (params.name_or_code = _filter.name_or_code) 

            return params
        },
        /**
         * [submitForm 新建/编辑]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        submitForm(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {

                    this.submitClock = true

                    let ProUrl = this.modalForm.isEdit ? crowdTagMod(this.modalForm) : crowdTagAdd(this.modalForm)

                    ProUrl.then(res => {
                        
                        this.submitClock = false

                        if (res.code === 200) {
                            
                            this.drawerFlag = false

                            this.$Message.success({ content: this.modalForm.code ? '修改成功' : '新建成功', duration: 3})
                            
                            this.getCrowdTagList()
                        }
                    }, err=> {
                        this.submitClock = false
                    })
                } else {
                    this.$Message.error({content: this.$config.requiredText, duration: 3})
                }
            })
        },
        /**
         * [doFilterList 筛选媒体列表]
         * @return {[type]} [description]
         */
        doFilterList() {
            this.currentPage = 1
            this.getCrowdTagList()
        },
        /**
         * [changePage 修改页码]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        changePage(val) {
            this.currentPage = val
            this.getCrowdTagList()
        },
        /**
         * [sizeChange 切换每页条数时的回调]
         * @param  {[type]} size [description]
         * @return {[type]}      [description]
         */
        sizeChange(size) {
            this.pageSize = size;
            this.getCrowdTagList()
        },
        /**
         * [toLink 路由跳转]
         * @param  {[type]} el [description]
         * @return {[type]}    [description]
         */
        doCreate(row) {
            if (row && row.code) {
                // 编辑
                this.modalForm = {
                    isEdit: true,
                    code: row.code,
                    name: row.name
                }
            } else {
                this.modalForm = {
                    isEdit: false,
                    code: '',
                    name: ''
                }
            }

            this.$refs['modalForm'].resetFields()

            this.drawerFlag = true
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
