<template>
	<div>
		<Card dis-hover :bordered="false">
			<div class="page-main">
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<div class="page-title clearfix" style="flex: 1;">
						<h2>预算位规则</h2>
					</div>
					<div class="is-handler" style="flex: 0 0 auto;">
						<Button icon="ios-add" type="primary" @click="doCreate()">新建预算位规则</Button>
					</div>
				</div>

				<div class="search-line">
					<!-- 预算位名称 -->
					<!-- 预算位名称 -->
					<Select
						class="i-margin-right-11 i-width-select i-select-remote"
						v-model="filterSearch.dsp_slot_id_arr_selects"
						filterable
						clearable
						multiple
						:remote-method="searchDspSlot"
						:loading="dspSlotLoad"
						@on-change="clearSearchDspSlot"
						:on-query-change="dspSlotQueryChange"
						:transfer="true"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						placeholder="预算位名称/ID"
					>
						<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})
						</Option>
					</Select>

					<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.dsp_slot_id" placeholder="输入预算位ID"/>
					<Button type="primary" @click="doFilterList">查询</Button>
				</div>
			</div>
			<div class="console-table">
				<Table highlight-row stripe border :columns="getBudgetRuleColum" :data="rule_budget_list" :loading="tableLoadFlag">

					<template slot-scope="{ row }" slot="dsp_slot_name">
						<p class="name-row-ellipsis" :title="row.dsp_slot_name">{{row.dsp_slot_name}}</p>
						<p class="tip-row-line"> ID:{{ row.dsp_slot_id }}</p>
					</template>

					<template slot-scope="{ row }" slot="rule_names">
						<p class="name-row-ellipsis" :title="row.rule_names">{{row.rule_names}}</p>
					</template>
					<!--操作-->
					<template slot-scope="{ row, index }" slot="action">
						<Button type="text"  @click="doCreate(row)">修改</Button>
						<Button type="text"  @click="deleteCreate(row)">删除</Button>
					</template>
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
		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.dsp_slot_id ? '新建预算位规则' : '修改预算位规则'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">
				<!-- 预算位名称 -->
				<FormItem label="输入预算位名称:" prop="name">

					<Select
						:disabled = "disabled"
						class="i-margin-right-11  i-select-remote"
						v-model="filterSearch.dsp_slot_id_arr_select"
						filterable
						clearable
						multiple
						:remote-method="searchDspSlot"
						:loading="dspSlotLoad"
						@on-change="clearSearchDspSlot"
						:on-query-change="dspSlotQueryChange"
						:transfer="true"
						:max-tag-count="1"
						:max-tag-placeholder="limitText"
						:placeholder="title_name"
						v-if="dspSlotList && dspSlotList.length"

					>
						<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})
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
							ref = "tree"
							node-key="id"
							show-checkbox
							:default-checked-keys='checkedKeys'
							@check-change="handleCheckChange">
						</el-tree>
					</div>
				</FormItem>
			</Form>
			<div class="drawer-footer">
