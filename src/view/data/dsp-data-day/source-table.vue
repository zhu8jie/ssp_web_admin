<template>
  <div class="sublist">
    <i class="iconfont pos" @click="searchStatus = !searchStatus" :class="searchStatus ? 'icon-fold-down' : 'icon-fold-up'"/>
    <div class="filter-card" v-show="searchStatus">
      <Select class="filter-select" style="width:200px" clearable v-model="search_id">
        <Option v-for="(it,index) in searchList" :value="it.ssp_slot_id" :key="'search_id'+index">{{it.ssp_slot_name}}</Option>
      </Select>
      <Button type="primary" @click="getSourceData(1)">查询</Button>

      <Button type="default" v-if="copySspSloIDString" class="copy-content" :data-clipboard-text="copySspSloIDString" @click="copySspSlotID">复制全部广告位ID</Button>
    </div>
    <Table
      highlight-row
      stripe
      border
      :columns="data"
      :data="sourceData"
      @on-sort-change="sortChange"
      class="source-table"
    >
      <!--日期-->
      <template slot-scope="{ row }" slot="date">
        <p class="table_text">{{ row.date }}</p>
      </template>
      <!--应用名称/ID-->
      <template slot-scope="{ row }" slot="app_name">
        <p class="name-row-ellipsis" :title="row.app_name">{{ row.app_name }}</p>
        <p class="tip-row-line">ID: {{ row.app_id }}</p>
      </template>
      <!--应用平台-->
      <template slot-scope="{ row }" slot="os_type">
        <p class="table_text" v-if="row.os_type===1">Android</p>
        <p class="table_text" v-if="row.os_type===2">IOS </p>
      </template>
      <!--媒体简称/ID-->
      <template slot-scope="{ row }" slot="company_short_name">
        <p class="name-row-ellipsis" :title="row.company_short_name">{{row.company_short_name}}</p>
        <p class="tip-row-line">ID: {{ row.ud_id }}</p>
      </template>
      <!--广告位名称/ID-->
      <template slot-scope="{ row }" slot="ssp_slot_name">
        <div class="source-handler">
          <div class="label-name">
            <p class="name-row-ellipsis" :title="row.ssp_slot_name">{{row.ssp_slot_name}}</p>
            <p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
          </div>
          <div class="label-status">
            <Icon  @click="deleteUnlink(row.ssp_slot_id)" v-if="row.is_connected && hasDeleteSourceRole" title="删除此广告位下配置的当前预算位" class="delete" type="ios-trash" />
            <img v-if="!row.is_connected" class="deleted" src="~@/assets/image/small-icon/deleted-pic1.png" alt="">
          </div>
        </div>
      </template>
      <!--广告位素材尺寸比例-->
      <template slot-scope="{ row }" slot="ssp_slot_ratio">
        <p v-if="row.ssp_slot_ratio && budgetCheckData.indexOf('广告位名称') >= 0 " class="table_text">{{ row.ssp_slot_ratio }}</p>
        <p v-else class="table_text">-</p>
      </template>
      <!--广告样式-->
      <template slot-scope="{ row }" slot="ad_type">
        <p class="table_text"> {{adTypeText(row.ad_type_id)}}-{{creativeIdText(row.creative_type)}}</p>
      </template>
      <!--有效广告请求pv-->
      <template slot-scope="{ row }" slot="req_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.req_pv)}}</p>
          <p v-if="getProportion(row.req_pv,row.yes_req_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.req_pv,row.yes_req_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.req_pv,row.yes_req_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.req_pv,row.yes_req_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.req_pv,row.yes_req_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_req_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--有效广告请求uv-->
      <template slot-scope="{ row }" slot="req_uv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.req_uv)}}</p>
          <p v-if="getProportion(row.req_uv,row.yes_req_uv) > 10" class="data_scale up_scale">
            {{getProportion(row.req_uv,row.yes_req_uv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.req_uv,row.yes_req_uv) < -10" class="data_scale down_scale">
            {{getProportion(row.req_uv,row.yes_req_uv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.req_uv,row.yes_req_uv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_req_uv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--广告返回pv-->
      <template slot-scope="{ row }" slot="ret_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.ret_pv)}}</p>
          <p v-if="getProportion(row.ret_pv,row.yes_ret_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.ret_pv,row.yes_ret_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.ret_pv,row.yes_ret_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.ret_pv,row.yes_ret_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.ret_pv,row.yes_ret_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_ret_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--广告返回uv-->
      <template slot-scope="{ row }" slot="ret_uv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.ret_uv)}}</p>
          <p v-if="getProportion(row.ret_uv,row.yes_ret_uv) > 10" class="data_scale up_scale">
            {{getProportion(row.ret_uv,row.yes_ret_uv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.ret_uv,row.yes_ret_uv) < -10" class="data_scale down_scale">
            {{getProportion(row.ret_uv,row.yes_ret_uv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.ret_uv,row.yes_ret_uv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_ret_uv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--广告展现pv-->
      <template slot-scope="{ row }" slot="show_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.show_pv)}}</p>
          <p v-if="getProportion(row.show_pv,row.yes_show_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.show_pv,row.yes_show_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.show_pv,row.yes_show_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.show_pv,row.yes_show_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.show_pv,row.yes_show_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_show_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--广告展现uv-->
      <template slot-scope="{ row }" slot="show_uv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.show_uv)}}</p>
          <p v-if="getProportion(row.show_uv,row.yes_show_uv) > 10" class="data_scale up_scale">
            {{getProportion(row.show_uv,row.yes_show_uv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.show_uv,row.yes_show_uv) < -10" class="data_scale down_scale">
            {{getProportion(row.show_uv,row.yes_show_uv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.show_uv,row.yes_show_uv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_show_uv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--  广告点击pv-->
      <template slot-scope="{ row }" slot="click_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.click_pv)}}</p>
          <p v-if="getProportion(row.click_pv,row.yes_click_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.click_pv,row.yes_click_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.click_pv,row.yes_click_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.click_pv,row.yes_click_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.click_pv,row.yes_click_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_click_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--广告点击uv-->
      <template slot-scope="{ row }" slot="click_uv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.click_uv)}}</p>
          <p v-if="getProportion(row.click_uv,row.yes_click_uv) > 10" class="data_scale up_scale">
            {{getProportion(row.click_uv,row.yes_click_uv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.click_pv,row.yes_click_uv) < -10" class="data_scale down_scale">
            {{getProportion(row.click_uv,row.yes_click_uv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.click_uv,row.yes_click_uv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_click_uv)}}</p>
          </div>
        </Tooltip>
      </template>
		<!--加群点击数-->
		<template slot-scope="{ row }" slot="jc_pv">
			<Tooltip placement="right-start" :transfer="true">
				<p class="data_value">{{getNumberInt(row.jc_pv)}}</p>
				<p v-if="getProportion(row.jc_pv,row.yes_jc_pv) > 10" class="data_scale up_scale">
					{{getProportion(row.jc_pv,row.yes_jc_pv)}}%
					<Icon type="md-arrow-round-up"/>
				</p>
				<p v-else-if="getProportion(row.jc_pv,row.yes_jc_pv) < -10" class="data_scale down_scale">
					{{getProportion(row.jc_pv,row.yes_jc_pv)}}%
					<Icon type="md-arrow-round-down"/>
				</p>
				<p v-else class="data_scale">
					{{getProportion(row.jc_pv,row.yes_jc_pv)}}%
				</p>
				<div slot="content">
					<p style="font-size: 12px">昨天:{{getNumberInt(row.yes_jc_pv)}}</p>
				</div>
			</Tooltip>
		</template>
      <!--调起数-->
      <template slot-scope="{ row }" slot="dplsucc_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.dplsucc_pv)}}</p>
          <p v-if="getProportion(row.dplsucc_pv,row.yes_dplsucc_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.dplsucc_pv,row.yes_dplsucc_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.dplsucc_pv,row.yes_dplsucc_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.dplsucc_pv,row.yes_dplsucc_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.dplsucc_pv,row.yes_dplsucc_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_dplsucc_pv)}}</p>
          </div>
        </Tooltip>
      </template>

      <!--下载完成量-->
      <template slot-scope="{ row }" slot="complete_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.complete_pv)}}</p>
          <p v-if="getProportion(row.complete_pv,row.yes_complete_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.complete_pv,row.yes_complete_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.complete_pv,row.yes_complete_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.complete_pv,row.yes_complete_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.complete_pv,row.yes_complete_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_complete_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--安装量-->
      <template slot-scope="{ row }" slot="install_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.install_pv)}}</p>
          <p v-if="getProportion(row.install_pv,row.yes_install_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.install_pv,row.yes_install_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.install_pv,row.yes_install_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.install_pv,row.yes_install_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.install_pv,row.yes_install_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_install_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--激活量-->
      <template slot-scope="{ row }" slot="activate_pv">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberInt(row.activate_pv)}}</p>
          <p v-if="getProportion(row.activate_pv,row.yes_activate_pv) > 10" class="data_scale up_scale">
            {{getProportion(row.activate_pv,row.yes_activate_pv)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.activate_pv,row.yes_activate_pv) < -10" class="data_scale down_scale">
            {{getProportion(row.activate_pv,row.yes_activate_pv)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.activate_pv,row.yes_activate_pv)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberInt(row.yes_activate_pv)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--填充率-->
      <template slot-scope="{ row }" slot="fill_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.fill_rates)}}%</p>
          <p v-if="getProportion(row.fill_rates,row.yes_fill_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.fill_rates,row.yes_fill_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.fill_rates,row.yes_fill_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.fill_rates,row.yes_fill_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.fill_rates,row.yes_fill_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_fill_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--展现率-->
      <template slot-scope="{ row }" slot="show_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.show_rates)}}%</p>
          <p v-if="getProportion(row.show_rates,row.yes_show_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.show_rates,row.yes_show_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.show_rates,row.yes_show_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.show_rates,row.yes_show_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.show_rates,row.yes_show_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_show_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--点击率-->
      <template slot-scope="{ row }" slot="ctr">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.ctr)}}%</p>
          <p v-if="getProportion(row.ctr,row.yes_ctr) > 10" class="data_scale up_scale">
            {{getProportion(row.ctr,row.yes_ctr)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.ctr,row.yes_ctr) < -10" class="data_scale down_scale">
            {{getProportion(row.ctr,row.yes_ctr)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.ctr,row.yes_ctr)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_ctr)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--调起率-->
      <template slot-scope="{ row }" slot="dplsucc_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.dplsucc_rates)}}%</p>
          <p v-if="getProportion(row.dplsucc_rates,row.yes_dplsucc_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.dplsucc_rates,row.yes_dplsucc_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.dplsucc_rates,row.yes_dplsucc_rates) < -10"
             class="data_scale down_scale">
            {{getProportion(row.dplsucc_rates,row.yes_dplsucc_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.dplsucc_rates,row.yes_dplsucc_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_dplsucc_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--下载完成率-->
      <template slot-scope="{ row }" slot="complete_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.complete_rates)}}%</p>
          <p v-if="getProportion(row.complete_rates,row.yes_complete_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.complete_rates,row.yes_complete_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.complete_rates,row.yes_complete_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.complete_rates,row.yes_complete_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.complete_rates,row.yes_complete_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_complete_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--安装率-->
      <template slot-scope="{ row }" slot="install_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.install_rates)}}%</p>
          <p v-if="getProportion(row.install_rates,row.yes_install_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.install_rates,row.yes_install_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.install_rates,row.yes_install_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.install_rates,row.yes_install_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.install_rates,row.yes_install_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_install_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--激活率-->
      <template slot-scope="{ row }" slot="activate_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.activate_rates)}}%</p>
          <p v-if="getProportion(row.activate_rates,row.yes_activate_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.activate_rates,row.yes_activate_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.activate_rates,row.yes_activate_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.activate_rates,row.yes_activate_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.activate_rates,row.yes_activate_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_activate_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
      <!--eCPM-->
      <template slot-scope="{ row }" slot="ecpm">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.ecpm)}}</p>
          <p v-if="getProportion(row.ecpm,row.yes_ecpm) > 10" class="data_scale up_scale">
            {{getProportion(row.ecpm,row.yes_ecpm)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.ecpm,row.yes_ecpm) < -10" class="data_scale down_scale">
            {{getProportion(row.ecpm,row.yes_ecpm)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.ecpm,row.yes_ecpm)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_ecpm)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--CPC-->
      <template slot-scope="{ row }" slot="cpc">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.cpc)}}</p>
          <p v-if="getProportion(row.cpc,row.yes_cpc) > 10" class="data_scale up_scale">
            {{getProportion(row.cpc,row.yes_cpc)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.cpc,row.yes_cpc) < -10" class="data_scale down_scale">
            {{getProportion(row.cpc,row.yes_cpc)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.cpc,row.yes_cpc)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_cpc)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--媒体ecpm-->
      <template slot-scope="{ row }" slot="ecpm_dev">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.ecpm_dev)}}</p>
          <p v-if="getProportion(row.ecpm_dev,row.yes_ecpm_dev) > 10" class="data_scale up_scale">
            {{getProportion(row.ecpm_dev,row.yes_ecpm_dev)}}%<Icon type="md-arrow-round-up" />
          </p>
          <p v-else-if="getProportion(row.ecpm_dev,row.yes_ecpm_dev) < -10" class="data_scale down_scale">
            {{getProportion(row.ecpm_dev,row.yes_ecpm_dev)}}%<Icon type="md-arrow-round-down" />
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.ecpm_dev,row.yes_ecpm_dev)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_ecpm_dev)}}</p>
          </div>
        </Tooltip>

      </template>
      <!--媒体CPC-->
      <template slot-scope="{ row }" slot="cpc_dev">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.cpc_dev)}}</p>
          <p v-if="getProportion(row.cpc_dev,row.yes_cpc_dev) > 10" class="data_scale up_scale">
            {{getProportion(row.cpc_dev,row.yes_cpc_dev)}}%<Icon type="md-arrow-round-up" />
          </p>
          <p v-else-if="getProportion(row.cpc_dev,row.yes_cpc_dev) < -10" class="data_scale down_scale">
            {{getProportion(row.cpc_dev,row.yes_cpc_dev)}}%<Icon type="md-arrow-round-down" />
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.cpc_dev,row.yes_cpc_dev)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_cpc_dev)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--收益-->
      <template slot-scope="{ row }" slot="income">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.income)}}</p>
          <p v-if="getProportion(row.income,row.yes_income) > 10" class="data_scale up_scale">
            {{getProportion(row.income,row.yes_income)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.income,row.yes_income) < -10" class="data_scale down_scale">
            {{getProportion(row.income,row.yes_income)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.income,row.yes_income)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_income)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--成本-->
      <template slot-scope="{ row }" slot="spend">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.spend)}}</p>
          <p v-if="getProportion(row.spend,row.yes_spend) > 10" class="data_scale up_scale">
            {{getProportion(row.spend,row.yes_spend)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.income,row.yes_spend) < -10" class="data_scale down_scale">
            {{getProportion(row.spend,row.yes_spend)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.spend,row.yes_spend)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_spend)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--利润-->
      <template slot-scope="{ row }" slot="profits">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.profits)}}</p>
          <p v-if="getProportion(row.profits,row.yes_profits) > 10" class="data_scale up_scale">
            {{getProportion(row.profits,row.yes_profits)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.profits,row.yes_profits) < -10" class="data_scale down_scale">
            {{getProportion(row.profits,row.yes_profits)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.profits,row.yes_profits)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_profits)}}</p>
          </div>
        </Tooltip>
      </template>
      <!--利润率-->
      <template slot-scope="{ row }" slot="profits_rates">
        <Tooltip placement="right-start" :transfer="true">
          <p class="data_value">{{getNumberFloat(row.profits_rates)}}%</p>
          <p v-if="getProportion(row.profits_rates,row.yes_profits_rates) > 10" class="data_scale up_scale">
            {{getProportion(row.profits_rates,row.yes_profits_rates)}}%
            <Icon type="md-arrow-round-up"/>
          </p>
          <p v-else-if="getProportion(row.profits_rates,row.yes_profits_rates) < -10" class="data_scale down_scale">
            {{getProportion(row.profits_rates,row.yes_profits_rates)}}%
            <Icon type="md-arrow-round-down"/>
          </p>
          <p v-else class="data_scale">
            {{getProportion(row.profits_rates,row.yes_profits_rates)}}%
          </p>
          <div slot="content">
            <p style="font-size: 12px">昨天:{{getNumberFloat(row.yes_profits_rates)}}%</p>
          </div>
        </Tooltip>
      </template>
    </Table>

    <!--    <div class="page-center" style="text-align: center">-->
    <!--      <Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>-->
    <!--    </div>-->
  </div>
