<template>
	<div class="sublist">
		<i class="iconfont pos" :class="searchStatus ? 'icon-fold-down' : 'icon-fold-up'" @click="toggleSelect"></i>
		<div class="filter-card" v-show="searchStatus">
			<Select class="filter-select" placeholder="预算位名称" v-model="search_id" clearable>
				<Option v-for="item in childHourData" :value="item.dsp_slot_id" :key="item.dsp_slot_id">{{item.dsp_slot_name}}</Option>
			</Select>
			<Button type="primary" @click="getSourceData">查询</Button>
		</div>
		<Table stripe border :columns="childColumnsData" :data="childHourData" @on-sort-change="sortChange" :loading="tableLoadFlag" class="source-table">

			<!-- 数据维度 start ************************* -->
			<!--时间-->
			<template slot-scope="{ row }" slot="date">
				<p class="table_text">{{ curDate.substring(11, 19) }}</p>
			</template>
			<!--公司/账号名称-->
			<template slot-scope="{ row }" slot="company_name">
				<p class="name-row-ellipsis" :title="row.company_name"> {{ row.company_name }}</p>
				<p class="tip-row-line">ID: {{ row.dsp_company_id }}</p>
			</template>
			<!-- 产品名称 -->
			<template slot-scope="{ row }" slot="dsp_product_name">
				<p class="table_text">{{ row.dsp_product_name || '-' }}</p>
			</template>
			<!--预算位名称-->
			<template slot-scope="{ row }" slot="dsp_slot_name">
				<div class="source-handler">
					<div class="label-name">
						<p class="name-row-ellipsis" :title="row.dsp_slot_name"> {{ row.dsp_slot_name }}</p>
						<p class="tip-row-line">ID: {{ row.dsp_slot_id }}</p>
					</div>
					<div class="label-status">
						<Icon @click="deleteUnlink(row)" v-if="row.is_connected && hasDeleteSourceRole" title="删除当前广告位下配置的此预算位" class="delete" type="ios-trash" />
						<img v-if="!row.is_connected" class="deleted" src="~@/assets/image/small-icon/deleted-pic1.png" alt="">
					</div>
				</div>
			</template>
			<!-- 素材尺寸比例 -->
			<template slot-scope="{ row }" slot="dsp_slot_ratio">
				<p class="table_text">{{row.dsp_slot_ratio}}</p>
			</template>
			<!--广告样式-->
			<template slot-scope="{ row }" slot="ad_type">
				<p class="table_text">{{adTypeText(row.ad_type_id)}}-{{creativeIdText(row.creative_type)}}</p>
			</template>
			<!-- 数据维度 end ----------------------- -->

			<!-- 基本指标 start ************************* -->
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
			<!--  广告点击pv-->
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
			<!--广告展现占比-->
			<template slot-scope="{ row }" slot="show_pv_rates">
				<Tooltip placement="right-start" :transfer="true">
					<p class="data_value">{{row.show_pv_rates}}%</p>
					<p class="data_scale" :class="[{'up_scale': row.show_pv_rates_sequential >= 10, 'down_scale' : row.show_pv_rates_sequential <= -10}]">
						{{row.show_pv_rates_sequential}}%
						<Icon v-if="row.show_pv_rates_sequential >= 10 || row.show_pv_rates_sequential <= -10" :type="row.show_pv_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
					</p>
					<div slot="content" class="tool-size12">上一小时:{{row.show_pv_rates_pre}}%</div>
				</Tooltip>
			</template>
			<!--广告点击占比-->
			<template slot-scope="{ row }" slot="click_pv_rates">
				<Tooltip placement="right-start" :transfer="true">
					<p class="data_value">{{row.click_pv_rates}}%</p>
					<p class="data_scale" :class="[{'up_scale': row.click_pv_rates_sequential >= 10, 'down_scale' : row.click_pv_rates_sequential <= -10}]">
						{{row.click_pv_rates_sequential}}%
						<Icon v-if="row.click_pv_rates_sequential >= 10 || row.click_pv_rates_sequential <= -10" :type="row.click_pv_rates_sequential >= 10 ? 'md-arrow-round-up': 'md-arrow-round-down'" />
					</p>
					<div slot="content" class="tool-size12">上一小时:{{row.click_pv_rates_pre}}%</div>
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
			<!-- 下载激活量 -->
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
			<!-- 基本指标 end ----------------------- -->

			<!-- 效果指标 start ************************* -->
			<!--填充率-->
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
			<!--展现率-->
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
			<!--点击率-->
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
			<!--调起率-->
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
			<!-- 下载激活率 -->
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
			<!-- 效果指标 end ----------------------- -->

			<!-- 收益指标 start ***************************** -->
			<!--成本-->
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
			<!-- 收益指标 end ------------------------ -->

		</Table>
	</div>
</template>

<script>
import { dataType} from '@/libs/util'
import { getSspHourDataSource , deleteSspUnlink} from '@/api/data'
import { formatDate, number2Thousand } from '@/libs/tools'

