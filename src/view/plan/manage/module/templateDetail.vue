<template>
	<!-- 查看模板详情 -->
	<Drawer v-model="drawerFlag" width="550" :mask-closable="false" :styles="drawStyles" @on-close="drawerClose" title="模板信息">
		<div class="tem-msg">
			<div class="tem-item">
				<div class="tem-label">展现控制：</div>
				<div class="tem-val">
					<p>{{drawerTempData.show_pv}}次/天</p>
				</div>
			</div>
			<div class="tem-item">
				<div class="tem-label">点击控制：</div>
				<div class="tem-val">
					<p>{{drawerTempData.click_pv}}次/天</p>
				</div>
			</div>
			<div class="tem-item">
				<div class="tem-label">成本：</div>
				<div class="tem-val">
					{{drawerTempData.spend / 100}}元/天
				</div>
			</div>
			<h6>规则设置</h6>
			<div class="tem-item">
				<div class="tem-label">前置条件：</div>
				<div class="tem-val">
					<p v-if="drawerTempData.check_show_pv > 0">广告展现大于{{drawerTempData.check_show_pv}}次</p>
					<p v-if="drawerTempData.check_click_pv > 0">广告点击大于{{drawerTempData.check_click_pv}}次</p>
					<p v-if="drawerTempData.check_show_pv === 0 && drawerTempData.check_click_pv === 0">-</p>
				</div>
			</div>
			<div class="tem-item">
				<div class="tem-label">规则：</div>
				<div class="tem-val">
					<p v-if="drawerTempData.cpc > 0">媒体CPC{{drawerTempData.cpc_rule === 1 ? '小于' : '大于'}}{{drawerTempData.cpc / 100}}元</p>
					<p v-if="drawerTempData.ctr > 0">点击率{{drawerTempData.ctr_rule === 1 ? '小于' : '大于'}}{{drawerTempData.ctr}}%</p>
					<p v-if="drawerTempData.ctr === 0 && drawerTempData.cpc === 0">-</p>
				</div>
			</div>
		</div>
	</Drawer>
</template>

<script>
export default {
	data() {
		return {
			drawerTempData: {}, // 模板数据
			drawerFlag: false, // 抽屉开关
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			}
		}
	},
	methods: {
		/**
		 * [injectDate 注入数据]
		 * @param  {[type]} date [description]
		 * @return {[type]}      [description]
		 */
		injectDate(date) {
			this.drawerTempData = date
			this.drawerFlag = true
		},
		/**
		 * [drawerClose 查看模板详情-关闭]
		 * @return {[type]} [description]
		 */
		drawerClose() {
			this.drawerTempData = {}
			this.drawerFlag = false
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.tem-msg
	h6
		padding-left: 10px
		margin-top: 24px
		margin-bottom: 14px
		font-size: 14px
	.tem-item
		overflow: hidden
		padding: 8px 0
		line-height: 2
		.tem-label
			font-weight: bold
			display: inline
			float: left
			width: 80px
			text-align: right
			margin-right: 10px
		.tem-val

			overflow: hidden
</style>
