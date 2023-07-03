<template>
	<div>
		<Card :bordered="false" dis-hover class="page-main">
			<div class="page-title clearfix">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
          <Button class="host" type="text" @click="doColumns">自定义列</Button>
          <Button v-if="_isShow_('download')" @click="downStatement" :loading="downClock" class="host" type="text" ghost>
            <i class="iconfont icon-download"></i>
            <span v-if="!downClock">下载列表</span>
            <span v-else>下载中...</span>
          </Button>
					<Button style="background:#EAAE30;color: #ffffff " v-if="_isShow_('batchNewApp')" type="text" @click="showImportModal({'type': 'add', 'title': '批量新建应用'})"><icon class="icon icon-new-create"/>批量新建应用</Button>

					<Button style="background:#EAAE30;color: #ffffff " v-if="_isShow_('batchNewApp')" type="text" @click="showImportModal({type: 'update', title: '批量修改应用'})"><icon class="icon icon-new-create"/>批量修改应用</Button>

				</div>
			</div>
			<div class="search-line">
				<Select
					class="i-margin-right-11 i-width-select"
					multiple
					filterable
					v-model="filterSearch.ud_id"
					:max-tag-count="1"
					:max-tag-placeholder="limitText"
					placeholder="媒体简称/ID"
				>
					<Option v-for="item in meidaCompanyArr" :value="item.id" :key="item.id">{{item.name}} (ID:{{item.id}})</Option>
				</Select>
				<div class="select-tree i-width-select i-margin-right-11">
					<Treeselect
						:disable-branch-nodes="true"
						:options="industryList"
						:load-options="loadOptions"
						:limitText="limitText"
						:limit="1"
						placeholder="应用类型"
						v-model="filterSearch.industry_id"
						noOptionsText="加载中"
						noResultsText="没有搜索的结果"
					></Treeselect>
				</div>
				<Select
					class="i-margin-right-11 i-width-select"
					v-model="filterSearch.access_type"
					placeholder="接入方式"
					:clearable="true"
				>
					<Option v-for="item in accessTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
				</Select>
				<Input
					class="i-margin-right-11 i-width-input-long"
					v-model="filterSearch.search_text"
					placeholder="输入应用名称或ID查询"
					:clearable="true" />
				<Button type="primary" @click="doFilterList">查询</Button>
			</div>
			<div class="nav-handle-group">
				<RadioGroup v-model="filterSearch.status" type="button" @on-change="doFilterList">
					<Radio label="">全部<span>({{count}})</span></Radio>
					<Radio label="1">有效<span>({{valid_count}})</span></Radio>
					<Radio label="3">待审核<span style="color:#F72D17">({{wait_check_count}})</span></Radio>
					<Radio label="2">修改审核中<span style="color:#F72D17">({{updating_count}})</span></Radio>
					<Radio label="4">已拒绝<span>({{reject_count}})</span></Radio>
					<Radio label="5">封禁<span>({{stop_count}})</span></Radio>
					<Radio label="-1">暂停合作<span>({{is_stop_count}})</span></Radio>
				</RadioGroup>
			</div>
			<div class="console-table">
				<Table
					highlight-row
					stripe border
					:columns="tableColList"
					:data="colDatList"
					:loading="tableLoadFlag"
					:height="tableHeight"
					:no-data-text="noDataText"
				>
					<!--应用名称/ID-->
					<template slot-scope="{ row }" slot="app_id">
						<p class="name-row-ellipsis" :title="`${row.app_name}(${row.os_type_text})`">{{ row.app_name }}</p>
						<p class="tip-row-line">ID: {{ row.app_id }}</p>
					</template>
					<!--应用平台-->
					<template slot-scope="{ row }" slot="os_type_text">
						{{row.os_type_text}}
					</template>
					<!--媒体简称/ID-->
					<template slot-scope="{ row }" slot="ud_id">
						<p class="name-row-ellipsis" :title="row.ud_dev_name">{{row.ud_dev_name}}</p>
						<p class="tip-row-line">ID: {{ row.ud_id }}</p>
					</template>
					<!--应用类型-->
					<template slot-scope="{ row }" slot="industry_type">
						{{ row.industry_type }}
					</template>
					<!--应用包名-->
					<template slot-scope="{ row }" slot="package_name">
						{{row.package_name || '-'}}
					</template>
					<!--接入方式-->
					<template slot-scope="{ row }" slot="access_type_text">
						{{ row.access_type_text }}
					</template>
					<!--业务状态-->
					<template slot-scope="{ row }" slot="status">
						<Badge v-if="row.status == 1" color="#339900" text="有效" />
						<Badge v-if="row.status == 2" color="#015D16" text="修改审核中" />
						<Badge v-if="row.status == 3" color="#999999" text="待审核" />
						<Badge v-if="row.status == 4" color="#B5291A" text="已拒绝" />
						<Badge v-if="row.status == 5" color="#F72D17" text="封禁" />
						<Badge v-if="row.status == -1" status="error" text="暂停合作" />

						<Poptip v-if="(row.status == 5 || row.status == 4) && row.status_desc" trigger="hover" :content="row.status_desc">
							<i class="iconfont icon-why"></i>
						</Poptip>
					</template>
					<!--第三方SDK接入-->
					<template slot-scope="{ row }" slot="platform_sdk">
						<span v-if="row.access_type == 2">{{ row.platform_sdk }}</span>
						<span v-else>-</span>
					</template>
					<!--穿山甲APPID-->
					<template slot-scope="{ row }" slot="pangolin_APPID">
						<p v-html="filter3PlatId(row, 'pangolin', 'platform_app_id')"></p>
					</template>
					<!--优量汇APPID-->
					<template slot-scope="{ row }" slot="you_APPID">
						<p v-html="filter3PlatId(row, 'you', 'platform_app_id')"></p>
					</template>
					<!--交互通appkey-->
					<template slot-scope="{ row }" slot="tuia_APPKEY">
						<p v-html="filter3PlatId(row, 'tuia', 'platform_app_key')"></p>
					</template>
					<!--交互通appsecret-->
					<template slot-scope="{ row }" slot="tuia_AppSecret">
						<p v-html="filter3PlatId(row, 'tuia', 'platform_app_secret')"></p>
					</template>
					<!--创建时间-->
					<template slot-scope="{ row }" slot="created_time">
						{{ row.created_time }}
					</template>
					<!--更新时间-->
					<template slot-scope="{ row }" slot="updated_time">
						{{ row.updated_time }}
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text" :to="toView(row)" v-if="_isShow_('view')">查看</Button>
						<Button type="text" :to="toEdit(row, 'app-edit')" v-if="_isShow_('edit')">编辑</Button>
						<!-- 1.API, 只有通过和拒绝 -->
						<template v-if="row.access_type == 1">
							<!-- 有效 -->
							<template v-if="row.status == 1">
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
							</template>
							<!-- 修改审核中 -->
							<template v-if="row.status == 2">
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
							</template>
							<!-- 待审核 -->
							<template v-if="row.status == 3">
								<Button type="text" @click="toEnable(row)" v-if="_isShow_('pass')">通过</Button>
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('refuse')">拒绝</Button>
							</template>
							<!-- 拒绝 -->
							<template v-if="row.status == 4">
								<Button type="text" @click="toEnable(row)" v-if="_isShow_('pass')">通过</Button>
							</template>
							<!-- 封禁 -->
							<template v-if="row.status == 5">
								<Button type="text" @click="toEnable(row)" v-if="_isShow_('enable')">启用</Button>
							</template>
							<!-- 暂停合作 -->
							<template v-if="row.status == 6">
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
							</template>
						</template>
						<!-- 2. SDK -->
						<template v-if="row.access_type == 2">
							<!-- {{row.access_type === 2 ? 'SDK' : 'API'}} -->
							<!-- 有效 -->
							<template v-if="row.status == 1">
								<Button type="text" @click="showSetModal(row)" v-if="_isShow_('setting')">配置</Button>
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
							</template>
							<!-- 修改审核中 -->
							<template v-if="row.status == 2">

								<!-- 问题备忘：如果当前 platform_conf_list 不存在，

								媒体未选任何第三方SDK

								则显示 通过 -->
								<Button type="text" @click="showSetModal(row)" v-if="_isShow_('passAndSet') && row.platform_conf_list.length">通过并配置</Button>
								<Button type="text" @click="toEnable(row)" v-if="_isShow_('passAndSet') && !row.platform_conf_list.length">通过</Button>
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
							</template>
							<!-- 待审核 -->
							<template v-if="row.status == 3">
								<Button type="text" @click="showSetModal(row)"  v-if="_isShow_('passAndSet')">通过并配置</Button>
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('refuse')">拒绝</Button>
							</template>
							<!-- 已拒绝-->
							<template v-if="row.status == 4">
								<Button type="text" @click="showSetModal(row)"  v-if="_isShow_('passAndSet')">通过并配置</Button>
							</template>
							<!-- 封禁-->
							<template v-if="row.status == 5">
								<Button type="text" @click="showSetModal(row)" v-if="_isShow_('setting')">配置</Button>
								<Button type="text" @click="toEnable(row)" v-if="_isShow_('enable')">启用</Button>
							</template>
							<!-- 暂停合作 -->
							<template v-if="row.status == 6">
								<Button type="text" @click="toBanned(row)" v-if="_isShow_('banned')">封禁</Button>
								<Button type="text" @click="showSetModal(row)" v-if="_isShow_('setting')">配置</Button>
							</template>
						</template>
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>

        <!--配置弹窗-->
        <Drawer class="setModal" title="配置" v-model="setModalFlag" :mask-closable="false" :closable="false" width="600" :styles="drawStyles">
            <Form :label-width="140" ref="setModalForm" :model="setModalForm">
                <FormItem label="应用名称（ID）:">
                    <Input disabled v-model.trim="setModalForm.app_id_2_name" placeholder="应用名称（ID）"></Input>
                </FormItem>

                <template v-for="(item, index) in setModalForm.list">
                    <div v-if="item.platform_id === 2" :key="index">
                        <FormItem label="优量汇账号">
                            <RadioGroup v-model="item.account_id">
                                <Radio v-for="child in item.account_list" :label="child.id" :key="child.id">{{child.account}}</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="优量汇APPID">
                            <Input :maxlength="50" v-model.trim="item.app_id" placeholder="优量汇APPID"></Input>
                        </FormItem>
                    </div>
                    <div v-if="item.platform_id === 1" :key="index">
                        <FormItem label="穿山甲账号">
                            <RadioGroup v-model="item.account_id">
                                <Radio v-for="child in item.account_list" :label="child.id" :key="child.id">{{child.account}}</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="穿山甲APPID">
                            <Input :maxlength="50" v-model.trim="item.app_id" placeholder="穿山甲APPID"></Input>
                        </FormItem>
                    </div>
                    <div v-if="item.platform_id === 3" :key="index">
                        <FormItem label="交互通账号">
                            <RadioGroup v-model="item.account_id">
                                <Radio v-for="child in item.account_list" :label="child.id" :key="child.id">{{child.account}}</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="交互通appkey">
                            <Input :maxlength="50" v-model.trim="item.app_key" placeholder="交互通appkey"></Input>
                        </FormItem>
                        <FormItem label="交互通appsecret">
                            <Input :maxlength="50" v-model.trim="item.app_secret" placeholder="交互通appsecret"></Input>
                        </FormItem>
                    </div>
                </template>
            </Form>
            <div class="drawer-footer">
                <Button style="margin-right: 20px" @click="closeSetModal">取消</Button>
                <Button type="primary" :loading="saveClock" @click="submitSet('setModalForm', 'save')">
                    <span v-if="!saveClock">保存</span>
                    <span v-else>提交中...</span>
                </Button>
                <!-- sdk&待审核||已拒绝 -->
                <Button v-if="(catchRowData.status === 2 || catchRowData.status === 3 || catchRowData.status === 4) && catchRowData.access_type === 2" type="success" :loading="savePassClock" @click="submitSet('setModalForm', 'savePass')">
                    <span v-if="!savePassClock">保存并通过</span>
                    <span v-else>提交中...</span>
                </Button>
            </div>
        </Drawer>

        <!--自定义列-->
        <custom-column ref="customColumn" :datalist="catchTableColList" @on-change="columnChange"></custom-column>

        <!--审核拒绝/封禁弹窗-->
        <Drawer v-model="bannedModalFlag" :title="catchRowData.status === 3 ? '确定应用拒绝么？' : '确定封禁该账户么？'" :mask-closable="false" :closable="false" class-name="vertical-center-modal" width="500" :styles="drawStyles">
            <Form ref="bannedForm">
                <FormItem label="">
                    <Input v-model.trim="bannedReason" show-word-limit maxlength="50" type="textarea" :rows="6" :placeholder="catchRowData.status === 3 ? '拒绝原因，不超过50字，必填' : '封禁原因，不超过50字，必填'" />
                </FormItem>
            </Form>
            <div class="drawer-footer">
                <Button @click="cancleBanned">取消</Button>
                <Button type="primary" :loading="submitClock" @click="trueBanned('banned')">
                    <span v-if="!submitClock">确定</span>
                    <span v-else>提交中...</span>
                </Button>
            </div>
        </Drawer>
		<!--批量导入广告位-->
		<Drawer v-model="exportModalFlag" :title="importDrawObj.title" :mask-closable="false" :closable="false"
		class="newBatch" width="600" :styles="drawStyles">
			<Form ref="exportForm" :label-width="120" :label-colon="true">
				<div class="down_export">
					<div v-if="importDrawObj.type === 'add'"><icon class="icon icon-excel" style="font-size: 20px"/>新建应用模板</div>
					<div v-if="importDrawObj.type === 'update'"><icon class="icon icon-excel" style="font-size: 20px"/>修改应用模板</div>
					<div>
						<a v-if="importDrawObj.type === 'add'" download :href="`${this.$xlsAPIUrl}/%E6%96%B0%E5%BB%BA%E5%BA%94%E7%94%A8%E6%A8%A1%E6%9D%BF.xlsx`">
							<icon class="icon download"/>下载
						</a>
						<a v-if="importDrawObj.type === 'update'" download :href="`${this.$xlsAPIUrl}/%E4%BF%AE%E6%94%B9%E5%BA%94%E7%94%A8%E6%A8%A1%E6%9D%BF.xlsx`">
							<icon class="icon download"/>下载
						</a>
					</div>
				</div>
				<FormItem label="请上传应用表格" prop="file">
					<Upload
						:action="importDrawObj.type === 'add' ? appImportUrl : appImportUpdateUrl"
						type="drag"
						:show-upload-list="false"
						:format="['csv','xlsx','xls']"
						:on-format-error="handleFormatError"
						:before-upload="handleBeforUpload"
						:max-size="10 * 1024"
					>
						<div class="upload-inner">
							<div class="icon-box">
								<icon class="icon icon-cloud-upload"/>
							</div>
							<div class="upload-txt">
								<p>将文件拖到此处，或<span>点击上传</span></p>
							</div>
						</div>
					</Upload>
				</FormItem>
				<FormItem>
					<p>{{filename}}</p>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancleExport">取消</Button>
				<Button type="primary" :loading="exportClock" @click="uploadPublic()">
					<span v-if="!exportClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
		</Drawer>
    </div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { debounce, createObjectURL } from '@/libs/tools'
