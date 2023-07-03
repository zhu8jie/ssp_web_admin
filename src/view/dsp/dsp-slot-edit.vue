<template>
  <Card :bordered="false" dis-hover class="page-main ad_config">
    <div class="page-title clearfix">
      <h2 v-if="slot_id">{{modalForm.status !==4? '编辑' : '查看'}}预算位</h2>
      <h2 v-else>新建预算位</h2>
      <div class="is-handler pageTitleNum" v-if="slot_id">
        近三天最新数据：<span>CPM</span>：{{number2ThousandNumber(modalForm.last_ecpm)}}元  /  <span>CPC</span>：{{number2ThousandNumber(modalForm.last_cpc)}}元  /  <span>CTR</span>：{{number2ThousandNumber(modalForm.last_ctr)}}%
      </div>
    </div>
    <div class="config_con">
      <Form ref="modalForm" label-position="left" :model="modalForm" :rules="modalFormRules" :label-width="130">
        <div class="config_detail">
          <div class="config_header">
            <div>
              <span class="line"></span><span>基本信息</span>
            </div>
            <div>
              <div class="action" @click="changeState(1)">
                <p v-show="basicDspStatus === 1">收起<span> <Icon type="ios-arrow-down"/></span></p>
                <p v-show="basicDspStatus === 2">展开<span> <Icon type="ios-arrow-up"/></span></p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px" v-show="basicDspStatus === 1">
            <div class="config_matter">
              <FormItem class="deployText" label="公司名称" prop="dsp_company_id">
                <Select class="editSelect" v-model="modalForm.dsp_company_id" placeholder="请选择" @on-change="getProductList">
                  <Option v-for="item in dspCompanyList" :value="item.id" :key="'公司'+item.id + item.company_name">{{ item.company_name }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem class="deployText" label="产品名称" prop="dsp_product_id">
                <Select class="editSelect" v-model="modalForm.dsp_product_id" placeholder="请选择" @on-change="productChange">
                  <Option v-for="item in productList" :value="item.id" :key="'产品'+item.name + item.id ">{{ item.name }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem class="deployText" label="预算位名称" prop="dsp_slot_name">
                <Input class="editSelect" v-model.trim="modalForm.dsp_slot_name" maxlength="50" show-word-limit/>
              </FormItem>
              <FormItem label="应用平台" prop="os_type" class="size_card deployText">
                <!-- {{modalForm.os_type}} -->
                <RadioGroup v-model="modalForm.os_type" type="button">
                  <Radio v-for="item in osType" :key="'应用平台'+item.id" :label="item.id">{{item.name}}</Radio>
                  <Radio :key="0" :label="0">不限</Radio>
                </RadioGroup>
                <div class="size_diff" v-if="setModalFlag">
                  <template v-if="osTypeErrSlotList.length">不匹配的广告位有</template>
                  <Poptip placement="bottom-end" trigger="hover" popper-class="slot-contact-pop" padding="8px"
                          :width="340" :transfer="true">
                    <span style="cursor: pointer; color:#4083F8; font-weight: bold; margin: 0 4px"
                          v-if="osTypeErrSlotList.length">{{osTypeErrSlotList.length}}</span>
                    <div class="slot-contact-card" slot="content" v-if="osTypeErrSlotList.length">
                      <dl>
                        <dt>不匹配的广告位有：</dt>
                        <dd @click="toAdConfig(item.id)" v-for="item in osTypeErrSlotList" :key="item.id+'不匹配'">
                          <span class="dd-title" :title="item.ssp_slot_name">{{item.ssp_slot_name}}</span>
                          <span class="dd-id">ID：{{item.id}}</span>
                          <i class="iconfont icon-rightarrow"></i>
                        </dd>
                      </dl>
                    </div>
                  </Poptip>
                  <template v-if="osTypeErrSlotList.length">个</template>
                </div>
              </FormItem>
              <FormItem class="deployText" label="广告场景" prop="ad_type_id">
                <Select class="editSelect" v-model="modalForm.ad_type_id" placeholder="请选择">
                  <Option v-for="item in adTypeList" :value="item.id" :key="'场景'+item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem class="deployText" label="广告样式" prop="creative_type">
                <Select class="editSelect" v-model="modalForm.creative_type" placeholder="请选择"  @on-change="getAdMaterialSize">
                  <Option v-for="item in styleData" :value="item.id" :key="'样式'+item.id">{{ item.title }}</Option>
                </Select>
              </FormItem>

<!--              <FormItem class="deployText" label="预算位状态" prop="status">-->
<!--                <RadioGroup v-model="modalForm.status" type="button">-->
<!--                  <Radio :label="1">正常</Radio>-->
<!--                  <Radio :label="2">停用</Radio>-->
<!--                  <Radio :label="3">封禁</Radio>-->
<!--                  <Radio :label="4">测试锁定</Radio>-->
<!--                </RadioGroup>-->
<!--              </FormItem>-->
              <FormItem label="素材尺寸比例" prop="dsp_ratio" class="deployText size_card">
                <!-- {{modalForm.dsp_ad_ratio_width}}, {{modalForm.dsp_ad_ratio_height}} -->
				  <Select class="editSelect" v-model="modalForm.sizeRatio" placeholder="请选择" @on-change="sizeChange()" style="width: 150px">
					  <Option v-for="(item, index) in adMaterialSizeArr" :value="item.ratio" :key="item.ratio + index+'尺寸'">{{ item.ratio }}({{item.scale}})</Option>
				  </Select>
                <div class="size_diff" v-if="setModalFlag">
					<i class="size_value">{{sizeProportion}}</i>
                  <template v-if="ratioErrSlotList.length">不匹配的广告位有</template>
                  <Poptip placement="bottom-end" trigger="hover" popper-class="slot-contact-pop" padding="8px"
                          :width="340" :transfer="true">
                    <span style="cursor: pointer; color:#4083F8; font-weight: bold; margin: 0 4px"
                          v-if="ratioErrSlotList.length">{{ratioErrSlotList.length}}</span>
                    <div class="slot-contact-card" slot="content" v-if="ratioErrSlotList.length">
                      <dl>
                        <dt>不匹配的广告位有：</dt>
                        <dd @click="toAdConfig(item.ssp_slot_id)" v-for="item in ratioErrSlotList"
                            :key="item.ssp_slot_id">
                          <span class="dd-title" :title="item.ssp_slot_name">{{item.ssp_slot_name}}</span>
                          <span class="dd-id">ID：{{item.ssp_slot_id}}</span>
                          <i class="iconfont icon-rightarrow"></i>
                        </dd>
                      </dl>
                    </div>
                  </Poptip>
                  <template v-if="ratioErrSlotList.length">个</template>
                </div>
              </FormItem>
              <FormItem class="deployText" label="采买类型" prop="pickup_status">
                <RadioGroup v-model="modalForm.pickup_status" type="button">
                  <Radio :label="1">联调</Radio>
                  <Radio :label="2">测试</Radio>
                  <Radio :label="3">正式</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem class="deployText" label="预算方广告位ID" prop="dsp_slot_code">
                <Input class="editSelect" :maxlength="50" v-model.trim="modalForm.dsp_slot_code"/>
              </FormItem>
              <FormItem class="deployText" label="预算端appkey">
                <Input class="editSelect" :maxlength="50" v-model.trim="modalForm.dsp_app_key"/>
              </FormItem>
              <FormItem class="deployText" label="直投URL">
                <Input class="editSelect" :max="inputMaxNumber" v-model.trim="modalForm.dsp_slot_request_url"
                       placeholder="仅限交互通使用，其他预算方请勿填写"/>
              </FormItem>
              <FormItem class="deployText" label="预算端appsecret">
                <Input class="editSelect" :maxlength="50" v-model.trim="modalForm.dsp_app_secret"/>
              </FormItem>
              <FormItem class="deployText" label="扩展参数">
                <Input class="editSelect" :maxlength="50" v-model.trim="modalForm.rta_ext"/>
              </FormItem>
              <FormItem class="deployText" label="预算端appid">
                <Input class="editSelect" :maxlength="50" v-model.trim="modalForm.dsp_app_id"/>
              </FormItem>
              <FormItem class="deployText" label="备注">
                <Input class="editSelect" :maxlength="100" show-word-limit type="textarea" :rows="4"
                       v-model.trim="modalForm.dsp_slot_alias"/>
              </FormItem>
				<FormItem class="deployText" label="预算端包名">
					<Input class="editSelect" :maxlength="50" v-model.trim="modalForm.dsp_app_pkg_name"/>
				</FormItem>
				<FormItem class="deployText ivu-form-item-required" prop="interact_mode" label="属性" v-show="modalForm.pickup_status===1">
					<RadioGroup v-model="modalForm.interact_mode">
						<Radio :label="1">跳转落地页</Radio>
						<Radio :label="2">直接下载</Radio>
						<Radio :label="3">deeplink</Radio>
						<Radio :label="4">拨打电话</Radio>
						<Radio :label="5">一键加群</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem class="deployText ivu-form-item-required" label="素材类型" prop="material_type" v-show="modalForm.pickup_status===1">
					<RadioGroup v-model="modalForm.material_type">
						<Radio :label="1">图片</Radio>
						<Radio :label="2">视频</Radio>
					</RadioGroup>
				</FormItem>
            </div>
          </div>
        </div>
        <div class="config_detail">
          <div class="config_header">
            <div>
              <span class="line"></span><span>投放设置</span>
            </div>
            <div>
              <div class="action" @click="changeState(2)">
                <p v-show="putDSPStatus === 1">收起<span> <Icon type="ios-arrow-down"/></span></p>
                <p v-show="putDSPStatus === 2">展开<span> <Icon type="ios-arrow-up"/></span></p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px" v-show="putDSPStatus === 1">
            <Button @click="addSelfAdv()"
                    style="color:#3F83F7;border: 1px solid #4083F8"
                    icon="md-add">
              增加广告位
            </Button>
            <FormItem class="deployForm deployText"  :label-width="0">
              <!--  eCPM自动的流量分配-->
              <div class="self_table">
                <div class="deploy_list" v-for="(it,i) in infos.flowData"
                     :key="'selfActionData'+i">
                  <!--  eCPM头部的内容-->
                  <div class="deploy_header">
                    <div class="deploy_headerText"  @click="unfold(i)">
                      <div class="deploy_title">
                        <div class="header_left">
                      <span class="deploy_text">{{it.ssp_slot_name}}
                          <span class="deploy_des" v-show="it.title">({{it.title}})</span>
                      </span>
                          <span>
                        <Tooltip placement="right-start" :transfer="true" max-width="700">
                              <Icon v-if="it.budget_status === 1 " type="ios-checkmark-circle" style="color: #339900"/>
                              <Icon v-else type="ios-close-circle" style="color: #F72D17"/>
                                <div slot="content">
                                   <p v-if="it.budget_status === 1 " style="font-size: 12px">广告位状态正常,可投放</p>
                                   <p v-else style="font-size: 12px">广告位状态异常,不可投放</p>
                                 </div>
                            </Tooltip>
                      </span>
                        </div>
                      </div>
                      <div class="deploy_classify">
                        <div class="classify_list" style="width: 26%">
                          <p class="classify_text">
                            <span class="classify_name">媒体CPM:</span>
                            <span class="classify_con classify_num">{{number2ThousandNumber(it.last_ecpm)}}元</span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">媒体CPC:</span>
                            <span class="classify_con classify_num">{{number2ThousandNumber(it.last_cpc)}}元</span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">CTR:</span>
                            <span class="classify_con classify_num">{{number2ThousandNumber(it.ctr)}}%</span>
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
                          <p class="classify_text" v-show="modalForm.os_type !==2">
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
                            <span class="classify_con classify_zoom" :title="it.ad_ratio | filterAdRatio">
                                <Icon v-if="it.ratio_is_ok === -1" type="ios-close-circle" style="color: #F72D17"/>
                              <Icon v-else type="ios-checkmark-circle" style="color: #339900"/>
                              {{it.ad_ratio | filterAdRatio }}
                           </span>
                          </p>
                          <p class="classify_text">
                            <span class="classify_name">Deal组:</span>
                            <span class="classify_con classify_zoom" style="max-width: 145px;">
                              <span v-if="!it.dg_id">无</span>
                              <span v-else>
                                <span v-for="item in it.dealList" :key="'搜索'+item.id" v-if="item.id===it.dg_id" :title="item.name">{{item.name}}</span>
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
                    <div class="deploy_delete" @click="deleteSelfAdv(i)">
                      删除
                    </div>
                  </div>
                  <Form :ref="'flowData' + i" :model="it" :rules="infos.ruleValidate" :label-width="0">
                  <!--  eCPM的展开操作部分-->
                    <FormItem prop="flowDataList" :rules="{required: true, index: i,  validator: flowDataListRule}">
                     <div class="deploy_content" v-show="it.downStatus===2">
                    <div class="deploy_box">
                      <div class="box_list" style="width: 31%">
                        <span class="deploy_slot">广告位：</span>
                        <span class="slot_name">{{it.ssp_slot_name}}</span>
                        <Button class="slot_select" type="primary"
                                @click="slotSelect(it['ssp_slot_id'],i)">选择
                        </Button>
                      </div>
                      <div class="box_list" style="width: 31%">
                          <span class="deploy_slot">尺寸比例检验
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指所选预算位与当前广告位尺寸比例需要一致，且可以有上下5%的比例浮动，超过5%，则不匹配，无法提交</p>
                                 </div>
                               </Tooltip>
                           </span>
                        {{it.ad_ratio | filterAdRatio }}
                        <span>
                        <Tooltip placement="right-start" :transfer="true" max-width="700">
                              <Icon v-if="it.ratio_is_ok === -1 " type="ios-close-circle" style="color: #F72D17"/>
                              <Icon v-else type="ios-checkmark-circle" style="color: #339900" />
                                <div slot="content">
                                   <p v-if="it.ratio_is_ok === 1 " style="font-size: 12px">表示广告位与预算位尺寸匹配</p>
                                   <p v-else style="font-size: 12px">表示广告位与预算位尺寸不匹配</p>
                                 </div>
                            </Tooltip>
                      </span>

                      </div>
                      <div class="box_list" style="width: 38%">
                      <span class="deploy_slot">价格浮动系数
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位配置当前预算位参与竞价时，CPM出价的浮动系数，范围是(0%,200%]，默认100%，表示CPM出价不浮动；最终出价为CPM出价*价格浮动系数</p>
                                 </div>
                               </Tooltip>
                           </span>
                        <InputNumber style="width: 80px"  v-model.trim="it.price_float" :max="200" :min="1"/>
                        <span>%</span>
                         <span style="color: #999999;">（出价CPM：{{number2ThousandNumber(it.cpm_price)}}元）</span>
                      </div>
                    </div>
                    <div class="deploy_box">
                      <div class="box_list" style="width: 31%">
                         <span class="deploy_slot">请求控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的请求最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                        <Poptip trigger="focus">
                          <InputNumber :min="0"  v-model="it.control_req_day"
                                       style="width: 150px"/> <span style="font-size: 13px">次/天</span>
                          <div slot="content">{{ formatNumber(it.control_req_day) }}</div>
                        </Poptip>
                      </div>
                      <div class="box_list" style="width: 31%">
                        <span class="deploy_slot">展现控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的展现最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                        <Poptip trigger="focus">
                          <InputNumber :min="0"  v-model="it.control_show_day"
                                       style="width: 150px"/> <span style="font-size: 13px">次/天</span>
                          <div slot="content">{{ formatNumber(it.control_show_day) }}</div>
                        </Poptip>
                      </div>
                      <div class="box_list" style="width: 38%">
                         <span class="deploy_slot">点击控制
                               <Tooltip placement="top" :transfer="true" max-width="300">
                               <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                                <div slot="content">
                                   <p style="font-size: 12px">指该广告位与预算位关系上的点击最大限制，大于该限制，不再向预算位发起请求；默认0，表示不控制</p>
                                 </div>
                               </Tooltip>
                           </span>
                        <Poptip trigger="focus">
                          <InputNumber :min="0"  v-model="it.control_click_day"
                                       style="width: 150px"/> <span style="font-size: 13px">次/天</span>
                          <div slot="content">{{ formatNumber(it.control_click_day) }}</div>
                        </Poptip>
                      </div>
                    </div>
                    <div class="deploy_box deploy_line">
                      <div class="xuan_title">Deal组
                        <Tooltip placement="top" :transfer="true" max-width="300">
                          <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>：
                          <div slot="content">
                            <p style="font-size: 12px">指该媒体的广告位设置了DealID，投放广告时，需要运营选择合适的Deal组进行投放</p>
                          </div>
                        </Tooltip>
                      </div>
                      <div class="xuan_content" style="display: flex">
                        <Select v-model="it.dg_id" filterable clearable  style="width: 300px">
                          <Option  v-for="item in it.dealList" :value="item.id" :key="item.created_at+'deal'">{{ item.name }}</Option>
                        </Select>
                        <Alert v-if="it.dealList && it.dealList.length>0" class="deal_alert"  show-icon>该广告位已配置DealID，如有需要，请选择合适的Deal组</Alert>
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
                           <crowd-control :errShow="false" :defaultCrowd="it.defaultCrowd" :crowdTagArr="tagListData" @on-form-validate="getCrowdControl($event,i)"></crowd-control>
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
                    <div :class="modalForm.os_type !==2 ? 'deploy_box deploy_line' : 'deploy_box'">
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
                    <div class="deploy_box" v-show="modalForm.os_type !==2">
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
          </div>
        </div>
        <FormItem  class="deployForm configBottom">
          <Button @click="goBack">取消</Button>
          <Button v-if="modalForm.status !==4" type="primary" :loading="submitClock" @click="submitDspSlot('modalForm')">
            <span v-if="!submitClock">提交</span>
            <span v-else>提交中...</span>
          </Button>
        </FormItem>
      </Form>
    </div>
    <selectAdvertising v-model="modalSelect"  :dataList="modalForm" :ids="Number(selected_id)" :std="Number(selectSstd)"
                        :deleteArr="except_ssp_slot_id" @name="selectSuccess" @see="detail"/>
    <Drawer v-model="flowModalFlag"  :mask-closable="false" title="流量拆分名称详情"   class="newBatch" width="600" :styles="drawStyles">
      <Form ref="spilt"  :label-width="80" :label-colon="true">
        <FormItem label="广告位">
           <P>{{flowSplitData.ssp_slot_name}}({{flowSplitData.ssp_slot_id}})</P>
        </FormItem>
        <FormItem label="流量拆分">
           <div v-if="flowSplitData.divide_list && flowSplitData.divide_list.length>0">
             <RadioGroup v-model="flowSplitData.sstd_id">
               <div v-for="(item,index) in flowSplitData.divide_list" :key="flowSplitData.ssp_slot_id + index">
                 <Radio :label="item.sstd_id">{{item.name}}({{item.proportion}}%) </Radio>
                 <Table highlight-row stripe border :columns="splitCol" :data="item.controller_list">
                   <!--预算位位名称/ID-->
                   <template slot-scope="{ row }" slot="dsp_slot_id">
                     <p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
                     <p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
                   </template>
                   <!--媒体名称/ID-->
                   <template slot-scope="{ row }" slot="dsp_company_id">
                     <p class="name-row-ellipsis" :title="row.dsp_company_name">{{ row.dsp_company_name }}</p>
                     <p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
                   </template>
                   <!--权重-->
                   <template slot-scope="{ row }" slot="control_weight">
                      <p>{{row.control_weight}}</p>
                   </template>
                 </Table>
               </div>
             </RadioGroup>
           </div>
          <div v-else>
            <RadioGroup v-model="flowSplitData.sstd_id">
              <Radio :label="flowSplitData.sstd_id">流量1(100%) </Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <div  v-if="!flowSplitData.divide_list || flowSplitData.divide_list.length===0" style="text-align: center;margin-top: 120px">
          <img src="~@/assets/image/noflowSpilt.png" alt="">
          <p>暂无配置</p>
        </div>
      </Form>
      <div class="drawer-footer">
        <Button @click="flowModalFlag=false">取消</Button>
        <Button @click="flowModalFlag=false">保存</Button>
      </div>
    </Drawer>

  </Card>
</template>

<script>
  import {showTitle, regNumPositiveInteger, inputMaxNumber} from '@/libs/util'
  import {debounce, number2Thousand} from '@/libs/tools'
  import {getProvinceCityApi, getPhoneBrand, getAdRatio} from '@/api/common'
  import {saveDspSlot, getErrSspSlot, getSlotInfo, getDspProductList} from '@/api/dsp'
  import { getCrowdTagList } from '@/api/tag'
  import {getDealList} from '@/api/ssp'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import {commonMixin} from '@/mixin/basic-common-class.js'
  import RyTimeSheet from '@/components/ry-time-sheet/hourSheet.vue'
  import retargetMutiCascaderAdSlot from '@/components/cascader-retarget'
  import crowdControl from '@/components/control/crowd/index.vue'
  import selectAdvertising from './components/selectAdvertising'
  import {getSplitCols} from './data/data'
  import {mapActions} from 'vuex'

  export default {
    name: 'dsp-slot-edit',
    components: {RyTimeSheet, crowdControl, retargetMutiCascaderAdSlot, selectAdvertising},
    mixins: [inPageAccess, commonMixin],
    data() {
      const validateRatio = debounce((rule, value, callback) => {
        let _pre = this.modalForm.dsp_ad_ratio_width
        let _next = this.modalForm.dsp_ad_ratio_height
        if(!this.modalForm.sizeRatio){
			callback(new Error('请选择正确的素材尺寸比例'))
		}else{
			callback()
		}
        if (_pre  ===0  || _next=== 0 || !regNumPositiveInteger.test(_pre) || !regNumPositiveInteger.test(_next)) {
          callback(new Error('请选择正确的素材尺寸比例'))
        } else {
          // 只有在有slot_id的情况下开启异步校验
          if (!!this.modalForm.slot_id) {
            // 异步校验
            getErrSspSlot({
              dsp_slot_id: this.modalForm.slot_id,
              dsp_ad_ratio_width: [_pre],
              dsp_ad_ratio_height: [_next],
              check_type: 1
            }).then(res => {
              if (res.code === 200) {
                this.ratioErrSlotList = res.data.list

                if (this.ratioErrSlotList.length === 0) {
                  callback()
                } else {
                  callback(new Error(`存在不匹配的广告位${this.ratioErrSlotList.length}个`))
                }
              } else {
                callback(new Error('素材尺寸比例匹配失败'))
              }
            }, err => {
              callback(new Error('素材尺寸比例匹配失败'))
            })
          } else {
            callback()
          }
        }
      }, 1000)
      const validateOsType = (rule, value, callback) => {
        if (value === undefined) {
          callback(new Error('请选择应用平台'))
        } else {
          // 只有在有slot_id的情况下开启异步校验
          if (!!this.modalForm.slot_id && value !== 0) {
            // 异步校验
            getErrSspSlot({dsp_slot_id: this.modalForm.slot_id, os_type: value, check_type: 2}).then(res => {
              if (res.code === 200) {
                this.osTypeErrSlotList = res.data.unmatched_os_type

                if (this.osTypeErrSlotList.length === 0) {
                  callback()
                } else {
                  callback(new Error(`存在不匹配的广告位${this.osTypeErrSlotList.length}个`))
                }
              } else {
                callback(new Error('校验应用平台失败'))
              }
            }, err => {
              callback(new Error('校验应用平台失败'))
            })
          } else {
            callback()
          }
        }
      }
      const validateProductId = (rule, value, callback) => {
        if (!this.modalForm.dsp_product_id) {
          callback(new Error('请选择产品名称'))
        } else {
           callback()
        }
      }
		const validateInteractMode = (rule, value, callback) => {
			if (this.modalForm.pickup_status===1 && !this.modalForm.material_type) {
				callback(new Error('请选择属性'))
			} else {
				callback()
			}
		}
		const validateMaterialType = (rule, value, callback) => {
			if (this.modalForm.pickup_status===1 && !this.modalForm.material_type) {
				callback(new Error('请选择素材类型'))
			} else {
				callback()
			}
		}
      return {
        inputMaxNumber: inputMaxNumber,
        provinceCityList: [], // 省份的列表
        phoneBrandList: [], // 手机品牌的列表
        submitClock: false, // 提交锁
        modalForm: {
          status: 1,
          os_type: 0,
          dsp_ad_ratio_width: 1,
          dsp_ad_ratio_height: 1,
		  sizeRatio: '',
			interact_mode: 1, // 属性
			material_type: 1, // 素材类型
        }, // 修改表单
        modalFormRules: { // 表單正則
          dsp_company_id: [{required: true, message: '请选择公司'}],
          dsp_product_id: [{required: true, validator: validateProductId}],
          ad_type_id: [{required: true, message: '请选择广告场景'}],
          dsp_slot_name: [{required: true, message: '填写预算位名称'}],
          creative_type: [{required: true, message: '请选择广告样式'}],
          os_type: [{required: true, validator: validateOsType, trigger: 'change'}],
          // status: [{required: true, message: '请选择预算位状态'}],
          pickup_status: [{required: true, message: '请选择采买状态'}],
          dsp_slot_code: [{required: true, message: '请填写预算方广告位ID', trigger: 'change'}],
          dsp_ratio: [{required: true, validator: validateRatio}],
			interact_mode: [{validator: validateInteractMode,}],
			material_type: [{validator: validateMaterialType,}],
        },
        productList: [], // 产品的列表
        splitCol: getSplitCols(this),
        infos: {
          flowData: [],
          ruleValidate: {}
        }, // 添加的预算位配置
        ratioErrSlotList: [], // 素材尺寸比例 获取配对存在错误的广告位
        osTypeErrSlotList: [], // 素材尺寸比例 获取配对存在错误的广告位
        basicDspStatus: 1, // 基本信息的显示
        putDSPStatus: 1, // 投放信息的显示
        dspCompanyList: [], // 筛选，公司名称
        setModalFlag: false,
        timeID: 'time1',
        phoneString: '手机品牌',
        cityString: '省份',
        cityChildren: '城市',
        orderText: 'first',
        modalSelect: false, // 选择的弹框
        except_ssp_slot_id: [], // 排除的广告位
        selected_id: null, // 选择的id
        selectSstd: null, // 选择的外键
        radio_index: null, // 选择行数
        flowModalFlag: false,
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          padding: '20px 20px 54px',
          position: 'static'
        },
        flowSplitData: {}, // 流量拆分的列表
        tagListData: [], // 标签的列表
		adMaterialSizeArr: [], // 素材标签
        slot_id: this.$route.query.slot_id ? Number(this.$route.query.slot_id) : '' // 预算位的ID
      }
    },
    filters: {
      /**
       * [filterAdRatio 列表中尺寸格式化]
       * @param  {[type]} row [description]
       * @return {[type]}	 [description]
       */
      filterAdRatio(item) {
        if (!item.length) {
          return ''
        }

        let _arr = []
        item.map(_ => {
          _arr.push(`${_.width}:${_.height}`)
        })
        return _arr.join()
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
    methods: {
      ...mapActions([
        'getDspCompanyList'
      ]),
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
       * [dspProductList 获取产品的信息]
       * @return {[type]} [description]
       */
      getProductList(companyID, type) {
        if (type !== 1) {
           this.modalForm.dsp_product_id = 0
        }
        let params = {}
        let dsp_company_id_arr = []
        companyID ? dsp_company_id_arr.push(Number(companyID)) : ''
        companyID ? params.dsp_company_id_arr = dsp_company_id_arr : ''
        params.page_num = 1
        params.page_size = 0
        getDspProductList(params).then(res => {
          if (res.code === 200) {
            this.productList = res.data.list
          }
        })
      },
      productChange(val) {
        this.$nextTick(() => {
          this.$refs['modalForm'].fields.forEach((e) => {
            if (e.label === '产品名称') {
              e.validateState = ''
              e.validateMessage = ''
              this.$set(e, 'isRequired', !!e.prop)
            }
          })
        })
      },
		/**
		 * [getAdMaterialSize 获取素材尺寸列表]
		 * 2021、04、30
		 * @return {[type]} [description]
		 */
		getAdMaterialSize(creative_type, type) {
		    if (creative_type && type !== 1) {
				this.modalForm.sizeRatio = ''
				this.modalForm.dsp_ad_ratio_width = 0
				this.modalForm.dsp_ad_ratio_height = 0
			}
			let obj = {}
			creative_type ? obj.creative_types = creative_type : ''
			getAdRatio(obj).then(res => {

				if (res.code === 200) {

					let list = res.data.list || []

					let arr = list.map(item => {
						let obj = {
							ratio: `${item.width_ratio}:${item.height_ratio}`,
							scale: this.number2Thousand(item.width_ratio / item.height_ratio)
						}
						return obj
					})
					this.adMaterialSizeArr = arr
				}
			})
		},
      /**
       * [detail 流量拆封的列表]
       * @return {[type]} [description]
       */
      detail(row) {
        this.flowSplitData = row
        this.flowModalFlag = true
      },
      /**
       * [flowDataListRule 配置的验证]
       * @return {[type]} [description]
       */
      flowDataListRule(rule, value, callback) {
        let index = rule.index
        let showTxt = ''
        let curArr = [...this.infos.flowData]
        let dateItem = curArr[index]
        let time = parseInt(dateItem.control_time_custom, 2)
        if (!dateItem.ssp_slot_id) {
          showTxt = '请选择广告位'
        }
        if (dateItem.ratio_is_ok === -1 || dateItem.ratio_is_ok === '-1') {
          showTxt = '尺寸比例检验不通过'
        }
        if (dateItem.price_float <= 0 || dateItem.price_float > 200 || dateItem.price_float % 1 !== 0) {
          showTxt = '价格浮动系数必须是1~200中的任意整数'
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
       * [getSlotEdit 编辑预算位获取详情]
       * @return {[type]} [description]
       */
      getSlotEdit() {
        let slot_id = parseInt(this.slot_id)
        getSlotInfo({
          slot_id
        }).then(data => {
          if (data.code === 200) {
            this.$Spin.hide()
            let row = data.data
                this.modalForm = {
                    slot_id: row.id,
                    dsp_company_id: row.dsp_company_id,
                    ad_type_id: row.ad_type_id,
                    os_type: row.os_type,
                    creative_type: row.creative_type,
                    dsp_slot_name: row.dsp_slot_name,
                    status: row.status,
                    dsp_slot_code: row.dsp_slot_code,
                    dsp_app_key: row.dsp_app_key,
                    dsp_app_secret: row.dsp_app_secret,
                    dsp_app_id: row.dsp_app_id,
                    dsp_app_pkg_name: row.dsp_app_pkg_name,
                    dsp_slot_request_url: row.dsp_slot_request_url,
                    dsp_slot_alias: row.dsp_slot_alias,
                    dsp_ad_ratio_width: (row.dsp_slot_ratio && row.dsp_slot_ratio.length) ? row.dsp_slot_ratio[row.dsp_slot_ratio.length - 1].width_ratio : 0,
                    dsp_ad_ratio_height: (row.dsp_slot_ratio && row.dsp_slot_ratio.length) ? row.dsp_slot_ratio[row.dsp_slot_ratio.length - 1].height_ratio : 0,
					sizeRatio: `${row.dsp_slot_ratio[row.dsp_slot_ratio.length - 1].width_ratio}:${row.dsp_slot_ratio[row.dsp_slot_ratio.length - 1].height_ratio}`,
                    rta_ext: row.rta_ext, // RTA扩展
                    last_cpc: row.last_cpc, // cpc最近三天
                    last_ecpm: row.last_ecpm, // cpm最近三天
                    last_ctr: row.last_ctr, // ctr最近三天
					interact_mode: row.pickup_status === 1  ? row.interact_mode ? row.interact_mode : null  : 1, // 属性
					material_type: row.pickup_status === 1  ? row.material_type ? row.material_type : null : 1, // 素材类型
                    pickup_status: row.pickup_status ? row.pickup_status : null, // 采买状态
                    dsp_product_id: row.dsp_product_id ? row.dsp_product_id : null // 产品名称
                }
             this.getProductList(row.dsp_company_id, 1)
             this.getAdMaterialSize(row.creative_type, 1)
            // 资源分配的赋值
            if (row.control_list.length > 0) {
              let controllerData = row.control_list
              this.getResourceList(controllerData)

            }
          }
        })
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
       * [getConfigurationData 配置初始化复值的时候的时候流量的分配]
       * @return {[type]} [description]
       */
      getResourceList(data) {
        let controllerList = data
        let dataList = []
         controllerList.map((item, q) => {
           let type = item.ssp_slot.app_os_type_text === 'Android' ? 1 : item.ssp_slot.app_os_type_text === 'iOS' ? 2 : 0
           let dealList = [] // deal组
           this.dealList.map(it => {
             if (it.ids.includes(item.ssp_slot_id)) {
               dealList.push(it)
             }
           })
          let obj1 = {
            downStatus: 1, // 收起还是打开的状态
			control_weight: item.control_weight, // 权重的显示
            ssp_slot_name: item.ssp_slot.ssp_slot_name, // 广告位名称
            ssp_slot_id: item.ssp_slot_id, // 广告位id
            dsp_company_id: item.ssp_slot.ud_id, // 预算方公司编号
            title: 'ID:' + item.ssp_slot_id + '，终端:' + item.ssp_slot.app_os_type_text, // id以及终端的文本
            os_type: type,
            budget_status: item.ssp_slot.status,
            ad_type_text: item.ssp_slot.ad_type_text, // 广告场景
            ad_type_id: item.ssp_slot.ad_type_id, // 广告场景
            control_req_day: item.control_req_day, // 请求控量
            control_show_day: item.control_show_day, // 展示控量
            control_click_day: item.control_click_day, // 点击控量
            price_float: item.price_float, // 价格浮动系数
            ad_ratio: item.ssp_slot.ad_ratio.map(item => {
              item.width = item.width_ratio
              item.height = item.height_ratio
              return item
            }), // 尺寸比列
            ratio_is_ok: -1, // 尺寸比列是否匹配
            control_time_type: item.control_time_type, // 投放时段的状态
            control_time_custom: item.control_time_type === 1 ? item.control_time_custom_bin.split('').reverse().join('') : '00000000000000000000000', // 投放的时段
            timeID: 'timeID' + item.ssp_slot_id + q, // 投放时段的插件
            cityList: this.getCityList(), // 地域的列表
            area_codes: item.area_type !== -1 && item.area_code ? item.area_code.split(',') : [], // 地域选中项
            area_type: item.area_type ? item.area_type : -1, // 地域的状态
            brand_type: item.brand_type ? item.brand_type : -1, // 品牌的状态
            phoneList: this.getPhoneList(), // 品牌的列表
            brand_ids: item.brand_type !== -1 && item.brand_id ? item.brand_id.split(',') : [], // 手机品牌
            // 人群定向
            defaultCrowd: {
              tag_orientation: item.tag_orientation,
              tag_relation: item.tag_relation ? item.tag_relation : 1,
              tag_proportion: item.tag_proportion,
              tag_list: item.tag_list && item.tag_list.length > 0 ? item.tag_list : []
            },
            checkPhone: item.check_old_phone ? item.check_old_phone : -1, // 屏蔽老旧机型
            last_cpc: item.ssp_slot.today_cpc, // 媒体cpc
            last_ecpm: item.ssp_slot.today_ecpm, // 媒体cpm
            ctr: item.ssp_slot.today_ctr, // ctr
            dg_id: item.dg_id, // deal组的选择
            dealList: dealList, // deal组的列表
            cpm_price: item.ssp_slot.cpm_price > 0 ? Number(this.number2Thousand(item.ssp_slot.cpm_price / 100)) : 0, // 出价CPM
            sstd_id: item.sstd_id // 广告流量分配的主键ID
          }
          dataList.push(obj1)
        })
        this.infos.flowData = dataList
        this.sizeChange()
      },
      /**
       * [slotSelect 选择广告位]
       * @return {[type]} [description]
       */
      slotSelect(id, i) {
        this.selected_id = Number(id)
        this.radio_index = i
        let data = [...this.infos.flowData]
        let searchDsp = []
        // 删选已经存在的ID
        data.map(item => {
          searchDsp.push(Number(item.ssp_slot_id))
        })
        this.selectSstd = data[i].sstd_id
        this.except_ssp_slot_id = [...searchDsp]
        this.modalSelect = !this.modalSelect
      },
      /**
       * [selectSuccess 选择广告位成功的返回]
       * @return {[type]} [description]
       */
      selectSuccess(selectedData) {
        let curArr = [...this.infos.flowData]
        let scaleNum = number2Thousand(this.modalForm.dsp_ad_ratio_width / this.modalForm.dsp_ad_ratio_height) || 0
        let scale = selectedData.ad_ratio.map(item => {
           return item ? Number(this.number2Thousand(item.width / item.height)) : 0
        })
        let listData = {}
        listData = curArr[this.radio_index]
        // 判断尺寸比列的修改
        if (scaleNum) {
          let scaleStatus = 1
          scale.forEach(item => {
            if (Math.abs(scaleNum - item) < 0.05) {
              scaleStatus = 2
            }
          })
          listData.ratio_is_ok = scaleStatus === 2 ? 1 : -1
        } else {
          listData.ratio_is_ok = -1
        }
        listData.budget_status = selectedData.status // 广告位是否正常
        listData.ssp_slot_id = selectedData.ssp_slot_id // 广告位ID
        listData.ssp_slot_name = selectedData.ssp_slot_name // 广告位名称
        listData.dsp_company_id = selectedData.ud_id // 预算方公司编号
        let type = selectedData.app_os_type === 'Android' ? 1 : selectedData.app_os_type === 'iOS' ? 2 : 0
        listData.dsp_slot_name = selectedData.dsp_slot_name // 预算位的名称
        listData.os_type = type // 预算位的操作系统
        listData.ad_type_text = selectedData.ad_type // 预算位的样式文本
        listData.ad_type_id = Number(selectedData.ad_type_id) // 预算位的样式ID
        listData.title = 'ID:' + selectedData.ssp_slot_id + '，终端:' + selectedData.app_os_type
        listData.last_cpc = selectedData.today_cpc // 媒体cpc
        listData.last_ecpm = selectedData.today_ecpm // 媒体cpm
        listData.ctr = selectedData.today_ctr // 媒体cpm
        listData.ad_ratio = selectedData.ad_ratio // 尺寸比列
        listData.cpm_price = selectedData.cpm_price // 出价cpm
        listData.sstd_id = selectedData.sstd_id === 1 ? '' : selectedData.sstd_id
        let dealList = []
        this.dealList.map(item => {
            if (item.ids.includes(listData.ssp_slot_id)) {
              dealList.push(item)
            }
        })
        listData.dealList = dealList
        this.infos.flowData = curArr
      },

      /**
       * [sizeChange 尺寸比列的修改]
       * @return {[type]} [description]
       */
      sizeChange() {
      	if (!this.modalForm.sizeRatio) {
      		return
		}
      	let size = this.modalForm.sizeRatio.split(':')
		this.modalForm.dsp_ad_ratio_width = Number(size[0])
		this.modalForm.dsp_ad_ratio_height = Number(size[1])
        let scaleNum = number2Thousand(this.modalForm.dsp_ad_ratio_width / this.modalForm.dsp_ad_ratio_height) || 0
        let data = [...this.infos.flowData]
        Object.keys(data).forEach(k => {
          let scaleStatus = 1
          data[k].ad_ratio.map(item => {
              let num = number2Thousand(item.width / item.height) || 0
              if (Math.abs(scaleNum - num) < 0.05) {
                scaleStatus = 2
              }
            })
            if (scaleStatus === 2) {
              data[k].ratio_is_ok = 1
            } else {
              data[k].ratio_is_ok = -1
            }
        })
        this.infos.flowData = data
      },
      /**
       * [getMediaListData 获取dealid]
       * @return {[type]} [description]
       */
      getMediaListData() {
        let params = {page_size: 0, page_num: 1}
        getDealList(params).then(res => {
          let data = res.data
          if (res.code === 200) {
            let dealList = data.list.map(item => {
               let ids = []
                 item.SspSlots.map(it => {
                   ids.push(Number(it.id))
                 })
               item.ids = ids
               return item
            })
            this.dealList = dealList
            if (this.slot_id) {
              this.getSlotEdit()
            }
          }
        })
      },
      /**
       * [formatNumber 变成千分位]
       * @return {[type]} [description]
       */
      formatNumber (value) {
        if (value === '') return ' '
        return this.number2ThousandNumber(value)
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
       * [getprovinceCityList 获取省市的列表]
       * @return {[type]} [description]
       */
      getProvinceCityList() {
        getProvinceCityApi().then(data => {
          if (data.code === 200) {
            this.provinceCityList = data.data.list
            this.getMediaListData()
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
      /**
       * [statusChange 选择时重新赋值]
       * @return {[type]} [description]
       */
      statusChange(val) {
        let data = [...this.infos.flowData]
        this.infos.flowData = data
      },
      updateCity() {
      },
      updateCityName(val) {
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
       * [getCrowdControl 人群定向的修改]
       * @return {[type]} [description]
       */
      getCrowdControl(obj, i) {
        let curArr = [...this.infos.flowData]
        let dataList = curArr[i].defaultCrowd
        let {valid, form} = obj
        dataList.tag_orientation = form.tag_orientation
        dataList.tag_proportion = form.tag_proportion || 0
        dataList.tag_relation = form.tag_relation || 1
        dataList.tag_list = form.tag_list || []
        this.infos.flowData = curArr
      },
      /**
       * [addSelfAdv 广告位的增加]
       * @return {[type]} [description]
       */
      addSelfAdv() {
        let i = 0
        let selfActionData = this.infos.flowData
        i = selfActionData.length
        let obj1 = {
          downStatus: 2, // 收起还是打开的状态
          ssp_slot_name: '广告位', // 广告位名称
          ssp_slot_id: null, // 广告位id
          dsp_company_id: null, // 预算方公司编号
          dsp_slot_id: null, // 预算位编号
          title: '', // id以及终端的文本
          control_req_day: 0, // 请求控量
          control_show_day: 0, // 展示控量
          control_click_day: 0, // 点击控量
		  control_weight:0, // 权重的显示
          price_float: 100, // 价格浮动系数
          ad_ratio: [{width: 0, height: 0}], // 尺寸比列
          ratio_is_ok: -1, // 尺寸比列是否匹配
          control_time_type: 2, // 投放时段的状态
          control_time_custom: '00000000000000000000000', // 投放的时段
          timeID: 'selfTimeID' + (parseInt(i) + 1), // 投放时段的插件
          cityList: this.getCityList(), // 地域的列表
          area_codes: [], // 地域选中项
          area_type: -1, // 地域的状态
          brand_type: -1, // 品牌的状态
          phoneList: this.getPhoneList(), // 品牌的列表
          brand_ids: [], // 手机品牌
          defaultCrowd: {}, // 人群定向
          tag_orientation: 0, // 人群定向
          tag_relation: 1,
          tag_proportion: 0,
          tag_list: [''],
          checkPhone: -1, // 屏蔽老旧机型
          last_cpc: 0, // 媒体cpc
          last_ecpm: 0, // 媒体cpm
          ctr: 0, // ctr
          dg_id: null, // deal组的选择
          dealList: [], // deal组的列表
          cpm_price: 0, // 出价CPM
          sstd_id: null // 广告流量分配的主键ID
        }
        let curArr = [...this.infos.flowData]
        curArr.push(obj1)
        this.infos.flowData = curArr
      },
      /**
       * [unfold 广告位展开以及关闭]
       * @return {[type]} [description]
       */
      unfold(index) {
        let curArr = [...this.infos.flowData]
        let status = curArr[index].downStatus
        curArr[index].downStatus = status === 1 ? 2 : 1
        this.infos.flowData = curArr
      },
      /**
       * [deleteSelfAdv 删除广告位]
       * @return {[type]} [description]
       */
      deleteSelfAdv(i) {
        let curArr = [...this.infos.flowData]
        curArr.splice(i, 1)
        this.infos.flowData = curArr
      },
      /**
       * [goBack 返回上一页面]
       * @return {[type]} [description]
       */
      goBack() {
        this.$router.back(-1)
      },
      /**
       * [changeState 切换状态显示]
       * @return {[type]} [description]
       */
      changeState(type) {
        if (type === 1) {
          this.basicDspStatus = this.basicDspStatus === 1 ? 2 : 1
          localStorage.setItem('basicDspStatus', this.basicDspStatus)
        } else if (type === 2) {
          this.putDSPStatus = this.putDSPStatus === 1 ? 2 : 1
          localStorage.setItem('putDSPStatus', this.putDSPStatus)
        }
      },

      /**
       * [creativeId2Text 获取广告样式]
       * @return {[type]} [description]
       */
      creativeId2Text(id) {
        let _arr = this.$store.state.app.adStyleData
        // eslint-disable-next-line eqeqeq
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [submitDspSlot 新建/编辑 新建预算位]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      submitDspSlot(name) {
        this.submitClock = true
        this.$refs[name].validate((valid) => {
          if (valid) {
            let arr = []
            this.infos.flowData.forEach((item, index) => {
                let form = 'flowData' + index
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
              this.errData()
            } else {
              this.$Message.error('请检查表单的填写!')
              this.submitClock = false
            }
          } else {
            this.$Message.error('请检查表单的填写!')
            this.submitClock = false
          }
        })
      },
      /**
       * [adSceneData 获取广告场景]
       * @return {[type]} [description]
       */
      adSceneData(id) {
        let data = [...this.$store.state.app.adSceneData]
        let result = data.filter(item => {
          return item.id === id
        })

        return result[0] ? result[0].title : ''
      },
      /**
       * [errData 判断之前的数据导入的os_type 与 ad_type_id不符合的情况]
       * @return {[type]} [description]
       */
      errData() {
        let data = [...this.infos.flowData]
        let osType = this.modalForm.os_type
        let adType = this.modalForm.ad_type_id
        let errOsList = []
        let errAdList = []
        data.map(item => {
          if (item.ad_type_id !== adType) {
            errAdList.push(item)
          }
          if (Number(osType) !== 0 && Number(item.os_type) !== osType) {
            errOsList.push(item)
          }
        })
        let html = ''
        if (errOsList.length > 0 || errAdList.length > 0) {
          Object.keys(errOsList).forEach(h => {
            let type = Number(errOsList[h].os_type) === 1 ? 'Android' : 'IOS'
            let typeVerify = this.modalForm.os_type === 1 ? 'Android' : 'IOS'
            html += '<p style="font-size:14px;color:#333;line-height: 25px">当前预算位所配置的广告位：【' + errOsList[h].ssp_slot_name + '】的应用平台是【' + type + '】，与当前预算位应用平台【' + typeVerify + '】不符</p>'
          })
          Object.keys(errAdList).forEach(h => {
            let adVerify = this.adSceneData(adType)
            html += '<p style="font-size:14px;color:#333;line-height: 25px">当前预算位所配置的广告位：【' + errAdList[h].ssp_slot_name + '】的广告场景是【' + errAdList[h].ad_type_text + '】，与当前预算位广告场景【' + adVerify + '】不符</p>'
          })
          html += '<p>确认提交么？</p>'
          this.$Modal.confirm({
            title: html,
            className: 'vertical-center-modal',
            width: 600,
            onOk: () => {
              this.saveDspSlotAPI()
            },
            onCancel: () => {
              this.submitClock = false
            }
          })
        } else {
          this.saveDspSlotAPI()
        }
      },
      /**
       * [errData 判断之前的数据导入的os_type 与 ad_type_id不符合的情况]
       * @return {[type]} [description]
       */
      saveDspSlotAPI() {
        let params = {...this.modalForm}
        if(params.pickup_status !==1 ){
        	params.interact_mode = null // 属性
        	params.material_type = null // 素材类型
		}


        // 尺寸比例
        if (!!params.dsp_ad_ratio_height && !!params.dsp_ad_ratio_width) {
          params.dsp_ad_ratio_height = [params.dsp_ad_ratio_height]
          params.dsp_ad_ratio_width = [params.dsp_ad_ratio_width]
        }
        let data = [...this.infos.flowData]
        params.control_list = this.saveResource(data)

        saveDspSlot(params).then(res => {

          this.submitClock = false

          if (res.code === 200) {
            this.$Bus.$emit('dspSlotEmitEvent') // dsp-slot
            this.$Bus.$emit('sspAdvEmitEvent') // ssp-adv
            this.$Message.success({content: params.id ? '新建成功' : '保存成功', duration: 3})
            this.goBack()

          }
        }, err => {
          this.submitClock = false
        })
      },
      /**
       * [saveResource 提交时流量的拆分]
       * @return {[type]} [description]
       */
      saveResource(data) {
        let resource = []
        data.map((item, index) => {
          let obj = {}
          obj.ssp_slot_id = Number(item.ssp_slot_id) // 广告位id
          obj.dsp_company_id = Number(this.modalForm.dsp_company_id) // 预算方公司名称
          obj.sstd_id = item.sstd_id !== 1 ? Number(item.sstd_id) : ''// 外建
          obj.control_weight = Number(item.control_weight) // 权重
          obj.control_proportion = 0 // 流量占比
          obj.price_float = Number(item.price_float) // 价格浮动系数
          obj.control_show_day = Number(item.control_show_day) // 展示控制
          obj.control_click_day = Number(item.control_click_day) // 展现控制
          obj.control_req_day = Number(item.control_req_day) // 请求量控制
          obj.check_old_phone = item.checkPhone // 屏蔽老旧机型
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
      inData() {
          if (this.slot_id) {
            this.$Spin.show()
          }
          this.getProvinceCityList()
          this.getCrowdTagList()
          this.getPhoneBrandList()
          this._getDspCompanyList()
		  this.getAdMaterialSize()
          this.basicDspStatus = parseInt(localStorage.getItem('basicDspStatus')) ? parseInt(localStorage.getItem('basicDspStatus')) : 1
          this.putDSPStatus = parseInt(localStorage.getItem('putDSPStatus')) ? parseInt(localStorage.getItem('putDSPStatus')) : 1
      }
    },
    watch: {
      infos: {
        deep: true,
        immediate: true,
        handler: function (v) {
          this.$nextTick(() => {
            this.infos.flowData.forEach((item, index) => {
                let form = 'flowData' + index
                this.$refs[form][0].validateField('flowDataList')
            })
          })
        }
      }
    },
    created() {
       this.inData()
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  .pageTitleNum{
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    span{
      color #DF1903
    }
  }

  /deep/ .ivu-form-item-required .ivu-form-item-label {
    position relative
    left -12px
  }
  .newBatch{
    /deep/ .ivu-drawer-mask{
      z-index: 12000
    }
    /deep/ .ivu-drawer-wrap{
      z-index: 12000
    }
  }
  .ad_config.ivu-card {
    /deep/ .ivu-card-body {
      padding 20px 10px
    }

    .config_detail {
      border 1px solid #DCDCDC
      padding 15px
      margin-top 10px
      position relative

      .priceCon {
        position relative

        .priceCPC {
          position absolute
          right: 0px
          bottom 0px
          display flex
          padding 0 15px

          .priceCPC_con {
            margin 0 5px
            text-align left
            padding 5px 10px
            border-radius 12px
          }

          .priceDetail {
            color #ffffff
            font-style: italic;

            .priceNum {
              font-size 24px
              font-weight bold
            }
          }
        }
      }

      .config_header {
        color #4083F8
        font-size 14px
        display flex
        justify-content space-between

        .action {
          color #4083F8
          cursor pointer

          p {
            vertical-align middle

            span {
              display inline-block
              width 15px
              height 15px
              text-align center
              line-height 15px
              background #3F83F7
              border-radius 50%
              color #ffffff
              margin-left 6px
            }
          }
        }

        span {
          vertical-align middle

          &.line {
            display inline-block
            width 3px
            height 14px
            background #4083F8
            margin-right 5px
          }
        }
      }

      .config_matter {
        display flex
        justify-content flex-start
        flex-wrap: wrap;

        .deployText {
          width 50%
        }
        .putForm{
          width 100%
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

      .deployText {
        margin-bottom 20px

        .editSelect {
          width 370px
        }

        /deep/ .ivu-form-item-label {
          padding 8px 12px 8px 0
        }

        /deep/ .ivu-form-item-content {
          line-height 28px

          /deep/ .ivu-input {
            height 28px
          }

          /deep/ .ivu-btn {
            height 28px
          }
        }

        .size_card {
          display flex
          flex-wrap: wrap;

          .size_box {
            margin-right 20px
            display flex

            .size_num {
              padding-left: 10px
              padding-right: 10px
              background-color: #EBEBEB
              display: inline-block
              vertical-align: top
            }

            .size_action {
              .size_value {
                color: #999999
                font-size: 14px
                margin: 0 8px
              }
            }
          }
        }
      }

      /deep/ .ivu-form-item-error-tip {
        padding-top: 2px
        font-size 12px
      }
    }

    .self_table {
      margin-top 10px

      .deploy_list {
        margin-bottom 20px
        max-width 1108px
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
    .configBottom {

      button {
        margin-top 25px
        padding 0 40px
        height 35px
        line-height 35px

        &.savePass {
          padding 0px
          width 120px
          text-align center
        }
      }

    }
  }
</style>