export default {
 	name: 'traffic-hour-source',
	props: {
		row: Object,
		childColumnsData: Array, // table列表名称
		curDate: String, // 日期
		childHasCheckData: Array,
 		hasDeleteSourceRole: Boolean // 是否有删除子表的权限
	},
 	data() {
 		return {
		  	search_id: '', // 子表搜索id
			searchStatus: true,
			tableLoadFlag: true,
 			childHourData: [],
 			pageSize: 30,
 			currentPage: 1,
 			order: null,
 			selectList: []
 		}
 	},
	created() {
		this.getSourceData()
	},
 	methods: {
 		/**
 		 * [getSourceData 获取子表数据]
 		 * @return {[type]} [description]
 		 */
 		async getSourceData() {
			let params = {
				ssp_slot_id: this.row.ssp_slot_id,
				start_date: this.row.date,
				end_date: this.row.date,
				page_num: this.currentPage,
				page_size: this.pageSize,
				order: this.order
			}

			if(!!this.search_id) {
				params.dsp_slot_id = [this.search_id]
			}

 			let group = ['date'] // 默认添加时间维度

 			this.childHasCheckData.map(item=> {

 				if(item === '预算位名称') {
 					group.push('dsp_slot_id')
 				}

 				if(item === '公司/账号名称') {
 					group.push('dsp_company_id')
 				}

 				if(item === '广告位类型') {
 					group.push('creative_type')
 				}
 			})

 			params.group = group

 			this.tableLoadFlag = true

 			const curRes = await getSspHourDataSource(params) // 获取当前数据

 			if(curRes.code === 200) {

 				// 空数据的情况下， 停止执行对比
 				if(curRes.data.list.length === 0) {
 					this.tableLoadFlag = false
 					this.childHourData = curRes.data.list
 					return
 				}

 				let pre_hour_time = formatDate(new Date(this.row.date.replace(new RegExp('-', 'gm'), '/')).getTime() - 60 * 60 * 1000, 'yyyy-MM-dd HH:mm:ss')

 				// 获取前一小时数据
 				let preParams = {
					ssp_slot_id: this.row.ssp_slot_id,
					start_date: pre_hour_time,
					end_date: pre_hour_time,
					page_num: 1,
					page_size: 0,
					group: group
 				}

 				const preRes = await getSspHourDataSource(preParams) // 获取前一小时的数据

 				this.tableLoadFlag = false
				this.$Bus.$emit('hourTableOpenEvent', false)

				if (preRes.code === 200) {
					this.tableDataMatch(curRes.data.list, preRes.data.list, group)
				}
 			}
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
			this.childColumnsData.map(item=> {
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

			this.childHourData = tempArr // 列表

			console.log(this.childHourData)
		},

 		// 排序
		sortChange(col, key, order) {
			if (col.order === 'asc') {
				if (col.column.slot === 'show_pv_rates') {
					this.order = 'discount_show_pv'
				} else if (col.column.slot === 'click_pv_rates') {
					this.order = 'discount_click_pv'
				} else {
					this.order = col.column.slot
				}
				this.pageSize = 0
				this.currentPage = 1
				this.getSourceData()
			} else if (col.order === 'desc') {
				if (col.column.slot === 'show_pv_rates') {
					this.order = 'discount_show_pv ' + col.order
				} else if (col.column.slot === 'click_pv_rates') {
					this.order = 'discount_click_pv ' + col.order
				} else {
					this.order = col.column.slot + ' ' + col.order
				}
				this.pageSize = 0
				this.currentPage = 1
				this.getSourceData()
			}
		},
 		/**
 		 * [adTypeText 获取广告场景]
 		 * @param  {[type]} id [description]
 		 * @return {[type]}	[description]
 		 */
 		adTypeText(id) {
 			let _arr = this.$store.state.app.adSceneData
 			let result = _arr.filter(item => item.id == id)
 			return result[0] ? result[0].title : ''
 		},
 		/**
 		 * [creativeIdText 获取广告样式]
 		 * @param  {[type]} id [description]
 		 * @return {[type]}	[description]
 		 */
 		creativeIdText(id) {
 			let _arr = this.$store.state.app.adStyleData
 			let result = _arr.filter(item => item.id == id)
 			return result[0] ? result[0].title : ''
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
 		 * [toggleSelect 显示隐藏子表搜索]
 		 * @return {[type]} [description]
 		 */
 		toggleSelect() {
 			this.searchStatus = !this.searchStatus
 		},

 		/**
 		 * [deleteUnlink 删除子表]
 		 * @param  {[type]} id [description]
 		 * @return {[type]}	[description]
 		 */
		deleteUnlink(item) {
			this.$Modal.confirm({
				title: '确定删除当前广告位下配置的此预算位？',
				className: 'vertical-center-modal',
				onOk: () => {
					deleteSspUnlink({
						ssp_slot_id: Number(item.ssp_slot_id),
						dsp_slot_id: Number(item.dsp_slot_id)
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({content: '删除成功',duration: 3})
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
		}
 	}
 }
</script>

<style scoped  lang="stylus" rel="stylesheet/stylus">
@import '../table.styl'
</style>
