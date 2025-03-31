<template>
	<div>
		<Card dis-hover :bordered="false">
			<div class="page-main">
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<div class="page-title clearfix" style="flex: 1;">
						<h2>广告位规则</h2>
					</div>
					<div class="is-handler" style="flex: 0 0 auto;">
						<Button icon="ios-add" type="primary" @click="doCreate()">新建公司规则</Button>
					</div>
				</div>

				<div class="search-line">
					<!-- 广告位名称 -->
					<Select
						class="i-margin-right-11 i-width-select i-select-remote"
						v-model="filterSearch.ssp_slot_id_arr_select"
						filterable
						clearable
						multiple
						:remote-method="searchSspSlot"
						:loading="sspSlotLoad"
						@on-change="clearSearchSspSlot"
						:on-query-change="sspSlotQueryChange"
						:transfer="true"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						placeholder="广告位名称/ID"
					>
						<Option v-for="item in sspSlotList" :value="item.ssp_slot_code" :key="item.ssp_slot_code">{{item.ssp_slot_name}}
							(ID:{{item.ssp_slot_code}})
						</Option>
					</Select>
					<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.ssp_slot_id" placeholder="输入广告ID"/>
					<Button type="primary" @click="doFilterList">查询</Button>
				</div>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="ruleColumns" :data="rule_ssp_list" :loading="tableLoadFlag">

					<template slot-scope="{ row }" slot="ssp_slot_name">
						<p class="name-row-ellipsis" :title="row.ssp_slot_name">{{row.ssp_slot_name}}</p>
						<p class="tip-row-line"> ID:{{ row.ssp_slot_id }}</p>
					</template>

					<template slot-scope="{ row }" slot="rule_names">
						<p class="name-row-ellipsis" :title="row.rule_names">{{row.rule_names}}</p>
					</template>


					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text"  @click="doCreate(row)">修改</Button>
						<Button type="text"  @click="deleteCreate(row)">删除</Button>
					</template>
					<!--操作-->
					<!--					<template slot-scope="{ row, index }" slot="action">-->
					<!--						<Button type="text"  @click="doCreate(row)">修改</Button>-->
					<!--					</template>-->
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>

			<div class="edit-content-card clearfix">
				<div class="ad-left-content">
				</div>
			</div>
		</Card>
		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.ssp_slot_id ? '新建广告位规则' : '修改广告位规则'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">
				<!-- 广告位名称 -->
				<FormItem label="输入广告位名称:" prop="name">

					<Select
						:disabled = "disabled"
						class="i-margin-right-11 i-select-remote"
						v-model="filterSearch.ssp_slot_id_arr_select"
						filterable
						clearable
						multiple
						:remote-method="searchSspSlot"
						:loading="sspSlotLoad"

						@on-change="clearSearchSspSlot"
						:on-query-change="sspSlotQueryChange"
						:transfer="true"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						:placeholder="ssp_title"

					>
						<Option v-for="item in sspSlotList" :value="item.ssp_slot_code" :key="item.ssp_slot_code">{{item.ssp_slot_name}}
							(ID:{{item.ssp_slot_code}})
						</Option>
					</Select>
				</FormItem>

				<FormItem label="规则菜单" prop="menuList" class="menuList">
					<div class="menuContent">
						<Input :maxlength="30" show-word-limit v-model.trim="modalForm.search_text" clearable placeholder="输入规则名称"
							   @on-change="SearchSspInput"/>
						<el-tree
							:props="props"
							:load="loadNode"
							:key="treeKey"
							:data = "rule_tree_list"
							lazy
							show-checkbox
							ref = "tree"
							node-key="id"
							:default-expand-all = false
							:default-checked-keys='checkedKeys'
							@check-change="handleCheckChange">
						</el-tree>
					</div>
				</FormItem>
			</Form>
			<div class="drawer-footer">
				<Button @click="cancleBtn">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitForm('modalForm')">
					<span v-if="!submitClock">提交</span>
					<span v-else>{{submitTxt}}</span>
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import {getRuleList,getSspRuleList,saveSspRule} from '@/api/rule.js'
// import {columnFn} from '@/mixin/custom-column.js'
import { getSspSlotAdList,getSspSlotAdList_v2} from '@/api/ssp'
import {debounce} from "../../libs/tools";
import {getRuleSspColum} from "../dsp/data/data";

