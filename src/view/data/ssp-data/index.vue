<!-- by 李想 -->
<template>
	<div>
		<!-- 流量数据天 -->
		<ssp-data-day v-if="navType === 'day'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</ssp-data-day>

		<!-- 流量数据时 -->
		<ssp-data-hour v-if="navType === 'hour'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</ssp-data-hour>
	</div>
</template>

<script>

import sspDataDay from '../ssp-data-day/index' // 流量数据-天
import sspDataHour from '../ssp-data-hour/index' // 流量数据-时

export default {
	components: {
		sspDataDay,
		sspDataHour
	},
	data() {
		return {
			navType: 'day'
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
