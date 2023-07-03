<template>
	<div class="page-main">
		<Card :bordered="false" dis-hover>
			<div class="page-title">
				<h2>{{headTitle}}</h2>
				<div class="is-handler">
					<Button icon="ios-add" type="primary" @click="addNewModule()" v-if="_isShow_('newAddModule')">新建模块</Button>
				</div>
			</div>
			<div class="console-table">
				<u-table
					border
					:height="tableHeight"
					:data="moduleDataList"
					:treeConfig="{
						children: 'children',
						iconClose: 'el-icon-folder-add',
						iconOpen: 'el-icon-folder-remove',
						expandAll: false
					}"
					use-virtual
					row-id="id"
					:data-changes-scroll-top="false"
					stripe
				>
					<!-- <u-table-column type="index" width="60"></u-table-column> -->

					<!--模块名称-->
					<u-table-column :tree-node="true" prop="name" label="模块名称" :width="220"/>

					<!--排序权重-->
					<u-table-column prop="weight" label="排序权重" :width="80"/>

					<!--id-->
					<u-table-column prop="id" label="id" :width="80"/>

					<!--上级id-->
					<u-table-column prop="parent_id" label="上级id" :width="80"/>

					<!--route-->
					<u-table-column prop="route" label="route" :width="180"/>

					<!--API-->
					<u-table-column prop="api" label="API" :min-width="350" v-slot="scope">
						<span v-if="!scope.row.api || scope.row.api.length == 0"></span>
						<Poptip v-else placement="right" trigger="click" popper-class="slot-contact-pop slot-api-pop" padding="8px" :width="340" :transfer="true">
							<span style="cursor: pointer">{{ scope.row.api[0] }}</span>
							<div class="slot-contact-card" slot="content">
								<dl>
									<dt>API</dt>
									<dd v-for="item in scope.row.api" :key="item">
										{{item}}
									</dd>
								</dl>
							</div>
						</Poptip>
					</u-table-column>

					<!--模块状态-->
					<u-table-column prop="status" label="模块状态" :width="80" v-slot="scope">
						{{ scope.row.status === 1 ? '启用' : '停用' }}
					</u-table-column>

					<!--模块类型-->
					<u-table-column prop="type" label="模块类型" :width="80" v-slot="scope">
						{{ scope.row.type === 1 ? '菜单' : '普通权限' }}
					</u-table-column>

					<!--菜单显示-->
					<u-table-column prop="visible" label="菜单显示" :width="100" v-slot="scope">
						{{ scope.row.visible === 1 ? '显示' : '隐藏' }}
					</u-table-column>

					<!--创建时间-->
					<u-table-column prop="created_at" label="创建时间" :width="150" v-slot="scope">
						{{ scope.row.created_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}
					</u-table-column>

					<!--更新时间-->
					<u-table-column prop="updated_at" label="更新时间" :width="150" v-slot="scope">
						{{ scope.row.updated_at | timeFormat('yyyy-MM-dd HH:mm:ss') }}
					</u-table-column>

					<!--操作人-->
					<u-table-column prop="operator_name" label="操作人" :width="100" v-slot="scope">
						{{ scope.row.operator_name}}
					</u-table-column>

					<!--操作-->
					<u-table-column prop="action" label="操作" :min-width="200" v-slot="scope" fixed="right">
						<!-- 小于3级 -->
						<Button v-if="scope.row.level < 3 && scope.row.type === 1 && _isShow_('newAddChildModule')" type="text" @click="addNewChildModule(scope.row)">新建子模块</Button>
						<Button v-if="_isShow_('modify')" type="text" @click="editModule(scope.row)">修改</Button>
						<Button v-if="_isShow_('delete')" type="text" @click="deleteModule(scope.row)">删除</Button>
					</u-table-column>
				</u-table>
			</div>
		</Card>
		<Drawer v-model="setModalFlag" :title="drawerTitle" width="600px" :mask-closable="false" :closable="false" :styles="drawStyles">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="100">
				<FormItem label="模块名称" prop="name">
					<Input v-model.trim="modalForm.name" show-word-limit maxlength="30" placeholder="请输入模块名称" />
				</FormItem>

				<FormItem label="模块状态" prop="status">
					<RadioGroup v-model="modalForm.status">
						<Radio :label="1">启用</Radio>
						<Radio :label="2">停用</Radio>
					</RadioGroup>
				</FormItem>

				<FormItem label="模块类型" prop="type">
					<RadioGroup v-model="modalForm.type" @on-change="typeChange">
						<Radio :label="1">菜单</Radio>
						<Radio :label="2">普通权限</Radio>
					</RadioGroup>
				</FormItem>

				<FormItem label="是否显示" prop="visible" v-if="modalForm.type === 1">
					<RadioGroup v-model="modalForm.visible">
						<Radio :label="1">显示</Radio>
						<Radio :label="2">隐藏</Radio>
					</RadioGroup>
				</FormItem>

				<FormItem label="排序权重" prop="weight">
					<InputNumber :max="1000" :step="1" :min="0" v-model="modalForm.weight" placeholder="请输入0~1000的整数" style="width: 100%"></InputNumber>
				</FormItem>

				<!-- 上级code start -->
				<FormItem label="上级ID">
					<Select v-model="modalForm.parent_id" placeholder="请选择上级ID(如果不选默认为一级模块)" :clearable="true" @on-change="parentIdChange">
						<Option v-for="item in parentIdArr" :label="`${item.id}(${item.name})`" :value="item.id" :key="item.id">
							<div class="option-box clearfix" :title="item.name">
								<span class="option-left">{{ item.name }}</span>
								<span class="option-right">ID: {{item.id}}</span>
							</div>
						</Option>
					</Select>
				</FormItem>

				<FormItem label="route" prop="route">
					<Select v-model="modalForm.route" :clearable="true">
						<Option v-for="item in routeList" :label="`${item.name}(${item.route})`" :value="item.route" :key="item.route">
							<div class="option-box clearfix" :class="!item.isFirstLevel ? 'indent' : ''">
								<span class="option-left">{{ item.name }}</span>
								<span class="option-right">route: {{item.route}}</span>
							</div>
						</Option>
					</Select>

				</FormItem>

				<FormItem label="API" prop="api">
					<div v-for="(item, index) in modalForm.api" :key="index" class="api-list">
						<Row>
							<Col span="20">
								<Input type="text" show-word-limit maxlength="500" :clearable="true" v-model.trim="item.value"></Input>
							</Col>
							<Col span="3" offset="1" style="text-align: right">
								<Button style="width: 45px" v-if="index == modalForm.api.length - 1" @click="handleApiAdd(item,index)">+</Button>
								<Button style="width: 45px" v-else @click="handleApiRemove(item,index)">-</Button>
							</Col>
						</Row>
					</div>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="toggleFormDraw()">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitAddModule('modalForm')">
					<span v-if="!submitClock">确定</span>
					<span v-else>提交中...</span>
				</Button>
			</div>
			<Spin size="large" fix v-if="spinShow"></Spin>
		</Drawer>
	</div>
</template>

<script>
import { showTitle } from '@/libs/util'
import { formatDate } from '@/libs/tools'
import { addSysModule, getSysModule, updateSysModule, delelteSysModule } from '@/api/permission'
import { asyncRouterMap } from '@/router/routers'
import { inPageAccess } from '@/mixin/in-page-access.js'
import { tableHeight } from '@/mixin/calc-table-height.js'

export default {
	name: 'moduleManage',
	mixins: [inPageAccess, tableHeight],
	data() {
		return {
			noDataText: this.$config.noDataText,
			catchParentIdArr: [], // 上级id, 缓存使用
			catchRouteList: [], // 缓存导航code列表，以作备份使用
			moduleDataList: [], // table数据
			tableLoadFlag: false, // table的loading

			modalForm: { // 表单 抽屉
				name: '', // 模块名称
				status: null, // 状态, 1=正常, 2=停用
				type: null, // 类型, 1=菜单, 2=普通权限
				visible: null, // 是否可见, 1=可见, 2=不可见
				weight: 1, // 权重
				id: '', // id
				parent_id: '', // 上级id
				route: '',
				api: [{
					value: ''
				}]
			},
			modalFormRules: { // 表單正則
				name: [{required: true, message: '请输入模块名称'}],
				status: [{required: true, message: '请选择模块状态'}],
				type: [{required: true, message: '请选择模块类型'}],
				visible: [{required: true, message: '请选择模块是否显示'}],
				weight: [{required: true, message: '请输入排序权重'}],
				route: [{required: true, message: '请选择当前route'}],
				api: [{required: false, message: '请填写正确的api'}]
			},
			submitClock: false, // 保存锁
			spinShow: false,
			setModalFlag: false, // 抽屉开关

			drawerTitle: '', // 抽屉标题

			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			}
		}
	},
	computed: {
		headTitle() {
			return showTitle(this.$route, this)
		},
		/**
		 * [routeList 新建 route列表]
		 * @return {[type]} [description]
		 */
		routeList() {
			if (this.modalForm.type === 1) { // 如果选择菜单， 则routeList 为 路由列表
				return this.catchRouteList
			} else if (this.modalForm.type === 2) { // 如果选择普通权限
				if (!!this.modalForm.parent_id) {
					const result = this.catchParentIdArr.filter(item => {
						return item.id === this.modalForm.parent_id
					})

					return result.length ? this.codeGetInpageAccess(result[0].route) : [] // 根据parent_id 反推 获取 [view, update...]

				} else {
					return []
				}
			}
		},
		/**
		 * [parentIdArr 父级id]
		 * @return {[type]} [description]
		 */
		parentIdArr() {
			return this.catchParentIdArr
		}
	},
	filters: {
		timeFormat(time, format) {
			return formatDate(time * 1000, format)
		}
	},
	created() {
		this.getSysModule()
		this.formatRouteList() // 获取导航list的code
	},
	mounted() {
		this.initTableHeight({'search-line': {isInclude: false}}) // search-line的高度
	},
	methods: {
		/*
		新建模块逻辑记录
		1. 模块类型分为菜单1,普通权限2。
			1.1 选择菜单(必然为导航)，匹配上级code(非必填)
				1.1.1 选择上级code: 二级导航
				1.1.2 不选择上级code: 一级导航
			1.2 普通权限(页面内权限)，必须选择上级code
				1.2.1 选择上级code-> 选择code[查看，封禁...]
		*/
	   
		/**
		 * [getSysModule 获取列表的信息]
		 * @return {[type]} [description]
		 */
		getSysModule() {
			this.tableLoadFlag = true
			getSysModule().then(res => {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.catchParentIdArr = this.getAllModuleId(res.data.list)
					this.moduleDataList = this.setModuleDataFormat(res.data.list, 1)
				}
			}, err => {
				if (err.code === 403) {
					this.noDataText = this.$config.noDataTextPer
				}
				this.tableLoadFlag = false
			})
		},
		/**
		 * [setModuleDataFormat 格式化模块数据，并且做递归遍历，]
		 * [如果当前有children加上_showChildren， 可以展开]
		 * @param {[type]} arr [description]
		 */
		setModuleDataFormat(arr, level) {
			if (arr.length === 0) {
				return []
			}

			let showWhiteList = ['material-manage-index', 'home-index'] // 一级菜单白名单

			let tempArr = []

			arr.map(item=> {
				// item._showChildren = false
				item.level = level
				if(!!item.sub_model && item.sub_model.length) {
					let _index = level
					// item._showChildren = true
					// item._showChildren = (showWhiteList.includes(item.route) || level > 1) ? false : true // 一二级菜单折叠
					item.children = this.setModuleDataFormat(item.sub_model, ++_index)
				}

				tempArr.push(item)
			})

			return tempArr
		},

		/**
		 * [getAllModuleId 获取所有模块的id， 在创建时做parend_id使用]
		 * @return {[type]} [description]
		 */
		getAllModuleId(arr) {

			if (arr.length === 0) {
				return
			}

			let tempIdArr = []

			arr.map(item => {
				tempIdArr.push({
					route: item.route,
					id: item.id,
					name: item.name
				})
				
				if(!!item.sub_model && item.sub_model.length) {
					tempIdArr = tempIdArr.concat(this.getAllModuleId(item.sub_model))
				}
			})

			return tempIdArr
		},

		/**
		 * [formatRouteList 获取路由列表]
		 * @return {[type]} [description]
		 */
		formatRouteList() {
			let tempArr = []

			asyncRouterMap.map(item => {

				// 当前路由下只有一个
				if (item.children && item.children.length === 1 && !!item.children[0].meta.isShowAccess) {
					tempArr.push({
						isFirstLevel: true, // 是否为第一层级，在创建是区分route
						meta: item.children[0].meta,
						route: item.children[0].name,
						name: item.children[0].meta.title
					})
				}

				// 2. 例如流量管理，需要写入一级下拉
				if (item.children && item.children.length > 1) {

					tempArr.push({
						isFirstLevel: true, // 是否为第一层级，在创建是区分route
						meta: item.meta,
						route: item.name,
						name: item.meta.title
					})

					item.children.map(child => {
						if (child.meta && !!child.meta.isShowAccess) {
							tempArr.push({
								isFirstLevel: false, // 是否为第一层级，在创建是区分route
								meta: child.meta,
								route: child.name,
								name: child.meta.title
							})
						}
					})
				}
			})

			this.catchRouteList = tempArr
		},

		/**
		 * [typeChange 模块类型 发生改变 清空 route的值]
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		typeChange(value) {
			this.modalForm.route = ''
		},

		/**
		 * [parentIdChange 上级id发生变化时，清空route]
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		parentIdChange(value) {
			this.modalForm.route = ''
		},

		/**
		 * [codeGetInpageAccess 根据name反推获取页面权限]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		codeGetInpageAccess(name) {

			const result = this.catchRouteList.filter(item=> {
				return item.route === name
			})

			let _arr = []

			if (result.length && !!result[0].meta && !!result[0].meta.inPageAccess) {

				let _inObj = result[0].meta.inPageAccess

				for (let i in _inObj) {
					_arr.push({
						name: _inObj[i],
						route: i
					})
				}
			}

			return _arr
		},
		/**
		 * [submitAddModule 新建/编辑第三方平台账号信息]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		submitAddModule(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {

					let _modalForm = this.modalForm
					let proArr = [] // 请求

					let params = {
						name: _modalForm.name,
						status: _modalForm.status,
						type: _modalForm.type,
						visible: _modalForm.type === 2 ? 2 : _modalForm.visible,
						weight: _modalForm.weight,
						route: _modalForm.route
					}

					// 父级id
					params.parent_id = !!_modalForm.parent_id ? _modalForm.parent_id : 0

					// 如果存在api
					if(_modalForm.api && _modalForm.api.length) {
						let _api = []
						_modalForm.api.map(item=> {
							if(!!item.value) {
							   _api.push(item.value) 
							}
						})

						if (_api.length) {
							params.api = _api
						}
					}

					// 如果有id，则为修改， 否则为新增
					if(!!_modalForm.id) {
						params.id = _modalForm.id
						proArr.push(updateSysModule(params))
					} else {
						proArr.push(addSysModule(params))
					}
					
					this.submitClock = true

					Promise.all(proArr).then(res => {
						
						this.submitClock = false

						if (res[0].code === 200) {
							this.setModalFlag = false
							this.$Message.success({ content: !!params.id ? '修改成功' :'创建成功' , duration: 3})
							this.getSysModule()
						} else {
							this.$Message.error({ content: !!params.id ? '保存失败，请重试' : '新建失败，请重试', duration: 3})
						}
					}, err=> {
						this.submitClock = false
					})
				}
			})
		},

		/**
		 * [addNewModule 新建模块]
		 */
		addNewModule() {
			this.resetModelForm() // 重置

			this.drawerTitle = '新建模块'
			this.setModalFlag = true
		},

		/**
		 * [addNewChildModule 新添加子模块]
		 * @param {[type]} row [description]
		 */
		addNewChildModule(row) {

			const resultArr = this.catchRouteList.filter(item=> {
				return item.route === row.route
			})

			this.resetModelForm() // 重置
			this.modalForm.parent_id = row.id

			this.drawerTitle = '新建子模块'
			this.setModalFlag = true
		},

		/**
		 * [editModule 修改模块]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		editModule(row) {

			let _apiArr = []

			if(!row.api || row.api.length === 0) {
				_apiArr.push({
					value: ''
				})
			} else {
				row.api.map(item=> {
					_apiArr.push({
						value: item
					})
				})
			}

			this.modalForm = { // 表单 抽屉
				id: row.id,
				name: row.name, // 模块名称
				status: row.status, // 状态, 1=正常, 2=停用
				type: row.type, // 类型, 1=菜单, 2=普通权限
				visible: row.visible, // 是否可见, 1=可见, 2=不可见
				weight: row.weight, // 权重
				parent_id: row.parent_id,
				route: row.route, // route
				api: _apiArr // api数组
			}

			this.drawerTitle = row.level === 1 ? '修改模块' : '新建子模块'
			this.setModalFlag = true
		},

		/**
		 * [deleteModule 删除模块]
		 * @param  {[type]} row [description]
		 * @return {[type]}     [description]
		 */
		deleteModule(row) {
			this.$Modal.confirm({
				title: '如果删除当前模块，其下所有子模块默认删除，并立即生效，确认删除么？',
				content: '',
				onOk: () => {
					delelteSysModule({
						id: row.id
					}).then(res => {
						if (res.code === 200) {
							this.$Message.success({ content: '删除成功', duration: 3})
						}

						this.getSysModule()
					})
				},
				onCancel: res => {
					console.log(res)
				}
			})
		},

		/**
		 * [cancelSubmit form表单 重置]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		toggleFormDraw(name) {
			this.setModalFlag = !this.setModalFlag
			this.resetModelForm() // 重置
		},
		/**
		 * [resetModel 重置抽屉数据]
		 * @return {[type]} [description]
		 */
		resetModelForm() {
			this.setModalFlag = false
			this.drawerTitle = ''

			this.modalForm = { // 表单 抽屉
				name: '', // 模块名称
				status: 1, // 状态, 1=正常, 2=停用
				type: 1, // 类型, 1=菜单, 2=普通权限
				visible: 1, // 是否可见, 1=可见, 2=不可见
				weight: 1, // 权重
				code: '', // code
				parent_id: '', // 上级code
				api: [ // api数组
					{
						value: ''
					}
				]
			}
		},
		/**
		 * [handleApiRemove API 添加]
		 * @param  {[type]} item [description]
		 * @param  {[type]} index [索引]
		 * @return {[type]}      [description]
		 */
		handleApiRemove(item, index) {
			this.modalForm.api.splice(index, 1)
		},
		/**
		 * [handleApiAdd API 删除]
		 * @param  {[type]} item [description]
		 * @param  {[type]} index [索引]
		 * @return {[type]}      [description]
		 */
		handleApiAdd(item, index) {
			this.modalForm.api.push({
				value: ''
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.option-box
	&.indent
		padding-left: 14px
		.option-left
			color: #777
	.option-left
		text-overflow: ellipsis
		white-space: nowrap
		height: 20px
		line-height: 20px
		overflow: hidden
		float: left
		width: 160px
	.option-right
		float: right
		color: #ccc
		height: 20px
		line-height: 20px
.slot-contact-card
	dl
		word-break: word-break
		white-space: normal
		dt
			font-size: 12px
			font-weight: bold
			line-height: 20px
			margin-bottom: 6px
		dd
			margin-top: 4px
			display: flex
			font-size: 12px
			.dd-title
				width: 182px
				flex: 0 0 182px
				line-height: 16px
				font-size: 12px
			.dd-id
				width: 100px
				flex: 0 0 100px
				line-height: 16px
				font-size: 12px
				color: #999
				text-align: right
			.iconfont
				flex: 0 0 20px
				text-align: right
				line-height: 16px
				font-size: 12px
				color: #4083F8
				transform: scale(0.6)
.api-list
	margin-bottom: 20px
</style>
