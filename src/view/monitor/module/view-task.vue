<template>
    <!-- 新建任务 -->
    <Drawer class="mask-drawer" v-model="drawModalFlag" width="600px" :mask-closable="false" title="查看任务">
        <Form ref="modalForm" :label-colon="true" label-position="left" :label-width="125">
            <FormItem label="渠道" v-if="taskData.channel">
                {{taskData.channel.name}}
            </FormItem>

            <FormItem label="CP" v-if="taskData.cp">
                {{taskData.cp.name}}
            </FormItem>

            <FormItem label="推广产品" v-if="taskData.product">
                {{taskData.product.name}}
            </FormItem>

            <FormItem label="推广链接" v-if="taskData.cp_landing_page">
                <div class="form-item-flex">
                    <p class="link">{{taskData.cp_landing_page}}</p>
                    <div class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="taskData.cp_landing_page" @click="copyContent"></div>
                </div>
            </FormItem>

            <FormItem label="CP监测链接" v-if="taskData.cp_click_url">
                <div class="form-item-flex">
                    <p class="link">{{taskData.cp_click_url}}</p>
                    <div class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="taskData.cp_click_url" @click="copyContent"></div>
                </div>
            </FormItem>

            <FormItem label="渠道监测链接" v-if="taskData.task_url">
                <div class="form-item-flex">
                    <p class="link">{{taskData.task_url}}</p>
                    <div class="iconfont icon-copy copy-content" title="复制链接" :data-clipboard-text="taskData.task_url" @click="copyContent"></div>
                </div>
            </FormItem>

            <FormItem label="推广地区">
                {{taskData.region}}
            </FormItem>

            <FormItem label="推广平台">
                <span v-if="taskData.os === 1">Android</span>
                <span v-if="taskData.os === 2">IOS</span>
                <span v-if="taskData.os === 0">不限</span>
            </FormItem>

            <FormItem label="推广单价(入价)">
                <div class="modify-flex">
                    <div class="label">
                        {{taskData.cp_price}}
                    </div>
                    <Poptip 
                        confirm 
                        :transfer="true" 
                        placement="bottom" 
                        transfer-class-name="private-custom-poptip"
                        @on-ok="modifyCpPrice"
                    >
                        <i class="iconfont icon-bianji"></i>
                        <div slot="title">
                            <InputNumber :min="0.01" :max="inputMaxNumber" placeholder="大于0，最多可填2位小数" :step="0.01" v-model="modalForm.cp_price"></InputNumber>
                        </div>
                    </Poptip>
                </div>
            </FormItem>

            <FormItem label="出价">
                <div class="modify-flex">
                    <div class="label">
                        {{taskData.channel_price}}
                    </div>
                    <Poptip 
                        confirm 
                        :transfer="true" 
                        placement="bottom" 
                        transfer-class-name="private-custom-poptip"
                        @on-ok="modifyChannelPrice"
                    >
                        <i class="iconfont icon-bianji"></i>
                        <div slot="title">
                            <InputNumber :min="0.01" :max="inputMaxNumber" placeholder="大于0，最多可填2位小数" :step="0.01" v-model="modalForm.channel_price"></InputNumber>
                        </div>
                    </Poptip>
                </div>
            </FormItem>

            <FormItem label="折扣系数">
                <div class="modify-flex">
                    <div class="label">
                        {{taskData.discount_rate}}
                    </div>
                    <Poptip 
                        confirm 
                        :transfer="true" 
                        placement="bottom" 
                        transfer-class-name="private-custom-poptip"
                        @on-ok="modifyDisPrice"
                    >
                        <i class="iconfont icon-bianji"></i>
                        <div slot="title">
                            <InputNumber :max="100" :min="1" :step="1" placeholder="大于0小于等于100的整数" v-model="modalForm.discount_rate"></InputNumber>
                        </div>
                    </Poptip>
                </div>
            </FormItem>

            <FormItem label="需求量级" v-if="taskData.demand">
                <div v-html="taskData.demand"></div>
            </FormItem>

            <FormItem label="投放时间" v-if="taskData.timestamp">
                <div v-html="taskData.timestamp"></div>
            </FormItem>

            <FormItem label="考核内容" v-if="taskData.content">
                <div class="pre-line" v-html="taskData.content"></div>
            </FormItem>
        </Form>
    </Drawer>
</template>

<script>
import { regNum2Precision, regNumPositiveInteger, inputMaxNumber } from '@/libs/util'
import { getTaskList, modTask } from '@/api/monitor'
import Clipboard from 'clipboard'

