<!-- by 李想 -->
<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
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
					<Tooltip placement="left">
						<Button class="host" type="text" @click="drawerModalFlag = true,column_active =1">自定义列
							<Icon type="md-help-circle"></Icon>
						</Button>
						<div slot="content">
							<p class="top_text">自定义表格表头，并永久记忆</p>
							<p class="top_text">列只有选择预算位名称，才可展开查看其</p>
							<p class="top_text">关联广告位的数据</p>
						</div>
					</Tooltip>
					<Button class="host" type="text" v-if="_isShow_('download')" :loading="submitClock" @click="downStatement">
						<i class="iconfont icon-download"></i>
						<span v-if="!submitClock">{{!submitClock ? '下载报表' : '下载中...'}}</span>
					</Button>
				</div>
			</div>
			<div class="search-line" ref="search-line">
				<DatePicker class="i-margin-right-11 i-width-time mar-bot-10" :clearable="false" type="date" :options="datePickerOptions" format="yyyy-MM-dd" :transfer="true" placeholder="请选择日期" :value="datePickerTime" @on-change="datePickerChange"></DatePicker>

				<TimePicker :steps="[1, 60, 60]" placeholder="全部时间" format="HH:mm" class="i-margin-right-11 i-width-status mar-bot-10" @on-change="timeChange"></TimePicker>

			  	<Select
					class="i-margin-right-11 i-width-select mar-bot-10"
					multiple
					filterable
					v-model="filterSearch.dsp_company_id_arr"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="公司名称/ID"
				>
					<Option v-for="item in dspCompanyList" :value="item.id" :key="item.id">{{item.company_name}} (ID:{{item.id}})</Option>
				</Select>

				<!-- 预算位名称 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
					v-model="filterSearch.dsp_slot_id_arr_select"
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
					v-model="filterSearch.dsp_product_id_arr"
					placeholder="产品名称/ID"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
				>
					<Option v-for="item in dspProductList" :value="item.id" :key="item.id">{{ item.name }} (ID:{{item.id}})</Option>
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

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_id_arr_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位ID" />

				<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" v-model.trim="filterSearch.dsp_slot_code_textarea" :clearable="true" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算方广告位ID"/>

		 		<Input type="textarea" class="i-margin-right-11 i-width-textarea mar-bot-10" clearable v-model.trim="filterSearch.dsp_slot_name_textarea" :rows="1" :autosize="{maxRows:1, minRows: 1}" placeholder="批量预算位名称" />

				<Button class="mar-bot-10" type="primary" @click="doFilterList">查询</Button>
			</div>

			<!-- table数据 -->
			<div class="data-table console-table" v-show="navType === 'table'">
				<Table
					highlight-row
					stripe
					border
					:loading="tableLoadFlag"
					:columns="parentHourColumns"
					:data="budgetHourData"
					@on-sort-change="sortChange"
					@on-cell-click="onExpand"
					:height="tableHeight"
					show-summary
					sum-text="总计"
					:summary-method="handleSummary"
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
					<!--公司/账号名称 -->
					<template slot-scope="{ row }" slot="company_name">
						<p v-if="row.company_name" class="name-row-ellipsis" :title="row.company_name">{{ row.company_name }}</p>
						<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
					</template>
					<!--预算位名称 -->
					<template slot-scope="{ row }" slot="dsp_slot_name">
						<div class="control-flex">
							<div class="control-left">
								<p v-if="row.dsp_slot_name" class="name-row-ellipsis" :title="row.dsp_slot_name">{{ row.dsp_slot_name }}</p>
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
					<!-- 素材尺寸比例 -->
					<template slot-scope="{ row }" slot="dsp_slot_ratio">
						<p class="table_text">{{row.dsp_slot_ratio}}</p>
					</template>

					<!-- 产品名称 -->
					<template slot-scope="{ row }" slot="dsp_product_name">
						<p class="table_text">{{ row.dsp_product_name || '-' }}</p>
					</template>

					<!--预算方广告位ID-->
					<template slot-scope="{ row }" slot="dsp_slot_code">
						<p class="text-row-ellipsis" :title="row.dsp_slot_code">{{ row.dsp_slot_code }}</p>
					</template>
					<!--广告位类型-->
					<template slot-scope="{ row }" slot="ad_type">
						<p class="table_text">{{adTypeText(row.ad_type_id)}}-{{creativeIdText(row.creative_type)}}</p>
					</template>
					<!-- 数据维度 end   -------------------->

					<!-- 基本指标 start ******************-->
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
						<Radio :label="1">预算表格设置</Radio>
						<Radio :label="2">流量表格设置</Radio>
					</RadioGroup>
					<div class="col_detail">
						<div class="budget_table" v-if="column_active === 1">
							<Row>
								<Col :span="16">
									<div class="col_title">可选择列</div>
									<div class="optional_detail">
										<!-- 预算-数据维度 -->
										<div class="checkout_content">
											<div class="check_title">
												<Checkbox
													:value="budget_data_dimension_isAll"
													@click.prevent.native="budgetCheckAll1">数据维度</Checkbox>
											</div>
											<CheckboxGroup v-model="budgetHasCheckData" @on-change="budgetCheckAllChange1">
												<Checkbox class="option_check" v-for="item in budget_data_dimension" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-基本指标 -->
										<div class="checkout_content" v-show="budget_basic_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="budget_basic_indicators_isAll"
													@click.prevent.native="budgetCheckAll2">基本指标</Checkbox>
											</div>
											<CheckboxGroup v-model="budgetHasCheckData" @on-change="budgetCheckAllChange2">
												<Checkbox class="option_check" v-for="item in budget_basic_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-效果指标 -->
										<div class="checkout_content" v-show="budget_effect_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="budget_effect_indicators_isAll"
													@click.prevent.native="budgetCheckAll3">效果指标</Checkbox>
											</div>
											<CheckboxGroup v-model="budgetHasCheckData" @on-change="budgetCheckAllChange3">
												<Checkbox class="option_check" v-for="item in budget_effect_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 预算-收益指标 -->
										<div class="checkout_content" v-show="budget_income_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="budget_income_indicators_isAll"
													@click.prevent.native="budgetCheckAll4">收益指标</Checkbox>
											</div>
											<CheckboxGroup v-model="budgetHasCheckData" @on-change="budgetCheckAllChange4">
												<Checkbox class="option_check" v-for="item in budget_income_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
									</div>
								</Col>
								<Col :span="8">
									<div class="col_title">已选择列</div>
									<div class="select_con">
										<Tag v-for="item in budgetHasCheckData" :key="item" :name="item" closable @on-close="budgetClose">{{item}}</Tag>
									</div>
								</Col>
							</Row>
						</div>
						<div class="media_table" v-if="column_active === 2">
							<Row>
								<Col :span="16">
									<div class="col_title">可选择列</div>
									<div class="optional_detail">
										<!-- 流量-数据维度 -->
										<div class="checkout_content">
											<div class="check_title">
												<Checkbox
													:value="traffic_data_dimension_isAll"
													@click.prevent.native="trafficDataDimSelectAll">数据维度</Checkbox>
											</div>
											<CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficDataDimChange">
												<Checkbox class="option_check" v-for="item in traffic_data_dimension" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-基本指标 -->
										<div class="checkout_content" v-show="traffic_basic_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="traffic_basic_indicators_isAll"
													@click.prevent.native="trafficBasicIndiSelectAll">基本指标</Checkbox>
											</div>
											<CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficBasicIndiChange">
												<Checkbox class="option_check" v-for="item in traffic_basic_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-效果指标 -->
										<div class="checkout_content" v-show="traffic_effect_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="traffic_effect_indicators_isAll"
													@click.prevent.native="trafficEffectIndiSelectAll">效果指标</Checkbox>
											</div>
											<CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficEffectIndiChange">
												<Checkbox class="option_check" v-for="item in traffic_effect_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
										<!-- 流量-收益指标 -->
										<div class="checkout_content" v-show="traffic_income_indicators.length > 0">
											<div class="check_title">
												<Checkbox
													:value="traffic_income_indicators_isAll"
													@click.prevent.native="trafficIncomeIndiSelectAll">收益指标</Checkbox>
											</div>
											<CheckboxGroup v-model="trafficHasCheckData" @on-change="trafficIncomeIndiChange">
												<Checkbox class="option_check" v-for="item in traffic_income_indicators" :key="item" :label="item">
													<span>{{item}}</span>
												</Checkbox>
											</CheckboxGroup>
										</div>
									</div>
								</Col>
								<Col :span="8">
									<div class="col_title">已选择列</div>
									<div class="select_con">
										<Tag v-for="item in trafficHasCheckData" :key="item" :name="item" closable @on-close="mediaClose">{{item}}</Tag>
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
import { dataType, filterBatchQuery } from '@/libs/util'
import { debounce, throttle, formatDate, number2Thousand, createObjectURL } from '@/libs/tools'
import { setTableHeadApi, tableInfoApi, getDownLoadXls } from '@/api/common'
import { getDspHourData, getDspHourDataUrl } from '@/api/data'
import { getDspSlotList, getDspProductList } from '@/api/dsp'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { customColumn } from './custom-column.js'
import sourceTable from './source-table'
import tEchart from '../module/echart'
import { mapActions } from 'vuex'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'dsp-data-hour',
	mixins: [tableHeight, customColumn, inPageAccess],
	components: { sourceTable, tEchart },
	data() {
		return {
			dspTableId: 8,
			sspTableId: 9,

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
				start_date: null,
				end_date: null,
				order: null, // 排序
				group: [], // 维度
				dsp_company_id_arr: [], // 公司名称
				creative_type_arr: [], // 广告位类型
				dsp_slot_id_arr: [], // 预算位名称
		  		dsp_slot_code: [], // 预算方广告位code
		  		dsp_slot_name_arr: [], //预算位名称
				dsp_product_id_arr: [], // 产品名称

				dsp_slot_id_arr_select: [], // 预算位名称/ID(单个)
				dsp_slot_id_arr_textarea: null, // 预算位名称(多个)
				dsp_slot_code_textarea: null, // 预算方广告位code_textarea
				dsp_slot_name_textarea: null // 预算位名称
			},

			groupByArr: [], // 聚合条件，最后下载使用

			navType: 'table', // nav切换, table / echart
			dspCompanyList: [], // 预算位公司名称列表

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			dspProductList: [], // 产品列表

			slotSelectList: [], // 广告位名称数组
			budgetHourData: [], // 表格数据
			parentHourColumns: [], // 表格 - columns
			childHourSourceColumns: [], //  子表格 - columns
			budgetHourDataStatics: [], // 表格数据合计

			tableLoadFlag: true,

			drawerModalFlag: false, // 抽屉开关
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},

			// 抽屉 - 自定义
			traffic_data_dimension_isAll: false, // 流量-数据维度是否全选
			traffic_basic_indicators_isAll: false, // 流量-基本指标是否全选
			traffic_effect_indicators_isAll: false, // 流量-效果指标是否全选
			traffic_income_indicators_isAll: false, // 流量-收益指标是否全选

			budget_data_dimension_isAll: false, // 预算-数据维度是否全选
			budget_basic_indicators_isAll: false, // 预算-基本指标是否全选
			budget_effect_indicators_isAll: false, // 预算-效果指标是否全选
			budget_income_indicators_isAll: false, // 预算-收益指标是否全选


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
				this.getReportTitle()
			} else {
				// admin账号，全部权限
				this.echartArr = this.$store.state.app.budgetDataList.filter(item => !!item.inDataSourceSelect && this.budgetHasCheckData.includes(item.label))
			}

			this.initLinkage() // 初始化联动
			this._tableInfoApi() // 获取抽屉 表头
			this.initMoniter() // 初始化加载图标
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: true, isInclude: true}, 'nav-handle-group': false, 'table-has-amount': true}) // search-line的高度
	},
	methods: {
		...mapActions([
			'getDspCompanyList',
			'tableInfoApi',
			'setTableHeadApi',
			'setTablePageApi'
		]),
		/**
		 * [initSearchFilter 初始化筛选联动]
		 * @return {[type]} [description]
		 */
		initLinkage() {
			this.initDatePickerTime() // 初始化筛选时间
			this._getDspCompanyList() // 预算方-公司名称
			this.getDspSlotList() // 预算方-预算位
			this.getDspProductList() // 产品列表
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
			flowList.map(item => {
				if (flowFields.includes(item.key)) {
					flowArr.push(item.label)
				}
			})
			this.flowArr = flowArr

			// 预算
			let budgetArr = []
			let _echartArr = [] // echart使用
			budgetList.map(item => {
				if (budgetFields.includes(item.key)) {
					budgetArr.push(item.label)
				}

				if(budgetFields.includes(item.key) && !!item.inDataSourceSelect) {
					_echartArr.push(item)
				}
			})
			this.budgetArr = budgetArr
			this.echartArr = _echartArr


			// 流量
			this.traffic_basic_indicators = this.traffic_basic_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.traffic_effect_indicators = this.traffic_effect_indicators.filter(item => flowArr.indexOf(item) > -1)
			this.traffic_income_indicators = this.traffic_income_indicators.filter(item => flowArr.indexOf(item) > -1)
			let allFlow = flowArr.concat(this.traffic_data_dimension)
			this.trafficHasCheckData = this.trafficHasCheckData.filter(item => allFlow.indexOf(item) > -1)


			// 预算
			this.budget_basic_indicators = this.budget_basic_indicators.filter(item => budgetArr.indexOf(item) > -1)
			this.budget_effect_indicators = this.budget_effect_indicators.filter(item => budgetArr.indexOf(item) > -1)
			this.budget_income_indicators = this.budget_income_indicators.filter(item => budgetArr.indexOf(item) > -1)
			let allBudget = budgetArr.concat(this.budget_data_dimension)
			this.budgetHasCheckData = this.budgetHasCheckData.filter(item => allBudget.indexOf(item) > -1)

		},
		/**
		 * [doFilterList 筛选查询]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1

			let _filter = this.filterSearch

			// 此处有容处理
			// 预算位ID查询
			// 1. 预算位Id多选和单选，最后统一按照 ssp_slot_id_arr 一并传参（包含ssp_slot_id_textarea / ssp_slot_id_arr_select 两个筛选条件）
			let textSplitArr = filterBatchQuery({value: _filter.dsp_slot_id_arr_textarea, type: 'number'})
			_filter.dsp_slot_id_arr = Array.from(new Set([...textSplitArr, ..._filter.dsp_slot_id_arr_select]))

			// 预算方广告位ID
			_filter.dsp_slot_code = filterBatchQuery({value: _filter.dsp_slot_code_textarea})

			// 预算方名称
			_filter.dsp_slot_name_arr = filterBatchQuery({value: _filter.dsp_slot_name_textarea})

			this.initDspHourData()
			this.initMoniter()
		},

		/**
		 * [changePage 改变页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}	 [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.initDspHourData()
		},

		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}	  [description]
		 */
		sizeChange(size) {
			this.pageSize = size

			this.setTablePageApi({table_id: this.dspTableId, page_num: size}).then(()=> {
				this.initDspHourData()
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
					group: ['date'], // 时间维度
					order: this.filterSearch.order,
					start_date: this.filterSearch.start_date,
					end_date: this.filterSearch.end_date,
					page_num: 1,
					page_size: 0
				}
			}

			getDspHourData(params).then(res=> {

				let obj = {}

				if(res.code === 200) {

					let _list = res.data.list.reverse()

					_list.map(item=> {
						for(let key in item) {
							let temp = !!obj[key] ? obj[key] : []
							obj[key] = temp.concat(item[key])
						}
					})
				}

				this.$refs.tEchart.initData(obj)
			})
		},

		/**
		 * [initDspHourData 获取表格数据]
		 * @return {[type]} [description]
		 */
		async initDspHourData() {
			let _filter = this.filterSearch

			let params = { ...this.getAxiosParams(),
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
			this.budgetHasCheckData.map(item=> {

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

 			params.group = group

 			this.groupByArr = [...group]

			this.tableLoadFlag = true

 			const curRes = await getDspHourData(params) // 获取当前数据

			if (curRes.code === 200) {

				this.total_count = curRes.data.total_count // 总数

				// 空数据的情况下， 停止执行
				if (curRes.data.list.length === 0) {
					this.tableLoadFlag = false
					this.budgetHourData = curRes.data.list
					return
				}

 				this.budgetHourDataStatics = this.formatThouStatics([curRes.data.total]) // 合计.千分位格式化


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

				const preRes = await getDspHourData(preParams) // 获取前一小时的数据

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
		 * [formatThouStatics 总计 千分位格式化]
		 * @param  {[type]} curArr [description]
		 * @param  {[type]} preArr [description]
		 * @param  {[type]} group [作为聚合条件]
		 * @return {[type]}		[description]
		 */
		formatThouStatics(curArr) {
			// 需要计算千分位的数据
			let _calcArr = []
			this.parentHourColumns.map(item=> {
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
			let sumData = this.budgetHourDataStatics[0]
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
		 * @param  {[type]} curArr [description]
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
					let preTime = formatDate(new Date(child.date).getTime() + 60 * 60 * 1000, 'yyyy-MM-dd HH:mm:ss')

					if (item.date === preTime && (eval(juadgArr.join(' && ')) === undefined ? true : eval(juadgArr.join(' && ')))) {
						item['pre'] = child
					}
				})
				tempArr.push(item)
			})
			// 根据group匹配前一日 end

			// 需要计算千分位的数据
			let _calcArr = []
			this.parentHourColumns.map(item=> {
				if(!item.noNeedCalcThou) {
					_calcArr.push(item.slot)
				}
			})

			// 耦合前一小时的数据
			tempArr.map(item => {
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

			this.budgetHourData = tempArr // 列表
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
				url: getDspHourDataUrl(params)
			}

			this.submitClock = true

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = `${this.datePickerTime}预算数据(时).xlsx`
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
								tableColumnsData: this.childHourSourceColumns,
								hasDeleteSourceRole: this._isShow_('deleteSource'), // 是否有删除子表的权限
								childHasCheckData: this.trafficHasCheckData // trafficHasCheckData
							}
						})
					}
				},

				// 数据维度
				{title: '时间', key: 'date', slot: 'date', width: 80, minWidth: 80, sortable: 'custom', noNeedCalcThou: true},
		  		{title: '公司/账号名称', header: '公司/账号名称/ID', key: 'company_name', slot: 'company_name', minWidth: 130, noNeedCalcThou: true},
				{title: '产品名称', key: 'dsp_product_name', slot: 'dsp_product_name', minWidth: 180, noNeedCalcThou: true},
		  		{title: '预算位名称', header: '预算位名称/ID', key: 'dsp_slot_name', slot: 'dsp_slot_name', width: 200, noNeedCalcThou: true},
		  		{title: '素材尺寸比例', key: 'dsp_slot_ratio', slot: 'dsp_slot_ratio', width: 100, noNeedCalcThou: true},
		  		{title: '预算方广告位ID', key: 'dsp_slot_code', slot: 'dsp_slot_code', width: 230, noNeedCalcThou: true},

		  		{title: '广告位类型', key: 'ad_type', slot: 'ad_type', width: 200, noNeedCalcThou: true},

				// 基本指标
		  		{title: '有效广告请求pv', key: 'req_pv', slot: 'req_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '有效广告请求uv', key: 'req_uv', slot: 'req_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回pv', key: 'ret_pv', slot: 'ret_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回uv', key: 'ret_uv', slot: 'ret_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现pv', key: 'show_pv', slot: 'show_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现uv', key: 'show_uv', slot: 'show_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击pv', key: 'click_pv', slot: 'click_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击uv', key: 'click_uv', slot: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', key: 'jc_pv', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', key: 'dplsucc_pv', slot: 'dplsucc_pv', minWidth: 130, sortable: 'custom'},
				{title: '下载完成量', key: 'complete_pv', slot: 'complete_pv', minWidth: 130, sortable: 'custom'},
				{title: '安装量', key: 'install_pv', slot: 'install_pv', minWidth: 130, sortable: 'custom'},
				{title: '激活量', key: 'activate_pv', slot: 'activate_pv', minWidth: 130, sortable: 'custom'},

				// 效果指标
		  		{title: '填充率', key: 'fill_rates', slot: 'fill_rates', minWidth: 100, sortable: 'custom'},
		  		{title: '展现率', key: 'show_rates', slot: 'show_rates', minWidth: 100, sortable: 'custom'},
		 		{title: '点击率', key: 'ctr', slot: 'ctr', minWidth: 100, sortable: 'custom'},
		  		{title: '调起率', key: 'dplsucc_rates', slot: 'dplsucc_rates', minWidth: 100, sortable: 'custom'},
		  		{title: '下载完成率', key: 'complete_rates', slot: 'complete_rates', minWidth: 130, sortable: 'custom'},
				{title: '安装率', key: 'install_rates', slot: 'install_rates', minWidth: 130, sortable: 'custom'},
				{title: '激活率', key: 'activate_rates', slot: 'activate_rates', minWidth: 130, sortable: 'custom'},
				{title: '媒体eCPM', key: 'ecpm_dev', slot: 'ecpm_dev', minWidth: 100, sortable: 'custom'},
		  		{title: '媒体CPC', key: 'cpc_dev', slot: 'cpc_dev', minWidth: 90, sortable: 'custom'},

				// 收益指标
				{title: '成本', key: 'spend', slot: 'spend', minWidth: 90, sortable: 'custom'},
			]

			// 筛选表格
			let resultArr = []
			let extraMust = ['date', 'index'] // 额外必须存在的字段

			ColumnList.map(item => {
				// 时间不可取消
				if((item.type === 'expand' && this._isShow_('viewSource')) || extraMust.includes(item.slot) || this.budgetHasCheckData.indexOf(item.title) > -1) {
					item.title = item.header || item.title
					resultArr.push(item)
				}
			})

			if (!this.budgetHasCheckData.includes('预算位名称')) {
				resultArr.splice(1, 1)
			}

			this.parentHourColumns = resultArr
		},
		/**
		 * [getChildColumns 设置父级 设置子表格的列]
		 * @return {[type]} [description]
		 */
		getChildColumns () {
			const ColumnList = [

				//数据维度
				{title: '时间', slot: 'date', width: 80, minWidth: 80, sortable: 'custom', noNeedCalcThou: true},
		  		{title: '媒体简称', header: '媒体名称/ID', slot: 'company_short_name', minWidth: 100, noNeedCalcThou: true},
		  		{title: '应用平台', slot: 'os_type', width: 60, noNeedCalcThou: true},
		 		{title: '应用名称', header: '应用名称/ID', slot: 'app_name', minWidth: 150, noNeedCalcThou: true},
		  		{title: '广告位名称', slot: 'ssp_slot_name', width: 200, noNeedCalcThou: true},
		  		{title: '素材尺寸比例', key: 'ssp_slot_ratio', slot: 'ssp_slot_ratio', width: 100, noNeedCalcThou: true},
		  		{title: '广告位类型', slot: 'ad_type', width: 200, noNeedCalcThou: true},

				// 基本指标
		  		{title: '有效广告请求pv', slot: 'req_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '有效广告请求uv', slot: 'req_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回pv', slot: 'ret_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告返回uv', slot: 'ret_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现pv', slot: 'show_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告展现uv', slot: 'show_uv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击pv', slot: 'click_pv', minWidth: 130, sortable: 'custom'},
		  		{title: '广告点击uv', slot: 'click_uv', minWidth: 130, sortable: 'custom'},
				{title: '加群点击数', slot: 'jc_pv', minWidth: 130, sortable: 'custom'},
				{title: '调起数', slot: 'dplsucc_pv', minWidth: 120, sortable: 'custom'},
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
				if(item.slot === 'date' || this.trafficHasCheckData.indexOf(item.title) > -1) {
					resultArr.push(item)
				}
			})

			this.childHourSourceColumns = resultArr
		},

		// 表格的排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				this.filterSearch.order = col.column.slot
				this.currentPage = 1
				this.initDspHourData()
			} else if (col.order === 'desc') {
				this.filterSearch.order = col.column.slot + ' ' + col.order
				this.currentPage = 1
				this.initDspHourData()
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

			this.pageSize = resArr[`table_page_page_${this.dspTableId}`] || 10

			// 流量表格 - 设置  -  主要是用来判断是否全选
			// 预算数据子表表头记忆
			let sspKey = resArr[`table_head_head_${this.sspTableId}`]
			if (sspKey) {
				let curArr = sspKey.split(',')

				// 流量
				if (!this.$store.getters.getUserAllFields) {
					let allFlow = this.flowArr.concat(this.traffic_data_dimension)
					this.trafficHasCheckData = curArr.filter(item => allFlow.indexOf(item) > -1)
				} else {
					this.trafficHasCheckData = curArr
				}
			}

			this.trafficJudgeAll() // 判断流量是否全选

			// 预算表格 - 设置 - 主要是用来判断是否全选
			// 预算数据主表表头记忆
			let dspKey = resArr[`table_head_head_${this.dspTableId}`]
			if (dspKey) {
				let curArr = dspKey.split(',')

				// 预算
				if (!this.$store.getters.getUserAllFields) {
					let allBudget = this.budgetArr.concat(this.budget_data_dimension)
					this.budgetHasCheckData = curArr.filter(item => allBudget.indexOf(item) > -1)
				} else {
					this.budgetHasCheckData = curArr
				}
			}

			this.budgeJudgeAll() // 判断预算是否全选

			this.getParentColumns() // 初始化表格数据
			this.getChildColumns() // 初始化子表格数据
			this.initDspHourData() // 初始化获取table数据
		},
		// 这个循环是为了每次只能展开一个，其他自动收起，不需要可以去掉
		onExpand(row, column, data, event) {
			if (column.type === 'expand') {
				let curArr = [...this.budgetHourData]
				curArr.map((item, index)=> {
					if(index === row._index) {
						item._expanded = !item._expanded
					} else {
						item._expanded = false
					}
				})
				this.budgetHourData = curArr
			}
		},

		/**
		 * [trafficJudgeAll 流量判断是否全选]
		 * @return {[type]} [description]
		 */
		trafficJudgeAll() {
			this.trafficHasCheckData = [...new Set(this.trafficHasCheckData)]

			// 接下来判断维度是否全选
			let data_dimension_arr = [] // 数据维度
			let basic_indicators = [] // 基本指标
			let effect_indicators = [] // 效果指标
			let income_indicators = [] // 收益指标
			this.trafficHasCheckData.map(item => {

				// 流量表格 - 数据维度
				if (this.traffic_data_dimension.indexOf(item) > -1) {
					data_dimension_arr.push(item)
				}

				// 流量表格 - 基本指标
				if (this.traffic_basic_indicators.indexOf(item) > -1) {
					basic_indicators.push(item)
				}

				if (this.traffic_effect_indicators.indexOf(item) > -1) {
					effect_indicators.push(item)
				}

				if (this.traffic_income_indicators.indexOf(item) > -1) {
					income_indicators.push(item)
				}
			})

			this.traffic_data_dimension_isAll = data_dimension_arr.length === this.traffic_data_dimension.length // 流量-数据维度
			this.traffic_basic_indicators_isAll = basic_indicators.length === this.traffic_basic_indicators.length // 流量-基本指标
			this.traffic_effect_indicators_isAll = effect_indicators.length === this.traffic_effect_indicators.length // 流量-效果指标
			this.traffic_income_indicators_isAll = income_indicators.length === this.traffic_income_indicators.length // 流量-收益指标
		},

		/**
		 * [budgeJudgeAll 判断预算是否全选]
		 * @return {[type]} [description]
		 */
		budgeJudgeAll() {
			this.budgetHasCheckData = [...new Set(this.budgetHasCheckData)]
			// 接下来判断维度是否全选
			let data_dimension_arr = [] // 数据维度
			let basic_indicators = [] // 基本指标
			let effect_indicators = [] // 效果指标
			let income_indicators = [] // 收益指标
			this.budgetHasCheckData.map(item => {
				// 流量表格 - 数据维度
				if (this.budget_data_dimension.indexOf(item) > -1) {
					data_dimension_arr.push(item)
				}

				// 流量表格 - 基本指标
				if (this.budget_basic_indicators.indexOf(item) > -1) {
					basic_indicators.push(item)
				}

				if (this.budget_effect_indicators.indexOf(item) > -1) {
					effect_indicators.push(item)
				}

				if (this.budget_income_indicators.indexOf(item) > -1) {
					income_indicators.push(item)
				}
			})

			this.budget_data_dimension_isAll = data_dimension_arr.length === this.budget_data_dimension.length // 流量-数据维度
			this.budget_basic_indicators_isAll = basic_indicators.length === this.budget_basic_indicators.length // 流量-基本指标
			this.budget_effect_indicators_isAll = effect_indicators.length === this.budget_effect_indicators.length // 流量-效果指标
			this.budget_income_indicators_isAll = income_indicators.length === this.budget_income_indicators.length // 流量-收益指标
		},

		/**
		 * [trafficDataDimSelectAll 流量表格  数据维度 选择全部]
		 * @return {[type]} [description]
		 */
		trafficDataDimSelectAll() {
			let resultArr = this.traffic_data_dimension_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_data_dimension.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_data_dimension]

			this.trafficHasCheckData = [...new Set(resultArr)]
			this.traffic_data_dimension_isAll = !this.traffic_data_dimension_isAll
		},
		/**
		 * [trafficDataDimChange 流量表格  数据维度 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		trafficDataDimChange(data) {
			let dataAll = [...data].filter(item => this.traffic_data_dimension.indexOf(item) > -1)

			this.traffic_data_dimension_isAll = dataAll.length === this.traffic_data_dimension.length
		},
		/**
		 * [trafficBasicIndiSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		trafficBasicIndiSelectAll() {
			let resultArr = this.traffic_basic_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_basic_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_basic_indicators]

			this.trafficHasCheckData = [...new Set(resultArr)]
			this.traffic_basic_indicators_isAll = !this.traffic_basic_indicators_isAll
		},
		/**
		 * [trafficBasicIndiChange 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]}	  [description]
		 */
		trafficBasicIndiChange(data) {
			let dataAll = [...data].filter(item => this.traffic_basic_indicators.indexOf(item) > -1)

			this.traffic_basic_indicators_isAll = dataAll.length === this.traffic_basic_indicators.length
		},
		/**
		 * [trafficEffectIndiSelectAll 流量表格  基本指标 选择全部]
		 * @return {[type]} [description]
		 */
		trafficEffectIndiSelectAll() {
			let resultArr = this.traffic_effect_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_effect_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_effect_indicators]

			this.trafficHasCheckData = [...new Set(resultArr)]
			this.traffic_effect_indicators_isAll = !this.traffic_effect_indicators_isAll
		},
		/**
		 * [trafficEffectIndiSelectAll 流量表格  基本指标 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		trafficEffectIndiChange(data) {
			let dataAll = [...data].filter(item => this.traffic_effect_indicators.indexOf(item) > -1)

			this.traffic_effect_indicators_isAll = dataAll.length === this.traffic_effect_indicators.length
		},
		/**
		 * [trafficEffectIndiSelectAll 流量表格  收益指标的筛选 选择全部]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		trafficIncomeIndiSelectAll() {
			let resultArr = this.traffic_income_indicators_isAll ? this.trafficHasCheckData.filter(x => !this.traffic_income_indicators.includes(x)) : [...this.trafficHasCheckData, ...this.traffic_income_indicators]

			this.trafficHasCheckData = [...new Set(resultArr)]
			this.traffic_income_indicators_isAll = !this.traffic_income_indicators_isAll
		},
		/**
		 * [trafficEffectIndiSelectAll 流量表格  收益指标的筛选 单选]
		 * @param  {[type]} data [description]
		 * @return {[type]} [description]
		 */
		trafficIncomeIndiChange(data) {
			let dataAll = [...data].filter(item => this.traffic_income_indicators.indexOf(item) > -1)

			this.traffic_income_indicators_isAll = dataAll.length === this.traffic_income_indicators.length
		},
		// 流量表格的删除
		mediaClose (event, name) {
			const index = this.trafficHasCheckData.indexOf(name)
			this.trafficHasCheckData.splice(index, 1)
		},
		// 预算表格的全选
		// 数据维度的筛选
		budgetCheckAll1() {
			let resultArr = this.budget_data_dimension_isAll ? this.budgetHasCheckData.filter(x => !this.budget_data_dimension.includes(x)) : [...this.budgetHasCheckData, ...this.budget_data_dimension]

			this.budgetHasCheckData = [...new Set(resultArr)]
			this.budget_data_dimension_isAll = !this.budget_data_dimension_isAll
		},
		budgetCheckAllChange1(data) {
			let dataAll = [...data].filter(item => this.budget_data_dimension.indexOf(item) > -1)

			this.budget_data_dimension_isAll = dataAll.length === this.budget_data_dimension.length
		},
		// 基本指标的筛选
		budgetCheckAll2() {
			let resultArr = this.budget_basic_indicators_isAll ? this.budgetHasCheckData.filter(x => !this.budget_basic_indicators.includes(x)) : [...this.budgetHasCheckData, ...this.budget_basic_indicators]

			this.budgetHasCheckData = [...new Set(resultArr)]
			this.budget_basic_indicators_isAll = !this.budget_basic_indicators_isAll
		},
		budgetCheckAllChange2(data) {
			let dataAll = [...data].filter(item => this.budget_basic_indicators.indexOf(item) > -1)

			this.budget_basic_indicators_isAll = dataAll.length === this.budget_basic_indicators.length
		},
		// 基本指标的筛选
		budgetCheckAll3() {
			let resultArr = this.budget_effect_indicators_isAll ? this.budgetHasCheckData.filter(x => !this.budget_effect_indicators.includes(x)) : [...this.budgetHasCheckData, ...this.budget_effect_indicators]

			this.budgetHasCheckData = [...new Set(resultArr)]
			this.budget_effect_indicators_isAll = !this.budget_effect_indicators_isAll
		},
		budgetCheckAllChange3(data) {
			let dataAll = [...data].filter(item => this.budget_effect_indicators.indexOf(item) > -1)

			this.budget_effect_indicators_isAll = dataAll.length === this.budget_effect_indicators.length
		},
		// 收益指标的筛选
		budgetCheckAll4() {
			let resultArr = this.budget_income_indicators_isAll ? this.budgetHasCheckData.filter(x => !this.budget_income_indicators.includes(x)) : [...this.budgetHasCheckData, ...this.budget_income_indicators]

			this.budgetHasCheckData = [...new Set(resultArr)]
			this.budget_income_indicators_isAll = !this.budget_income_indicators_isAll
		},
		budgetCheckAllChange4(data) {
			let dataAll = [...data].filter(item => this.budget_income_indicators.indexOf(item) > -1)

			this.budget_income_indicators_isAll = dataAll.length === this.budget_income_indicators.length
		},
		// 预算表格的删除
		budgetClose (event, name) {
			const index = this.budgetHasCheckData.indexOf(name)
			this.budgetHasCheckData.splice(index, 1)
		},

		/**
		 * [submitData 自定义列表 提交数据, 需要同时提交两个自定义表单]
		 * @return {[type]} [description]
		 */
		submitData() {
			this.submitClock = true

			// 8=预算小时数据主表，9=预算小时数据子表
			// 流量表格参数
			let traffic_params = {
				table_id: this.dspTableId,
				select_str: this.budgetHasCheckData.join(',')
			}

			// 预算表格参数
			let budget_params = {
				table_id: this.sspTableId,
				select_str: this.trafficHasCheckData.join(',')
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
			if(!query) {
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
				dsp_company_id: this.filterSearch.dsp_company_id_arr,
				page_size: (!!query || this.filterSearch.dsp_company_id_arr.length) ? 10000 : 10,
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
		'filterSearch.dsp_company_id_arr': {
			handler: function(val) {
				this.getDspSlotList()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../table.styl'
.console-table
	margin-top: 5px
.mar-bot-10
	vertical-align: top
	margin-bottom: 10px
	/deep/ textarea.ivu-input
		height: 32px
.tool-size12
	font-size: 12px
.text-row-ellipsis
	font-size: 12px
	overflow: hidden
	display: -webkit-box
	-webkit-box-orient: vertical
	-webkit-line-clamp: 2
	word-break: break-word
</style>
