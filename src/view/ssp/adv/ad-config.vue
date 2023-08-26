<template>
  <Card :bordered="false" dis-hover class="page-main ad_config">
    <div class="page-title clearfix">
      <h2>{{ headTitle }}</h2>
    </div>
    <div class="config_con">
      <Form
        ref="deployData"
        label-position="left"
        :model="deployData1"
        :rules="deployRule"
        :label-width="145"
      >
        <div class="config_detail">
          <div class="config_header">
            <div><span class="line"></span><span>基本信息</span></div>
            <div>
              <div class="action" @click="changeState(1)">
                <p v-show="basicStatus === 1">
                  收起<span> <Icon type="ios-arrow-down" /></span>
                </p>
                <p v-show="basicStatus === 2">
                  展开<span> <Icon type="ios-arrow-up" /></span>
                </p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px" v-show="basicStatus === 1">
            <div class="config_matter">
              <FormItem class="deployText" label="广告位名称（ID）">
                <p>
                  {{ deployData["ssp_slot_name"] }}（{{
                    deployData["ssp_slot_id"]
                  }}）
                </p>
              </FormItem>
              <FormItem class="deployText" label="应用名称（ID）">
                <p>
                  {{ deployData["app_name"] }}（{{ deployData["app_id"] }}）
                </p>
              </FormItem>
              <FormItem class="deployText" label="广告场景">
                <p>
                  {{ deployData["ad_type_text"] }}-{{
                    creativeId2Text(deployData["creative_type"])
                  }}
                </p>
              </FormItem>
              <!--              <FormItem class="deployText" label="广告样式">-->
              <!--                <p>{{creativeId2Text(deployData['creative_type'])}}</p>-->
              <!--              </FormItem>-->
              <FormItem class="deployText" label="接入方式">
                <p>{{ deployData["access_type"] }}</p>
              </FormItem>
              <!-- 渲染方式 -->
              <!-- <FormItem class="deployText" label="渲染方式">
                <p>{{deployData['render_type']}}</p>
              </FormItem> -->
              <FormItem class="deployText" label="应用平台">
                <p>{{ deployData["os_type"] }}</p>
              </FormItem>
              <FormItem class="deployText deployForm" label="内部广告位名称">
                <Input
                  v-model="deployData.ssp_slot_alias"
                  style="width: 250px"
                />
              </FormItem>
              <FormItem class="deployText deployForm" label="外部广告位ID">
                <p v-if="deployData['ex_slot_id']">
                  {{ deployData["ex_slot_id"] }}
                </p>
                <p v-else>-</p>
              </FormItem>
              <FormItem
                v-if="deployData['access_type'] === 'SDK'"
                v-for="(item, index) in deployData['platform_slot_code']"
                :key="'platform_slot_code' + index"
                class="deployText deployForm"
                :label="item.platform_name + '广告位ID'"
              >
                <Input v-model="item.platform_slot_code" style="width: 250px" />
              </FormItem>
            </div>
            <FormItem class="deployText" prop="size_ratio">
              <span slot="label"> 素材尺寸比例 </span>
              <CheckboxGroup v-model="sizeArr" @on-change="sizeChange">
                <Checkbox
                  v-for="(item, index) in adMaterialSizeArr"
                  class="ivu-checkbox-size"
                  :key="'素材' + item.scale + index"
                  :label="item.ratio"
                  >{{ item.ratio }}</Checkbox
                >
              </CheckboxGroup>
              <!--              <div class="size_card">-->
              <!--                <div class="size_box" v-for="(item,index) in size_ratio" :key="'size'+index">-->
              <!--                  <div class="size_num">-->
              <!--                    <InputNumber size="small" @on-change="sizeChange(index)" v-model="size_ratio[index].width"-->
              <!--                                 style="width: 60px" :max="100" :min="1" :step="1"/>-->
              <!--                    :-->
              <!--                    <InputNumber size="small" @on-change="sizeChange(index)" v-model="size_ratio[index].height"-->
              <!--                                 style="width: 60px" :max="100" :min="1" :step="1"/>-->
              <!--                  </div>-->
              <!--                  <div class="size_action">-->
              <!--                    <i class="size_value">{{size_ratio[index].scale}}</i>-->
              <!--                    <Button type="primary" v-if="index===0" ghost @click="addSize">增加</Button>-->
              <!--                    <Button type="error" v-else ghost @click="deleteSize(index)" style="border-radius: 2px">删除</Button>-->
              <!--                  </div>-->
              <!--                </div>-->
              <!--              </div>-->
            </FormItem>
          </div>
        </div>
        <div class="config_detail">
          <div class="config_header">
            <div><span class="line"></span><span>价格</span></div>
            <div>
              <div class="action" @click="changeState(2)">
                <p v-show="priceStatus === 1">
                  收起<span> <Icon type="ios-arrow-down" /></span>
                </p>
                <p v-show="priceStatus === 2">
                  展开<span> <Icon type="ios-arrow-up" /></span>
                </p>
              </div>
            </div>
          </div>
          <div
            class="priceCon"
            style="margin-top: 15px"
            v-show="priceStatus === 1"
          >
            <!-- <FormItem class="deployForm deployText" prop="billingMode">
              <span slot="label">
                计费方式及底价
                <Tooltip placement="top-start" :transfer="true" max-width="700">
                  <Icon
                    type="md-help-circle"
                    style="color: #c8c8c8; font-size: 16px"
                  />
                  <div slot="content">
                    <p style="font-size: 12px">
                      计费方式指该流量支持的广告投放方式（CPC,CPM），通过此方式和底价过滤出合适预算
                    </p>
                  </div>
                </Tooltip>
              </span>
              <div class="charge_content">
                <div class="charge_modal">
                  <div class="charge_xuan">
                    <Checkbox v-model="deployData.cpm">CPM</Checkbox>
                  </div>
                  <div class="charge_xuan">
                    <Checkbox v-model="deployData.cpc">CPC</Checkbox>
                  </div>
                  <div class="charge_num">
                    <FormItem
                      :label-width="85"
                      class="deployForm"
                      label="CPM底价"
                    >
                      <Poptip trigger="focus">
                        <InputNumber
                          :min="0"
                          :step="1"
                          :max="inputMaxNumber"
                          v-model="deployData.floor_price_cpm"
                          style="width: 100px"
                        />
                        <span>元</span>
                        <div slot="content">
                          {{ formatNumber(deployData.floor_price_cpm) }}
                        </div>
                      </Poptip>
                    </FormItem>
                  </div>
                  <div class="charge_num" style="margin-left: 10px">
                    <FormItem
                      :label-width="85"
                      class="deployForm"
                      label="CPC底价"
                    >
                      <Poptip trigger="focus">
                        <InputNumber
                          :min="0"
                          :step="1"
                          :max="inputMaxNumber"
                          v-model="deployData.floor_price_cpc"
                          style="width: 100px"
                        />
                        <span>元</span>
                        <div slot="content">
                          {{ formatNumber(deployData.floor_price_cpc) }}
                        </div>
                      </Poptip>
                    </FormItem>
                  </div>
                </div>
              </div>
            </FormItem> -->
            <FormItem class="deployForm deployText">
              <span slot="label">
                结算方式及价格
                <Tooltip placement="top-start" :transfer="true">
                  <Icon
                    type="md-help-circle"
                    style="color: #c8c8c8; font-size: 16px"
                  />
                  <div slot="content">
                    <p style="font-size: 12px">与媒体的结算规则和单价</p>
                  </div>
                </Tooltip>
              </span>
              <div class="settlement_content">
                <div class="settlement_check">
                  <!-- 1=固价 2=分成 3=RTB -->
                  <RadioGroup v-model="deployData.pay_type">
                    <Radio v-for="item in adPayType" :label="item.value" :key="item.value +'结算方式'">
                      {{ item.label }}
                    </Radio>
                  </RadioGroup>
                </div>
                <div class="settlement_detail">
                  <div v-if="deployData.pay_type === 1">
                    <FormItem
                      :label-width="85"
                      prop="pay_type"
                      class="deployForm"
                    >
                      <span slot="label" style="display: inline-block"
                        >CPM价格</span
                      >

                      <InputNumber
                        :min="0"
                        :step="0.01"
                        :precision="2"
                        :max="inputMaxNumber"
                        v-model="deployData.valuation_price"
                        :active-change="false"
                        style="width: 100px"
                      />
                      元
                      <!-- <Poptip trigger="focus">
                        <InputNumber
                          :min="0"
                          :step="1"
                          :precision="2"
                          :max="inputMaxNumber"
                          v-model="deployData.valuation_price"
                          :active-change="false"
                          style="width: 100px"
                        />
                        <span>元</span>
                        <div slot="content">
                          {{ formatNumber(deployData.valuation_price) }}
                        </div>
                      </Poptip> -->
                    </FormItem>
                  </div>
                  <div v-if="deployData.pay_type === 2">
                    <FormItem
                      :label-width="85"
                      prop="pay_type"
                      class="deployForm"
                    >
                      <span slot="label">分成系数</span>
                      <InputNumber
                        :min="0"
                        :step="1"
                        :max="100"
                        :precision="2"
                        :active-change="false"
                        v-model="deployData.divide_price"
                        style="width: 100px"
                      />
                      <span>%</span>
                    </FormItem>
                  </div>
                </div>
              </div>
            </FormItem>
            <!-- <FormItem class="deployForm deployText" prop="cpm_price">
              <span slot="label">
                CPM出价
                <Tooltip placement="top-start" :transfer="true" max-width="700">
                  <Icon
                    type="md-help-circle"
                    style="color: #c8c8c8; font-size: 16px"
                  />
                  <div slot="content">
                    <p style="font-size: 12px">
                      参与RTB竞价的出价，如不填默认是0无法竞得流量（例如与2345合作）
                    </p>
                  </div>
                </Tooltip>
              </span>
              <Poptip trigger="focus">
                <InputNumber
                  :min="0"
                  :step="1"
                  :max="inputMaxNumber"
                  v-model="deployData.cpm_price"
                  style="width: 100px"
                />
                <span>元</span>
                <div slot="content">
                  {{ formatNumber(deployData.cpm_price) }}
                </div>
              </Poptip>
            </FormItem> -->
            <div class="priceCPC">
              <div
                class="priceCPC_con"
                style="background: linear-gradient(-59deg, #bd3b95, #fc6aa2)"
              >
                <p class="priceDetail">
                  实时媒体eCPM：<span class="priceNum">{{
                    deployData.last_hour_ecpm
                  }}</span
                  >元
                </p>
                <p class="priceDetail">
                  实时媒体CPC：<span class="priceNum">{{
                    deployData.last_hour_cpc
                  }}</span
                  >元
                </p>
              </div>
              <div
                class="priceCPC_con"
                v-show="deployData.last_day_ecpm !== 0"
                style="background: linear-gradient(-36deg, #6051cb, #8a5fbb)"
              >
                <p class="priceDetail">
                  历史最新eCPM：<span class="priceNum">{{
                    deployData.last_day_ecpm
                  }}</span
                  >元
                </p>
                <p class="priceDetail">
                  历史最新CPC：<span class="priceNum">{{
                    deployData.last_day_cpc
                  }}</span
                  >元
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="config_detail">
          <div class="config_header">
            <div><span class="line"></span><span>扣量策略</span></div>
            <div>
              <div class="action" @click="changeState(3)">
                <p v-show="strategyStatus === 1">
                  收起<span> <Icon type="ios-arrow-down" /></span>
                </p>
                <p v-show="strategyStatus === 2">
                  展开<span> <Icon type="ios-arrow-up" /></span>
                </p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px" v-show="strategyStatus === 1">
            <div class="config_matter">
              <FormItem
                class="deployForm deployText"
                label="广告展现保留比"
                prop="discount_show"
              >
                <InputNumber
                  :min="0"
                  :max="100"
                  v-model="deployData.discount_show"
                  placeholder="大于0小于等于100的整数"
                  style="width: 250px"
                />
                <span style="margin-left: 5px">%</span>
              </FormItem>
              <FormItem
                class="deployForm deployText"
                label="广告点击保留比"
                prop="discount_click"
              >
                <InputNumber
                  :min="0"
                  :max="100"
                  v-model="deployData.discount_click"
                  placeholder="大于0小于等于100的整数"
                  style="width: 250px"
                />
                <span>%</span>
              </FormItem>
            </div>
          </div>
        </div>
        <!--        <div class="config_detail">-->
        <!--          <div class="config_header">-->
        <!--            <div>-->
        <!--              <span class="line"></span><span>其他</span>-->
        <!--            </div>-->
        <!--            <div>-->
        <!--              <div class="action" @click="changeState(5)">-->
        <!--                <p v-show="otherStatus === 1">收起<span> <Icon type="ios-arrow-down"/></span></p>-->
        <!--                <p v-show="otherStatus === 2">展开<span> <Icon type="ios-arrow-up"/></span></p>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--          <div style="margin-top: 15px" v-show="otherStatus === 1">-->
        <!--            <div class="config_matter">-->
        <!--              <FormItem class="deployForm deployText" label="频次控制">-->
        <!--                 <span>-->
        <!--                 广告位-预算方-用户频控开关-->
        <!--             <Tooltip placement="top" :transfer="true" max-width="200">-->
        <!--               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>-->
        <!--            <div slot="content">-->
        <!--               <p style="font-size: 12px">指广告位与预算方及用户级别的广告展现控频1次/天，广告点击控频1次/月</p>-->
        <!--            </div>-->
        <!--         </Tooltip>-->
        <!--          </span>-->
        <!--                <i-switch v-model="deployData.user_dsp_ctrl_status" size="small" :true-value="1" :false-value="-1"/>-->
        <!--              </FormItem>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="config_detail" style="margin-bottom: 10px">
          <div class="config_header">
            <div><span class="line"></span><span>流量分配</span></div>
            <div>
              <div class="action" @click="changeState(4)">
                <p v-show="flowStatus === 1">
                  收起<span> <Icon type="ios-arrow-down" /></span>
                </p>
                <p v-show="flowStatus === 2">
                  展开<span> <Icon type="ios-arrow-up" /></span>
                </p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px" v-show="flowStatus === 1">
            <!--            <div class="config_matter">-->
            <!--              <FormItem class="deployForm deployText" prop="maxRequests">-->
            <!--            <span slot="label">-->
            <!--             最大广告请求数-->
            <!--             <Tooltip placement="top-start" :transfer="true" max-width="700">-->
            <!--                <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>-->
            <!--            <div slot="content">-->
            <!--               <p style="font-size: 12px">控制该广告位每天的广告请求量最大值，默认为0表示不控量</p>-->
            <!--            </div>-->
            <!--         </Tooltip>-->
            <!--          </span>-->
            <!--                <Input maxlength="15" v-model="deployData.max_request_times" style="width: 150px"/>-->
            <!--                <span style="margin-left: 5px">次/天</span>-->
            <!--              </FormItem>-->
            <!--              <FormItem class="deployForm deployText" prop="self_dsp">-->
            <!--                <span slot="label">启用到自营DSP</span>-->
            <!--                <RadioGroup v-model="deployData.self_dsp">-->
            <!--                  <Radio :label="-1">-->
            <!--                    <span>否</span>-->
            <!--                  </Radio>-->
            <!--                  <Radio :label="1">-->
            <!--                    <span>是</span>-->
            <!--                  </Radio>-->
            <!--                </RadioGroup>-->
            <!--              </FormItem>-->
            <!--            </div>-->
            <FormItem
              class="deployForm deployText"
              prop="flow_split"
              style="margin-bottom: 15px"
            >
              <span slot="label"> 自营SSP流量拆分</span>
              <div class="auto_content">
                <div
                  v-for="(item, index) in infos.flowData"
                  :key="'forms' + index"
                  class="auto_list"
                >
                  <div class="auto_active">
                    <div style="display: inline-block">
                      {{ item.name }}
                      <Poptip
                        :transfer="true"
                        placement="bottom-start"
                        width="200"
                      >
                        <a href="javascript:void(0)">
                          <Icon type="ios-create-outline" />
                        </a>
                        <div class="api" slot="content">
                          <div class="autoPop_con">
                            <Input v-model="item.name" style="width: 160px" />
                          </div>
                        </div>
                      </Poptip>
                    </div>
                    <Input style="width: 50px" v-model="item.proportion" />
                    <span style="padding: 0px 10px">%</span>
                    <span
                      class="auto_action"
                      v-if="index === 0"
                      @click="addFlow"
                    >
                      <img src="~@/assets/image/split.png" alt="" />
                      <span>拆分</span>
                    </span>
                    <span class="auto_action" v-else @click="deleteFlow(index)">
                      <img src="~@/assets/image/delect.png" alt=""
                    /></span>
                  </div>
                </div>
              </div>
            </FormItem>

            <FormItem
              v-for="(item, index) in infos.flowData"
              :key="'form3' + index"
              class="deployForm deployText"
              :label="item.name + '分配'"
            >
              <div style="max-width: 998px">
                <Button
                  @click="addSelfBudget(index, item['conf_type'])"
                  style="color: #3f83f7; border: 1px solid #4083f8"
                  icon="md-add"
                >
                  增加预算位
                </Button>
                <Button
                  @click="seeDelete(index)"
                  style="
                    color: #4083f8;
                    background: #d9e7ff;
                    margin-right: 10px;
                    border: 0px;
                  "
                >
                  查看已删除预算位
                </Button>
              </div>
              <!--  eCPM自动的流量分配-->
              <div class="self_table">
                <div
                  class="deploy_list"
                  v-for="(it, i) in infos.flowData[index]['data'][
                    'selfActionData'
                  ]"
                  :key="'selfActionData' + i"
                >
                  <!--  eCPM头部的内容-->
                  <div class="deploy_header">
                    <div class="deploy_headerText" @click="unfold(index, i)">
                      <div class="deploy_title">
                        <div class="header_left">
                          <span class="deploy_text"
                            >{{ it.dsp_slot_name }}
                            <span class="deploy_des" v-show="it.title"
                              >({{ it.title }})</span
                            >
                          </span>
                          <span>
                            <Tooltip
                              placement="right-start"
                              :transfer="true"
                              max-width="700"
                            >
                              <Icon
                                v-if="
                                  it.budget_status === 1 ||
                                  it.budget_status === 4
                                "
                                type="ios-checkmark-circle"
                                style="color: #339900"
                              />
                              <Icon
                                v-else
                                type="ios-close-circle"
                                style="color: #f72d17"
                              />
                              <div slot="content">
                                <p
                                  v-if="
                                    it.budget_status === 1 ||
                                    it.budget_status === 4
                                  "
                                  style="font-size: 12px"
                                >
                                  预算位状态正常,可投放
                                </p>
                                <p v-else style="font-size: 12px">
                                  预算位状态异常,不可投放
                                </p>
                              </div>
                            </Tooltip>
                          </span>
                        </div>
                        <div class="header_right" v-if="it.capture !== 1">
                          <span class="capture_text">
                            <span
                              @click.stop="
                                capture(
                                  it['dsp_slot_id'],
                                  item['conf_type'],
                                  index,
                                  i
                                )
                              "
                              >捕获广告数据</span
                            >
                            <Tooltip
                              placement="top"
                              :transfer="true"
                              max-width="400"
                            >
                              <Icon
                                type="md-help-circle"
                                style="color: #ffffff; font-size: 16px"
                              />
                              <div slot="content">
                                <p style="font-size: 12px">
                                  捕获上下游的广告请求与返回日志数据<br />注意：此处捕获的广告数据为获取数据时刻的下一分钟起未来约2分钟的广告请求返回日志，包括对媒体和对预算方的请求返回日志，请在捕获成功至少2分钟后下载广告数据
                                </p>
                              </div>
                            </Tooltip>
                          </span>
                          <span>
                            <Tooltip
                              placement="top"
                              :transfer="true"
                              max-width="200"
                            >
                              <Icon
                                v-if="it.catch === -1 && it.fetched_data_url"
                                @click.stop="downCapture(it.fetched_data_url)"
                                type="md-download"
                                style="color: #ffa320; font-size: 16px"
                              />
                              <Icon
                                v-else
                                type="md-download"
                                style="color: #c8c8c8; font-size: 16px"
                              />
                              <div slot="content">
                                <p style="font-size: 12px">
                                  <span v-show="it.catch === 1"
                                    >数据获取中</span
                                  >
                                  <span
                                    v-show="
                                      it.catch === -1 && !it.fetched_data_url
                                    "
                                    >请捕获数据</span
                                  >
                                  <span
                                    v-show="
                                      it.catch === -1 && it.fetched_data_url
                                    "
                                    >捕获完成请下载</span
                                  >
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
                            <span class="classify_con classify_num">{{
                              number2ThousandNumber(it.control_weight)
                            }}</span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">预算位CPM:</span>
                            <span class="classify_con classify_num"
                              >{{ number2ThousandNumber(it.last_ecpm) }}元</span
                            >
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">预算位CPC:</span>
                            <span class="classify_con classify_num"
                              >{{ number2ThousandNumber(it.last_cpc) }}元</span
                            >
                          </p>
                        </div>
                        <div class="classify_list" style="width: 30%">
                          <p class="classify_text">
                            <span class="classify_name">请求控制:</span>
                            <span class="classify_con classify_num"
                              >{{
                                number2ThousandNumber(it.control_req_day)
                              }}次/天</span
                            >
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">展现控制:</span>
                            <span class="classify_con classify_num"
                              >{{
                                number2ThousandNumber(it.control_show_day)
                              }}次/天</span
                            >
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">点击控制:</span>
                            <span class="classify_con classify_num"
                              >{{
                                number2ThousandNumber(it.control_click_day)
                              }}次/天</span
                            >
                          </p>
                        </div>
                        <div class="classify_list" style="width: 22%">
                          <p class="classify_text">
                            <span class="classify_name">投放时段:</span>
                            <span class="classify_con classify_zoom">
                              <span v-if="it.control_time_type === 2"
                                >全时段</span
                              >
                              <span v-else>
                                <Tooltip
                                  placement="bottom"
                                  :transfer="true"
                                  max-width="300"
                                >
                                  <span class="underline">自定义</span>
                                  <div slot="content">
                                    {{ hourData(it.control_time_custom) }}
                                  </div>
                                </Tooltip>
                              </span>
                            </span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">人群定向:</span>
                            <span class="classify_con classify_zoom">
                              <span v-if="it.defaultCrowd.tag_orientation === 0"
                                >不限</span
                              >
                              <span v-else>
                                <Tooltip
                                  placement="bottom"
                                  :transfer="true"
                                  max-width="300"
                                >
                                  <span
                                    class="underline"
                                    v-if="it.defaultCrowd.tag_orientation === 1"
                                    >定向</span
                                  >
                                  <span
                                    class="underline"
                                    v-if="it.defaultCrowd.tag_orientation === 2"
                                    >排除</span
                                  >
                                  <div
                                    v-if="it.defaultCrowd.tag_orientation === 1"
                                    slot="content"
                                  >
                                    定向外流量占比：{{
                                      it.defaultCrowd.tag_proportion
                                    }}%；逻辑关系：{{
                                      it.defaultCrowd.tag_relation === 1
                                        ? "满足其一"
                                        : "全部满足"
                                    }}；人群标签：{{
                                      tagTextData(it.defaultCrowd.tag_list)
                                    }}
                                  </div>
                                  <div
                                    v-if="it.defaultCrowd.tag_orientation === 2"
                                    slot="content"
                                  >
                                    人群标签：{{
                                      tagTextData(it.defaultCrowd.tag_list)
                                    }}
                                  </div>
                                </Tooltip>
                              </span>
                            </span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">地域定向:</span>
                            <span class="classify_con classify_zoom">
                              <span v-if="it.area_type === -1">不限</span>
                              <span v-else>
                                <Tooltip
                                  placement="bottom"
                                  :transfer="true"
                                  max-width="300"
                                >
                                  <span
                                    v-if="it.area_type === 1"
                                    class="underline"
                                    >定向</span
                                  >
                                  <span
                                    v-if="it.area_type === 2"
                                    class="underline"
                                    >排除</span
                                  >
                                  <div slot="content">
                                    {{ areaData(it.cityList) }}
                                  </div>
                                </Tooltip>
                              </span>
                            </span>
                          </p>
                        </div>
                        <div class="classify_list" style="width: 22%">
                          <p class="classify_text">
                            <span class="classify_name">品牌定向:</span>
                            <span class="classify_con classify_zoom">
                              <span v-if="it.brand_type === -1">不限</span>
                              <span v-else>
                                <Tooltip
                                  placement="bottom"
                                  :transfer="true"
                                  max-width="300"
                                >
                                  <span
                                    v-if="it.brand_type === 1"
                                    class="underline"
                                    >定向</span
                                  >
                                  <span
                                    v-if="it.brand_type === 2"
                                    class="underline"
                                    >排除</span
                                  >
                                  <div slot="content">
                                    {{ brandData(it.phoneList) }}
                                  </div>
                                </Tooltip>
                              </span>
                            </span>
                          </p>
                          <p
                            class="classify_text"
                            v-show="deployData['os_type'] === 'Android'"
                          >
                            <span class="classify_name">老旧机型:</span>
                            <span class="classify_con classify_zoom">
                              <span v-if="it.checkPhone === -1">不限</span>
                              <span v-else>
                                <span>屏蔽</span>
                              </span>
                            </span>
                          </p>

                          <!-- 结算方式 -->
                          <p class="classify_text">
                            <span class="classify_name">结算方式:</span>
                            <span
                              class="classify_con classify_zoom"
                              style="max-width: 120px"
                              :title="it.pay_type"
                            >
                              {{it.pay_type_text}}
                              <!-- <span v-if="it.pay_type === 1">固价</span>
                              <span v-else-if="it.pay_type === 2">分成</span>
                              <span v-else-if="it.pay_type === 3">RTB</span> -->
                               <!-- - {{ it.pay_type }} -->
                            </span>
                          </p>
                        </div>
                        <div class="classify_list">
                          <p class="classify_text">
                            <span class="classify_name">尺寸比例检验:</span>
                            <span
                              class="classify_con classify_zoom"
                              style="max-width: 80px"
                            >
                              <Icon
                                v-if="it.ratio_is_ok === -1"
                                type="ios-close-circle"
                                style="color: #f72d17"
                              />
                              <Icon
                                v-else
                                type="ios-checkmark-circle"
                                style="color: #339900"
                              />
                              {{ it.width_ratio }}:{{ it.height_ratio }}
                            </span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">Deal组:</span>
                            <span
                              class="classify_con classify_zoom"
                              style="max-width: 120px"
                            >
                              <span v-if="!it.dg_id">无</span>
                              <span v-else>
                                <span
                                  v-for="item in dealList"
                                  :key="'搜索' + item.id"
                                  v-if="item.id === it.dg_id"
                                  :title="item.name"
                                  >{{ item.name }}</span
                                >
                              </span>
                            </span>
                          </p>


                        </div>
                      </div>
                      <div class="deploy_status">
                        <Icon
                          v-if="it.downStatus === 1"
                          type="ios-arrow-forward"
                        />
                        <Icon v-else type="ios-arrow-down" />
                      </div>
                    </div>
                    <div
                      v-if="!it.test_plan_id"
                      class="deploy_delete"
                      @click="deleteSelfBudget(index, i)"
                    >
                      删除
                    </div>
                    <div v-else class="deploy_delete deploy_test">
                      <span>测试中勿操作</span>
                    </div>
                  </div>
                  <Form
                    :ref="'flowData' + index + i"
                    :model="item"
                    :rules="infos.ruleValidate"
                    :label-width="0"
                  >
                    <!--  eCPM的展开操作部分-->
                    <FormItem
                      prop="flowDataList"
                      :rules="{
                        required: true,
                        index: index,
                        i: i,
                        validator: flowDataListRule,
                      }"
                    >
                      <div class="deploy_content" v-show="it.downStatus === 2">
                        <div class="deploy_box">
                          <div class="box_list">
                            <span class="deploy_slot">预算位：</span>
                            <span class="slot_name">{{
                              it.dsp_slot_name
                            }}</span>
                            <Button
                              class="slot_select"
                              type="primary"
                              @click="
                                slotSelect(
                                  it['dsp_slot_id'],
                                  item['conf_type'],
                                  index,
                                  i
                                )
                              "
                              >选择
                            </Button>
                          </div>
                          <div class="box_list">
                            <span class="deploy_slot"
                              >尺寸比例检验
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    指所选预算位与当前广告位尺寸比例需要一致，且可以有上下5%的比例浮动，超过5%，则不匹配，无法提交
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            {{ it.width_ratio }}:{{ it.height_ratio }}
                            <span>
                              <Tooltip
                                placement="right-start"
                                :transfer="true"
                                max-width="700"
                              >
                                <Icon
                                  v-if="it.ratio_is_ok === -1"
                                  type="ios-close-circle"
                                  style="color: #f72d17"
                                />
                                <Icon
                                  v-else
                                  type="ios-checkmark-circle"
                                  style="color: #339900"
                                />
                                <div slot="content">
                                  <p
                                    v-if="it.ratio_is_ok === 1"
                                    style="font-size: 12px"
                                  >
                                    表示广告位与预算位尺寸匹配
                                  </p>
                                  <p v-else style="font-size: 12px">
                                    表示广告位与预算位尺寸不匹配
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                          </div>
                          <div class="box_list">
                            <span class="deploy_slot"
                              >权重
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    默认为0，以历史ecpm值倒序排序；权重值大于0时，值越大，越优先展示该预算位的广告
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            <Poptip trigger="focus">
                              <InputNumber
                                :min="0"
                                :max="1000"
                                v-model="it.control_weight"
                                style="width: 150px"
                              />
                              <div slot="content">
                                {{ formatNumber(it.control_weight) }}
                              </div>
                            </Poptip>
                          </div>
                        </div>
                        <div class="deploy_box">
                          <div class="box_list">
                            <span class="deploy_slot"
                              >请求控制
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    指该广告位与预算位关系上的请求最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            <Poptip trigger="focus">
                              <InputNumber
                                :min="0"
                                v-model="it.control_req_day"
                                style="width: 150px"
                              />
                              <span style="font-size: 13px">次/天</span>
                              <div slot="content">
                                {{ formatNumber(it.control_req_day) }}
                              </div>
                            </Poptip>
                          </div>
                          <div class="box_list">
                            <span class="deploy_slot"
                              >展现控制
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    指该广告位与预算位关系上的展现最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            <Poptip trigger="focus">
                              <InputNumber
                                :min="0"
                                v-model="it.control_show_day"
                                style="width: 150px"
                              />
                              <span style="font-size: 13px">次/天</span>
                              <div slot="content">
                                {{ formatNumber(it.control_show_day) }}
                              </div>
                            </Poptip>
                          </div>
                          <div class="box_list">
                            <span class="deploy_slot"
                              >点击控制
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    指该广告位与预算位关系上的点击最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            <Poptip trigger="focus">
                              <InputNumber
                                :min="0"
                                v-model="it.control_click_day"
                                style="width: 150px"
                              />
                              <span style="font-size: 13px">次/天</span>
                              <div slot="content">
                                {{ formatNumber(it.control_click_day) }}
                              </div>
                            </Poptip>
                          </div>
                        </div>
                        <!-- <div class="deploy_box">
                          <div class="box_list">
                            <span class="deploy_slot"
                              >价格浮动系数
                              <Tooltip
                                placement="top"
                                :transfer="true"
                                max-width="300"
                              >
                                <Icon
                                  type="md-help-circle"
                                  style="color: #c8c8c8; font-size: 16px"
                                />：
                                <div slot="content">
                                  <p style="font-size: 12px">
                                    指该广告位配置当前预算位参与竞价时，CPM出价的浮动系数，范围是(0%,200%]，默认100%，表示CPM出价不浮动；最终出价为CPM出价*价格浮动系数
                                  </p>
                                </div>
                              </Tooltip>
                            </span>
                            <InputNumber
                              style="width: 150px"
                              v-model="it.price_float"
                              :max="200"
                              :min="1"
                            />
                            <span>%</span>
                          </div>
                        </div> -->



                        <div class="deploy_box deploy_line">
                          <!-- 利润系数: {{ it.pay_type }}<br> -->
                          <!-- 1=固价 2=分成 3=RTB -->
                          <!-- 利润系数  当[广告位结算方式 & 预算位结算方式]同时为RTB 显示-->
                          <div class="box_list" v-if="deployData.pay_type === 3 && it.pay_type === 3">
                            <span class="deploy_slot">利润系数: </span>
                            <InputNumber
                              :min="0"
                              :step="1"
                              :max="100"
                              :precision="0"
                              v-model="it.profit_ratio"
                              style="width: 150px"
                            />
                            &nbsp;&nbsp;%
                          </div>
                          <!-- 底价 广告位为非RTB, 预算位为RTB-->
                          <!-- 1=固价 2=分成 3=RTB -->
                          <div class="box_list" v-if="deployData.pay_type !== 3 && it.pay_type === 3">
                            <span class="deploy_slot">底价:</span>
                            <InputNumber
                              :min="0"
                              :step="0.01"
                              :precision="2"
                              v-model="it.floor_price"
                              :active-change="false"
                              style="width: 150px"
                            />
                            &nbsp;&nbsp;元
                          </div>
                        </div>


                        <!-- Deal组
                        <div class="deploy_box deploy_line">
                          <div class="xuan_title">
                            Deal组
                            <Tooltip
                              placement="top"
                              :transfer="true"
                              max-width="300"
                            >
                              <Icon
                                type="md-help-circle"
                                style="color: #c8c8c8; font-size: 16px"
                              />
                              ：
                              <div slot="content">
                                <p style="font-size: 12px">
                                  指该媒体的广告位设置了DealID，投放广告时，需要运营选择合适的Deal组进行投放
                                </p>
                              </div>
                            </Tooltip>
                          </div>
                          <div class="xuan_content" style="display: flex">
                            <Select
                              v-model="it.dg_id"
                              filterable
                              clearable
                              style="width: 300px"
                            >
                              <Option
                                v-for="item in dealList"
                                :value="item.id"
                                :key="item.created_at + index"
                                >{{ item.name }}</Option
                              >
                            </Select>
                            <Alert
                              v-if="dealList && dealList.length > 0"
                              class="deal_alert"
                              show-icon
                            >
                              该广告位已配置DealID，如有需要，请选择合适的Deal组
                            </Alert>
                          </div>
                        </div> -->


                        <div class="deploy_box deploy_line">
                          <div class="xuan_title">投放时段:</div>
                          <div class="xuan_content">
                            <RadioGroup v-model="it.control_time_type">
                              <Radio :label="2">
                                <span>全时段</span>
                              </Radio>
                              <Radio :label="1"> 自定义 </Radio>
                            </RadioGroup>
                            <div
                              v-show="it.control_time_type === 1"
                              style="margin-top: 10px"
                            >
                              {{ it.control_time_custom }}
                              <ry-time-sheet
                                :id="it.timeID"
                                v-model="it.control_time_custom"
                              />
                            </div>
                          </div>
                        </div>
                        <div class="deploy_box deploy_line">
                          <div class="xuan_title">人群定向:</div>
                          <div class="xuan_content" style="width: 100%">
                            <crowd-control
                              :errShow="false"
                              :defaultCrowd="it.defaultCrowd"
                              :crowdTagArr="tagListData"
                              @on-form-validate="
                                getCrowdControl($event, index, i)
                              "
                            ></crowd-control>
                          </div>
                        </div>
                        <div class="deploy_box deploy_line">
                          <div class="xuan_title">品牌定向:</div>
                          <div class="xuan_content">
                            <RadioGroup
                              v-model="it.brand_type"
                              @on-change="statusChange"
                            >
                              <Radio :label="-1">不限</Radio>
                              <Radio :label="1">定向</Radio>
                              <Radio :label="2">排除</Radio>
                            </RadioGroup>
                            <div
                              v-show="it.brand_type !== -1"
                              style="margin-top: 10px"
                            >
                              <retarget-muti-cascader-ad-slot
                                ref="proCity"
                                class="m-l-20"
                                v-model="it.brand_ids"
                                :datas="it.phoneList"
                                :title="phoneString"
                                :order="orderText"
                                :childrenTitle="phoneString"
                                @input="updateCity"
                                @name="updateCityName"
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          :class="
                            deployData['os_type'] === 'Android'
                              ? 'deploy_box deploy_line'
                              : 'deploy_box'
                          "
                        >
                          <div class="xuan_title">地域定向:</div>
                          <div class="xuan_content">
                            <RadioGroup
                              v-model="it.area_type"
                              @on-change="statusChange"
                            >
                              <Radio :label="-1">不限</Radio>
                              <Radio :label="1">定向</Radio>
                              <Radio :label="2">排除</Radio>
                            </RadioGroup>
                            <div
                              v-show="it.area_type !== -1"
                              style="margin-top: 10px"
                            >
                              <retarget-muti-cascader-ad-slot
                                ref="proCity"
                                class="m-l-20"
                                v-model="it.area_codes"
                                :datas="it.cityList"
                                :title="cityString"
                                :order="orderText"
                                :childrenTitle="cityChildren"
                                @input="updateCity"
                                @name="updateCityName"
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          class="deploy_box"
                          v-show="deployData['os_type'] === 'Android'"
                        >
                          <div class="xuan_title">老旧机型:</div>
                          <RadioGroup
                            v-model="it.checkPhone"
                            @on-change="statusChange"
                          >
                            <Radio :label="-1">不限</Radio>
                            <Radio :label="1">屏蔽</Radio>
                          </RadioGroup>
                          <span style="color: #999999"
                            >( 老旧机型为机型覆盖率排名top100+的机型 )</span
                          >
                        </div>
                      </div>
                    </FormItem>
                  </Form>
                </div>
              </div>
            </FormItem>
          </div>
          <div></div>
        </div>
        <FormItem class="deployForm configBottom" :label-width="0">
          <Button @click="goBack">取消</Button>
          <Button
            type="primary"
            :loading="submitSave"
            @click="save('deployData', 1)"
          >
            <span v-if="!submitSave">保存</span>
            <span v-else>保存中...</span>
          </Button>
          <div style="display: inline-block">
            <Button
              class="savePass"
              :loading="submitPass"
              type="primary"
              v-if="deployData.status === 3 || deployData.status === 4"
              @click="save('deployData', 2)"
            >
              <span v-if="!submitPass">保存并通过</span>
              <span v-else>保存并通过中...</span>
            </Button>
          </div>
        </FormItem>
      </Form>
    </div>
    <selectBudget
      v-model="modalSelect"
      :sizeRatio="size_ratio"
      :dataList="deployData"
      :ids="parseInt(selected_id)"
      :deleteArr="except_dsp_slot_id"
      @name="selectSuccess"
    />
    <configDelete
      v-model="deleteStatus"
      :ids="parseInt(slot_id)"
      :index="deleteIndex"
      :deleteArr="except_dsp_slot_id"
      @name="seeSuccess"
    />
  </Card>
