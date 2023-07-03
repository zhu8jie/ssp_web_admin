<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<h2 class="page-title">编辑应用</h2>
			<!-- {{navType}}
			<br>
			媒体是否有sdk权限：{{hasSdkPer}}
			<br>
			媒体是否有api权限：{{hasApiPer}}
			<br>
			应用平台：{{formBase.os_type === 2 ? 'IOS' : 'Android'}}
			<br>
			接入方式： {{formBase.access_type}} (1=API，2=SDK) -->

			<div v-if="formBase.app_name"  class="edit-content-card">

				<div class="app-edit-tab">
					<div class="tab-label" :class="{'active' : navType === 'base'}" @click="navType = 'base'">基本信息</div>
					<div class="tab-label" v-if="formBase.access_type === 2" :class="{'active' : navType === 'sdk'}" @click="navType='sdk'">SDK个性化配置</div>
				</div>

				<div class="app-section" v-show="navType === 'base'">
					<Form :model="formBase" :label-colon="true" label-position="right" :label-width="300" :rules="ruleBase" ref="formBase">
						<div class="basic-part">
							<FormItem label="选择应用平台和应用商店" class="ivu-form-item-required">
								<FormItem prop="os_type" style="display: inline-block; width: 120px">
									<Select :disabled="resolveNoEdit" v-model="formBase.os_type" placeholder="应用平台" @on-change="_getStore" data-tag="resetAccessType">
										<!-- 如果该媒体的账号权限只给了sdk，那么在选择应用平台时，不可以选择ios平台 -->
										<Option :disabled="hasSdkPer && !hasApiPer && item.id === 2" v-for="item in osTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
									</Select>
								</FormItem>
								<FormItem prop="app_store_id" style="display: inline-block; width: 120px">
									<Select v-model="formBase.app_store_id" placeholder="应用商店">
										<Option v-for="item in appStoreList" :value="item.id" :key="item.id">{{ item.name }}</Option>
									</Select>
								</FormItem>
								<FormItem prop="store_detail_url" style="display: inline-block; width: 260px">
									<Input style="width: 260px" maxlength="200" placeholder="应用商店详情页地址" v-model.trim="formBase.store_detail_url"></Input>
								</FormItem>
							</FormItem>
							<FormItem label="填写应用商店下载地址">
								<Input style="width: 508px" maxlength="200" placeholder="可直接下载app的地址" v-model.trim="formBase.store_download_url"></Input>
							</FormItem>
							<FormItem label="填写应用名称" prop="app_name">
								<Input style="width: 508px" maxlength="30" show-word-limit placeholder="请填写与应用商店一致的应用名称" v-model.trim="formBase.app_name"></Input>
							</FormItem>
							<FormItem label="选择应用类型" prop="app_type_one">
								<Select style="width: 251px" v-model="formBase.app_type_one" placeholder="应用类型" @on-change="appTypeOneChange">
									<Option v-for="item in industryList" :value="item.id" :key="item.id">{{ item.name }}</Option>
								</Select>
								<Select style="width: 251px" v-model="formBase.app_type_two" placeholder="应用类别">
									<Option v-for="item in categoryList" :value="item.id" :key="item.id">{{ item.name }}</Option>
								</Select>
							</FormItem>
							<FormItem label="填写应用关键字" prop="keyword">
								<Input style="width: 508px" maxlength="60" show-word-limit placeholder="多个关键词请用英文逗号隔开" v-model.trim="formBase.keyword"></Input>
							</FormItem>
							<FormItem label="填写应用简介" prop="desc">
								<Input style="width: 508px" maxlength="200" :rows=5 show-word-limit placeholder="准确的简介能够提升广告的匹配度和收益" type="textarea" v-model.trim="formBase.desc"></Input>
							</FormItem>
							<FormItem label="填写应用包名" prop="package_name">
								<Input style="width: 508px" placeholder="填写包名必须与广告请求的包名一致，否则影响收益" maxlength="50" v-model.trim="formBase.package_name"></Input>
								<p class="upload-img-format-tips">我们验证包名的唯一性，请求时只验证主包名</p>
							</FormItem>
							<FormItem label="选择接入方式" prop="access_type">
								<!-- {{formBase.access_type}} -->
								<RadioGroup class="private-check-card" type="button" v-model="formBase.access_type">
									<!-- 如果应用平台选择ios，接入方式只能选择api -->
									<Radio :disabled="resolveNoEdit || (formBase.os_type == 2 && item.id == 2) || item.value === -1" v-for="item in access_type_select" :label="item.id" :key="item.id">{{ item.name }}</Radio>
								</RadioGroup>
							</FormItem>
							<!-- 选择sdk时，展示第三方sdk选项 -->
							<FormItem v-show="formBase.access_type == 2 && !sdkOnlyTuiaHide" label="选择接入第三方SDK">
								<!-- 2020.9.27 注释： 只要选择了sdk， 隐藏则默认选择 交互通 -->
								<CheckboxGroup class="private-check-card" v-model="formBase.app_platform_id">
									<Checkbox v-for="item in platform3rdListSelect" :label="item.id" :key="item.id" border>{{item.name}}</Checkbox>
								</CheckboxGroup>
								<p class="upload-img-format-tips">若取消某方SDK，将不再下发对应广告</p>
							</FormItem>
							 <FormItem label="上传应用Icon" prop="icon">
								<upload-image :idVal="1" refName="icon" :bit="1024" v-model="formBase.icon" :widthVal="150" :heightVal="150">
									<Icon type="md-add" size="24"/>
									<p>点击上传</p>
								</upload-image>
								<p class="upload-img-format-tips">（支持格式仅限jpg、jpeg、png,大小1M以内)</p>
							</FormItem>
							<FormItem label="上传计算机软件著作权登记证书" prop="copyright_img">
								<upload-image :idVal="2" refName="copyright_img" :bit="5 * 1024" v-model="formBase.copyright_img" :widthVal="150" :heightVal="150">
									<Icon type="md-add" size="24"/>
									<p>点击上传</p>
								</upload-image>
								<p class="upload-img-format-tips">（支持格式仅限jpg、jpeg、png,大小5M以内)</p>
							</FormItem>
							<FormItem label="上传公司关联关系及媒体授权证明">
								<upload-image :idVal="3" refName="authorization_img" :bit="5 * 1024" v-model="formBase.authorization_img" :widthVal="150" :heightVal="150">
									<Icon type="md-add" size="24"/>
									<p>点击上传</p>
								</upload-image>

								<p class="upload-img-format-tips">（支持格式仅限jpg、jpeg、png,大小5M以内)</p>
							</FormItem>

							<FormItem v-if="formBase.os_type" label="填写带有广告展示的应用商店及下载地址" class="choose-store" prop="app_check_store">
								<div class="child-item" v-for="(item, index) in formBase.app_check_store" :key="index">
									<Select style="width: 120px" v-model="item.id" placeholder="应用商店">
										<Option v-for="child in appStoreList" :value="child.id" :key="child.id">{{ child.name }}</Option>
									</Select>
									<Input style="width: 382px" placeholder="应用商店详情页地址" v-model.trim="item.value"></Input>
								</div>
							</FormItem>

							<FormItem label="应用受众用户特征信息" prop="user_character">
								<div class="dau-flex" style="margin-bottom: 10px">
									<div class="dau-child">
										<p>日活用户数量(DAU):</p>
										<div class="dau-num-inner">
											<InputNumber :max="99999" :min="0" style="width: 160px" v-model="formBase.app_dau"></InputNumber>
											<span class="num-label">万人</span>
										</div>
									</div>
									<div class="dau-child">
										<p>男女用户占比：</p>
										<div class="dau-num-inner">
											<InputNumber :max="100" :min="0" :step="1" :precision="0" style="width: 150px" v-model="formBase.app_male_rate"></InputNumber>
											：
											<InputNumber :max="100" :min="0" :step="1" :precision="0" style="width: 150px" v-model="formBase.app_female_rate"></InputNumber>
										</div>
									</div>
								</div>
								<div class="dau-flex">
									<div class="dau-child">
										<p>用户年龄层:</p>
										<Input style="width: 508px" placeholder="例如20-30岁" v-model="formBase.user_age_group"></Input>
									</div>
								</div>
							</FormItem>
							<FormItem label="应用用户特征">
								<Input style="width: 508px" maxlength="100" show-word-limit placeholder="例如：年轻用户居多，活跃度高" v-model="formBase.user_character"></Input>
							</FormItem>
							<FormItem label="适合预算类型">
								<Input style="width: 508px" maxlength="100" show-word-limit placeholder="例如：下载、电商" v-model="formBase.fit_budget_type"></Input>
							</FormItem>
							<FormItem label="不可投放类型" prop="no_put_type">
								<Input style="width: 508px" maxlength="100" show-word-limit placeholder="例如：竞品" v-model="formBase.no_put_type"></Input>
							</FormItem>
						</div>
					</Form>
				</div>

				<!-- sdk配置 -->
				<div class="sdk-section"  v-show="navType === 'sdk'">
					<div class="sdk-middle">
						<div class="sdk-left">
							<Form :model="sdkFormBase" :label-colon="true" label-position="right" :label-width="300" :rules="sdkRuleBase" ref="sdkFormBase">
								<div class="sdk-part">
									<div class="sdk-inner-title">点击交互</div>
									<FormItem>
										<template slot="label">
											广告位点击范围
											<Tooltip max-width="410" placement="right">
												<div slot="content">广告样式：激励视频/插屏-全屏视频/长视频<br>精准点击：仅点击按钮，触发点击后交互<br>全屏点击：点击屏幕任何位置都触发点击后交互<br>目的：提高点击率</div>
												<i class="icon-why"></i>
											</Tooltip>
											:
										</template>
										<RadioGroup v-model="sdkFormBase.interact_click">
											<Radio :label="1">精准点击</Radio>
											<Radio :label="2">全屏点击</Radio>
										</RadioGroup>
									</FormItem>
								</div>

								<div class="sdk-part">
									<div class="sdk-inner-title">下载交互</div>
									<FormItem>
										<template slot="label">
											下载未安装的二次安装提示
											<Tooltip max-width="410" placement="right">
												<div slot="content">广告样式：全部样式<br>提示安装逻辑：下载未安装的30分钟后，24小时后，且用户打开app超过5分钟才提示<br>目的：提高安装率</div>
												<i class="icon-why"></i>
											</Tooltip>
											:
										</template>
										<RadioGroup v-model="sdkFormBase.interact_download">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
								</div>

								<div class="sdk-part">
									<div class="sdk-inner-title">视频广告交互</div>
									<FormItem prop="interact_video_goon_percent">
										<template slot="label">
											视频播放完直接跳转/下载/拨打电话
											<Tooltip max-width="410" placement="right">
												<div slot="content">广告样式：激励视频/插屏-全屏视频/长视频<br>指视频播放完成后不跳转中间页，直接执行点击后交互<br>目的：提高点击率</div>
												<i class="icon-why"></i>
											</Tooltip>
											:
										</template>
										<RadioGroup v-model="sdkFormBase.interact_video_goon">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
										<template v-if="sdkFormBase.interact_video_goon === 1">
											<Input v-model="sdkFormBase.interact_video_goon_percent" style="width: 80px" maxlength="3"></Input>&nbsp;&nbsp;%的流量适配该设置
										</template>
									</FormItem>
									<FormItem label="视频播放完的中间页样式">
										<RadioGroup v-model="sdkFormBase.interact_video_mid_style">
											<Radio :label="1">
												一
												<Tooltip max-width="410" placement="right" transfer>
													<div slot="content">
														<div class="demo-img"><img src="~@/assets/image/sdk/video-style/style-1.png"></div>
													</div>
													<i class="icon-why"></i>
												</Tooltip>
											</Radio>
											<Radio :label="2">
												二
												<Tooltip max-width="410" placement="right" transfer>
													<div slot="content">
														<div class="demo-img"><img src="~@/assets/image/sdk/video-style/style-2.png"></div>
													</div>
													<i class="icon-why"></i>
												</Tooltip>
											</Radio>
											<Radio :label="3">
												三
												<Tooltip max-width="410" placement="right" transfer>
													<div slot="content">
														<div class="demo-img"><img src="~@/assets/image/sdk/video-style/style-3.png"></div>
													</div>
													<i class="icon-why"></i>
												</Tooltip>
											</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放完的中间页关闭按钮位置">
										<RadioGroup v-model="sdkFormBase.interact_video_mid_close_position">
											<Radio :label="1">左侧</Radio>
											<Radio :label="2">右侧</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放完的中间页关闭按钮弹出延迟时间">
										<RadioGroup v-model="sdkFormBase.interact_video_mid_close_delay">
											<Radio :label="1">1s</Radio>
											<Radio :label="2">2s</Radio>
											<Radio :label="3">3s</Radio>
										</RadioGroup>
									</FormItem>
								</div>


								<div class="sdk-part">
									<div class="sdk-inner-title">
										一键加群
										<Tooltip max-width="410" placement="right">
											<div slot="content">广告样式：激励视频/插屏-全屏视频/长视频<br>可设置应用下广告位是否支持一键加群<br>加群的交互方式<br>目的：私域引效</div>
											<i class="icon-why"></i>
										</Tooltip>
									</div>
									<FormItem label="是否支持「一键加群」交互">
										<RadioGroup v-model="sdkFormBase.interact_join_group">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗显示延迟时间" prop="join_group_video_delay">
										<Input v-model="sdkFormBase.join_group_video_delay" maxlength="1" style="width: 80px"></Input>&nbsp;&nbsp;秒
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗背景色">
										<RadioGroup v-model="sdkFormBase.join_group_video_background">
											<Radio :label="1">半透明</Radio>
											<Radio :label="2">白色</Radio>
											<Radio :label="3">黑色</Radio>
											<Radio :label="4">橙色</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗位置">
										<RadioGroup v-model="sdkFormBase.join_group_video_position">
											<Radio :label="1">上</Radio>
											<Radio :label="2">右</Radio>
											<Radio :label="3">下</Radio>
											<Radio :label="4">左</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗动画">
										<RadioGroup v-model="sdkFormBase.join_group_video_cartoon">
											<Radio :label="0">无</Radio>
											<Radio :label="1">移入</Radio>
											<Radio :label="2">淡入</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗是否显示QQ图标">
										<RadioGroup v-model="sdkFormBase.join_group_video_qq_icon">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="视频播放页「加群」弹窗是否显示角标">
										<RadioGroup v-model="sdkFormBase.join_group_video_corner_icon">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="点击「加群」弹窗后是否直接下载应用">
										<RadioGroup v-model="sdkFormBase.join_group_click_download">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
									<FormItem label="落地页显示「一键加群」交互">
										<RadioGroup v-model="sdkFormBase.landing_page_join_group">
											<Radio :label="1">是</Radio>
											<Radio :label="-1">否</Radio>
										</RadioGroup>
									</FormItem>
								</div>
							</Form>
						</div>
						<div class="sdk-right" v-if="false">
							预览
						</div>
					</div>
				</div>
			</div>
		</Card>

		<div v-if="resolveNoEdit" class="edit-save-formItem">
			<Button size="large" @click="goBack">取消</Button>
			<Button size="large" type="primary" :loading="submitClock" @click="submitFormData">
				{{!submitClock ? '提交' : '提交中...'}}
			</Button>
		</div>
	</div>
