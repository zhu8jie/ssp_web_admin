<!-- by 李想 -->
<template>
	<div>
		<!-- 预算详细数据天 -->
		<dsp-detail-day v-if="navType === 'day'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</dsp-detail-day>

		<!-- 预算详细数据时 -->
		<dsp-detail-hour v-if="navType === 'hour'">
			<div class="nav-handle-group group_radio" slot="tab">
				<RadioGroup v-model="navType" type="button">
					<Radio :label="'day'">日报表</Radio>
					<Radio :label="'hour'">小时报表</Radio>
				</RadioGroup>
			</div>
		</dsp-detail-hour>
	</div>
</template>

<script>

import dspDetailDay from '../dsp-detail-day/index' // 预算详细数据-天
import dspDetailHour from '../dsp-detail-hour/index' // 预算详细数据-时

export default {
	components: {
		dspDetailDay,
		dspDetailHour
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