import { getAppIndustry, getDownLoadXls } from '@/api/common'
import { getAppList, getAppConfigInfo, setAppConfigInfo, setAppDevStatus, appImport, appImportUrl, getAppListUrl, appImportUpdate, appImportUpdateUrl } from '@/api/ssp'
import { commonMixin } from '@/mixin/basic-common-class.js'
import { tableHeight } from '@/mixin/calc-table-height.js'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { columnFn } from '@/mixin/custom-column.js'
import customColumn from '@/components/local-custom-column/custom-column' // 自定义列

export default {
	name: 'appManage',
	mixins: [commonMixin, tableHeight, inPageAccess, columnFn],
	components: {
        customColumn
    },
	data() {
		return {
			appImportUrl: appImportUrl,
			appImportUpdateUrl: appImportUpdateUrl,
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			noDataText: this.$config.noDataText,
			downClock: false, // 导出的loading

			filterSearch: { // 搜索条件
				status: '', // 标签栏状态，-1=暂停合作，0=全部，1=正常，2=修改审核中，3=待审核，4=已拒绝，5=封禁
				ud_id: [], // 根据用户简称选择得到的用户ID
				industry_id: null, // 所属行业分类，传最低维度的选项结果
				access_type: null, // 接入方式，1=API，2=SDK
				search_text: '' // 模糊查询输入框
			},

			count: 0, // 全部
			is_stop_count: 0, // 暂停合作
			reject_count: 0, // 拒绝
			stop_count: 0, // 封禁
			updating_count: 0, // 修改审核中
			valid_count: 0, // 有效正常
			wait_check_count: 0, // 待审核

			tableLoadFlag: true, // table的loading
			catchTableColList: [
				{
					type: 'index',
					width: 36,
					fixed: 'left',
					align: 'center',
					isHideInColumn: true
				},
				{
					title: '应用名称/ID',
					slot: 'app_id',
					width: 150,
					fixed: 'left',
					isHideInColumn: true
				},
				{
					title: '应用平台',
					slot: 'os_type_text',
					width: 80
				},
				{
					title: '媒体简称/ID',
					slot: 'ud_id',
					width: 150
				},
				{
					title: '应用类型',
					slot: 'industry_type',
					minWidth: 150
				},
				{
					title: '应用包名',
					slot: 'package_name',
					minWidth: 150
				},
				{
					title: '接入方式',
					slot: 'access_type_text',
					minWidth: 80
				},
				{
					title: '业务状态',
					slot: 'status',
					minWidth: 110
				},
				{
					title: '第三方SDK接入',
					slot: 'platform_sdk',
					minWidth: 180
				},
				{
					title: '穿山甲APPID',
					slot: 'pangolin_APPID',
					minWidth: 150
				},
				{
					title: '优量汇APPID',
					slot: 'you_APPID',
					minWidth: 150
				},
				{
					title: '交互通appkey',
					slot: 'tuia_APPKEY',
					minWidth: 150
				},
				{
					title: '交互通appsecret',
					slot: 'tuia_AppSecret',
					minWidth: 150
				},
				{
					title: '更新时间',
					slot: 'updated_time',
					minWidth: 150
				},
				{
					title: '创建时间',
					slot: 'created_time',
					minWidth: 150
				},
				{
					title: '操作',
					slot: 'action',
					minWidth: 220,
					fixed: 'right',
					isHideInColumn: true
				}
			],
			colDatList: [],
			catchRowData: '', // 点击配置和重置密码时的缓存row数据

			submitClock: false, // 重置密码锁

			setModalForm: { // 配置弹窗
				list: []
			},
			setModalFlag: false, // 配置弹窗
			savePassClock: false, // 保存并通过 锁
			saveClock: false, // 保存并通过 锁

			bannedModalFlag: false,
			bannedReason: '', // 紧闭的理由

			importDrawObj: {}, // 导入应用相关（批量新建应用/批量修改应用）
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
			uploadList: [], // 上传的文件
			filename: '',
			exportClock: false,
			exportModalFlag: false,
			industryList: [], // 应用类型
            categoryList: [] // 应用类别
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		}
	},
	created() {

		this.getTableColumns()

		if (this._hasPageAccess()) {
			this.getAppList() // 默认请求一次应用列表数据
			this._getAppIndustry() // 应用类型和类别
		}
	},
	mounted() {
		this.initTableHeight({'search-line': {isAutoCalc: false, isInclude: true}, 'nav-handle-group': true}) // search-line的高度
	},
	activated() {
		this.$Bus.$off('editEmitEvent')
		this.$Bus.$on('editEmitEvent', (msg) => {
			this.getAppList() // 列表数据
		})
	},
	methods: {
		/**
		 * [filter3PlatId 过滤第三方sdk]
		 * @param  {[type]} row [description]
		 * @param  {[type]} type [description]
		 * @param  {[type]} ket [要匹配的key值]
		 * @return {[type]}     [description]
		 */
		filter3PlatId(row, type, key) {
			// key, id 对应值
			// key: 穿山甲， id: 1
			const keyObj = {
				'pangolin': 1, // key: 穿山甲， id: 1
				'you': 2, // key: 优量汇， id: 2
				'tuia': 3 // 交互通， id: 3
			}
			// 过滤规则
			// 1. API 直接返回 '-'
			if (row.access_type === 1) {
				return '-'
			}

			// 2. SDK
			if (row.access_type === 2) {
				let result = '-'
				const platform_conf_list = row.platform_conf_list
				platform_conf_list.map(item => {
					if (item.platform_id === keyObj[type]) {
						result = item[key] || `<span class="wait-id">待配置</span>`
					}
				})
				return result
			}
		},
		/**
		 * [_etAppIndustry 获取应用类型]
		 * @return {[type]} [description]
		 */
		async _getAppIndustry(id) {
			let res = await getAppIndustry({
				parent_id: id
			})

			if (res.code === 200) {
				res.data.list.map(item => {
					item['label'] = item.name
					item['children'] = null
				})

				if (id) {
					this.categoryList = res.data.list || [] // 类别 2
				} else {
					this.industryList = res.data.list || [] // 类型 1
				}
			}
		},
		/**
		 * [cancleBanned 取消封禁]
		 * @return {[type]} [description]
		 */
		cancleBanned(type) {
			this.bannedModalFlag = false
			this.catchRowData = ''
			if (type === 'clear') {
				this.bannedReason = ''
			}
		},
		/**
		 * [toBanned 封禁]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toBanned(row) {
			this.bannedModalFlag = true
			this.catchRowData = row
		},
		/**
		 * [trueBanned description]
		 * @param  {[type]} type ['open 开启', 'banned' 禁用]
		 * @return {[type]}      [description]
		 */
		trueBanned(type) {
			if (!this.bannedReason && type === 'banned') {
				this.$Message.error({
					content: this.catchRowData.status === 3 ? '请输入拒绝原因' : '请输入封禁原因',
					duration: 3
				})
				return
			}

			let params = {
				app_id: this.catchRowData.app_id,
				status_desc: type === 'banned' ? this.bannedReason : ''
			}

			if (type === 'open') {
				params.status = 1
			} else if (type === 'banned') {
				params.status = this.catchRowData.status === 3 ? 4 : 5 // 正常1->封禁5。。 待审核3->拒绝4
			}

			this.submitClock = true

			setAppDevStatus(params).then(res => {
				this.submitClock = false
				this.cancleBanned('clear')

				if (res.code === 200) {
					this.$Message.success({content: '操作成功', duration: 3})
					this.getAppList() // 刷新列表
				}
			}, error => {
				this.submitClock = false
			})
		},
		/**
		 * [toEnable 开启]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		toEnable(row) {
			this.catchRowData = row

			this.$Modal.confirm({
				title: row.status === 3 ? '确定应用审核通过么？' : '确定启用应用么？启用即代表该应用的业务恢复，广告可正常下发',
				onOk: () => {
					this.trueBanned('open')
				},
				onCancel: () => {
					this.catchRowData = ''
				}
			})
		},
		/**
		 * [closeSetModal 关闭设置弹出]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		closeSetModal(row) {
			this.setModalFlag = false
			this.setModalForm = {
				list: []
			}
		},

		/**
		 * [submitSet 提交设置]
		 * @param  {[type]} name [description]
		 * @param  {[type]} type [保存 保存并通过]
		 * @return {[type]}      [description]
		 */
		submitSet(name, type) {
			// setAppConfigInfo
			let _form = this.setModalForm

			let params = {
				app_id: _form.app_id
			}

			// 参数处理
			let _config = []
			_form.list.map(item => {
				_config.push({
					platform_id: Number(item.platform_id),
					account_id: Number(item.account_id),
					app_id: item.app_id,
					app_key: item.app_key,
					app_secret: item.app_secret

				})
			})
			params.config = _config

			// 锁
			if (type === 'save') {
				this.saveClock = true
			} else if (type === 'savePass') { // 保存并通过
				this.savePassClock = true
			}

			setAppConfigInfo(params).then(res => {
				this.savePassClock = false
				this.saveClock = false

				this.closeSetModal()

				if (res.code === 200) {
					if (type === 'savePass') {
						this.trueBanned('open')// 保存并通过
					} else {
						this.$Message.success({content: '保存成功', duration: 3})
						this.getAppList() // 刷新列表
					}
				}
			}, error => {
				this.savePassClock = false
				this.saveClock = false
			})
		},
		/**
		 * [showSetModal 点击配置按钮]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		async showSetModal(row) {
			this.$Spin.show()
			this.catchRowData = row

			let res = await getAppConfigInfo({
				app_id: row.app_id
			})

			this.$Spin.hide()

			if (res.code === 200) {
				let list = res.data.list

				list.map(item => {
					item.account_id = String(item.cpta_id)
				})

				// 赋值
				this.setModalForm.app_id = row.app_id
				this.setModalForm.app_id_2_name = row.app_name ? `${row.app_name}/${row.app_id}` : row.app_id
				this.setModalForm.list = list || []

				this.setModalFlag = true
			}
		},
		/**
		 * [downStatement 下载报表]
		 * @return {[type]} [description]
		 */
		downStatement() {
			this.downClock = true
			let params = {
				...this.getAxiosParams(),
				...{
					page_size: this.total_count,
					page_num: 1
				}
			}

			let down = {
				url: getAppListUrl(params),
				method: 'GET'
			}

			getDownLoadXls(down).then(res => {
				if (res.code === 200) {
					let filename = '应用列表.xlsx'
					createObjectURL(res.data.url, filename)
				}
				this.downClock = false
			})
		},
		/**
		 * [getAppList 获取app列表]
		 * @return {[type]} [description]
		 */
		getAppList() {
			let params = {
				...this.getAxiosParams(),
				...{
					page_size: this.pageSize,
					page_num: this.currentPage
				}
			}

			this.tableLoadFlag = true

			getAppList(params).then(res => {
				this.tableLoadFlag = false

				let data = res.data

				if (res.code === 200) {
					this.total_count = data.total_count
					this.count = data.count // 全部
					this.is_stop_count = data.is_stop_count // 暂停合作
					this.reject_count = data.reject_count // 拒绝
					this.stop_count = data.stop_count // 封禁
					this.updating_count = data.updating_count // 修改审核中
					this.valid_count = data.valid_count // 有效正常
					this.wait_check_count = data.wait_check_count // 待审核

					this.colDatList = data.list
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [getAxiosParams 获取下载和列表的url参数]
		 * @return {[type]} [description]
		 */
		getAxiosParams() {

			let _filter = this.filterSearch

			let params = {
					status: _filter.status,
					search_text: _filter.search_text,
					industry_id: _filter.industry_id || '',
					access_type: _filter.access_type,
				}

				// 开发者用户ID
				!!_filter.ud_id.length && (params.ud_id = _filter.ud_id)

			return params
		},
		/**
		 * [doFilterList 筛选媒体列表]
		 * @return {[type]} [description]
		 */
		doFilterList() {
			this.currentPage = 1
			this.getAppList()
		},
		/**
		 * [changePage 切换页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			// 切换页码
			this.currentPage = val
			this.getAppList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getAppList()
		},
		/**
		 * [toEdit 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		toEdit(row) {
			return `/ssp/app/edit?app_id=${row.app_id}&ud_id=${row.ud_id}`
		},
        /**
         * [toView 查看]
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        toView(row) {
            return `/ssp/app/detail?app_id=${row.app_id}&ud_id=${row.ud_id}`
        },
		/**
		 * [loadOptions 应用类型加载子列表]
		 * @param  {[type]}   action     [description]
		 * @param  {[type]}   parentNode [description]
		 * @param  {Function} callback   [description]
		 * @return {[type]}              [description]
		 */
		async loadOptions({action, parentNode, callback}) {
			if (action === 'LOAD_CHILDREN_OPTIONS') {
				let res = await getAppIndustry({parent_id: parentNode.id})

				res.data.list.map(item => {
					item['label'] = item.name
				})

				parentNode.children = res.data.list
			}
		},
		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},


		/********************************************
        *↓↓↓↓↓↓↓↓↓↓ 以上部分为文件上传 start *↓↓↓↓↓↓↓
        ********************************************/
		/**
		 * [showImportModal 显示批量导入]
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		showImportModal(obj) {
			this.importDrawObj = obj
			this.exportModalFlag = true
		},
		// 上传的错误判断
		handleFormatError(file) {
			this.$Message.error({
				content: '不支持此文件类型',
				duration: 3
			})
			this.$Spin.hide()
		},
		/**
		 * [checkFormat 校验文件类型, 必须满足]
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		checkFormat(type) {
			let format = ['csv', 'xlsx', 'xls']
			if (!format.includes(type)) {
				this.$Message.error({
					content: '文件格式错误',
					duration: 3
				})
				return false
			}

			return true
		},
		// 上传前的判断
		handleBeforUpload(file) {
			let type = file.name && file.name.indexOf('.') ? file.name.split('.') : ''
			let finallyType = type[type.length - 1].toLowerCase()
			if (!this.checkFormat(finallyType)) {
				return false
			}
			this.uploadList = []
			if (file && file.size > (10 * 1024 * 1024)) {
				this.$Message.warning('文件不能大于' + 10 + 'M')
				return false
			} else {
				this.uploadList.push(file)
				this.filename = file.name
				return false
			}
		},
		uploadPublic() { // 图片、视频公共批量上传
			if (this.uploadList.length === 0) {
				this.$Message.error('请上传文件')
				return false
			} else {
				this.upload()
			}
		},
		/**
		 * [upload 批量新建应用]
		 * @return {[type]} [description]
		 */
		upload() {

			let formData = new FormData()
			formData.append('file', this.uploadList[0])

			let proAxios = this.importDrawObj.type === 'add' ? appImport(formData) : (this.importDrawObj.type === 'update' ? appImportUpdate(formData) : '')

			this.exportClock = true

			proAxios.then(res => {
				if (res.code === 200) {
					this.$Message.success('上传成功')
					this.getAppList()
				} else if (res.code === 405) {

					let _arr = !!res.msg ? res.msg.split(';') : []

					if (_arr.length) {

						let html = '<div style="max-height: 400px;overflow: auto;">'
						_arr.map(_ => {
							html += `<p style="line-height:20px">${_}</p>`
						})
						html += '</div>'

						this.$Modal.warning({
							title: '错误提示',
							content: html,
							width: 500,
							onOk: () => {
								this.getAppList()
							}
						})
					}

				} else {
					this.$Message.error({
						content: res.msg,
						duration: 5
					})
				}

				this.resetExport() // 重置导入
			}, err => {
				this.resetExport() // 重置导入
			})
		},
		/**
		 * [cancleExport 取消导入]
		 * @return {[type]} [description]
		 */
		cancleExport() {
			this.resetExport() // 重置导入
		},
		/**
		 * [resetExport 重置导入]
		 * @return {[type]} [description]
		 */
		resetExport() {
			this.uploadList = []
			this.filename = ''
			this.exportClock = false
			this.exportModalFlag = false
			this.importDrawObj = {}
		}

		/********************************************
        *↓↓↓↓↓↓↓↓↓↓ 以上部分为文件上传 end *↓↓↓↓↓↓↓
        ********************************************/
	},
	/**
	 * [beforeRouteLeave 路由跳转]
	 * @param  {[type]}   to   [如果路由跳转不是到媒体详情页，则销毁 $Bus]
	 * @param  {[type]}   from [description]
	 * @param  {Function} next [description]
	 * @return {[type]}        [description]
	 */
	beforeRouteLeave(to, from, next) {
		if (to.name !== 'app-edit') {
			this.$Bus.$off('editEmitEvent')
		}
		next()
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import '../data/select.styl';
.select-tree
	display: inline-block
	vertical-align: middle
.console-table
	/deep/ .wait-id
		color: #F72D17
</style>
