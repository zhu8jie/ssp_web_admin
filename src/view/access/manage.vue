<template>
    <div class="page-main">
        <Card :bordered="false" dis-hover>
            <div class="page-title clearfix">
                <h2>{{headTitle}}</h2>
                <div class="is-handler">
                    <Button v-if="_isShow_('addVersion')" icon="ios-add" type="primary" @click="doCreate()">新建版本</Button>
                </div>
            </div>
            <div class="console-table">
                <Table highlight-row stripe border :columns="accessColumns" :data="accessDataList" :loading="tableLoadFlag" :height="tableHeight" :no-data-text="noDataText">
                    <!--更新日志-->
                    <template slot-scope="{ row }" slot="index">
                        {{ pageSize * (currentPage - 1) + (row._index + 1)}}
                    </template>
                    <!--接入方式-->
                    <template slot-scope="{ row }" slot="access_type">
                        <span v-if="row.access_type === 2">Android-SDK</span>
                        <span v-if="row.access_type === 3">IOS-SDK</span>
                        <span v-if="row.access_type === 1">API</span>
                    </template>
                    <!--更新日志-->
                    <template slot-scope="{ row }" slot="log">
                        <div class="log" v-html="row.log" :title="row.log"></div>
                    </template>
                    <!-- 发布状态 -->
                    <template slot-scope="{ row }" slot="status">
                        <span v-if="row.status === -1">已删除</span>
                        <span v-if="row.status === 1">已发布</span>
                        <span v-if="row.status === 2">待发布</span>

                        <i-switch v-if="row.status === 2 && _isShow_('publish')" size="small" :true-value="1" :false-value="2" v-model="row.status" @on-change="changeState(row)"/>

                        <span class="is-new-icon" v-if="row.is_last">新</span>
                    </template>
                    <!--创建时间-->
                    <template slot-scope="{ row }" slot="created_at">
                        <span>{{ row.created_at }}</span>
                    </template>
                    <!--更新时间-->
                    <template slot-scope="{ row }" slot="updated_at">
                        <span>{{ row.updated_at }}</span>
                    </template>
                    <!--操作-->
                    <template slot-scope="{ row, index }" slot="action">
                        <template v-if="row.status !== -1">
                            <Button v-if="_isShow_('modify')" type="text" @click="doCreate(row)">修改</Button>
                            <Button v-if="row.doc_url" :to="row.doc_url" target="_blank" type="text">下载文档</Button>
                            <Button v-if="row.sdk_url" :to="row.sdk_url" type="text">下载SDK</Button>
                            <Button v-if="_isShow_('delete')" type="text" @click="deleteAccess(row)">删除</Button>
                        </template>
                    </template>
                </Table>
                <div class="page-center">
                    <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
                </div>
            </div>
        </Card>
        <Drawer v-model="setModalFlag" width="600" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建版本' : '编辑版本'">
            <Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="130">
                <FormItem label="接入方式" prop="access_type">
                    <RadioGroup v-model="modalForm.access_type">
                        <Radio :label="2">Android-SDK</Radio>
                        <Radio :label="3">IOS-SDK</Radio>
                        <Radio :label="1">API</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="版本号" prop="version">
                    <Input :maxlength="30" show-word-limit v-model.trim="modalForm.version" placeholder="例如：v1.0"/>
                </FormItem>
                <FormItem label="接入文档上传" prop="doc_url">
                    <div class="down_export" v-if="modalForm.doc_url">
                        <div class="name"><icon class="icon icon-excel" />{{modalForm.doc_name || '接入文档'}}</div>
                        <div class="down">
                            <a class="down" download :href="modalForm.doc_url"><icon class="icon icon-download"/>下载</a>
                        </div>
                        <div class="delete" title="删除" @click="deleteDocFile"><Icon size="16" type="md-close" /></div>
                    </div>
                    <Upload
                        v-if="!modalForm.doc_url"
                        :action= "uploadUrl"
                        type="drag"
                        :show-upload-list="false"
                        :format="['pdf']"
                        :on-format-error="handleFormatError"
                        :before-upload="docHandleBeforeUpload"
                        :max-size="5 * 1024"
                    >
                        <div class="upload-inner">
                            <div class="icon-box">
                                <Icon type="ios-cloud-upload" size="52" style="color: #C0C4CC"></Icon>
                            </div>
                            <div class="upload-txt">
                                <h6>将文件拖到此处，或<span>点击上传</span></h6>
                                <p>仅支持pdf为后缀的文件，大小不超过5M</p>
                            </div>
                        </div>
                    </Upload>
                    <p v-if="!modalForm.doc_url && modalForm.doc_name">{{modalForm.doc_name}}</p>
                </FormItem>
                <FormItem label="SDK包文件上传" v-if="modalForm.access_type === 2 || modalForm.access_type === 3">
                    <div class="down_export" v-if="modalForm.sdk_url">
                        <div class="name"><icon class="icon icon-excel" />{{modalForm.sdk_name || 'SDK包文件'}}</div>
                        <div class="down">
                            <a class="down" download :href="modalForm.sdk_url"><icon class="icon icon-download"/>下载</a>
                        </div>
                        <div class="delete" title="删除" @click="deleteSDKFile"><Icon size="16" type="md-close" /></div>
                    </div>
                    <Upload
                        v-if="!modalForm.sdk_url"
                        :action= "uploadUrl"
                        type="drag"
                        :show-upload-list="false"
                        :format="['zip', 'rar']"
                        :on-format-error="handleFormatError"
                        :before-upload="sdkHandleBeforeUpload"
                        :max-size="30 * 1024"
                    >
                        <div class="upload-inner">
                            <div class="icon-box">
                                <Icon type="ios-cloud-upload" size="52" style="color: #C0C4CC"></Icon>
                            </div>
                            <div class="upload-txt">
                                <h6>将文件拖到此处，或<span>点击上传</span></h6>
                                <p>仅支持zip、rar为后缀的文件，大小不超过30M</p>
                            </div>
                        </div>
                    </Upload>

                    <p v-if="!modalForm.sdk_url && modalForm.sdk_name">{{modalForm.sdk_name}}</p>
                </FormItem>
                <FormItem label="更新日志" prop="log">
                    <Input v-model.trim="modalForm.log" show-word-limit maxlength="500" type="textarea" :rows="6" placeholder="换行即为1条，不超过500字" />
                </FormItem>

            </Form>
            <div class="drawer-footer">
                <Button @click="setModalFlag = false">取消</Button>
                <Button type="primary" :loading="submitClock" @click="submitAccess('modalForm')">
                    <span v-if="!submitClock">提交</span>
                    <span v-else>{{submitTxt}}</span>
                </Button>
            </div>
        </Drawer>
    </div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { formatDate } from '@/libs/tools'
