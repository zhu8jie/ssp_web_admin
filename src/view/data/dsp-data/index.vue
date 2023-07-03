<!-- by 李想 -->
<template>
	<div>
		<!-- 预算数据天 -->
		<dsp-data-day v-if="navType === 'day'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</dsp-data-day>

		<!-- 预算数据时 -->
		<dsp-data-hour v-if="navType === 'hour'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</dsp-data-hour>
	</div>
</template>

<script>

import dspDataDay from '../dsp-data-day/index' // 预算数据-天
import dspDataHour from '../dsp-data-hour/index' // 预算数据-时

export default {
	components: {
		dspDataDay,
		dspDataHour
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
