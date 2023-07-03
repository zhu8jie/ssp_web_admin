<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2 v-if="alarm_id">编辑预警规则</h2>
        <h2 v-else>{{headTitle}}</h2>
      </div>
      <div class="warnDetail" style='margin-top:20px'>
        <Form ref="warnData" :label-colon="true" :model="warnData" :rules="formRules" :label-width="labelWidth">
          <FormItem label="预警名称" prop="name">
            <Input style="width: 510px" maxlength="30" show-word-limit placeholder="请填写预警名称"
                   v-model.trim="warnData.name"/>
          </FormItem>
          <FormItem label="预警维度" prop="scan_target">
            <RadioGroup v-model="warnData.scan_target" @on-change="warnChange">
              <Radio :disabled="disabled" :label="1">大盘流量</Radio>
              <Radio :disabled="disabled" :label="2">广告位&预算位</Radio>
              <Radio :disabled="disabled" :label="3">应用</Radio>
              <Radio :disabled="disabled" :label="4">广告位</Radio>
              <Radio :disabled="disabled" :label="5">公司</Radio>
              <Radio :disabled="disabled" :label="6">预算位</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem v-show="warnData.scan_target !==1" class="unitClass ivu-form-item-required" label="数据维度"
                    prop="warnSelect">
            <retarget-muti-cascader-ad-slot ref="proCity"
                                            class="m-l-20"
                                            v-model="warnData.warnSelect"
                                            :datas="DimensionList"
                                            :data="DimensionList"
                                            :order="orderText"
                                            :titleLoading="adTitle"
                                            :title="adslotString"
                                            :warnWidth="warnWidth"
                                            @input="updateMuti"
                                            @name="updateAdvertising"/>
          </FormItem>
          <FormItem class="unitClass" prop="scan_freq">
               <span slot="label">
            时间维度
             <Tooltip placement="top-start" :transfer="true" max-width="490">
               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>:
            <div slot="content">
               <p
                 style="font-size: 12px">日维度：取当日零点到当前时刻的上一个小时之间的数据，作为评判依据，每小时扫描一次；数据比较时取同比；次日零点10分的预警提醒可了解前日整天的数据变化情况<br>小时维度：取上个小时的数据作为评判依据，每小时扫描一次；数据比较时取环比</p>
            </div>
         </Tooltip>
          </span>
            <RadioGroup v-model="warnData.scan_freq">
              <Radio :disabled="disabled" :label="1">日<span class="hint">（每小时的10分扫描数据）</span></Radio>
              <Radio :disabled="disabled" :label="2">小时<span class="hint">（每小时的5分扫描数据）</span></Radio>
            </RadioGroup>
          </FormItem>
          <FormItem class="unitClass ivu-form-item-required" label="预警规则">

            <div class="dataList">
              <div v-for="(item,i) in warnRuleData.data" :key="'预警规则'+i" :style=" i>0 ? 'margin-top: 20px' :''">
                <Form :ref="'warnRuleData' + i" :model="item" :rules="warnRuleData.ruleValidate" :label-width="0" inline>
                  <FormItem prop="rule_type" >
                    <Select class="i-width-picker" v-model="item.rule_type" @on-change="warnRuleChange($event,i)">
                      <Option v-for="it in warnRule" :value="it.id" :key="'预警规则'+it.id + i">{{ it.label }}</Option>
                    </Select>
                  </FormItem>
                  <FormItem prop="rule_field">
                    <Select class="i-width-input-small" v-model="item.rule_field">
                      <Option v-for="it in getRuleList"
                              v-if="it.parentId ===item.rule_type"
                              v-show="!((warnData.scan_target===2 || warnData.scan_target===5 || warnData.scan_target===6) && it.key ===24)"
                              :value="it.key" :key="'预警详情'+it.key + i">{{ it.label }}
                      </Option>
                    </Select>
                  </FormItem>
                  <FormItem prop="rule_eq">
                    <Select v-if="item.rule_type !== 4" class="i-width-picker" v-model="item.rule_eq">
                      <Option v-for="its in rule_eq" :value="its.id" :key="'预警算法'+its.id + i">{{ its.label }}</Option>
                    </Select>
                    <Select v-if="item.rule_type == 4" class="i-width-picker" v-model="item.rule_eq">
                      <Option v-for="its in rule_rate" :value="its.id" :key="'预警算法'+its.id + i">{{ its.label }}</Option>
                    </Select>
                  </FormItem>
                  <FormItem prop="rule_value" :rules="{required: true, index: item.rule_type, validator: dataDimension}">
                    <InputNumber :min="0" style="margin-right: 10px;width: 170px" :max="10000000000000"
                                 :placeholder="item.rule_type === 1 ? '大于0' : item.rule_type === 2 || item.rule_type === 4  ? '0~100' : '大于0，最多为两位小数' "
                                 v-model="item.rule_value"/>
                  </FormItem>
                  <span v-if="item.rule_type === 1">次</span>
                  <span v-else-if="item.rule_type === 3">元</span>
                  <span v-else>%</span>
                  <span class="rule_action" v-if="i === 0" @click.stop="addRule()">
                     <Icon type="md-add"/>
                   </span>
                  <span v-else class="rule_action" @click.stop="deleteRule(i)">
                        <img src="~@/assets/image/delect.png" alt="">
                      </span>
                </Form>
              </div>
            </div>
          </FormItem>
          <FormItem class="unitClass" label="规则关系" prop="rule_type">
            <RadioGroup v-model="warnData.rule_type">
              <Radio :disabled="disabled" :label="1">同时满足(与)</Radio>
              <Radio :disabled="disabled" :label="2">满足其一(或)</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem class="unitClass" label="预警次数" prop="alarm_count">
            <InputNumber style="width: 120px" :min="1" :max="60" placeholder="大于0"
                         v-model.trim="warnData.alarm_count"/>
            <span style="margin-left: 10px">次</span>
            <span class="hint">（默认只在扫描数据后提醒一次，预警次数大于等于1）</span>
          </FormItem>
          <FormItem class="unitClass" label="时间间隔" prop="alarm_min">
            <InputNumber style="width: 120px" :min="1" :max="60" placeholder="大于0"
                         v-model.trim="warnData.alarm_min"/>
            <span style="margin-left: 10px">分钟</span>
            <span class="hint">（如果预警次数大于1次，时间间隔默认10分钟，每小时预警次数*时间间隔需小于60分钟）</span>
          </FormItem>
          <FormItem class="unitClass" label="被提醒人" prop="alarm_user_list">
            <Select style="width: 510px" multiple :max-tag-count="3" v-model="warnData.alarm_user_list"
                    :max-tag-placeholder="limitText" filterable placeholder="被提醒人">
              <Option v-for="item in userList" :value="item.id" :key="'alarm_user_list'+item.id">{{ item.user_name }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="提醒方式" prop="alarm_type">
            <CheckboxGroup v-model="warnData.alarm_type">
              <Checkbox :label="1">邮件提醒</Checkbox>
              <!--              <Checkbox :label="2">短信提醒</Checkbox>-->
              <Checkbox :label="4">钉钉提醒</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="提醒时段" prop="warn_time">
            <RadioGroup v-model="warnData.time_type">
              <Radio :label="1">全时段</Radio>
              <Radio :label="2">自定义时段</Radio>
            </RadioGroup>
            <div v-show="warnData.time_type === 2" style="margin-top: 10px">
              <ry-time-sheet v-model="time"></ry-time-sheet>
            </div>
          </FormItem>
          <FormItem label="备注" prop="comment">
            <Input v-model="warnData.comment" maxlength="100" show-word-limit type="textarea" placeholder="不超过100字"
                   style="height:120px;width: 510px"/>
          </FormItem>
          <FormItem label="">
            <Button @click="goBack">取消</Button>
            <Button type="primary" :loading="submitClock" @click="save('warnData')">
              <span v-if="!submitClock">保存</span>
              <span v-else>保存中...</span>
            </Button>
          </FormItem>
        </Form>
      </div>
    </Card>
  </div>
</template>

<script>
  import {showTitle} from '@/libs/util'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import {getSysUserList} from '@/api/permission'
  import {getAppList, getMediaSspSlotAdList} from '@/api/ssp'
  import {getDspCompanyList, getDspSlotList} from '@/api/dsp'
  import {getAlarmDetail, addAlarmApi, amendAlarmApi} from '@/api/warn'
  import {getRuleList, getRuleEq, getRuleRate} from './data'
  import retargetMutiCascaderAdSlot from '@/components/cascader-retarget'
  import RyTimeSheet from '@/components/ry-time-sheet/warnSheet.vue'

  export default {
    name: 'access-manage',
    mixins: [inPageAccess],
    components: {retargetMutiCascaderAdSlot, RyTimeSheet},
    data() {

      const warnSelect = (rule, value, callback) => {
        let arr = this.warnData
        let showTxt = ''
        if (arr.scan_target !== 1 && arr.warnSelect.length === 0) {
          showTxt = '请选择数据维度的值'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      }
      const warnTime = (rule, value, callback) => {
        let arr = this.warnData
        let time = parseInt(this.time, 2)
        let showTxt = ''
        if (arr.time_type === 2 && !time) {
          showTxt = '请选择自定义时段'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      }
      const alarmTime = (rule, value, callback) => {
        let arr = this.warnData
        let alarm_count = arr.alarm_count
        let alarm_min = arr.alarm_min
        let showTxt = ''
        if (value % 1 !== 0) {
          showTxt = '请输入正整数'
        }
        if (alarm_count * alarm_min >= 60) {
          showTxt = '每小时预警次数*时间间隔需小于60分钟'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      }
      return {
        page: this.$route.query.page ? Number(this.$route.query.page) : 1, // 页码
        labelWidth: 120,
        formRules: { // form表单正则
          name: [{required: true, message: '预警名称不能为空'}],
          scan_target: [{required: true, message: '预警维度不能为空'}],
          scan_freq: [{required: true, message: '时间维度不能为空'}],
          rule_type: [{required: true, message: '规则关系不能为空'}],
          alarm_user_list: [{required: true, message: '被提醒人不能为空'}],
          alarm_type: [{required: true, message: '提醒方式不能为空'}],
          warn_time: [{required: true, validator: warnTime}],
          alarm_count: [{validator: alarmTime}],
          alarm_min: [{validator: alarmTime}],
          warnSelect: [{validator: warnSelect}]
        },
        warnRule: [
          {id: 1, label: '量级'},
          {id: 2, label: '率'},
          {id: 4, label: '变化率'},
          {id: 3, label: '价格'}
        ],
        rule_eq: getRuleEq(this),
        rule_rate: getRuleRate(this),
        warnRuleData: {
          data: [{
            rule_type: 1,
            rule_field: 1,
            rule_eq: 1,
            rule_value: 0
          }],
          ruleValidate: {
            rule_type: [
              {required: true, message: '请选择预警规则'}
            ],
            rule_field: [
              {required: true, message: '请选择预警规则'}
            ],
            rule_eq: [
              {required: true, message: '预警规则的算法不能为空'}
            ]
          }
        },
        warnWidth: '预警中心',
        warnData: {
          name: null, // 预警名称
          scan_target: 1, // 预警维度
          scan_freq: 1, // 时间维度
          rule_type: 1, // 规则关系
          warnSelect: [],
          alarm_count: 1, // 预警次数
          alarm_min: 10, // 预警间隔
          alarm_user_list: [], // 被提醒人
          alarm_type: [], // 提醒方式
          time_type: 1, // 提醒时段
          alarm_time: '00000000000000000000000', // 提醒时段
          timeID: 'dataTime', // 提醒时段
          comment: null // 备注
        },
        time: '',
        getRuleList: getRuleList(this),
        userList: [],
        submitClock: false, // 保存锁
        companyList: [], // 公司的列表
        budgetList: [], // 预算位的列表
        applyList: [], // 应用的列表
        adList: [], // 广告位的列表
        adslotString: '应用',
        orderText: 'first',
        adTitle: '加载中',
        DimensionList: [],
        alarm_id: this.$route.query.alarm_id ? Number(this.$route.query.alarm_id) : '',
        type: this.$route.query.scan_target ? Number(this.$route.query.scan_target) : '',
        disabled: !!this.$route.query.alarm_id
      }
    },
    computed: {
      headTitle() {
        return showTitle(this.$route, this)
      }
    },
    watch: {
      time() {
        this.$nextTick(() => {
          this.$refs['warnData'].fields.forEach((e) => {
            if (e.label === '提醒时段') {
              e.validateState = ''
              e.validateMessage = ''
              this.$set(e, 'isRequired', !!e.prop)
            }
          })
        })
      },
      warnData: {
        deep: true,
        immediate: true,
        handler: function (v) {
          this.$nextTick(() => {
            this.$refs['warnData'].validateField('alarm_count')
            this.$refs['warnData'].validateField('alarm_min')
          })
        }
      }

    },
    created() {
      this.getUserData()
      if (this.alarm_id) {
        this.$Spin.show()
        this.getWarnEdit()
      }
    },
    methods: {
      dataDimension  (rule, value, callback) {
        let rule_type = rule.index
        let showTxt = ''
        if (!value) {
          showTxt = '预警规则的数值不能为空'
        }
        if (rule_type === 1) {
          if (value % 1 !== 0 || value < 0) {
            showTxt = '请输入大于0的正整数'
          }
        }
        if (rule_type === 2 || rule_type === 4) {
          if (value <= 0 || value > 100 || value % 1 !== 0) {
            showTxt = '请输入小于100的正整数'
          }

        }
        if (rule_type === 3) {
          if (value <= 0 || !/^\d+(\.\d{1,2})?$/.test(value)) {
            showTxt = '输入的值最多可填2位小数'
          }
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }
      },
      updateMuti() {

      },
      number2Thousand(num) {
        if (!num || num === Infinity || num === -Infinity) {
          return 0
        } else {
          if (Number.isInteger(num)) {
            return parseInt(num) // 数字
          } else {
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
          }
        }
      },
      updateAdvertising() {

      },
      getWarnEdit() {
        let val = this.type
        switch (val) {
          case val = 1:
            this.getEditData()
            break
          case val = 2:
            this.adslotString = '广告位'
            this.warnWidth = '预警中心'
            this.getconfigData()
            break
          case val = 3:
            this.adslotString = '应用'
            this.warnWidth = '公司'
            this.getApplyData(1)
            break
          case val = 4:
            this.adslotString = '应用'
            this.warnWidth = '预警中心'
            this.getApplyData(2)
            break
          case val = 5:
            this.adslotString = '公司'
            this.warnWidth = '公司'
            this.getCompanyData(1)
            break
          case val = 6:
            this.adslotString = '公司'
            this.warnWidth = '预警中心'
            this.getCompanyData(2)
            break
        }
      },
      /**
       * [warnChange 获取编辑的内容]
       * @return {[type]} [description]
       */
      getEditData() {
        getAlarmDetail({
          alarm_id: this.alarm_id
        }).then(res => {
          if (res.code === 200) {
            let list = res.data.alarm
            let val = list.scan_target
            list.time_type = !list.full_time ? 2 : 1
            let time = list.time_interval ? list.time_interval.toString(2) : 0
            let time_num = time ? time.split('').reverse().join('') : '0'
            list.alarm_time = time_num
            this.time = time_num
            let warnSelect = []
            switch (val) {
              case val = 1:
                break
              case val = 2:
                list.alarm_scan_val_arr.map(item => {
                  let id = item.ssp_slot.id + '/' + item.dsp_slot.id
                  warnSelect.push(id)
                })
                break
              case val = 3:
                list.alarm_scan_val_arr.map(item => {
                  let id = item.ssp_app.id
                  warnSelect.push(id)
                })
                break
              case val = 4:
                list.alarm_scan_val_arr.map(item => {
                  let id = item.ssp_slot.id
                  warnSelect.push(id)
                })
                break
              case val = 5:
                list.alarm_scan_val_arr.map(item => {
                  let id = item.dsp_company.id
                  warnSelect.push(id)
                })
                break
              case val = 6:
                list.alarm_scan_val_arr.map(item => {
                  let id = item.dsp_slot.id
                  warnSelect.push(id)
                })
                break
            }
            list.warnSelect = warnSelect
            // 提醒人
            let alarm_user_list = []
            list.alarm_user_list.map(item => {
              alarm_user_list.push(item.user_id)
            })
            list.alarm_user_list = alarm_user_list
            // 提醒方式
            list.alarm_type = list.alarm_type === 1 ? [1] : list.alarm_type === 4 ? [4] : list.alarm_type === 5 ? [1, 4] : []
            // 预警规则
            let alarm_rule_list = []
            list.alarm_rule_list.map(it => {
              let obj = {}
              obj.rule_field = Number(it.rule_field)
              obj.rule_type = it.rule_field >= 9 && it.rule_field <= 14 ? 4 : Number(it.rule_type)
              obj.rule_eq = it.rule_field >= 9 && it.rule_field <= 14 ? it.rule_eq === 3 || it.rule_eq === 5 ? 3 : 1 : Number(it.rule_eq)
              obj.rule_value = obj.rule_type === 3 ? Number(this.number2Thousand(it.rule_value / 100)) : Number(this.number2Thousand(it.rule_value))
              alarm_rule_list.push(obj)
            })

            this.warnRuleData.data = alarm_rule_list
            this.warnData = list
            this.$Spin.hide()
          }
        }, err => {
          this.$Spin.hide()
        })
      },
      /**
       * [warnChange 预警维度的变化]
       * @return {[type]} [description]
       */
      warnChange(val) {
        this.warnData.warnSelect = []
        this.adTitle = '加载中'
        switch (val) {
          case val = 1:
            break
          case val = 2:
            this.adslotString = '广告位'
            this.warnWidth = '预警中心'
            this.getconfigData()
            break
          case val = 3:
            this.adslotString = '应用'
            this.warnWidth = '公司'
            this.getApplyData(1)
            break
          case val = 4:
            this.adslotString = '应用'
            this.warnWidth = '预警中心'
            this.getApplyData(2)
            break
          case val = 5:
            this.adslotString = '公司'
            this.warnWidth = '公司'
            this.getCompanyData(1)
            break
          case val = 6:
            this.adslotString = '公司'
            this.warnWidth = '预警中心'
            this.getCompanyData(2)
            break
        }
      },
      warnRuleChange(val, i) {
        let index = i
        let rule = [...this.warnRuleData.data]
        rule[index].rule_field = null
        this.warnRuleData.data = rule
      },
      /**
       * [getCompanyData 获取公司的信息]
       * @return {[type]} [description]
       */
      getCompanyData(type) {
        let companyData = []
        getDspCompanyList().then(res => {
          if (res.code === 200) {
            let companyList = res.data.list
            companyList.map(item => {
              companyData.push({
                label: item.company_name + '(' + item.id + ')',
                value: item.id,
                check: false,
                little: false
              })
            })
            type === 1 ? this.adTitle = '加载完成' : ''
            type === 1 ? this.DimensionList = companyData : ''
            if (this.alarm_id && type === 1) {
              this.getEditData()
            }
            if (companyList && companyList.length > 0 && type === 2) {
              getDspSlotList().then(res => {
                if (res.code === 200) {
                  let budgetData = res.data.list
                  this.setBudgetData(companyList, budgetData)
                }
              })
            } else {
              this.budgetList = [{}]
            }
          }
        })
      },
      /**
       * [setBudgetData 获取预算位的信息]
       * @return {[type]} [description]
       */
      setBudgetData(fatherList, childrenList) {
        let bundget = []
        fatherList.map(item => {
          let list = {}
          list['label'] = item.company_name + '(' + item.id + ')'
          list['value'] = (item.id).toString()
          list['check'] = false
          list['little'] = false
          list['type'] = 'app'
          list['childrenName'] = '预算位'
          list['children'] = []
          childrenList.map(it => {
            if (it.dsp_company_id === item.id) {
              let obj = {}
              obj.value = it.id
              obj.label = it.dsp_slot_name + '(' + it.id + ')'
              obj.check = false
              obj.ad_type_id = it.ad_type_id
              obj.little = false
              list['children'].push(obj)
            }
          })
          if (list['children'].length > 0) {
            bundget.push(list)
          }
        })
        this.adTitle = '加载完成'
        this.DimensionList = bundget
        if (this.alarm_id) {
          this.getEditData()
        }
      },

      /**
       * [getconfigData 获取连连看数据]
       * @return {[type]} [description]
       */
      getconfigData() {
        let obj = {}
        obj.page_size = parseInt(0)
        obj.page_num = parseInt(1)
        getMediaSspSlotAdList(obj).then(res => {
          if (res.code === 200) {
            let configList = []
            let configData = res.data.list
            configData.map(item => {
              let obj = {}
              obj.value = item.id
              obj.label = item.ssp_slot_name + '(' + item.id + ')'
              obj.type = 'app'
              obj.check = false
              obj.little = false
              obj.childrenName = '预算位'
              obj.children = []
              let divide_list = item.traffic_control_list
              if (divide_list && divide_list.length > 0) {
                divide_list.map(it => {
                    let bundgetObj = {}
                    bundgetObj.value = item.id + '/' + it.dsp_slot_id
                    bundgetObj.label = it.dsp_slot.dsp_slot_name + '(' + it.dsp_slot_id + ')'
                    bundgetObj.fatherlabel = item.ssp_slot_name
                    bundgetObj.childrenlabel = it.dsp_slot.dsp_slot_name + '(' + it.dsp_slot_id + ')'
                    bundgetObj.type = 'slot'
                    bundgetObj.ad_type_id = it.dsp_slot.ad_type_id
                    bundgetObj.check = false
                    bundgetObj.little = false
                    obj['children'].push(bundgetObj)
                  })
                configList.push(obj)
              }
            })
            this.adTitle = '加载完成'
            this.DimensionList = configList
            if (this.alarm_id) {
              this.getEditData()
            }
          }
        })
      },
      /**
       * [getApplyData 获取应用的信息]
       * @return {[type]} [description]
       */
      getApplyData(type) {
        let applyData = []
        getAppList().then(res => {
          if (res.code === 200) {
            let fatherList = res.data.list
            res.data.list.map(item => {
              applyData.push({
                label: item.app_name + '(' + item.app_id + ')',
                value: item.app_id,
                check: false,
                little: false
              })
            })
            type === 1 ? this.DimensionList = applyData : ''
            type === 1 ? this.adTitle = '加载完成' : ''
            if (this.alarm_id && type === 1) {
              this.getEditData()
            }
            if (applyData && applyData.length > 0 && type === 2) {
              let obj = {}
              obj.page_size = parseInt(0)
              obj.page_num = parseInt(1)
              getMediaSspSlotAdList(obj).then(res => {
                if (res.code === 200) {
                  let adData = res.data.list
                  this.setSlotData(fatherList, adData)
                }
              })
            }
          }
        })
      },
      /**
       * [setSlotData 获取广告位的信息]
       * @return {[type]} [description]
       */
      setSlotData(fatherList, childrenList) {
        let dataList = []
        fatherList.map(item => {
          let slot = {}
          slot['label'] = item.app_name + '(' + item.app_id + ')'
          slot['value'] = item.app_id
          slot['check'] = false
          slot['little'] = false
          slot['type'] = 'app'
          slot['childrenName'] = '广告位'
          slot['children'] = []
          childrenList.map(list => {
            if (list.app_id === item.app_id) {
              let obj = {}
              obj.value = list.id
              obj.label = list.ssp_slot_name + '(' + list.id + ')'
              obj.type = 'slot'
              obj.check = false
              obj.ad_type_id = list.ad_type_id
              obj.little = false
              slot['children'].push(obj)
            }
          })
          if (slot['children'].length > 0) {
            dataList.push(slot)
          }
        })
        this.adTitle = '加载完成'
        this.DimensionList = dataList
        if (this.alarm_id) {
          this.getEditData()
        }
      },

      /**
       * [goBack 返回上一级]
       * @return {[type]} [description]
       */
      goBack() {
        this.$router.push({name: 'warn-manage', query: {page: this.page}})
      },
      /**
       * [getUserData 获取账户的列表]
       * @return {[type]} [description]
       */
      getUserData() {
        getSysUserList({
          page_num: 1,
          page_size: 0
        }).then(res => {
          this.tableLoadFlag = false
          if (res.code === 200) {
            this.userList = res.data.list
          }
        })
      },
      /**
       * [addRule 添加规则]
       * @return {[type]} [description]
       */
      addRule() {
        let obj = {rule_type: 1, rule_field: 1, rule_eq: 1, rule_value: 0}
        let rule = [...this.warnRuleData.data]
        rule.push(obj)
        this.warnRuleData.data = rule
      },
      /**
       * [deleteRule 删除规则]
       * @return {[type]} [description]
       */
      deleteRule(index) {
        let rule = [...this.warnRuleData.data]
        rule.splice(index, 1)
        this.warnRuleData.data = rule
      },

      /**
       * [save 保存]
       * @return {[type]} [description]
       */
      save(name) {
        this.$refs[name].validate((valid) => {
          if (!valid) {
            this.$Message.error('请检查表单的填写!')
          } else {
            let arr = []
            this.warnRuleData.data.forEach((item, index) => {
                  let form = 'warnRuleData' + index
                  this.$refs[form][0].validate((valid) => {
                    if (valid) {
                      arr.push(true)
                    } else {
                      arr.push(false)
                    }
                  })
            })
            let flag = arr.every((item) => {
              return item === true
            })
            if (flag) {
              if (this.alarm_id) {
                this.amendSaveApi()
              } else {
                this.addSaveApi()
              }
            } else {
              this.$Message.error('请检查表单的填写!')
            }
          }
        })
      },
      /**
       * [amendSaveApi 数据修改]
       * @return {[type]} [description]
       */
      amendSaveApi() {
        this.submitClock = true
        let obj = this.addSaveData()
        obj.alarm_id = this.alarm_id
        amendAlarmApi(obj).then(res => {
          this.submitClock = false
          if (res.code === 200) {
            this.$Message.success({content: '修改成功', duration: 3})
            this.goBack()
          }
        }, err => {
          this.submitClock = false
        })
      },
      /**
       * [addSaveApi 数据新建]
       * @return {[type]} [description]
       */
      addSaveApi() {
        this.submitClock = true
        let obj = this.addSaveData()
        addAlarmApi(obj).then(res => {
          this.submitClock = false
          if (res.code === 200) {
            this.$Message.success({content: '保存成功', duration: 3})
            this.goBack()
          }
        }, err => {
          this.submitClock = false
        })
      },
      /**
       * [addSaveData 数据的保存的初始化]
       * @return {[type]} [description]
       */
      addSaveData() {
        let obj = {}
        obj.name = this.warnData.name // 名称
        obj.scan_target = this.warnData.scan_target // 预警维度
        obj.scan_freq = this.warnData.scan_freq // 时间维度
        obj.rule_type = this.warnData.rule_type // 规则关系
        obj.alarm_count = this.warnData.alarm_count // 预警次数
        obj.alarm_min = this.warnData.alarm_min // 预警间隔
        obj.alarm_user_list = [...this.warnData.alarm_user_list] // 被提醒人
        obj.comment = this.warnData.comment // 备注
        // 数据维度
        let dataDimension = this.warnData.warnSelect
        let val = this.warnData.scan_target
        switch (val) {
          case val = 1:
            obj.alarm_scan_val_list = []
            break
          case val = 2:
            let dateList0 = []
            dataDimension.map(it => {
              let list = it.split('/')
              let obj = {}
              obj.ssp_slot_id = Number(list[0])
              obj.dsp_slot_id = Number(list[1])
              dateList0.push(obj)
            })
            obj.alarm_scan_val_list = dateList0
            break
          case val = 3:
            // 应用的搜索
            let dateList = []
            dataDimension.map(it => {
              let obj = {}
              obj.ssp_app_id = Number(it)
              dateList.push(obj)
            })
            obj.alarm_scan_val_list = dateList
            break
          case val = 4:
            // 广告位
            let dateList1 = []
            dataDimension.map(it => {
              let obj = {}
              obj.ssp_slot_id = Number(it)
              dateList1.push(obj)
            })
            obj.alarm_scan_val_list = dateList1
            break
          case val = 5:
            // 公司
            let dateList2 = []
            dataDimension.map(it => {
              let obj = {}
              obj.dsp_company_id = Number(it)
              dateList2.push(obj)
            })
            obj.alarm_scan_val_list = dateList2
            break
          case val = 6:
            // 预算位
            let dateList3 = []
            dataDimension.map(it => {
              let obj = {}
              obj.dsp_slot_id = Number(it)
              dateList3.push(obj)
            })
            obj.alarm_scan_val_list = dateList3
            break
        }
        let warnRuleData = this.warnRuleData.data
        // 预警规则
        let alarm_rule_list = []
        warnRuleData.map(it => {
          let obj = {}
          obj.rule_field = Number(it.rule_field)
          obj.rule_type = Number(it.rule_type)
          obj.rule_eq = Number(it.rule_eq)
          obj.rule_value = it.rule_type === 3 ? parseInt(it.rule_value * 100) : Number(it.rule_value)
          alarm_rule_list.push(obj)
        })
        obj.alarm_rule_list = alarm_rule_list
        // 时段的修改
        obj.full_time = this.warnData.time_type === 1
        let time = this.time ? this.time.split('').reverse().join('') : '0'
        obj.time_interval = this.warnData.time_type === 1 ? 0 : parseInt(time, 2)
        // 提醒方式
        obj.alarm_type = [...this.warnData.alarm_type].reduce((a, b) => a + b, 0)
        return obj
      },
      /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}       [description]
       */
      limitText(count) {
        return `${count}+`
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .warnDetail
    color #333333

  /deep/ textarea.ivu-input {
    height 120px
  }

  /deep/ .ivu-radio-wrapper-checked {
    color #4083F8
  }

  /deep/ .ivu-checkbox-wrapper-checked {
    color #4083F8
  }

  .hint {
    font-size 13px
    color #999999
  }

  .rule_action {
    margin-left 10px
    font-size 16px
    color #4083F8
  }
</style>
