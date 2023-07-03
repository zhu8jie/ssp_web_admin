<!-- by 李想 -->
<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title clearfix">
				<h2>流量数据</h2>
				<!-- tab标签切换 -->
				<slot name="tab"></slot>

				<div class="nav-tab">
					<div class="is-echart" @click="navType='echart'" v-show="navType === 'table'">
						<i class="iconfont icon-revenue"></i>
						查看折线图
					</div>
					<div class="is-table" @click="navType='table'" v-show="navType === 'echart'">
						<i class="iconfont icon-table"></i>
						查看表格数据
					</div>
				</div>

				<div class="is-handler">
					<Tooltip placement="left">
						<Button class="host" type="text" @click="drawerModalFlag = true, column_active = 1">自定义列
							<Icon type="md-help-circle"></Icon>
						</Button>
						<div slot="content">
							<p class="top_text">自定义表格表头，并永久记忆</p>
							<p class="top_text">列只有选择广告位名称，才可展开查看其</p>
							<p class="top_text">关联预算位的数据</p>
						</div>
					</Tooltip>

					<Button class="host" type="text" v-if="_isShow_('download')" :loading="submitClock" @click="downStatement">
						<i class="iconfont icon-download"></i>
						<span>{{!submitClock ? '下载报表' : '下载中...'}}</span>
						<span v-if="!submitClock"></span>
					</Button>
				</div>
			</div>
			<div class="search-line" ref="search-line">
				<DatePicker class="i-margin-right-11 i-width-time mar-bot-10" :clearable="false" type="date" :options="datePickerOptions" format="yyyy-MM-dd" :transfer="true" placeholder="请选择日期" :value="datePickerTime" @on-change="datePickerChange"></DatePicker>

				<TimePicker :steps="[1, 60, 60]" placeholder="全部时间" format="HH:mm" class="i-margin-right-11 i-width-status" @on-change="timeChange"></TimePicker>

				<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.ud_id_arr"
					placeholder="媒体简称/ID"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
				</Select>

				<Select class="i-margin-right-11 i-width-select" filterable v-model="filterSearch.os_type" placeholder="应用平台" clearable>
					<Option v-for="item in osType" :value="item.id" :key="item.id">{{ item.name }}</Option>
				</Select>

				<!-- 应用列表 -->
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
					filterable
					v-model="filterSearch.creative_type_arr"
					placeholder="广告位类型"
					multiple
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
						<Option v-for="child in item.children" :key="child.value" :value="child.value">{{child.label}}</Option>
					</OptionGroup>
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
					<Option v-for="item in sspSlotList" :value="item.ssp_slot_id" :key="item.ssp_slot_id">{{item.ssp_slot_name}} (ID:{{item.ssp_slot_id}})</Option>
				</Select>

		  		<Input type="textarea" v-model.trim="filterSearch.ssp_slot_id_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位ID"/>

		  		<Input type="textarea" v-model.trim="filterSearch.ssp_slot_name_arr_textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量广告位名称"/>

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.ratio_arr_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量尺寸比例" />

				<Button type="primary" @click="doFilterList">查询</Button>
			</div>

			<!-- table数据 -->
			<div class="data-table console-table" v-show="navType === 'table'">
				<Table
					highlight-row
					stripe
					border
					:loading="tableLoadFlag"
					:columns="lastHourColumns"
					:data="trafficHourData"
					@on-sort-change="sortChange"
					@on-cell-click="onExpand"
					show-summary
					sum-text="总计"
					:summary-method="handleSummary"
					:height="tableHeight"
				>
					<!-- # index-->
					<template slot-scope="{ row, index }" slot="index">
						{{index + 1}}
					</template>

					<!-- 数据维度 start ******************-->
					<!-- 时间-->
					<template slot-scope="{ row }" slot="date">
						<p class="table_text">{{ row.date.substring(11, 19) }}</p>
					</template>
					<!--媒体简称/ID  -- 媒体名称 -->
					<template slot-scope="{ row }" slot="company_short_name">
						<p v-if="row.company_short_name" class="name-row-ellipsis" :title="row.company_short_name">{{ row.company_short_name }}</p>
						<p class="tip-row-line">ID: {{ row.ud_id }}</p>
					</template>
					<!-- 应用平台 -->
					<template slot-scope="{ row }" slot="os_type">
						<p class="table_text" v-if="row.os_type === 1">Android</p>
						<p class="table_text" v-if="row.os_type === 2">IOS</p>
					</template>
					<!--应用名称/ID-->
					<template slot-scope="{ row }" slot="app_name">
						<p v-if="row.app_name" class="name-row-ellipsis" :title="row.app_name">{{ row.app_name }}</p>
						<p class="tip-row-line">ID: {{ row.app_id }}</p>
					</template>
					<!--广告位名称/ID-->
					<template slot-scope="{ row }" slot="ssp_slot_name">
						<div class="control-flex">
							<div class="control-left">
								<p v-if="row.ssp_slot_name" class="name-row-ellipsis" :title="row.ssp_slot_name">{{ row.ssp_slot_name }}</p>
								<p class="tip-row-line">ID: {{ row.ssp_slot_id }}</p>
							</div>
							<a v-if="row.app_id && row.ssp_slot_id" class="control-right" target="_blank" :href="'/ssp/ad/config/' + row.ssp_slot_id">
								<Icon type="md-create"/>
								<div v-if="row.controlled > 0 && row.tag_ctrl > 0" class="control-img" title="控量+人群定向"><img src="~@/assets/image/kr.png"></div>
								<div v-else-if="row.controlled > 0 && row.tag_ctrl === 0" class="control-img" title="控量"><img src="~@/assets/image/k.png"></div>
								<div v-else-if="row.controlled === 0 && row.tag_ctrl > 0" class="control-img" title="人群定向"><img src="~@/assets/image/r.png"></div>
							</a>
						</div>
					</template>
					<!--外部广告位ID-->
					<template slot-scope="{ row }" slot="ex_slot_id">
						<p v-if="row.ex_slot_id" class="table_text" :title="row.ex_slot_id">{{ row.ex_slot_id }}</p>
						<p v-else class="table_text">-</p>
					</template>
					<!-- 素材尺寸比例 -->
					<template slot-scope="{ row }" slot="ssp_slot_ratio">
						<p class="table_text">{{row.ssp_slot_ratio}}</p>
					</template>
					<!--广告位类型-->
					<template slot-scope="{ row }" slot="ad_type">
						<p class="table_text">{{adTypeText(row.ad_type_id)}}-{{creativeIdText(row.creative_type)}}</p>
					</template>
					<!-- 数据维度 end   -------------------->

					<!-- 基本指标 start ******************-->
					<!--总广告请求pv-->
					<template slot-scope="{ row }" slot="total_req_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.total_req_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.total_req_pv_sequential >= 10, 'down_scale' : row.total_req_pv_sequential <= -10}]">
								{{row.total_req_pv_sequential}}%
								<Icon v-if="row.total_req_pv_sequential >= 10 || row.total_req_pv_sequential <= -10" :type="row.total_req_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.total_req_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--有效广告请求pv-->
					<template slot-scope="{ row }" slot="req_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.req_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.req_pv_sequential >= 10, 'down_scale' : row.req_pv_sequential <= -10}]">
								{{row.req_pv_sequential}}%
								<Icon v-if="row.req_pv_sequential >= 10 || row.req_pv_sequential <= -10" :type="row.req_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.req_pv_pre}}</div>
						</Tooltip>
					</template>
					<!-- 丢弃广告请求pv -->
					<template slot-scope="{ row }" slot="discard">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.discard}}</p>
							<p class="data_scale" :class="[{'up_scale': row.discard_sequential >= 10, 'down_scale' : row.discard_sequential <= -10}]">
								{{row.discard_sequential}}%
								<Icon v-if="row.discard_sequential >= 10 || row.discard_sequential <= -10" :type="row.discard_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.discard_pre}}</div>
						</Tooltip>
					</template>
					<!--有效广告请求uv-->
					<template slot-scope="{ row }" slot="req_uv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.req_uv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.req_uv_sequential >= 10, 'down_scale' : row.req_uv_sequential <= -10}]">
								{{row.req_uv_sequential}}%
								<Icon v-if="row.req_uv_sequential >= 10 || row.req_uv_sequential <= -10" :type="row.req_uv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.req_uv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告返回pv-->
					<template slot-scope="{ row }" slot="ret_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.ret_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.ret_pv_sequential >= 10, 'down_scale' : row.ret_pv_sequential <= -10}]">
								{{row.ret_pv_sequential}}%
								<Icon v-if="row.ret_pv_sequential >= 10 || row.ret_pv_sequential <= -10" :type="row.ret_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.ret_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告返回uv-->
					<template slot-scope="{ row }" slot="ret_uv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.ret_uv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.ret_uv_sequential >= 10, 'down_scale' : row.ret_uv_sequential <= -10}]">
								{{row.ret_uv_sequential}}%
								<Icon v-if="row.ret_uv_sequential >= 10 || row.ret_uv_sequential <= -10" :type="row.ret_uv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.ret_uv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告展现pv-->
					<template slot-scope="{ row }" slot="show_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.show_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.show_pv_sequential >= 10, 'down_scale' : row.show_pv_sequential <= -10}]">
								{{row.show_pv_sequential}}%
								<Icon v-if="row.show_pv_sequential >= 10 || row.show_pv_sequential <= -10" :type="row.show_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.show_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告展现uv-->
					<template slot-scope="{ row }" slot="show_uv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.show_uv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.show_uv_sequential >= 10, 'down_scale' : row.show_uv_sequential <= -10}]">
								{{row.show_uv_sequential}}%
								<Icon v-if="row.show_uv_sequential >= 10 || row.show_uv_sequential <= -10" :type="row.show_uv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.show_uv_pre}}</div>
						</Tooltip>
					</template>
					<!--扣量广告展现pv-->
					<template slot-scope="{ row }" slot="discount_show_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.discount_show_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.discount_show_pv_sequential >= 10, 'down_scale' : row.discount_show_pv_sequential <= -10}]">
								{{row.discount_show_pv_sequential}}%
								<Icon v-if="row.discount_show_pv_sequential >= 10 || row.discount_show_pv_sequential <= -10" :type="row.discount_show_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.discount_show_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告点击pv-->
					<template slot-scope="{ row }" slot="click_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.click_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.click_pv_sequential >= 10, 'down_scale' : row.click_pv_sequential <= -10}]">
								{{row.click_pv_sequential}}%
								<Icon v-if="row.click_pv_sequential >= 10 || row.click_pv_sequential <= -10" :type="row.click_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.click_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--广告点击uv-->
					<template slot-scope="{ row }" slot="click_uv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.click_uv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.click_uv_sequential >= 10, 'down_scale' : row.click_uv_sequential <= -10}]">
								{{row.click_uv_sequential}}%
								<Icon v-if="row.click_uv_sequential >= 10 || row.click_uv_sequential <= -10" :type="row.click_uv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.click_uv_pre}}</div>
						</Tooltip>
					</template>
					<!--加群点击数-->
					<template slot-scope="{ row }" slot="jc_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.jc_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.jc_pv_sequential >= 10, 'down_scale' : row.jc_pv_sequential <= -10}]">
								{{row.jc_pv_sequential}}%
								<Icon v-if="row.jc_pv_sequential >= 10 || row.jc_pv_sequential <= -10" :type="row.jc_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.jc_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--扣量广告点击pv-->
					<template slot-scope="{ row }" slot="discount_click_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.discount_click_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.discount_click_pv_sequential >= 10, 'down_scale' : row.discount_click_pv_sequential <= -10}]">
								{{row.discount_click_pv_sequential}}%
								<Icon v-if="row.discount_click_pv_sequential >= 10 || row.discount_click_pv_sequential <= -10" :type="row.discount_click_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.discount_click_pv_pre}}</div>
						</Tooltip>
					</template>
					<!--调起数-->
					<template slot-scope="{ row }" slot="dplsucc_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.dplsucc_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.dplsucc_pv_sequential >= 10, 'down_scale' : row.dplsucc_pv_sequential <= -10}]">
								{{row.dplsucc_pv_sequential}}%
								<Icon v-if="row.dplsucc_pv_sequential >= 10 || row.dplsucc_pv_sequential <= -10" :type="row.dplsucc_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.dplsucc_pv_pre}}</div>
						</Tooltip>
					</template>
					<!-- 下载完成量 -->
					<template slot-scope="{ row }" slot="complete_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.complete_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.complete_pv_sequential >= 10, 'down_scale' : row.complete_pv_sequential <= -10}]">
								{{row.complete_pv_sequential}}%
								<Icon v-if="row.complete_pv_sequential >= 10 || row.complete_pv_sequential <= -10" :type="row.complete_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.complete_pv_pre}}</div>
						</Tooltip>
					</template>
					<!-- 安装量 -->
					<template slot-scope="{ row }" slot="install_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.install_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.install_pv_sequential >= 10, 'down_scale' : row.install_pv_sequential <= -10}]">
								{{row.install_pv_sequential}}%
								<Icon v-if="row.install_pv_sequential >= 10 || row.install_pv_sequential <= -10" :type="row.install_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.install_pv_pre}}</div>
						</Tooltip>
					</template>
					<!-- 激活量 -->
					<template slot-scope="{ row }" slot="activate_pv">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.activate_pv}}</p>
							<p class="data_scale" :class="[{'up_scale': row.activate_pv_sequential >= 10, 'down_scale' : row.activate_pv_sequential <= -10}]">
								{{row.activate_pv_sequential}}%
								<Icon v-if="row.activate_pv_sequential >= 10 || row.activate_pv_sequential <= -10" :type="row.activate_pv_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.activate_pv_pre}}</div>
						</Tooltip>
					</template>
					<!-- 基本指标 end ------------------------>

					<!-- 效果指标 start ******************* -->
					<!-- 填充率 -->
					<template slot-scope="{ row }" slot="fill_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.fill_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.fill_rates_sequential >= 10, 'down_scale' : row.fill_rates_sequential <= -10}]">
								{{row.fill_rates_sequential}}%
								<Icon v-if="row.fill_rates_sequential >= 10 || row.fill_rates_sequential <= -10" :type="row.fill_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.fill_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 展现率 -->
					<template slot-scope="{ row }" slot="show_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.show_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.show_rates_sequential >= 10, 'down_scale' : row.show_rates_sequential <= -10}]">
								{{row.show_rates_sequential}}%
								<Icon v-if="row.show_rates_sequential >= 10 || row.show_rates_sequential <= -10" :type="row.show_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.show_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 点击率 -->
					<template slot-scope="{ row }" slot="ctr">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.ctr}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.ctr_sequential >= 10, 'down_scale' : row.ctr_sequential <= -10}]">
								{{row.ctr_sequential}}%
								<Icon v-if="row.ctr_sequential >= 10 || row.ctr_sequential <= -10" :type="row.ctr_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.ctr_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 调起率 -->
					<template slot-scope="{ row }" slot="dplsucc_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.dplsucc_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.dplsucc_rates_sequential >= 10, 'down_scale' : row.dplsucc_rates_sequential <= -10}]">
								{{row.dplsucc_rates_sequential}}%
								<Icon v-if="row.dplsucc_rates_sequential >= 10 || row.dplsucc_rates_sequential <= -10" :type="row.dplsucc_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.dplsucc_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 下载完成率 -->
					<template slot-scope="{ row }" slot="complete_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.complete_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.complete_rates_sequential >= 10, 'down_scale' : row.complete_rates_sequential <= -10}]">
								{{row.complete_rates_sequential}}%
								<Icon v-if="row.complete_rates_sequential >= 10 || row.complete_rates_sequential <= -10" :type="row.complete_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.complete_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 安装率 -->
					<template slot-scope="{ row }" slot="install_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.install_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.install_rates_sequential >= 10, 'down_scale' : row.install_rates_sequential <= -10}]">
								{{row.install_rates_sequential}}%
								<Icon v-if="row.install_rates_sequential >= 10 || row.install_rates_sequential <= -10" :type="row.install_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.install_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 激活率 -->
					<template slot-scope="{ row }" slot="activate_rates">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.activate_rates}}%</p>
							<p class="data_scale" :class="[{'up_scale': row.activate_rates_sequential >= 10, 'down_scale' : row.activate_rates_sequential <= -10}]">
								{{row.activate_rates_sequential}}%
								<Icon v-if="row.activate_rates_sequential >= 10 || row.activate_rates_sequential <= -10" :type="row.activate_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.activate_rates_pre}}%</div>
						</Tooltip>
					</template>
					<!-- 媒体eCPM -->
					<template slot-scope="{ row }" slot="ecpm_dev">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.ecpm_dev}}</p>
							<p class="data_scale" :class="[{'up_scale': row.ecpm_dev_sequential >= 10, 'down_scale' : row.ecpm_dev_sequential <= -10}]">
								{{row.ecpm_dev_sequential}}%
								<Icon v-if="row.ecpm_dev_sequential >= 10 || row.ecpm_dev_sequential <= -10" :type="row.ecpm_dev_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.ecpm_dev_pre}}</div>
						</Tooltip>
					</template>
					<!-- 媒体CPC -->
					<template slot-scope="{ row }" slot="cpc_dev">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.cpc_dev}}</p>
							<p class="data_scale" :class="[{'up_scale': row.cpc_dev_sequential >= 10, 'down_scale' : row.cpc_dev_sequential <= -10}]">
								{{row.cpc_dev_sequential}}%
								<Icon v-if="row.cpc_dev_sequential >= 10 || row.cpc_dev_sequential <= -10" :type="row.cpc_dev_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.cpc_dev_pre}}</div>
						</Tooltip>
					</template>
					<!-- 效果指标 end ------------------------>

					<!-- 收益指标 start ******************* -->
					<!-- 成本 -->
					<template slot-scope="{ row }" slot="spend">
						<Tooltip placement="right-start" :transfer="true">
							<p class="data_value">{{row.spend}}</p>
							<p class="data_scale" :class="[{'up_scale': row.spend_sequential >= 10, 'down_scale' : row.spend_sequential <= -10}]">
								{{row.spend_sequential}}%
								<Icon v-if="row.spend_sequential >= 10 || row.spend_sequential <= -10" :type="row.spend_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
							</p>
							<div slot="content" class="tool-size12">上一小时:{{row.spend_pre}}</div>
						</Tooltip>
					</template>

				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>

			<!-- echart数据 -->
			<div class="chart-card" v-show="navType === 'echart'">
				<t-echart ref="tEchart" :selectArr="echartArr"></t-echart>
			</div>

			<Drawer v-model="drawerModalFlag" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
				<div class="column_content">
					<RadioGroup class="private-check-card" type="button" v-model="column_active">
						<Radio :label="1">流量表格设置</Radio>
						<Radio :label="2">预算表格设置</Radio>
					</RadioGroup>
					<div class="col_detail">
						<div class="media_table" v-if="column_active === 1">
							<Row>
								<Col :span="16">
									<div class="col_title">可选择列</div>
									<div class="optional_detail">
										<!-- 数据维度 -->
										<div class="checkout_content">
											<div class="check_title">
												<Checkbox
													:value="parent_data_dimension_isAll"
													@click.prevent.native="parentDataDimSelectAll">数据维度</Checkbox>
											</div>
											<CheckboxGroup v-model="parentHasCheckData" @on-change="parentDataDimChange">
												<Checkbox class="option_check" v-for="item in parent_data_dimension" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 基本指标 -->
										<div class="checkout_content" v-show="parent_basic_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="parent_basic_indicators_isAll"
													@click.prevent.native="parentBasicIndiSelectAll">基本指标</Checkbox>
											</div>
											<CheckboxGroup v-model="parentHasCheckData" @on-change="parentBasicIndiChange">
												<Checkbox class="option_check" v-for="item in parent_basic_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 效果指标 -->
										<div class="checkout_content" v-show="parent_effect_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="parent_effect_indicators_isAll"
													@click.prevent.native="parentEffectIndiSelectAll">效果指标</Checkbox>
											</div>
											<CheckboxGroup v-model="parentHasCheckData" @on-change="parentEffectIndiChange">
												<Checkbox class="option_check" v-for="item in parent_effect_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 收益指标 -->
										<div class="checkout_content" v-show="parent_income_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="praent_income_indicators_isAll"
													@click.prevent.native="parentIncomeIndiSelectAll">收益指标</Checkbox>
											</div>
											<CheckboxGroup v-model="parentHasCheckData" @on-change="parentIncomeIndiChange">
												<Checkbox class="option_check" v-for="item in parent_income_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
									</div>
								</Col>
								<Col :span="8">
									<div class="col_title">已选择列</div>
									<div class="select_con">
										<Tag v-for="item in parentHasCheckData" :key="item" :name="item" closable @on-close="parentClose">{{item}}</Tag>
									</div>
								</Col>
							</Row>
						</div>
						<div class="budget_table" v-if="column_active === 2">
							<Row>
								<Col :span="16">
									<div class="col_title">可选择列</div>
									<div class="optional_detail">
										<!-- 预算-数据维度 -->
										<div class="checkout_content">
											<div class="check_title">
												<Checkbox
													:value="child_data_dimension_isAll"
													@click.prevent.native="childCheckAll1">数据维度</Checkbox>
											</div>
											<CheckboxGroup v-model="childHasCheckData" @on-change="childCheckAllChange1">
												<Checkbox class="option_check" v-for="item in child_data_dimension" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-基本指标 -->
										<div class="checkout_content" v-show="child_basic_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="child_basic_indicators_isAll"
													@click.prevent.native="childCheckAll2">基本指标</Checkbox>
											</div>
											<CheckboxGroup v-model="childHasCheckData" @on-change="childCheckAllChange2">
												<Checkbox class="option_check" v-for="item in child_basic_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-效果指标 -->
										<div class="checkout_content" v-show="child_effect_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="child_effect_indicators_isAll"
													@click.prevent.native="childCheckAll3">效果指标</Checkbox>
											</div>
											<CheckboxGroup v-model="childHasCheckData" @on-change="childCheckAllChange3">
												<Checkbox class="option_check" v-for="item in child_effect_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-收益指标 -->
										<div class="checkout_content" v-show="child_income_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="child_income_indicators_isAll"
													@click.prevent.native="childCheckAll4">收益指标</Checkbox>
											</div>
											<CheckboxGroup v-model="childHasCheckData" @on-change="childCheckAllChange4">
												<Checkbox class="option_check" v-for="item in child_income_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
									</div>
								</Col>
								<Col :span="8">
									<div class="col_title">已选择列</div>
									<div class="select_con">
										<Tag v-for="item in childHasCheckData" :key="item" :name="item" closable @on-close="childClose">{{item}}</Tag>
									</div>
								</Col>
							</Row>
						</div>
					</div>
				</div>
				<div class="drawer-footer">
					<Button @click="drawerModalFlag = false">取消</Button>
					<Button type="primary" :loading="submitClock" @click="submitData()">
						<span v-if="!submitClock">提交</span>
						<span v-else>提交中...</span>
					</Button>
				</div>
			</Drawer>
		</Card>
	</div>
