<template>
  <div>
    <Modal
      title="预算位配置"
      v-model="configStatus"
      :mask-closable="false"
      :close="false"
      @on-cancel="cancel"
      width="1150"
    >
      <div>
        <Form ref="flowRef" :model="flowRef" label-position="left"  :rules="configRule" :label-width="135">
          <FormItem class="deployForm deployText" label="广告位名称">
            {{ad_title}}({{ad_id}})
          </FormItem>
          <FormItem class="deployForm deployText" prop="flow_split" style="margin-bottom: 15px">
            <span slot="label"> 自营SSP流量拆分</span>
            <div class="auto_content">
              <div v-for="(item,index) in infos.flowData" :key="'forms'+index" class="auto_list">
                <div class="auto_active">
                  <div style="display:inline-block">
                    {{ item.name}}
                    <Poptip :transfer="true" placement="bottom-start" width="200">
                      <a href="javascript:void(0)">
                        <Icon type="ios-create-outline"/>
                      </a>
                      <div class="api" slot="content">
                        <div class="autoPop_con">
                          <Input v-model="item.name" style="width: 160px"/>
                        </div>
                      </div>
                    </Poptip>
                  </div>
                  <Input style="width: 50px" v-model="item.proportion"/> <span style="padding:0px 10px">%</span>
                  <span class="auto_action" v-if="index===0" @click="addFlow">
                      <img src="~@/assets/image/split.png" alt="">
                      <span>拆分</span>
                    </span>
                  <span class="auto_action" v-else @click="deleteFlow(index)">
                      <img src="~@/assets/image/delect.png" alt=""></span>
                </div>
              </div>
            </div>
          </FormItem>

          <FormItem v-for="(item,index) in infos.flowData"  :key="'form3'+index"
                    class="deployForm deployText" :label="item.name+'分配'">
            <div style="max-width:998px">
              <Button @click="addSelfBudget(index,item['conf_type'])"
                      style="color:#3F83F7;border: 1px solid #4083F8"
                      icon="md-add">
                增加预算位
              </Button>
              <Button @click="seeDelete(index)"
                      style="color:#4083F8;background: #D9E7FF;margin-right: 10px;border: 0px">
                查看已删除预算位
              </Button>
            </div>
            <!--  eCPM自动的流量分配-->
            <div class="self_table">
              <div class="deploy_list" v-for="(it,i) in infos.flowData[index]['data']['selfActionData']"
                   :key="'selfActionData'+i">
                <!--  eCPM头部的内容-->
                <div class="deploy_header">
                  <div class="deploy_headerText"  @click="unfold(index,i)">
                    <div class="deploy_title">
                      <div class="header_left">
                      <span class="deploy_text">{{it.dsp_slot_name}}
                          <span class="deploy_des" v-show="it.title">({{it.title}})</span>
                      </span>
                        <span>
                        <Tooltip placement="right-start" :transfer="true" max-width="700">
                              <Icon v-if="it.budget_status === 1 || it.budget_status === 4 " type="ios-checkmark-circle" style="color: #339900"/>
                              <Icon v-else type="ios-close-circle" style="color: #F72D17"/>
                                <div slot="content">
                                   <p v-if="it.budget_status === 1 || it.budget_status === 4 " style="font-size: 12px">预算位状态正常,可投放</p>
                                   <p v-else style="font-size: 12px">预算位状态异常,不可投放</p>
                                 </div>
                            </Tooltip>
                      </span>
                      </div>
                      <div class="header_right" v-if="it.capture!==1">
                          <span class="capture_text">
                            <span @click.stop="capture(it['dsp_slot_id'],item['conf_type'],index,i)">捕获广告数据</span>
                         <Tooltip placement="top" :transfer="true" max-width="400">
                             <Icon type="md-help-circle" style="color: #ffffff;font-size: 16px"/>
                               <div slot="content">
                                 <p style="font-size: 12px">捕获上下游的广告请求与返回日志数据<br>注意：此处捕获的广告数据为获取数据时刻的下一分钟起未来约2分钟的广告请求返回日志，包括对媒体和对预算方的请求返回日志，请在捕获成功至少2分钟后下载广告数据</p>
                               </div>
                          </Tooltip>
                       </span>
                        <span>
                            <Tooltip placement="top" :transfer="true" max-width="200">
                              <Icon v-if="it.catch===-1 && it.fetched_data_url"
                                    @click.stop="downCapture(it.fetched_data_url)" type="md-download"
                                    style="color: #ffa320;font-size: 16px"/>
                               <Icon v-else type="md-download"
                                     style="color: #c8c8c8;font-size: 16px"/>
                               <div slot="content">
                                  <p style="font-size: 12px">
                                   <span v-show="it.catch===1">数据获取中</span>
                                   <span v-show="it.catch===-1 && !it.fetched_data_url">请捕获数据</span>
                                   <span v-show="it.catch===-1 && it.fetched_data_url">捕获完成请下载</span>
                                 </p>
                               </div>
                           </Tooltip>
                        </span>

                      </div>
                    </div>
                    <div class="deploy_classify">
                      <div class="classify_list" style="width: 26%">
                        <p class="classify_text">
                          <span class="classify_name">权重:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.control_weight)}}</span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">预算位CPM:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.last_ecpm)}}元</span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">预算位CPC:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.last_cpc)}}元</span>
                        </p>
                      </div>
                      <div class="classify_list" style="width: 30%">
                        <p class="classify_text">
                          <span class="classify_name">请求控制:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.control_req_day)}}次/天</span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">展现控制:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.control_show_day)}}次/天</span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">点击控制:</span>
                          <span class="classify_con classify_num">{{number2ThousandNumber(it.control_click_day)}}次/天</span>
                        </p>
                      </div>
                      <div class="classify_list" style="width: 22%">
                        <p class="classify_text">
                          <span class="classify_name">投放时段:</span>
                          <span class="classify_con classify_zoom">
                           <span v-if="it.control_time_type===2">全时段</span>
                           <span v-else>
                             <Tooltip placement="bottom" :transfer="true" max-width="300">
                                 <span class="underline">自定义</span>
                                <div slot="content">{{hourData(it.control_time_custom)}}</div>
                             </Tooltip>
                             </span>
                            </span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">人群定向:</span>
                          <span class="classify_con classify_zoom">
                           <span v-if="it.defaultCrowd.tag_orientation===0">不限</span>
                             <span v-else>
                             <Tooltip placement="bottom" :transfer="true" max-width="300">
                                  <span class="underline" v-if="it.defaultCrowd.tag_orientation===1">定向</span>
                                  <span class="underline" v-if="it.defaultCrowd.tag_orientation===2">排除</span>
                                <div v-if="it.defaultCrowd.tag_orientation===1" slot="content">定向外流量占比：{{it.defaultCrowd.tag_proportion}}%；逻辑关系：{{it.defaultCrowd.tag_relation ===1 ? '满足其一' : '全部满足'}}；人群标签：{{tagTextData(it.defaultCrowd.tag_list)}}</div>
                                <div v-if="it.defaultCrowd.tag_orientation===2" slot="content">人群标签：{{tagTextData(it.defaultCrowd.tag_list)}}</div>
                             </Tooltip>
                             </span>
                            </span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">地域定向:</span>
                          <span class="classify_con classify_zoom">
                          <span v-if="it.area_type===-1">不限</span>
                           <span v-else>
                             <Tooltip placement="bottom" :transfer="true" max-width="300">
                                  <span v-if="it.area_type===1" class="underline">定向</span>
                                  <span v-if="it.area_type===2" class="underline">排除</span>
                                <div slot="content">{{areaData(it.cityList)}}</div>
                             </Tooltip>
                           </span>
                        </span>
                        </p>
                      </div>
                      <div class="classify_list" style="width: 22%">
                        <p class="classify_text">
                          <span class="classify_name">品牌定向:</span>
                          <span class="classify_con classify_zoom">
                           <span v-if="it.brand_type===-1">不限</span>
                           <span v-else>
                                 <Tooltip placement="bottom" :transfer="true" max-width="300">
                                 <span v-if="it.brand_type===1" class="underline">定向</span>
                                 <span v-if="it.brand_type===2" class="underline">排除</span>
                                <div slot="content">{{brandData(it.phoneList)}}</div>
                             </Tooltip>
                           </span>
                        </span>
                        </p>
                        <p class="classify_text" v-show="deployData['os_type']==='Android'">
                          <span class="classify_name">老旧机型:</span>
                          <span class="classify_con classify_zoom">
                                <span v-if="it.checkPhone===-1">不限</span>
                           <span v-else>
                              <span>屏蔽</span>
                           </span>
                            </span>
                        </p>
                      </div>
                      <div class="classify_list">
                        <p class="classify_text">
                          <span class="classify_name">尺寸比例检验:</span>
                          <span class="classify_con classify_zoom" style="max-width: 80px;">
                              <Icon v-if="it.ratio_is_ok === -1" type="ios-close-circle" style="color: #F72D17"/>
                              <Icon v-else type="ios-checkmark-circle" style="color: #339900"/>
                              {{ it.width_ratio}}:{{it.height_ratio}}
                           </span>
                        </p>
                        <p class="classify_text">
                          <span class="classify_name">Deal组:</span>
                          <span class="classify_con classify_zoom" style="max-width: 120px;">
                              <span v-if="!it.dg_id">无</span>
                              <span v-else>
                                <span v-for="item in dealList" :key="'搜索'+item.id" v-if="item.id===it.dg_id" :title="item.name">{{item.name}}</span>
                              </span>
                            </span>
                        </p>
                      </div>
                    </div>
                    <div class="deploy_status">
                      <Icon v-if="it.downStatus === 1" type="ios-arrow-forward"/>
                      <Icon v-else type="ios-arrow-down"/>
                    </div>
                  </div>
                  <div v-if="!it.test_plan_id" class="deploy_delete" @click="deleteSelfBudget(index,i)">
                    删除
                  </div>
                  <div v-else class="deploy_delete deploy_test">
                    <span>测试中勿操作</span>
                  </div>
                </div>
                <Form :ref="'flowData' + index + i" :model="item" :rules="infos.ruleValidate" :label-width="0">
                  <!--  eCPM的展开操作部分-->
                  <FormItem prop="flowDataList" :rules="{required: true, index: index, i: i,  validator: flowDataListRule}">
                    <div class="deploy_content" v-show="it.downStatus===2">
                      <div class="deploy_box">
                        <div class="box_list">
                          <span class="deploy_slot">预算位：</span>
                          <span class="slot_name">{{it.dsp_slot_name}}</span>
                          <Button class="slot_select" type="primary"
                                  @click="slotSelect(it['dsp_slot_id'],item['conf_type'],index,i)">选择
                          </Button>
                        </div>
                        <div class="box_list">
                          <span class="deploy_slot">尺寸比例检验
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指所选预算位与当前广告位尺寸比例需要一致，且可以有上下5%的比例浮动，超过5%，则不匹配，无法提交</p>
                                 </div>
                               </Tooltip>
                           </span>
                          {{ it.width_ratio}}:{{it.height_ratio}}
                          <span>
                        <Tooltip placement="right-start" :transfer="true" max-width="700">
                              <Icon v-if="it.ratio_is_ok === -1 " type="ios-close-circle" style="color: #F72D17"/>
                              <Icon v-else type="ios-checkmark-circle" style="color: #339900"/>
                                <div slot="content">
                                   <p v-if="it.ratio_is_ok === 1 " style="font-size: 12px">表示广告位与预算位尺寸匹配</p>
                                   <p v-else style="font-size: 12px">表示广告位与预算位尺寸不匹配</p>
                                 </div>
                            </Tooltip>
                      </span>

                        </div>
                        <div class="box_list">
                          <span class="deploy_slot">权重
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">默认为0，以历史ecpm值倒序排序；权重值大于0时，值越大，越优先展示该预算位的广告</p>
                                 </div>
                               </Tooltip>
                           </span>
                          <Poptip trigger="focus">
                            <InputNumber :min="0" :max="1000" v-model="it.control_weight"
                                         style="width: 150px"/>
                            <div slot="content">{{ formatNumber(it.control_weight) }}</div>
                          </Poptip>
                        </div>
                      </div>
                      <div class="deploy_box">
                        <div class="box_list">
                         <span class="deploy_slot">请求控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的请求最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                          <Poptip trigger="focus">
                            <InputNumber :min="0" v-model="it.control_req_day"
                                         style="width: 150px"/>
                            <span style="font-size: 13px">次/天</span>
                            <div slot="content">{{ formatNumber(it.control_req_day) }}</div>
                          </Poptip>
                        </div>
                        <div class="box_list">
                        <span class="deploy_slot">展现控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的展现最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                          <Poptip trigger="focus">
                            <InputNumber :min="0" v-model="it.control_show_day"
                                         style="width: 150px"/>
                            <span style="font-size: 13px">次/天</span>
                            <div slot="content">{{ formatNumber(it.control_show_day) }}</div>
                          </Poptip>
                        </div>
                        <div class="box_list">
                         <span class="deploy_slot">点击控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的点击最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                          <Poptip trigger="focus">
                            <InputNumber :min="0" v-model="it.control_click_day"
                                         style="width: 150px"/>
                            <span style="font-size: 13px">次/天</span>
                            <div slot="content">{{ formatNumber(it.control_click_day) }}</div>
                          </Poptip>
                        </div>
                      </div>
                      <div class="deploy_box">
                        <div class="box_list">
                          <span class="deploy_slot">价格浮动系数
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位配置当前预算位参与竞价时，CPM出价的浮动系数，范围是(0%,200%]，默认100%，表示CPM出价不浮动；最终出价为CPM出价*价格浮动系数</p>
                                 </div>
                               </Tooltip>
                           </span>
                          <InputNumber style="width: 150px" v-model="it.price_float" :max="200" :min="1"/>
                          <span>%</span>
                        </div>
                      </div>
                      <div class="deploy_box deploy_line">
                        <div class="xuan_title">Deal组
                          <Tooltip placement="top" :transfer="true" max-width="300">
                            <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>
                            ：
                            <div slot="content">
                              <p style="font-size: 12px">指该媒体的广告位设置了DealID，投放广告时，需要运营选择合适的Deal组进行投放</p>
                            </div>
                          </Tooltip>
                        </div>
                        <div class="xuan_content" style="display: flex">
                          <Select v-model="it.dg_id" filterable clearable style="width: 300px">
                            <Option v-for="item in dealList" :value="item.id" :key="item.created_at + index">{{item.name }}</Option>
                          </Select>
                          <Alert v-if="dealList && dealList.length>0" class="deal_alert" show-icon>
                            该广告位已配置DealID，如有需要，请选择合适的Deal组
                          </Alert>
                        </div>
                      </div>
                      <div class="deploy_box deploy_line">
                        <div class="xuan_title">投放时段:</div>
                        <div class="xuan_content">
                          <RadioGroup v-model="it.control_time_type">
                            <Radio :label="2">
                              <span>全时段</span>
                            </Radio>
                            <Radio :label="1">
                              自定义
                            </Radio>
                          </RadioGroup>
                          <div v-show="it.control_time_type === 1" style="margin-top: 10px">
                            <ry-time-sheet :id="it.timeID" v-model="it.control_time_custom"/>
                          </div>
                        </div>
                      </div>
                      <div class="deploy_box deploy_line">
                        <div class="xuan_title">人群定向:</div>
                        <div class="xuan_content" style="width: 100%">
                          <crowd-control :errShow="false" :defaultCrowd="it.defaultCrowd" :crowdTagArr="tagListData" @on-form-validate="getCrowdControl($event,index,i)"></crowd-control>
                        </div>
                      </div>

                      <div class="deploy_box deploy_line">
                        <div class="xuan_title">品牌定向:</div>
                        <div class="xuan_content">
                          <RadioGroup v-model="it.brand_type" @on-change="statusChange">
                            <Radio :label="-1">不限</Radio>
                            <Radio :label="1">定向</Radio>
                            <Radio :label="2">排除</Radio>
                          </RadioGroup>
                          <div v-show="it.brand_type !==-1" style="margin-top: 10px">
                            <retarget-muti-cascader-ad-slot ref="proCity"
                                                            class="m-l-20"
                                                            v-model="it.brand_ids"
                                                            :datas="it.phoneList"
                                                            :title="phoneString"
                                                            :order="orderText"
                                                            :childrenTitle="phoneString"
                                                            @input="updateCity"
                                                            @name="updateCityName"/>
                          </div>
                        </div>
                      </div>
                      <div :class="deployData['os_type']==='Android' ? 'deploy_box deploy_line' : 'deploy_box'">
                        <div class="xuan_title">地域定向:</div>
                        <div class="xuan_content">
                          <RadioGroup v-model="it.area_type" @on-change="statusChange">
                            <Radio :label="-1">不限</Radio>
                            <Radio :label="1">定向</Radio>
                            <Radio :label="2">排除</Radio>
                          </RadioGroup>
                          <div v-show="it.area_type !==-1" style="margin-top: 10px">
                            <retarget-muti-cascader-ad-slot ref="proCity"
                                                            class="m-l-20"
                                                            v-model="it.area_codes"
                                                            :datas="it.cityList"
                                                            :title="cityString"
                                                            :order="orderText"
                                                            :childrenTitle="cityChildren"
                                                            @input="updateCity"
                                                            @name="updateCityName"/>
                          </div>
                        </div>
                      </div>
                      <div class="deploy_box" v-show="deployData['os_type']==='Android'">
                        <div class="xuan_title">老旧机型:</div>
                        <RadioGroup v-model="it.checkPhone" @on-change="statusChange">
                          <Radio :label="-1">不限</Radio>
                          <Radio :label="1">屏蔽</Radio>
                        </RadioGroup>
                        <span style="color:#999999">( 老旧机型为机型覆盖率排名top100+的机型 )</span>
                      </div>
                    </div>
                  </FormItem>
                </Form>
              </div>
            </div>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" class="configBottom">
        <Button @click="cancel">取消</Button>
        <Button type="primary" :loading="submitSave" @click="save('flowRef',1)">
          <span v-if="!submitSave">保存</span>
          <span v-else>保存中...</span>
        </Button>
        <Button class="savePass" :loading="submitPass" type="primary"
                v-if="status === 3 || status === 4"
                @click="save('flowRef',2)">
          <span v-if="!submitPass">保存并通过</span>
          <span v-else>保存并通过中...</span>
        </Button>
      </div>
    </Modal>
    <selectBudget v-model="modalSelect" :sizeRatio="size_ratio" :dataList="deployData" :ids="parseInt(selected_id)" :deleteArr="except_dsp_slot_id"  @name="selectSuccess"/>
    <configDelete v-model="deleteStatus" :ids="parseInt(slot_id)" :index="deleteIndex" :deleteArr="except_dsp_slot_id"
                  @name="seeSuccess"/>
  </div>
