<template>
  <div class="page-main">
    <Card :bordered="false" dis-hover>
      <div class="page-title clearfix">
        <h2>{{headTitle}}(媒体库)</h2>
        <div class="is-handler">
          <Button class="host copy-content" v-if="copySspSloIDString" type="text"
                  :data-clipboard-text="copySspSloIDString" @click="copySspSlotID">复制当前页广告位ID
          </Button>
          <Button class="host" type="text" @click="batchSetButton">
            <icon class="icon icon-setting"/>
            <span>批量设置</span>
          </Button>
          <Button v-if="_isShow_('download')" @click="downStatement" :loading="downClock" class="host" type="text"
                  ghost>
            <i class="iconfont icon-download"></i>
            <span v-if="!downClock">下载列表</span>
            <span v-else>下载中...</span>
          </Button>
          <Button v-if="_isShow_('batchNewBudget')" style="background:#339900;color: #ffffff " type="text"
                  @click="exportModalFlag = true,active=2">
            <icon class="icon icon-setting"/>
            批量配置预算位
          </Button>
          <Button style="background:#EAAE30;color: #ffffff " v-if="_isShow_('batchNewAd')" class="host" type="text"
                  @click="exportModalFlag = true, active=1">
            <icon class="icon icon-new-create"/>
            批量新建广告位
          </Button>
          <Button style="background:#EAAE30;color: #ffffff " v-if="_isShow_('batchNewAd')" class="host" type="text"
                  @click="exportModalFlag = true, active=3">
            <icon class="icon icon-new-create"/>
            批量修改广告位
          </Button>
          <Button class="host" type="text" @click="doColumns">自定义列</Button>
        </div>
      </div>
      <div class="search-line" ref="search-line">
        <Select
          class="i-margin-right-11 i-width-select"
          multiple
          filterable
          :max-tag-count="1"
          v-model="filterSearch.ud_id_arr"
          :max-tag-placeholder="limitText"
          placeholder="媒体简称/ID"
        >
          <Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
        </Select>

        <!-- 新的应用列表 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.app_id_arr"
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
          v-model="filterSearch.ad_type_id_arr"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告场景"
        >
          <Option v-for="item in adTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
        </Select>

        <Select
          class="i-margin-right-11 i-width-select mar-bot-10"
          multiple
          v-model="filterSearch.creative_type_arr"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告样式"
        >
          <Option v-for="item in filterSearch.styleDataArr" :value="item.id" :key="item.id">{{ item.title }}</Option>
        </Select>

        <!-- 广告位名称 -->
        <Select
          class="i-margin-right-11 i-width-select i-select-remote"
          v-model="filterSearch.ssp_slot_id_arr_select"
          filterable
          clearable
          multiple
          :remote-method="searchSspSlot"
          :loading="sspSlotLoad"
          @on-change="clearSearchSspSlot"
          :on-query-change="sspSlotQueryChange"
          :transfer="true"
          :max-tag-count="1"
          :max-tag-placeholder="limitText"
          placeholder="广告位名称/ID"
        >
          <Option v-for="item in sspSlotList" :value="item.ssp_slot_id" :key="item.ssp_slot_id">{{item.ssp_slot_name}}
            (ID:{{item.ssp_slot_id}})
          </Option>
        </Select>
        <!-- 产品名称 -->
        <Select
          class="i-margin-right-11 i-width-select"
          multiple
          filterable
          :max-tag-count="1"
          v-model="filterSearch.dsp_product_id_arr"
          :max-tag-placeholder="limitText"
          placeholder="产品名称/ID"
        >
          <Option v-for="item in productList" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
        </Select>
        <!-- 产品状态 -->
        <Select class="i-margin-right-11 i-width-select mar-bot-10"
                multiple
                filterable
                :max-tag-count="1"
                v-model="filterSearch.dsp_product_status_arr"
                :max-tag-placeholder="limitText"
                placeholder="产品状态">
          <Option v-for="item in productStatus" :value="item.value" :key="item.label +'产品状态'">{{item.label}}</Option>
        </Select>
        <DatePicker
          ref="dd"
          class="i-margin-right-11 i-width-date mar-bot-10"
          :transfer="true"
          type="daterange"
          format="yyyy-MM-dd"
          :options="datePickerOptions"
          :value="datePickerTime"
          @on-change="datePickerChange"
          placeholder="创建时间"
          :clearable="true"
        />
        <!-- 产品标记 -->
