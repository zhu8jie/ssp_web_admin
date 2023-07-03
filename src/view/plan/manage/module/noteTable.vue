<template>
	<Modal
		v-model="modelFlag"
		:mask-closable="false"
		title="备注"
		:width="1000"
		:footer-hide="true"
		class-name="vertical-center-modal"
		@on-cancel="cancelModal"
	>
		<Table highlight-row stripe border :columns="tableColList" :data="colDatList" :loading="tableLoadFlag" :height="400">
			<!-- 广告位名称 -->
			<template slot-scope="{ row }" slot="ssp_slot_name">
				{{row.ssp_slot_name}}
			</template>
			<!-- 广告位ID -->
			<template slot-scope="{ row }" slot="ssp_slot_id">
				{{row.ssp_slot_id}}
			</template>
			<!-- 产品名称 -->
			<template slot-scope="{ row }" slot="product_name">
				{{row.dsp_product_name}}-{{row.dsp_product_id}}
			</template>
			<!-- 原因详情 -->
			<template slot-scope="{ row, index }" slot="action">
				<Input v-model="colDatList[index].remark" :title="colDatList[index].remark" :maxlength="30" show-word-limit placeholder="请输入备注信息" style="width: 100%" />
			</template>
		</Table>
		<div class="save-btn">
			<Button @click="cancelModal">取消</Button>
			<Button type="primary" :loading="submitClock" @click="submitData">{{!submitClock ? '提交' : '提交中...'}}</Button>
		</div>
	</Modal>
</template>

<script>

import { getNoteColumns } from '../../columns'
import { submitProductRemark, getMediaSspSlotAdList } from '@/api/ssp'

export default {
	data() {
		return {
			submitClock: false, // 保存锁
			tableLoadFlag: true, // table的loading
			modelFlag: false,
			tableColList: getNoteColumns(),
			colDatList: []
		}
	},
	methods: {
		/**
		 * [injectDate 注入数据]
		 * @param  {[type]} date [description]
		 * @return {[type]}      [description]
		 */
		injectDate(row) {
			this.getMediaSspSlotAdList(row) // 获取广告位管理数据
		},
		/**
		 * [getMediaSspSlotAdList description]
		 * @return {[type]} [row 注入数据]
		 * @return {[type]} [sspSlotArr 广告位ID数组]
		 * @return {[type]} [productArr 产品ID数组]
		 * @return {[type]} [description]
		 */
		getMediaSspSlotAdList(row) {
			this.tableLoadFlag = true
			this.modelFlag = !this.modelFlag

			getMediaSspSlotAdList({
				ssp_slot_id_arr: row.ssp_slot_id_arr
			}).then(res => {

				this.tableLoadFlag = false

				if(res.code === 200) {
					this.sspSlotVsProduct(res.data.list, row)
				}
			}, err=> {
				this.tableLoadFlag = false
			})
		},
		/**
		 * [sspSlotVsProduct 广告位和产品匹配]
		 * * @return {[type]} [resData 广告数据]
		 * * @return {[type]} [row 注入的数据]
		 * @return {[type]} [description]
		 */
		sspSlotVsProduct(resData, row) {

			let tableArr = [] // 最后渲染的产品列表
			let {ssp_slot_list, dsp_product_list} = row // 取出广告位数据，产品数据

			// 取出备忘
			let resObj = {} // d_ssp_slot_id_dsp_product_id
			resData.map(item => {
				item.ssp_slot_dsp_product_list.map(proItem => {
					resObj[`d_${proItem.ssp_slot_id}_${proItem.dsp_product.id}`] = proItem.remark
				})
			})

			// 广告位
			ssp_slot_list.map(item => {
				let curObj = {
					ssp_slot_name: item.ssp_slot_name, // 广告位名称
					ssp_slot_id: item.id, // 广告位ID
				}

				// 产品
				dsp_product_list.map(dspItem => {
					curObj.dsp_product_name = dspItem.name // 产品名称
					curObj.dsp_product_id = dspItem.id // 产品id

					curObj.remark = resObj[`d_${item.id}_${dspItem.id}`] || ''

					tableArr.push(curObj)
				})
			})

			this.colDatList = tableArr
		},
		/**
		 * [drawerClose 关闭]
		 * @return {[type]} [description]
		 */
		cancelModal() {
			this.modelFlag = false
			this.submitClock = false
			this.colDatList = []
		},
		/**
		 * [submitData 提交数据]
		 * @return {[type]} [description]
		 */
		submitData() {
			// 格式化处理数据
			let remark_list = []

			this.colDatList.map(item => {
				remark_list.push({
					dsp_product_id: item.dsp_product_id,
					ssp_slot_id: item.ssp_slot_id,
					remark: item.remark
				})
			})

			// console.log(remark_list)

			this.submitClock = true

			submitProductRemark({list: remark_list}).then(res=> {
				if(res.code === 200) {
					this.$Message.success({content: '保存成功', duration: 3})
					this.cancelModal()
				}
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.save-btn
	margin-top: 30px
	text-align: right
	button
		margin-left: 20px
</style>