import { docJoinUsSave, docJoinUsList, docJoinUsChangeStatus } from '@/api/access'
import { uploadFile, uploadFileUrl } from '@/api/common'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
    name: 'access-manage',
    mixins: [tableHeight, inPageAccess],
    data() {
        const validateDocUrl = (rule, value, callback) => {
            if (!this.modalForm.id) { // 创建
                if (!this.docUploadList.length) {
                    callback(new Error('请上传接入文档'))
                } else {
                    callback()
                }
            } else { // 修改
                // 1. 有doc_url 直接保存
                // 2. this.docUploadList.length = 0 && !doc_url
                if (!!this.modalForm.doc_url || (this.docUploadList.length && !this.modalForm.doc_url)) {
                    callback()
                } else {
                    callback(new Error('请上传接入文档'))
                }
            }
        }
        return {
            pageSize: 10,
            total_count: 0,
            currentPage: 1,
            noDataText: this.$config.noDataText,

            accessColumns: [
                {
                    title: '编号',
                    slot: 'index',
                    width: 50
                },
                {
                    title: '接入方式',
                    slot: 'access_type',
                    width: 100
                },
                {
                    title: '版本号',
                    key: 'version',
                    width: 80
                },
                {
                    title: '更新日志',
                    slot: 'log',
                    minWidth: 150
                },
                {
                    title: '发布状态',
                    slot: 'status',
                    width: 150
                },
                {
                    title: '创建时间',
                    slot: 'created_at',
                    width: 150
                },
                {
                    title: '更新时间',
                    slot: 'updated_at',
                    width: 150
                },
                {
                    title: '操作者',
                    key: 'last_us_account',
                    width: 150
                },
                {
                    title: '操作',
                    slot: 'action',
                    maxWidth: 210,
                    minWidth: 150
                }
            ], // 列
            accessDataList: [], // 公司列表
            tableLoadFlag: true, // table的loading

            setModalFlag: false,
            modalForm: {
                access_type: '', // 接入方式 1=API,2=Android,3=iOS
                version: '', // 版本号
                doc_url: '', // 接入文档地址
                doc_name: '', // 接入文档名称
                sdk_url: '', // SDK包地址
                sdk_name: '', // SDK名称
                log: '' // 更新日志
            },
            modalFormRules: { // form表单正则
                access_type: [{required: true, message: '请选择接入方式'}],
                version: [{required: true, message: '请输入版本号'}],
                doc_url: [{required: true, validator: validateDocUrl}],
                log: [{required: true, message: '请输入更新日志', trigger: 'blur'}]
            },

            submitClock: false, // 保存锁
            drawStyles: { // 抽屉样式
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '54px',
                position: 'static'
            },

            submitTxt: '提交中...', // 提交按钮的文字
            docUploadList: [], // 接入文档上传列表
            sdkUploadList: [], // SDK包文件上传列表
            uploadUrl: uploadFileUrl
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
        if (this._hasPageAccess()) {
            this.docJoinUsList()
        }
    },
    mounted() {
        this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: false}, 'nav-handle-group': false}) // search-line的高度
    },
    methods: {
        /**
         * [downloadFile 下载文档和apk]
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        downloadFile(row, name) {
            window.location.href = row[name]
        },
        /**
         * [docJoinUsList 获取接入列表]
         * @return {[type]} [description]
         */
        docJoinUsList() {
            this.tableLoadFlag = true
            docJoinUsList({
                page_num: this.currentPage,
                page_size: this.pageSize
            }).then(res => {
                this.tableLoadFlag = false
                if (res.code === 200) {
                    this.total_count = res.data.total_count
                    this.accessDataList = res.data.list
                }
            }, err => {
                if (err.code === 403) {
                    this.noDataText = this.$config.noDataTextPer
                }
                this.tableLoadFlag = false
            })
        },
        /**
         * [submitAccess 新建/编辑第三方平台账号信息]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        submitAccess(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    // 如果存在上传文件，优先上传
                    // 上传的条件
                    // 1. 存在文档文件名，并且doc_url为空
                    // 2. 存在sdk文件名，并且sdk_url为空

                    if ((!!this.modalForm.doc_name && !this.modalForm.doc_url) || (!!this.modalForm.sdk_name && !this.modalForm.sdk_url)) {
                        let proArr = [] // 上传列表

                        this.submitTxt = '文档上传中...' // 提交按钮的文字

                        if (!!this.modalForm.doc_name && !this.modalForm.doc_url) {
                            proArr.push(this.uploadFile(1))
                        }

                        if (!!this.modalForm.sdk_name && !this.modalForm.sdk_url) {
                            let type = 5 // 5=zip，6=rar

                            if (this.modalForm.sdk_name.indexOf('.zip') > -1 || this.modalForm.sdk_name.indexOf('.ZIP') > -1) {
                                type = 5
                            }

                            if (this.modalForm.sdk_name.indexOf('.rar') > -1 || this.modalForm.sdk_name.indexOf('.RAR') > -1) {
                                type = 6
                            }

                            proArr.push(this.uploadFile(type))
                        }

                        if (proArr.length) {
                            Promise.all(proArr).then(res => {
                                let _flag = res.every(flag => {
                                    return flag
                                })
                                if (_flag) this.submitForm()
                            })
                        } else {
                            this.submitForm()
                        }
                    } else {
                        this.submitForm()
                    }
                }
            })
        },

        /**
         * [submitForm 新建/编辑 ]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        submitForm() {
            let params = {...this.modalForm}

            // 当选择api时，没有sdk
            if (params.access_type === 1) {
                params.sdk_name = ''
                params.sdk_url = ''
            }

            // 2=Android-SDK, 3=IOS-SDK, 1=API
            this.submitClock = true
            this.submitTxt = '提交中...' // 提交按钮的文字

            docJoinUsSave(params).then(res => {
                this.submitClock = false

                if (res.code === 200) {
                    this.setModalFlag = false
                    this.$Message.success({content: params.id ? '修改成功' : '新建成功', duration: 3})
                    this.docJoinUsList()
                } else {
                    this.$Message.error({content: params.id ? '新建失败，请重试' : '保存失败，请重试', duration: 3})
                }
            }, err => {
                console.log(err)
                this.submitClock = false
            })
        },
        /**
         * [changePage 修改页码]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        changePage(val) {
            this.currentPage = val
            this.docJoinUsList()
        },
        /**
         * [changeState 切换业务状态]
         * @param  {[type]} item [description]
         * @return {[type]}     [description]
         */
        changeState(item) {
            this.$Modal.confirm({
                title: item.status === 1 ? '确定发布?' : '确定停用?',
                content: item.status === 1 ? '请确认版本内容正确性。如果发布，本版本会覆盖历史版本，并展示到媒体平台，确定发布么？' : '',
                onOk: () => {
                    docJoinUsChangeStatus({
                        id: item.id,
                        status: item.status
                    }).then(res => {
                        if (res.code === 200) {
                            this.$Message.success({content: '状态修改成功', duration: 3})
                        }
                        this.docJoinUsList()
                    })
                },
                onCancel: res => {
                    item.status = item.status === 1 ? 2 : 1
                }
            })
        },

        /**
         * [deleteAccess 删除模块]
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        deleteAccess(row) {
            this.$Modal.confirm({
                title: ' 如果删除将无法恢复，确定删除么？',
                content: '',
                onOk: () => {
                    docJoinUsChangeStatus({
                        id: row.id,
                        status: -1
                    }).then(res => {
                        if (res.code === 200) {
                            this.$Message.success({content: '删除成功', duration: 3})
                        }
                        this.docJoinUsList()
                    })
                },
                onCancel: res => {
                    console.log(res)
                }
            })
        },
        /**
         * [sizeChange 切换每页条数时的回调]
         * @param  {[type]} size [description]
         * @return {[type]}      [description]
         */
        sizeChange(size) {
            this.pageSize = size
            this.docJoinUsList()
        },
        /**
         * [toLink 路由跳转]
         * @param  {[type]} el [description]
         * @return {[type]}    [description]
         */
        doCreate(row) {
            this.submitTxt = '提交中...'// 提交按钮的文字
            this.setModalFlag = true
            this.resetFields() // 重置校验

            if (row && row.id) {
                // 编辑
                this.modalForm = {
                    id: row.id,
                    access_type: row.access_type, // 接入方式 1=API,2=Android,3=iOS
                    version: row.version, // 版本号
                    doc_url: row.doc_url, // 接入文档地址
                    doc_name: row.doc_name, // 接入文档名称
                    sdk_url: row.sdk_url, // SDK包地址
                    sdk_name: row.sdk_name, // SDK名称
                    log: row.log // 更新日志
                }
            } else {
                this.modalForm = {
                    access_type: '', // 接入方式 1=API,2=Android,3=iOS
                    version: '', // 版本号
                    doc_url: '', // 接入文档地址
                    doc_name: '', // 接入文档名称
                    sdk_url: '', // SDK包地址
                    sdk_name: '', // SDK名称
                    log: '' // 更新日志
                }
            }
        },

        /**
         * [handleFormatError 上传文件格式校验]
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        handleFormatError(file) {
            this.$Message.warning({content: '不支持此文件类型', duration: 3})
        },
        /**
         * [handleMaxSize 文件最大内容]
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        handleMaxSize(file) {
            this.$Message.warning({content: '文件大小超出限制', duration: 3})
        },

        /**
         * [docHandleBeforeUpload 接入文档上传上传前校验]
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        docHandleBeforeUpload(file) {
            this.docUploadList = []
            if (file && file.size > (5 * 1024 * 1024)) {
                this.$Message.warning('文件不能大于5M')
                return false
            } else {
                this.docUploadList.push(file)
                this.modalForm.doc_name = file.name
                return false
            }
        },
        /**
         * [docHandleBeforeUpload SDK包文件上传前校验]
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        sdkHandleBeforeUpload(file) {
            this.sdkUploadList = []
            if (file && file.size > (30 * 1024 * 1024)) {
                this.$Message.warning('文件不能大于30M')
                return false
            } else {
                this.sdkUploadList.push(file)
                this.modalForm.sdk_name = file.name
                return false
            }
        },

        /**
         * [uploadFile 上传文件]
         * @return {[type]} [type 1=PDF，2=图片，3=视频， 4=excel，5=apk，6=ipa]
         */
        uploadFile(type, paths) {
            let _this = this

            _this.submitClock = true

            let formData = new FormData()
            formData.append('files', type === 1 ? _this.docUploadList[0] : _this.sdkUploadList[0])
            formData.append('type', type) // 上传文件类型，1=PDF，2=图片，3=视频， 4=excel，5=apk，6=ipa

            // 指定OSS地址，可以覆盖原地址
            if (paths) {
                formData.append('paths', paths)
            }

            return new Promise((reslove, reject) => {
                uploadFile(formData).then(res => {
                    // 上传
                    if (res.code === 200) {
                        if (type === 1) {
                            _this.modalForm.doc_url = `${res.data.host}${res.data.url[0]}`
                        } else if (type === 5) {
                            _this.modalForm.sdk_url = `${res.data.host}${res.data.url[0]}`
                        }

                        reslove(true)
                    } else {
                        _this.$Message.error({content: type === 1 ? '接入文档上传失败' : (type === 5 ? 'SDK包上传失败' : res.msg), duration: 3})
                        _this.submitClock = false
                        reslove(false)
                    }
                }, err => {
                    _this.submitClock = false
                    _this.$Message.error({content: type === 1 ? '接入文档上传失败' : ((type === 5 || type === 6) ? 'SDK包上传失败' : err.msg), duration: 3})
                    reject(false)
                })
            })
        },
        /**
         * [deleteFile 修改情况下，删除接入文档url]
         * @return {[type]} [文件名和文件路径]
         * @return {[type]} [description]
         */
        deleteDocFile() {
            this.modalForm.doc_name = ''
            this.modalForm.doc_url = ''
        },
        /**
         * [deleteFile 修改情况下，删除SDK包文件url]
         * @return {[type]} [文件名和文件路径]
         */
        deleteSDKFile() {
            this.modalForm.sdk_name = ''
            this.modalForm.sdk_url = ''
        },
        /**
         * [resetFields 重置form表单]
         * @return {[type]} [description]
         */
        resetFields() {
            this.$refs['modalForm'].resetFields()
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.upload-inner
    display: flex
    align-items: center
    justify-content: center
    padding: 30px
    height: 150px
    background: #FAFAFA
    font-size: 0px
    .upload-txt
        margin-left: 20px
        display: inline-block
        vertical-align: middle
        line-height: 24px
        text-align: left
        h6
            font-size: 14px
            font-weight: normal
            span
                color: #4083f8
        p
            font-size: 12px
            color: #999999
.down_export
    height: 36px
    display: flex
    background: #F3F5F9
    line-height: 36px
    color: #4083F8
    font-size: 14px
    justify-content: space-between
    padding: 0 10px
    .name
        flex: 1
    .down
        flex: 0 0 50px
        width: 50px
        text-align: center
    .delete
        flex: 0 0 16px
        width: 16px
        cursor: pointer
        margin-left: 10px
    .icon
        display: inline-block
        vertical-align: middle
        font-size: 16px
        margin-right 2px
    .icon-download
        font-size: 12px
.log
    white-space: pre-wrap
    overflow: hidden
    display: -webkit-box
    -webkit-box-orient: vertical
    -webkit-line-clamp: 5
    word-break: break-word
.is-new-icon
    width: 20px
    height: 20px
    text-align: center
    line-height: 20px
    border: 1px solid #F72D17
    color: #F72D17
    font-size: 12px
    display: inline-block
    vertical-align: middle
    margin-left: 10px
.drawer-footer
    button
        width: auto
        padding: 0 30px
</style>
