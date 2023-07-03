<!-- 预算数据(时)-子表 -->
<template>
	<div>
		<div class="monitor-card" v-show="moniterData.date && moniterData.date.length">
			<div class="diff-card" v-if="selectArr.length">
				<Select class="pre-select" v-model="preValue" placeholder="筛选" @on-change="resetMoniter">
			        <Option :disabled="item.key === nextValue" v-for="item in selectArr" :value="item.key" :key="item.key">{{item.label}}</Option>
			    </Select>
			    <Checkbox v-model="isContrast" @on-change="resetMoniter">对比</Checkbox>
			    <Select class="next-select" v-model="nextValue" v-if="isContrast" placeholder="筛选" @on-change="resetMoniter">
			        <Option :disabled="item.key === preValue" v-for="item in selectArr" :value="item.key" :key="item.key">{{item.label}}</Option>
			    </Select>
			</div>
			<div id="echart-content" class="echart-content" style="width:100%; height: 500px"></div>
		</div>
		<div class="no_data" v-show="!moniterData.date || !moniterData.date.length">
			<p><img src="~@/assets/image/noDatas.png" alt=""></p>
			<p class="no_text">暂无数据</p>
		</div>
	</div>
</template>

<script>
import echarts from 'echarts'
import { number2Thousand } from '@/libs/tools'
export default {
 	props: {
 		selectArr: Array // 筛选
 	},
 	data() {
 		return {
 			colorList: ['#0090E5', '#4CAF50'], // echart颜色列表
 			preValue: '', // 对比前的值
 			nextValue: '', // 对比后的值
 			isContrast: false, // 是否开启对比
 			moniterData: {} // echart数据
 		}
 	},
 	methods: {
 		// 初始化执行
 		initData(data) {
 			this.moniterData = data
 			this.preValue = this.preValue || this.selectArr[0].key

 			// console.log('====================')
 			// console.log(this.moniterData)
 			if(!this.moniterData.date) {
 				return
 			}

 			this.initMointer()
 		},
 		/**
 		 * [preChange 筛选条件发生变化]
 		 * @param  {[type]} val [description]
 		 * @return {[type]}     [description]
 		 */
 		resetMoniter(val) {

 			if(!this.isContrast) { // 如果无对比，清空后一个值
 				this.nextValue = ''
 			}

 			this.initMointer()
 		},
 		/**
 		 * [initMointer 初始化加载echart数据]
 		 * @return {[type]} [description]
 		 */
 		initMointer() {
 			let dom = document.getElementById('echart-content')
 			let innerWidth = window.innerWidth
 			let _this = this

 			dom.style.width = innerWidth - 250 > 1120 ? (innerWidth - 250 + 'px') : '1120px'

 			let myChart = echarts.init(dom)

 			// 格式化时间
			let _date = []
			this.moniterData.date.map(item => {
				_date.push(item.length > 14 ? item.slice(11, 16) : item)
			})

 			let preValueItem = {}
 			let nextValueItem = {}
 			this.selectArr.map(item=> {
 				if(item.key === this.preValue) {
 					preValueItem = item
 				}

 				if(item.key === this.nextValue) {
 					nextValueItem = item
 				}
 			})

 			// y
 			let _yAxis = [
 				{
					type: 'value',
					name: `${preValueItem.label}(${preValueItem.unit})`,
					axisLine: {
						show: false,
						lineStyle: {
							color: this.colorList[0]
						}
					},
					axisLabel: {
						show: true,
						textStyle: {
							color: this.colorList[0]
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: '#F2F4F3'
						}
					}
				}
 			]
			// y -value
			let _series = [{
				data: this.moniterData[this.preValue],
				name: preValueItem.label,
				type: 'line'
			}]

			if(!!this.nextValue && this.isContrast) {
				_yAxis.push({
					type: 'value',
					name: `${nextValueItem.label}(${nextValueItem.unit})`,
					axisLine: {
						show: false,
						lineStyle: {
							color: this.colorList[1]
						}
					},
					axisLabel: {
						show: true,
						textStyle: {
							color: this.colorList[1]
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: '#F2F4F3'
						}
					}
				})

				_series.push({
					data: this.moniterData[this.nextValue],
					name: nextValueItem.label,
					yAxisIndex: 1,
					type: 'line'
				})
 			}
      myChart.clear()

            // 绘制图表
			myChart.setOption({
				color: this.colorList,
				xAxis: {
					type: 'category',
					data: _date,
					axisLine: {
						show: true,
						lineStyle: {
							color: '#F2F4F3',
							type: 'solid'
						}
					},
					axisLabel: {
						show: true,
						textStyle: {
							color: '#666666'
						}
					}
				},
				tooltip: {
					trigger: 'axis',
					backgroundColor: '#ffffff', // 设置背景图片 rgba格式
					boxShadow: '0px 0px 9px 0px ;',
					borderRadius: 4,
					padding: 15,
					extraCssText: 'box-shadow: 0 0 9px rgba(0, 0, 0, 0.1);',
					textStyle: {
						color: '#333333',
						fontSize: 12
					},
					formatter: function(params) {
						// 系列
						let html = '<p style="padding-bottom:10px;border-bottom: 1px solid #E5E5E5;margin-bottom: 10px">' + params[0].name + '</p>'

						for (var i = 0; i < params.length; i++) {
							// 获取每个系列对应的颜色值
							html += '<p style="line-height: 25px"><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params[i].color + ';"></span>'
							html += params[i].seriesName + ': ' + _this.number2Thousand(params[i].value) + '(' + (i == 0 ? preValueItem.unit : (nextValueItem.unit || '')) + ')</p>'
						}
						return html
					}
				},
				grid: {
					left: '8%',
					right: '4%'
				},
				yAxis: _yAxis,
				series: _series
			})
 		},
 		/**
 		 * [number2Thousand 数字转千分位]
 		 * @param  {[type]} val [description]
 		 * @return {[type]}     [description]
 		 */
		number2Thousand(number) {
			return number2Thousand(number)
		}
 	}
 }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.monitor-card
	padding-top: 30px
	/deep/ .diff-card
		text-align: center
		.ivu-select
			display: inline-block
			width: 140px
			.ivu-select-selected-value
				font-size: 12px
		.ivu-checkbox-default
			margin: 0 10px
			font-size: 12px
			color: #999
		.ivu-checkbox-wrapper-checked
			color: #4083F8
		.ivu-select-selection
			border: none
			box-shadow: none
/deep/ .ivu-select-dropdown-list
	.ivu-select-item
		font-size: 12px !important
.no_data
	padding: 100px
	text-align: center
	.no_text
		color: #999999
		font-size 14px
</style>