import {inPageAccess} from '@/mixin/in-page-access.js'
import {number} from "echarts/lib/export";
// import customColumn from '@/components/local-custom-column/custom-column' // 自定义列
export default {
	name: 'ssp-rule-manage',
	// mixins: [  inPageAccess],
	// components: {
	// 	customColumn
	// },
	data(){
		return {
			// _isShow_ : true,  // 添加按钮
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			tableLoadFlag: false, //遮幕层
			setModalFlag: false, // 侧边弹框
			submitClock: false,
			ssp_title :"广告位名称/ID",

			rule_ssp_list:[],

			ruleColumns: getRuleSspColum(this), // 列
			modalForm: {

				search_text: '',// 搜索
				rule_ids:[], // 存放规则ID
				ssp_id_list:[],
				ssp_slot_id:'',
				type: '',  // 1 新增 2 修改
			},

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中

			disabled: false,

			catchSspRuleList: [],
			sspRuleLoad: false, //规则名称
			sspRuleList: [],


			filterSearch: {
				ad_type_id_arr: [], // 广告类型ID数组
				creative_type_arr: [], // 广告创意ID
				search_text: '', // 搜索框
				ssp_slot_id_arr_selects:[],
				ssp_slot_id_arr_select: [], // 广告位名称/ID(单个)
				ssp_rule_id_arr_select:[], //规则ID
				ssp_slot_id: ''
			},
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
			modalFormRules: { // form表单正则
				// name: [
				// 	{required: true,  message: '请输入规则名称', trigger: 'blur'},
				// 	{pattern: regNumCnEnLine, message: '规则名称只支持汉字、数字、英文、下划线'}
				// ],
				// dsp_code: [{required: true, message: '请输入公司对外简称', trigger: 'blur'}],
				// dsp_request_url: [
				// 	{ required: true, message: '请输入广告请求地址',trigger: 'blur'},
				// 	{ pattern: regWebUrl, message: '请输入合法的url地址', trigger: 'blur'}
				// ],
				// dsp_request_method: [{required: true, message: '请选择广告请求方式'}]
			},
			checkedKeys: [],
			treeKey:0,
			props: {
				label: 'rule_name', // 显示字段
				children: 'children', // 子节点字段名
				isLeaf: 'leaf', // 是否为叶子节点字段

			},
			tree_list_keys:[],
			rule_id_list:[],
			rule_tree_list:[],
		}
	},

	created() {
		this.getSspRuleList()
		this.getOnfours()
	},
	//
	// watch: {
	// 	rule_id_list: {
	// 		deep: true,
	// 		handler(newValue, oldValue) {
	// 			console.log("newValue",newValue)
	// 			// this.treeKey += 1
	// 			console.log("newValue: ",this.rule_id_list)
	// 		}
	// 	}
	// },

	methods: {
		// handleFocus() {
		// 	console.log("==点击了============================================================")
		// },

		deleteCreate(row) {
			this.modalForm.rule_ids = []
			this.modalForm.ssp_slot_id = row.ssp_slot_id

			this.$confirm(`删除数据广告位ID: ${this.modalForm.ssp_slot_id}`, {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$Message.success({content: "删除成功", duration: 3})
				this.deleteData()
			}).catch(() => {
				this.$Message.success({content: "取消删除", duration: 3})
			});
		},

		deleteData() {
			saveSspRule(this.modalForm).then(res => {
				if (res.code === 200) {
					this.setModalFlag = false
					// this.$Message.success({content: this.modalForm.ssp_slot_id ? "修改成功" : "新建成功", duration: 3})
					this.getSspRuleList()
				}
			})
			this.modalForm.ssp_slot_id = ''
		},

		cancleBtn(){
			this.setModalFlag = false
			this.filterSearch = []
		},

		getSspRuleList() {
			this.tableLoadFlag = true

			let solt_id = 0
			console.log("this.filterSearch.ssp_slot_id_arr_select[0]",this.filterSearch.ssp_slot_id_arr_select[0])
			if(this.filterSearch.ssp_slot_id_arr_select[0]) {
				solt_id = this.filterSearch.ssp_slot_id_arr_select[0]
			} else if(this.filterSearch.ssp_slot_id) {
				solt_id = this.filterSearch.ssp_slot_id
			}
			getSspRuleList({

				ssp_slot_id: solt_id,
				page_num: this.currentPage,
				page_size: this.pageSize,

			}).then(res=> {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total_count
					this.rule_ssp_list = res.data.list
				}
			}, error => {
				if(err.code === 403) {
					this.tableLoadFlag = false
				}
			})
		},

		getRuleList() {
			getRuleList({
				page_num: 1,
				page_size: 0,
			}).then(res=> {
				if (res.code === 200) {
					this.rule_tree_list = res.data.list.map(item => ({
						...item, // 展开原有的item对象
						rule_name: `${item.rule_name} (ID: ${item.id})`,
						leaf: true, // 添加新的字段leaf，并设置默认值为true
					}));
					this.rule_tree_list.push()
					// console.log("规则列表rule_tree_list", this.rule_tree_list)
					this.treeKey=new Date().getTime()
				}
			}, error => {
				if(err.code === 403) {

				}
			})
		},

		SearchSspRuleList(query){
			getRuleList({
				rule_name: query || ' ',
				page_num: 1,
				page_size: 0,
			}).then(res=> {
				if (res.code === 200) {
					this.sspRuleLoad = false
					this.total_count = res.data.total_count
					this.catchSspRuleList = res.data.list

					console.log("catchSspRuleList", this.catchSspRuleList)
				}
			}, error => {
				if(err.code === 403) {

				}
			})
		},

		/**
		 * [toLink 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		doCreate(row) {

			this.ssp_title = "预算位名称/ID"
			this.submitTxt = '提交中...'// 提交按钮的文字
			this.setModalFlag = true
			console.log("rowrow",row)

			if(row && row.ssp_slot_id) {
				this.disabled = true
				console.log("rule_ids",row)
				this.ssp_title = row.ssp_slot_name
				if (this.ssp_title == "") {
					this.ssp_title = "预算位名称/ID"
				}
				this.modalForm.ssp_slot_id = row.ssp_slot_id
				this.modalForm.type = 2
				let strs = row.rule_ids
				const arr = strs.split(',').map(Number);
				this.checkedKeys =[...arr]
				this.tree_list_keys = this.$refs.tree.getCheckedKeys([])
				console.log("this.modalForm.ssp_slot_id",this.modalForm.ssp_slot_id)
			} else {
				this.disabled = false
				this.filterSearch.ssp_slot_id_arr_select = []
				this.modalForm = {
					search_text : '',
					rule_ids: [],
					ssp_slot_id:'',
					type: 1,
				}
				this.ssp_title = "预算位名称/ID"
				this.checkedKeys=[]
			}
			// 获取规则列表

			// 数据加载完成后，强制刷新树组件
			this.treeKey += 1;
			this.getRuleList()
			// this.$refs.tree.setCheckedKeys(['每天30点放量 (ID: 3)'])
		},

		submitForm() {
			console.log("ssp_slot_id_arr_select",this.filterSearch.ssp_slot_id_arr_select)
			console.log("this.modalForm.type === 2",this.modalForm.type)
			if (this.modalForm.type === 2) {
				let checkoutList = this.$refs.tree.getCheckedKeys([])
				this.modalForm.rule_ids = [...checkoutList]
			}
			else if (this.filterSearch.ssp_slot_id_arr_select.length === 0) {
				this.$Message.error({content: '广告位名称不能为空' , duration: 3})
				return
			} else if(this.$refs.tree.getCheckedKeys([]).length === 0) {
				this.$Message.error({content: '请选择规则',duration: 3})
				return
			}

			this.submitClock = true
			this.submitTxt = '提交中...' // 提交按钮的文字

			console.log("this.modalForm",this.modalForm)
			if (this.modalForm.type === 1) {
				this.modalForm.ssp_slot_id = +this.filterSearch.ssp_slot_id_arr_select[0]
				this.filterSearch.ssp_slot_id_arr_select = []
				this.modalForm.rule_ids = [... this.$refs.tree.getCheckedKeys([])]
				this.checkedKeys = []
			}
			// else {
			// 	// let uniquelist = [...new Set([...this.checkedKeys, ...this.rule_id_list])]
			// 	// this.checkedKeys = null
			// 	// this.modalForm.rule_ids = [... uniquelist]
			// 	let checkoutList = this.$refs.tree.getCheckedKeys([])
			// 	this.modalForm.rule_ids = [...checkoutList]
			// 	// this.modalForm.rule_ids = this.
			// }
			console.log("this.modalForm", this.modalForm)
			console.log("节点", this.$refs.tree.getCheckedKeys([]))
			saveSspRule(this.modalForm).then(res => {
				this.submitClock = false

				if (res.code === 200) {
					this.setModalFlag = false
					// this.$Message.success({content: this.modalForm.ssp_slot_id ? "修改成功" : "新建成功", duration: 3})
					this.getSspRuleList()
				}
			})
			// console.log(this.$refs.tree.setCheckedKeys([]))

		},

		/// 当选中菜单后，在去搜索要跟新选中菜单的数组

		// 懒加载节点的方法
		loadNode(node, resolve) {
			if (node.level === 0) {
				// 根节点数据模拟，并设置默认名称为"全部"
				// 	setTimeout(() => {
				// 		resolve([{ rule_id: 0, rule_name: '全部', leaf: false }]);
				// 	}, 500);
				// } else {
				// 加载子节点的数据模拟
				setTimeout(() => {
					// 示例：根据父节点ID获取对应子节点数据
					console.log("loadNode:", this.rule_tree_list)
					const nodeData = this.rule_tree_list
					resolve(nodeData);
				}, 50);
			}
		},


		// 处理复选框状态改变事件
		handleCheckChange(data, checked, indeterminate) {

			let cutAtColon = data.rule_name.split(':')[1];
			let curr_id_tirm = cutAtColon.replace(/\)$/, '').trim()
			let curr_id_num = +curr_id_tirm
			if (!this.rule_id_list.includes(curr_id_num)) {
				this.rule_id_list.push(curr_id_num)
			} else if (!checked) {
				this.rule_id_list = this.rule_id_list.filter(item => item !== curr_id_num);
			}

		},

		// 更新树形菜单数据并重新加载
		updateTreeData() {
			// 获取树形菜单的根节点
			const rootNode = this.$refs.tree.getNode(0); // 假设根节点的 rule_id 为 0

			// 重新加载根节点的子节点
			if (rootNode) {
				rootNode.loaded = false; // 标记为未加载
				rootNode.expand(); // 展开节点，触发重新加载
			}
		},

		SearchSspInput() {
			getRuleList({
				rule_name: this.modalForm.search_text,
				page_num: 1,
				page_size: 0,
			}).then(res => {
				if (res.code === 200) {
					this.rule_tree_list = res.data.list.map(item => ({
						...item, // 展开原有的item对象
						rule_name: `${item.rule_name} (ID: ${item.id})`,
						leaf: true, // 添加新的字段leaf，并设置默认值为true
					}));
					console.log("规则列表rule_tree_list", this.rule_tree_list)
					this.rule_id_list = []
					this.updateTreeData()
				}
			}, error => {
				if (err.code === 403) {

				}
			})
		},

		// 查询广告规则
		doFilterList() {
			this.currentPage = 1
			this.getSspRuleList()
		},
		// 弹框提交
		// submitCompany() {
		// 	this.$refs[name].validate((valid) => {
		// 		// this.subitForm()
		// 	})
		// },
		/**
		 * [changePage 切换页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getSspRuleList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getSspRuleList()
		},


		/**
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},

		/**
		 * [sspSlotQueryChange 广告位-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}     [description]
		 */
		sspSlotQueryChange(query) {
			console.log("发生变化",this.catchSspSlotList)
			if (!query) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
		},


		// sspRuleQueryChange(query) {
		// 	if (!query) {
		// 		this.sspRuleList = [...this.catchSspRuleList]
		// 	}
		// },

		/**
		 *  清空规则
		 * @param arr
		 */
		clearSearchSspRule(arr) {
			if (arr.length === 0) {
				this.sspRuleList = [...this.catchSspRuleList]
			}
		},
		/**
		 *  规则搜索
		 * @param query
		 */
		searchSspRule(query) {
			this.sspRuleLoad = true
			this.SearchSspRuleList(query)
		},


		/**
		 * [searchSspSlot 广告位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}     [description]
		 */
		searchSspSlot(query) {
			this.sspSlotLoad = true
			this.getSspSlotList(query)

		},
		/**
		 * [clearSearchSspSlot 清空广告位]
		 * @return {[type]} [description]
		 */
		clearSearchSspSlot(arr) {
			console.log("arr",arr)
			if (arr.length === 0) {
				this.sspSlotList = [...this.catchSspSlotList]
			}
			console.log("this.sspSlotList:",this.sspSlotList)
			if (this.sspSlotList.length === 0) {
				this.getOnfours()
			}
		},


		getCheckedKeysFromRow(row) {
			// 假设row中有相关信息来确定哪些节点应该被选中
			// 这里只是一个示例，实际应用中需要根据具体情况调整
			let selectedIds = [];
			if (row.rule_ids) { // 假设row中有rule_ids字段，它是一个数组
				selectedIds = row.rule_ids;
			}
			return selectedIds;
		},

		getOnfours() {
			console.log("sssssssssss")
			let params = {
				page_size: 10,
				page_num: 1
			}
			getSspSlotAdList_v2(params).then(res => {
				if (res.code === 200) {

					this.sspSlotList = res.data.list
					console.log("this.sspSlotList",this.sspSlotList)
				}
			})
		},


		/**
		 * [getSspSlotList 广告位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}     [description]
		 */
		getSspSlotList: debounce(function (query) {
			this.modalForm.rule_ids = []
			let _params = {
				// ud_id_arr: filter.ud_id_arr,
				// app_id_arr: filter.app_id_arr,

				page_size: 0,
				page_num: 1,
				search_text: query || ''
			}
			getSspSlotAdList_v2(_params).then(res => {

				this.sspSlotLoad = false
				if (res.code === 200) {
					console.log("res:",res.data.list)
					this.sspSlotList = res.data.list
					console.log("query",query,this.sspSlotList)
					if (!query) {
						this.catchSspSlotList = res.data.list
						console.log("query:",query,this.catchSspSlotList )
					}
				}
			})
		}, 1000)
		/********************************************
		 *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		 ********************************************/
	}
}

</script>
<style scoped lang="stylus">

</style>