</template>

<script>
import { showTitle, inputMaxNumber } from "@/libs/util.js";
import { getSelfCols, getHandCols, formRules } from "../data/adConfig";
import {
  getSspSlotConfigData,
  submitConfigApi,
  getFetchRealData,
  getDealList,
} from "@/api/ssp";
import { getCrowdTagList } from "@/api/tag";
import { getProvinceCityApi, getPhoneBrand, getAdRatio } from "@/api/common";
import { inPageAccess } from "@/mixin/in-page-access.js";
import RyTimeSheet from "@/components/ry-time-sheet/hourSheet.vue";
import configDelete from "../components/deleteConfig";
import selectBudget from "../components/selectBudget";
import retargetMutiCascaderAdSlot from "@/components/cascader-retarget";
import crowdControl from "@/components/control/crowd/index.vue";

import { adPayType } from '@/view/ssp/data/adManage.js'
import { BigNumber } from 'bignumber.js'

export default {
  name: "ad-config",
  components: {
    RyTimeSheet,
    configDelete,
    crowdControl,
    retargetMutiCascaderAdSlot,
    selectBudget,
  },
  mixins: [formRules, inPageAccess],
  data() {
    return {
      dealList: [], // deallist
      inputMaxNumber: inputMaxNumber,
      except_dsp_slot_id: [],
      deleteStatus: false,
      modalSelect: false,
      selected_id: "",
      deleteIndex: "",
      deleteID: "",
      phoneString: "手机品牌",
      cityString: "省份",
      cityChildren: "城市",
      orderText: "first",
      basicStatus: 1,
      priceStatus: 1,
      strategyStatus: 1,
      flowStatus: 1,
      otherStatus: 1,
      submitSave: false,
      submitPass: false,
      cascaderStatus: 1,
      casacaderList: [],
      slot_id: "",
      timeIndex: null,
      timeFinally: null,
      visible: false,
      timeModel: false,
      deployData: {
        cpm: false,
        cpc: false,
        pay_type: 1, // 1=估计 2=分成 3=RTB
        floor_price_cpm: 0,
        floor_price_cpc: 0,
        valuation_price: 0,
        divide_price: 0,
        self_dsp: -1,
        cpm_price: 0,
      },
      size_ratio: [
        {
          width: 0,
          height: 0,
          scale: 0,
        },
      ],
      sizeArr: [], // 默认选中的值
      industryList: [], // 预算位
      selfAction: getSelfCols(this),
      handAction: getHandCols(this),
      adPayType: adPayType(this), // 结算方式 1=固价 2=分成 3=RTB
      infos: {
        flowData: [
          {
            name: "流量1",
            proportion: 100,
            conf_type: 1,
            data: {
              selfActionData: [],
            },
          },
        ],
        ruleValidate: {},
      },
      selfActionData: {},
      timeWeeks: "",
      timeDefault: "",
      radio_type: null,
      radio_index: null,
      radio_i: null,
      successIndex: 1,
      deployData1: {},
      provinceCityList: [], // 省份的列表
      phoneBrandList: [], // 手机品牌的列表
      tagListData: [], // 标签的列表
      adMaterialSizeArr: [], // 素材尺寸的比例
    };
  },
  computed: {
    headTitle() {
      return showTitle(this.$route, this);
    },
  },
  watch: {
    infos: {
      deep: true,
      immediate: true,
      handler: function (v) {
        this.$nextTick(() => {
          this.infos.flowData.forEach((item, index) => {
            item.data.selfActionData.forEach((data, key) => {
              let form = "flowData" + index + key;
              this.$refs[form][0].validateField("flowDataList");
            });
          });
        });
      },
    }
  },
  methods: {
    /**
     * [flowDataListRule 配置的验证]
     * @return {[type]} [description]
     */
    flowDataListRule(rule, value, callback) {
      let index = rule.index;
      let i = rule.i;
      let showTxt = "";
      let curArr = [...this.infos.flowData];
      let dateItem = curArr[index].data.selfActionData[i];
      let time = parseInt(dateItem.control_time_custom, 2);
      if (
        dateItem.dsp_slot_id[0] === "0" ||
        dateItem.dsp_slot_id.length === 0
      ) {
        showTxt = "请选择预算位";
      }

      // 校验[尺寸比例]
      if (dateItem.ratio_is_ok === -1 || dateItem.ratio_is_ok === "-1") {
        showTxt = "尺寸比例检验不通过";
      }

      // 校验价格浮动系数
      // if (
      //   dateItem.price_float <= 0 ||
      //   dateItem.price_float > 200 ||
      //   dateItem.price_float % 1 !== 0
      // ) {
      //   showTxt = "价格浮动系数必须是1~200中的任意整数";
      // }

      // <!-- 1=固价 2=分成 3=RTB -->

      // 校验利润系数 (大于0小于等于100) (结算方式及价格=3=RTB & )
      if (this.deployData.pay_type === 3 && dateItem.pay_type === 3) {
        if (
          dateItem.profit_ratio < 0 ||
          dateItem.profit_ratio > 100 ||
          dateItem.profit_ratio % 1 !== 0 ||
          dateItem.profit_ratio === null
        ) {
          showTxt = "利润系数必须大于等于0小于等于100的整数";
        }
      }

      // 校验[底价] (大于等于0)
      if (this.deployData.pay_type !== 3 && dateItem.pay_type === 3) {
        if (dateItem.floor_price < 0 || dateItem.floor_price === null) {
          showTxt = "底价必须大于等于0";
        }
      }

      if (
        dateItem.control_weight < 0 ||
        dateItem.control_weight > 1000 ||
        dateItem.control_weight % 1 !== 0
      ) {
        showTxt = "权重必须0~1000的任意整数";
      }
      if (
        dateItem.control_show_day < 0 ||
        dateItem.control_show_day % 1 !== 0
      ) {
        showTxt = "展现控制必须大于0的任意整数";
      }
      if (
        dateItem.control_click_day < 0 ||
        dateItem.control_click_day % 1 !== 0
      ) {
        showTxt = "点击控制必须是大于0的任意整数";
      }
      if (!dateItem.control_time_type) {
        showTxt = "请选择时段控制";
      }
      if (dateItem.control_time_type === 1) {
        if (!time || time === 0) {
          showTxt = "请选择自定义时段";
        }
      }
      if (dateItem.defaultCrowd.tag_orientation === 1) {
        if (
          dateItem.defaultCrowd.tag_proportion < 0 ||
          dateItem.defaultCrowd.tag_proportion > 100 ||
          dateItem.defaultCrowd.tag_proportion % 1 !== 0
        ) {
          showTxt = "定向外流量占比必须是0~100的的任意整数";
        }
        if (!dateItem.defaultCrowd.tag_list.length) {
          showTxt = "人群标签至少填写一条";
        }
      } else if (dateItem.defaultCrowd.tag_orientation === 2) {
        if (!dateItem.defaultCrowd.tag_list.length) {
          showTxt = "人群标签至少填写一条";
        }
      }
      if (dateItem.brand_type !== -1 && dateItem.brand_ids.length === 0) {
        showTxt = "请选择品牌定向";
      }
      if (dateItem.area_type !== -1 && dateItem.area_codes.length === 0) {
        showTxt = "请选择地域定向";
      }
      if (showTxt) {
        callback(new Error(showTxt));
      } else {
        callback();
      }
    },
    /**
     * [formatNumber 变成千分位]
     * @return {[type]} [description]
     */
    formatNumber(value) {
      if (value === "") return " ";
      return this.number2ThousandNumber(value);
    },
    /**
     * [number2ThousandNumber 变成千分位]
     * @return {[type]} [description]
     */
    number2ThousandNumber(num) {
      if (!num || num === Infinity || num === -Infinity) {
        return 0;
      } else {
        if (Number.isInteger(num)) {
          return parseInt(num).toLocaleString(); // 数字
        } else {
          return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"); // 字符串
        }
      }
    },
    /**
     * [hourData 获取自定义的时间段]
     * @return {[type]} [description]
     */
    hourData(hour) {
      let arr1 = [];
      let arr2 = [];
      let textArr = [];
      let hourArr = [];
      for (let i = 0; i < hour.length; i++) {
        if (hour[i] === "1") {
          arr1.push(i);
          arr2.push(i + 1);
          textArr.push(i);
          textArr.push(i + 1);
        }
      }
      let combine_arr = [...new Set(textArr)];
      let intersection_arr = arr1.filter((value) => new Set(arr2).has(value));
      hourArr = combine_arr.filter(
        (value) => !new Set(intersection_arr).has(value)
      );
      let text = [];
      hourArr.map((it, i) => {
        if (i % 2 === 0) {
          let title = it + ":00~" + hourArr[i + 1] + ":00";
          text.push(title);
        }
      });
      let word = text.toString();
      return word;
    },
    /**
     * [areaData 获取自定义的城市]
     * @return {[type]} [description]
     */
    areaData(datas) {
      let cityData = [];
      datas.map((item) => {
        if (item.little || item.check) {
          if (item.children) {
            item.children.map((it) => {
              if (it.check) {
                cityData.push(it.label);
              }
            });
          }
        }
      });
      return cityData.toString();
    },
    /**
     * [brandData 获取自定义的品牌]
     * @return {[type]} [description]
     */
    brandData(datas) {
      let brand = [];
      datas.map((item) => {
        if (item.check) {
          brand.push(item.label);
        } else {
          if (item.little) {
            item.children.map((it) => {
              if (it.check) {
                brand.push(it.label);
              }
            });
          }
        }
      });
      return brand.toString();
    },
    /**
     * [getAdMaterialSize 获取素材尺寸列表]
     * 2021、04、30
     * @return {[type]} [description]
     */
    getAdMaterialSize(obj) {
      getAdRatio({ creative_types: obj }).then((res) => {
        if (res.code === 200) {
          let list = res.data.list || [];

          let arr = list.map((item) => {
            let obj = {
              ratio: `${item.width_ratio}:${item.height_ratio}`,
              scale: this.number2Thousand(item.width_ratio / item.height_ratio),
            };
            return obj;
          });
          this.adMaterialSizeArr = arr;
        }
      });
    },
    /**
     * [brandData 获取自定义的品牌]
     * @return {[type]} [description]
     */
    tagTextData(data) {
      let tagList = this.tagListData;
      let tagText = [];
      tagList.map((item) => {
        if ([...data].indexOf(item.code) > -1) {
          tagText.push(item.name);
        }
      });
      return tagText.toString();
    },
    /**
     * [getDealListData 获取dealid]
     * @return {[type]} [description]
     */
    getDealListData() {
      let ssp_slot_ids = [];
      ssp_slot_ids.push(parseInt(this.slot_id));
      let params = {
        ssp_slot_ids: ssp_slot_ids,
        page_size: 0,
        page_num: 1,
      };
      getDealList(params).then((res) => {
        let data = res.data;
        if (res.code === 200) {
          this.dealList = data.list;
        }
      });
    },

    number2Thousand(num) {
      // 非零/ 正负无穷
      if (!num || num === Infinity || num === -Infinity) {
        return 0;
      } else {
        if (Number.isInteger(num)) {
          return parseInt(num);
        } else {
          return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"); // 字符串
        }
      }
    },
    /**
     * [capture 点击捕获数据]
     * @return {[type]} [description]
     */
    capture(id, type, index, i) {
      let obj = {};
      obj.ssp_slot_id = parseInt(this.slot_id);
      obj.dsp_slot_id = parseInt(id[1]);
      this.$Modal.confirm({
        title:
          "确定要捕获该位置的广告数据么？确认后，将成功发起数据捕获，请至少2分钟后下载广告数据。",
        onOk: () => {
          getFetchRealData(obj).then((data) => {
            if (data.code === 200) {
              let curArr = [...this.infos.flowData];
              let listData = {};
              listData = curArr[index].data.selfActionData[i];
              listData.catch = 1;
              this.infos.flowData = curArr;
              this.$Message.success("捕获成功");
            }
          });
        },
        onCancel: () => {},
      });
    },
    /**
     * [downCapture 点击下载捕获数据]
     * @return {[type]} [description]
     */
    downCapture(url) {
      window.open(url);
    },
    /**
     * [getProvinceCityList 获取省市的列表]
     * @return {[type]} [description]
     */
    getProvinceCityList() {
      getProvinceCityApi().then((data) => {
        if (data.code === 200) {
          this.provinceCityList = data.data.list;
          this.getConfigurationData();
        }
      });
    },
    /**
     * [getCrowdTagList 获取标签列表]
     * @param  {[type]} query [description]
     * @return {[type]}       [description]
     */
    getCrowdTagList() {
      getCrowdTagList().then((res) => {
        if (res.code === 200) {
          this.tagListData = res.data.list || [];
        }
      });
    },
    /**
     * [getPhoneBrandList 获取手机品牌的列表]
     * @return {[type]} [description]
     */
    getPhoneBrandList() {
      getPhoneBrand().then((data) => {
        this.phoneBrandList = data.data.list;
      });
    },

    /**
     * [getCityList 省市定向的列表的初始化加载]
     * @return {[type]} [description]
     */
    getCityList() {
      let provinceArr = this.provinceCityList;
      let provinceList = provinceArr.map((i) => {
        let obj = {};
        obj.value = i.value;
        obj.label = i.label;
        obj.check = false;
        obj.little = false;
        obj.childrenName = "城市";
        obj.type = "app";
        obj.children = [];
        i.children.map((item) => {
          let objs = {};
          objs.value = item.value;
          objs.label = item.label;
          objs.fatherCitylabel = i.label;
          objs.childrenCitylabel = item.label;
          objs.check = false;
          objs.type = "cityChildren";
          objs.little = false;
          obj.children.push(objs);
        });
        return obj;
      });
      return provinceList;
    },
    /**
     * [statusChange 选择时重新赋值]
     * @return {[type]} [description]
     */
    statusChange(val) {
      let data = [...this.infos.flowData];
      this.infos.flowData = data;
    },
    /**
     * [seeDelete 查看已删除的列表]
     * @return {[type]} [description]
     */
    seeDelete(index) {
      let data = this.infos.flowData;
      let searchDsp = [];
      // 删选已经存在的ID
      data.map((item) => {
        let actionData = [];
        actionData = item.data.selfActionData;
        actionData.map((it) => {
          searchDsp.push(it.dsp_slot_id[1]);
        });
      });
      this.except_dsp_slot_id = searchDsp;
      this.deleteIndex = index;
      this.deleteStatus = !this.deleteStatus;
    },
    /**
     * [seeSuccess 删除的预算位的重新赋值]
     * @return {[type]} [description]
     */
    seeSuccess(row) {
      let dataList = [...this.infos.flowData];
      let obj = row;
      let index = this.deleteIndex;
      this.successIndex = this.successIndex + 1;
      obj.dsp_slot_id = [
        row.dsp_company_id.toString(),
        row.dsp_slot_id.toString(),
      ]; // 预算位的赋值
      let size_ratio =
        row.width_ratio && row.height_ratio
          ? this.number2Thousand(row.width_ratio / row.height_ratio)
          : 0;
      obj.size_ratio = size_ratio; // 尺寸比列的书写
      let scale = this.size_ratio.map((item) => {
        return Number(item.scale);
      });
      let scaleStatus = 1;
      scale.forEach((item) => {
        if (Math.abs(size_ratio - item) < 0.05) {
          scaleStatus = 2;
        }
      });
      obj.ratio_is_ok = scaleStatus === 1 ? -1 : 1;
      // 时间段的修改
      let control_time_custom = obj.control_time_custom
        .split("")
        .reverse()
        .join("");
      obj.control_time_custom = control_time_custom;
      // 时段控制的id
      obj.timeID = "deleteTimeID" + this.successIndex;
      // 城市定向
      obj.cityList = this.getCityList();
      obj.area_type = row.area_type ? row.area_type : -1;
      obj.brand_type = row.brand_type ? row.brand_type : -1;
      obj.tag_relation = row.tag_relation ? row.tag_relation : 1;
      obj.area_codes = row.area_type !== -1 ? row.area_codes.split(",") : [];
      obj.area_text = row.area_type !== -1 ? row.area_text : "";
      // 手机定向的测试
      obj.phoneList = this.getPhoneList();
      obj.brand_ids = row.brand_type !== -1 ? row.brand_ids.split(",") : [];
      obj.brand_text = row.brand_type !== -1 ? row.brand_text : "";
      obj.downStatus = 1;
      obj.budget_status = row.dsp_slot_status;
      let type =
        row.os_type === 1 ? "Android" : row.os_type === 2 ? "ios" : "不限";
      obj.title = "ID:" + row.dsp_slot_id[1] + "，终端:" + type;
      // 人群定向
      let objCrowd = {};
      objCrowd.tag_orientation = row.tag_orientation;
      objCrowd.tag_proportion = row.tag_proportion;
      objCrowd.tag_relation = row.tag_relation ? row.tag_relation : 1;
      objCrowd.tag_list = row.tag_list ? row.tag_list : [];
      obj.defaultCrowd = objCrowd;

      // obj.tag_list = row.tag_list && row.tag_list.length > 0 ? row.tag_list : ['']
      obj.catch = row.catch === 1 ? 1 : -1;
      obj.capture = 1;
      obj.checkPhone = row.check_old_phone ? row.check_old_phone : -1;
      dataList[index].data.selfActionData.push(obj);
      this.infos.flowData = dataList;
    },
    /**
     * [slotSelect 选择预算位]
     * @return {[type]} [description]
     */
    slotSelect(id, type, index, i) {
      this.selected_id = Number(id[1]);
      this.radio_type = type;
      this.radio_index = index;
      this.radio_i = i;
      let data = this.infos.flowData;
      let searchDsp = [];
      // 删选已经存在的ID
      data.map((item) => {
        let actionData = [];
        actionData = item.data.selfActionData;
        actionData.map((it) => {
          searchDsp.push(Number(it.dsp_slot_id[1]));
        });
      });
      this.except_dsp_slot_id = searchDsp;
      this.modalSelect = !this.modalSelect;
    },
    /**
     * [selectSuccess 选择预算位成功的返回]
     * @return {[type]} [description]
     */
    selectSuccess(selectedData) {


      console.log('选择预算位成功的返回')
      console.log(JSON.parse(JSON.stringify(selectedData)))

      let curArr = [...this.infos.flowData];
      let scale = this.size_ratio.map((item) => {
        return Number(item.scale);
      });
      let listData = {};
      listData = curArr[this.radio_index].data.selfActionData[this.radio_i];

      console.log(JSON.parse(JSON.stringify(listData)))


      let _temp = selectedData.ad_ratio[selectedData.ad_ratio.length - 1];
      listData.size_ratio = _temp
        ? Number(this.number2Thousand(_temp.width / _temp.height))
        : 0;
      // 判断尺寸比列的修改
      if (listData.size_ratio) {
        let scaleStatus = 1;
        scale.forEach((item) => {
          if (Math.abs(listData.size_ratio - item) < 0.05) {
            scaleStatus = 2;
          }
        });
        listData.ratio_is_ok = scaleStatus === 2 ? 1 : -1;
      } else {
        listData.ratio_is_ok = -1;
      }
      listData.budget_status = selectedData.status; // 预算位是否正常
      let type =
        selectedData.os_type === 1
          ? "Android"
          : selectedData.os_type === 2
          ? "ios"
          : "不限";
      listData.dsp_slot_name = selectedData.dsp_slot_name; // 预算位的名称
      listData.os_type = selectedData.os_type; // 预算位的操作系统
      listData.ad_type_text = selectedData.ad_type; // 预算位的样式文本
      listData.ad_type_id = Number(selectedData.ad_type_id); // 预算位的样式ID
      listData.title = "ID:" + selectedData.id + "，终端:" + type;
      listData.dsp_slot_id = [
        selectedData.dsp_company_id.toString(),
        selectedData.id.toString(),
      ]; // 预算位的id
      listData.last_cpc = selectedData.last_cpc; //
      listData.last_ecpm = selectedData.last_ecpm;
      listData.width_ratio = _temp.width;
      listData.height_ratio = _temp.height;

      // 结算方式
      listData.pay_type = selectedData.pay_type
      listData.pay_type_text = selectedData.pay_type_text

      this.infos.flowData = curArr;
    },

    /**
     * [goBack 返回上一页面]
     * @return {[type]} [description]
     */
    goBack() {
      this.$router.back(-1);
    },
    updateCity() {},
    updateCityName(val) {},
    /**
     * [getPhoneList 获取手机品牌]
     * @return {[type]} [description]
     */
    getPhoneList() {
      let PhoneArr = this.phoneBrandList;
      let phoneList = PhoneArr.map((i, index) => {
        let obj = {};
        obj.value = i.id.toString();
        obj.label = i.name;
        obj.check = false;
        obj.little = false;
        return obj;
      });
      return phoneList;
    },
    /**
     * [changeState 切换状态显示]
     * @return {[type]} [description]
     */
    changeState(type) {
      if (type === 1) {
        this.basicStatus = this.basicStatus === 1 ? 2 : 1;
        localStorage.setItem("basicStatus", this.basicStatus);
      } else if (type === 2) {
        this.priceStatus = this.priceStatus === 1 ? 2 : 1;
        localStorage.setItem("priceStatus", this.priceStatus);
      } else if (type === 3) {
        this.strategyStatus = this.strategyStatus === 1 ? 2 : 1;
        localStorage.setItem("strategyStatus", this.strategyStatus);
      } else if (type === 4) {
        this.flowStatus = this.flowStatus === 1 ? 2 : 1;
        localStorage.setItem("flowStatus", this.flowStatus);
      } else if (type === 5) {
        this.otherStatus = this.otherStatus === 1 ? 2 : 1;
        localStorage.setItem("otherStatus", this.otherStatus);
      }
    },
    /**
     * [sizeChange 尺寸比列的修改]
     * @return {[type]} [description]
     */
    sizeChange(obj) {
      let size_ratio = obj.map((item) => {
        let size = item.split(":");
        let object = {
          width: Number(size[0]),
          height: Number(size[1]),
          scale: this.number2Thousand(Number(size[0]) / Number(size[1])),
        };
        return object;
      });
      this.size_ratio = size_ratio;
      this.flowDataSize();
    },
    /**
     * [flowDataSize 尺寸比列修改完成之后的赋值]
     * @return {[type]} [description]
     */
    flowDataSize() {
      let scale = this.size_ratio.map((item) => {
        return Number(item.scale);
      });
      let data = [...this.infos.flowData];
      Object.keys(data).forEach((k) => {
        let actionData = [];
        actionData = data[k].data.selfActionData;
        Object.keys(actionData).forEach((h) => {
          let sizeRatio = actionData[h].size_ratio;
          let scaleStatus = 1;
          scale.forEach((item) => {
            if (Math.abs(sizeRatio - item) < 0.05) {
              scaleStatus = 2;
            }
          });
          if (scaleStatus === 2) {
            actionData[h].ratio_is_ok = 1;
          } else {
            actionData[h].ratio_is_ok = -1;
          }
        });
      });
      this.infos.flowData = data;
    },
    /**
     * [addSize 尺寸的增加]
     * @return {[type]} [description]
     */
    addSize() {
      let obj = { width: 0, height: 0, scale: "" };
      this.size_ratio.push(obj);
    },
    /**
     * [addSize 尺寸的删除]
     * @return {[type]} [description]
     */
    deleteSize(index) {
      this.size_ratio.splice(index, 1);
      this.flowDataSize();
    },
    /**
     * [creativeId2Text 获取广告样式]
     * @return {[type]} [description]
     */
    creativeId2Text(id) {
      let _arr = this.$store.state.app.adStyleData;
      // eslint-disable-next-line eqeqeq
      let result = _arr.filter((item) => item.id == id);
      return result[0] ? result[0].title : "";
    },
    /**
     * [getConfigurationData 获取配置页面的数据]
     * @return {[type]} [description]
     */
    getConfigurationData() {
      let slot_id = parseInt(this.slot_id);
      getSspSlotConfigData({
        slot_id,
      }).then((data) => {
        let date = data;

        if (date.code === 200) {
          this.$Spin.hide();
          let list = date.data;

          // cpm价格
          list.valuation_price = list.valuation_price > 0
            ? Number(this.number2Thousand(list.valuation_price / 100))
            : 0;

          // 分成系数
          list.divide_price = list.divide_price > 0
            ? Number(list.divide_price / 100)
            : 0; // cpc价格
          
          list.cpm_price =
            list.cpm_price > 0
              ? Number(this.number2Thousand(list.cpm_price / 100))
              : 0; // cpm出价
          list.cpc = list.floor_price_cpc > -1; // 判断cpc是否选中
          list.floor_price_cpc =
            list.floor_price_cpc > 0
              ? Number(this.number2Thousand(list.floor_price_cpc / 100))
              : 0; // cpc价格
          list.cpm = list.floor_price_cpm > -1; // 判断cpm是否选中
          list.floor_price_cpm =
            list.floor_price_cpm > 0
              ? Number(this.number2Thousand(list.floor_price_cpm / 100))
              : 0; // cpm价格
          list.self_dsp = list.self_dsp === 1 ? 1 : -1;
          this.getAdMaterialSize(list.creative_type); // 获取所有的样式下的素材比列
          // 尺寸比列的赋值
          if (list.ad_ratio.length > 0) {
            this.size_ratio = list.ad_ratio.map((item, index) => {
              item.scale = Number(
                this.number2Thousand(item.width / item.height)
              );
              let number = `${item.width}:${item.height}`;
              this.sizeArr.push(number);
              return item;
            });
          }
          let dataList = [];
          // 资源分配的赋值
          if (list.controller.length > 0) {
            let controllerData = list.controller;
            controllerData.map((it, index) => {
              let obj = it;
              let data = {
                selfActionData: [],
              };
              data.selfActionData = this.getResourceList(it.controller_list);
              obj.data = data;
              dataList.push(obj);
            });
            this.infos.flowData = dataList;
          }

          this.deployData = list;
        }
      });
    },
    /**
     * [getConfigurationData 配置初始化复值的时候的时候流量的分配]
     * @return {[type]} [description]
     */
    getResourceList(data, res) {

      console.log('getResourceList')
      console.log(JSON.parse(JSON.stringify(data)))


      let controllerList = data;
      let dataList = controllerList.map((item, q) => {
        let type =
          item.os_type === 1 ? "Android" : item.os_type === 2 ? "ios" : "不限";
        item.name = item.dsp_slot_name; // 名称的展示
        item.title = "ID:" + item.dsp_slot_id + "，终端:" + type; // 名称后面的提示
        item.dsp_slot_id = [
          item.dsp_company_id.toString(),
          item.dsp_slot_id.toString(),
        ]; // 预算位默认赋值
        let sizeRatio =
          item.width_ratio && item.height_ratio
            ? this.number2Thousand(item.width_ratio / item.height_ratio)
            : 0;
        item.size_ratio = sizeRatio; // 尺寸比列的计算
        item.budget_status = item.dsp_slot_status;
        let controlCustom = item.control_time_custom
          .split("")
          .reverse()
          .join("");
        item.control_time_custom = controlCustom; // 时段的选择
        item.timeID = "timeID" + item.dsp_slot_id[1] + q;
        // 城市的选择判断
        item.area_type = item.area_type ? item.area_type : -1;

        item.cityList = this.getCityList();
        item.area_codes =
          item.area_type !== -1 ? item.area_codes.split(",") : [];
        item.area_text = item.area_type !== -1 ? item.area_text : "";
        // 手机品牌的选择
        item.phoneList = this.getPhoneList();
        item.downStatus = 1;
        item.brand_type = item.brand_type ? item.brand_type : -1;
        item.brand_ids =
          item.brand_type !== -1 ? item.brand_ids.split(",") : [];
        item.brand_text = item.brand_type !== -1 ? item.brand_text : "";
        item.namessss = {};
        // 人群定向
        let objCrowd = {};
        objCrowd.tag_orientation = item.tag_orientation;
        objCrowd.tag_proportion = item.tag_proportion;
        objCrowd.tag_relation = item.tag_relation ? item.tag_relation : 1;
        objCrowd.tag_list = item.tag_list ? item.tag_list : [];
        item.defaultCrowd = objCrowd;
        // item.tag_list = item.tag_list && item.tag_list.length > 0 ? item.tag_list : ['']
        // 捕获数据
        item.catch = item.catch === 1 ? 1 : -1;
        // 屏蔽老旧机型
        item.checkPhone = item.check_old_phone ? item.check_old_phone : -1;


        // 利润系数 & 底价  => 需要 / 100
        item.profit_ratio = item.profit_ratio
        item.floor_price = item.floor_price / 100
        item.pay_type = item.dsp_slot_pay_type // 结算类型
        item.pay_type_text = item.dsp_slot_pay_type_text // 结算类型-文字

        return item;
      });

      console.log(JSON.parse(JSON.stringify(dataList)))


      return dataList;
    },
    /**
     * [getCrowdControl 人群定向的修改]
     * @return {[type]} [description]
     */
    getCrowdControl(obj, index, i) {
      let curArr = [...this.infos.flowData];
      let dataList = curArr[index].data.selfActionData[i].defaultCrowd;
      let { valid, form } = obj;
      dataList.tag_orientation = form.tag_orientation;
      dataList.tag_proportion = form.tag_proportion || 0;
      dataList.tag_relation = form.tag_relation || 1;
      dataList.tag_list = form.tag_list || [];
      this.infos.flowData = curArr;
    },

    /**
     * [save 保存按钮的添加]
     * @return {[type]} [description]
     */
    save(name, pass) {
      this.$refs[name].validate((valid) => {
        if (!valid) {
          this.$Message.error("请检查表单的填写!");
        } else {
          let arr = [];
          this.infos.flowData.forEach((item, index) => {
            item.data.selfActionData.forEach((data, key) => {
              let form = "flowData" + index + key;
              this.$refs[form][0].validate((valid) => {
                if (valid) {
                  arr.push(true);
                } else {
                  arr.push(false);
                }
              });
            });
          });
          let flag = arr.every((item) => {
            return item === true;
          });
          if (flag) {
            if (pass === 1) {
              this.submitSave = true;
            } else {
              this.submitPass = true;
            }
            this.errData(pass);
          } else {
            this.$Message.error("请检查表单的填写!");
          }
        }
      });
    },
    /**
     * [errData 判断之前的数据导入的os_type 与 ad_type_id不符合的情况]
     * @return {[type]} [description]
     */
    errData(pass) {
      let data = this.infos.flowData;
      let osType = this.deployData["os_type"] === "Android" ? 1 : 2;
      let adType = this.deployData["ad_type"];
      let errOsList = [];
      let errAdList = [];
      Object.keys(data).forEach((k) => {
        let actionData = [];
        actionData = data[k].data.selfActionData;
        Object.keys(actionData).forEach((h) => {
          if (actionData[h].ad_type_id !== adType) {
            errAdList.push(actionData[h]);
          }
          if (actionData[h].os_type !== 0 && actionData[h].os_type !== osType) {
            errOsList.push(actionData[h]);
          }
        });
      });
      let html = "";
      if (errOsList.length > 0 || errAdList.length > 0) {
        Object.keys(errOsList).forEach((h) => {
          let type = errOsList[h].os_type === 1 ? "Android" : "IOS";
          html +=
            '<p style="font-size:14px;color:#333;line-height: 25px">当前广告位所配置的预算位：【' +
            errOsList[h].dsp_slot_name +
            "】的应用平台是【" +
            type +
            "】，与当前广告位应用平台【" +
            this.deployData["os_type"] +
            "】不符</p>";
        });
        Object.keys(errAdList).forEach((h) => {
          html +=
            '<p style="font-size:14px;color:#333;line-height: 25px">当前广告位所配置的预算位：【' +
            errAdList[h].dsp_slot_name +
            "】的广告场景是【" +
            errAdList[h].ad_type_text +
            "】，与当前广告位应用平台【" +
            this.deployData["ad_type_text"] +
            "】不符</p>";
        });
        html += "<p>确认提交么？</p>";
        this.$Modal.confirm({
          title: html,
          className: "vertical-center-modal",
          width: 600,
          onOk: () => {
            this.submitData(pass);
          },
          onCancel: () => {
            if (pass === 1) {
              this.submitSave = false;
            } else {
              this.submitPass = false;
            }
          },
        });
      } else {
        this.submitData(pass);
      }
    },
    /**
     * [submitData 提交数据的修改]
     * @return {[type]} [description]
     */
    submitData(pass) {
      let obj = {};
      if (this.deployData.status === 3 || this.deployData.status === 4) {
        if (pass === 2) {
          obj.status = 1;
        }
      }
      obj.slot_id = parseInt(this.slot_id); // 广告位id
      obj.discount_click = Number(this.deployData.discount_click); // 广告点击比
      obj.discount_show = Number(this.deployData.discount_show); // 广告展现比
      obj.max_request_times = Number(this.deployData.max_request_times); // 最大广告请求数
      obj.cpm_price = parseInt(parseFloat(this.deployData.cpm_price) * 100); // cpm出价
      // 宽高比
      let adRatio = this.size_ratio;
      let sspWidth = [];
      let sspHeight = [];
      Object.keys(adRatio).forEach((h) => {
        sspWidth.push(adRatio[h].width);
        sspHeight.push(adRatio[h].height);
      });
      obj.ssp_ad_ratio_width = sspWidth;
      obj.ssp_ad_ratio_height = sspHeight;
      // cpm底价为0时传-1
      obj.floor_price_cpm = this.deployData.cpm
        ? BigNumber(this.deployData.floor_price_cpm).multipliedBy(100).toNumber()
        : -1;
      // cpc底价为0时传-1
      obj.floor_price_cpc = this.deployData.cpc
        ? BigNumber(this.deployData.floor_price_cpc).multipliedBy(100).toNumber()
        : -1;


      // cpm价格
      obj.valuation_price =
        this.deployData.pay_type === 1
          ? BigNumber(this.deployData.valuation_price).multipliedBy(100).toNumber()
          : 0;
      // cpc价格(分成系数)
      obj.divide_price =
        this.deployData.pay_type === 2
          ? BigNumber(this.deployData.divide_price).multipliedBy(100).toNumber()
          : 0;
      // 结算方式及价格
      obj.pay_type = this.deployData.pay_type

      // 启用到自营
      // obj.self_dsp = parseInt(this.deployData.self_dsp)
      // 第三方平台广告位数据
      obj.platform_slot_code = this.deployData.platform_slot_code;
      // 内部广告位名称
      obj.ssp_slot_alias = this.deployData.ssp_slot_alias;
      // 外部广告位ID
      obj.ex_slot_id = this.deployData.ex_slot_id;
      // 频次控制
      // obj.user_dsp_ctrl_status = this.deployData.user_dsp_ctrl_status
      let data = this.infos.flowData;
      let controller = [];
      Object.keys(data).forEach((k) => {
        let obj1 = {};
        obj1.proportion = parseInt(data[k].proportion);
        obj1.conf_type = 1; // 流量分配全部为eCPM自动
        obj1.name = data[k].name;
        let controllerList = [];
        let selfActionData = data[k].data.selfActionData;
        controllerList = this.saveResource(selfActionData, 1);
        obj1.controller_list = controllerList;
        controller.push(obj1);
      });
      if (controller[0].controller_list.length > 0) {
        obj.controller = controller;
      } else {
        obj.controller = [];
      }
      submitConfigApi(obj).then(
        (data) => {
          let register = data;
          if (pass === 1) {
            this.submitSave = false;
          } else {
            this.submitPass = false;
          }
          if (register.code === 200) {
            this.$Bus.$emit("sspAdvEmitEvent"); // ssp-adv
            this.$Bus.$emit("dspSlotEmitEvent"); // dsp-slot
            this.$Message.success("配置成功");
            this.$router.back(-1);
          }
          // eslint-disable-next-line handle-callback-err
        },
        (error) => {
          if (pass === 1) {
            this.submitSave = true;
          } else {
            this.submitPass = true;
          }
        }
      );
    },
    /**
     * [saveResource 提交时流量的拆分]
     * @return {[type]} [description]
     */
    saveResource(data, type) {
      let resource = [];
      data.map((item, index) => {
        let obj = {};
        obj.dsp_company_id = Number(item.dsp_slot_id[0]); // 公司的ID
        obj.dsp_slot_id = Number(item.dsp_slot_id[1]); // 预算ID
        obj.control_weight = type === 1 ? Number(item.control_weight) : 0; // 权重
        obj.control_proportion =
          type === 1 ? 0 : parseInt(item.control_proportion); // 流量占比
        obj.price_float = Number(item.price_float); // 价格浮动系数
        obj.control_show_day = Number(item.control_show_day); // 展示控制
        obj.control_click_day = Number(item.control_click_day); // 展现控制
        obj.control_req_day = Number(item.control_req_day); // 请求量控制
        obj.check_old_phone = item.checkPhone; // 屏蔽老旧机型
        obj.test_plan_id = item.test_plan_id ? item.test_plan_id : 0; // 测试计划状态
        // 时段控制
        obj.control_time_type = Number(item.control_time_type);
        let controlCustom = item.control_time_custom
          .split("")
          .reverse()
          .join("");
        obj.control_time_custom = controlCustom;
        // 品牌定向
        obj.brand_type = item.brand_type;
        obj.brand_ids = item.brand_type === -1 ? "" : item.brand_ids.toString();
        // 地域定向
        obj.area_type = item.area_type;
        obj.area_codes =
          item.area_type === -1 ? "" : this.dataCityData(item.cityList);
        // 人群定向
        obj.tag_orientation = item.defaultCrowd.tag_orientation;
        obj.tag_proportion =
          obj.tag_orientation === 1 ? item.defaultCrowd.tag_proportion : 0;
        obj.tag_relation =
          obj.tag_orientation === 1 ? item.defaultCrowd.tag_relation : 1;
        obj.tag_list =
          obj.tag_orientation === 0 ? [] : item.defaultCrowd.tag_list;

        obj.catch = item.catch;
        // deal组的选择
        obj.dg_id = item.dg_id;

        // <!-- 1=固价 2=分成 3=RTB -->

        // 利润系数 当[广告位结算方式 & 预算位结算方式]同时为RTB 显示
        obj.profit_ratio = this.deployData.pay_type == 3 && item.pay_type == 3 ? item.profit_ratio : 0
        // 底价 广告位为非RTB, 预算位为RTB
        obj.floor_price = this.deployData.pay_type != 3 && item.pay_type == 3 ? item.floor_price * 100 : 0

        resource.push(obj);
      });

      console.log('点击保存')
      console.log(JSON.parse(JSON.stringify(resource)))

      return resource;
    },
    /**
     * [dataCityData 获取选中的城市]
     * @return {[type]} [description]
     */
    dataCityData(datas) {
      let cityData = [];
      datas.map((item) => {
        if (item.check) {
          cityData.push(item.value);
        } else {
          if (item.little) {
            item.children.map((it) => {
              if (it.check) {
                cityData.push(it.value);
              }
            });
          }
        }
      });
      return cityData.toString();
    },
    /**
     * [addFlow 拆分流量]
     * @return {[type]} [description]
     */
    addFlow() {
      let index = this.infos.flowData.length;
      let flowObj = {
        name: "流量" + (parseInt(index) + 1),
        proportion: undefined,
        conf_type: 1,
        data: {
          selfActionData: [
            {
              downStatus: 2, // 判断状态
              dsp_slot_name: "预算位", // 预算位的名称
              dsp_slot_id: [], // 预算位的ID
              title: "", // 预算位的ID以及终端的选择
              ad_type_text: "", // 预算位的样式文本
              ad_type_id: "", // 预算位的样式ID
              os_type: "", // 预算位的终端
              control_proportion: 0, // 流量占比
              control_weight: 0, // 权重
              control_req_day: 0, // 请求控量
              control_show_day: 0, // 展示控量
              control_click_day: 0, // 点击控量

              profit_ratio: 0, // 利润系数
              floor_price: 0, // 底价
              // price_float: 100, // 价格浮动系数

              size_ratio: 0, // 尺寸比例比
              width_ratio: 0, // 尺寸比例宽
              height_ratio: 0, // 尺寸比例高
              ratio_is_ok: -1, // 尺寸比列是否匹配
              control_time_type: 2, // 投放时段的状态
              control_time_custom: "00000000000000000000000", // 投放的时段
              timeID: "addTimeID" + (parseInt(index) + 1) + "addflow", // 投放时段的插件

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
              tag_list: [""], // 人群定向的列表
              checkPhone: -1, // 屏蔽的老旧机型
              catch: -1, // 捕获数据
              capture: 1, // 数据捕获
              last_cpc: 0, // 预算位的cpc
              last_ecpm: 0, // 预算位的cpm
              dg_id: null, // dealID
            },
          ],
        },
      };

      this.infos.flowData.push(flowObj);
    },
    /**
     * [deleteFlow 删除流量]
     * @return {[type]} [description]
     */
    deleteFlow(index) {
      this.infos.flowData.splice(index, 1);
    },
    /**
     * [addSelfBudget 自营SSp流量的添加]
     * @return {[type]} [description]
     */
    addSelfBudget(index, type) {
      let i = 0;
      let selfActionData = this.infos.flowData[index].data.selfActionData;
      i = selfActionData.length;
      let obj1 = {
        downStatus: 2, // 判断状态
        dsp_slot_name: "预算位", // 预算位的名称
        dsp_slot_id: [], // 预算位的ID
        title: "", // 预算位的ID以及终端的选择
        ad_type_text: "", // 预算位的样式文本
        ad_type_id: "", // 预算位的样式ID
        os_type: "", // 预算位的终端
        control_proportion: 0, // 流量占比
        control_weight: 0, // 权重
        control_req_day: 0, // 请求控量
        control_show_day: 0, // 展示控量
        control_click_day: 0, // 点击控量

        profit_ratio: 0, // 利润系数
        floor_price: 0, // 底价
        // price_float: 100, // 价格浮动系数

        size_ratio: 0, // 尺寸比例比
        width_ratio: 0, // 尺寸比例宽
        height_ratio: 0, // 尺寸比例高
        ratio_is_ok: -1, // 尺寸比列是否匹配
        control_time_type: 2, // 投放时段的状态
        control_time_custom: "00000000000000000000000", // 投放的时段
        timeID: "selfTimeID" + index + "slot" + (parseInt(i) + 1), // 投放时段的插件

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
        tag_list: [""], // 人群定向的列表

        checkPhone: -1, // 屏蔽的老旧机型
        catch: -1, // 捕获数据
        capture: 1, // 数据捕获
        last_cpc: 0, // 预算位的cpc
        last_ecpm: 0, // 预算位的cpm
        dg_id: null, // dealID
      };

      console.log(obj1)

      let curArr = [...this.infos.flowData];
      curArr[index].data.selfActionData.push(obj1);
      this.infos.flowData = curArr;
    },
    /**
     * [unfold 自营SSp流量展开以及关闭]
     * @return {[type]} [description]
     */
    unfold(index, i) {
      let curArr = [...this.infos.flowData];
      let status = curArr[index].data.selfActionData[i].downStatus;
      let test_plan_id = curArr[index].data.selfActionData[i].test_plan_id;
      if (!test_plan_id) {
        curArr[index].data.selfActionData[i].downStatus = status === 1 ? 2 : 1;
        this.infos.flowData = curArr;
      }
    },
    /**
     * [deleteSelfBudget 删除ssp预算位]
     * @return {[type]} [description]
     */
    deleteSelfBudget(index, i) {
      let curArr = [...this.infos.flowData];
      curArr[index].data.selfActionData.splice(i, 1);
      this.infos.flowData = curArr;
      this.statusChange();
    },
  },
  created() {
    let resultArr = this._isPageShow();
    if (
      this._isSuperAdmin() ||
      !!resultArr.includes("setting") ||
      !!resultArr.includes("passAndSet")
    ) {
      this.slot_id = this.$route.params && this.$route.params.slot_id;
      this.$Spin.show();
      this.getProvinceCityList(); // 获取城市定向的文本
      this.getPhoneBrandList(); // 获取手机品牌的文本
      this.getDealListData(); // 获取dealID
      this.getCrowdTagList(); // 获取标签的列表
      this.basicStatus = parseInt(localStorage.getItem("basicStatus"))
        ? parseInt(localStorage.getItem("basicStatus"))
        : 1;
      this.priceStatus = parseInt(localStorage.getItem("priceStatus"))
        ? parseInt(localStorage.getItem("priceStatus"))
        : 1;
      this.strategyStatus = parseInt(localStorage.getItem("strategyStatus"))
        ? parseInt(localStorage.getItem("strategyStatus"))
        : 1;
      this.flowStatus = parseInt(localStorage.getItem("flowStatus"))
        ? parseInt(localStorage.getItem("flowStatus"))
        : 1;
      this.otherStatus = parseInt(localStorage.getItem("otherStatus"))
        ? parseInt(localStorage.getItem("otherStatus"))
        : 1;
    } else {
      this._gotoNoAccess();
    }
  },
};
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.ad_config.ivu-card {
  /deep/ .ivu-card-body {
    padding: 20px 10px;
  }

  /deep/ .ivu-form-item-required .ivu-form-item-label:before {
    position: relative;
    left: -12px;
  }

  /deep/ .ivu-form-item-required .ivu-form-item-label span {
    position: relative;
    left: -16px;
  }

  .config_detail {
    border: 1px solid #DCDCDC;
    padding: 15px;
    margin-top: 10px;
    position: relative;

    .priceCon {
      position: relative;

      .priceCPC {
        position: absolute;
        right: 0px;
        bottom: 0px;
        display: flex;
        padding: 0 15px;

        .priceCPC_con {
          margin: 0 5px;
          text-align: left;
          padding: 5px 10px;
          border-radius: 12px;
        }

        .priceDetail {
          color: #ffffff;
          font-style: italic;

          .priceNum {
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
    }

    .config_header {
      color: #4083F8;
      font-size: 14px;
      display: flex;
      justify-content: space-between;

      .action {
        color: #4083F8;
        cursor: pointer;

        p {
          vertical-align: middle;

          span {
            display: inline-block;
            width: 15px;
            height: 15px;
            text-align: center;
            line-height: 15px;
            background: #3F83F7;
            border-radius: 50%;
            color: #ffffff;
            margin-left: 6px;
          }
        }
      }

      span {
        vertical-align: middle;

        &.line {
          display: inline-block;
          width: 3px;
          height: 14px;
          background: #4083F8;
          margin-right: 5px;
        }
      }
    }

    .config_matter {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;

      .deployText {
        width: 50%;
      }
    }

    .deployText {
      margin-bottom: 8px;

      /deep/ .ivu-form-item-label {
        padding: 8px 12px 8px 0;
      }

      /deep/ .ivu-form-item-content {
        line-height: 28px;

        /deep/ .ivu-input {
          height: 28px;
        }

        /deep/ .ivu-btn {
          height: 28px;
        }
      }

      .size_card {
        display: flex;
        flex-wrap: wrap;

        .size_box {
          margin-right: 20px;
          display: flex;
          margin-bottom: 5px;

          .size_num {
            padding-left: 10px;
            padding-right: 10px;
            background-color: #EBEBEB;
            display: inline-block;
            vertical-align: top;
          }

          .size_action {
            .size_value {
              color: #999999;
              font-size: 14px;
              margin: 0 8px;
            }
          }
        }
      }
    }

    .deployForm {
      /deep/ &.ivu-form-item {
        margin-bottom: 18px;
      }

      /deep/ .ivu-input {
        border-radius: 2px;
      }

      .charge_content {
        display: flex;

        .charge_modal {
          display: flex;

          .charge_xuan {
            margin-right: 10px;
          }

          .charge_num {
            width: 210px;

            .deployForm {
              /deep/ &.ivu-form-item {
                margin-bottom: 0px;
              }
            }

            /deep/ .ivu-form-item-label:before {
              font-size: 0px;
            }
          }
        }
      }

      .settlement_content {
        display: flex;

        .settlement_check {
          margin-right: 10px;
        }

        .settlement_detail {
          width: 250px;
          margin-left: 10px;

          .deployForm {
            /deep/ &.ivu-form-item {
              margin-bottom: 0px;
            }
          }
        }
      }

      .auto_content {
        display: flex;
        flex-wrap: wrap;

        .auto_action {
          display: inline-block;
          vertical-align: middle;
          color: #4083F8;
          cursor: pointer;

          img {
            vertical-align: middle;
          }

          span {
            vertical-align: middle;
            margin-right: 4px;
          }
        }

        .auto_list {
          margin-right: 20px;
        }
      }
    }

    /deep/ .ivu-form-item-error-tip {
      padding-top: 1px;
      font-size: 12px;
    }

    .self_table {
      margin-top: 10px;

      .deploy_list {
        margin-bottom: 20px;
        max-width: 998px;

        /deep/ .ivu-form-item-error-tip {
          padding-top: 2px;
          font-size: 14px;
        }

        .deploy_header {
          display: flex;
          justify-content: space-between;

          .deploy_headerText {
            padding: 5px 12px;
            position: relative;
            background: #F1F1F1;
            border: 1px solid #DCDCDC;
            flex: 1;

            .deploy_title {
              line-height: 20px;
              display: flex;
              justify-content: space-between;

              .deploy_text {
                font-size: 16px;
                color: #333333;
                font-weight: bold;

                .deploy_des {
                  font-weight: normal;
                  color: #999999;
                }
              }

              .header_right {
                margin-right: 20px;

                .capture_text {
                  display: inline-block;
                  width: 123px;
                  text-align: center;
                  height: 21px;
                  background: #FFA320;
                  border: 1px solid #FFA320;
                  border-radius: 10px;
                  line-height: 21px;
                  cursor: pointer;

                  span {
                    color: #ffffff;
                  }

                  /deep/ .ivu-icon {
                    color: #ffffff;
                  }
                }
              }
            }

            // 头部下面的标签
            .deploy_classify {
              display: flex;
              margin-top: 5px;

              .classify_list {
                width: 25%;
                font-size: 14px;
                margin-right: 9px;
                line-height: 20px;

                .classify_text {
                  line-height: 22px;

                  .classify_name {
                    color: #4083F8;
                  }

                  .underline {
                    text-decoration: underline;
                  }

                  .classify_con {
                    color: #666666;

                    &.classify_zoom {
                      display: inline-block;
                      vertical-align: top;
                      max-width: 100px;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }

                    &.classify_num {
                      display: inline-block;
                      vertical-align: top;
                      max-width: 125px;
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
              font-size: 18px;
              color: #333333;
              cursor: pointer;
            }
          }

          // 删除的样式
          .deploy_delete {
            width: 46px;
            height: 105px;
            background: #FB3F3F;
            border: 1px solid #F72D17;
            color: #ffffff;
            text-align: center;
            line-height: 105px;
            cursor: pointer;

            &.deploy_test {
              background: orange;
              border: 1px solid orange;
              line-height: 1.5;

              span {
                display: inline-block;
                padding-top: 30px;
              }
            }
          }
        }

        .deploy_content {
          border: 1px solid #DCDCDC;
          border-top: 0px;
          padding: 15px 10px;

          .deploy_box {
            display: flex;
            flex: 1;
            margin-bottom: 15px;

            &.deploy_line {
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #DCDCDC;
            }

            .xuan_title {
              display: inline-block;
              color: #666;
              font-weight: bold;
              font-size: 14px;
              min-width: 118px;
            }

            .deal_alert {
              margin-left: 10px;
              background: #FFF2F2;
              border-color: transparent;
              color: #F32E3C !important;
              padding: 7px 18px 7px 38px;
            }

            /deep/ .ivu-alert-info .ivu-alert-icon {
              color: #f32e3c;
              font-size: 17px;
              margin-top: 1px;
            }

            .box_list {
              width: 33%;

              .deploy_slot {
                display: inline-block;
                color: #666666;
                font-size: 14px;
                font-weight: bold;
                min-width: 118px;
              }

              .slot_name {
                display: inline-block;
                width: 120px;
                vertical-align: middle;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .slot_select {
                background: #D9E7FF;
                color: #000000;
                border-color: #D9E7FF;
              }
            }

            .tagFlow {
              display: flex;
              margin-bottom: 10px;

              .tagFlowText {
                width: 130px;
              }
            }

            .tagList {
              display: flex;
              flex-wrap: wrap;

              .tagWord {
                margin-right: 0px;
                margin-bottom: 10px;
              }

              .tag_action {
                width: 40px;
                display: inline-block;
                vertical-align: middle;
                color: #4083F8;
                font-size: 20px;
                margin-left: 5px;
              }
            }
          }
        }
      }
    }
  }

  .configBottom {
    text-align: center;

    button {
      margin-top: 25px;
      padding: 0 40px;
      height: 35px;
      line-height: 35px;

      &.savePass {
        padding: 0px;
        width: 120px;
        text-align: center;
      }
    }
  }
}

.autoPop_con {
  margin-top: 10px;

  .auto_button {
    margin-top: 10px;
  }
}

.ivu-checkbox-size {
  margin-right: 20px;
}
</style>
