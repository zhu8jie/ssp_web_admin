<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
			</div>
			<div class="edit-content-card clearfix">
				<div class="ad-left-content">
					<!-- {{appBaseData.access_type === 1 ? 'API' : ''}}
					{{appBaseData.access_type === 2 ? 'SDK' : ''}}
					{{appBaseData.access_type}} -->
					<Form :model="formBase" :label-colon="true" label-position="right" :label-width="140" :rules="ruleBase" ref="formBase">
						<FormItem label="选择应用" prop="app_id">
							<Select :disabled="hasIdNoEdit" v-model="formBase.app_id" :label-in-value="true" placeholder="请选择应用">
								<Option v-for="item in appList" :disabled="item.status == 5" :value="item.app_id" :label="item.app_name" :key="item.app_id">
									<span>{{ item.app_name }}</span>
									<span style="float:right;color:#ccc">{{ item.os_type_text }}/ {{item.app_id}}</span>
								</Option>
							</Select>
						</FormItem>
						<FormItem class="ad-form-item" label="选择广告场景" prop="ad_type_id">
							<!-- {{formBase.ad_type_id}} -->
							<div class="scene-card clearfix">
								<template v-for="item in filterSceneData">
									<div class="scene-child" :key="item.id" :class="formBase.ad_type_id == item.id ? 'active' : ''" @click="chooseScene(item)">
										<div class="scene-icon">
											<img :src="getSceneImgUrl(item.icon)">
										</div>
										<div class="scene-intro">
											<h4>{{item.title}}</h4>
											<p>{{item.intro}}</p>
										</div>
									</div>
								</template>
							</div>
						</FormItem>
						<!-- 判断是否选择原生信息流，从而显示隐藏渲染方式  1. 当前应用sdk模式(2) 并且 2.选择原生信息流(1) -->
						<FormItem label="选择广告渲染方式" prop="render_type" v-if="isShowRender">
							<!-- {{formBase.render_type}} -->
							<RadioGroup class="private-check-card" type="button" v-model="formBase.render_type">
								<Radio :disabled="item.value === -1" v-for="item in mediaRenderTypeSelect" :label="item.id" :key="item.id">{{ item.name }}</Radio>
							</RadioGroup>
						</FormItem>
						<FormItem class="ad-form-item" label="选择广告样式" prop="creative_type" v-if="formBase.ad_type_id">
							<!-- {{formBase.creative_type}} -->
							<div class="style-card clearfix">
								<template v-for="(item, index) in styleData">
									<div class="style-child" :key="item.id" :class="[item.hover ? 'hover' : '', formBase.creative_type == item.id ? 'active' : '']" @mouseenter="styleAdHover(item, index)" @mouseleave="styleAdLeave(item, index)" @click="chooseStyle(item, index)">
										<div class="style-icon">
											<img :src="getStyleImgUrl(item)">
										</div>
										<div class="style-intro">
											<h4>{{item.title}}</h4>
											<p>{{item.introNew}}</p>
										</div>
									</div>
								</template>
							</div>
						</FormItem>
						<!-- {{formBase.ad_material_type}} -->
						<FormItem label="选择广告素材类型" prop="ad_material_type" >
							<CheckboxGroup class="private-check-card" v-model="formBase.ad_material_type">
								<Checkbox :label="1" border :disabled="isDisabledChooseImg">图片</Checkbox>
								<Checkbox :label="2" border :disabled="isDisabledChooseVideo">视频</Checkbox>
							</CheckboxGroup>
						</FormItem>
						<!-- 测试发版 -->
						<FormItem label="选择素材尺寸比例" prop="ad_ratios">
							<div class="material-card">
								<CheckboxGroup class="private-check-card" v-model="formBase.ad_ratios">
									<Checkbox :label="item" border v-for="(item, index) in adMaterialArr" :disabled="hasIdNoEdit" :key="index"></Checkbox>
								</CheckboxGroup>
								<!-- {{formBase.ad_ratios}} -->
								<Spin size="large" fix v-if="materialLoad"></Spin>
							</div>
						</FormItem>

						<FormItem label="奖励发放设置" prop="need_callback" v-if="formBase.ad_type_id == 5">
							<RadioGroup class="private-check-card" type="button" v-model="formBase.need_callback">
								<Radio :label="-1">不需要回调</Radio>
								<Radio :label="1">需要回调</Radio>
							</RadioGroup>
						</FormItem>
						<FormItem label="回调URL" prop="callback_url" v-if="formBase.ad_type_id == 5 && formBase.need_callback == 1">
							<Input maxlength="10000" show-word-limit placeholder="请输入回调URL" v-model.trim="formBase.callback_url"></Input>
						</FormItem>
						<FormItem label="上传广告位截图" prop="ad_image_url">
							<upload-image :idVal="1" refName="ad_image_url" :bit="1024" v-model="formBase.ad_image_url" :widthVal="150" :heightVal="150">
								<Icon type="md-add" size="24"/>
								<p>点击上传</p>
							</upload-image>
							<p class="upload-img-format-tips">（支持格式仅限jpg、jpeg、png,大小1M以内)</p>
						</FormItem>
						<!-- 只有接入方式是API时，才需要显示广告位属性填写项，否则隐藏 -->
						<FormItem label="广告位属性" v-if="appBaseData.access_type === 1">
							<div class="dau-flex">
								<div class="dau-child">
									<p>支持一键下载：</p>
									<Select v-model="formBase.slot_support[0]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
								<div class="dau-child dau-child2">
									<p>支持从落地页中获取下载地址与参数：</p>
									<Select v-model="formBase.slot_support[6]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
							</div>
							<div class="dau-flex">
								<div class="dau-child">
									<p>支持下载上报：</p>
									<Select v-model="formBase.slot_support[1]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
								<div class="dau-child dau-child2">
									<p>支持安装上报：</p>
									<Select v-model="formBase.slot_support[2]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
							</div>
							<div class="dau-flex">
								<div class="dau-child">
									<p>支持deeplink：</p>
									<Select v-model="formBase.slot_support[3]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
								<div class="dau-child">
									<p>支持deeplink上报：</p>
									<Select v-model="formBase.slot_support[4]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
								<div class="dau-child">
									<p>支持点击坐标上报：</p>
									<Select v-model="formBase.slot_support[5]" placeholder="请选择">
										<Option :value="1">是</Option>
										<Option :value="-1">否</Option>
									</Select>
								</div>
							</div>
							<div class="dau-flex">
								<div class="dau-child dau-flex-block">
									<p>响应速度:</p>
									<div class="dau-num-inner">
										<InputNumber :max="99999" :min="0" :step="1" :precision="0" style="width: 100%" v-model="formBase.response_duration"></InputNumber>
										<span class="num-label">毫秒</span>
									</div>
								</div>
							</div>
						</FormItem>
						<FormItem label="填写广告位名称" prop="ssp_slot_name">
							<Input maxlength="30" show-word-limit placeholder="广告位名称" v-model.trim="formBase.ssp_slot_name"></Input>
						</FormItem>
						<FormItem label="外部广告位ID">
							<Input maxlength="100" show-word-limit :disabled="auditStatus" placeholder="媒体按需填写" v-model.trim="formBase.ex_slot_id"></Input>
						</FormItem>

						<FormItem label="是否打开风控">
							<RadioGroup class="private-check-card" type="button" v-model="formBase.status_risk">
								<Radio v-for="item in statusRiskArr" :label="item.key" :key="item.key">{{ item.name }}</Radio>
							</RadioGroup>
						</FormItem>

						<FormItem v-if="formBase.app_id" class="edit-save-formItem">
							<Button size="large" @click="goBack">取消</Button>
							<Button size="large" type="primary" :loading="submitClock" @click="submitFormData('formBase')">
								{{!submitClock ? '提交' : '提交中...'}}
							</Button>
						</FormItem>
					</Form>
				</div>
				<div class="ad-right-content" v-if="demoSrc">
					<Affix :offset-top="50">
						<h3 v-if="demoTitle">{{demoTitle}}</h3>
						<div class="mobile-card">
							<div class="mobile-center">
								<img :src="demoSrc">
							</div>
						</div>
					</Affix>
				</div>
			</div>
		</Card>
		<BackTop></BackTop>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { formRules } from './ad-edit-rules.js' // 正则校验