</template>

<script>
import { getDevUserInfoApi, getAppInfo, saveAppDetail } from '@/api/ssp.js'
import { getAppIndustry, getAppStore } from '@/api/common.js'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { formRules } from './app-edit-rules.js' // 正则校验
import { inPageAccess } from '@/mixin/in-page-access.js'
import { mapActions } from 'vuex'
import uploadImage from '_c/upload-image'

export default {
	name: 'appEdit',
	mixins: [commonMixin, formRules, inPageAccess],
	data() {
		return {
			app_id: this.$route.query.app_id ? Number(this.$route.query.app_id) : '', // 应用id
			ud_id: this.$route.query.ud_id ? Number(this.$route.query.ud_id) : '', // media的userid

			hasSdkPer: false, // 是否有sdk权限
			hasApiPer: false, // 是否有API权限
			access_type_select: [], // 选择接入方式
			sdkOnlyTuiaHide: false, // 第三方sdk，如果只有交互通，则隐藏
			platform3rdListSelect: [], // 第三方sdk勾选情况
			backPlatform3rd: [], // 第三方SDK, 用于提交时判断是否修改，如果修改则触发修改审核中

			formBase: {
				os_type: '', // 应用平台
				app_store_id: '', // 应用商店ID
				store_detail_url: '', // 应用商店详情地址
				store_download_url: '', // 商店下载地址
				app_name: '', // 应用名称
				app_type_one: '', // 应用所属行业一级分类ID
				app_type_two: '', // 应用所属行业二级分类ID
				keyword: '', // 应用关键字，英文逗号分隔
				desc: '', // 应用简介
				package_name: '', // 应用包名
				access_type: '', // 接入方式
				app_platform_id: [], // 第三方SDK
				icon: '', // 上传应用icon地址
				copyright_img: '', // 上传计算机软件著作权登记证书
				authorization_img: '', // 上传公司关联关系及媒体授权证明
				app_check_store: [{id: '', value: ''}, {id: '', value: ''}, {id: '', value: ''}], // 应用商店确认 key是商店ID，value是商店地址
				app_dau: 0, // 日活用户数，单位（万人）
				app_male_rate: 0, // 应用男性用户占比
				app_female_rate: 0, // 应用女性用户占比
				no_put_type: '' // 不可投放类型
			},
			sdkFormBase: {
				interact_click: 2, //点击交互,1=精准点击，2=全屏点击
				interact_download: 1, // 下载交互，下载未安装是否二次安装提示，1=是，-1=否
				interact_video_goon: -1, // 视频交互，播放完后是否直接跳转或者下载拨打电话，1=是，-1=否
				interact_video_goon_percent: 100, // 视频交互，播放完后是否直接跳转或者下载拨打电话，百分比
				interact_video_mid_style: 1, // 视频交互，播放完的中间页样式，1，2，3
				interact_video_mid_close_position: 1, // 视频交互，播放完的中间页关闭按钮位置，1=左侧，2=右侧
				interact_video_mid_close_delay: 3, // 视频交互，播放完的中间页关闭按钮弹出延迟时间，单位秒
				interact_join_group: 1, // 是否支持一键加群，1=是，-1=否
				join_group_video_delay: 3, // 视频播放页加群弹窗显示延迟时间，单位秒
				join_group_video_background: 1, // 视频播放页加群弹窗背景色枚举，1=半透明，2=白色，3=黑色，4=橙色
				join_group_video_position: 1, // 视频播放页加群弹窗位置枚举，1=上，2=右，3=下，4=左
				join_group_video_cartoon: 2, // 视频播放页加群弹窗动画枚举，0=无，1=移入，2=淡入
				join_group_video_qq_icon: 1, // 视频播放页加群弹窗是否显示QQ图标，-1=否，1=是
				join_group_video_corner_icon: 1, // 视频播放页加群弹窗是否显示角标，-1=否，1=是
				join_group_click_download: 1, // 点击加群弹窗后是否直接下载应用，-1=否，1=是
				landing_page_join_group: 1 // 落地页是否显示一键加群，-1=否，1=是
			},
			navType: 'base', // tab切换
			submitClock: false, // 保存锁
			resolveNoEdit: false, // 部分内容不可修改
			appStoreList: [], // 应用商店列表数据
			industryList: [], // 选择应用类型
			categoryList: [] // 选择应用类别
		}
	},
	computed: {
		osTypeList() { // 渲染方式  模板/自渲染
			return this.$store.getters.osType
		}
	},
	components: {
		uploadImage
	},
	created() {
		this._getAppIndustry()

		// 判断是否有修改权限
		let resultArr = this._isPageShow()
		if (this._isSuperAdmin() || !!resultArr.includes('edit')) {
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
				getAppInfo({app_id: this.app_id}) // 应用信息
			]).then(res => {
				this.$Spin.hide()

				if(res[0].code === 200) {
					this.setMeidaInfo(res[0].data) // 设置当前媒体方的信息
				}

				if(res[1].code === 200) {
					this.setAppDetail(res[1]) // 设置应用信息
				}
			})
		},

		/**
		 * [setMeidaInfo 设置当前媒体方的信息]
		 * @return {[type]} [description]
		 */
		setMeidaInfo(data) {

			let { access_type_select, sdk_on_off_select } = data

			// 获取媒体的权限
			let _arr = []
			access_type_select.map(item => {
				// API权限
				if (item.id === 1 && item.value === 1) {
					this.hasApiPer = true
				}
				// SDK权限
				if (item.id === 2 && item.value === 1) {
					this.hasSdkPer = true
				}

				if (item.value === 1) {
					_arr.push(item)
				}
			})

			// 第三方sdk只选择了推啊 则隐藏
			let isOnlyTuia = sdk_on_off_select.filter(item => {
				return item.value === 1 && item.id !== 3
			})

			this.sdkOnlyTuiaHide = isOnlyTuia.length === 0

			// 筛选接入第三方SDK，只有后台的勾选才能显示
			let sdkArr = sdk_on_off_select.filter(item => {
				return item.value === 1
			})

			this.platform3rdListSelect = sdkArr
			this.access_type_select = _arr
		},
		/**
		 * [setAppDetail 设置应用详情]
		 * @return {[type]} [description]
		 */
		setAppDetail(res) {

			let data = res.data

			// 初始化有广告展示的应用商店及下载地址
			let addArr = [{id: '', value: ''}, {id: '', value: ''}, {id: '', value: ''}]

			if (!data.app_check_store || data.app_check_store.length === 0) {
				data.app_check_store = addArr
			} else {

				// 此处为保持和vue_media中的应用编辑一致，格式化处理一下，把 {app_store_id, store_download_url} => {id, value}
				let _arr = []
				data.app_check_store.map(item => {
					_arr.push({
						id: item.app_store_id,
						value: item.store_download_url
					})
				})
				data.app_check_store = [..._arr, ...addArr.slice(data.app_check_store.length)]
			}

			// 1. 防止恶意串改app_id，导致无数据情况
			// 2. 部分内容不可修改
			this.resolveNoEdit = !!this.app_id && this.app_id === data.app_id

			// 逻辑修改，因为后台返回的数据 app_platform_ids是个包含{key, value}的值，所以此处做格式化处理
			let idsArr = []
			data.app_platform_ids = data.app_platform_ids || []
			data.app_platform_ids.map(item => {
				idsArr.push(item.platform_id)
			})
			data.app_platform_id = idsArr

			// 赋值
			let sdkInfo = data.sdk_info

			delete data.sdk_info

			this.formBase = data

			this.setSdkData(sdkInfo) // 设置sdk值

			this.backPlatform3rd = data.app_platform_id // 备份使用

			this._getStore() // 获取appstroe数据

			if (!!data.app_type_one) {
				this._getAppIndustry(data.app_type_one)
			}
		},
		/**
		 * [setSdkData 设置sdk的默认值]
		 * @param {[type]} data [description]
		 */
		setSdkData(data) {
			// this.sdkFormBase = sdkInfo
			
			if(!data) {
				this.sdkFormBase = {}
				return
			}

			this.sdkFormBase = {
				interact_click: data.interact_click || 2, //点击交互,1=精准点击，2=全屏点击
				interact_download: data.interact_download || 1, // 下载交互，下载未安装是否二次安装提示，1=是，-1=否
				interact_video_goon: data.interact_video_goon || -1, // 视频交互，播放完后是否直接跳转或者下载拨打电话，1=是，-1=否
				interact_video_goon_percent: data.interact_video_goon_percent || 100, // 视频交互，播放完后是否直接跳转或者下载拨打电话，百分比
				interact_video_mid_style: data.interact_video_mid_style || 1, // 视频交互，播放完的中间页样式，1，2，3
				interact_video_mid_close_position: data.interact_video_mid_close_position || 1, // 视频交互，播放完的中间页关闭按钮位置，1=左侧，2=右侧
				interact_video_mid_close_delay: data.interact_video_mid_close_delay || 3, // 视频交互，播放完的中间页关闭按钮弹出延迟时间，单位秒
				interact_join_group: data.interact_join_group || 1, // 是否支持一键加群，1=是，-1=否
				join_group_video_delay: data.join_group_video_delay || 3, // 视频播放页加群弹窗显示延迟时间，单位秒
				join_group_video_background: data.join_group_video_background || 1, // 视频播放页加群弹窗背景色枚举，1=半透明，2=白色，3=黑色，4=橙色
				join_group_video_position: data.join_group_video_position || 1, // 视频播放页加群弹窗位置枚举，1=上，2=右，3=下，4=左
				join_group_video_cartoon: data.join_group_video_cartoon || 1, // 视频播放页加群弹窗动画枚举，0=无，1=移入，2=淡入
				join_group_video_qq_icon: data.join_group_video_qq_icon || 1, // 视频播放页加群弹窗是否显示QQ图标，-1=否，1=是
				join_group_video_corner_icon: data.join_group_video_corner_icon || 1, // 视频播放页加群弹窗是否显示角标，-1=否，1=是
				join_group_click_download: data.join_group_click_download || 1, // 点击加群弹窗后是否直接下载应用，-1=否，1=是
				landing_page_join_group: data.landing_page_join_group || 1 // 落地页是否显示一键加群，-1=否，1=是
			}
		},
		/**
		 * [validateForm 校验form表单]
		 * @return {[type]} [description]
		 */
		validateForm(name) {
			let _this = this

			return new Promise(function(resolve, reject) {
				_this.$refs[name].validate((valid) => {
					resolve(valid)
				})
			})
		},
		/**
		 * [submitSet 提交表单]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitFormData() {
			Promise.all([
				this.validateForm('formBase'),
				this.validateForm('sdkFormBase')
			]).then(res => {

				if(!(res.toString().indexOf('false') > -1)) {
					let form = {...this.formBase}

					// 提交内容需要格式化处理

					// 1-pre, 因为后台可能减少第三方sdk选项，所以先处理数据
					let lastPlat3rd = []
					this.platform3rdListSelect.map(item => {
						if (!!item.id) {
							lastPlat3rd.push(item.id)
						}
					})

					// 1. 只有选择sdk， 格式化成{id: 1, value: 1/-1}
					// 修改： 2020.9.27，只要选择了sdk，默认就会有交互通
					let _arr = []
					this.platform3rdList.map(item => {
						let _obj = {id: item.id, value: -1}

						// 1. 只有选择sdk， 格式化成{id: 1, value: 1/-1}
						// 修改： 2020.9.27，只要选择了sdk，默认就会有交互通
						if (form.access_type === 2) {
							// 1: 前者处理已选择id,   2后者处理：管理平台变化了第三方sdk || id = 3 交互通默认勾选
							if ((form.app_platform_id.indexOf(item.id) > -1 && lastPlat3rd.indexOf(item.id) > -1)) {
								_obj['value'] = 1
								_arr.push(_obj)
							} else {
								_arr.push(_obj)
							}
						} else {
							// 选择api时 ， 清空第三方sdk
							_arr.push(_obj)
						}
					})
					form.app_platform_id = _arr

					// 2.格式化处理广告展示的应用商店及下载地址
					let appCheckArr = []
					form.app_check_store.map(item => {
						if (!!item.id && !!item.value) {
							appCheckArr.push(item)
						}
					})
					form.app_check_store = appCheckArr

					// 3. 提交审核状态
					// 3.1 如果已拒绝，再次提交时，触发待审核
					if (form.status === 4) {
						form.status = 3
					}

					// 3.2 如果已通过，并且接入方式为sdk, 但是修改第三方sdk，触发修改审核中
					if (form.status === 1 && form.access_type === 2 && this.formBase.app_platform_id !== this.backPlatform3rd) {
						form.status = 2
					}

					// 2021/5/18新增需求，如果是sdk可配置个性化
					if (form.access_type === 2) {
						let sdkForm = { ...this.sdkFormBase}

						sdkForm.interact_video_goon_percent = sdkForm.interact_video_goon === -1 ? 100 : Number(sdkForm.interact_video_goon_percent)
						sdkForm.join_group_video_delay = Number(sdkForm.join_group_video_delay)


						form.sdk_info = sdkForm
					} else {
						form.sdk_info = null
					}

					// console.log(form)

					this.submitClock = true

					saveAppDetail(form).then(res => {
						this.submitClock = false
						if (res.code === 200) {
							this.$Bus.$emit('editEmitEvent') // 列表数据刷新

							this.$Message.success({content: form.app_id ? '修改成功' : '保存成功', duration: 3})
							this.goBack()
						}
					}, err => {
						this.submitClock = false
					})
				} else {
					this.$Message.error({content: this.$config.requiredText, duration: 3})
				}
			})
		},
		/**
		 * [appTypeOneChange 类型一发生变化时]
		 * @return {[type]} [description]
		 */
		appTypeOneChange(value) {
			this.formBase.app_type_two = ''
			this._getAppIndustry(value)
		},
		/**
		 * [_etAppIndustry 获取应用类型]
		 * @return {[type]} [description]
		 */
		async _getAppIndustry(id) {
			let res = await getAppIndustry({parent_id: id})

			if (res.code === 200) {
				if (!!id) {
					this.categoryList = res.data.list || [] // 类别 2
				} else {
					this.industryList = res.data.list || [] // 类型 1
				}
			}
		},
		/**
		 * [_getStore 获取应用商店]
		 * @return {[type]} [description]
		 */
		async _getStore(el) {
			if (!this.formBase.os_type) {
				return
			}

			// 更换应用平台 需要清空 接入方式 (创建的情况下)
			if (!this.app_id) {
				this.formBase.access_type = ''
			}

			getAppStore({os_type: this.formBase.os_type}).then(res => {
				if (res.code === 200) {
					this.appStoreList = res.data.list || []
				}
			})
		},
		/**
		 * [goBack 返回上一页]
		 * @return {[type]} [description]
		 */
		goBack() {
			this.$router.push({name: 'application-manage'})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.page-title
	font-size: 16px
.dau-flex
	display: flex
	width: 508px
	justify-content: space-between
	p
		padding-top: 6px
		font-size: 14px
		line-height: 20px
		margin-bottom: 10px
	.dau-num-inner
		position: relative
		.num-label
			position: absolute
			right: 30px
			top: 0px
			height: 32px
			line-height: 32px
.choose-store
	.child-item
		margin-bottom: 10px

.app-section
	border: 1px solid #dcdcdc
	margin-bottom: 10px
	.basic-part
		padding: 12px
.sdk-section
	border: 1px solid #dcdcdc
	margin-bottom: 10px
	.sdk-part
		padding: 12px
		border-bottom: 1px solid rgba(232,234,236, 0.7)
		&:last-child
			border-bottom: 0
		/deep/ .ivu-radio-wrapper
			min-width: 80px
	.sdk-inner-title
		color: #4083f8
		position: relative
		padding-left: 12px
		margin-bottom: 10px
		&:before
			content: ''
			position: absolute
			left: 0px
			height: 80%
			top: 10%
			width: 2px
			background: #4083f8
.sdk-middle
	display: flex
	.sdk-right
		border-left: 1px solid rgba(232,234,236, 0.7)
		flex: 0 0 300px
	.sdk-left
		flex: 1
.app-edit-tab
	font-size: 0px
	.tab-label
		display: inline-block
		height: 40px
		line-height: 40px
		font-size: 15px
		width: 150px
		text-align: center
		margin-right: 10px
		border: 1px solid #dcdee2
		border-bottom: 0
		border-radius: 4px 4px 0 0
		position: relative
		cursor: pointer
		background-color: #f8f8f9
		&.active
			color: #4083f8
			background-color: #fff
			font-weight: bold
			&:after
				content: ''
				display: block
				position: absolute
				width: 100%
				height: 1px
				background-color: #fff
				left: 0px
				bottom: -1px
.app-section, .sdk-section
	/deep/ .ivu-form
		.ivu-form-item
			&:last-child
				margin-bottom: 0
.edit-save-formItem
	margin-top: 20px
	background-color: #fff
	padding: 10px 20px
	text-align: center
.icon-why
	color: #999999
	cursor: pointer
</style>