<!--				<Button @click="setModalFlag = false">取消</Button>-->
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
import {getRuleList,getDspRuleList,saveDspRule} from '@/api/rule.js'
// import {columnFn} from '@/mixin/custom-column.js'
import { getSspSlotAdList} from '@/api/ssp'
import { getDspProductList, getDspSlotList, } from '@/api/dsp'
import {debounce} from "../../libs/tools";
import {getBudgetColum, getRuleSspColum} from "../dsp/data/data";

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
			getBudgetRuleColum: getBudgetColum(this),
			// _isShow_ : true,  // 添加按钮
			pageSize: 10,
			total_count: 0,
			currentPage: 1,
			tableLoadFlag: false, //遮幕层
			setModalFlag: false, // 侧边弹框
			submitClock: false,

			disabled: false,

			rule_ssp_list:[],

			ruleColumns: getRuleSspColum(this), // 列
			modalForm: {
				id: '',    // id
				search_text: '',// 搜索
				rule_ids:[], // 存放规则ID
				dsp_id_list:[],
				dsp_slot_id:'',
				type: '',  // 1新增 2 修改

			},

			catchSspSlotList: [], // 缓存广告位名称
			sspSlotList: [], // 广告位名称
			sspSlotLoad: false, // 广告位加载中
			title_name: "预算位名称/ID",


			catchSspRuleList: [],
			sspRuleLoad: false, //规则名称
			sspRuleList: [],

			rule_budget_list:[],


			filterSearch: {
				ad_type_id_arr: [], // 广告类型ID数组
				creative_type_arr: [], // 广告创意ID
				search_text: '', // 搜索框
				dsp_slot_id_arr_selects:[],
				dsp_slot_id_arr_select: [], // 广告位名称/ID(单个)
				dsp_rule_id_arr_select:[], //规则ID
				dsp_slot_id: ''
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
			treeKey:0,
			props: {
				label: 'rule_name', // 显示字段
				children: 'children', // 子节点字段名
				isLeaf: 'leaf', // 是否为叶子节点字段

			},

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中
			checkedKeys:[],
			rule_id_list:[],
			rule_tree_list:[],
		}
	},

	created() {
		this.getDspRuleBudgetList()
		this.getOnFoust()
	},

	watch: {
		rule_id_list: {
			deep: true,
			handler(newValue, oldValue) {
				console.log("newValue",newValue)
				// this.treeKey += 1
				console.log("newValue: ",this.rule_id_list)
			}
		}
	},

	methods: {



		cancleBtn(){
			this.setModalFlag = false
			this.filterSearch = []
		},
		getDspRuleBudgetList() {
			this.tableLoadFlag = true
			let solt_id = 0
			if(this.filterSearch.dsp_slot_id_arr_selects[0]) {
				solt_id = this.filterSearch.dsp_slot_id_arr_selects[0]
			} else if(this.filterSearch.dsp_slot_id) {
				solt_id = this.filterSearch.dsp_slot_id
			}
			console.log("solt_iddd",solt_id)

			getDspRuleList({
				dsp_slot_id: solt_id,

				page_num: this.currentPage,
				page_size: this.pageSize
			}).then(res=> {
				this.tableLoadFlag = false
				if (res.code === 200) {
					this.total_count = res.data.total_count
					this.rule_budget_list = res.data.list
					console.log("rule_budget_list", this.rule_budget_list)
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
			}).then(res => {
				if (res.code === 200) {
					this.rule_tree_list = res.data.list.map(item => ({
						...item, // 展开原有的item对象
						rule_name: `${item.rule_name} (ID: ${item.id})`,
						leaf: true, // 添加新的字段leaf，并设置默认值为true
					}));
					this.rule_tree_list.push()
					// console.log("规则列表rule_tree_list", this.rule_tree_list)
					this.treeKey = new Date().getTime()
				}
			}, error => {
				if (err.code === 403) {

				}
			})
		},



		/// 当选中菜单后，在去搜索要跟新选中菜单的数组

		// 懒加载节点的方法
		loadNode(node, resolve) {
			if (node.level === 0) {
				// 根节点数据模拟，并设置默认名称为"全部"
			// 	setTimeout(() => {
			// 		resolve([{rule_id: 0, rule_name: '全部', leaf: false}]);
			// 	}, 500);
			// } else {
				// 加载子节点的数据模拟
				setTimeout(() => {
					// 示例：根据父节点ID获取对应子节点数据
					console.log("loadNode:", this.rule_tree_list)
					const nodeData = this.rule_tree_list
					resolve(nodeData);
				}, 500);
			}
		},


		// 处理复选框状态改变事件
		handleCheckChange(data, checked, indeterminate) {
			// if (data.rule_name === '全部') {
			// 	return
			// }

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
			this.getDspRuleBudgetList()
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
			this.getDspRuleBudgetList()
		},
		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size
			this.getDspRuleBudgetList()
		},

		deleteCreate(row) {
			this.modalForm.dsp_slot_id = row.dsp_slot_id
			this.modalForm.rule_ids = []
			this.$confirm(`删除数据媒体位ID: ${this.modalForm.dsp_slot_id}`, {
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
			saveDspRule(this.modalForm).then(res => {
				this.submitClock = false
				this.rule_id_list= []
				if (res.code === 200) {
					this.setModalFlag = false
					this.getDspRuleBudgetList()
				}
			})
			this.modalForm.dsp_slot_id = ''
		},
		submitForm() {
			console.log("this.filterSearch.dsp_slot_id_arr_select.length",this.filterSearch.dsp_slot_id_arr_select)
			if (this.filterSearch.dsp_slot_id_arr_select.length == 0) {
				this.$Message.error({content: '预算位名称不能为空' , duration: 3})
				return
			}
			if(this.$refs.tree.getCheckedKeys([]).length === 0) {
				this.$Message.error({content: '请勾选规则' , duration: 3})
				return
			}

			this.submitClock = true
			this.submitTxt = '提交中...' // 提交按钮的文字

			this.modalForm.dsp_slot_id = this.filterSearch.dsp_slot_id_arr_select[0]
			this.checkedKeys =[]
			if(this.modalForm.type === 1) {
				this.modalForm.dsp_slot_id = this.filterSearch.dsp_slot_id_arr_select[0]
				this.modalForm.rule_ids = [... this.rule_id_list]
			} else {
				let checkoutList = this.$refs.tree.getCheckedKeys([])
				this.modalForm.rule_ids = [... checkoutList]
			}
			this.filterSearch.dsp_slot_id_arr_select = []
			saveDspRule(this.modalForm).then(res => {
				this.submitClock = false
				this.rule_id_list= []
				this.setModalFlag = false
				console.log("res code",res.code)
				if (res.code === 200) {
					console.log("200000000000000000000000")
					this.getDspRuleBudgetList()
				}
			})
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
		 * [toLink 路由跳转]
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		doCreate(row) {
			this.title_name = "预算位名称/ID"
			this.submitTxt = '提交中...'// 提交按钮的文字
			this.setModalFlag = true

			this.getRuleList()
			if(row && row.dsp_slot_id) {
				this.disabled = true
				let strs = row.rule_ids
				const arr = strs.split(',').map(Number);

				this.checkedKeys =[...arr]

				this.modalForm.dsp_slot_id = row.dsp_slot_id   //  媒体ID
				this.modalForm.type = 2

				this.title_name = row.dsp_slot_name
				this.filterSearch.dsp_slot_id_arr_select.push(row.dsp_slot_id)
				// this.rule_tree_list = row.
			} else {
				this.disabled = false
				this.modalForm.dsp_slot_id = ''
				this.title_name = "预算位名称/ID"
				this.checkedKeys =[]
				this.modalForm= {
					dsp_slot_id:'',
					dsp_slot_name:'',
					rule_ids: '',
					rule_names:'',
					type:1,
				}
			}
		},
		/**
		 * [getSspSlotList 广告位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}     [description]
		 */
		getSspSlotList: debounce(function (query) {

			let filter = this.filterSearch

			let _params = {
				ud_id_arr: filter.ud_id_arr,
				app_id_arr: filter.app_id_arr,
				page_size: (!!query || filter.ud_id_arr.length || filter.app_id_arr.length) ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getSspSlotAdList(_params).then(res => {
				this.sspSlotLoad = false
				if (res.code === 200) {
					this.sspSlotList = res.data.list

					if (!query) {
						this.catchSspSlotList = res.data.list
					}
				}
			})
		}, 1000),
		/********************************************
		 *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		 ********************************************/

		/**
		 * [searchDspSlot 预算位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		searchDspSlot(query) {
			console.log("sdsadasfdasfasdfasdfads")
			this.dspSlotLoad = true
			this._getDspSlotList(query)
		},
		/**
		 * [clearSearchDspSlot 清空预算位]
		 * @return {[type]} [description]
		 */
		clearSearchDspSlot(arr) {
			if (arr.length === 0) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
			console.log("this.",this.dspSlotList )
			if (this.dspSlotList.length == 0) {
				this.getOnFoust()
			}


		},
		/**
		 * [dspSlotQueryChange 预算位-搜索词发生变化时]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		dspSlotQueryChange(query) {
			if (!query) {
				this.dspSlotList = [...this.catchDspSlotList]
			}
		},
		/**
		 * [getDspSlotList 产品列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		_getProductList: debounce(function (query) {
			let _params = {
				dsp_company_id_arr: this.filterSearch.dsp_company_id,
				page_size: (!!query || this.filterSearch.dsp_company_id.length) ? 10000 : 10,
				page_num: 1,
				name_or_id: query || ''
			}

			getDspProductList(_params).then(res => {
				this.productLoad = false
				if (res.code === 200) {
					this.productList = res.data.list

					if (!query) {
						this.catchProductList = res.data.list
					}
				}
			})
		}, 1000),

		getOnFoust() {
			let _params = {
				page_size:  20,
				page_num: 1,
			}

			getDspSlotList(_params).then(res => {
				this.dspSlotLoad = false
				if (res.code === 200) {
					this.dspSlotList = res.data.list

				}
			})
		},

		/**
		 * [getDspSlotList 预算位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		_getDspSlotList: debounce(function (query) {

			let _params = {
				// product_id_arr: this.filterSearch.product_id_arr,
				page_size: (!!query || this.filterSearch.product_id_arr.length) ? 10000 : 10,
				page_num: 1,
				search_text: query || ''
			}

			getDspSlotList(_params).then(res => {
				this.dspSlotLoad = false
				if (res.code === 200) {
					this.dspSlotList = res.data.list

					if (!query) {
						this.catchDspSlotList = res.data.list
					}
				}
			})
		}, 1000),
		/********************************************
		 *↑↑↑↑↑↑↑↑↑ 以上部分为搜索联动 end *↑↑↑↑↑↑
		 ********************************************/
	}
}

</script>
<style scoped lang="stylus">

</style>
