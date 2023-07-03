<template>
	<Modal
		v-model="statusExplain"
		:mask-closable="false"
		title="广告位与产品状态及原因解释说明"
		:width="700"
		:footer-hide="true"
		class-name="vertical-center-modal"
		@on-cancel="statusExplain = false"
	>
		<Table highlight-row stripe border :columns="explainColList" :data="explainColDatList">
			<!-- 状态 -->
			<template slot-scope="{ row }" slot="status">
				{{row.status}}
			</template>
			<!-- 触发条件 -->
			<template slot-scope="{ row }" slot="name">
				{{row.name}}
			</template>
			<!-- 已完成原因 -->
			<template slot-scope="{ row }" slot="reason">
				{{row.reason}}
			</template>
		</Table>
	</Modal>
</template>

<script>

import { getExplainColumns, explainColDatList } from '../../columns'
export default {
	data() {
		return {
			statusExplain: false,
			explainColList: getExplainColumns(),
			explainColDatList: explainColDatList
		}
	},
	methods: {
		/**
		 * [injectDate 注入数据]
		 * @param  {[type]} date [description]
		 * @return {[type]}      [description]
		 */
		injectDate() {
		  console.log(this.statusExplain)
      console.log('+++++++')
			this.statusExplain = !this.statusExplain
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