import { getAppList, updateSspSlot, getSspSlotInfo, getAppInfo, getDevUserInfoApi, getSspSlotAdType } from '@/api/ssp'
import { getAdRatio } from '@/api/common'
import uploadImage from '_c/upload-image'
import { inPageAccess } from '@/mixin/in-page-access.js'

export default {
	name: 'ad-edit',
	mixins: [formRules, inPageAccess],
	components: {
		uploadImage
	},
	data() {
		return {
			appList: [], // 应用列表
			appBaseData: {}, // app基本信息

			slot_id: this.$route.query.slot_id ? Number(this.$route.query.slot_id) : '', // 广告位编号
			ud_id: this.$route.query.ud_id ? Number(this.$route.query.ud_id) : '', // 广告位编号

			hasIdNoEdit: false, // 如果有id，不可编辑
			auditStatus: false, // 审核通过后不可编辑
			isDisabledChooseVideo: true, // 广告素材类型是否支持视频, 默认不可选
			isDisabledChooseImg: false, // 广告素材类型 - 图片
			materialLoad: false, // 素材尺寸是否加载完成

			mediaRenderTypeSelect: [], // 当前媒体可渲染方式  模板/自渲染
			mediaSceneData: [], // 当前媒体所具有的广告场景
			filterSceneData: [], // 广告场景
			styleData: [], // 广告 样式
			adMaterialArr: [], // 素材尺寸比例

			statusRiskArr: [ // 是否打开风控
				{
					key: 1,
					name: '是'
				},
				{
					key: -1,
					name: '否'
				}
			],

			formBase: {
				app_id: this.$route.query.appId ? Number(this.$route.query.appId) : '', // 应用ID
				ad_type_id: '', // 应用广告场景ID
				render_type: '', // 广告渲染方式
				creative_type: '', // 广告素材类型
				ad_material_type: [], // 广告素材类型，1=图片，2=视频, 3 图片+视频
				ad_ratios: [], // 素材尺寸比例
				need_callback: -1, // 是否需要回调，-1=否，1=是
				callback_url: '', // 回调地址
				ad_image_url: '', // 上传广告位截图
				slot_support: [-1, -1, -1, -1, -1, -1, -1], // 广告位支持项，数组下标，0=一键下载，1=下载上报，2=安装上报，3=deeplink，4=deeplink上报，5=点击坐标上报, 6=支持从落地页中获取下载地址与参数, -1=不支持，1=支持
				response_duration: 0, // 响应速度，单位（毫秒）
				ssp_slot_name: '', // 广告位名称
				ex_slot_id: '', // 第三方slot_id
				status_risk: 1
			},

			submitClock: false, // 保存锁
			demoTitle: '', // 手机框title
			demoSrc: '', // 手机demo预览图

			catchSelectScene: '', // 缓存选中的广告场景
			catchSelectStyle: '' // 缓存选中广告场景之后默认第一个广告样式
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		},
		/**
		 * [isShowRender 选择广告渲染方式]
		 * @return {Boolean} [description]
		 */
		isShowRender() {
			// 1. 当前应用sdk模式(2) 并且 2.选择原生信息流(1)
			return this.formBase.ad_type_id == 1 && this.appBaseData.access_type == 2
		}
	},
	created() {
		// 判断是否有修改权限
		let resultArr = this._isPageShow()
		if (this._isSuperAdmin() || !!resultArr.includes('modify')) {
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
				getDevUserInfoApi({ud_id: this.ud_id}),  // 获取当前媒体的渲染方式
				getSspSlotAdType({ud_id: this.ud_id}), // 可选的广告场景
				getSspSlotInfo({slot_id: this.slot_id})
			]).then(res=> {

				if (res[0].code === 200) {
					this.mediaRenderTypeSelect = res[0].data.render_type_select
				}

				if (res[1].code === 200) {
					this.mediaSceneData = res[1].data.ad_type_select // 广告场景
				}

				if (res[2].code === 200) {
					let _data = res[2].data

					// 需要特殊处理
					// 1. 默认选中图片，2选中视频
					_data.ssp_slot_id = this.slot_id // 提交数据时使用
					_data.ad_material_type = _data.ad_material_type === 3 ? [1, 2] : [_data.ad_material_type]

					let ratiosArr = _data.ad_ratios || []
					let ratioResult = []
					ratiosArr.map(ratItem => {
						ratioResult.push(`${ratItem.width}:${ratItem.height}`)
					})

					// 处理 素材尺寸
					_data.ad_ratios = ratioResult

					this.adMaterialArr = ratioResult // 说明详见 getAdMaterialSize

					// 是否打开风控, 只有在-1的情况下为关闭，否则都是默认打开
					_data.status_risk = _data.status_risk === -1 ? -1 : 1

					// 审核状态
					this.auditStatus = _data.status === 1 // 审核已通过

					// 不论状态，不可编辑, 其实变相等于如果url中有id不可编辑
					this.hasIdNoEdit = _data.status > 0 // 此处赋值是担心恶意篡改urL中的slo_id导致可再编辑

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

				this.getSceneFilterList() // 筛选当前媒体下的广告场景
				this.getStyleFilterList({isClick: false}) // 筛选当前场景下的广告样式

			}, err => {
				this.$Spin.hide()
			})
		},

		/**
		 * [getSceneFilterList 筛选当前媒体下的广告场景]
		 * @return {[type]} [description]
		 */
		getSceneFilterList() {
			let allScene = [...this.$store.state.app.adSceneData]
			let _arr = []
			let _catch = {} // 缓存广告场景

			this.mediaSceneData.map(item => {
				allScene.map(child => {

					// 缓存已选中场景
					if(child.id === this.formBase.ad_type_id) {
						_catch = child
					}

					// 此处特殊处理， 互动广告显示条件
					// 1. 平台后台勾选了推啊的同时勾选了互动
					// 2. 媒体创建应用时，第三方sdk勾选了交互通
					if (child.id === item.id) {
						if (child.id !== 8) {
							_arr.push(child)
						} else if (this.appBaseData.app_platform_id && child.id === 8 && this.appBaseData.app_platform_id.indexOf(3) > -1) {
							_arr.push(child)
						}
					}
				})
			})

			this.catchSelectScene = _catch // 缓存当前选中的广告场景, 素材中使用
			this.filterSceneData = _arr // 筛选出的广告场景
		},

		/**
		 * [getStyleFilterList 获取当前场景下的广告样式]
		 * @return {[obj]} [是否点击,  初始化默认渲染保持的数据, 如果是点击则默认缓存第一个数据]
		 * @return {[type]} [description]
		 */
		getStyleFilterList(obj) {
			let _styleData = [...this.$store.state.app.adStyleData]
			let _arr = []
			let _catch = {} // 缓存广告样式

			_styleData.map(item=> {

				// 缓存样式
				if (!obj.isClick) { // 初次加载
					if (item.id === this.formBase.creative_type) {
						_catch = item
					}
				}

				if(item.parentId === this.formBase.ad_type_id) {
					_arr.push(item)
				}
			})

			// 点击的情况下,默认选中第一个
			if(!!obj.isClick) {
				this.catchSelectStyle = _arr[0]
				this.formBase.creative_type = _arr[0].id
			} else {
				// 初始化加载的话, 默认是保存后的数据
				this.catchSelectStyle = _catch
			}

			this.styleData = _arr // 样式列表

			this.judgeSupportVideoAndImg(obj) // 判断广告素材类型是否支持视频
			this.setDemoSrcAndTitle() // 手机预览图的图片url和title
		},
		/**
		 * [getAdMaterialSize 获取素材尺寸列表]
		 * 2021、04、30
		 * 备注： 不加载素材尺寸列表，因为切换广告样式会匹配到尺寸，所以页面纯展示尺寸，不做交互
		 * @return {[type]} [description]
		 */
		getAdMaterialSize(obj) {
			this.materialLoad = true


			if(!this.formBase.creative_type) {
				return
			}

			// 点击的情况下，清空素材尺寸比例
			if(!!obj && obj.isClick) {
				this.formBase.ad_ratios = []
			}


			this.materialLoad = true

			getAdRatio({creative_types: [this.formBase.creative_type]}).then(res=> {

				this.materialLoad = false

				if(res.code === 200) {

					let list = res.data.list || []

					let arr = list.map(item => {
						return `${item.width_ratio}:${item.height_ratio}`
					})

					this.adMaterialArr = arr
				}
			}, err=> {
				this.materialLoad = false
			})
		},
		/**
		 * [judgeSupportVideoAndImg 判断广告素材类型是否支持video]
		 * @return {[type]} [description]
		 */
		judgeSupportVideoAndImg(obj) {
			let item = this.catchSelectStyle
			let _arr = [] // 处理默认选中问题

			// 1. API 权限  并且 不支持图片
			// 2. SDK 权限  并且 不支持图片
			this.isDisabledChooseImg = (this.appBaseData.access_type == 1 && !item.apiAttr.photo) || (this.appBaseData.access_type == 2 && !item.sdkAttr.photo) || (!this.appBaseData.access_type)
			if (!this.isDisabledChooseImg) {
				_arr.push({
					id: 1,
					value: true
				})
			}

			//1. API 权限  并且 不支持视频
			//2. SDK 权限  并且 不支持视频
			this.isDisabledChooseVideo = (this.appBaseData.access_type == 1 && !item.apiAttr.video) || (this.appBaseData.access_type == 2 && !item.sdkAttr.video) || (!this.appBaseData.access_type)
			if (!this.isDisabledChooseVideo) {
				_arr.push({
					id: 2,
					value: true
				})
			}

			// 切换广告样式, 需要 重置广告素材类型, 只在点击场景/样式编辑时使用
			// 只有一个值的时候 处理默认选中
			if(!!obj && obj.isClick) {
				this.formBase.ad_material_type = _arr.length > 1 ? [] : [_arr[0].id]
			}
		},

		/**
		 * [setDemoSrcAndTitle 手机框图片 依赖于广告场景和广告样式]
		 * @return {[type]} [description]
		 */
		setDemoSrcAndTitle() {
			let _scene = this.catchSelectScene
			let _style = this.catchSelectStyle

			// demo的图片url
			this.demoSrc = _style.demoIcon ? require('@/assets/image/ad/demo/' + _style.demoIcon) : require(`@/assets/image/ad/demo/${_style.icon}.jpg`)
			// demo图片的title
			this.demoTitle = `${_scene.title} - ${_style.title}`
		},

		/**
		 * [getSceneImgUrl 动态拼接广告场景-图片地址]
		 * @param  {[type]} img [description]
		 * @return {[type]}	 [description]
		 */
		getSceneImgUrl(name) {
			return require(`@/assets/image/ad/scene/${name}.png`)
		},
		/**
		 * [chooseScene 广告场景 - 选择]
		 * @param  {[type]} item [description]
		 * @return {[type]}	  [description]
		 */
		chooseScene(item) {
			this.catchSelectScene = item
			this.formBase.ad_type_id = item.id

			// 非原生信息流的情况下，清除渲染方式
			if(item.id !== 1) {
				this.formBase.render_type = ''
			}

			this.getStyleFilterList({isClick: true}) // 根据广告场景->筛选广告样式

			// 重置validate
			this.resetValidate()
		},
		/**
		 * [getStyleImgUrl 动态拼接广告样式-图片地址]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		getStyleImgUrl(item) {
			let status = item.hover
			let name = item.icon
			return !!status || this.formBase.creative_type == item.id ? require(`@/assets/image/ad/style/${name}-hover.png`) : require(`@/assets/image/ad/style/${name}.png`)
		},
		/**
		 * [styleAdHover 选择广告样式 hover]:
		 * @return {[type]} [description]
		 */
		styleAdHover(item, index) {
			item['hover'] = true
		},
		/**
		 * [styleAdHover 选择广告样式 leave]:
		 * @return {[type]} [description]
		 */
		styleAdLeave(item, index) {
			item['hover'] = false
		},
		/**
		 * [chooseStyle 选择广告样式 选中]
		 * @param  {[type]} item [description]
		 * @param  {[type]} index [索引]
		 * @return {[type]}	  [description]
		 */
		chooseStyle (item, index) {

			item['hover'] = true
			this.catchSelectStyle = item // 缓存样式数据
			this.formBase.creative_type = item.id

			this.judgeSupportVideoAndImg({isClick: true}) // 判断广告素材类型是否支持视频
			this.setDemoSrcAndTitle() // 手机预览图的图片url和title
		},
		/**
		 * [submitSet 提交表单]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitFormData(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					let form = {...this.formBase}


					// 处理特殊情况
					// 1(1), 如果应用为API, 则没有渲染方式
					if(this.appBaseData.access_type == 1) {
						form.render_type = 0
					}

					// 1(2)如果应用为SDK, 并且没有选择原生信息流
					if(this.appBaseData.access_type == 2 && form.ad_type_id !== 1) {
						form.render_type = 0
					}

					// 2. 广告素材 1. 默认选中图片，2选中视频
					form.ad_material_type = form.ad_material_type.length === 2 ? 3 : form.ad_material_type[0]

					// 3. 没有选择激励视频，清空 奖励发放设置
					if(form.ad_type_id !== 5) {
						form.need_callback = 0
					}

					// 4. 奖励发放设置不需要回调时， 清空 回调URL
					if(form.need_callback !== 1) {
						form.callback_url = ''
					}

					// 5. app_id 必须为init 类型
					form.app_id = Number(form.app_id)

					// 6 如果接入方式为sdk 删除 广告位属性 信息
					if(this.appBaseData.access_type == 2) {
						delete form.slot_support
						delete form.response_duration
					}

					// 7. 管理平台，编辑广告位，不对素材尺寸做提交操作，只在配置广告位修改
					delete form.ad_ratios

					this.submitClock = true

					updateSspSlot(form).then(res=> {
						this.submitClock = false
						if(res.code === 200) {
							this.$Bus.$emit('sspAdvEmitEvent') // ssp-adv
							this.$Bus.$emit('dspSlotEmitEvent') // dsp-slot
							this.$Message.success({content: '保存成功', duration: 3})
							this.goBack()
						}
					}, err=> {
						this.submitClock = false
					})
				}
			})
		},
		/**
		 * [goBack 返回上一页]
		 * @return {[type]} [description]
		 */
		goBack() {
			this.$router.back(-1)
		},
		/**
		 * [resetValidate 重置校验]
		 * @return {[type]} [description]
		 */
		resetValidate() {
			this.$nextTick(() => {
				this.$refs['formBase'].fields.forEach((e) => {
					e.validateState = ''
					e.validateMessage = ''
					this.$set(e, 'isRequired', !!e.prop)
				})
			})
		}
	},
	watch: {
		'demoTitle'() {
			// 应该只在创建的时候联动
			if(this.demoTitle && !this.slot_id) {
				this.formBase.ssp_slot_name = `${this.appBaseData.app_name ? this.appBaseData.app_name + '-' : ''}${this.demoTitle}`
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.dau-flex
	display: flex
	justify-content: space-between
	margin-bottom: 14px
	.dau-child
		flex: 0 0 214px
	.dau-child2
		flex: 0 0 446px
	.dau-flex-block
		flex: 1
	p
		padding-top: 6px
		font-size: 14px
		line-height: 20px
		margin-bottom: 5px
	.dau-num-inner
		position: relative
		.num-label
			position: absolute
			right: 30px
			top: 0px
			height: 32px
			line-height: 32px
.package-name-text
	font-size: 14px
	color: #999999
.ad-right-content
	width: 240px
	display: inline
	float: left
	margin-left: 40px
	h3
		font-size: 14px
		line-height: 30px
		font-weight: 600
		text-align: center
		margin-bottom: 28px
.ad-left-content
	float: left
	width: 820px
.scene-child
	cursor: pointer
	display: inline
	float: left
	font-size: 0px
	padding: 10px 15px
	border-bottom: 1px solid #EFEFEF
	border-right: 1px solid #EFEFEF
	position: relative
	&:hover
		background-color: #EBF3FF
	&:nth-child(3n + 1)
		border-left: 1px solid #EFEFEF
	&:nth-child(1), &:nth-child(2), &:nth-child(3)
		border-top: 1px solid #EFEFEF
	&.active
		background-color: #EBF3FF
		border-bottom: 1px solid #3F83F7
		border-right: 1px solid #3F83F7
		h4
			font-weight:bold
		&:after
			content:''
			position: absolute
			left: -1px
			top: 0px
			width: 0px
			height: 100%
			border-right: 1px solid #3F83F7
		&:before
			content:''
			position: absolute
			left: 0px
			top: -1px
			width: 100%
			height: 0px
			border-bottom: 1px solid #3F83F7
	.scene-icon
		display: inline-block
		width: 35px
		vertical-align: middle
		text-align: center
		img
			vertical-align: middle
	.scene-intro
		width: 150px
		margin-left: 10px
		display: inline-block
		vertical-align: middle
	h4
		font-weight: normal
		height: 20px
		font-size: 12px
		line-height: 20px
	p
		margin-top: 4px
		height: 36px
		font-size: 12px
		font-weight: 400
		color: #8D9197
		line-height: 18px
.style-child
	cursor: pointer
	display: inline
	float: left
	width: 170px
	height: 118px
	font-size: 0px
	padding: 8px
	border-bottom: 1px solid #EFEFEF
	border-right: 1px solid #EFEFEF
	position: relative
	text-align: center
	&.active
		background-color: #EBF3FF
		border-bottom: 1px solid #3F83F7
		border-right: 1px solid #3F83F7
		h4
			font-weight:bold
		&:after
			content:''
			position: absolute
			left: -1px
			top: 0px
			width: 0px
			height: 100%
			border-right: 1px solid #3F83F7
		&:before
			content:''
			position: absolute
			left: 0px
			top: -1px
			width: 100%
			height: 0px
			border-bottom: 1px solid #3F83F7
	&:hover
		background-color: #EBF3FF
		h4
			font-weight: bold
	&:nth-child(4n + 1)
		border-left: 1px solid #EFEFEF
	&:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(4)
		border-top: 1px solid #EFEFEF
	.style-icon
		text-align: center
		width: 108px
		height: 54px
		margin:0 auto
		img
			max-height: 100%
			vertical-align: middle
			max-width:100%
	.style-intro
		margin-top: 4px
	h4
		font-weight: normal
		height: 20px
		font-size: 12px
		line-height: 20px
	p
		margin-top: 4px
		font-size: 12px
		font-weight: 400
		color: #999999
		height: 18px
		line-height: 18px
		overflow: hidden
.mobile-card
	width: 242px
	height: 453px
	margin: 0 auto
	border-radius: 14px
	padding: 33px 14px 40px 14px
	background-image: url('~@/assets/image/ad/mobile-bg-new.png')
	.mobile-center
		font-size: 0px
		img
			vertical-align: top
			width: 100%
.private-check-card
	/deep/ .ivu-checkbox-wrapper-disabled.ivu-checkbox-border
		color: #ccc
.material-card
	position: relative
	display: inline-block
	vertical-align: top
</style>
