<template>
	<Card :bordered="false" dis-hover class="page-main">
		<div class="page-title clearfix">
			<h2>预算数据</h2>
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
				<Tooltip placement="bottom-end">
					<Button class="host" type="text" @click="columnDrawer = true,column_active =1">自定义列
						<Icon type="md-help-circle"></Icon>
					</Button>
					<div slot="content">
						<p class="top_text">自定义表格表头，并永久记忆</p>
						<p class="top_text">列只有选择预算位名称，才可展开查看其</p>
						<p class="top_text">关联广告位的数据</p>
					</div>
				</Tooltip>
				<Button v-if="_isShow_('download')" @click="downStatement" :loading="downClock" class="host" type="text" ghost>
					<i class="iconfont icon-download"></i>
					<span v-if="!downClock">{{!downClock ? '下载报表' : '下载中...'}}</span>
				</Button>
			</div>
		</div>
		<div class="search-line" ref="search-line">
			<DatePicker
				class="i-margin-right-11 i-width-date mar-bot-10"
				:transfer="true"
				:value="search_time"
				type="daterange"
				format="yyyy-MM-dd"
				:options="options1"
				@on-change="filterByDate"
				:clearable="false"
			/>

			<Select
				class="i-margin-right-11 i-width-select mar-bot-10"
				multiple
				filterable
				v-model="search.dsp_company_id_arr"
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
				placeholder="公司名称/ID"
			>
				<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
			</Select>

			<Select
				class="i-margin-right-11 i-width-select mar-bot-10"
				filterable
				v-model="search.creative_type_arr"
				placeholder="广告位类型"
				multiple
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
			>
				<OptionGroup v-for="item in adSceneData" :key="item.id" :label="item.title">
					<Option v-for="child in item.children" :key="child.value" :value="child.value">{{child.label}}</Option>
				</OptionGroup>
			</Select>

			<Select
				class="i-margin-right-11 i-width-select i-select-remote"
				v-model="dsp_slot_id_arr"
				filterable
				clearable
				multiple
				:remote-method="searchDspSlot"
				:loading="dspSlotLoad"
				 @on-change="clearSearchDspSlot"
				:on-query-change="dspSlotQueryChange"
				:transfer="true"
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
				placeholder="预算位名称/ID"
			>
				<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})</Option>
			</Select>

			<!-- 产品名称/ID -->
			<Select
				class="i-margin-right-11 i-width-select mar-bot-10"
				multiple
				filterable
				v-model="search.dsp_product_id_arr"
				placeholder="产品名称/ID"
				:max-tag-count="1"
				:max-tag-placeholder="limitText"
			>
				<Option v-for="item in dspProductList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
			</Select>

  			<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.dsp_slot_id_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位ID" />

			<Input  type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.dsp_slot_code_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算方广告位ID"/>

	   		<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.dsp_slot_name_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位名称" />

  			<Button type="primary" @click="doFilterList">查询</Button>
		</div>
		<!-- echart数据 -->
		<div class="chart-card" v-show="navType === 'echart'">
			<t-echart ref="tEchart" :selectArr="echartArr"></t-echart>
		</div>

		<div class="console-table data-table" v-show="navType === 'table'">
			<Table
				highlight-row
				stripe
				border
				:columns="columns1"
				:data="budgetData"
				ref="tableExpand"
				:loading="tableLoadFlag"
				@on-cell-click="onExpand"
				@on-sort-change="sortChange"
				show-summary
				sum-text="总计"
				:height="tableHeight"
				:summary-method="handleSummary"
			>
				<!-- # index-->
				<template slot-scope="{ row, index }" slot="index">
					{{index + 1}}
				</template>
				<!--日期-->
				<template slot-scope="{ row }" slot="date">
					<p class="table_text">{{ row.date }}</p>
				</template>
				<!--公司名称/ID-->
				<template slot-scope="{ row }" slot="company_name">
					<p class="name-row-ellipsis" :title="row.company_name">{{ row.company_name }}</p>
					<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
				</template>
				<!--预算位/ID-->
				<template slot-scope="{ row }" slot="dsp_slot_name">
					<div class="control-flex">
						<div class="control-left">
							<p class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
							<p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
						</div>
						<a v-if="row.dsp_company_id && row.dsp_slot_id" class="control-right" target="_blank" :href="`/dsp/slot/edit?slot_id=${row.dsp_slot_id}`">
							<Icon type="md-create"/>
							<div v-if="row.controlled > 0 && row.tag_ctrl > 0" class="control-img" title="控量+人群定向"><img src="~@/assets/image/kr.png"></div>
							<div v-else-if="row.controlled > 0 && row.tag_ctrl === 0" class="control-img" title="控量"><img src="~@/assets/image/k.png"></div>
							<div v-else-if="row.controlled === 0 && row.tag_ctrl > 0" class="control-img" title="人群定向"><img src="~@/assets/image/r.png"></div>
						</a>
					</div>
				</template>
				<!--预算位素材尺寸比例-->
				<template slot-scope="{ row }" slot="dsp_slot_ratio">
					<p v-if="row.dsp_slot_ratio && mediaCheckData.indexOf('预算位名称') >= 0 " class="table_text">{{ row.dsp_slot_ratio }}</p>
					<p v-else class="table_text">-</p>
				</template>
				<!-- 产品名称 -->
				<template slot-scope="{ row }" slot="dsp_product_name">
					<p class="table_text">{{ row.dsp_product_name || '-' }}</p>
				</template>
				<!--预算方广告位ID-->
				<template slot-scope="{ row }" slot="dsp_slot_code">
					<p class="table_text">{{ row.dsp_slot_code }}</p>
				</template>
				<!--广告样式-->
				<template slot-scope="{ row }" slot="ad_type">
					<p class="table_text">{{adTypeText(row.ad_type_id)}}-{{creativeIdText(row.creative_type)}}</p>
				</template>
				<!--有效广告请求pv-->
				<template slot-scope="{ row }" slot="req_pv">
					<Tooltip placement="right-start" :transfer="true">
						<p class="data_value">{{getNumberInt(row.req_pv)}}</p>
						<p v-if="getProportion(row.req_pv,row.yes_req_pv) > 10" class="data_scale up_scale">
							{{getProportion(row.req_pv,row.yes_req_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.req_pv,row.yes_req_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.req_pv,row.yes_req_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.req_uv,row.yes_req_uv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.req_uv,row.yes_req_uv) < -10" class="data_scale down_scale">
							{{getProportion(row.req_uv,row.yes_req_uv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.ret_pv,row.yes_ret_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.ret_pv,row.yes_ret_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.ret_pv,row.yes_ret_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.ret_uv,row.yes_ret_uv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.ret_uv,row.yes_ret_uv) < -10" class="data_scale down_scale">
							{{getProportion(row.ret_uv,row.yes_ret_uv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.show_pv,row.yes_show_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.show_pv,row.yes_show_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.show_pv,row.yes_show_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.show_uv,row.yes_show_uv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.show_uv,row.yes_show_uv) < -10" class="data_scale down_scale">
							{{getProportion(row.show_uv,row.yes_show_uv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.click_pv,row.yes_click_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.click_pv,row.yes_click_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.click_pv,row.yes_click_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.click_uv,row.yes_click_uv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.click_pv,row.yes_click_uv) < -10" class="data_scale down_scale">
							{{getProportion(row.click_uv,row.yes_click_uv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.jc_pv,row.yes_jc_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.jc_pv,row.yes_jc_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.jc_pv,row.yes_jc_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.dplsucc_pv,row.yes_dplsucc_pv)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.dplsucc_pv,row.yes_dplsucc_pv) < -10" class="data_scale down_scale">
							{{getProportion(row.dplsucc_pv,row.yes_dplsucc_pv)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.fill_rates,row.yes_fill_rates)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.fill_rates,row.yes_fill_rates) < -10" class="data_scale down_scale">
							{{getProportion(row.fill_rates,row.yes_fill_rates)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.show_rates,row.yes_show_rates)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.show_rates,row.yes_show_rates) < -10" class="data_scale down_scale">
							{{getProportion(row.show_rates,row.yes_show_rates)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.ctr,row.yes_ctr)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.ctr,row.yes_ctr) < -10" class="data_scale down_scale">
							{{getProportion(row.ctr,row.yes_ctr)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.dplsucc_rates,row.yes_dplsucc_rates)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.dplsucc_rates,row.yes_dplsucc_rates) < -10" class="data_scale down_scale">
							{{getProportion(row.dplsucc_rates,row.yes_dplsucc_rates)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.ecpm,row.yes_ecpm)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.ecpm,row.yes_ecpm) < -10" class="data_scale down_scale">
							{{getProportion(row.ecpm,row.yes_ecpm)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.cpc,row.yes_cpc)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.cpc,row.yes_cpc) < -10" class="data_scale down_scale">
							{{getProportion(row.cpc,row.yes_cpc)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.income,row.yes_income)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.income,row.yes_income) < -10" class="data_scale down_scale">
							{{getProportion(row.income,row.yes_income)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.spend,row.yes_spend)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.income,row.yes_spend) < -10" class="data_scale down_scale">
							{{getProportion(row.spend,row.yes_spend)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.profits,row.yes_profits)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.profits,row.yes_profits) < -10" class="data_scale down_scale">
							{{getProportion(row.profits,row.yes_profits)}}%<Icon type="md-arrow-round-down" />
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
							{{getProportion(row.profits_rates,row.yes_profits_rates)}}%<Icon type="md-arrow-round-up" />
						</p>
						<p v-else-if="getProportion(row.profits_rates,row.yes_profits_rates) < -10" class="data_scale down_scale">
							{{getProportion(row.profits_rates,row.yes_profits_rates)}}%<Icon type="md-arrow-round-down" />
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
			<div class="page-center">
				<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
			</div>
		</div>
		<Drawer v-model="columnDrawer" :scrollable="false" title="自定义列" width="750px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<div class="column_content">
				<RadioGroup class="private-check-card" type="button" v-model="column_active">
					<Radio :label="1">预算表格设置</Radio>
					<Radio :label="2">流量表格设置</Radio>
				</RadioGroup>
				<div class="col_detail">
					<div class="media_table" v-if="column_active === 1">
						<Row>
							<Col :span="16">
								<div class="col_title">可选择列</div>
								<div class="optional_detail">
									<div class="checkout_content">
										<div class="check_title">
											<Checkbox
												:value="mediaAll1"
												@click.prevent.native="mediaCheckAll1">数据维度</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange1">
											<Checkbox class="option_check" v-for="item in media_info" :key="'数据维度'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="media_basic.length>0">
										<div class="check_title">
											<Checkbox
												:value="mediaAll2"
												@click.prevent.native="mediaCheckAll2">基本指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange2">
											<Checkbox class="option_check" v-for="item in media_basic" :key="'基本指标'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="media_effect.length>0">
										<div class="check_title">
											<Checkbox
												:value="mediaAll3"
												@click.prevent.native="mediaCheckAll3">效果指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange3">
											<Checkbox class="option_check" v-for="item in media_effect" :key="'效果指标'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="media_income.length>0">
										<div class="check_title">
											<Checkbox
												:value="mediaAll4"
												@click.prevent.native="mediaCheckAll4">收益指标</Checkbox>
										</div>
										<CheckboxGroup v-model="mediaCheckData" @on-change="mediaCheckAllChange4">
											<Checkbox class="option_check" v-for="item in media_income" :key="'收益指标'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
								</div>
							</Col>
							<Col :span="8">
								<div class="col_title">已选择列</div>
								<div class="select_con">
									<Tag v-for="(item,index) in mediaCheckData" :key="'已选择列'+index+item" :name="item" closable @on-close="mediaClose">{{item}}</Tag>
								</div>
							</Col>
						</Row>
					</div>
					<div class="budget_table" v-if="column_active === 2">
						<Row>
							<Col :span="16">
								<div class="col_title">可选择列</div>
								<div class="optional_detail">
									<div class="checkout_content">
										<div class="check_title">
											<Checkbox
												:value="budgetAll1"
												@click.prevent.native="budgetCheckAll1">数据维度</Checkbox>
										</div>
										<CheckboxGroup v-model="budgetCheckData" @on-change="budgetCheckAllChange1">
											<Checkbox class="option_check" v-for="item in budget_info" :key="'数据维度1'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="budget_basic.length>0">
										<div class="check_title">
											<Checkbox
												:value="budgetAll2"
												@click.prevent.native="budgetCheckAll2">基本指标</Checkbox>
										</div>
										<CheckboxGroup v-model="budgetCheckData" @on-change="budgetCheckAllChange2">
											<Checkbox class="option_check" v-for="item in budget_basic" :key="'基本指标1'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="budget_effect.length>0">
										<div class="check_title">
											<Checkbox
												:value="budgetAll3"
												@click.prevent.native="budgetCheckAll3">效果指标</Checkbox>
										</div>
										<CheckboxGroup v-model="budgetCheckData" @on-change="budgetCheckAllChange3">
											<Checkbox class="option_check" v-for="item in budget_effect" :key="'效果指标1'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div class="checkout_content" v-show="budget_income.length>0">
										<div class="check_title">
											<Checkbox
												:value="budgetAll4"
												@click.prevent.native="budgetCheckAll4">收益指标</Checkbox>
										</div>
										<CheckboxGroup v-model="budgetCheckData" @on-change="budgetCheckAllChange4">
											<Checkbox class="option_check" v-for="item in budget_income" :key="'收益指标1'+item" :label="item">
												<span>{{item}}</span>
											</Checkbox>
										</CheckboxGroup>
									</div>
								</div>
							</Col>
							<Col :span="8">
								<div class="col_title">已选择列</div>
								<div class="select_con">
									<Tag v-for="(item,index) in budgetCheckData" :key="'已选择列'+index+item" :name="item" closable @on-close="budgetClose">{{item}}</Tag>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</div>
			<div class="drawer-footer">
				<Button @click="columnDrawer = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitData()">
					<span v-if="!submitClock">提交</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
	</Card>
</template>

<script>
import { filterBatchQuery } from '@/libs/util'
import sourceTable from './source-table'
import { getDownLoadXls, setTableHeadApi, tableInfoApi, setTablePageApi } from '@/api/common'
import { debounce, writeStartsDate, writeEndDate, getDayTime, getYesterdayTime, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import { getDspSlotList, getDspProductList } from '@/api/dsp'
import { getSspBudgetData, getDspHourData, getSspBudgetDataUrl } from '@/api/data'
import { mapActions } from 'vuex'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import tEchart from '../module/echart'

export default {
	name: 'dsp-data-day',
	components: { sourceTable, tEchart },
	mixins: [tableHeight, inPageAccess],
	data() {
		return {
      mainTableId: 4,
      sonTableId: 5,
			navType: 'table',
			echartArr: [], // 数据表筛选列表
			dspCompanyList: [],
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
			adtypeList: [],
			pickerOptions: {
				disabledDate(date) {
					let curDate = (new Date()).getTime()
					let three = 30 * 24 * 3600 * 1000
					let threeMonths = curDate - three
					return date.getTime() > Date.now() || date.getTime() < threeMonths
				}
			},
			options1: {
				disabledDate(date) {
					let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
					return date.valueOf() >= Date.now() || date.valueOf() < disableData
				},
				shortcuts: [
					{
						text: '最近七天',
						value() {
							const end = new Date()
							const start = new Date()
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
							return [start, end]
						}
					},
					{
						text: '最近30天',
						value() {
							let end = new Date()
							let start = new Date()
							let disableData = Date.parse(new Date('2020-09-01 0:0:0'))
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
							if (start < disableData) {
								start = new Date(disableData)
							}
							return [start, end]
						}
					}
				]
			}, // 时间的判断方式
			search_time: '', // 时间的默认值
			search: { // 查询的内容
				start_date: null,
				end_date: null,
				dsp_company_id_arr: [],
				creative_type_arr: [],
				dsp_slot_id_arr: [],
				dsp_slot_code: [],
				order: null,
				group: [],
				dsp_slot_name_arr: [], // 预算位名称
				dsp_product_id_arr: [] // 产品名称
			},
			filterSearch: {
				dsp_slot_name_textarea: null, // 预算位名称文本
				dsp_slot_code_textarea: null, // 预算方广告位ID文本
				dsp_slot_id_textarea: null // 预算位ID文本
			},
			dsp_slot_id_arr: [], // 选择框中ID

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中
			dspProductList: [], // 产品列表

			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			tableLoadFlag: true,
			buttonSize: 'large',
			columnDrawer: false, // 自定义列的抽屉
			column_active: 1, // 自定义列的模块的选择
			mediaIndeterminate: true,
			submitClock: false,
			mediaAll1: false,
			mediaAll2: false,
			mediaAll3: false,
			mediaAll4: false,
			media_info: ['日期', '公司/账号名称', '预算位名称', '素材尺寸比例', '预算方广告位ID', '产品名称', '广告位类型'],
			media_basic: ['有效广告请求pv', '有效广告请求uv', '广告返回pv', '广告返回uv',
				'广告展现pv', '广告展现uv', '广告点击pv', '广告点击uv', '加群点击数', '调起数', '下载完成量', '安装量', '激活量'],
			media_effect: ['填充率', '展现率', '点击率', '调起率', '下载完成率', '安装率', '激活率', 'CPM', 'CPC', '媒体eCPM', '媒体CPC'],
			media_income: ['收益', '成本', '利润', '利润率'],
			mediaCheckData: ['日期', '预算位名称', '广告位类型', '有效广告请求pv', '广告返回pv', '广告展现pv', '广告点击pv', '填充率', '展现率', '点击率', 'CPM', 'CPC', '收益', '成本', '利润', '利润率'],
			budget_info: ['日期', '媒体简称', '应用平台', '应用名称', '广告位名称', '素材尺寸比例', '广告位类型'],
			budget_basic: ['有效广告请求pv', '有效广告请求uv', '广告返回pv', '广告返回uv', '广告展现pv', '广告展现uv',
				'广告点击pv', '广告点击uv', '加群点击数', '调起数', '下载完成量', '安装量', '激活量'],
			budget_effect: ['填充率', '展现率', '点击率', '调起率', '下载完成率', '安装率', '激活率', 'eCPM', 'CPC', '媒体eCPM', '媒体CPC'],
			budget_income: ['预估收益', '成本', '利润', '利润率'],
			budgetCheckData: ['日期', '应用名称', '广告位名称', '广告展现pv', '广告展现uv', '广告点击pv', '广告点击uv', '点击率', 'CPM', 'CPC', '预估收益', '成本'],
			budgetIndeterminate: true,
			budgetAll1: false,
			budgetAll2: false,
			budgetAll3: false,
			budgetAll4: false,
			columns1: [],
			columns2: [],
			budgetData: [],
			hourDataList: [],
			flowArr: [], // 后台返回的选中流量数据的值
			budgetArr: [], // 后台返回的选中预算数据的值
			sumData: [],
			downClock: false // 下载报表的loading
		}
	},
	computed: {
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
				this.getReportTitle()
			} else {
				this.echartArr = this.$store.state.app.budgetDataList.filter(item => !!item.inDataSelect && this.mediaCheckData.includes(item.label))
			}

			this.getTableInfo()
			this.initLinkage() // 初始化联动
		}
	},
	mounted() {
  		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true})// search-line的高度
	},
	methods: {
		...mapActions([
			'getDspCompanyList'
		]),
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this.getTimeData()
			this._getDspCompanyList() // 预算方-公司名称
			this.getDspSlotList() // 预算方-预算位
			this.getDspProductList() // 产品列表
		},
		/**
		 * [initMoniter echart数据]
		 * @return {[type]} [只以时间维度统计]
		 */
		initMoniter() {

			let params = {
				...this.getAxiosParams(),
				...{
					group: ['date'], // 时间维度
					order: this.search.order,
					start_date: this.search.start_date,
					end_date: this.search.end_date,
					page_num: 1,
					page_size: 0
				}
			}
			getSspBudgetData(params).then(res => {
				let obj = {}

				if (res.code === 200) {
					let _list = res.data.list.reverse()

					_list.map(item => {
						for (let key in item) {
							let temp = obj[key] ? obj[key] : []
							obj[key] = temp.concat(item[key])
						}
					})
				}

				this.$refs.tEchart.initData(obj)
			})
		},
		// 报表权限的设置
		getReportTitle() {
			let flowFields = this.$store.getters.getUserSspFields
			let budgetFields = this.$store.getters.getUserDspFields
			let flowList = this.$store.state.app.flowDataList
			let budgetList = this.$store.state.app.budgetDataList
			let flowArr = flowList.filter(item => {
				return flowFields.includes(item.key)
			}).map((item, index) => {
				return item.label
			})
			this.flowArr = flowArr
			let _echartArr = [] // echart使用
			let budgetArr = budgetList.filter(item => {
				return budgetFields.includes(item.key)
			}).map((item, index) => {
				if (item.inDataSelect) {
					_echartArr.push(item)
				}
				return item.label
			})
			this.echartArr = _echartArr
			this.budgetArr = budgetArr
			this.media_basic = this.media_basic.filter(item => budgetArr.indexOf(item) > -1)
			this.media_effect = this.media_effect.filter(item => budgetArr.indexOf(item) > -1)
			this.media_income = this.media_income.filter(item => budgetArr.indexOf(item) > -1)
			let allBudget = budgetArr.concat(this.media_info)
			this.mediaCheckData = this.mediaCheckData.filter(item => allBudget.indexOf(item) > -1)
			this.budget_basic = this.budget_basic.filter(item => flowArr.indexOf(item) > -1)
			this.budget_effect = this.budget_effect.filter(item => flowArr.indexOf(item) > -1)
			this.budget_income = this.budget_income.filter(item => flowArr.indexOf(item) > -1)
			let allFlow = flowArr.concat(this.budget_info)
			this.budgetCheckData = this.budgetCheckData.filter(item => allFlow.indexOf(item) > -1)
		},
		// 表格的排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.search.order = col.column.slot
				this.currentPage = 1
				this.getBudgetData()
			} else if (col.order === 'desc') {
				this.search.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.getBudgetData()
			}
		},
		// 获取自定义列的数据
		getTableInfo() {
			tableInfoApi().then(res => {
				let data = res.data
				if (res.code === 200) {
					if (data[`table_head_head_${this.sonTableId}`]) {
						if (!this.$store.getters.getUserAllFields) {
							let selectBudget = data[`table_head_head_${this.sonTableId}`].split(',')
							let allBudget = this.flowArr.concat(this.budget_info)
							this.budgetCheckData = selectBudget.filter(item => allBudget.indexOf(item) > -1)
						} else {
							this.budgetCheckData = data[`table_head_head_${this.sonTableId}`].split(',')
						}
						this.budgetJudgeAll()
					}
					if (data[`table_head_head_${this.mainTableId}`]) {
						if (!this.$store.getters.getUserAllFields) {
							let selectMedia = data[`table_head_head_${this.mainTableId}`].split(',')
							let allFlow = this.budgetArr.concat(this.media_info)
							this.mediaCheckData = selectMedia.filter(item => allFlow.indexOf(item) > -1)
						} else {
							this.mediaCheckData = data[`table_head_head_${this.mainTableId}`].split(',')
						}
						this.mediaJudgeAll()
					}
					if (data[`table_page_page_${this.mainTableId}`]) {
						this.pageSize = data[`table_page_page_${this.mainTableId}`]
					}
					this.getTable1Columns()
					this.getTable2Columns()
					this.currentPage = 1
					this.getYesterdayDataList()
					this.initMoniter()
					// this.getBudgetData()
				}
			})
		},
		// 获取广告场景
		adTypeText(id) {
			let _arr = this.$store.state.app.adSceneData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		// 获取广告样式
		creativeIdText(id) {
			let _arr = this.$store.state.app.adStyleData
			let result = _arr.filter(item => item.id == id)
			return result[0] ? result[0].title : ''
		},
		// 这个循环是为了每次只能展开一个，其他自动收起，不需要可以去掉
		onExpand(row, column, data, event) {
			if (column.type === 'expand') {
				let curArr = [...this.budgetData]
				curArr.map((item, index) => {
					if (index === row._index) {
						item._expanded = !item._expanded
					} else {
						item._expanded = false
					}
				})
				this.budgetData = curArr
			}
		},
		/**
		 * [doFilterList 查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			let _filter = this.filterSearch
			// 此处有容处理
			// 预算位ID查询
			// 1. 预算位Id多选和单选，最后统一按照 ssp_slot_id_arr 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_arr_select 两个筛选条件）
			let textSplitArr = filterBatchQuery({
				value: _filter.dsp_slot_id_textarea,
				type: 'number'
			})
			this.search.dsp_slot_id_arr = Array.from(new Set([...textSplitArr, ...this.dsp_slot_id_arr]))

			// 预算方广告位ID
			this.search.dsp_slot_code = filterBatchQuery({
				value: _filter.dsp_slot_code_textarea
			})

			// 预算方名称
			this.search.dsp_slot_name_arr = filterBatchQuery({
				value: _filter.dsp_slot_name_textarea
			})
			this.getYesterdayDataList()
			this.initMoniter()
			// this.getBudgetData()
		},
		/**
		 * [downStatement 下载报表]
		 * @return {[type]} [description]
		 */
		downStatement() {
			this.downClock = true
      let params = {
        ...this.search,
        ...{
          page_size: this.total_count,
          page_num: 1
        }
      }


      let down = {
				url: getSspBudgetDataUrl(params),
				method: 'GET'
			}

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = `${this.search.start_date}～${this.search.end_date}预算数据.xlsx`

					createObjectURL(res.data.url, filename)
				}
				this.downClock = false
			}, err => {
				this.downClock = false
			})
		},
		/**
		 * [filterByDate 时间的选择]
		 * @return {[type]} [description]
		 */
		filterByDate(e) {
			let start = new Date(e[0]).getTime()
			let end = new Date(e[1]).getTime()
			if (end - start > 2678400000) {
				this.$Message.error('选择日期不能超过31天')
				this.getTimeData()
			} else {
				this.search.start_date = e[0]
				this.search.end_date = e[1]
			}
		},
		/**
		 * [changePage 翻页的修改]
		 * @return {[type]} [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getBudgetData()
		},
		/**
		 * [sizeChange 页数的修改]
		 * @return {[type]} [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.currentPage = 1
			this.tablePageUpdate(size)
		},
		/**
		 * [tablePageUpdate 页码的保存]
		 * @return {[type]} [description]
		 */
		tablePageUpdate(size) {
			let obj = {}
			obj.table_id = this.mainTableId
			obj.page_num = size
			setTablePageApi(obj).then(data => {
				if (data.code === 200) {
					this.getBudgetData()
				}
			})
		},
		/**
		 * [getBudgetData 获取预算的表格数据]
		 * @return {[type]} [description]
		 */
		getBudgetData() {
			this.tableLoadFlag = true
      this.search.group = []
			let group = []

			this.mediaCheckData.map(item => {
				if (item === '日期') {
					group.push('date')
				}

				if (item === '预算位名称') {
					group.push('dsp_slot_id')
				}

				if (item === '公司/账号名称') {
					group.push('dsp_company_id')
				}

				if (item === '预算方广告位ID') {
					group.push('dsp_slot_code')
				}

				if (item === '广告位类型') {
					group.push('creative_type')
				}

				if (item === '产品名称') {
					group.push('dsp_product_id')
				}
			})
      this.search.group = group
			let search = {
				...this.search,
				...{
					page_num: this.currentPage,
					page_size: this.pageSize
				}
			}

			getSspBudgetData(search).then(res => {
				let data = res.data
				if (res.code === 200) {
					this.total_count = data.total_count
					let flowList = data.list
					this.sumData = data.total
					let flowTableData = []
					// 根据时间选择它的前一天的数据对比对应的聚合进行选择
					let obj = {...this.getAxiosParams()}
					let contrastData = []
					Object.keys(flowList).forEach(t => {
						flowList[t].date ? contrastData.push(flowList[t].date) : ''
					})
					contrastData.sort(function(a, b) {
						return a > b ? 1 : -1
					})
					// if (contrastData.indexOf(getDayTime()) > -1) {
					// 	this.getYesterdayDataList()
					// }
					if (contrastData.length > 0) {
						obj.start_date = getYesterdayTime(contrastData[0])
						obj.end_date = getYesterdayTime(contrastData[contrastData.length - 1])
					} else {
						obj.start_date = this.search.start_date
						obj.end_date = this.search.end_date
					}
					obj.page_num = 1
					obj.page_size = 0
					obj.group = this.search.group
					// 调取接口获取昨天的数据
					getSspBudgetData(obj).then(res => {
						let data = res.data
						if (res.code === 200) {
							this.tableLoadFlag = false
							let yesterdayDataList = data.list
							Object.keys(flowList).forEach(j => {
								let flowTable = {}
								flowTable = flowList[j]
								let groups = [...this.search.group]
								if (groups.indexOf('date') > -1) {
									groups.splice(groups.indexOf('date'), 1)
								}
								let juadgArr = []
								groups.map(g => {
									juadgArr.push(`item['${g}'] === child['${g}']`)
								})
								let flowData = []
								flowData.push(flowList[j])
								// 判断当前时间是否为今天
								if (flowList[j].date === getDayTime() && this.search.group.length > 0) {
									let day_id = []
									if (this.hourDataList && this.hourDataList.length > 0) {
										if (juadgArr.length > 0) {
											this.hourDataList.map((item, index) => {
												flowData.map(child => {
													if (eval(juadgArr.join(' && '))) {
														day_id.push(index)
													}
												})
											})
										} else {
											day_id.push(0)
										}
									}
									if (day_id.length > 0) {
										let yesData = this.hourDataList[day_id[0]]
										Object.keys(yesData).forEach(m => {
											flowTable['yes_' + m] = yesData[m]
										})
									}
								} else {
									let select_id = []
									if (yesterdayDataList.length > 0) {
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
								}
								flowTableData.push(flowTable)
							})
							this.budgetData = flowTableData
						} else {
							this.tableLoadFlag = false
						}
					})
				} else {
					this.tableLoadFlag = false
				}
			}, error => {
				this.tableLoadFlag = false
			})
		},
		/**
		 * [getAxiosParams 获取下载和列表的url参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {
			let _filter = this.search
			let params = {}

			// 公司名称
			!!_filter.dsp_company_id_arr.length && (params.dsp_company_id_arr = _filter.dsp_company_id_arr)

			// 广告位类型
			!!_filter.creative_type_arr.length && (params.creative_type_arr = _filter.creative_type_arr)

			// 预算位ID
			!!_filter.dsp_slot_id_arr.length && (params.dsp_slot_id_arr = _filter.dsp_slot_id_arr)

			// 产品Id
			!!_filter.dsp_product_id_arr.length && (params.dsp_product_id_arr = _filter.dsp_product_id_arr)

			// 预算方广告位ID
			!!_filter.dsp_slot_code.length && (params.dsp_slot_code = _filter.dsp_slot_code)

			// 预算方名称
			!!_filter.dsp_slot_name_arr.length && (params.dsp_slot_name_arr = _filter.dsp_slot_name_arr)

			return params
		},
		/**
		 * [getYesterdayDataList 获取昨天的小时报表]
		 * @return {[type]} [description]
		 */
		getYesterdayDataList() {
			let search = { ...this.getAxiosParams()}
			search.group = []
			this.tableLoadFlag = true
			// search.group.push('date')
			Object.keys(this.mediaCheckData).forEach(j => {
				if (this.mediaCheckData[j] === '预算位名称') {
					search.group.push('dsp_slot_id')
				}
				if (this.mediaCheckData[j] === '公司/账号名称') {
					search.group.push('dsp_company_id')
				}
				if (this.mediaCheckData[j] === '预算方广告位ID') {
					search.group.push('dsp_slot_code')
				}
				if (this.mediaCheckData[j] === '广告位类型') {
					search.group.push('creative_type')
				}

				if (this.mediaCheckData[j] === '产品名称') {
					search.group.push('dsp_product_id')
				}
			})
			// if (search.group.length === 0) {
			//   search.group.push('date')
			// }
			search.page_num = 1
			search.page_size = 0
			search.start_date = writeStartsDate()
			search.end_date = writeEndDate()
			getDspHourData(search).then(res => {
				let data = res.data
				if (res.code === 200) {
					this.hourDataList = data.list
					this.getBudgetData()
				} else {
					this.tableLoadFlag = false
				}
			}, err => {
				this.tableLoadFlag = false
			})
		},
		/**
		 * [handleSummary 表格的总计]
		 * @return {[type]}
		 */
		handleSummary({columns, data}) {
			const sums = {}
			columns.forEach((column, index) => {
				let key = column.slot
				if (key === 'date') {
					sums[key] = {
						key,
						value: '合计'
					}
					return
				}
				if (!column.noNeedCalcThou) {
					if (column.title && column.title.indexOf('率') > -1) {
						sums[key] = {
							key,
							value: this.number2Thousand(this.sumData[key]) + '%'
						}
					} else {
						sums[key] = {
							key,
							value: this.number2Thousand(this.sumData[key])
						}
					}
				} else {
					sums[key] = {
						key,
						value: '-'
					}
				}
			})
			return sums
		},
		number2Thousand(number) {
			return number2Thousand(number)
		},
		/**
		 * [getTable1Columns 设置预算表格的列]
		 * @return {[type]} [description]
		 */
		getTable1Columns () {
			const ColumnList = [
				{title: '#', width: 36, key:'index', slot:'index', align: 'center', noNeedCalcThou: true},
				{
					type: 'expand',
					width: 25,
					noNeedCalcThou: true,
					render: (h, params) => {
						return h(sourceTable, {
							props: {
								row: params.row,
								data: this.columns2,
			  					hasDeleteSourceRole: this._isShow_('deleteSource'), // 是否有删除子表的权限
								budgetCheckData: this.budgetCheckData
							}
						})
					}
				},
				{title: '日期', key: 'date', slot: 'date', width: 80, minWidth: 80, sortable: 'custom', noNeedCalcThou: true},
				{title: '公司/账号名称', key: 'company_name', header: '公司(账号)名称/ID', slot: 'company_name', minWidth: 120, noNeedCalcThou: true},
				{title: '产品名称', key: 'dsp_product_name', slot: 'dsp_product_name', minWidth: 180, noNeedCalcThou: true},
				{title: '预算位名称', key: 'dsp_slot_name', header: '预算位名称/ID', slot: 'dsp_slot_name', width: 200, noNeedCalcThou: true},
				{title: '素材尺寸比例', key: 'dsp_slot_ratio', header: '素材尺寸比例', slot: 'dsp_slot_ratio', minWidth: 100, noNeedCalcThou: true},
				{title: '预算方广告位ID', key: 'dsp_slot_code', slot: 'dsp_slot_code', minWidth: 230, noNeedCalcThou: true},
				{title: '广告位类型', key: 'ad_type', slot: 'ad_type', minWidth: 200, noNeedCalcThou: true},
				{title: '有效广告请求pv', key: 'req_pv', slot: 'req_pv', minWidth: 130, sortable: 'custom'},
				{title: '有效广告请求uv', key: 'req_uv', slot: 'req_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回pv', key: 'ret_pv', slot: 'ret_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回uv', key: 'ret_uv', slot: 'ret_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现pv', key: 'show_pv', slot: 'show_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现uv', key: 'show_uv', slot: 'show_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击pv', key: 'click_pv', slot: 'click_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击uv', key: 'click_uv', slot: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', key: 'jc_pv', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', key: 'dplsucc_pv', slot: 'dplsucc_pv', minWidth: 100, sortable: 'custom'},
				{title: '下载完成量', key: 'complete_pv', slot: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', key: 'install_pv', slot: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', key: 'activate_pv', slot: 'activate_pv', minWidth: 130, sortable: 'custom'},
				{title: '填充率', key: 'fill_rates', slot: 'fill_rates', minWidth: 100, sortable: 'custom'},
				{title: '展现率', key: 'show_rates', slot: 'show_rates', minWidth: 100, sortable: 'custom'},
				{title: '点击率', key: 'ctr', slot: 'ctr', minWidth: 100, sortable: 'custom'},
				{title: '调起率', key: 'dplsucc_rates', slot: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
				{title: '下载完成率', key: 'complete_rates', slot: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', key: 'install_rates', slot: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', key: 'activate_rates', slot: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: 'CPM', key: 'ecpm', slot: 'ecpm', minWidth: 90, sortable: 'custom'},
				{title: 'CPC', key: 'cpc', slot: 'cpc', minWidth: 90, sortable: 'custom'},
				{title: '媒体eCPM', key: 'ecpm_dev', slot: 'ecpm_dev', minWidth: 100, sortable: 'custom'},
				{title: '媒体CPC', key: 'cpc_dev', slot: 'cpc_dev', minWidth: 90, sortable: 'custom'},
				{title: '收益', key: 'income', slot: 'income', minWidth: 100, sortable: 'custom'},
				{title: '成本', key: 'spend', slot: 'spend', minWidth: 90, sortable: 'custom'},
				{title: '利润', key: 'profits', slot: 'profits', minWidth: 90, sortable: 'custom'},
				{title: '利润率', key: 'profits_rates', slot: 'profits_rates', minWidth: 100, sortable: 'custom'}
			]

			// 筛选表格
			let resultArr = []
			let extraMust = ['index'] // 额外必须存在的字段

			ColumnList.map(item => {
				// 时间不可取消
				if((item.type === 'expand' && this._isShow_('viewSource')) || extraMust.includes(item.slot) || this.mediaCheckData.indexOf(item.title) > -1) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})

			if (!this.mediaCheckData.includes('预算位名称')) {
				resultArr.splice(1, 1)
			}

			this.columns1 = resultArr
		},
		/**
		 * [getTable2Columns 设置数据表格的列]
		 * @return {[type]} [description]
		 */
		getTable2Columns () {
			const ColumnList2 = [
				{title: '日期', slot: 'date', width: 80, minWidth: 80, sortable: 'custom'},
				{title: '媒体简称', header: '媒体名称/ID', slot: 'company_short_name', minWidth: 100},
				{title: '应用平台', slot: 'os_type', minWidth: 90},
				{title: '应用名称', header: '应用名称/ID', slot: 'app_name', minWidth: 200},
				{title: '广告位名称', slot: 'ssp_slot_name', minWidth: 150},
				{title: '素材尺寸比例', header: '素材尺寸比例', slot: 'ssp_slot_ratio', minWidth: 100},
				{title: '广告位类型', slot: 'ad_type', minWidth: 200},
				{title: '有效广告请求pv', slot: 'req_pv', minWidth: 130, sortable: 'custom'},
				{title: '有效广告请求uv', slot: 'req_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回pv', slot: 'ret_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告返回uv', slot: 'ret_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现pv', slot: 'show_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告展现uv', slot: 'show_uv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击pv', slot: 'click_pv', minWidth: 130, sortable: 'custom'},
				{title: '广告点击uv', slot: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', slot: 'dplsucc_pv', minWidth: 100, sortable: 'custom'},
				{title: '下载完成量', slot: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', slot: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', slot: 'activate_pv', minWidth: 130, sortable: 'custom'},
				{title: '填充率', slot: 'fill_rates', minWidth: 100, sortable: 'custom'},
				{title: '展现率', slot: 'show_rates', minWidth: 100, sortable: 'custom'},
				{title: '点击率', slot: 'ctr', minWidth: 100, sortable: 'custom'},
				{title: '调起率', slot: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
				{title: '下载完成率', slot: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', slot: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', slot: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: 'eCPM', slot: 'ecpm', minWidth: 90, sortable: 'custom'},
				{title: 'CPC', slot: 'cpc', minWidth: 90, sortable: 'custom'},
				{title: '媒体eCPM', slot: 'ecpm_dev', minWidth: 100, sortable: 'custom'},
				{title: '媒体CPC', slot: 'cpc_dev', minWidth: 90, sortable: 'custom'},
				{title: '预估收益', slot: 'income', minWidth: 100, sortable: 'custom'},
				{title: '成本', slot: 'spend', minWidth: 90, sortable: 'custom'},
				{title: '利润', slot: 'profits', minWidth: 90, sortable: 'custom'},
				{title: '利润率', slot: 'profits_rates', minWidth: 100, sortable: 'custom'}
			]
			let newArr = ColumnList2.filter(item => {
				return this.budgetCheckData.indexOf(item.title) >= 0
			}).map((item, index) => {
				return {
					title: item.header || item.title,
					key: item.key,
					slot: item.slot,
					minWidth: item.minWidth || 100,
					sortable: item.sortable
				}
			})
			this.columns2 = newArr
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}	   [description]
		 */
		limitText(count) {
			return `+${count}`
		},
		/**
		 * [getTimeData 设置时间的默认值]
		 * @return {[type]} [description]
		 */
		getTimeData() {
			let curTime = new Date()
			let endTime = formatDate(curTime, 'yyyy-MM-dd')
			let startTime = formatDate(curTime.getTime() - 3600 * 1000 * 24 * 7, 'yyyy-MM-dd')

			this.search_time = [startTime, endTime]
			this.search.end_date = endTime
			this.search.start_date = startTime
		},
		/**
		 * [mediaCheckAll1 预算表格的数据维度的全选]
		 * @return {[type]} [description]
		 */
		mediaCheckAll1() {
			if (this.mediaAll1) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_info.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll1 = false
			} else {
				Object.keys(this.media_info).forEach(j => {
					this.mediaCheckData.push(this.media_info[j])
				})
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll1 = true
			}
		},
		/**
		 * [mediaCheckAllChange1 预算表格的数据维度的单选]
		 * @return {[type]} [description]
		 */
		mediaCheckAllChange1(data) {
			let dataAll = [...data].filter(item => this.media_info.indexOf(item) > -1)
			this.mediaAll1 = dataAll.length === this.media_info.length
		},
		/**
		 * [mediaCheckAll2 预算表格的基本指标的全选]
		 * @return {[type]} [description]
		 */
		mediaCheckAll2() {
			if (this.mediaAll2) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_basic.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll2 = false
			} else {
				Object.keys(this.media_basic).forEach(j => {
					this.mediaCheckData.push(this.media_basic[j])
				})
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll2 = true
			}
		},
		/**
		 * [mediaCheckAllChange2 预算表格的基本指标的单选]
		 * @return {[type]} [description]
		 */
		mediaCheckAllChange2(data) {
			let dataAll = [...data].filter(item => this.media_basic.indexOf(item) > -1)
			this.mediaAll2 = dataAll.length === this.media_basic.length
		},
		/**
		 * [mediaCheckAll3 预算表格的效果指标的全选]
		 * @return {[type]} [description]
		 */
		mediaCheckAll3() {
			if (this.mediaAll3) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_effect.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll3 = false
			} else {
				Object.keys(this.media_effect).forEach(j => {
					this.mediaCheckData.push(this.media_effect[j])
				})
				this.mediaAll3 = true
			}
		},
		/**
		 * [mediaCheckAllChange3 预算表格的效果指标的单选]
		 * @return {[type]} [description]
		 */
		mediaCheckAllChange3(data) {
			let dataAll = [...data].filter(item => this.media_effect.indexOf(item) > -1)
			this.mediaAll3 = dataAll.length === this.media_effect.length
		},
		/**
		 * [mediaCheckAll4 预算表格的收益指标的全选]
		 * @return {[type]} [description]
		 */
		mediaCheckAll4() {
			if (this.mediaAll4) {
				this.mediaCheckData = this.mediaCheckData.filter(x => !this.media_income.includes(x))
				this.mediaCheckData = [...new Set(this.mediaCheckData)]
				this.mediaAll4 = false
			} else {
				Object.keys(this.media_income).forEach(j => {
					this.mediaCheckData.push(this.media_income[j])
				})
				this.mediaAll4 = true
			}
		},
		/**
		 * [mediaCheckAllChange4 预算表格的收益指标的单选]
		 * @return {[type]} [description]
		 */
		mediaCheckAllChange4(data) {
			let dataAll = [...data].filter(item => this.media_income.indexOf(item) > -1)
			this.mediaAll4 = dataAll.length === this.media_income.length
		},
		/**
		 * [mediaClose 预算表格的删除]
		 * @return {[type]} [description]
		 */
		mediaClose(event, name) {
			const index = this.mediaCheckData.indexOf(name)
			this.mediaCheckData.splice(index, 1)
			this.mediaJudgeAll()
		},
		/**
		 * [mediaJudgeAll 预算位数据的判断]
		 * @return {[type]} [description]
		 */
		mediaJudgeAll() {
			this.mediaCheckData = [...new Set(this.mediaCheckData)]
			// 数据维度
			let dataAll1 = [...this.mediaCheckData].filter(item => this.media_info.indexOf(item) > -1)
			this.mediaAll1 = dataAll1.length === this.media_info.length
			// 基本指标
			let dataAll2 = [...this.mediaCheckData].filter(item => this.media_basic.indexOf(item) > -1)
			this.mediaAll2 = dataAll2.length === this.media_basic.length
			// 效果指标
			let dataAll3 = [...this.mediaCheckData].filter(item => this.media_effect.indexOf(item) > -1)
			this.mediaAll3 = dataAll3.length === this.media_effect.length
			// 收益指标
			let dataAll4 = [...this.mediaCheckData].filter(item => this.media_income.indexOf(item) > -1)
			this.mediaAll4 = dataAll4.length === this.media_income.length
		},

		/**
		 * [budgetCheckAll1 流量表格的数据维度的全选]
		 * @return {[type]} [description]
		 */
		budgetCheckAll1() {
			if (this.budgetAll1) {
				this.budgetCheckData = this.budgetCheckData.filter(x => !this.budget_info.includes(x))
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll1 = false
			} else {
				Object.keys(this.budget_info).forEach(j => {
					this.budgetCheckData.push(this.budget_info[j])
				})
				this.budgetAll1 = true
			}
		},
		/**
		 * [budgetCheckAllChange1 流量表格的数据维度的单选]
		 * @return {[type]} [description]
		 */
		budgetCheckAllChange1(data) {
			let dataAll = [...data].filter(item => this.budget_info.indexOf(item) > -1)
			this.budgetAll1 = dataAll.length === this.budget_info.length
		},
		/**
		 * [budgetCheckAll2 流量表格的基本指标的全选]
		 * @return {[type]} [description]
		 */
		budgetCheckAll2() {
			if (this.budgetAll2) {
				this.budgetCheckData = this.budgetCheckData.filter(x => !this.budget_basic.includes(x))
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll2 = false
			} else {
				Object.keys(this.budget_basic).forEach(j => {
					this.budgetCheckData.push(this.budget_basic[j])
				})
				this.budgetAll2 = true
			}
		},
		/**
		 * [budgetCheckAllChange2 流量表格的基本指标的单选]
		 * @return {[type]} [description]
		 */
		budgetCheckAllChange2(data) {
			let dataAll = [...data].filter(item => this.budget_basic.indexOf(item) > -1)
			this.budgetAll2 = dataAll.length === this.budget_basic.length
		},
		/**
		 * [budgetCheckAll3 流量表格的效果指标的全选]
		 * @return {[type]} [description]
		 */
		budgetCheckAll3() {
			if (this.budgetAll3) {
				this.budgetCheckData = this.budgetCheckData.filter(x => !this.budget_effect.includes(x))
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll3 = false
			} else {
				Object.keys(this.budget_effect).forEach(j => {
					this.budgetCheckData.push(this.budget_effect[j])
				})
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll3 = true
			}
		},
		/**
		 * [budgetCheckAllChange3 流量表格的效果指标的单选]
		 * @return {[type]} [description]
		 */
		budgetCheckAllChange3(data) {
			let dataAll = [...data].filter(item => this.budget_effect.indexOf(item) > -1)
			this.budgetAll3 = dataAll.length === this.budget_effect.length
		},
		/**
		 * [budgetCheckAll4 流量表格的收益指标的全选]
		 * @return {[type]} [description]
		 */
		budgetCheckAll4() {
			if (this.budgetAll4) {
				this.budgetCheckData = this.budgetCheckData.filter(x => !this.budget_income.includes(x))
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll4 = false
			} else {
				Object.keys(this.budget_income).forEach(j => {
					this.budgetCheckData.push(this.budget_income[j])
				})
				this.budgetCheckData = [...new Set(this.budgetCheckData)]
				this.budgetAll4 = true
			}
		},
		/**
		 * [budgetCheckAllChange4 流量表格的收益指标的单选]
		 * @return {[type]} [description]
		 */
		budgetCheckAllChange4(data) {
			let dataAll = [...data].filter(item => this.budget_income.indexOf(item) > -1)
			this.budgetAll4 = dataAll.length === this.budget_income.length
		},
		/**
		 * [budgetJudgeAll 流量表格的删除的复选]
		 * @return {[type]} [description]
		 */
		budgetClose(event, name) {
			const index = this.budgetCheckData.indexOf(name)
			this.budgetCheckData.splice(index, 1)
			this.budgetJudgeAll()
		},
		/**
		 * [budgetJudgeAll 流量表格的全选的判断]
		 * @return {[type]} [description]
		 */
		budgetJudgeAll() {
			this.budgetCheckData = [...new Set(this.budgetCheckData)]
			// 数据维度
			let dataAll1 = [...this.budgetCheckData].filter(item => this.budget_info.indexOf(item) > -1)
			this.budgetAll1 = dataAll1.length === this.budget_info.length
			// 基本指标
			let dataAll2 = [...this.budgetCheckData].filter(item => this.budget_basic.indexOf(item) > -1)
			this.budgetAll2 = dataAll2.length === this.budget_basic.length
			// 效果指标
			let dataAll3 = [...this.budgetCheckData].filter(item => this.budget_effect.indexOf(item) > -1)
			this.budgetAll3 = dataAll3.length === this.budget_effect.length
			// 收益指标
			let dataAll4 = [...this.budgetCheckData].filter(item => this.budget_income.indexOf(item) > -1)
			this.budgetAll4 = dataAll4.length === this.budget_income.length
		},
		/**
		 * [getNumberInt 转换成千分位，保留两位小数]
		 * @return {[type]} [description]
		 */
		getNumberFloat(val) {
			if (val) {
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
			} else {
				return 0
			}
		},
		/**
		 * [getNumberInt 获取数据的同比值]
		 * @return {[type]} [description]
		 */
		getProportion(curVal, preVal) {
			if (!!curVal && !!preVal && !isNaN(curVal)) {
				let result = Math.round(((curVal - preVal) / Math.abs(preVal)) * 100)
				return Math.abs(result) < 1 ? 0 : result
			} else {
				return 0
			}
		},
		/**
		 * [getNumberInt 转换成千分位]
		 * @return {[type]} [description]
		 */
		getNumberInt(val) {
			if (val) {
				return parseInt(val).toLocaleString()
			} else {
				return 0
			}
		},
		/**
		 * [submitData 点击自定义的提交]
		 * @return {[type]} [description]
		 */
		submitData() {
			this.submitClock = true
			if (this.mediaCheckData.length === 0) {
				this.$Message.error('请选择对应的列')
				this.submitClock = false
				return false
			}
			if (this.budgetCheckData.length === 0) {
				this.$Message.error('请选择对应的列')
				this.submitClock = false
				return false
			}
			this.tableMediaUpdate()
			this.tableBudgetUpdate()
		},
		/**
		 * [tableMediaUpdate 父表自定义列的提交]
		 * @return {[type]} [description]
		 */
		tableMediaUpdate() {
			let obj = {}
			obj.table_id = this.mainTableId
			this.mediaCheckData = [...new Set(this.mediaCheckData)]
			obj.select_str = this.mediaCheckData.toString()
			setTableHeadApi(obj).then(data => {}, err => {
				this.submitClock = false
			})
		},
		/**
		 * [tableBudgetUpdate 子表自定义列的提交]
		 * @return {[type]} [description]
		 */
		tableBudgetUpdate() {
			let obj = {}
			obj.table_id = this.sonTableId
			this.budgetCheckData = [...new Set(this.budgetCheckData)]
			obj.select_str = this.budgetCheckData.toString()
			setTableHeadApi(obj).then(data => {
				this.submitClock = false
				this.getTableInfo()
				this.columnDrawer = false
			}, err => {
				this.submitClock = false
			})
		},

		/********************************************
		*↓↓↓↓↓↓↓↓↓↓ 以上部分为搜索联动 start *↓↓↓↓↓↓↓
		********************************************/
		/**
		 * [_getDspCompanyList 获取预算方公司数据]
		 * @return {[type]} [description]
		 */
		async _getDspCompanyList(action) {
			let storeUser = this.$store.state.user
			let resArr = storeUser.allDspCompanyArr.length ? storeUser.allDspCompanyArr : await this.getDspCompanyList()
			this.dspCompanyList = resArr
		},
		/**
		 * [searchDspSlot 预算位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		searchDspSlot(query) {
			this.dspSlotLoad = true
			this.getDspSlotList(query)
		},
		/**
		 * [clearSearchDspSlot 清空预算位]
		 * @return {[type]} [description]
		 */
		clearSearchDspSlot(arr) {
			if (arr.length === 0) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [dspSlotQueryChange 预算位-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		dspSlotQueryChange(query) {
			if (!query) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [getDspSlotList 预算位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}	   [description]
		 */
		getDspSlotList: debounce(function(query) {
			let _params = {
				dsp_company_id: this.search.dsp_company_id_arr,
				page_size: (!!query || this.search.dsp_company_id_arr.length) ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getDspSlotList(_params).then(res => {
				this.dspSlotLoad = false
				if (res.code === 200) {
					this.dspSlotList = res.data.list

					if (!query) {
						this.catchDspSlotList = res.data.list
					}
				}
			})
		}, 1000),
		/**
		 * [getDspProductList 获取产品列表]
		 * @return {[type]} [description]
		 */
		getDspProductList() {
			getDspProductList().then(res => {
				if(res.code === 200) {
					this.dspProductList = res.data.list || []
				}
			})
		}
		/********************************************
		*↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		********************************************/
	},
	watch: {
		/**
		 * 选择预算方
		 */
		'search.dsp_company_id_arr': {
			handler: function(val) {
				this.getDspSlotList()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl';
/deep/ .data-table
	.ivu-table-tbody
		tr:last-child
			td
				border-bottom 1px solid #e8eaec
/deep/ .ivu-drawer-header{
	padding-left 38px
}
/deep/.console-table
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height 32px
</style>
