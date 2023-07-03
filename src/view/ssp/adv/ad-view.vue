<template>
	<div class="page-main">
		<Card dis-hover :bordered="false" v-if="appList.length">
			<div class="page-title clearfix"><h2>{{headTitle}}</h2></div>
			<div class="edit-content-card clearfix">
				<div class="ad-left-content">
					<!-- {{appBaseData.access_type === 1 ? 'API' : ''}}
					{{appBaseData.access_type === 2 ? 'SDK' : ''}}
					{{appBaseData.access_type}} -->
					<Form :model="formBase" :label-colon="true" label-position="left" :label-width="140" ref="formBase">
						<FormItem label="应用名称">
							<p class="columns-text">{{appList[0].app_name}}</p>
						</FormItem>

						<FormItem label="广告场景">
							<p class="columns-text">{{adTypeText(formBase.ad_type_id)}}</p>
						</FormItem>

						<!-- 判断是否选择原生信息流，从而显示隐藏渲染方式  1. 当前应用sdk模式(2) 并且 2.选择原生信息流(1) --> 
						<FormItem label="广告渲染方式" v-if="isShowRender">
							<p class="columns-text" v-for="item in render_type_select" :key="item.id" v-if="item.id === formBase.render_type">{{item.name}}</p>
						</FormItem>

						<FormItem label="广告样式">
							<p class="columns-text">{{creativeIdText(formBase.creative_type)}}</p>
						</FormItem>

						<FormItem label="广告素材类型">
							<p class="columns-text">{{formBase.ad_material_type__text}}</p>
						</FormItem>

						<FormItem label="奖励发放设置" v-if="formBase.ad_type_id == 5">
							<p class="columns-text" v-if="formBase.need_callback == -1">不需要回调</p>
							<p class="columns-text" v-if="formBase.need_callback == 1">需要回调</p>
						</FormItem>

						<FormItem label="回调URL" v-if="formBase.ad_type_id == 5 && formBase.need_callback == 1">
							<p class="columns-text">{{formBase.callback_url}}</p>
						</FormItem>

						<FormItem label="广告位截图">
							<upload-image v-if="formBase.ad_image_url" :idVal="1" refName="ad_image_url" :bit="1 * 1024" :disEdit="true" v-model="formBase.ad_image_url" :widthVal="150" :heightVal="150">
							</upload-image>

							<p v-else class="columns-text">无</p>
						</FormItem>


						<!-- 只有接入方式是API时，才需要显示广告位属性填写项，否则隐藏 -->
						<FormItem label="广告位属性" v-if="appBaseData.access_type === 1">
							<ul class="flex-columns">
								<li>
									<span class="label">支持一键下载：</span>
									<span class="value">{{formBase.slot_support[0] == 1 ? '是' : (formBase.slot_support[0] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持从落地页中获取下载地址与参数：</span>
									<span class="value">{{formBase.slot_support[6] == 1 ? '是' : (formBase.slot_support[6] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持下载上报：</span>
									<span class="value">{{formBase.slot_support[1] == 1 ? '是' : (formBase.slot_support[1] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持安装上报：</span>
									<span class="value">{{formBase.slot_support[2] == 1 ? '是' : (formBase.slot_support[2] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持deeplink：</span>
									<span class="value">{{formBase.slot_support[3] == 1 ? '是' : (formBase.slot_support[3] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持deeplink上报：</span>
									<span class="value">{{formBase.slot_support[4] == 1 ? '是' : (formBase.slot_support[4] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">支持点击坐标上报：</span>
									<span class="value">{{formBase.slot_support[5] == 1 ? '是' : (formBase.slot_support[5] == -1 ? '否' : '无')}}</span>
								</li>
								<li>
									<span class="label">响应速度：</span>
									<span class="value">{{formBase.response_duration}}毫秒</span>
								</li>
							</ul>
						</FormItem>

						<FormItem label="广告位名称">
							<p class="columns-text">{{formBase.ssp_slot_name}}</p>
						</FormItem>

						<FormItem label="外部广告位ID">
							<p class="columns-text">{{formBase.ex_slot_id}}</p>
						</FormItem>
					</Form>
				</div>
			</div>
		</Card>
		<BackTop></BackTop>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { getAppList, getSspSlotInfo, getAppInfo} from '@/api/ssp'
import uploadImage from '_c/upload-image'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'adv-view',
	mixins: [inPageAccess],
	components: {
		uploadImage
	},
	data() {
		return {
			appBaseData: {}, // app基本信息
			appList: [], // 应用列表
			slot_id: this.$route.query.slot_id ? Number(this.$route.query.slot_id) : '', // 广告位编号
			ud_id: this.$route.query.ud_id ? Number(this.$route.query.ud_id) : '', // 广告位编号
			formBase: {
				app_id: this.$route.query.appId ? Number(this.$route.query.appId) : '', // 应用ID
				ad_type_id: '', // 应用广告场景ID
				render_type: '', // 广告渲染方式
				creative_type: '', // 广告素材类型
				ad_material_type: [1], // 广告素材类型，1=图片，2=视频, 默认选择图片
				need_callback: -1, // 是否需要回调，-1=否，1=是
				callback_url: '', // 回调地址
				ad_image_url: '', // 上传广告位截图
				slot_support: [-1, -1, -1, -1, -1, -1, -1], // 广告位支持项，数组下标，0=一键下载，1=下载上报，2=安装上报，3=deeplink，4=deeplink上报，5=点击坐标上报, 6=支持从落地页中获取下载地址与参数, -1=不支持，1=支持
				response_duration: 0, // 响应速度，单位（毫秒）
				ssp_slot_name: '', // 广告位名称
				ex_slot_id: '' // 第三方slot_id
			}
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		},
		//选择广告渲染方式
		isShowRender() {
			// 1. 当前应用sdk模式(2) 并且 2.选择原生信息流(1)
			return this.formBase.ad_type_id == 1 && this.appBaseData.access_type == 2
		},
		render_type_select() {
			return this.$store.getters.renderType
		}
	},
	created() {
		let resultArr = this._isPageShow()

		if(this._isSuperAdmin() || !!resultArr.includes('view')) {
			this.initData() // 初始化数据
		} else {
			this._gotoNoAccess()
		}
	},
	methods: {
		/**
		 * [initData 初始化加载数据]
		 * @return {[type]} [description]
		 */
		initData() {

			this.$Spin.show()

			Promise.all([
				getSspSlotInfo({slot_id: this.slot_id})
			]).then(res=> {

				if (res[0].code === 200) {
					let _data = res[0].data

					// 需要特殊处理
					// 1. 默认选中图片，2选中视频
					_data.ssp_slot_id = this.slot_id // 提交数据时使用
					_data.ad_material_type = _data.ad_material_type === 2 ? [1, 2] : [1] // 广告素材类型默认选择图片[1], 如果返回数据为2则为选中图片和视频[1, 2]
					_data.ad_material_type__text = _data.ad_material_type === 2 ? '图片、视频' : '图片'

					// 不论状态，不可编辑, 其实变相等于如果url中有id不可编辑
					this.formBase = _data

					this.getAppListAndDetail() // 根据广告位详情得到app_id, 反向推算app相关（详情和列表）
				}
			}, err=> {
				this.$Spin.hide()
			})
		},
		/**
		 * [getAppListAndDetail 获取app详情和app列表]
		 * @return {[type]} [description]
		 */
		getAppListAndDetail() {

			// 1. 注释，其实不用获取getAppList也可以获取应用详情，而加上纯粹是和媒体管理保持一致，防止以后可修改应用列表
			Promise.all([
				getAppInfo({app_id: this.formBase.app_id}), 
				getAppList({status: '', search_text: this.formBase.app_id, page_size: 10, page_num: 1})
			]).then(res=> {

				this.$Spin.hide()

				if(res[0].code === 200) {
					this.appBaseData = res[0].data
				}

				if(res[1].code === 200) {
					this.appList = res[1].data.list
				}
			})
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
		 * [goBack 返回上一页]
		 * @return {[type]} [description]
		 */
		goBack() {
			this.$router.back(-1)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
ul.flex-columns
	border: 1px solid #EFEFEF
	font-size: 0px
	border-bottom: 0
	li
		display: inline-block
		vertical-align: top
		width: 50%
		border-bottom: 1px solid #EFEFEF
		span
			font-size: 14px
			display: inline-block
			vertical-align: top
			width: 50%
			text-align: center
			line-height: 35px
			padding: 0 10px
			&.label
				background-color: #F3F5F7
				position: relative
				&:after
					left: 0px
					top: 0px
					width: 1px
					height: 100%
					background-color: #EFEFEF
			&.value
				background-color: #FBFBFB
.page-title
	margin-top 15px
	padding-left 30px
/deep/ .ad-left-content
	padding: 0 30px 10px
	.ivu-form-item
		margin-bottom: 10px
		color: #42444c
</style>
