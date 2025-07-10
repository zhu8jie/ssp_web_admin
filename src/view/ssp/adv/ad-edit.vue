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
							<Input maxlength="100" show-word-limit placeholder="单个数表示点击率，也可以加下划线填2个数控制点击率和吊起率 例如:15_50" v-model.trim="formBase.ex_slot_id"></Input>
						</FormItem>

						<FormItem label="是否打开风控">
							<RadioGroup class="private-check-card" type="button" v-model="formBase.status_risk">
								<Radio v-for="item in statusRiskArr" :label="item.key" :key="item.key">{{ item.name }}</Radio>
							</RadioGroup>
						</FormItem>


						<FormItem label="开启放量" v-if="showButton == 1">
							<Button v-if="showButton == 1" type="primary" style="margin-left: 550px" @click="isShowHandler">放量新增</Button>
						</FormItem>
						<FormItem v-if="isShow == 1" label="放量规则">
							<div v-for="(item,index) in ctl_form" :key="index">
								<el-timeline>
									<el-timeline-item :timestamp="formatTimestampStart_End(item)" placement="top">

										<el-card>
											<div class="app-edit-tab">
												<div class="dau-flex">
													<div class="dau-child dau-child2">
														<Form>
															<FormItem label="控量类型">
																<div class="dau-flex">
																	<div class="dau-child">
																			<input type="radio" name="radio" v-model.number="item.ctl_type" value=1 v-on:click="radio_day(item)">
																			按天控量
																	</div>
																	<div class="dau-child">
																			<input type="radio" name="radio" v-model.number="item.ctl_type" value=2 v-on:click="radio_time(item)">
																			按小时控量
																	</div>
																</div>
															</FormItem>
															<FormItem v-if="item.ctl_type === 1">
																<Input  placeholder="请输入放量次数(单位:单次)" v-model.number="item.qpd" ></Input>
															</FormItem>
															<FormItem v-if="item.ctl_type === 2">
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>0&nbsp;&nbsp;点:</label>
																			<Input maxlength="20"  v-model.number="item.qp0hour" type="number"
																				   style="width: 160px"
																	   			placeholder="请输入00点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>1&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp1hour" type="number"
																				   style="width: 160px"
																	   			placeholder="请输入01点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>2&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp2hour" type="number"
																				   style="width: 155px"
																	   		placeholder="请输入02点放量次数(单位:单次)"></Input>
																		</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>3&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp3hour" type="number"
																				   style="width: 160px"
																	   			placeholder="请输入03点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>4&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp4hour" type="number"  style="width: 160px"
																	   			placeholder="请输入04点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>5&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp5hour" type="number"  style="width: 155px"
																	   		placeholder="请输入05点放量次数(单位:单次)"></Input>
																		</div>
																		</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>6&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp6hour" type="number"  style="width: 160px"
																	   			placeholder="请输入06点放量次数(单位:单次)"></Input>
																		</div>
																	<div class="dau-child">
																		<label>7&nbsp;&nbsp;点:</label>
																		<Input maxlength="50" v-model.number="item.qp7hour" type="number"  style="width: 160px"
																	  	 placeholder="请输入07点放量次数(单位:单次)"></Input>
																	</div>
																	<div class="dau-child">
																		<label>8&nbsp;&nbsp;点:</label>
																		<Input maxlength="50" v-model.number="item.qp8hour" type="number"  style="width: 155px"
																	   placeholder="请输入08点放量次数(单位:单次)"></Input>
																	</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>9&nbsp;&nbsp;点:</label>
																			<Input maxlength="50" v-model.number="item.qp9hour" type="number"  style="width: 160px"
																	   	placeholder="请输入09点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>10点:</label>
																		<Input maxlength="50" v-model.number="item.qp10hour" type="number"  style="width: 160px"
																	   	placeholder="请输入10点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>11点:</label>
																			<Input maxlength="50" v-model.number="item.qp11hour" type="number"  style="width: 155px"
																	   		placeholder="请输入11点放量次数(单位:单次)"></Input>
																		</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>12点:</label>
																			<Input maxlength="50" v-model.number="item.qp12hour" type="number"  style="width: 160px"
																	   placeholder="请输入12点放量次数(单位:单次)"></Input>
																	</div>
																	<div class="dau-child">
																		<label>13点:</label>
																		<Input maxlength="50" v-model.number="item.qp13hour" type="number"  style="width: 160px"
																	   placeholder="请输入13点放量次数(单位:单次)"></Input>
																	</div>
																	<div class="dau-child">
																		<label>14点:</label>
																		<Input maxlength="50"  v-model.number="item.qp14hour" type="number"  style="width: 155px"
																	   placeholder="请输入14点放量次数(单位:单次)"></Input>
																	</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>15点:</label>
																			<Input maxlength="50"  v-model.number="item.qp15hour" type="number"  style="width: 160px"
																	   placeholder="请输入15点放量次数(单位:单次)"></Input>
																		</div>
																	<div class="dau-child">
																		<label>16点:</label>
																			<Input maxlength="50"  v-model.number="item.qp16hour" type="number"  style="width: 160px"
																	   placeholder="请输入16点放量次数(单位:单次)"></Input>
																	</div>
																	<div class="dau-child">
																		<label>17点:</label>
																		<Input maxlength="50"  v-model.number="item.qp17hour" type="number"  style="width: 155px"
																	   placeholder="请输入17点放量次数(单位:单次)"></Input>
																	</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>18点:</label>
																			<Input maxlength="50"  v-model.number="item.qp18hour" type="number"  style="width: 160px"
																	   	placeholder="请输入18点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>19点:</label>
																		<Input maxlength="50"  v-model.number="item.qp19hour" type="number"  style="width: 160px"
																	   placeholder="请输入19点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>20点:</label>
																		<Input maxlength="50"  v-model.number="item.qp20hour" type="number"  style="width: 155px"
																	   placeholder="请输入20点放量次数(单位:单次)"></Input>
																		</div>
																	</div>
																</FormItem>
																<FormItem>
																	<div class="dau-flex">
																		<div class="dau-child">
																			<label>21点:</label>
																		<Input maxlength="50"  v-model.number="item.qp21hour" type="number"  style="width: 160px"
																	   placeholder="请输入21点放量次数(单位:单次)"></Input>
																	</div>
																	<div class="dau-child">
																		<label>22点:</label>
																			<Input maxlength="50"  v-model.number="item.qp22hour" type="number"  style="width: 160px"
																	   placeholder="请输入22点放量次数(单位:单次)"></Input>
																		</div>
																		<div class="dau-child">
																			<label>23点:</label>
																		<Input maxlength="50"  v-model.number="item.qp23hour" type="number"  style="width: 155px"
																	   placeholder="请输入23点放量次数(单位:单次)"></Input>
																		</div>
																		</div>
																</FormItem>
															</FormItem>
											</Form>
										</div>
									</div>

								</div>
						<Form  ref="modalForm">
							<FormItem>
								<div class="dau-flex">
									<div class="dau-child">
										<el-form>
											<el-form-item>
												<el-date-picker
													:key="datePickerKey"
													v-model="item.start_at"
													type="datetime"
													value-format="yyyy-MM-dd HH:mm:ss"
													placeholder="选择开始日期时间"
													@change='handleDateChangeStart(item)'
													default-time="12:00:00">
												</el-date-picker>
											</el-form-item>
										</el-form>
									</div>
									<div class="dau-child" style="margin-left: 15px">
										<el-form>
											<el-form-item>
												<el-date-picker
													:key="datePickerKey"
													size="medium"
													v-model="item.end_at"
													type="datetime"
													value-format="yyyy-MM-dd HH:mm:ss"
													format="yyyy-MM-dd HH:mm:ss"
													placeholder="选择开始日期时间"
													@change='handleDateChangeEnd(item)'
													default-time="12:00:00">
												</el-date-picker>
											</el-form-item>
										</el-form>
									</div>
									<div class="dau-child">

										<Button v-if="index !== -1" type="primary" size="mini"
												style="margin-left: 30px; height: 36px"
												@click="deleteItem(item, index)">删除</Button>
										<Button v-if="index === ctl_form.length - 1"
												type="primary"
												style="margin-left: 5px; height: 36px"
												@click="addItem(ctl_form.length)">新增</Button>
									</div>
								</div>
							</FormItem>
						</Form>

							</el-card>
									</el-timeline-item>
								</el-timeline>
							</div>

						</FormItem>

						<FormItem v-if="formBase.app_id" class="edit-save-formItem">
							<Button size="large" @click="goBack">取消</Button>
							<Button size="large" type="primary" :loading="submitClock" @click.prevent="submitFormData('formBase')">
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
import dayjs from "dayjs";
import {addNewChannel} from "../../../api/monitor";