</template>

<script>
  import {formRules} from '../../data/adConfig'
  import {number2Thousand} from '@/libs/tools'
  import {submitControlApi, getFetchRealData, getDealList, getSspSlotConfigData} from '@/api/ssp'
  import { getCrowdTagList } from '@/api/tag'
  import RyTimeSheet from '@/components/ry-time-sheet/hourSheet.vue'
  import retargetMutiCascaderCity from '@/components/retarget-cascader-city'
  import configDelete from '../deleteConfig'
  import selectBudget from '../selectBudget'
  import retargetMutiCascaderAdSlot from '@/components/cascader-retarget'
  import {getProvinceCityApi, getPhoneBrand} from '@/api/common'
  import crowdControl from '@/components/control/crowd/index.vue'
  export default {
    name: 'config_budget',
    components: {RyTimeSheet, crowdControl, retargetMutiCascaderCity, configDelete, retargetMutiCascaderAdSlot, selectBudget},
    mixins: [formRules],
    props: {
      value: {
        type: Boolean,
        default: false
      },
      configData: {
        type: Object
      }
    },
    data() {
      return {
        except_dsp_slot_id: [],
        dealList: [],
        modalSelect: false,
        deleteStatus: false,
        deleteIndex: '',
        deleteID: '',
        phoneString: '手机品牌',
        cityString: '省份',
        cityChildren: '城市',
        orderText: 'first',
        ad_title: '',
        status: '',
        ad_id: '',
        ad_type: '',
        ad_type_text: '',
        timeModel: false,
        configStatus: this.value,
        timeWeeks: '',
        slot_id: null,
        timeDefault: '',
        timeIndex: null,
        timeFinally: null,
        industryList: [], // 预算位
        submitSave: false,
        submitPass: false,
        infos: {
          flowData: [{
            name: '流量1',
            proportion: 100,
            conf_type: 1,
            data: {
              selfActionData: []
            }
          }],
          ruleValidate: {}
        },
        flowRef: {},
        selfActionData: {},
        size_ratio: [],
        configDataList: {},
        seeIndex: 1,
        provinceCityList: [],
        phoneBrandList: [],
        selected_id: '',
        deployData: {},
        successIndex: 1,
        tagListData: [] // 标签的列表
      }
    },
    methods: {
      /**
       * [flowDataListRule 配置的验证]
       * @return {[type]} [description]
       */
      flowDataListRule(rule, value, callback) {
        let index = rule.index
        let i = rule.i
        let showTxt = ''
        let curArr = [...this.infos.flowData]
        let dateItem = curArr[index].data.selfActionData[i]
        let time = parseInt(dateItem.control_time_custom, 2)
        if (dateItem.dsp_slot_id[0] === '0' || dateItem.dsp_slot_id.length === 0) {
          showTxt = '请选择预算位'
        }
        if (dateItem.ratio_is_ok === -1 || dateItem.ratio_is_ok === '-1') {
          showTxt = '尺寸比例检验不通过'
        }
        if (dateItem.price_float <= 0 || dateItem.price_float > 200 || dateItem.price_float % 1 !== 0) {
          showTxt = '价格浮动系数必须是1~200中的任意整数'
        }
        if (dateItem.control_weight < 0 || dateItem.control_weight > 1000 || dateItem.control_weight % 1 !== 0) {
          showTxt = '权重必须0~1000的任意整数'
        }
        if (dateItem.control_show_day < 0 || dateItem.control_show_day % 1 !== 0) {
          showTxt = '展现控制必须大于0的任意整数'
        }
        if (dateItem.control_click_day < 0 || dateItem.control_click_day % 1 !== 0) {
          showTxt = '点击控制必须是大于0的任意整数'
        }
        if (!dateItem.control_time_type) {
          showTxt = '请选择时段控制'
        }
        if (dateItem.control_time_type === 1) {
          if (!time || time === 0) {
            showTxt = '请选择自定义时段'
          }
        }
        if (dateItem.defaultCrowd.tag_orientation === 1) {
          if (dateItem.defaultCrowd.tag_proportion < 0 || dateItem.defaultCrowd.tag_proportion > 100 || dateItem.defaultCrowd.tag_proportion % 1 !== 0) {
            showTxt = '定向外流量占比必须是0~100的的任意整数'
          }
          if (!dateItem.defaultCrowd.tag_list.length) {
            showTxt = '人群标签至少填写一条'
          }
        } else if (dateItem.defaultCrowd.tag_orientation === 2) {
          if (!dateItem.defaultCrowd.tag_list.length) {
            showTxt = '人群标签至少填写一条'
          }
        }
        if (dateItem.brand_type !== -1 && dateItem.brand_ids.length === 0) {
          showTxt = '请选择品牌定向'
        }
        if (dateItem.area_type !== -1 && dateItem.area_codes.length === 0) {
          showTxt = '请选择地域定向'
        }
        if (showTxt) {
          callback(new Error(showTxt))
        } else {
          callback()
        }

      },
      /**
       * [formatNumber 变成千分位]
       * @return {[type]} [description]
       */
      formatNumber (value) {
        if (value === '') return ' '
        return this.number2ThousandNumber(value)
      },
      number2Thousand(num) {
        // 非零/ 正负无穷
        if (!num || num === Infinity || num === -Infinity) {
          return 0
        } else {
          if (Number.isInteger(num)) {
            return parseInt(num)
          } else {
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
          }
        }
      },
      /**
       * [number2ThousandNumber 变成千分位]
       * @return {[type]} [description]
       */
      number2ThousandNumber(num) {
        if (!num || num === Infinity || num === -Infinity) {
          return 0
        } else {
          if (Number.isInteger(num)) {
            return parseInt(num).toLocaleString() // 数字
          } else {
            return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') // 字符串
          }
        }
      },
      /**
       * [hourData 获取自定义的时间段]
       * @return {[type]} [description]
       */
      hourData(hour) {
        let arr1 = []
        let arr2 = []
        let textArr = []
        let hourArr = []
        for (let i = 0; i < hour.length; i++) {
          if (hour[i] === '1') {
            arr1.push(i)
            arr2.push(i + 1)
            textArr.push(i)
            textArr.push(i + 1)
          }
        }
        let combine_arr = [...new Set(textArr)]
        let intersection_arr = arr1.filter(value => new Set(arr2).has(value))
        hourArr = combine_arr.filter(value => !new Set(intersection_arr).has(value))
        let text = []
        hourArr.map((it, i) => {
          if (i % 2 === 0) {
            let title = it + ':00~' + hourArr[i + 1] + ':00'
            text.push(title)
          }
        })
        let word = text.toString()
        return word
      },
      /**
       * [areaData 获取自定义的城市]
       * @return {[type]} [description]
       */
      areaData(datas) {
        let cityData = []
        datas.map(item => {
          if (item.little || item.check) {
            if (item.children) {
              item.children.map(it => {
                if (it.check) {
                  cityData.push(it.label)
                }
              })
            }
          }
        })
        return cityData.toString()

      },
      /**
       * [brandData 获取自定义的品牌]
       * @return {[type]} [description]
       */
      brandData(datas) {
        let brand = []
        datas.map(item => {
          if (item.check) {
            brand.push(item.label)
          } else {
            if (item.little) {
              item.children.map(it => {
                if (it.check) {
                  brand.push(it.label)
                }
              })
            }
          }
        })
        return brand.toString()
      },
      /**
       * [brandData 获取自定义的品牌]
       * @return {[type]} [description]
       */
      tagTextData(data) {
        let tagList = this.tagListData
        let tagText = []
        tagList.map(item => {
          if ([...data].indexOf(item.code) > -1) {
            tagText.push(item.name)
          }
        })
        return tagText.toString()
      },
      /**
       * [getDealListData 获取dealid]
       * @return {[type]} [description]
       */
      getDealListData() {
        let ssp_slot_ids = []
        ssp_slot_ids.push(parseInt(this.slot_id))
        let params = {
          ssp_slot_ids: ssp_slot_ids,
          page_size: 0,
          page_num: 1
        }
        getDealList(params).then(res => {
          let data = res.data
          if (res.code === 200) {
            this.dealList = data.list
          }
        })
      },
      /**
       * [cancel 关闭弹框]
       * @return {[type]} [description]
       */
      cancel() {
        this.$emit('input', false)
      },
      /**
       * [capture 点击捕获数据]
       * @return {[type]} [description]
       */
      capture(id, type, index, i) {
        let obj = {}
        obj.ssp_slot_id = parseInt(this.slot_id)
        obj.dsp_slot_id = parseInt(id[1])
        this.$Modal.confirm({
          title: '确定要捕获该位置的广告数据么？确认后，将成功发起数据捕获，请至少2分钟后下载广告数据。',
          onOk: () => {
            getFetchRealData(obj).then(data => {
              if (data.code === 200) {
                let curArr = [...this.infos.flowData]
                let listData = {}
                listData = curArr[index].data.selfActionData[i]
                listData.catch = 1
                this.infos.flowData = curArr
                this.$Message.success('捕获成功')
              }
            })
          },
          onCancel: () => {

          }
        })
      },
      /**
       * [downCapture 点击下载捕获数据]
       * @return {[type]} [description]
       */
      downCapture(url) {
        window.location.href = url
      },

      /**
       * [getprovinceCityList 获取省市的列表]
       * @return {[type]} [description]
       */
      getProvinceCityList(val) {
        getProvinceCityApi().then(data => {
          if (data.code === 200) {
            this.provinceCityList = data.data.list
            this.getConfigurationData()
          }
        })
      },
      /**
       * [getPhoneBrandList 获取手机品牌的列表]
       * @return {[type]} [description]
       */
      getPhoneBrandList() {
        getPhoneBrand().then(data => {
          this.phoneBrandList = data.data.list
        })
      },
      /**
       * [getCrowdTagList 获取标签列表]
       * @param  {[type]} query [description]
       * @return {[type]}       [description]
       */
      getCrowdTagList() {
        getCrowdTagList().then(res => {
          if (res.code === 200) {
            this.tagListData = res.data.list || []
          }
        })
      },
      /**
       * [statusChange 选择时重新赋值]
       * @return {[type]} [description]
       */
      statusChange() {
        let data = [...this.infos.flowData]
        this.infos.flowData = data
      },
      /**
       * [seeDelete 查看已删除的列表]
       * @return {[type]} [description]
       */
      seeDelete(index) {
        let data = this.infos.flowData
        let searchDsp = []
        Object.keys(data).forEach(k => {
            let selfActionData = data[k].data.selfActionData
            Object.keys(selfActionData).forEach(h => {
              searchDsp.push(selfActionData[h].dsp_slot_id[1])
            })
        })
        this.except_dsp_slot_id = searchDsp
        this.deleteIndex = index
        this.deleteStatus = !this.deleteStatus
      },
      /**
       * [seeSuccess 删除的预算位的重新赋值]
       * @return {[type]} [description]
       */
      seeSuccess(row) {
        let dataList = [...this.infos.flowData]
        let obj = row
        let index = this.deleteIndex
        this.successIndex = this.successIndex + 1
        obj.dsp_slot_id = [(row.dsp_company_id).toString(), (row.dsp_slot_id).toString()] // 预算位的赋值
        let size_ratio = row.width_ratio && row.height_ratio ? number2Thousand(row.width_ratio / row.height_ratio) : 0
        obj.size_ratio = size_ratio // 尺寸比列的书写
        let scale = this.size_ratio.map(item => {
          return Number(item.scale)
        })
        let scaleStatus = 1
        scale.forEach(item => {
          if (Math.abs(size_ratio - item) < 0.05) {
            scaleStatus = 2
          }
        })
        obj.ratio_is_ok = scaleStatus === 1 ? -1 : 1
        // 时间段的修改
        let control_time_custom = obj.control_time_custom.split('').reverse().join('')
        obj.control_time_custom = control_time_custom
        // 时段控制的id
        obj.timeID = 'modaldeleteTimeID' + this.successIndex
        // 城市定向
        obj.area_type = row.area_type ? row.area_type : -1
        obj.brand_type = row.brand_type ? row.brand_type : -1
        obj.tag_relation = row.tag_relation ? row.tag_relation : 1
        obj.cityList = this.getCityList()
        obj.area_codes = row.area_type !== -1 ? row.area_codes.split(',') : []
        obj.area_text = row.area_type !== -1 ? row.area_text : ''
        // 手机定向的测试
        obj.phoneList = this.getPhoneList()
        obj.brand_ids = row.brand_type !== -1 ? row.brand_ids.split(',') : []
        obj.brand_text = row.brand_type !== -1 ? row.brand_text : ''
        obj.downStatus = 1
        obj.budget_status = row.dsp_slot_status
        let type = row.os_type === 1 ? 'Android' : row.os_type === 2 ? 'ios' : '不限'
        obj.title = 'ID:' + row.dsp_slot_id[1] + '，终端:' + type

        // 人群定向
        let objCrowd = {}
        objCrowd.tag_orientation = row.tag_orientation
        objCrowd.tag_proportion = row.tag_proportion
        objCrowd.tag_relation = row.tag_relation ? row.tag_relation : 1
        objCrowd.tag_list = row.tag_list ? row.tag_list : []
        obj.defaultCrowd = objCrowd

        // obj.tag_list = row.tag_list && row.tag_list.length > 0 ? row.tag_list : ['']
        obj.catch = row.catch === 1 ? 1 : -1
        obj.capture = 1
        // 屏蔽老旧机型
        obj.checkPhone = row.check_old_phone ? row.check_old_phone : -1
        dataList[index].data.selfActionData.push(obj)
        this.infos.flowData = dataList
      },
      /**
       * [selectSuccess 选择预算位]
       * @return {[type]} [description]
       */
      slotSelect(id, type, index, i) {
        this.selected_id = Number(id[1])
        this.radio_type = type
        this.radio_index = index
        this.radio_i = i
        let data = this.infos.flowData
        let searchDsp = []
        // 删选已经存在的ID
        data.map(item => {
          let actionData = []
         actionData = item.data.selfActionData
          actionData.map(it => {
            searchDsp.push(Number(it.dsp_slot_id[1]))
          })
        })
        this.except_dsp_slot_id = searchDsp
        this.modalSelect = !this.modalSelect
      },
      /**
       * [selectSuccess 选择预算位成功的返回]
       * @return {[type]} [description]
       */
      selectSuccess(selectedData) {
        let curArr = [...this.infos.flowData]
        let scale = this.size_ratio.map(item => {
          return Number(item.scale)
        })
        let listData = {}
        listData = curArr[this.radio_index].data.selfActionData[this.radio_i]
        let _temp = selectedData.ad_ratio[selectedData.ad_ratio.length - 1]
        listData.size_ratio = _temp ? Number(this.number2Thousand(_temp.width / _temp.height)) : 0
        // 判断尺寸比列的修改
        if (listData.size_ratio) {
          let scaleStatus = 1
          scale.forEach(item => {
            if (Math.abs(listData.size_ratio - item) < 0.05) {
              scaleStatus = 2
            }
          })
          listData.ratio_is_ok = scaleStatus === 2 ? 1 : -1
        } else {
          listData.ratio_is_ok = -1
        }
        listData.budget_status = selectedData.status // 预算位是否正常
        let type = selectedData.os_type === 1 ? 'Android' : selectedData.os_type === 2 ? 'ios' : '不限'
        listData.dsp_slot_name = selectedData.dsp_slot_name // 预算位的名称
        listData.os_type = selectedData.os_type // 预算位的操作系统
        listData.ad_type_text = selectedData.ad_type // 预算位的样式文本
        listData.ad_type_id = Number(selectedData.ad_type_id) // 预算位的样式ID
        listData.title = 'ID:' + selectedData.id + '，终端:' + type
        listData.dsp_slot_id = [(selectedData.dsp_company_id).toString(), (selectedData.id).toString()] // 预算位的id
        listData.last_cpc = selectedData.last_cpc //
        listData.last_ecpm = selectedData.last_ecpm
        listData.width_ratio = _temp.width
        listData.height_ratio = _temp.height
        this.infos.flowData = curArr
      },

      /**
       * [getPhoneList 获取手机品牌]
       * @return {[type]} [description]
       */
      getPhoneList() {
        let PhoneArr = this.phoneBrandList
        let phoneList = PhoneArr.map((i, index) => {
          let obj = {}
          obj.value = (i.id).toString()
          obj.label = i.name
          obj.check = false
          obj.little = false
          return obj
        })
        return phoneList
      },
      /**
       * [getCityList 省市定向的列表的初始化加载]
       * @return {[type]} [description]
       */
      getCityList() {
        let provinceArr = this.provinceCityList
        let provinceList = provinceArr.map(i => {
          let obj = {}
          obj.value = i.value
          obj.label = i.label
          obj.check = false
          obj.little = false
          obj.childrenName = '城市'
          obj.type = 'app'
          obj.children = []
          i.children.map(item => {
            let objs = {}
            objs.value = item.value
            objs.label = item.label
            objs.fatherCitylabel = i.label
            objs.childrenCitylabel = item.label
            objs.check = false
            objs.type = 'cityChildren'
            objs.little = false
            obj.children.push(objs)
          })
          return obj
        })
        return provinceList
      },

      updateCity() {
      },
      updateCityName(val) {
      },
      // 获取广告样式
      creativeId2Text(id) {
        let _arr = this.$store.state.app.adStyleData
        // eslint-disable-next-line eqeqeq
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [getConfigurationData 获取配置页面的数据]
       * @return {[type]} [description]
       */
      getConfigurationData() {
        let slot_id = parseInt(this.slot_id)
        getSspSlotConfigData({
          slot_id
        }).then(data => {
          let date = data
          if (date.code === 200) {
            let list = date.data
            this.ad_title = list.ssp_slot_name
            this.slot_id = list.ssp_slot_id
            this.ad_id = list.ssp_slot_id
            this.status = list.status
            this.ad_type = list.ad_type
            this.os_type = list.os_type
            this.ad_type_text = list.ad_type_text
            this.deployData = {os_type: list.os_type, ad_type: list.ad_type}
            // 尺寸比列的赋值
            if (list.ad_ratio && list.ad_ratio.length > 0) {
              this.size_ratio = (list.ad_ratio).map((item, index) => {
                item.scale = Number(number2Thousand(item.width / item.height))
                return item
              })
            } else {
              this.size_ratio = []
            }
            let dataList = []
            // 资源分配的赋值
            if (list.controller.length > 0) {
              let controllerData = list.controller
              controllerData.map((it, index) => {
                let obj = it
                let data = {
                  selfActionData: []
                }
                 data.selfActionData = this.getResourceList(it.controller_list)
                obj.data = data
                dataList.push(obj)
              })
              this.infos.flowData = dataList
            } else {
              this.infos.flowData = [{
                name: '自营ssp流量1',
                proportion: 100,
                conf_type: 1,
                data: {
                  selfActionData: [],
                  handActionData: []
                }
              }]
            }
          }
        })
      },

      /**
       * [getConfigurationData 配置初始化复值的时候的时候流量的分配]
       * @return {[type]} [description]
       */
      getResourceList(data) {
        let controllerList = data
        let dataList = controllerList.map((item, q) => {
          let type = item.os_type === 1 ? 'Android' : item.os_type === 2 ? 'ios' : '不限'
          item.name = item.dsp_slot_name // 名称的展示
          item.title = 'ID:' + item.dsp_slot_id + '，终端:' + type // 名称后面的提示
          item.dsp_slot_id = [(item.dsp_company_id).toString(), (item.dsp_slot_id).toString()] // 预算位默认赋值
          let sizeRatio = item.width_ratio && item.height_ratio ? number2Thousand(item.width_ratio / item.height_ratio) : 0
          item.size_ratio = sizeRatio // 尺寸比列的计算
          item.budget_status = item.dsp_slot_status
          let controlCustom = item.control_time_custom.split('').reverse().join('')
          item.control_time_custom = controlCustom // 时段的选择
          item.timeID = 'timeID' + item.dsp_slot_id[1] + q
          // 城市的选择判断
          item.cityList = this.getCityList()
          item.area_type = item.area_type ? item.area_type : -1
          item.brand_type = item.brand_type ? item.brand_type : -1
          item.tag_relation = item.tag_relation ? item.tag_relation : 1
          let areaCodes = item.area_codes ? typeof (item.area_codes) === 'object' ? [...item.area_codes] : item.area_codes.split(',') : []
          item.area_codes = item.area_type !== -1 ? areaCodes : []
          item.area_text = item.area_type !== -1 ? item.area_text : ''
          // 手机品牌的选择
          item.phoneList = this.getPhoneList()
          item.downStatus = 1

          let brandId = item.brand_ids ? typeof (item.brand_ids) === 'object' ? [...item.brand_ids] : item.brand_ids.split(',') : []
          item.brand_ids = item.brand_type !== -1 ? brandId : []
          item.brand_text = item.brand_type !== -1 ? item.brand_text : ''
          // 人群定向
          let objCrowd = {}
          objCrowd.tag_orientation = item.tag_orientation
          objCrowd.tag_proportion = item.tag_proportion
          objCrowd.tag_relation = item.tag_relation ? item.tag_relation : 1
          objCrowd.tag_list = item.tag_list ? item.tag_list : []
          item.defaultCrowd = objCrowd
          // item.tag_list = item.tag_list && item.tag_list.length > 0 ? item.tag_list : ['']
          // 捕获数据
          item.catch = item.catch === 1 ? 1 : -1
          // 屏蔽老旧机型
          item.checkPhone = item.check_old_phone ? item.check_old_phone : -1
          return item
        })
        return dataList
      },
      /**
       * [getCrowdControl 人群定向的修改]
       * @return {[type]} [description]
       */
      getCrowdControl(obj, index, i) {
        let curArr = [...this.infos.flowData]
        let dataList = curArr[index].data.selfActionData[i].defaultCrowd
        let {valid, form} = obj
        dataList.tag_orientation = form.tag_orientation
        dataList.tag_proportion = form.tag_proportion || 0
        dataList.tag_relation = form.tag_relation || 1
        dataList.tag_list = form.tag_list || []
        this.infos.flowData = curArr
      },
      /**
       * [save 保存按钮的添加]
       * @return {[type]} [description]
       */
      save(name, pass) {
        this.$refs[name].validate((valid) => {
          if (!valid) {
            this.$Message.error('请检查表单的填写!')
          } else {
            let arr = []
            this.infos.flowData.forEach((item, index) => {
              item.data.selfActionData.forEach((data, key) => {
                let form = 'flowData' + index + key
                this.$refs[form][0].validate((valid) => {
                  if (valid) {
                    arr.push(true)
                  } else {
                    arr.push(false)
                  }
                })
              })
            })
            let flag = arr.every((item) => {
              return item === true
            })
            if (flag) {
              if (pass === 1) {
                this.submitSave = true
              } else {
                this.submitPass = true
              }
              this.errData(pass)
            } else {
              this.$Message.error('请检查表单的填写!')
            }
          }
        })
      },
      // 获取os_type 与 ad_type_id 不正确的事件
      errData(pass) {
        let data = this.infos.flowData
        let osType = this.os_type === 'Android' ? 1 : 2
        let adType = this.ad_type
        let errOsList = []
        let errAdList = []
        Object.keys(data).forEach(k => {
          let actionData = []
          actionData = data[k].data.selfActionData
          Object.keys(actionData).forEach(h => {
            if (actionData[h].ad_type_id !== adType) {
              errAdList.push(actionData[h])
            }
            if (actionData[h].os_type !== 0 && actionData[h].os_type !== osType) {
              errOsList.push(actionData[h])
            }
          })
        })
        let html = ''
        if (errOsList.length > 0 || errAdList.length > 0) {
          Object.keys(errOsList).forEach(h => {
            let type = errOsList[h].os_type === 1 ? 'Android' : 'IOS'
            html += '<p style="font-size:14px;color:#333;line-height: 25px">当前广告位所配置的预算位：【' + errOsList[h].name + '】的应用平台是【' + type + '】，与当前广告位应用平台【' + this.os_type + '】不符</p>'
          })
          Object.keys(errAdList).forEach(h => {
            html += '<p style="font-size:14px;color:#333;line-height: 25px">当前广告位所配置的预算位：【' + errAdList[h].name + '】的广告场景是【' + errAdList[h].ad_type_text + '】，与当前广告位应用平台【' + this.ad_type_text + '】不符</p>'
          })
          html += '<p>确认提交么？</p>'
          this.$Modal.confirm({
            title: html,
            className: 'vertical-center-modal',
            width: 600,
            onOk: () => {
              this.submitData(pass)
            },
            onCancel: () => {
              if (pass === 1) {
                this.submitSave = false
              } else {
                this.submitPass = false
              }
            }
          })
        } else {
          this.submitData(pass)
        }
      },
      // 提交数据
      submitData(pass) {
        let obj = {}
        if (this.status === 3 || this.status === 4) {
          if (pass === 2) {
            obj.status = 1
          }
        }
        obj.slot_id = parseInt(this.slot_id)
        let data = this.infos.flowData
        let controller = []
        Object.keys(data).forEach(k => {
          let obj1 = {}
          obj1.proportion = parseInt(data[k].proportion)
          obj1.conf_type = data[k].conf_type
          obj1.name = data[k].name
          let controllerList = []
            let selfActionData = data[k].data.selfActionData
            controllerList = this.saveResource(selfActionData, 1)
            obj1.controller_list = controllerList
            controller.push(obj1)
        })
        if (controller[0].controller_list.length > 0) {
          obj.controller = controller
        } else {
          obj.controller = []
        }
        submitControlApi(obj).then(data => {
          let register = data
          if (register.code === 200) {
            if (pass === 1) {
              this.submitSave = false
            } else {
              this.submitPass = false
            }
            this.$Message.success('配置成功')
            this.$emit('success')
            this.$emit('input', false)
          }
          // eslint-disable-next-line handle-callback-err
        }, error => {
          if (pass === 1) {
            this.submitSave = false
          } else {
            this.submitPass = false
          }
          this.$emit('input', false)
        })
      },
      /**
       * [saveResource 提交时流量的拆分]
       * @return {[type]} [description]
       */
      saveResource(data, type) {
        let resource = []
        data.map((item, index) => {
          let obj = {}
          obj.dsp_company_id = Number(item.dsp_slot_id[0]) // 公司的ID
          obj.dsp_slot_id = Number(item.dsp_slot_id[1]) // 预算ID
          obj.control_weight = type === 1 ? Number(item.control_weight) : 0 // 权重
          obj.control_proportion = type === 1 ? 0 : parseInt(item.control_proportion) // 流量占比
          obj.price_float = Number(item.price_float) // 价格浮动系数
          obj.control_show_day = Number(item.control_show_day) // 展示控制
          obj.control_click_day = Number(item.control_click_day) // 展现控制
          obj.control_req_day = Number(item.control_req_day) // 请求控制
          obj.check_old_phone = item.checkPhone // 屏蔽老旧机型
          obj.test_plan_id = item.test_plan_id ? item.test_plan_id : 0 // 测试计划状态
          // 时段控制
          obj.control_time_type = Number(item.control_time_type)
          let controlCustom = item.control_time_custom.split('').reverse().join('')
          obj.control_time_custom = controlCustom
          // 品牌定向
          obj.brand_type = item.brand_type
          obj.brand_ids = item.brand_type === -1 ? '' : (item.brand_ids).toString()
          // 地域定向
          obj.area_type = item.area_type
          obj.area_codes = item.area_type === -1 ? '' : this.dataCityData(item.cityList)
          // 人群定向
          obj.tag_orientation = item.defaultCrowd.tag_orientation
          obj.tag_proportion = obj.tag_orientation === 1 ? item.defaultCrowd.tag_proportion : 0
          obj.tag_relation = obj.tag_orientation === 1 ? item.defaultCrowd.tag_relation : 1
          obj.tag_list = obj.tag_orientation === 0 ? [] : item.defaultCrowd.tag_list
          obj.catch = item.catch
          // deal组的选择
          obj.dg_id = item.dg_id

          resource.push(obj)
        })
        return resource
      },
      /**
       * [dataCityData 获取选中的城市]
       * @return {[type]} [description]
       */
      dataCityData(datas) {
        let cityData = []
        datas.map(item => {
          if (item.check) {
            cityData.push(item.value)
          } else {
            if (item.little) {
              item.children.map(it => {
                if (it.check) {
                  cityData.push(it.value)
                }
              })
            }
          }
        })
        return cityData.toString()
      },
      /**
       * [addFlow 拆分流量]
       * @return {[type]} [description]
       */
      addFlow() {
        let index = this.infos.flowData.length
        let flowObj = {
          name: '流量' + (parseInt(index) + 1),
          proportion: undefined,
          conf_type: 1,
          data: {
            selfActionData: [
              {
                downStatus: 2, // 判断状态
                dsp_slot_name: '预算位', // 预算位的名称
                dsp_slot_id: [], // 预算位的ID
                title: '', // 预算位的ID以及终端的选择
                ad_type_text: '', // 预算位的样式文本
                ad_type_id: '', // 预算位的样式ID
                os_type: '', // 预算位的终端
                control_proportion: 0, // 流量占比
                control_weight: 0, // 权重
                control_req_day: 0, // 请求控量
                control_show_day: 0, // 展示控量
                control_click_day: 0, // 点击控量
                price_float: 100, // 价格浮动系数
                size_ratio: 0, // 尺寸比例比
                width_ratio: 0, // 尺寸比例宽
                height_ratio: 0, // 尺寸比例高
                ratio_is_ok: -1, // 尺寸比列是否匹配
                control_time_type: 2, // 投放时段的状态
                control_time_custom: '00000000000000000000000', // 投放的时段
                timeID: 'addTimeID' + (parseInt(index) + 1) + 'addflow', // 投放时段的插件

                cityList: this.getCityList(), // 地域的列表
                area_codes: [], // 地域选中项
                area_type: -1, // 地域的状态
                brand_type: -1, // 品牌的状态
                phoneList: this.getPhoneList(), // 品牌的列表
                brand_ids: [], // 手机品牌
                defaultCrowd: {}, // 人群定向
                tag_orientation: 0, // 人群定向的关系
                tag_relation: 1, // 人群定向的关系
                tag_proportion: 0, // 人群定向的流量占比
                tag_list: [''], // 人群定向的列表
                checkPhone: -1, // 屏蔽的老旧机型
                catch: -1, // 捕获数据
                capture: 1, // 数据捕获
                last_cpc: 0, // 预算位的cpc
                last_ecpm: 0, // 预算位的cpm
                dg_id: null // dealID
              }
            ]
          }
        }
        this.infos.flowData.push(flowObj)
      },
      /**
       * [deleteFlow 删除流量]
       * @return {[type]} [description]
       */
      deleteFlow(index) {
        this.infos.flowData.splice(index, 1)
      },
      /**
       * [addSelfBudget 自营SSp流量的添加]
       * @return {[type]} [description]
       */
      addSelfBudget(index, type) {
        let i = 0
          let selfActionData = this.infos.flowData[index].data.selfActionData
          i = selfActionData.length
        let obj1 = {
          downStatus: 2, // 判断状态
          dsp_slot_name: '预算位', // 预算位的名称
          dsp_slot_id: [], // 预算位的ID
          title: '', // 预算位的ID以及终端的选择
          ad_type_text: '', // 预算位的样式文本
          ad_type_id: '', // 预算位的样式ID
          os_type: '', // 预算位的终端
          control_proportion: 0, // 流量占比
          control_weight: 0, // 权重
          control_req_day: 0, // 请求控量
          control_show_day: 0, // 展示控量
          control_click_day: 0, // 点击控量
          price_float: 100, // 价格浮动系数
          size_ratio: 0, // 尺寸比例比
          width_ratio: 0, // 尺寸比例宽
          height_ratio: 0, // 尺寸比例高
          ratio_is_ok: -1, // 尺寸比列是否匹配
          control_time_type: 2, // 投放时段的状态
          control_time_custom: '00000000000000000000000', // 投放的时段
          timeID: 'selfTimeID' + index + 'slot' + (parseInt(i) + 1), // 投放时段的插件
          cityList: this.getCityList(), // 地域的列表
          area_codes: [], // 地域选中项
          area_type: -1, // 地域的状态
          brand_type: -1, // 品牌的状态
          phoneList: this.getPhoneList(), // 品牌的列表
          brand_ids: [], // 手机品牌
          defaultCrowd: {}, // 人群定向
          tag_orientation: 0, // 人群定向的关系
          tag_relation: 1, // 人群定向的关系
          tag_proportion: 0, // 人群定向的流量占比
          tag_list: [''], // 人群定向的列表
          checkPhone: -1, // 屏蔽的老旧机型
          catch: -1, // 捕获数据
          capture: 1, // 数据捕获
          last_cpc: 0, // 预算位的cpc
          last_ecpm: 0, // 预算位的cpm
          dg_id: null // dealID
        }
        let curArr = [...this.infos.flowData]
        curArr[index].data.selfActionData.push(obj1)
        this.infos.flowData = curArr

      },
      /**
       * [unfold 自营SSp流量展开以及关闭]
       * @return {[type]} [description]
       */
      unfold(index, i) {
        let curArr = [...this.infos.flowData]
        let status = curArr[index].data.selfActionData[i].downStatus
        let test_plan_id = curArr[index].data.selfActionData[i].test_plan_id
        if (!test_plan_id) {
          curArr[index].data.selfActionData[i].downStatus = status === 1 ? 2 : 1
          this.infos.flowData = curArr
        }
      },
      deleteSelfBudget(index, i) {
        let curArr = [...this.infos.flowData]
          curArr[index].data.selfActionData.splice(i, 1)
        this.infos.flowData = curArr
      }
    },
    watch: {
      infos: {
        deep: true,
        immediate: true,
        handler: function (v) {
          this.$nextTick(() => {
            this.infos.flowData.forEach((item, index) => {
              item.data.selfActionData.forEach((data, key) => {
                let form = 'flowData' + index + key
                this.$refs[form][0].validateField('flowDataList')
              })
            })
          })
        }
      },
      value(val) {
        this.configStatus = val
        if (val) {
          this.submitSave = false
          this.submitPass = false
          this.infos.flowData = []
          this.getProvinceCityList()
          this.getPhoneBrandList()
        }
      },
      configData: {
            deep: true,
           immediate: true,
           handler: function (v) {
          if (v) {
           this.slot_id = v.id
            this.getDealListData()
            this.getCrowdTagList()
          }
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .deployForm {
    /deep/ &.ivu-form-item {
      margin-bottom 18px
    }

    /deep/ .ivu-input {
      border-radius 2px
    }

    .charge_content {
      display flex

      .charge_modal {
        display flex

        .charge_xuan {
          margin-right 10px
        }

        .charge_num {
          width 210px

          .deployForm {
            /deep/ &.ivu-form-item {
              margin-bottom 0px
            }
          }

          /deep/ .ivu-form-item-label:before {
            font-size 0px
          }
        }
      }
    }

    .settlement_content {
      display flex

      .settlement_check {
        margin-right 10px
      }

      .settlement_detail {
        width 250px
        margin-left 10px

        .deployForm {
          /deep/ &.ivu-form-item {
            margin-bottom 0px
          }
        }
      }
    }

    .auto_content {
      display flex
      flex-wrap: wrap;

      .auto_action {
        display inline-block
        vertical-align middle
        color #4083F8
        cursor pointer

        img {
          vertical-align middle
        }

        span {
          vertical-align middle
          margin-right 4px
        }
      }

      .auto_list {
        margin-right 20px
      }
    }

  }

  /deep/ .ivu-form-item-error-tip {
    padding-top: 1px
    font-size 12px
  }

  /deep/ .ivu-form-item-required .ivu-form-item-label:before {
    position relative
    left -12px
  }

  /deep/ .ivu-form-item-required .ivu-form-item-label span {
    position relative
    left -16px
  }
  /deep/  .ivu-form .ivu-form-item-label{
    padding: 10px 7px 10px 0;
  }
  .self_table {
    margin-top 10px

    .deploy_list {
      margin-bottom 20px
      max-width 998px
      /deep/ .ivu-form-item-error-tip {
        padding-top: 2px
        font-size 14px
      }
      .deploy_header {
        display flex
        justify-content space-between

        .deploy_headerText{
          padding 5px 12px
          position relative
          background: #F1F1F1;
          border: 1px solid #DCDCDC;
          flex: 1;
          .deploy_title {
            line-height 20px
            display flex
            justify-content space-between
            .deploy_text{
              font-size 16px
              color #333333
              font-weight bold
              .deploy_des{
                font-weight normal
                color #999999
              }
            }

            .header_right {
              margin-right 20px
              .capture_text{
                display inline-block
                width: 123px;
                text-align center
                height: 21px;
                background: #FFA320;
                border: 1px solid #FFA320;
                border-radius: 10px;
                line-height 21px
                cursor pointer
                span{
                  color: #ffffff
                }
                /deep/ .ivu-icon{
                  color #ffffff
                }
              }
            }
          }

          // 头部下面的标签
          .deploy_classify {
            display flex
            margin-top 5px
            .classify_list {
              width 25%
              font-size 14px
              margin-right 9px
              line-height 20px
              .classify_text{
                line-height 22px
                .classify_name {
                  color #4083F8
                }
                .underline{
                  text-decoration:underline
                }
                .classify_con {
                  color #666666
                  &.classify_zoom {
                    display inline-block
                    vertical-align: top;
                    max-width 100px
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }

                  &.classify_num {
                    display inline-block
                    vertical-align: top;
                    max-width 125px
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                }
              }

            }
          }
          // 下拉箭头
          .deploy_status {
            position: absolute;
            right: 10px;
            top: 50%;
            margin-top: -14px;
            font-size 18px
            color #333333
            cursor pointer
          }
        }
        // 删除的样式
        .deploy_delete{
          width 46px
          height: 105px;
          background: #FB3F3F;
          border: 1px solid #F72D17;
          color #ffffff
          text-align center
          line-height 105px
          cursor pointer
          &.deploy_test{
              background: orange;
              border: 1px solid orange;
              line-height 1.5
              span{
                display inline-block
                padding-top 30px
              }
            }
        }
      }

      .deploy_content {
        border 1px solid #DCDCDC
        border-top 0px
        padding 15px 10px
        .deploy_box {
          display flex
          flex 1
          margin-bottom 15px
          &.deploy_line {
            margin-bottom 20px
            padding-bottom 20px
            border-bottom  1px solid #DCDCDC
          }

          .xuan_title {
            display inline-block
            color: #666
            font-weight bold
            font-size 14px
            min-width 118px
          }
          .deal_alert{
            margin-left 10px
            background #FFF2F2
            border-color transparent
            color #F32E3C !important
            padding: 7px 18px 7px 38px;
          }
          /deep/ .ivu-alert-info .ivu-alert-icon{
            color: #f32e3c;
            font-size: 17px;
            margin-top: 1px;
          }
          .box_list {
            width 33%
            .deploy_slot {
              display inline-block
              color: #666666
              font-size 14px
              font-weight bold
              min-width 118px
            }
            .slot_name {
              display inline-block
              width: 120px;
              vertical-align: middle;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .slot_select {
              background #D9E7FF
              color #000000
              border-color #D9E7FF
            }
          }
          .tagFlow {
            display flex
            margin-bottom 10px

            .tagFlowText {
              width 130px
            }
          }

          .tagList {
            display flex
            flex-wrap: wrap

            .tagWord {
              margin-right 0px
              margin-bottom 10px
            }

            .tag_action {
              width 40px
              display inline-block
              vertical-align middle
              color #4083F8
              font-size 20px
              margin-left 5px
            }
          }
        }
      }
    }
  }
</style>