</template>

<script>
import {dataType, filterBatchQuery} from '@/libs/util'
import { debounce, throttle, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import {setTableHeadApi, tableInfoApi, getDownLoadXls} from '@/api/common'
import {getAppList, getSspSlotAdList} from '@/api/ssp'
import { getSspHourData, getSspHourDataUrl } from '@/api/data'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { customColumn } from './custom-column.js'
import sourceTable from './source-table'
import tEchart from '../module/echart'
import {mapActions} from 'vuex'

export default {
	name: 'ssp-data-hour',
	mixins: [commonMixin, tableHeight, customColumn, inPageAccess],
	components: { sourceTable, tEchart},
	data() {
		return {
			sspTableId: 6, // 流量表格Id,
			dspTableId: 7, // 预算表格Id
			pageSize: 10, // 默认10条
			total_count: 0,
			currentPage: 1,

			datePickerOptions: { // 时间容器，禁止选择时间
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 00:00:00'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				}
			},
			filterTime: null, // 时间选择器
			datePickerTime: null, // 时间选择器
			filterSearch: { // 筛选条件
				os_type: null, // 筛选- 应用平台
				ud_id_arr: [], //筛选-媒体列表
				app_id_arr: [], // 筛选-应用ID
				creative_type_arr: [], // 广告类型ID多选
				start_date: null, // 时间选择器，默认开始时间 00：00：00
				end_date: null, // 时间选择器，默认结束时间 23：59：59
				order: null, // 排序字符串
				group: [], // 分组聚合字段
				ssp_slot_id_arr: [], // 广告位名称/ID(单个)  和  广告位ID(多个)查询  总的合集
				ssp_slot_name_arr: [], // 广告位名称
				ratio_arr: [], // 素材尺寸比例


				ssp_slot_id_arr_select: [], // 广告位名称/ID(单个)
				ssp_slot_id_textarea: null, // 广告位ID(多个)查询
				ssp_slot_name_arr_textarea: null, // 广告位名称（多个）查询
				ratio_arr_textarea: null // 素材尺寸比例textarea
			},

			groupByArr: [], // 聚合条件，最后下载使用

			navType: 'table', // nav切换, table / echart
			trafficHourData: [], // 表格数据
			trafficHourDataStatics: [], // 表格数据合计

			// 搜索联动使用
			catchSspAppList: [], // 缓存应用列表，在清空媒体下拉时重新赋值
			sspAppList: [], // 媒体列表
			sspAppLoad: false, // 媒体列表加载中

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中

			lastHourColumns: [], // 表格 - columns
			lastHourSourceColumns: [], //  子表格 - columns

			tableLoadFlag: true,

			drawerModalFlag: false, // 抽屉开关
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},

			// 抽屉 - 自定义
			parent_data_dimension_isAll: false, // 流量-数据维度是否全选
			parent_basic_indicators_isAll: false, // 流量-基本指标是否全选
			parent_effect_indicators_isAll: false, // 流量-效果指标是否全选
			praent_income_indicators_isAll: false, // 流量-收益指标是否全选

			child_data_dimension_isAll: false, // 预算-数据维度是否全选
			child_basic_indicators_isAll: false, // 预算-基本指标是否全选
			child_effect_indicators_isAll: false, // 预算-效果指标是否全选
			child_income_indicators_isAll: false, // 预算-收益指标是否全选

			column_active: 1, // 自定义列的模块的选择
			submitClock: false,

			flowArr: [], // 流量
			budgetArr: [], // 预算
			echartArr: [] // 数据表筛选列表
		}
	},
	computed: {
		osType() { // 应用平台
			return this.$store.getters.osType
		},
		adSceneData() { // 广告位类型 - 格式化
			let adStyleData = this.$store.state.app.adStyleData
			let adSceneData = this.$store.state.app.adSceneData
			adSceneData.map(item => {
				let children = []
				adStyleData.map(child => {
					if (child.parentId === item.id) {
						children.push({
							label: child.title,
							value: child.id
						})
					}
				})

				item['label'] = item.title
				item['children'] = children
			})
			return adSceneData
		}
	},
	created() {
		if (this._hasPageAccess()) {

			if (!this.$store.getters.getUserAllFields) {
				// 分权
				this.getReportTitle()
			} else {
				// admin账号，全部权限
				this.echartArr = this.$store.state.app.flowDataList.filter(item=>!!item.inDataSourceSelect && this.parentHasCheckData.includes(item.label))
			}

			this.initData()
			this.initLinkage() // 初始化联动
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true}) // search-line的高度
	},
	methods: {
		...mapActions([
			'tableInfoApi',
			'setTableHeadApi',
			'setTablePageApi'
		]),
		/**
		 * [initData 初始化加载数据]
		 * @return {[type]} [description]
		 */
		initData() {
			this.initDatePickerTime() // 初始化筛选时间
			this._tableInfoApi() // 获取抽屉 表头
			this.initMoniter() // 初始化加载图标
		},
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this.getSspAppList() // 应用列表列表
			this.getSspSlotList() // 广告位列表
		},
		/**
		 * [getReportTitle 权限表头]
		 * @return {[type]} [description]
		 */
		getReportTitle() {
			let flowFields = this.$store.getters.getUserSspFields // 流量权限
			let budgetFields = this.$store.getters.getUserDspFields // 预算权限
			let flowList = this.$store.state.app.flowDataList // 流量全部表
			let budgetList = this.$store.state.app.budgetDataList // 预算全部表

			// 流量
			let flowArr = []
			let _echartArr = [] // echart使用
			flowList.map(item => {
				if (flowFields.includes(item.key)) {
					flowArr.push(item.label)
				}

				if(flowFields.includes(item.key) && !!item.inDataSourceSelect) {
					_echartArr.push(item)
				}
			})
			this.flowArr = flowArr
			this.echartArr = _echartArr

			// 预算
			let budgetArr = []
			budgetList.map(item => {
				if (budgetFields.includes(item.key)) {
					budgetArr.push(item.label)
				}
			})
			this.budgetArr = budgetArr

			// 流量
			this.parent_basic_indicators = this.parent_basic_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.parent_effect_indicators = this.parent_effect_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.parent_income_indicators = this.parent_income_indicators.filter(item => flowArr.indexOf(item) > -1)
			let allFlow = flowArr.concat(this.parent_data_dimension)
			this.parentHasCheckData = this.parentHasCheckData.filter(item => allFlow.indexOf(item) > -1)

			// 预算
			this.child_basic_indicators = this.child_basic_indicators.filter(item => budgetArr.indexOf(item) > -1)
			this.child_effect_indicators = this.child_effect_indicators.filter(item => budgetArr.indexOf(item) > -1)
			this.child_income_indicators = this.child_income_indicators.filter(item => budgetArr.indexOf(item) > -1)
			let allBudget = budgetArr.concat(this.child_data_dimension)
			this.childHasCheckData = this.childHasCheckData.filter(item => allBudget.indexOf(item) > -1)
		},

		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1

			let _filter = this.filterSearch

			// 此处有容处理
			// 广告位ID查询
			// 1. 广告位Id多选和单选，最后统一按照 ssp_slot_id_arr 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_arr_select 两个筛选条件）
			let textSplitArr = filterBatchQuery({value: _filter.ssp_slot_id_textarea, type: 'number'})
			_filter.ssp_slot_id_arr = Array.from(new Set([...textSplitArr, ..._filter.ssp_slot_id_arr_select]))

			// 广告位名称
			_filter.ssp_slot_name_arr = filterBatchQuery({value: _filter.ssp_slot_name_arr_textarea})

			// 素材尺寸比例
			_filter.ratio_arr = filterBatchQuery({value: _filter.ratio_arr_textarea, ratio: true})

			this.initSspHourData()
			this.initMoniter()
		},

		/**
		 * [changePage 改变页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.initSspHourData()
		},

		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size

			this.setTablePageApi({table_id: this.sspTableId, page_num: size}).then(()=> {
				this.initSspHourData()
			})
		},

		/**
		 * [initMoniter echart数据]
		 * @return {[type]} [只以时间维度统计]
		 */
		initMoniter() {
			let _filter = this.filterSearch
			let params = {
				...this.getAxiosParams(),
				...{
					group: ['date'],
					order: _filter.order,
					start_date: _filter.start_date,
					end_date: _filter.end_date,
					page_num: 1,
					page_size: 0
				}
			}

			getSspHourData(params).then(res => {

				let obj = {}

				if (res.code === 200) {

					let _list = res.data.list.reverse()

					_list.map(item => {
						for (let key in item) {
							let temp = !!obj[key] ? obj[key] : []
							obj[key] = temp.concat(item[key])
						}
					})
				}

				this.$refs.tEchart.initData(obj)
			})
		},

		/**
		 * [initSspHourData 获取表格数据]
		 * @return {[type]} [description]
		 */
		async initSspHourData() {
			let _filter = this.filterSearch

			let params = {
				...this.getAxiosParams(),
				...{
					order: _filter.order,
					start_date: _filter.start_date,
					end_date: _filter.end_date,
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			let group = ['date'] // 默认添加时间维度

			// 添加维度
			this.parentHasCheckData.map(item => {

				if (item === '媒体名称') {
					group.push('ud_id')
				}

				if (item === '应用平台') {
					group.push('os_type')
				}

				if (item === '应用名称') {
					group.push('app_id')
				}

				if (item === '广告位名称') {
					group.push('ssp_slot_id')
				}

				if (item === '广告位类型') {
					group.push('creative_type')
				}
			})

 			params.group = group
 			this.groupByArr = [...group]

 			this.tableLoadFlag = true

 			const curRes = await getSspHourData(params) // 获取当前数据

			if (curRes.code === 200) {

				this.total_count = curRes.data.total_count // 总数

				// 空数据的情况下， 停止执行对比
				if (curRes.data.list.length === 0) {
					this.tableLoadFlag = false
					this.trafficHourData = curRes.data.list
					return
				}

 				this.trafficHourDataStatics = this.formatThouStatics([curRes.data.total]) // 合计.千分位格式化

				// 遍历前一个数据列表，取出最小时间和最大时间，作为下一次入参
				let _tempArr = [...curRes.data.list]

				_tempArr.sort(function(a, b) {
					return new Date(a.date.replace(new RegExp('-', 'gm'), '/')).getTime() - new Date(b.date.replace(new RegExp('-', 'gm'), '/')).getTime()
				})

				let _start_date = formatDate(new Date(_tempArr[0].date.replace(new RegExp('-', 'gm'), '/')).getTime() - 60 * 60 * 1000, 'yyyy-MM-dd HH:mm:ss')
				let _end_date = formatDate(new Date(_tempArr[_tempArr.length - 1].date.replace(new RegExp('-', 'gm'), '/')).getTime() - 60 * 60 * 1000, 'yyyy-MM-dd HH:mm:ss')


				// 获取前一小时数据
				let preParams = { ...this.getAxiosParams(),
					...{
						page_num: 1,
						page_size: 0,
						group: group,
						start_date: _start_date,
						end_date: _end_date
					}
				}

				const preRes = await getSspHourData(preParams) // 获取前一小时的数据

				this.tableLoadFlag = false

				if (preRes.code === 200) {
					this.tableDataMatch(curRes.data.list, preRes.data.list, group)
				}
			} else {
				this.tableLoadFlag = false
			}
		},
		/**
		 * [getAxiosParams 获取下载和列表的url参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {}

			// 应用平台
			!!_filter.os_type && (params.os_type = _filter.os_type)

			// 媒体列表
			!!_filter.ud_id_arr.length && (params.ud_id_arr = _filter.ud_id_arr)

			// 应用ID
			!!_filter.app_id_arr.length && (params.app_id_arr = _filter.app_id_arr)

			// 广告类型ID多选
			!!_filter.creative_type_arr.length && (params.creative_type_arr = _filter.creative_type_arr)

			// 广告位ID数组
			!!_filter.ssp_slot_id_arr.length && (params.ssp_slot_id_arr = _filter.ssp_slot_id_arr)

			// 广告位名称
			!!_filter.ssp_slot_name_arr.length && (params.ssp_slot_name_arr = _filter.ssp_slot_name_arr)

			// 素材尺寸比例
			!!_filter.ratio_arr.length && (params.ratio_arr = _filter.ratio_arr)

			return params
		},
		/**
		 * [formatThouStatics 总计 千分位格式化]
		 * @param  {[type]} curArr [description]
		 * @param  {[type]} preArr [description]
		 * @param  {[type]} group [作为聚合条件]
		 * @return {[type]}		[description]
		 */
		formatThouStatics(curArr) {
			// 需要计算千分位的数据
			let _calcArr = []
			this.lastHourColumns.map(item=> {
				if(!item.noNeedCalcThou) {
					_calcArr.push(item.slot)
				}
			})

			// 转换千分位
			let tempArr = []
			curArr.map(item=> {
				for (let key in item) {
					if (_calcArr.includes(key) && dataType(item[key]) === 'number') {
						item[key] = this.number2Thousand(item[key])
					}
				}

				tempArr.push(item)
			})

			return tempArr
		},

		/**
		 * [handleSummary 合计计算]
		 * @param  {[type]} options.columns [description]
		 * @param  {[type]} options.data	[description]
		 * @return {[type]}				 [description]
		 */
		handleSummary({columns, data}) {
			let sumData = this.trafficHourDataStatics[0]
			let sums = {}

			columns.forEach((column, index) => {
				let key = column.slot || column.type

				if (key === 'date') {
					sums[key] = {
						key,
						value: '合计'
					}
					return
				}

				sums[key] = {
					key,
					value: (column.title && column.title.indexOf('率')) > -1 ? `${sumData[key]}%` : (!!column.noNeedCalcThou ? '-' : sumData[key])
				}

			})

			return sums
		},

		/**
		 * [tableDataMatch 当前数据和前一小时的数据匹配]
		 * @param  {[type]} this.parentHasCheckData [description]
		 * @param  {[type]} preArr [description]
		 * @param  {[type]} group [作为聚合条件]
		 * @return {[type]}		[description]
		 */
		tableDataMatch(curArr, preArr, group) {
			// 唯一性匹配条件
			// 1. 根据group匹配数据

			// 剔除日期
			if (group.indexOf('date') > -1) {
				group.splice(group.indexOf('date'), 1)
			}

			// 根据group匹配前一日 start
			let juadgArr = []
			group.map(g => {
				juadgArr.push(`item['${g}'] === child['${g}']`)
			})

			let tempArr = []
			curArr.map(item => {

				item['pre'] = {}

				preArr.map(child => {
					let preTime = formatDate(new Date(child.date.replace(new RegExp('-', 'gm'), '/')).getTime() + 60 * 60 * 1000, 'yyyy-MM-dd HH:mm:ss')
					if (item.date === preTime && (eval(juadgArr.join(' && ')) === undefined ? true : eval(juadgArr.join(' && ')))) {
						item['pre'] = child
					}
				})
				tempArr.push(item)
			})
			// 根据group匹配前一日 end

			// 需要计算千分位的数据
			let _calcArr = []
			this.lastHourColumns.map(item=> {
				if(!item.noNeedCalcThou) {
					_calcArr.push(item.slot)
				}
			})

			// 耦合前一小时的数据
			tempArr.map(item=> {
				for (let key in item) {
					if (_calcArr.includes(key) && dataType(item[key]) === 'number') {
						//初始设置为0
						item[key + '_pre'] = 0
						item[key + '_sequential'] = 0
						let curVal = item[key]

						if (!!item.pre) {
							let preVal = item['pre'][key]
							item[key] = this.number2Thousand(item[key])
							item[key + '_pre'] = this.number2Thousand(item['pre'][key])
							item[key + '_sequential'] = this.calcSequential(curVal, preVal)
						}
					}
				}
			})

			this.trafficHourData = tempArr // 列表
		},

		/**
		 * [downStatement 下载流量表格]
		 * @return {[type]} [description]
		 */
		downStatement() {

			let _filter = this.filterSearch

			let params = {
				...this.getAxiosParams(),
				...{
					group: this.groupByArr,
					start_date: _filter.start_date,
					end_date: _filter.end_date,
					page_size: this.total_count,
					page_num: 1
				}
			}

			let down = {
				method: 'GET',
				url: getSspHourDataUrl(params)
			}

			this.submitClock = true

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = `${this.datePickerTime}流量数据(时).xlsx`
					createObjectURL(res.data.url, filename)
				}

				this.submitClock = false
			})
		},
		/**
		 * [getTimeData 筛选-设置时间的默认值 - 默认当天]
		 * @return {[type]} [description]
		 */
		initDatePickerTime() {
			const localDate = formatDate(new Date(), 'yyyy-MM-dd') // 当前天

			this.datePickerTime = localDate
			this.filterSearch.start_date = `${localDate} 00:00:00`
			this.filterSearch.end_date = `${localDate} 23:59:59`
		},

		/**
		 * [datePickerChange 时间选择器发生变化]
		 * @param  {[type]} time [description]
		 * @return {[type]}	  [description]
		 */
		datePickerChange(time) {
			this.datePickerTime = time
			this.concatFilterData()
		},
		/**
		 * [timeChange 时间发生变化时触发]
		 * @return {[type]} [description]
		 */
		timeChange(time) {
			this.filterTime = time.slice(0, 2)
			this.concatFilterData()
		},
		/**
		 * [concatFilterData 合并筛选时间]
		 * @return {[type]} [description]
		 */
		concatFilterData() {
			let time = this.datePickerTime
			this.filterSearch.start_date = !!this.filterTime ? `${time} ${this.filterTime}:00:00` : `${time} 00:00:00`
			this.filterSearch.end_date = !!this.filterTime ? `${time} ${this.filterTime}:59:59` : `${time} 23:59:59`
		},
		/**
		 * [adTypeText 获取广告场景]
		 * @param  {[type]} id [id=>text]
		 * @return {[type]}	[description]
		 */
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		/**
		 * [creativeId2Text 根据createId 找到对应 text]
		 * @param  {[type]} id [description]
		 * @return {[type]}	[description]
		 */
		creativeId2Text(id) {
			let _arr = this.$store.state.app.adStyleData;
			let result = _arr.filter(item=> item.id == id)
			return result[0] ? result[0].title : ''
		},

		/**
		 * [getParentColumns 设置父级 数据表格的列]
		 * @return {[type]} [description]
		 */
		getParentColumns () {
			const ColumnList = [
				{title: '#', width: 36, key:'index', slot:'index', align: 'center', noNeedCalcThou: true},
				{
					type: 'expand',
					key: 'expand',
					noNeedCalcThou: true,
					width: 25,
					render: (h, params) => {
						return h(sourceTable, {
							props: {
								row: params.row,
								curDate: params.row.date,
								hasDeleteSourceRole: this._isShow_('deleteSource'), // 是否有删除子表的权限
								childColumnsData: this.lastHourSourceColumns,
								childHasCheckData: this.childHasCheckData
							}
						})
					}
				},

				//数据维度
				{title: '时间', slot: 'date', key:'date', width: 80, sortable: 'custom', noNeedCalcThou: true},
				{title: '媒体名称', header: '媒体名称/ID', slot: 'company_short_name', key:'company_short_name', minWidth: 100, noNeedCalcThou: true},
				{title: '应用平台', slot: 'os_type', key:'os_type', width: 80, noNeedCalcThou: true},
				{title: '应用名称', header: '应用名称/ID', slot: 'app_name', key:'app_name', minWidth: 120, noNeedCalcThou: true},
				{title: '广告位名称', header: '广告位名称/ID', slot: 'ssp_slot_name', key:'ssp_slot_name', width: 200, noNeedCalcThou: true},
				{title: '外部广告位ID', slot: 'ex_slot_id', key:'ex_slot_id', width: 230, noNeedCalcThou: true},
				{title: '素材尺寸比例', slot: 'ssp_slot_ratio', key:'ssp_slot_ratio', width: 100, noNeedCalcThou: true},
				{title: '广告位类型', slot: 'ad_type', key:'ad_type', width: 200, noNeedCalcThou: true},

				// 基本指标
				{title: '总广告请求pv', slot: 'total_req_pv', key:'total_req_pv', minWidth: 120, sortable: 'custom'},
				{title: '有效广告请求pv', slot: 'req_pv', key:'req_pv', minWidth: 130, sortable: 'custom'},
				{title: '丢弃广告请求pv', slot: 'discard', key:'discard', minWidth: 130, sortable: 'custom'},
				{title: '有效广告请求uv', slot: 'req_uv', key:'req_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回pv', slot: 'ret_pv', key:'ret_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告返回uv', slot: 'ret_uv', key:'ret_uv', minWidth: 120, sortable: 'custom'},
				{title: '广告展现pv', slot: 'show_pv', key:'show_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告展现uv', slot: 'show_uv', key:'show_uv', minWidth: 120, sortable: 'custom'},
				{title: '扣量广告展现pv', slot: 'discount_show_pv', key:'discount_show_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击pv', slot: 'click_pv', key:'click_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告点击uv', slot: 'click_uv', key:'click_uv', minWidth: 120, sortable: 'custom'},
				{title: '扣量广告点击pv', slot: 'discount_click_pv', key:'discount_click_pv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', key: 'jc_pv', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', slot: 'dplsucc_pv', key:'dplsucc_pv', minWidth: 130, sortable: 'custom'},
				{title: '下载完成量', slot: 'complete_pv', key:'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', slot: 'install_pv', key:'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', slot: 'activate_pv', key:'activate_pv', minWidth: 130, sortable: 'custom'},

				// 效果指标
				{title: '填充率', slot: 'fill_rates', key:'fill_rates', minWidth: 90, sortable: 'custom'},
				{title: '展现率', slot: 'show_rates', key:'show_rates', minWidth: 90, sortable: 'custom'},
				{title: '点击率', slot: 'ctr', key:'ctr', minWidth: 90, sortable: 'custom'},
				{title: '调起率', slot: 'dplsucc_rates', key:'dplsucc_rates', minWidth: 90, sortable: 'custom'},
				{title: '下载完成率', slot: 'complete_rates', key:'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', slot: 'install_rates', key:'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', slot: 'activate_rates', key:'activate_rates', minWidth: 130, sortable: 'custom'},
		  		{title: '媒体eCPM', slot: 'ecpm_dev', key:'ecpm_dev', minWidth: 100, sortable: 'custom'},
		  		{title: '媒体CPC', slot: 'cpc_dev', key:'cpc_dev', minWidth: 90, sortable: 'custom'},

				// 收益指标
				{title: '成本', slot: 'spend', key:'spend', minWidth: 90, sortable: 'custom'},
			]

			// 筛选表格
			let resultArr = []
			let extraMust = ['date', 'index'] // 额外必须存在的字段

			ColumnList.map(item => {
				// 时间不可取消
				if((item.type === 'expand' && this._isShow_('viewSource')) || extraMust.includes(item.slot) || this.parentHasCheckData.indexOf(item.title) > -1) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})

			if (!this.parentHasCheckData.includes('广告位名称')) {
				resultArr.splice(1, 1)
			}

			this.lastHourColumns = resultArr
		},
		/**
		 * [getChildColumns 设置父级 设置子表格的列]
		 * @return {[type]} [description]
		 */
		getChildColumns () {
			const ColumnList = [
				//数据维度
				{title: '时间', slot: 'date', width: 80,  sortable: 'custom', noNeedCalcThou: true},
				{title: '公司/账号名称', slot: 'company_name', minWidth: 120, noNeedCalcThou: true},
				{title: '产品名称', key: 'dsp_product_name', slot: 'dsp_product_name', minWidth: 180, noNeedCalcThou: true},
				{title: '预算位名称', slot: 'dsp_slot_name', width: 200, noNeedCalcThou: true},
				{title: '素材尺寸比例', slot: 'dsp_slot_ratio', key:'dsp_slot_ratio', width: 100, minWidth: 100, noNeedCalcThou: true},
				{title: '广告位类型', slot: 'ad_type', width: 200, noNeedCalcThou: true},

				// 基本指标
				{title: '有效广告请求pv', slot: 'req_pv', minWidth: 120, sortable: 'custom'},
				{title: '有效广告请求uv', slot: 'req_uv', minWidth: 120, sortable: 'custom'},
				{title: '广告返回pv', slot: 'ret_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告返回uv', slot: 'ret_uv', minWidth: 120, sortable: 'custom'},
				{title: '广告展现pv', slot: 'show_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告展现uv', slot: 'show_uv', minWidth: 120, sortable: 'custom'},
				{title: '扣量广告展现pv', slot: 'discount_show_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告点击pv', slot: 'click_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告点击uv', slot: 'click_uv', minWidth: 120, sortable: 'custom'},
				{title: '扣量广告点击pv', slot: 'discount_click_pv', minWidth: 120, sortable: 'custom'},
				{title: '调起数', slot: 'dplsucc_pv', minWidth: 120, sortable: 'custom'},
				{title: '广告展现占比', slot: 'show_pv_rates', minWidth: 120, sortable: 'custom'},
				{title: '广告点击占比', slot: 'click_pv_rates', minWidth: 120, sortable: 'custom'},
				{title: '加群点击数', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '下载完成量', slot: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', slot: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', slot: 'activate_pv', minWidth: 130, sortable: 'custom'},

				// 效果指标
				{title: '填充率', slot: 'fill_rates', minWidth: 90, sortable: 'custom'},
				{title: '展现率', slot: 'show_rates', minWidth: 90, sortable: 'custom'},
				{title: '点击率', slot: 'ctr', minWidth: 90, sortable: 'custom'},
				{title: '调起率', slot: 'dplsucc_rates', minWidth: 90, sortable: 'custom'},
				{title: '下载完成率', slot: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', slot: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', slot: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: '媒体eCPM', slot: 'ecpm_dev', minWidth: 100, sortable: 'custom'},
		  		{title: '媒体CPC', slot: 'cpc_dev', minWidth: 90, sortable: 'custom'},

				// 收益指标
				{title: '成本', slot: 'spend', minWidth: 90, sortable: 'custom'},
			]

			// 筛选表格
			let resultArr = []
			ColumnList.map(item => {
				if(item.slot === 'date' || this.childHasCheckData.indexOf(item.title) > -1) {
					resultArr.push(item)
				}
			})

			this.lastHourSourceColumns = resultArr
		},

		// 表格的排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.filterSearch.order = col.column.slot
				this.currentPage = 1
				this.initSspHourData()
			} else if (col.order === 'desc') {
				this.filterSearch.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.initSspHourData()
			}
		},

		// 获取广告样式
		creativeIdText(id) {
			let _arr = this.$store.state.app.adStyleData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},

		/**
		 * [_tableInfoApi 获取媒体公司数据]
		 * @return {[type]} [description]
		 */
		async _tableInfoApi() {
			let storeUser = this.$store.state.user;
			let resArr = storeUser.pageCommonMemory ? storeUser.pageCommonMemory : await this.tableInfoApi()

			this.pageSize = resArr[`table_page_page_${this.sspTableId}`] || 10

			// 流量表格 - 设置  -  主要是用来判断是否全选
			let sspKey = resArr[`table_head_head_${this.sspTableId}`]
			if (!!sspKey) {
				let curArr = sspKey.split(',')
				// 流量
				if (!this.$store.getters.getUserAllFields) {
					let allFlow = this.flowArr.concat(this.parent_data_dimension)
					this.parentHasCheckData = curArr.filter(item => allFlow.indexOf(item) > -1)
				} else {
					this.parentHasCheckData = curArr
				}
			}

			this.trafficJudgeAll() // 判断流量是否全选

			// 预算表格 - 设置 - 主要是用来判断是否全选
			let dspKey = resArr[`table_head_head_${this.dspTableId}`]
			if (!!dspKey) {
				let curArr = dspKey.split(',')
				// 预算
				if (!this.$store.getters.getUserAllFields) {
					let allBudget = this.budgetArr.concat(this.child_data_dimension)
					this.childHasCheckData = curArr.filter(item => allBudget.indexOf(item) > -1)
				} else {
					this.childHasCheckData = curArr
				}
			}

			this.budgeJudgeAll() // 判断预算是否全选

			this.getParentColumns() // 初始化表格数据
			this.getChildColumns() // 初始化子表格数据
			this.initSspHourData() // 初始化获取table数据
		},
		// 这个循环是为了每次只能展开一个，其他自动收起，不需要可以去掉
		onExpand(row, column, data, event) {
			if (column.type === 'expand') {
				let curArr = [...this.trafficHourData]
				curArr.map((item, index)=> {
					if(index === row._index) {
						item._expanded = !item._expanded
					} else {
						item._expanded = false
					}
				})
				this.trafficHourData = curArr
			}
		},
		/**
		 * [trafficJudgeAll 流量判断是否全选]
		 * @return {[type]} [description]
		 */
		trafficJudgeAll() {
			this.parentHasCheckData = [...new Set(this.parentHasCheckData)]

			// 接下来判断维度是否全选
			let data_dimension_arr = [] // 数据维度
			let basic_indicators = [] // 基本指标
			let effect_indicators = [] // 效果指标
			let income_indicators = [] // 收益指标
			this.parentHasCheckData.map(item => {

				// 流量表格 - 数据维度
				if (this.parent_data_dimension.indexOf(item) > -1) {
					data_dimension_arr.push(item)
				}

				// 流量表格 - 基本指标
				if (this.parent_basic_indicators.indexOf(item) > -1) {
					basic_indicators.push(item)
				}

				if (this.parent_effect_indicators.indexOf(item) > -1) {
					effect_indicators.push(item)
				}

				if (this.parent_income_indicators.indexOf(item) > -1) {
					income_indicators.push(item)
				}
			})

			this.parent_data_dimension_isAll = data_dimension_arr.length === this.parent_data_dimension.length // 流量-数据维度
			this.parent_basic_indicators_isAll = basic_indicators.length === this.parent_basic_indicators.length // 流量-基本指标
			this.parent_effect_indicators_isAll = effect_indicators.length === this.parent_effect_indicators.length // 流量-效果指标
			this.praent_income_indicators_isAll = income_indicators.length === this.parent_income_indicators.length // 流量-收益指标
		},
		/**
		 * [budgeJudgeAll 判断预算是否全选]
		 * @return {[type]} [description]
		 */
		budgeJudgeAll() {
			this.childHasCheckData = [...new Set(this.childHasCheckData)]
			// 接下来判断维度是否全选
			let data_dimension_arr = [] // 数据维度
			let basic_indicators = [] // 基本指标
			let effect_indicators = [] // 效果指标
			let income_indicators = [] // 收益指标
			this.childHasCheckData.map(item => {
				// 流量表格 - 数据维度
				if (this.child_data_dimension.indexOf(item) > -1) {
					data_dimension_arr.push(item)
				}

				// 流量表格 - 基本指标
				if (this.child_basic_indicators.indexOf(item) > -1) {
					basic_indicators.push(item)
				}

				if (this.child_effect_indicators.indexOf(item) > -1) {
					effect_indicators.push(item)
				}

				if (this.child_income_indicators.indexOf(item) > -1) {
					income_indicators.push(item)
				}
			})

			this.child_data_dimension_isAll = data_dimension_arr.length === this.child_data_dimension.length // 流量-数据维度
			this.child_basic_indicators_isAll = basic_indicators.length === this.child_basic_indicators.length // 流量-基本指标
			this.child_effect_indicators_isAll = effect_indicators.length === this.child_effect_indicators.length // 流量-效果指标
			this.child_income_indicators_isAll = income_indicators.length === this.child_income_indicators.length // 流量-收益指标
		},
		/**
		 * [parentDataDimSelectAll 流量表格  数据维度 选择全部]
		 * @return {[type]} [description]
		 */
		parentDataDimSelectAll() {
			let resultArr = this.parent_data_dimension_isAll ? this.parentHasCheckData.filter(x => !this.parent_data_dimension.includes(x)) : [...this.parentHasCheckData, ...this.parent_data_dimension]

			this.parentHasCheckData = [...new Set(resultArr)]
			this.parent_data_dimension_isAll = !this.parent_data_dimension_isAll
		},
		/**
		 * [parentDataDimChange 流量表格  数据维度 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		parentDataDimChange(data) {
			let resultArr = data.filter(item => this.parent_data_dimension.indexOf(item) > -1)

			this.parent_data_dimension_isAll = resultArr.length === this.parent_data_dimension.length
		},
		/**
		 * [parentBasicIndiSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		parentBasicIndiSelectAll() {
			let resultArr = this.parent_basic_indicators_isAll ? this.parentHasCheckData.filter(x => !this.parent_basic_indicators.includes(x)) : [...this.parentHasCheckData, ...this.parent_basic_indicators]

			this.parentHasCheckData = [...new Set(resultArr)]
			this.parent_basic_indicators_isAll = !this.parent_basic_indicators_isAll
		},
		/**
		 * [parentBasicIndiChange 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		parentBasicIndiChange(data) {
			let resultArr = data.filter(item => this.parent_basic_indicators.indexOf(item) > -1)

			this.parent_basic_indicators_isAll = resultArr.length === this.parent_basic_indicators.length
		},
		/**
		 * [parentEffectIndiSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		parentEffectIndiSelectAll() {
			let resultArr = this.parent_effect_indicators_isAll ? this.parentHasCheckData.filter(x => !this.parent_effect_indicators.includes(x)) : [...this.parentHasCheckData, ...this.parent_effect_indicators]

			this.parentHasCheckData = [...new Set(resultArr)]
			this.parent_effect_indicators_isAll = !this.parent_effect_indicators_isAll
		},
		/**
		 * [parentEffectIndiChange 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		parentEffectIndiChange(data) {
			let resultArr = data.filter(item => this.parent_effect_indicators.indexOf(item) > -1)

			this.parent_effect_indicators_isAll = resultArr.length === this.parent_effect_indicators.length
		},
		/**
		 * [parentIncomeIndiSelectAll 流量表格  收益指标的筛选 选择全部]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		parentIncomeIndiSelectAll() {
			let resultArr = this.praent_income_indicators_isAll ? this.parentHasCheckData.filter(x => !this.parent_income_indicators.includes(x)) : [...this.parentHasCheckData, ...this.parent_income_indicators]

			this.parentHasCheckData = [...new Set(resultArr)]
			this.praent_income_indicators_isAll = !this.praent_income_indicators_isAll
		},
		/**
		 * [parentIncomeIndiChange 流量表格  收益指标的筛选 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		parentIncomeIndiChange(data) {
			let resultArr = data.filter(item => this.parent_income_indicators.indexOf(item) > -1)

			this.praent_income_indicators_isAll = resultArr.length === this.parent_income_indicators.length
		},
		// 流量表格的删除
		parentClose (event, name) {
			const index = this.parentHasCheckData.indexOf(name)
			this.parentHasCheckData.splice(index, 1)
		},
		// 预算表格的全选
		// 数据维度的筛选
		childCheckAll1() {
			let resultArr = this.child_data_dimension_isAll ? this.childHasCheckData.filter(x => !this.child_data_dimension.includes(x)) : [...this.childHasCheckData, ...this.child_data_dimension]

			this.childHasCheckData = [...new Set(resultArr)]
			this.child_data_dimension_isAll = !this.child_data_dimension_isAll
		},
		childCheckAllChange1(data) {
			let resultArr = data.filter(item => this.child_data_dimension.indexOf(item) > -1)

			this.child_data_dimension_isAll = resultArr.length === this.child_data_dimension.length
		},
		// 基本指标的筛选
		childCheckAll2() {
			let resultArr = this.child_basic_indicators_isAll ? this.childHasCheckData.filter(x => !this.child_basic_indicators.includes(x)) : [...this.childHasCheckData, ...this.child_basic_indicators]

			this.childHasCheckData = [...new Set(resultArr)]
			this.child_basic_indicators_isAll = !this.child_basic_indicators_isAll
		},
		childCheckAllChange2(data) {
			let resultArr = data.filter(item => this.child_basic_indicators.indexOf(item) > -1)

			this.child_basic_indicators_isAll = resultArr.length === this.child_basic_indicators.length
		},
		// 基本指标的筛选
		childCheckAll3() {
			let resultArr = this.child_effect_indicators_isAll ? this.childHasCheckData.filter(x => !this.child_effect_indicators.includes(x)) : [...this.childHasCheckData, ...this.child_effect_indicators]

			this.childHasCheckData = [...new Set(resultArr)]
			this.child_effect_indicators_isAll = !this.child_effect_indicators_isAll
		},
		childCheckAllChange3(data) {
			let resultArr = data.filter(item => this.child_effect_indicators.indexOf(item) > -1)

			this.child_effect_indicators_isAll = resultArr.length === this.child_effect_indicators.length
		},
		// 收益指标的筛选
		childCheckAll4() {
			let resultArr = this.child_income_indicators_isAll ? this.childHasCheckData.filter(x => !this.child_income_indicators.includes(x)) : [...this.childHasCheckData, ...this.child_income_indicators]

			this.childHasCheckData = [...new Set(resultArr)]
			this.child_income_indicators_isAll = !this.child_income_indicators_isAll
		},
		childCheckAllChange4(data) {
			let resultArr = data.filter(item => this.child_income_indicators.indexOf(item) > -1)

			this.child_income_indicators_isAll = resultArr.length === this.child_income_indicators.length
		},
		// 预算表格的删除
		childClose (event, name) {
			const index = this.childHasCheckData.indexOf(name)
			this.childHasCheckData.splice(index, 1)

			this.budgetJudgeAll()
		},
		/**
		 * [submitData 自定义列表 提交数据, 需要同时提交两个自定义表单]
		 * @return {[type]} [description]
		 */
		submitData() {
			this.submitClock = true

			// 流量表格参数
			let traffic_params = {
				table_id: this.sspTableId,
				select_str: this.parentHasCheckData.join(',')
			}

			// 预算表格参数
			let budget_params = {
				table_id: this.dspTableId,
				select_str: this.childHasCheckData.join(',')
			}

			Promise.all([this.setTableHeadApi(traffic_params), this.setTableHeadApi(budget_params)]).then(res => {
				this.submitClock = false
				this.drawerModalFlag = false

				this.tableInfoApi().then(() => { // 重置一次页面公共记忆
					this._tableInfoApi() // 重新获取数据
				})
			})
		},

		/**
		 * [calcSequential 计算环比]
		 * @param  {[type]} curVal [description]
		 * @param  {[type]} preVal [description]
		 * @return {[type]}		[description]
		 */
		calcSequential(curVal, preVal) {
			if (!!curVal && !!preVal) {
				let result = Math.round(((curVal - preVal) / Math.abs(preVal)) * 100)
				return Math.abs(result) < 1 ? 0 : result
			} else {
				return 0
			}
		},
		/**
 		 * [number2Thousand 数字转千分位]
 		 * @param  {[type]} val [description]
 		 * @return {[type]}	 [description]
 		 */
		number2Thousand(number) {
			return number2Thousand(number)
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText (count) {
			return `+ ${count}`
		},


		/********************************************
		*↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
		********************************************/
		/**
		 * [searchSspApp 应用列表-搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
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
		 * @return {[type]}	   [description]
		 */
		appQueryChange(query) {
			if(!query) {
				this.sspAppList = [...this.catchSspAppList]
			}
		},
		/**
		 * [getSspAppList 应用列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getSspAppList: debounce(function(query) {
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
		 * @return {[type]}	   [description]
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
		 * @return {[type]}	   [description]
		 */
		sspSlotQueryChange(query) {
			if(!query) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
		},
		/**
		 * [getSspSlotList 广告位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getSspSlotList: debounce(function(query) {

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
		 * 选择媒体
		 */
		'filterSearch.ud_id_arr': {
			handler: function(val) {
				this.getSspAppList()
				this.getSspSlotList()
			}
		},
		/**
		 * 选择应用
		 */
		'filterSearch.app_id_arr': {
			handler: function(val) {
				this.getSspSlotList()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
.tool-size12
	font-size: 12px
.console-table
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height: 32px
.chart-card
	width: 100%
</style>