export default {
	name: 'ad-edit',
	mixins: [formRules, inPageAccess],
	components: {
		uploadImage
	},
	data() {
		return {

			// loading: false,
			datePickerKey: 0, // 用于强制重新渲染的 key
			showButton : 1, // 1 显示 0 关闭
			isShow: 0, // 当有放量规则数据时
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
			history_list:[],
			newCtl_list:[
				{
					ctl_type: null, // 放量方式
					qpd: null,   // 每天放量多少
					qp0hour: null, // 0点
					qp1hour: null,
					qp2hour: null,
					qp3hour: null,
					qp4hour: null,
					qp5hour: null,
					qp6hour: null,
					qp7hour: null,
					qp8hour: null,
					qp9hour: null,
					qp10hour: null,
					qp11hour: null,
					qp12hour: null,
					qp13hour: null,
					qp14hour: null,
					qp15hour: null,
					qp16hour: null,
					qp17hour: null,
					qp18hour: null,
					qp19hour: null,
					qp20hour: null,
					qp21hour: null,
					qp22hour: null,
					qp23hour: null,
					start_at: null,  // 开始时间戳
					end_at: null,	 // 结束时间戳
					startTime: '',
					endTime: '',
				},
			],


			// 当前放量规则
			ctl_form: [],
			timevalue: null,


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
				status_risk: 1,

				ctl_type: null, // 放量方式
				qpd: null,   // 放量方式

				req_ctl_list:[
					{
						ctl_type: null, // 放量方式
						qpd: null,   // 每天放量多少
						qp0hour: null, // 0点
						qp1hour: null,
						qp2hour: null,
						qp3hour: null,
						qp4hour: null,
						qp5hour: null,
						qp6hour: null,
						qp7hour: null,
						qp8hour: null,
						qp9hour: null,
						qp10hour: null,
						qp11hour: null,
						qp12hour: null,
						qp13hour: null,
						qp14hour: null,
						qp15hour: null,
						qp16hour: null,
						qp17hour: null,
						qp18hour: null,
						qp19hour: null,
						qp20hour: null,
						qp21hour: null,
						qp22hour: null,
						qp23hour: null,
						start_at: null,  // 开始时间戳
						end_at: null,	 // 结束时间戳
						startTime: '',
						endTime:'',
					}
				]

			},

			temp_ctl: [],
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
		},

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
		isDecimal(num) {
			return typeof num === 'number' && !Number.isInteger(num);
		},

		// 刷新时间组件
		resetDate() {
			this.$nextTick(()=> {
				this.datePickerKey +=1
			})
		},

		isShowHandler(){
			if(this.isShow == 1){
				this.isShow = 0
			} else {
				this.isShow = 1
			}
			if(this.ctl_form.length === 0) {
				this.addItem()
			}
			this.showButton = 0
		},

		handleDateChangeEnd(item,value) {
			console.log('End date:',item,value)
			console.log("this.ctl_form",this.ctl_form)
		},
		handleDateChangeStart(item,value) {
			console.log('Start date:',item,value)
		},
		formatTimestamp(item) {
			return `开始时间: ${item.start_at} - 结束时间: ${item.end_at}`;
		},
		formatTimestampStart_End(item) {
			return `开始时间: ${item.start_at} - 结束时间: ${item.end_at}`;
		},

		// formatTimestampHistory(item) {
		// 	return `放量历史 开始时间: ${item.start_at} - 结束时间: ${item.end_at}`;
		// },
		// 新增规则
		addItem(length) {

				this.ctl_form.push({
					ctl_type: 1, // 放量方式
					qpd: null,   // 每天放量多少
					qp0hour: null, // 0点
					qp1hour: null,
					qp2hour: null,
					qp3hour: null,
					qp4hour: null,
					qp5hour: null,
					qp6hour: null,
					qp7hour: null,
					qp8hour: null,
					qp9hour: null,
					qp10hour: null,
					qp11hour: null,
					qp12hour: null,
					qp13hour: null,
					qp14hour: null,
					qp15hour: null,
					qp16hour: null,
					qp17hour: null,
					qp18hour: null,
					qp19hour: null,
					qp20hour: null,
					qp21hour: null,
					qp22hour: null,
					qp23hour: null,
					start_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),  // 开始时间戳
					end_at: ''	 // 结束时间戳
				})
		},
		//删除方法
		deleteItem(item, index) {
			console.log("deleteItem删除：",index,"item:",item)
			this.ctl_form.splice(index, 1)

			if(index === 0 && this.ctl_form.length == 0) {
				this.addItem()
				this.isShow = 0
				this.showButton	= 1
			}
		},
		deleteItemFu(item,index) {
			console.log("deleteItemFu删除：",index)
			this.newCtl_list.splice(index, 1)
		},

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
				console.log("res[2]",res[2])
				if (res[2].code === 200) {

					let _data = res[2].data
					console.log("res[2]====================================================",res[2])
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

					console.log("=============data",this.formBase)

					// 将formBase.ret_ctl_list,放入新的集合中
					this.ctl_form = _data.req_ctl_list.map((i,idx)=>{
						return {
							...i,
							start_at:i.start_at > 0?dayjs.unix(i.start_at).format("YYYY-MM-DD HH:mm:ss"):'',
							end_at:i.end_at > 0?dayjs.unix(i.end_at).format("YYYY-MM-DD HH:mm:ss"):''
						}
					})


					// this.ctl_form = []
					// // 然后判断数据是否是当前规则，是加入到新集合中,加入后退出
					// for(let element of this.newCtl_list) {
					// 		this.ctl_form.push(element)
					// 		break
					// }
					console.log("this.ctl_form:::::::::::::::::::::::",this.ctl_form)

					this.ctl_form.map(item=>{
						if(item.ctl_type === 1 && item.qpd > 0) {
							item.qpd = item.qpd / 10000
						}
						if(item.ctl_type === 2) {
							if(item.qp0hour > 0) {
								item.qp0hour = item.qp0hour / 10000
							}
							if(item.qp1hour > 0) {
								item.qp1hour = item.qp1hour / 10000
							}
							if(item.qp2hour > 0) {
								item.qp2hour = item.qp2hour / 10000
							}
							if(item.qp3hour > 0) {
								item.qp3hour = item.qp3hour / 10000
							}
							if(item.qp4hour > 0) {
								item.qp4hour = item.qp4hour / 10000
							}
							if(item.qp5hour > 0) {
								item.qp5hour = item.qp5hour / 10000
							}
							if(item.qp6hour > 0) {
								item.qp6hour = item.qp6hour / 10000
							}
							if(item.qp7hour > 0) {
								item.qp7hour = item.qp7hour / 10000
							}
							if(item.qp8hour > 0) {
								item.qp8hour = item.qp8hour / 10000
							}
							if(item.qp9hour > 0) {
								item.qp9hour = item.qp9hour / 10000
							}
							if(item.qp10hour > 0) {
								item.qp10hour = item.qp10hour / 10000
							}
							if(item.qp11hour > 0) {
								item.qp11hour = item.qp11hour / 10000
							}
							if(item.qp12hour > 0) {
								item.qp12hour = item.qp12hour / 10000
							}
							if(item.qp13hour > 0) {
								item.qp13hour = item.qp13hour / 10000
							}
							if(item.qp14hour > 0) {
								item.qp14hour = item.qp14hour / 10000
							}
							if(item.qp15hour > 0) {
								item.qp15hour = item.qp15hour / 10000
							}
							if(item.qp16hour > 0) {
								item.qp16hour = item.qp16hour / 10000
							}
							if(item.qp17hour > 0) {
								item.qp17hour = item.qp17hour / 10000
							}
							if(item.qp18hour > 0) {
								item.qp18hour = item.qp18hour / 10000
							}
							if(item.qp19hour > 0) {
								item.qp19hour = item.qp19hour / 10000
							}
							if(item.qp20hour > 0) {
								item.qp20hour = item.qp20hour / 10000
							}
							if(item.qp21hour > 0) {
								item.qp21hour = item.qp21hour / 10000
							}
							if(item.qp22hour > 0) {
								item.qp22hour = item.qp22hour / 10000
							}
							if(item.qp23hour > 0) {
								item.qp23hour = item.qp23hour / 10000
							}
						}
					})


					console.log("当前放量:============================================",this.ctl_form)

					// 如果新接收的集合不为空，打开规则
					// if(this.newCtl_list.length > 0) {
					// 	this.isShow = 1
					//
					// }
					if(this.ctl_form.length > 0) {
						this.isShow = 1
						this.showButton = 0
					}

					console.log("newCtl_list:::::::",this.newCtl_list)

					this.getAppListAndDetail() // 根据广告位详情得到app_id, 反向推算app相关（详情和列表）
				}
			}, err=> {

				this.$Spin.hide()
			})
		},

		/**
		 *  天/时间 单选框
		 */
		radio_day(item) {
			item.qp0hour = null
			item.qp1hour = null
			item.qp2hour = null
			item.qp3hour = null
			item.qp4hour = null
			item.qp5hour = null
			item.qp6hour = null
			item.qp7hour = null
			item.qp8hour = null
			item.qp9hour = null
			item.qp10hour = null
			item.qp11hour = null
			item.qp12hour = null
			item.qp13hour = null
			item.qp14hour = null
			item.qp15hour = null
			item.qp16hour = null
			item.qp17hour = null
			item.qp18hour = null
			item.qp19hour = null
			item.qp20hour = null
			item.qp21hour = null
			item.qp22hour = null
			item.qp23hour = null
		},
		radio_time(item) {
			item.qpd = null
		},

		radio_days(item) {

			item.qp0hour = null
			item.qp1hour = null
			item.qp2hour = null
			item.qp3hour = null
			item.qp4hour = null
			item.qp5hour = null
			item.qp6hour = null
			item.qp7hour = null
			item.qp8hour = null
			item.qp9hour = null
			item.qp10hour = null
			item.qp11hour = null
			item.qp12hour = null
			item.qp13hour = null
			item.qp14hour = null
			item.qp15hour = null
			item.qp16hour = null
			item.qp17hour = null
			item.qp18hour = null
			item.qp19hour = null
			item.qp20hour = null
			item.qp21hour = null
			item.qp22hour = null
			item.qp23hour = null
		},
		radio_times(item) {
			item.qpd = null
		},

		radio_dayss(item) {
			item.qp0hour = null
			item.qp1hour = null
			item.qp2hour = null
			item.qp3hour = null
			item.qp4hour = null
			item.qp5hour = null
			item.qp6hour = null
			item.qp7hour = null
			item.qp8hour = null
			item.qp9hour = null
			item.qp10hour = null
			item.qp11hour = null
			item.qp12hour = null
			item.qp13hour = null
			item.qp14hour = null
			item.qp15hour = null
			item.qp16hour = null
			item.qp17hour = null
			item.qp18hour = null
			item.qp19hour = null
			item.qp20hour = null
			item.qp21hour = null
			item.qp22hour = null
			item.qp23hour = null
		},
		radio_timess(item) {
			item.qpd = null
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
					this.submitClock = false
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
					this.newCtl_list = []
					console.log("this.ctl_form:==============================================================================================",this.ctl_form)
					console.log("this.newCtl_list000:==============================================================================================",this.newCtl_list)

					// 遍历集合将数据放入newCtl_list中
					this.ctl_form.map(item => {
						if(item.ctl_type === 1 && item.qpd != null){
							this.newCtl_list.push(item)
						} else if(item.ctl_type === 2){
							this.newCtl_list.push(item)
						} else if(item.ctl_type === 1 && item.qpd == null) {
							if(this.isShow === 1) {
								item.qpd = ""
								this.newCtl_list.push(item)
							}


						}
					})


					// 遍历current_ctl 表单收集数组，删除空表单
					let current_ctl = []
					let end_time_sore = []  // 存放结束时间
					let current_data_ctl = []

					this.newCtl_list.map(item=>{

						if(item.start_at != null || item.start_at !='') {
							item.startTime = item.start_at
							item.start_at = dayjs(item.start_at).unix()
						}

						if(item.ctl_type > 0 && item.start_at != null) {
							if(item.end_at == null || item.end_at == '') {
								item.end_at = 0
							} else {
								item.endTime = item.end_at
								item.end_at = dayjs(item.end_at).unix()
							}
							if(item.ctl_type === 1 && item.qpd != null) {
								current_ctl.push(item)
								end_time_sore.push(item.end_at)
							}
							if(item.ctl_type === 2) {
								current_ctl.push(item)
								end_time_sore.push(item.end_at)
							}
						}
					})
					console.log("this.newCtl_list:==============================================================",this.newCtl_list)
					end_time_sore.sort((x,y)=> x - y)
					// 遍历curent_ctl 排序放入 current_new_ctl 中， 排序以创建时间维准
					end_time_sore.map(item=> {
						current_ctl.map(items=> {
							if(items.end_at === item && item != 0) {
								console.log("item:::start_at:",item.end_at)
								current_data_ctl.push(items)
							}
						})
					})

					//把end_at 空的放入
					current_ctl.map(item=> {
						if (item.end_at === 0) {
							current_data_ctl.push(item)
						}
					})
					console.log("current_ctl::::::::",current_ctl)
					console.log("current_data_ctl::::::::",current_data_ctl)

					this.newCtl_list = []
					current_data_ctl = JSON.parse(JSON.stringify(current_data_ctl))

					current_data_ctl.map(item=> {
						if(item.ctl_type === 1 && item.qpd > 0) {
							item.qpd = item.qpd * 10000
						}
						if(item.ctl_type === 2) {
							if(item.qp0hour > 0) {
								item.qp0hour = item.qp0hour * 10000
							}
							if(item.qp1hour > 0) {
								item.qp1hour = item.qp1hour * 10000
							}
							if(item.qp2hour > 0) {
								item.qp2hour = item.qp2hour * 10000
							}
							if(item.qp3hour > 0) {
								item.qp3hour = item.qp3hour * 10000
							}
							if(item.qp4hour > 0) {
								item.qp4hour = item.qp4hour * 10000
							}
							if(item.qp5hour > 0) {
								item.qp5hour = item.qp5hour * 10000
							}
							if(item.qp6hour > 0) {
								item.qp6hour = item.qp6hour * 10000
							}
							if(item.qp7hour > 0) {
								item.qp7hour = item.qp7hour * 10000
							}
							if(item.qp8hour > 0) {
								item.qp8hour = item.qp8hour * 10000
							}
							if(item.qp9hour > 0) {
								item.qp9hour = item.qp9hour * 10000
							}
							if(item.qp10hour > 0) {
								item.qp10hour = item.qp10hour * 10000
							}
							if(item.qp11hour > 0) {
								item.qp11hour = item.qp11hour * 10000
							}
							if(item.qp12hour > 0) {
								item.qp12hour = item.qp12hour * 10000
							}
							if(item.qp13hour > 0) {
								item.qp13hour = item.qp13hour * 10000
							}
							if(item.qp14hour > 0) {
								item.qp14hour = item.qp14hour * 10000
							}
							if(item.qp15hour > 0) {
								item.qp15hour = item.qp15hour * 10000
							}
							if(item.qp16hour > 0) {
								item.qp16hour = item.qp16hour * 10000
							}
							if(item.qp17hour > 0) {
								item.qp17hour = item.qp17hour * 10000
							}
							if(item.qp18hour > 0) {
								item.qp18hour = item.qp18hour * 10000
							}
							if(item.qp19hour > 0) {
								item.qp19hour = item.qp19hour * 10000
							}
							if(item.qp20hour > 0) {
								item.qp20hour = item.qp20hour * 10000
							}
							if(item.qp21hour > 0) {
								item.qp21hour = item.qp21hour * 10000
							}
							if(item.qp22hour > 0) {
								item.qp22hour = item.qp22hour * 10000
							}
							if(item.qp23hour > 0) {
								item.qp23hour = item.qp23hour * 10000
							}
						}

					})
					// this.loading = false
					this.history_list = current_data_ctl

					// 解决提交时的弹框问题
					// this.ctl_form = null
					form.req_ctl_list = current_data_ctl
					console.log("打印：formBase::::;;;",this.ctl_form)

					updateSspSlot(form).then(res=> {
						this.submitClock = false
						// this.loading = true
						if(res.code === 200) {
							this.$Bus.$emit('sspAdvEmitEvent') // ssp-adv
							this.$Bus.$emit('dspSlotEmitEvent') // dsp-slot
							this.$Message.success({content: '保存成功', duration: 3})
							this.goBack()
						}
						if(res.code === 500) {
							this.resetDate()

							this.ctl_form = []
							console.log("this.History_form::::::::::::::::::",this.history_list)
							this.history_list.map(item=>{
								item.end_at = item.endTime
								item.start_at = item.startTime
								if(item.ctl_type === 1 && item.qpd > 0) {
									item.qpd = item.qpd / 10000
								}
								if(item.ctl_type === 2) {
									if (item.qp0hour > 0) {
										item.qp0hour = item.qp0hour / 10000
									}
									if (item.qp1hour > 0) {
										item.qp1hour = item.qp1hour / 10000
									}
									if (item.qp2hour > 0) {
										item.qp2hour = item.qp2hour / 10000
									}
									if (item.qp3hour > 0) {
										item.qp3hour = item.qp3hour / 10000
									}
									if (item.qp4hour > 0) {
										item.qp4hour = item.qp4hour / 10000
									}
									if (item.qp5hour > 0) {
										item.qp5hour = item.qp5hour / 10000
									}
									if (item.qp6hour > 0) {
										item.qp6hour = item.qp6hour / 10000
									}
									if (item.qp7hour > 0) {
										item.qp7hour = item.qp7hour / 10000
									}
									if (item.qp8hour > 0) {
										item.qp8hour = item.qp8hour / 10000
									}
									if (item.qp9hour > 0) {
										item.qp9hour = item.qp9hour / 10000
									}
									if (item.qp10hour > 0) {
										item.qp10hour = item.qp10hour / 10000
									}
									if (item.qp11hour > 0) {
										item.qp11hour = item.qp11hour / 10000
									}
									if (item.qp12hour > 0) {
										item.qp12hour = item.qp12hour / 10000
									}
									if (item.qp13hour > 0) {
										item.qp13hour = item.qp13hour / 10000
									}
									if (item.qp14hour > 0) {
										item.qp14hour = item.qp14hour / 10000
									}
									if (item.qp15hour > 0) {
										item.qp15hour = item.qp15hour / 10000
									}
									if (item.qp16hour > 0) {
										item.qp16hour = item.qp16hour / 10000
									}
									if (item.qp17hour > 0) {
										item.qp17hour = item.qp17hour / 10000
									}
									if (item.qp18hour > 0) {
										item.qp18hour = item.qp18hour / 10000
									}
									if (item.qp19hour > 0) {
										item.qp19hour = item.qp19hour / 10000
									}
									if (item.qp20hour > 0) {
										item.qp20hour = item.qp20hour / 10000
									}
									if (item.qp21hour > 0) {
										item.qp21hour = item.qp21hour / 10000
									}
									if (item.qp22hour > 0) {
										item.qp22hour = item.qp22hour / 10000
									}
									if (item.qp23hour > 0) {
										item.qp23hour = item.qp23hour / 10000
									}

								}
							})

							this.ctl_form = this.history_list
							 console.log("this.ctl_form:000-000::",this.ctl_form)
						}
						if(res.code === 400) {
							this.resetDate()

							this.ctl_form = []
							console.log("this.History_form::::::::::::::::::",this.history_list)
							this.history_list.map(item=>{
								item.end_at = item.endTime
								item.start_at = item.startTime
							})

							this.ctl_form = this.history_list
							console.log("this.ctl_form:000-000::",this.ctl_form)
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
		// 异步

	},
	watch: {
		'demoTitle'() {
			// 应该只在创建的时候联动
			if(this.demoTitle && !this.slot_id) {
				this.formBase.ssp_slot_name = `${this.appBaseData.app_name ? this.appBaseData.app_name + '-' : ''}${this.demoTitle}`
			}
		},
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