</template>

<script>
  import {getSspBudgetSourceData, getDspHourDataSource, deleteSspUnlink} from '@/api/data'
  import {writeStartsDate, writeEndDate, getDayTime, getYesterdayTime} from '@/libs/tools'
  import Clipboard from 'clipboard'

  export default {
    props: {
      row: Object,
      data: Array,
      budgetCheckData: Array,
      hasDeleteSourceRole: Boolean // 是否有删除子表的权限
    },
    data() {
      return {
        searchStatus: true,
        sourceData: [],
        pageSize: 30,
        total_count: 100,
        currentPage: 1,
        order: null,
        hourDataList: [],
        search_id: '',
        searchList: [],
        copySspSloIDString: '' // 复制全部广告位ID
      }
    },
    created() {
      if (this.row.date === getDayTime()) {
        this.getYesterdayDataList()
      }
      this.getSourceData()
    },
    methods: {
      // 表格的排序
      sortChange(col, key, order) {
        if (col.order === 'asc') {
          this.order = col.column.slot
          this.pageSize = 0
          this.currentPage = 1
          this.getSourceData()
        } else if (col.order === 'desc') {
          this.order = col.column.slot + ' ' + col.order
          this.pageSize = 0
          this.currentPage = 1
          this.getSourceData()
        }
      },
      // 获取广告场景
      adTypeText(id) {
        let _arr = this.$store.state.app.adSceneData
        // eslint-disable-next-line eqeqeq
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      // 获取广告样式
      creativeIdText(id) {
        let _arr = this.$store.state.app.adStyleData
        // eslint-disable-next-line eqeqeq
        let result = _arr.filter(item => item.id == id)
        return result[0] ? result[0].title : ''
      },
      deleteUnlink(id) {
        let dsp_slot_id = this.row.dsp_slot_id
        let ssp_slot_id = Number(id)
        this.$Modal.confirm({
          title: '删除此广告位下配置的当前预算位？',
          className: 'vertical-center-modal',
          onOk: () => {
            deleteSspUnlink({
              ssp_slot_id,
              dsp_slot_id
            }).then(res => {
              if (res.code === 200) {
                this.$Message.success({content: '删除成功', duration: 3})
                this.getSourceData()
              } else {
                this.$Message.error({content: res.msg, duration: 3})
              }
            })
          },
          onCancel() {
            console.log('取消')
          }
        })
      },
      // 获取预算表格
      getSourceData(type) {
        let search = {}
        let group = []
        Object.keys(this.budgetCheckData).forEach(j => {
          if (this.budgetCheckData[j] === '日期') {
            group.push('date')
          }
          if (this.budgetCheckData[j] === '媒体简称') {
            group.push('ud_id')
          }
          if (this.budgetCheckData[j] === '应用平台') {
            group.push('os_type')
          }
          if (this.budgetCheckData[j] === '应用名称') {
            group.push('app_id')
          }
          if (this.budgetCheckData[j] === '广告位名称') {
            group.push('ssp_slot_id')
          }
          if (this.budgetCheckData[j] === '广告位类型') {
            group.push('creative_type')
          }
        })
        let searchID = []
        if (this.search_id) {
          searchID.push(this.search_id)
          searchID && searchID.length > 0 ? search.ssp_slot_id = searchID : ''
        }
        search.dsp_slot_id = this.row.dsp_slot_id
        search.date = this.row.date
        search.page_num = this.currentPage
        search.page_size = this.pageSize
        search.order = this.order
        search.group = group
        getSspBudgetSourceData(search).then(res => {
          let data = res.data
          if (res.code === 200) {
            this.total_count = data.total_count
            let flowList = data.list
            if(type !==1){
              this.searchList = flowList
            }
            let flowTableData = []
            let obj = {}
            obj.date = getYesterdayTime(this.row.date)
            obj.dsp_slot_id = this.row.dsp_slot_id
            let searchID = []
            if (this.search_id) {
              searchID.push(this.search_id)
              searchID && searchID.length > 0 ? obj.ssp_slot_id = searchID : ''
            }
            obj.page_num = 1
            obj.page_size = 0
            obj.group = group
            let groups = [...group]
            if (groups.indexOf('date') > -1) {
              groups.splice(groups.indexOf('date'), 1)
            }
            let juadgArr = []
            groups.map(g => {
              juadgArr.push(`item['${g}'] === child['${g}']`)
            })

            // 获取copy内容
            let slotIdArr = []
            flowList.map(item => {
              slotIdArr.push(item.ssp_slot_id)
            })
            this.copySspSloIDString = slotIdArr.length ? slotIdArr.join(',') : '' // 复制全部广告位ID

            if (this.row.date === getDayTime() && juadgArr.length > 0) {
              Object.keys(flowList).forEach(j => {

                console.log(j)

                let flowTable = {}
                flowTable = flowList[j]
                let flowData = []
                flowData.push(flowList[j])
                let day_id = []
                if (this.hourDataList && this.hourDataList.length > 0) {
                  this.hourDataList.map((item, index) => {
                    flowData.map(child => {
                      if (eval(juadgArr.join(' && '))) {
                        day_id.push(index)
                      }
                    })
                  })
                }
                if (day_id.length > 0) {
                  let yesData = this.hourDataList[day_id[0]]
                  Object.keys(yesData).forEach(m => {
                    flowTable['yes_' + m] = yesData[m]
                  })
                }
                flowTableData.push(flowTable)
              })
              this.sourceData = flowTableData
            } else {
              getSspBudgetSourceData(obj).then(res => {
                let data = res.data
                if (res.code === 200) {
                  let yesterdayDataList = data.list
                  Object.keys(flowList).forEach(j => {
                    let flowTable = {}
                    flowTable = flowList[j]

                    let flowData = []
                    flowData.push(flowList[j])
                    let select_id = []
                    if (yesterdayDataList && yesterdayDataList.length > 0) {
                      yesterdayDataList.map((item, index) => {
                        flowData.map(child => {
                          if (juadgArr.length > 0) {
                            if (item.date === getYesterdayTime(child.date) && eval(juadgArr.join(' && '))) {
                              select_id.push(index)
                            }
                          } else {
                            if (item.date === getYesterdayTime(child.date)) {
                              select_id.push(index)
                            }
                          }
                        })
                      })
                    }
                    if (select_id.length > 0) {
                      let yesData = yesterdayDataList[select_id[0]]
                      Object.keys(yesData).forEach(m => {
                        flowTable['yes_' + m] = yesData[m]
                      })
                    }
                    flowTableData.push(flowTable)
                  })
                  this.sourceData = flowTableData
                }
              })
            }
          }
        })
      },

      // 获取昨天的小时报表
      getYesterdayDataList() {
        let search = {}
        search.group = []
        this.tableLoadFlag = true
        // search.group.push('date')
        Object.keys(this.budgetCheckData).forEach(j => {
          if (this.budgetCheckData[j] === '媒体简称') {
            search.group.push('ud_id')
          }
          if (this.budgetCheckData[j] === '应用平台') {
            search.group.push('os_type')
          }
          if (this.budgetCheckData[j] === '应用名称') {
            search.group.push('app_id')
          }
          if (this.budgetCheckData[j] === '广告位名称') {
            search.group.push('ssp_slot_id')
          }
          if (this.budgetCheckData[j] === '广告位类型') {
            search.group.push('creative_type')
          }
        })
        search.dsp_slot_id = this.row.dsp_slot_id
        let searchID = []
        if (this.search_id) {
          searchID.push(this.search_id)
          searchID && searchID.length > 0 ? search.ssp_slot_id = searchID : ''
        }

        search.page_num = 1
        search.page_size = 0
        search.start_date = writeStartsDate()
        search.end_date = writeEndDate()
        getDspHourDataSource(search).then(res => {
          let data = res.data
          if (res.code === 200) {
            this.hourDataList = data.list
          }
        })
      },
      // 转换成千分位，保留两位小数
      getNumberFloat(val) {
        if (val) {
          return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        } else {
          return 0
        }
      },
      // 获取数据的同比值
      getProportion(curVal, preVal) {
        if (!!curVal && !!preVal && !isNaN(curVal)) {
          let result = Math.round(((curVal - preVal) / Math.abs(preVal)) * 100)
          return Math.abs(result) < 1 ? 0 : result
        } else {
          return 0
        }
      },
      // 转换成千分位
      getNumberInt(val) {
        if (val) {
          return parseInt(val).toLocaleString()
        } else {
          return 0
        }
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
      }
      // changePage(val) {
      //   this.currentPage = val
      //   this.getSourceData()
      // },
      // sizeChange(size) {
      //   this.pageSize = size
      //   this.getFlowData()
      // }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '../table.styl';
</style>