<!--        <Select class="i-margin-right-11 i-width-select mar-bot-10"-->
<!--                multiple-->
<!--                filterable-->
<!--                :max-tag-count="1"-->
<!--                v-model="filterSearch.dsp_product_mark_arr"-->
<!--                :max-tag-placeholder="limitText"-->
<!--                placeholder="产品标记">-->
<!--          <Option v-for="item in productMark" :value="item.value" :key="item.label +'产品标记'">{{item.label}}</Option>-->
<!--        </Select>-->

        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10"
               v-model.trim="filterSearch.ssp_slot_id_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量广告位ID"/>

        <Input type="textarea" v-model.trim="filterSearch.ssp_slot_name_arr_textarea"
               class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量广告位名称"/>

        <Input type="textarea" v-model.trim="filterSearch.ratio_arr_textarea"
               class="i-margin-right-11 i-width-textarea mar-bot-10" :rows="1" :autosize="{maxRows:1, minRows: 1}"
               placeholder="批量尺寸比例"/>
        <Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10"
               v-model.trim="filterSearch.ex_slot_id_textarea" :clearable="true" :rows="1"
               :autosize="{maxRows:1, minRows: 1}" placeholder="批量外部广告位ID"/>
        <Input type="text" class="i-margin-right-11 i-width-input mar-bot-10"
               v-model.trim="filterSearch.operate_status_reason" placeholder="运营状态原因"/>
        <Input type="text" class="i-margin-right-11 i-width-input mar-bot-10"
               v-model.trim="filterSearch.dsp_product_remark" placeholder="按照备注查询"/>

        <Button class="i-margin-right-11 mar-bot-10" type="primary" @click="doFilterList">查询</Button>
      </div>
      <div class="batch-line" v-show="batchStatus">
        <div class="batch-handle ">
          <div @click="batchSet(1)" class="batch-item">
            <Icon type="ios-settings"/>
            <span>批量恢复采买</span>
          </div>
			<div @click="batchSet(5)" class="batch-item">
				<Icon type="ios-settings"/>
				<span>批量重新测试</span>
			</div>
          <div @click="batchSet(2)" class="batch-item">
            <Icon type="ios-settings"/>
            <span>批量填写有量未采买原因</span>
          </div>
          <div @click="batchSet(3)" class="batch-item">
            <Icon type="ios-settings"/>
            <span>批量拒绝采买</span>
          </div>
          <div @click="batchSet(4)" class="batch-item">
            <Icon type="ios-settings"/>
            <span>批量测试不通过</span>
          </div>
        </div>
        <div class="batch-close " @click="batchStatus = false">
          <Icon type="md-close"/>
        </div>
      </div>
      <div style="display: flex;justify-content: space-between">
        <div class="nav-handle-group">
          <RadioGroup v-model="filterSearch.status" type="button" @on-change="doFilterList">
            <Radio :label="0">全部<span>({{count}})</span></Radio>
            <Radio v-for="(it,index) in adCountStatusList" :key="'状态' + index " :label="it.value">{{it.label}}<span :style="it.value===2 || it.value ===3 ? 'color:#F72D17':''">({{it.number}})</span></Radio>
          </RadioGroup>
        </div>
        <div class="nav-handle-group">
          <Tooltip placement="top" :transfer="true" max-width="460">
            运营状态
            <Icon type="md-help-circle" style="color: #c8c8c8;font-size: 16px"/>
            <div slot="content" class="tooltip" style="font-size: 12px;line-height: 24px">
              <span style="display: inline-block">(1) 广告位的运营状态是在广告位业务状态为有效的情况下，取决于广告位是否关联产品，如果没有关联产品，取广告位本身的数据标记状态；如果关联，则取产品之间的状态的聚合</span>
              <span style="display: inline-block">(2) 取广告位【今天零点到此刻】的数据做判断依据，每10分钟更新一次 <br>(3) 聚合状态的优先级是：<br>     已采买>采买失败>有量未采买>测试中>测试待开始>待测试 </span>
              <span style="display: inline-block">(4) 举例说明：如果广告位与各产品的状态中既有已采买又有采买失败，那广告位的运营状态为“已采买” ；</span>
              <span style="display: inline-block">①待测试：审核通过\恢复采买\重新测试后的运营状态<br>②测试待开始：在测试计划中，未到测试开始时间</span>
			  <span style="display: inline-block">③测试中：在测试计划中，处于测试中或暂停中的状态<br>④测试不通过：手动操作测试不通过</span>
			  <span style="display: inline-block">⑤已采买：广告位关联预算位的有效广告请求pv、广告返回pv、广告展现pv>0 </span>
			  <span style="display: inline-block">⑥采买失败：广告位关联预算位的有效广告请求pv=0或广告位关联预算位的有效广告请求pv、广告返回pv>0，广告展现pv=0 </span>
			  <span style="display: inline-block">⑦有量未采买：广告位的总广告请求pv>0，广告返回pv=0；广告位关联了预算位的广告返回pv=0 </span>
			  <span style="display: inline-block">⑧无量：广告位总广告请求pv=0  <br>⑨拒绝采买：手动操作拒绝采买</span>
            </div>
          </Tooltip>
          <RadioGroup v-model="filterSearch.operate_status" type="button" @on-change="doFilterList">
            <Radio label="全部">全部</Radio>
            <Radio v-for="it in operateCountStatusList" :key="it.value+'运营状态'" :label="it.value">{{it.label}}<span>({{it.number}})</span></Radio>
          </RadioGroup>
        </div>
      </div>
      <div class="console-table">
        <div class="u-table-center">
          <u-table
          border
          use-virtual
          row-id="id"
          :data="colDatList"
          :max-height="tableHeight"
          :data-changes-scroll-top="false"
          @selection-change="selectChange"
          stripe
        >
          <u-table-column fixed="left" type="index" width="40"></u-table-column>
          <u-table-column fixed="left" type="selection" width="55"></u-table-column>
          <u-table-column fixed="left" label="广告位名称/ID" width="200">
            <template v-slot="scope">
               <p class="name-row-ellipsis" :title="scope.row.ssp_slot_name">{{ scope.row.ssp_slot_name }}</p>
               <p class="tip-row-line">ID: {{ scope.row.id }}</p>
              </template>
          </u-table-column>
          <u-table-column fixed="right" label="操作" width="240">
          <template v-slot="scope" class="tableButton">
            <Button class="tableButton" type="text" :to="toView(scope.row)" v-if="_isShow_('view')">查看</Button>
            <Button class="tableButton" type="text" :to="toEdit(scope.row)" v-if="_isShow_('modify')">修改</Button>
            <!-- 有效 -->
            <template v-if="scope.row.status == 1">
              <Button class="tableButton" type="text" :to="toConfig(scope.row)" v-if="_isShow_('setting')">配置</Button>
              <Button  class="tableButton" type="text" @click="toBanned(scope.row)" v-if="_isShow_('banned')">封禁</Button>
            </template>
            <!-- 修改审核中， sdk才有 -->
            <template v-if="scope.row.status == 2 && scope.row.app.access_type == 2">
              <Button class="tableButton" type="text" :to="toConfig(scope.row)" v-if="_isShow_('setting')">配置</Button>
              <Button class="tableButton" type="text" @click="toBanned(scope.row)" v-if="_isShow_('banned')">封禁</Button>
            </template>
            <!-- 待审核 -->
            <template v-if="scope.row.status == 3">
              <Button class="tableButton" type="text" :to="toConfig(scope.row)" v-if="_isShow_('passAndSet')">配置并通过</Button>
              <Button class="tableButton" type="text" @click="toBanned(scope.row)" v-if="_isShow_('refuse')">拒绝</Button>
            </template>
            <!-- 已拒绝 -->
            <template v-if="scope.row.status == 4">
              <Button class="tableButton" type="text" :to="toConfig(scope.row)" v-if="_isShow_('passAndSet')">配置并通过</Button>
            </template>
            <!-- 封禁 -->
            <template v-if="scope.row.status == 5">
              <Button class="tableButton" type="text" @click="toEnable(scope.row)" v-if="_isShow_('enable')">启用</Button>
              <Button class="tableButton" type="text" :to="toConfig(scope.row)" v-if="_isShow_('setting')">配置</Button>
            </template>
            <Button class="tableButton" v-if="scope.row.ssp_slot_dsp_product_list && scope.row.ssp_slot_dsp_product_list.length>0" type="text"
                    @click="doNote(scope.row)">备注
            </Button>
          </template>

          </u-table-column>
          <template v-for="item in tableColList">
            <!-- 非产品 -->
            <u-table-column
              v-if="!item.isProduct"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :min-width="item.minWidth"
              v-slot="scope"
              :show-overflow-tooltip="true"
            >
              <!--内部广告位ID-->
              <template v-if="item.prop === 'Internal_name'">
                <p class="name-row-ellipsis" v-if="scope.row.ssp_slot_alias"  :title="scope.row.ssp_slot_alias">{{ scope.row.ssp_slot_alias }}</p>
                <p v-else> - </p>
              </template>
              <!--外部广告位ID-->
              <template  v-if="item.prop === 'ex_slot_id'">
                <p class="name-row-ellipsis" v-if="scope.row.ex_slot_id"  :title="scope.row.ex_slot_id">{{ scope.row.ex_slot_id }}</p>
                <p v-else> - </p>
              </template>
              <!-- 应用名称/ID-->
              <template v-if="item.prop === 'app_id'">
                <p  class="name-row-ellipsis" :title="scope.row.app.app_name">{{ scope.row.app.app_name }}</p>
                <p class="tip-row-line">ID: {{ scope.row.app_id }}</p>
              </template>
              <!--应用平台-->
              <template  v-if="item.prop ==='app_os_type'">
                {{scope.row.app.os_type === 1 ? 'Android' : scope.row.app.os_type === 2 ? 'IOS' : '不限' }}
              </template>
              <!--媒体名称/ID-->
              <template v-if="item.prop ==='ud_id'">
                <p class="name-row-ellipsis" :title="scope.row.user_dev.company_short_name">{{ scope.row.user_dev.company_short_name }}</p>
                <p class="tip-row-line">ID: {{ scope.row.ud_id }}</p>
              </template>
              <!--广告场景-->
              <template v-if="item.prop ==='ad_type'">
                {{ adTypeId2Text(scope.row.ad_type_id) }}
              </template>
              <!--广告样式-->
              <template v-if="item.prop ==='creative_type'">
                {{ creativeId2Text(scope.row.creative_type) }}
              </template>
              <!-- 素材尺寸比例 -->
              <template v-if="item.prop ==='ad_ratio'">
                {{ scope.row.ratios | filterAdRatio }}
              </template>
              <!--接入方式-->
              <template v-if="item.prop ==='access_type_text'">
                <p v-if="scope.row.app"> {{ scope.row.app.access_type === 1 ? 'API' : scope.row.app.access_type === 2 ? 'SDK' : '-'}}</p>
                <p v-else>-</p>
              </template>
              <!--渲染方式-->
              <template v-if="item.prop ==='render_type_text'">
                {{ scope.row.render_type === 1 ? '模板' : scope.row.render_type === 2 ? '自渲染' : '-' }}
              </template>
              <!--关联产品-->
              <template v-if="item.prop ==='relatedProduct'">
                <p class="name-row-ellipsis" v-if="scope.row.ssp_product_name && scope.row.ssp_product_name.length">{{ scope.row.ssp_product_name.toString() }}</p>
                <p v-else> - </p>
              </template>
              <!-- 预算位的配置 -->
              <template v-if="item.prop ==='configNumber'">
                <p style="display: flex;justify-content: space-between;line-height: 20px">
                  <span style="vertical-align: middle">{{scope.row.traffic_control_list ? scope.row.traffic_control_list.length :  0 }}</span>
                  <span @click="configShow(scope.row)" style="cursor: pointer;vertical-align: middle">
              								<img style="width: 15px;vertical-align: middle" src="~@/assets/image/edit.png" alt="">
              							</span>
                </p>
              </template>
              <!--第三方SDK接入-->
              <template v-if="item.prop ==='platform_name'">
                <p v-if="scope.row.app"> {{scope.row.app.access_type == 2 ? filter3PlatName(scope.row) : '-'}}</p>
                <p v-else>-</p>
              </template>
              <!--穿山甲APPID-->
              <template v-if="item.prop ==='pangolin_APPID'">
                <p v-html="filter3PlatId(scope.row, 'pangolin')"></p>
              </template>
              <!--优量汇APPID-->
              <template v-if="item.prop ==='you_APPID'">
                <p v-html="filter3PlatId(scope.row, 'you')"></p>
              </template>
              <!--交互通广告位ID-->
              <template v-if="item.prop ==='tuia_ID'">
                <p v-html="filter3PlatId(scope.row, 'tuia')"></p>
              </template>

              <!--结算方式-->
              <template  v-if="item.prop === 'settlement'">
                <p v-if="scope.row.divide_price !==-1">分成CPC</p>
                <p v-else>保价CPM</p>
              </template>
              <!--结算价格-->
              <template  v-if="item.prop === 'settlement_money'">
                <p v-if="scope.row.divide_price !== -1">{{scope.row.divide_price=== -1 ? 0 : number2ThousandNumber(Number(scope.row.divide_price)/100)}}</p>
                <p v-else>{{scope.row.valuation_price===-1 ? 0 : number2ThousandNumber(Number(scope.row.valuation_price)/100)}}</p>
              </template>
              <!--出价cpm-->
              <template  v-if="item.prop === 'cpm_price'">
                {{number2ThousandNumber(Number(scope.row.cpm_price)/100)}}
              </template>
              <!--cpm底价-->
              <template  v-if="item.prop === 'floor_price_cpm'">
                {{scope.row.floor_price_cpm < 0 ? 0 : number2ThousandNumber(Number(scope.row.floor_price_cpm)/100)}}
              </template>
              <!--cpc底价-->
              <template  v-if="item.prop === 'floor_price_cpc'">
                {{scope.row.floor_price_cpc < 0 ? 0 : number2ThousandNumber(Number(scope.row.floor_price_cpc)/100)}}
              </template>
              <!--业务状态-->
              <template v-if="item.prop ==='status'">
                <Badge v-if="scope.row.status == 1" color="#339900" text="有效"/>
                <Badge v-if="scope.row.status == 2" color="#015D16" text="修改审核中"/>
                <Badge v-if="scope.row.status == 3" color="#999999" text="待审核"/>
                <Badge v-if="scope.row.status == 4" color="#B5291A" text="已拒绝"/>
                <Badge v-if="scope.row.status == 5" color="#F72D17" text="封禁"/>
                <Badge v-if="scope.row.status == -1" status="error" text="暂停合作"/>
                <Poptip v-if="(scope.row.status == 4 || scope.row.status == 5) && scope.row.status_desc" trigger="hover"
                        :transfer="true" :content="scope.row.status_desc">
                  <i class="iconfont icon-why"></i>
                </Poptip>
              </template>
              <!--广告位状态-->
              <template v-if="item.prop ==='status_dev'">
                <Badge v-if="scope.row.status_dev == 1" color="#339900" text="启用"/>
                <!-- 2暂停，0默认暂停 -->
                <Badge v-else color="#F72D17" text="暂停"/>
              </template>
              <!--请求量控制-->
              <template v-if="item.prop ==='status_ctrl'">
                <Badge v-if="scope.row.status_ctrl === 1" color="#015D16" text="不控制"/>
                <Badge v-if="scope.row.status_ctrl === 2" color="#339900" text="投放"/>
                <Badge v-if="scope.row.status_ctrl === 3" color="#F72D17" text="暂停"/>
              </template>
              <!--今日请求量-->
              <template v-if="item.prop ==='max_request_times'">
                {{number2ThousandNumber(Number(scope.row.today_req_pv))}}
              </template>
              <!--广告展现保留比-->
              <template v-if="item.prop ==='show_rate'">
                {{scope.row.discount_show}}%
              </template>
              <!--广告点击保留比-->
              <template v-if="item.prop ==='click_rate'">
                {{scope.row.discount_click}}%
              </template>
              <!--运营状态-->
              <template v-if="item.prop ==='operate_status'">
				  <div class="divide">
					  <div class="divide_left">
						  <p v-if="scope.row.operate_status===-4">-</p>
						  <p v-else>
                      <span v-for="item in productStatus" v-if="item.value===scope.row.operate_status" :value="item.value"
							:key="item.label +'运营状态' + scope.row.id">{{item.label}}</span>
						  </p>
					  </div>
					<div class="divide_right" @click="logShow(scope.row)">
						<i class="iconfont icon-rizhi"/>
					</div>
				  </div>

              </template>
              <!--运营状态原因-->
              <template v-if="item.prop ==='operate_reason'">
                <p class="name-row-ellipsis" v-if="scope.row.operate_reason">{{ scope.row.operate_reason}}</p>
                <p v-else> - </p>
              </template>

              <!--创建时间-->
              <template v-if="item.prop ==='created_time'">
                <p v-if="scope.row.created_at"> {{ scope.row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
                <p v-else> - </p>
              </template>
              <!--更新时间-->
              <template v-if="item.prop ==='updated_time'">
                <p v-if="scope.row.updated_at"> {{ scope.row.updated_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}</p>
                <p v-else> - </p>
              </template>
            </u-table-column>
            <!-- 产品 -->
            <u-table-column
              v-if="item.isProduct"
              :header-align="'center'"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :min-width="item.minWidth"
            >
              <u-table-column
                v-for="child in item.childHeader"
                :key="child.id"
                :prop="child.prop"
                :label="child.label"
                :width="child.width"
                :min-width="item.minWidth"
                v-slot="scope"
                :renderHeader="renderHeader"
                :show-overflow-tooltip="true"
              >
                <template  v-if="child.prop ==='status'">
                  <div v-if="scope.row.product_text.length && scope.row.product_text.includes(item.label)">
                    <p v-for="its in scope.row.ssp_slot_dsp_product_list"
                       v-if="item.label === its.dsp_product.name">
					  <span v-if="its.status=== -4">-</span>
						<span v-else>
						<span v-for="it in productStatus" v-if="it.value=== its.status">{{it.label}}</span>
						</span>
                    </p>
                  </div>
                  <div v-else>-</div>
                </template>
                <template v-if="child.prop ==='sign'">
                  <div v-if="scope.row.product_text.length && scope.row.product_text.includes(item.label)">
                    <p v-for="its in scope.row.ssp_slot_dsp_product_list"
                       v-if="item.label === its.dsp_product.name">
                      <span v-for="it in productMark" v-if="it.value=== its.mark">{{it.label}}</span>
                    </p>
                  </div>
                  <div v-else>-</div>
                </template>
                <template  v-if="child.prop ==='activationRate'">
                  <div v-if="scope.row.product_text.length && scope.row.product_text.includes(item.label)">
                    <p v-for="its in scope.row.ssp_slot_dsp_product_list"
                       v-if="item.label === its.dsp_product.name">
                      {{its.activate_rate || 0 }}%
                    </p>
                  </div>
                  <div v-else>-</div>
                </template>
                <template  v-if="child.prop ==='remark'">
                  <div v-if="scope.row.product_text.length && scope.row.product_text.includes(item.label)">
                    <p v-for="its in scope.row.ssp_slot_dsp_product_list"
                       v-if="item.label === its.dsp_product.name">
                     <span style="display: block" class="name-row-ellipsis">{{its.remark}} </span>
                    </p>
                  </div>
                  <div v-else>-</div>
                </template>

              </u-table-column>
            </u-table-column>
          </template>
        </u-table>
          <Spin size="large" v-if="tableLoadFlag" fix></Spin>
        </div>
        <div class="page-center">
          <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage'
                :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
        </div>
      </div>
    </Card>
    <!--审核拒绝/封禁弹窗-->
    <Drawer v-model="bannedModalFlag" :title="catchRowData.status === 3 ? '确定拒绝该广告位么？' : '确定封禁该广告位么？'"
            :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500"
            :styles="drawStyles">
      <Form ref="bannedForm">
        <FormItem label="">
          <Input v-model.trim="bannedReason" show-word-limit maxlength="50" type="textarea" :rows="6"
                 :placeholder="catchRowData.status === 3 ? '拒绝原因，不超过50字，必填' : '封禁原因，不超过50字，必填'"/>
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button @click="cancleBanned">取消</Button>
        <Button type="primary" :loading="submitClock" @click="trueBanned('banned')">
          <span v-if="!submitClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Drawer>

    <!--自定义列-->
    <manage-column ref="customColumn"  @on-change="getAdManageCol"></manage-column>

    <!--批量导入广告位-->
    <Drawer v-model="exportModalFlag" :title="active===1?'批量新建广告位': active===2 ?'批量配置预算位' : '批量修改广告位'"
            :mask-closable="false" :closable="false" class="newBatch" width="600" :styles="drawStyles">
      <Form ref="exportForm" :label-width="130" :label-colon="true">
        <div class="down_export">
          <div>
            <icon class="icon icon-excel" style="font-size: 20px"/>
            <span v-if="active===1">新建广告位模板</span>
            <span v-else-if="active===2">配置预算位模板</span>
            <span v-else>修改广告位模板</span>
          </div>
          <div>
            <a download v-if="active === 1"
               :href="`${this.$xlsAPIUrl}/%E6%96%B0%E5%BB%BA%E5%B9%BF%E5%91%8A%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx?v=1`"
            >
              <icon class="icon icon-download"/>
              <span>下载</span>
            </a>
            <a download v-else-if="active === 2"
               :href="`${this.$xlsAPIUrl}/%E9%85%8D%E7%BD%AE%E9%A2%84%E7%AE%97%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx?v=1`"
            >
              <icon class="icon icon-download"/>
              <span>下载</span>
            </a>
            <a v-else download
               :href="`${this.$xlsAPIUrl}/%E4%BF%AE%E6%94%B9%E5%B9%BF%E5%91%8A%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx?v=2`"
            >
              <icon class="icon icon-download"/>
              <span>下载</span>
            </a>
          </div>
        </div>
        <FormItem :label="active===2?'请上传配置表格':'请上传广告位表格'" prop="file">
          <Upload
            :action="active === 1 ? sspSlotImportUrl : active=== 2 ? sspSlotImportMapUrl : sspSlotImportUpdateUrl"
            type="drag"
            :show-upload-list="false"
            :format="['csv','xlsx','xls']"
            :on-format-error="handleFormatError"
            :before-upload="handleBeforUpload"
            :max-size="10*1024"
          >
            <div class="upload-inner">
              <div class="icon-box">
                <icon class="icon icon-cloud-upload"/>
              </div>
              <div class="upload-txt">
                <p>将文件拖到此处，或<span>点击上传</span></p>
              </div>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="">
          <p>{{filename}}</p>
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button @click="cancleExport">取消</Button>
        <Button type="primary" :loading="exportClock" @click="uploadPublic()">
          <span v-if="!exportClock">确定</span>
          <span v-else>提交中...</span>
        </Button>
      </div>
    </Drawer>
    <configBudget v-model="showConfig" :configData="configData" @success="search"/>
    <!--批量操作-->
    <Drawer v-model="batchModalFlag" :title="batchHandle === 2 ? '批量填写有量未采买原因' : batchHandle === 3 ? '批量拒绝采买': batchHandle === 4 ? '批量测试不通过' : batchHandle === 1 ? '批量恢复采买' : '批量重新测试' "
            :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500"
            :styles="drawStyles">
      <Form ref="batchForm" :model="batchForm" :rules="batchFormRules">
        <div class="batch_title" style="margin-bottom: 10px">
          <div v-if="batchHandle === 2">
            <p style="color: red">只有广告位的运营状态为有量未采买状态时，才可以录入对应的原因；</p>
            <p>请输入广告位有量未采买的原因：</p>
          </div>
			<div v-else>
				<p v-if="batchHandle === 3 || batchHandle === 4" style="color: red">注意：仅没有配置预算位且此刻没有创建测试计划的广告位，可执行此操作，请提前确认，否则无法修改</p>
				<p v-else-if="batchHandle === 1" style="color: red">注意：仅运营状态为拒绝采买时，才可以恢复采买</p>
				<p v-else style="color: red">注意：仅运营状态为测试不通过时，才可以重新测试</p>
				<p>广告位【运营状态】将改为
					<span v-if="batchHandle === 1">恢复采买</span>
					<span v-if="batchHandle === 3">拒绝采买</span>
					<span v-if="batchHandle === 4">测试不通过</span>
					<span v-if="batchHandle === 5">重新测试</span>
				</p>
				<p>如果确认操作，请输入原因：</p>
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
    <!-- 备注弹窗 -->
    <note-table ref="noteTable" @on-change="changeNoteTable"></note-table>
	 <!-- 操作日志 -->
	<operationLog v-model="logModal" :ids="log_id"></operationLog>
  </div>
</template>

<script>
  import {showTitle, filterBatchQuery, localRead} from '@/libs/util'
  import {productStatus, productMark, adStatusList} from '../data/adConfig'
  import {getMediaSspSlotAdList, submitOperateStatus, submitProductRemark, getSspSlotAdList, getAppList, setSspSlotStatus, getSspSlotAdListUrl, sspSlotImport, sspSlotImportUrl, sspSlotImportMap, sspSlotImportMapUrl, sspSlotImportUpdate, sspSlotImportUpdateUrl} from '@/api/ssp'
  import {getDspProductList} from '@/api/dsp'
  import {commonMixin} from '@/mixin/basic-common-class.js'
  import {debounce, throttle, createObjectURL, formatDate} from '@/libs/tools'
  import {tableHeight} from '@/mixin/calc-table-height.js'
  import {getDownLoadXls} from '@/api/common'
  import {inPageAccess} from '@/mixin/in-page-access.js'
  import {commonConfig} from '@/mixin/config-common.js'
  import operationLog from '@/components/operation-log/index.vue'
  import configBudget from '../components/config'
  import manageColumn from '../components/adManageColumn'
  import noteTable from '../components/noteTable' // 备注
  import Clipboard from 'clipboard'

  export default {
    name: 'ad-manage',
    components: {configBudget, noteTable, manageColumn, operationLog},
    mixins: [commonMixin, tableHeight, inPageAccess, commonConfig],
    data() {
      return {
		logModal: false, // 操作日志的弹框
		log_id: 0, // 操作日志的id
        batchForm: {
          reason: '' // 批量的原因
        },
        batchFormRules: {
          reason: [{required: true, message: '请输入原因'}]
        },
        datePickerTime: null, // 时间选择器
        datePickerOptions: { // 时间容器，禁止选择时间
          disabledDate(date) {
            let disableData = Date.parse(new Date('2020-09-01 00:00:00'))
            return date.valueOf() >= Date.now() || date.valueOf() < disableData
          }
        },
        batchHandle: 2, // 批量操作的类型
        batchModalFlag: false, // 批量操作的弹框
        batchStatus: false, // 批量设置的
        copySspSloIDString: '', // 复制全部广告位ID
        sspSlotImportUrl: sspSlotImportUrl,
        sspSlotImportMapUrl: sspSlotImportMapUrl,
        sspSlotImportUpdateUrl: sspSlotImportUpdateUrl,
        productStatus: productStatus(this), // 产品状态以及运营状态
        productMark: productMark(this), // 产品标记
        adStatusList: adStatusList(this), // 广告位的状态
        configStatus: true,
        configData: null,
        active: 1, // 1=> 导入广告位，2=> 配置预算位
        showConfig: false,

        noDataText: this.$config.noDataText,
        pageSize: 10,
        total_count: 0,
        currentPage: 1,
        tableLoadFlag: true, // table的loading

        adCustomAll: false,

        // 搜索条件
        filterSearch: {
          status: 0, // 标签栏状态，-1=暂停合作，0=全部，1=正常，2=修改审核中，3=待审核，4=已拒绝，5=封禁
          operate_status: '全部', // 运营状态 -3测试不通过 -2拒绝采买 -1无量 0待测试 1测试中 2有量未采买 3采买失败 4已采买
          ud_id_arr: [], // 媒体ID
          app_id_arr: [], // 应用ID
          ad_type_id_arr: [], // 广告类型ID数组
          creative_type_arr: [], // 广告创意ID
          search_text: '', // 搜索框
          created_since: '', // 创建时间的开始
          created_until: '', // 创建时间的结束
          ssp_slot_id_arr_select: [], // 广告位名称/ID(单个)
          ssp_slot_id_arr_textarea: null, // 广告位ID数组textarea(多个)
          ssp_slot_name_arr_textarea: null, // 广告位名称数组textarea
          ratio_arr_textarea: null, // 素材尺寸比例textarea

          // 备用数组
          styleDataArr: [], // 广告样式列表 和 广告场景联动
          ssp_slot_id_arr: [], // 广告位ID数组
          ssp_slot_name_arr: [], // 广告位名称数组
          ratio_arr: [], // 素材尺寸比例
          ex_slot_id_arr: [], // 外部广告位ID
          ex_slot_id_textarea: null, // 外部广告位ID
          operate_status_reason: '', // 运营状态原因
          request_volume: null, // 广告请求量
          dsp_product_id_arr: [], // 产品名称的id
          dsp_product_status_arr: [], // 产品状态
          dsp_product_mark_arr: [], // 产品标记
          dsp_product_remark: '' // 产品备注
        },

        // 搜索联动使用
        catchSspAppList: [], // 缓存应用列表，在清空媒体下拉时重新赋值
        sspAppList: [], // 媒体列表
        sspAppLoad: false, // 媒体列表加载中

        catchSspSlotList: [], // 缓存广告位名称
        sspSlotList: [], // 广告位名称
        sspSlotLoad: false, // 广告位加载中
        tableColList: [],
        catchRowData: '', // 点击拒绝和封禁，启用时缓存数据
        bannedModalFlag: false,
        bannedReason: '', // 紧闭的理由
        drawStyles: { // 抽屉样式
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '54px',
          position: 'static'
        },
        submitClock: false, // 重置密码锁

        count: 0, // 全部
        adCountStatusList: [], // 广告位的状态的列表
        operateCountStatusList: [], // 运营状态
        is_stop_count: 0, // 暂停合作
        reject_count: 0, // 拒绝
        stop_count: 0, // 封禁
        updating_count: 0, // 修改审核中
        valid_count: 0, // 有效正常
        wait_check_count: 0, // 待审核

        adColumns: [],
        columnDrawer: false,
        colDatList: [],

        uploadList: [],
        filename: '',
        exportClock: false,
        exportModalFlag: false,
        exportModalDeploy: false,
        selectID: [], // 选中的值
        productList: [], // 产品列表
        downClock: false // 下载列表的loading
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
      },
      /**
       * [filterAdRatio 列表中尺寸格式化]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      filterAdRatio(item) {
        if (!item.length) {
          return ''
        }

        let _arr = []
        item.map(_ => {
          _arr.push(`${_.width_ratio}:${_.height_ratio}`)
        })
        return _arr.join()
      }
    },
    created() {
    	if (this.$route.query.sspSlotId) {
			this.filterSearch.ssp_slot_id_arr_textarea = this.$route.query.sspSlotId
			let _filter = this.filterSearch
			let textSplitArr = filterBatchQuery({value: _filter.ssp_slot_id_arr_textarea, type: 'number'})
			_filter.ssp_slot_id_arr = Array.from(new Set([...textSplitArr, ..._filter.ssp_slot_id_arr_select]))

		}
      this.initLinkage() // 初始化联动
    },
    mounted() {
      this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': true}) // search-line的高度
    },
    activated() {
      this.$Bus.$off('sspAdvEmitEvent')
      this.$Bus.$on('sspAdvEmitEvent', (msg) => {
        this.getSspSlotAdList() // 默认请求一次媒体列表数据
      })
    },
    methods: {
		/**
		 * [logShow 点击显示操作日志]
		 * @return {[type]} [description]
		 */
		logShow(row) {
          this.logModal = true
          this.log_id = row.id
		},

		/**
		 * [renderHeader 列的提示]
		 * @return {[type]} [description]
		 */
      renderHeader(h, { column, $index }) {
        if (column.label === '今日状态') {
           return h('div', [
            h('Tooltip', {
              props: {transfer: true, content: 'Bottom Center text', placement: 'bottom', maxWidth: 400}
            }, [
              h('span', {style: {cursor: 'pointer'}}, '今日状态'),
              h('Icon', {
                props: {type: 'md-help-circle', color: '#c8c8c8', size: '16', cursor: 'pointer'},
                class: { iconClass: true }
              }), //
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '待测试：关联测试计划的待测试状态')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '测试待开始：在测试计划中，未到测试开始时间')]),
			  h('div', {
					slot: 'content', style: {display: 'flex'}
			  }, [h('span', '测试中：关联测试计划的测试中或暂停中状态')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '已采买：广告位关联预算位的有效广告请求pv、广告返回pv、广告展现pv>0 ')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '有量未采买：有有效广告请求pv没广告返回pv')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '采买失败：广告位关联了预算位的有效广告请求pv>0且广告返回pv=0或有效广告请求pv=0')])
            ])
          ])
        }
        if (column.label === '标记') {
          return h('div', [
            h('Tooltip', {
              props: {transfer: true, content: 'Bottom Center text', placement: 'bottom', maxWidth: 400}
            }, [
              h('span', {style: {cursor: 'pointer'}}, '标记'),
              h('Icon', {
                props: {type: 'md-help-circle', color: '#c8c8c8', size: '16', cursor: 'pointer'},
                class: { iconClass: true }
              }),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '盈利：连续2天以上收入-支出＞0（数据导入后生效）')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '盈利-亏损：前一天相比今天从盈利变为亏损（数据导入后生效）')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '新盈利：前一天相比今天从亏损变为盈利（数据导入后生效）')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', 'DP：激活率<10%（数据导入后生效）')]),
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', 'CTR异常：点击率<0.1%')])
            ])
          ])
        }
        if (column.label === '测试激活率') {
          return h('div', [
            h('Tooltip', {
              props: {transfer: true, content: 'Bottom Center text', placement: 'bottom', maxWidth: 300}
            }, [
              h('span', {style: {cursor: 'pointer'}}, '测试激活率'),
              h('Icon', {
                props: {type: 'md-help-circle', color: '#c8c8c8', size: '16', cursor: 'pointer'},
                class: { iconClass: true }
              }), //
              h('div', {
                slot: 'content', style: {display: 'flex'}
              }, [h('span', '该广告位与当前产品测试最后一天，平台显示的激活率（即导入的预算方调起率）')])
            ])
          ])
        }
        if (column.label === '备注') {
          return '备注'
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
      changeNoteTable() {
        this.getSspSlotAdList()
      },
      /**
       * [doColumns 自定义列]
       * @return {[type]} [description]
       */
      doColumns() {
        this.$refs.customColumn.getTableColumns()
      },
      /**
       * [getAdManageCol 自定义列的初始化]
       * @return {[type]} [description]
       */
      getAdManageCol() {
        let _local = localRead(this.$route.name.toUpperCase())
        let resultArr = []
        const ColumnList = [
          // 基本信息
          { prop: 'Internal_name', label: '内部广告位名称', minWidth: 140 },
          { prop: 'ex_slot_id', label: '外部广告位ID', minWidth: 150 },
          { prop: 'app_id', label: '应用名称/ID', minWidth: 150 },
          { prop: 'app_os_type', label: '应用平台', minWidth: 100 },
          { prop: 'ud_id', label: '媒体简称/ID', minWidth: 150 },
          { prop: 'ad_type', label: '广告场景', minWidth: 120 },
          { label: '广告样式', prop: 'creative_type', minWidth: 150 },
          { label: '素材尺寸比例', prop: 'ad_ratio', minWidth: 120 },
          { label: '接入方式', prop: 'access_type_text', minWidth: 80 },
          { label: '渲染方式', prop: 'render_type_text', minWidth: 100 },

          { label: '业务状态', prop: 'status', minWidth: 110 },
          { label: '广告位状态', prop: 'status_dev', minWidth: 110 },
          { label: '今日请求量', prop: 'max_request_times', minWidth: 110 },
          { label: '运营状态', prop: 'operate_status', minWidth: 120 },
          { label: '运营状态原因', prop: 'operate_reason', minWidth: 110 },
          { label: '关联产品', prop: 'relatedProduct', minWidth: 100 },
          { label: '关联预算位', prop: 'configNumber', minWidth: 100 },
          { label: '广告展现保留比', prop: 'show_rate', minWidth: 120 },
          { label: '广告点击保留比', prop: 'click_rate', minWidth: 120 },

          { label: '结算方式', prop: 'settlement', minWidth: 120 },
          { label: '结算价格', prop: 'settlement_money', minWidth: 120 },
          { label: '出价CPM', prop: 'cpm_price', minWidth: 120 },
          { label: 'CPM底价', prop: 'floor_price_cpm', minWidth: 120 },
          { label: 'CPC底价', prop: 'floor_price_cpc', minWidth: 120 },

          { label: '第三方SDK接入', prop: 'platform_name', minWidth: 160 },
          { label: '穿山甲广告位ID', prop: 'pangolin_APPID', minWidth: 140 },
          { label: '优量汇广告位ID', prop: 'you_APPID', minWidth: 140 },
          { label: '交互通广告位ID', prop: 'tuia_ID', minWidth: 140 },
          { label: '更新时间', prop: 'updated_time', minWidth: 170 },
          { label: '创建时间', prop: 'created_time', minWidth: 170 }

        ]
        if (!_local) {
          this.tableColList = ColumnList
        } else {
          resultArr = ColumnList.filter(_ => {
            return _local.split(',').includes(_.label)
          })
          let dataCol = []
          this.productList.map(item => {
            let obj = {}
            obj.isProduct = true
            obj.prop = 'CP' + item.name
            obj.label = item.name
            obj.width = '450'
            obj.childHeader = []
            let statusObj = {prop: 'status', label: '今日状态', width: 100}
            let signObj = {prop: 'sign', label: '标记', minWidth: 100}
            let activationRateObj = {prop: 'activationRate', label: '测试激活率', width: 120}
            let remarkObj = {prop: 'remark', label: '备注', width: 100}
            let flag = false
            if (_local.split(',').includes('今日状态')) {
              obj.childHeader.push(statusObj)
              flag = true
            }
            // if (_local.split(',').includes('标记')) {
            //   obj.childHeader.push(signObj)
            //   flag = true
            // }
            if (_local.split(',').includes('测试激活率')) {
              obj.childHeader.push(activationRateObj)
              flag = true
            }
            if (_local.split(',').includes('备注')) {
              obj.childHeader.push(remarkObj)
              flag = true
            }
            if (_local.split(',').includes(item.name) && flag) {
              dataCol.push(obj)
            }
          })
          this.tableColList = resultArr.concat(dataCol)
        }
        this.colDatList = []
        this.getSspSlotAdList()
        this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': true})
      },

      /**
       * [doNote 备注]
       * @return {[type]} [description]
       */
      doNote(row) {
        this.$refs['noteTable'].injectDate(row)
      },
      /**
       * [getProductList 获取产品]
       * @return {[type]} [description]
       */
      getProductList() {
        let params = {
          page_size: 0,
          page_num: 1
        }
        getDspProductList(params).then(res => {
          if (res.code === 200) {
            this.productList = res.data.list
          }
          this.getAdManageCol() // 获取广告列表
        })
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
              obj.operate_status = this.batchHandle === 2 ? 2 : this.batchHandle === 3 ? -2 : this.batchHandle === 4 ? -3 : -5
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
                this.getSspSlotAdList() // 刷新列表
              }
            })
          }
        })
      },
      /**
       * [selChange 获取选中的值]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      selectChange(select) {
        let _arr = []
        select.map(item => {
          _arr.push(item.id)
        })
        this.selectID = _arr
      },
      /**
       * [batchSetButton 批量设置]
       * @param  {[type]} item [description]
       * @return {[type]}     [description]
       */
      batchSetButton() {
        this.selectID.length > 0 ? this.batchStatus = true : this.$Message.warning('请选择对应的设置的广告位')
      },
      /**
       * [batchOperation 批量操作]
       * @return {[type]} [description]
       */
      batchSet(type) {
        if (!this.selectID.length) {
          this.$Message.warning('请选择对应的设置的广告位')
          return
        }
		  this.batchHandle = type
		  this.batchModalFlag = true
		  this.$refs['batchForm'].resetFields()
		  this.batchForm.reason = ''
      },
      /**
       * [copySspSlotID 复制全部广告位ID]
       * @return {[type]} [description]
       */
      copySspSlotID() {
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
      },
      /**
       * [initSearchFilter 初始化筛选联动]
       * @return {[type]} [description]
       */
      initLinkage() {
        this.getProductList() // 获取产品列表
        this.getSspAppList() // 应用列表列表
        this.getSspSlotList() // 广告位列表
      },
      // 配置弹框的展示
      configShow(row) {
        this.configData = row
        this.showConfig = !this.showConfig
      },
      search() {
        this.getSspSlotAdList()
      },
      /**
       * [filter3PlatName 过滤第三方sdk]
       * @param  {[type]} row [description]
       * @param  {[type]} type [description]
       * @return {[type]}     [description]
       */
      filter3PlatName(row) {
        // 过滤规则
        // 1. API 直接返回 '-'
        if (row.app.access_type === 1 || !row.platform_list.length) {
          return '-'
        }

        // 2. SDK
        if (row.app.access_type === 2) {
          let result = []
          const platform_slot_code = row.platform_list
          platform_slot_code.map(item => {
            result.push(item.conf_platform.name)
          })
          return result.toString()
        }
      },

      /**
       * [filter3PlatId 过滤第三方sdk]
       * @param  {[type]} row [description]
       * @param  {[type]} type [description]
       * @return {[type]}     [description]
       */
      filter3PlatId(row, type) {
        // key, id 对应值
        // key: 穿山甲， id: 1
        const keyObj = {
          'pangolin': 1, // key: 穿山甲， id: 1
          'you': 2, // key: 优量汇， id: 2
          'tuia': 3 // 交互通， id: 3
        }
        // 过滤规则
        // 1. API 直接返回 '-'
        if (row.app.access_type === 1) {
          return '-'
        }

        // 2. SDK
        if (row.app.access_type === 2) {
          let result = '-'
          const platform_slot_code = row.platform_list
          platform_slot_code.map(item => {
            if (item.platform_id === keyObj[type]) {
              result = item.platform_slot_code || `<span class="wait-id">待配置</span>`
            }
          })
          return result
        }
      },
      /**
       * [cancleBanned 取消封禁]
       * @return {[type]} [description]
       */
      cancleBanned(type) {
        this.bannedModalFlag = false
        this.catchRowData = ''
        if (type === 'clear') {
          this.bannedReason = ''
        }
      },
      /**
       * [trueBanned description]
       * @param  {[type]} type ['open 开启', 'banned' 禁用]
       * @return {[type]}      [description]
       */
      trueBanned(type) {
        if (!this.bannedReason && type === 'banned') {
          this.$Message.error({
            content: this.catchRowData.status === 3 ? '请输入拒绝原因' : '请输入封禁原因',
            duration: 3
          })
          return
        }

        let params = {
          slot_id: this.catchRowData.id,
          status_desc: type === 'banned' ? this.bannedReason : ''
        }

        if (type === 'open') {
          params.status = 1
        } else if (type === 'banned') {
          params.status = this.catchRowData.status === 3 ? 4 : 5 // 正常1->封禁5。。 待审核3->拒绝4
        }

        this.submitClock = true

        setSspSlotStatus(params).then(res => {
          this.submitClock = false
          this.cancleBanned('clear')

          if (res.code === 200) {
            this.$Message.success({content: '操作成功', duration: 3})
            this.getSspSlotAdList() // 刷新列表
          }
        }, error => {
          this.submitClock = false
        })
      },
      /**
       * [toEnable 开启]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      toEnable(row) {
        this.catchRowData = row

        this.$Modal.confirm({
          title: row.status === 3 ? '确定广告位审核通过么？' : '确定启用广告位么？启用即代表广告可正常使用',
          onOk: () => {
            this.trueBanned('open')
          },
          onCancel: () => {
            this.catchRowData = ''
          }
        })
      },
      /**
       * [toBanned 封禁]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      toBanned(row) {
        this.bannedModalFlag = true
        this.catchRowData = row
      },
      /**
       * [creativeId2Text 根据createId 找到对应 text]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      creativeId2Text(id) {
        let _arr = this.$store.state.app.adStyleData
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [creativeId2Text 根据createId 找到对应 text]
       * @param  {[type]} id [description]
       * @return {[type]}    [description]
       */
      adTypeId2Text(id) {
        let _arr = this.$store.state.app.adSceneData
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      /**
       * [getSspSlotAdList 获取广告位的列表]
       * @return {[type]} [description]
       */
      getSspSlotAdList() {
        // 参数
        let params = this.getAxiosParams()
        params.page_num = this.currentPage
        params.page_size = this.pageSize

        this.tableLoadFlag = true

        getMediaSspSlotAdList(params).then(res => {
          this.tableLoadFlag = false

          let data = res.data

          if (res.code === 200) {
            this.total_count = data.total
             // 广告位的状态的个数
            let adStatusList = this.adStatusList
            let status_count = data.status_count
            let adArr = []
            status_count.map(item => { adArr.push(item.status) })
            let adCountStatus = []
            let sum = 0
            adStatusList.map(item => {
              if (adArr.includes(item.value)) {
                status_count.map(it => {
                  if (it.status === item.value) {
                    sum = sum + it.count
                    item.number = it.count
                    adCountStatus.push(item)
                  }
                })
              } else {
                item.number = 0
                adCountStatus.push(item)
              }
            })
            this.count = sum
            this.adCountStatusList = adCountStatus // 广告位状态的修改
            // 运营状态的修改
            let operateStatus = this.productStatus
            let operate_count = data.operate_status_count
            let operateArr = []
            operate_count.map(item => { operateArr.push(item.status) })
            let operateList = []
            operateStatus.map(item => {
              if (operateArr.includes(item.value)) {
              operate_count.map(it => {
                  if (it.status === item.value) {
                    item.number = it.count
                    operateList.push(item)
                  }
              })
              } else {
                item.number = 0
                operateList.push(item)
              }
            })
            this.operateCountStatusList = operateList // 运营状态
            // 产品的名称
            let adManageList = []
            if (data.list && data.list.length) {
              adManageList = data.list.map((item, index) => {
                  let product_text = [] // 二级列表的数值
                 item.ssp_slot_dsp_product_list ? item.ssp_slot_dsp_product_list.map(it => {
                   product_text.push(it.dsp_product.name)
                  }) : ''
                item.product_text = product_text
				  let ssp_product_name = [] // 关联产品的名称
				  item.related_dsp_products ? item.related_dsp_products.map(it => {
					  ssp_product_name.push(it.name)
				  }) : ''
				  item.ssp_product_name = ssp_product_name
                return item
              })
            }
            this.colDatList = adManageList
            let slotIdArr = []
            let curArr = data.list
            if (curArr && curArr.length > 0) {
              curArr.map(item => {
                slotIdArr.push(item.id)
              })
            }
            this.copySspSloIDString = slotIdArr.length ? slotIdArr.join(',') : '' // 复制全部广告位ID
          }
        }, err => {
          if (err.code === 403) {
            this.noDataText = this.$config.noDataTextPer
          }
          this.tableLoadFlag = false
        })
      },
      /**
       * [datePickerChange 时间的选择]
       * @return {[type]} [description]
       */
      datePickerChange(e) {
         if (e[0]) {
			 this.filterSearch.created_since = e[0]
			 this.filterSearch.created_until = e[1] + ` 23:59:59`
		 } else {
			 this.filterSearch.created_since = null
			 this.filterSearch.created_until = null
		 }
      },
      /**
       * [getAxiosParams 获取下载和列表的url参数]
       * @return {[type]} [description]
       */
      getAxiosParams() {

        let _filter = this.filterSearch
        let params = {
          ud_id_arr: _filter.ud_id_arr, // 媒体ID数组
          app_id_arr: _filter.app_id_arr, // 应用ID数组
          ad_type_id_arr: _filter.ad_type_id_arr, // 广告场景ID数组
          creative_type_arr: _filter.creative_type_arr, // 广告样式ID数组
          dsp_product_id_arr: _filter.dsp_product_id_arr, // 产品ID数组
          dsp_product_status_arr: _filter.dsp_product_status_arr, // 产品状态
          dsp_product_mark_arr: _filter.dsp_product_mark_arr // 产品标记
        }
        _filter.created_since ? params.created_since = Date.parse(new Date(_filter.created_since)) / 1000 : '' // 创建时间的开始
        _filter.created_until ? params.created_until = Date.parse(new Date(_filter.created_until)) / 1000 : '' // 创建时间的结束
        _filter.operate_status !== '全部' ? params.operate_status = _filter.operate_status : '' // 运营状态
        !!_filter.status && (params.status = _filter.status) // 广告位状态
        !!_filter.dsp_product_remark && (params.dsp_product_remark = _filter.dsp_product_remark) // 产品备注
        !!_filter.operate_status_reason && (params.operate_status_reason = _filter.operate_status_reason) // 运营原因
        !!_filter.ssp_slot_id_arr.length && (params.ssp_slot_id_arr = _filter.ssp_slot_id_arr) // 广告位ID数组
        !!_filter.ssp_slot_name_arr.length && (params.ssp_slot_name_arr = _filter.ssp_slot_name_arr) // 广告位名称数组
        !!_filter.ratio_arr.length && (params.ratio_arr = _filter.ratio_arr) // 素材尺寸比例
        !!_filter.ex_slot_id_arr.length && (params.ex_slot_id_arr = _filter.ex_slot_id_arr) // 外部广告位ID

        return params
      },
      /**
       * [doFilterMediaList 筛选媒体列表]
       * @return {[type]} [description]
       */
      doFilterList() {
        this.currentPage = 1

        let _filter = this.filterSearch


        // 此处有容处理
        // 广告位ID查询
        // 1. 广告位Id多选和单选，最后统一按照 ssp_slot_id_arr 一并传参（包含ssp_slot_id_arr_textarea / ssp_slot_id_arr_select 两个筛选条件）
        let textSplitArr = filterBatchQuery({value: _filter.ssp_slot_id_arr_textarea, type: 'number'})
        _filter.ssp_slot_id_arr = Array.from(new Set([...textSplitArr, ..._filter.ssp_slot_id_arr_select]))
        // 广告位ID数组
        // _filter.ssp_slot_id_arr = filterBatchQuery({value: _filter.ssp_slot_id_arr_textarea})
        // 广告位名称数组
        _filter.ssp_slot_name_arr = filterBatchQuery({value: _filter.ssp_slot_name_arr_textarea})
        // 素材尺寸素组
        _filter.ratio_arr = filterBatchQuery({value: _filter.ratio_arr_textarea, ratio: true})
        // 外部广告位id
        _filter.ex_slot_id_arr = filterBatchQuery({value: _filter.ex_slot_id_textarea})

        this.getSspSlotAdList()
      },
      /**
       * [changePage 切换页码]
       * @param  {[type]} val [description]
       * @return {[type]}     [description]
       */
      changePage(val) {
        this.currentPage = val
        this.getSspSlotAdList()
      },
      /**
       * [sizeChange 切换每页条数时的回调]
       * @param  {[type]} size [description]
       * @return {[type]}      [description]
       */
      sizeChange(size) {
        this.pageSize = size
        this.getSspSlotAdList()
      },
      /**
       * [toEdit 路由跳转]
       * @param  {[type]} el [description]
       * @return {[type]}    [description]
       */
      toEdit(row) {
        return `/ssp/ad/edit?slot_id=${row.id}&ud_id=${row.ud_id}`

        /* this.$router.push({
          name: 'ad-edit',
          query: {
            slot_id: row.ssp_slot_id,
            ud_id: row.ud_id
          }
        }) */
      },
      /**
       * [toView 查看]
       * @param  {[type]} row [description]
       * @return {[type]}     [description]
       */
      toView(row) {
        return `/ssp/ad/view?slot_id=${row.id}&ud_id=${row.ud_id}`
      },
      /**
       * [toConfig 跳转到配置页]
       * @return {[type]} [description]
       */
      toConfig(row) {
        return `/ssp/ad/config/${row.id}`
      },
      /**
       * [limitText 剩余项数量]
       * @param  {[type]} count [description]
       * @return {[type]}       [description]
       */
      limitText(count) {
        return `${count}+`
      },

      /********************************************
       *↓↓↓↓↓↓↓↓↓↓ 上传文件 start *↓↓↓↓↓↓↓
       ********************************************/
      /**
       * [downStatement 下载报表]
       * @return {[type]} [description]
       */
      downStatement() {
        // params参数
        let params = this.getAxiosParams()
        params.page_num = 1
        params.page_size = this.total_count

        let down = {
          url: getSspSlotAdListUrl(params),
          method: 'GET'
        }
        this.downClock = true

        getDownLoadXls(down).then(res => {
          if (res.code === 200) {
            let filename = '广告位列表.xlsx'
            createObjectURL(res.data.url, filename)
          }
          this.downClock = false
        })
      },
      /**
       * [cancleExport 取消导入]
       * @return {[type]} [description]
       */
      cancleExport() {
        this.resetExport()
      },
      // 上传的错误判断
      handleFormatError(file) {
        this.$Message.error({
          content: '不支持此文件类型',
          duration: 3
        })
        this.$Spin.hide()
      },
      /**
       * [checkFormat 校验文件类型, 必须满足]
       * @param  {[type]} type [description]
       * @return {[type]}      [description]
       */
      checkFormat(type) {
        let format = ['csv', 'xlsx', 'xls']
        if (!format.includes(type)) {
          this.$Message.error({
            content: '文件格式错误',
            duration: 3
          })
          return false
        }

        return true
      },
      // 上传前的判断
      handleBeforUpload(file) {
        // let type = file.name && file.name.indexOf('.') ? file.name.split('.')[1].toLowerCase() : ''
        let type = file.name && file.name.indexOf('.') ? file.name.split('.') : ''
        let finallyType = type[type.length - 1].toLowerCase()
        if (!this.checkFormat(finallyType)) {
          return false
        }
        this.uploadList = []
        if (file && file.size > (10 * 1024 * 1024)) {
          this.$Message.warning('文件不能大于' + 10 + 'M')
          return false
        } else {
          this.uploadList.push(file)
          this.filename = file.name
          return false
        }
      },
      uploadPublic() { // 图片、视频公共批量上传
        if (this.uploadList.length === 0) {
          this.$Message.error('请上传文件')
          return false
        } else {
          this.upload()
        }
      },
      /**
       * [upload 批量导入广告位 ]
       * @return {[type]} [description]
       */
      upload() {
        // formdata
        let formData = new FormData()
        formData.append('file', this.uploadList[0])

        let proAll = this.active === 1 ? sspSlotImport(formData) : this.active === 2 ? sspSlotImportMap(formData) : this.active === 3 ? sspSlotImportUpdate(formData) : ''

        this.exportClock = true

        proAll.then(res => {

          if (res.code === 200) {
            this.$Message.success('上传成功')
            this.getSspSlotAdList()
          } else if (res.code === 405) {

            let _arr = !!res.msg ? res.msg.split(';') : []

            if (_arr.length) {

              let html = '<div style="max-height: 400px;overflow: auto;">'
              _arr.map(_ => {
                html += `<p style="line-height:20px">${_}</p>`
              })
              html += '</div>'

              this.$Modal.warning({
                title: '错误提示',
                content: html,
                width: 500,
                onOk: () => {
                  this.getSspSlotAdList()
                }
              })
            }

          } else {
            this.$Message.error({
              content: res.msg,
              duration: 5
            })
          }

          this.resetExport()
        }, err => {
          this.resetExport()
        })
      },
      /**
       * [resetExport 重置导入]
       * @return {[type]} [description]
       */
      resetExport() {
        this.uploadList = []
        this.filename = ''
        this.exportClock = false
        this.exportModalFlag = false
      },
      /********************************************
       *↑↑↑↑↑↑↑↑↑ 上传文件 end *↑↑↑↑↑↑
       ********************************************/

      /********************************************
       *↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
       ********************************************/
      /**
       * [searchSspApp 应用列表-搜索]
       * @param  {[type]} query [description]
       * @return {[type]}       [description]
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
       * @return {[type]}       [description]
       */
      appQueryChange(query) {
        if (!query) {
          this.sspAppList = [...this.catchSspAppList]
        }
      },
      /**
       * [getSspAppList 应用列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}       [description]
       */
      getSspAppList: debounce(function (query) {
        let _params = {
          ud_id: this.filterSearch.ud_id_arr,
          page_size: (!!query || this.filterSearch.ud_id_arr.length) ? 10000 : 10,
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
       * @return {[type]}     [description]
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
        if (arr.length === 0) {
          this.sspSlotList = [...this.catchSspSlotList]
        }
      },
      /**
       * [sspSlotQueryChange 广告位-搜索词发生变化时]
       * @param  {[type]} query [description]
       * @return {[type]}     [description]
       */
      sspSlotQueryChange(query) {
        if (!query) {
          this.sspSlotList = [...this.catchSspSlotList]
        }
      },
      /**
       * [getSspSlotList 广告位列表-防抖]
       * @param  {[type]} query [description]
       * @return {[type]}     [description]
       */
      getSspSlotList: debounce(function (query) {

        let filter = this.filterSearch

        let _params = {
          ud_id_arr: filter.ud_id_arr,
          app_id_arr: filter.app_id_arr,
          page_size: (!!query || filter.ud_id_arr.length || filter.app_id_arr.length) ? 10000 : 10,
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
    },
    watch: {
      /**
       * [ad_type_id_arr 监听广告场景的变化]
       * @param  {[type]} newVal [description]
       * @return {[type]}        [description]
       */
      'filterSearch.ad_type_id_arr'(newVal) {
        let styleArr = this.$store.state.app.adStyleData
        let filterArr = []

        newVal.map(item => {
          styleArr.map(child => {
            if (item === child.parentId) {
              filterArr.push(child)
            }
          })
        })

        this.filterSearch.creative_type_arr = [] // 重置数据
        this.filterSearch.styleDataArr = filterArr
      },
      /**
       * 选择媒体
       */
      'filterSearch.ud_id_arr': {
        handler: function (val) {
          this.getSspAppList()
          this.getSspSlotList()
        }
      },
      /**
       * 选择应用
       */
      'filterSearch.app_id_arr': {
        handler: function (val) {
          this.getSspSlotList()
        }
      }
    }
    /**
     * [beforeRouteLeave 路由跳转]
     * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
     * @param  {[type]}   from [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    // beforeRouteLeave(to, from, next) {
    //   if (to.name !== 'ad-edit' && to.name !== 'ad-config') {
    //     this.$Bus.$off('editEmitEvent')
    //   }
    //   next()
    // }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import './column.styl';
  @import '../data/select.styl';
  .tableButton{
     height 43px
     line-height 43px
  }
  /deep/ .u-table-center{
       .plTableBox .el-table td{
        padding 4px 0
      }
    .plTableBox .el-table th{
      padding 4px 0
     }
      .plTableBox .el-table th {
        background-color: #e3ecf9!important;
      }
      .plTableBox .el-table--border td, .plTableBox .el-table--border th, .plTableBox .el-table__body-wrapper .el-table--border.is-scrolling-left~.el-table__fixed {
        border-right: 1px solid #d7dade;
      }
     .plTableBox .el-table--border th, .plTableBox .el-table--border th.gutter:last-of-type {
      border-bottom: 1px solid #d7dade;
     }
    }
  /deep/ .nav-handle-group .ivu-radio-group-button .ivu-radio-wrapper {
    padding 0 2px
    font-size 12px
  }
  .divide{
	  height 100%
	  display:flex
	  justify-content space-between
	  .divide_left{
		  min-height: 48px;
		  line-height 48px
		  flex:1
		  position relative
	  }

	  .divide_right{
		  width 20px
		  min-height: 48px;
		  line-height 48px
		  font-size: 16px;
		  text-align: center;
		  color: #3F83F7;
		  cursor pointer
	  }
  }

  .tooltip p {
    margin 0px
  }
  .batch_title p{
	 margin-bottom 5px
  }

  .select-tree
    display: inline-block
    vertical-align: middle

  .nav-handle-group
    margin-top: 5px

  .console-table
    /deep/ .wait-id
      color: #F72D17

  .mar-bot-10
    vertical-align: top
    margin-bottom: 10px

    /deep/ textarea.ivu-input
      height 32px
</style>