export default {
    data() {
        const validatePrice = (rule, value, callback) => {
            if (value === null) {
                callback(new Error('请填写价格'));
            } else if (!regNum2Precision.test(value) || value <= 0) {
                callback(new Error('大于0的任意实数，最多可填两位小数'))
            } else {
                callback()
            }
        };
        const validateRate = (rule, value, callback) => {
            if (value === null) {
                callback(new Error('请输入折扣系数'));
            } else if (value <= 0 || value > 100 || !regNumPositiveInteger.test(value)) {
                callback(new Error('大于0小于等于100的整数'))
            } else {
                callback()
            }
        };
        return {
            inputMaxNumber: inputMaxNumber, 
            drawModalFlag: false, // 抽屉开关
            taskData: {}, // 任务基本信息
            modalForm: {}
        }
    },
    computed: {
        /**
         * [osType 应用平台]
         * @return {[type]} [description]
         */
        osType() {
            return this.$store.getters.osType
        }
    },
    methods: {
        /**
         * [initInject 注入数据]
         * @return {[type]} [description]
         */
        initInject(id) {
            if(!id) {
                return
            }

            this.getTaskList(id)
        },
        /**
         * [getTaskList 任务id]
         * @param  {[type]} taskId [description]
         * @return {[type]}        [description]
         */
        getTaskList(taskId) {
            getTaskList({task_id_arr: [taskId]}).then(res=> {
                if (res.code === 200) {

                    let _data = res.data.tasks[0]

                    // 格式化入价，出价
                    _data.cp_price = _data.cp_price / 100
                    _data.channel_price = _data.channel_price / 100

                    this.taskData = _data

                    this.modalForm = {
                        cp_price: _data.cp_price,
                        channel_price: _data.channel_price,
                        discount_rate: _data.discount_rate
                    }
                    this.drawModalFlag = !this.drawModalFlag
                }
            })
        },
        /**
         * [modifyCpPrice 修改推广单价(入价)]
         * @return {[type]} [description]
         */
        modifyCpPrice() {
            let cp_price = this.modalForm.cp_price

            if(cp_price === this.taskData.cp_price) {
                this.$Message.warning({ content: '入价未发生改变', duration: 3})
                return
            }

            if(!cp_price || !regNum2Precision.test(cp_price) || cp_price <= 0 || cp_price > inputMaxNumber) {
                this.$Message.error({ content: '入价必须大于0的任意实数，最多可填两位小数', duration: 4})
                return
            }

            // 通过以上三种校验，还需硬性处理
            let price = parseInt(cp_price * 100)

            this.submitForm('cp_price', price)
        },
        /**
         * [modifyChannelPrice 修改出价]
         * @return {[type]} [description]
         */
        modifyChannelPrice() {
            let channel_price = this.modalForm.channel_price

            if(channel_price === this.taskData.channel_price) {
                this.$Message.warning({ content: '出价未发生改变', duration: 3})
                return
            }

            if(!channel_price || !regNum2Precision.test(channel_price) || channel_price <= 0 || channel_price > inputMaxNumber) {
                this.$Message.error({ content: '出价必须大于0的任意实数，最多可填两位小数', duration: 4})
                return
            }

            // 通过以上三种校验，还需硬性处理
            let price = parseInt(channel_price * 100)

            this.submitForm('channel_price', price)
        },
        /**
         * [modifyDisPrice 修改暗扣系数]
         * @return {[type]} [description]
         */
        modifyDisPrice() {
            let _rate = this.modalForm.discount_rate

            if(_rate === this.taskData.discount_rate) {
                this.$Message.warning({ content: '入折扣系数未发生改变', duration: 3})
                return
            }

            if(!_rate || !regNumPositiveInteger.test(_rate) || _rate <= 0 || _rate > 100) {
                this.$Message.error({ content: '入折扣系大于0小于等于100的整数', duration: 4})
                return
            }

            // 通过以上三种校验，还需硬性处理
            let price = parseInt(_rate)

            this.submitForm('discount_rate', price)
        },
        /**
         * [submitForm 新建/编辑渠道]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        submitForm(type, price) {

            let form = {
                id: this.taskData.id,
                [type]: price
            }

            modTask(form).then(res => {
                if (res.code === 200) {
                    this.$Message.success({content: '保存成功', duration: 3})
                    this.drawModalFlag = !this.drawModalFlag

                    this.$emit('on-success')
                } else {
                    this.$Message.error({content: '保存失败，请重试', duration: 3})
                }
            })
        },
        /**
         * [copyContent 赋值粘贴]
         * @return {[type]} [description]
         */
        copyContent() {
            let clipboard = new Clipboard('.copy-content')
            clipboard.on('success', e => {
                this.$Message.success('复制成功')
                // 释放内存
                clipboard.destroy()
            })
            clipboard.on('error', e => {
                // 不支持复制
                this.$Message.success('该浏览器不支持自动复制')
                // 释放内存
                clipboard.destroy()
            })
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.form-item-flex
    display: flex
    align-items: center
    justify-content: space-between
    /deep/ .ivu-input-number
        flex: 1
        
    .unit
        margin-left: 10px
        
    .link
        flex: 1
        width: 380px
        height: 32px
        line-height: 32px
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
        &:hover
            color: #4083F8
    .icon-copy
        color: #4083F8
        flex: 0 0 32px
        height: 32px
        line-height: 32px
        text-align: right
        cursor: pointer
.mask-drawer
    /deep/ .ivu-drawer-body
        padding: 10px 25px
    /deep/ .ivu-form-item
        margin-bottom: 4px
.modify-flex
    .label
        display: inline-block
        margin-right: 10px
    .icon-bianji
        text-align: center
        cursor: pointer
        display: inline-block
        vertical-align: middle
        color: #4083F8
        font-size: 12px
        width:  20px
        height: 20px
        line-height: 20px
.pre-line
    white-space: pre-line
</style>

<style lang="stylus" rel="stylesheet/stylus">
.private-custom-poptip
    .ivu-poptip-inner
        display: flex
        padding: 20px
    .ivu-poptip-body
        padding: 0px !important
    .ivu-poptip-body-message
        flex: 0 0 200px
        padding-left: 0px !important
        .ivu-input-number
            width: 200px
    .ivu-poptip-content
        .ivu-icon-ios-help-circle
            display: none
    .ivu-poptip-footer
        padding: 0px !important
        flex: 1
        font-size: 0px
        .ivu-btn
            margin-left: 10px
        .ivu-btn-small
            height: 32px
            padding: 0 15px
            border-radius: 4px
        .ivu-btn-text
            background: #fafafa
            border: 1px solid #ebebeb
            &:hover
                border: 1px solid #465CFE
</style>