<template>
	<div class="page-main">
		<Card dis-hover :bordered="false">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<div class="page-title clearfix" style="flex: 1;">
					<h2>预算位规则</h2>
				</div>
				<div class="is-handler" style="flex: 0 0 auto" >
					<Button  icon="ios-add" type="primary" @click="doCreate()">新建预算规则</Button>
				</div>
			</div>
			<div class="search-line">
				<!-- 预算位名称 -->
				<Select
					class="i-margin-right-11 i-width-select i-select-remote"
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
					placeholder="预算位名称/ID"
				>
					<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})
					</Option>
				</Select>
				<Input :clearable="true"  class="i-margin-right-11 i-width-input" v-model.trim="filterSearch.dsp_slot_id" placeholder="输入预算位ID"/>
				<Button type="primary" @click="doFilterList">查询</Button>
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
					</template>
				</Table>
				<div class="page-center">
					<Page show-total show-sizer show-elevator placement="top" :total="total_count" :current.sync='currentPage' :page-size="pageSize" @on-change="changePage" @on-page-size-change="sizeChange"/>
				</div>
			</div>
		</Card>
		<Drawer v-model="setModalFlag" width="550" :mask-closable="false" :closable="false" :styles="drawStyles" :title="!modalForm.id ? '新建预算规则' : '修改预算规则'">
			<Form ref="modalForm" label-position="right" :model="modalForm" :rules="modalFormRules" :label-width="155">
				<FormItem label="选择预算：" prop="ssp_slot_id">
					<Select
						class=" i-select-remote"
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
						placeholder="预算位名称/ID"
					>
						<Option v-for="item in dspSlotList" :value="item.id" :key="item.id">{{item.dsp_slot_name}} (ID:{{item.id}})
						</Option>
					</Select>
				</FormItem>

				<FormItem label="规则菜单" prop="menuList" class="menuList">
					<div class="menuContent">
						<Input :maxlength="30" show-word-limit v-model.trim="modalForm.search_text" clearable placeholder="输入规则名称"
							   @on-change="SearchSspInputSSSSSSSSSS"/>
						<el-tree
							:props="props"
							:load="loadNode"
							:key="treeKey"
							:data = "rule_tree_list"
							lazy
							show-checkbox
							@check-change="handleCheckChange">
						</el-tree>
					</div>
				</FormItem>


			</Form>
			<div class="drawer-footer">
				<Button @click="setModalFlag = false">取消</Button>
				<Button type="primary" :loading="submitClock" @click="submitCompany('modalForm')">
					<span v-if="!submitClock">提交</span>
					<span v-else>{{submitTxt}}</span>
				</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import {pickupDspSlotStatus, bannedDspSlotStatus, getDspProductList, getDspSlotList, getDspSlotListAPI, saveDspSlot, updateDspSlotStatus, getErrSspSlot, importDspSlot, importDspSlotApi, getSspByDspList, deleteSspByDsp, dspImportAddUrl, dspImportAdd, dspImportUpdate, dspImportUpdateUrl} from '@/api/dsp'
import {debounce, number2Thousand, createObjectURL, formatDate} from '@/libs/tools'
import {getBudgetColum} from "../dsp/data/data";
import {getRuleList,getDspRuleList} from '@/api/rule.js'
export default {
	name: 'ad-budget-rule-manage',
	// mixins: [ inPageAccess, columnFn],
	// components: {
	// 	customColumn
	// },
	data() {
		return {

			getBudgetRuleColum: getBudgetColum(this),
			// _isShow_ : true,  // 添加按钮
			pageSize: 10,
			total_count: 0,
			currentPage: 1,

			submitClock: false, // 保存锁
			setModalFlag: false, // 侧边弹框
			tableLoadFlag: false, // table的loading
			submitTxt: '',
			modalForm: {
				search_text: '', // 搜索框
				rule_ids:[], // 存放规则ID
				dsp_id_list:[],
				dsp_id_id:'',
			},



			rule_budget_list:[],

			// 搜索联动使用
			catchDspSlotList: [], // 缓存预算位名称
			dspSlotList: [], // 预算位名称
			dspSlotLoad: false, // 预算位加载中

			// 搜索条件
			filterSearch: {
				search_text: '', // 搜索框
				dsp_slot_id_arr_select: [], // 预算位名称/ID(单个)

				// 备用数组
				styleDataArr: [], // 广告样式列表
				dsp_slot_id: ''
			},
			modalFormRules:{},
			treeKey:0,
			props: {
				label: 'rule_name', // 显示字段
				children: 'children', // 子节点字段名
				isLeaf: 'leaf', // 是否为叶子节点字段

			},
			rule_id_list:[],
			rule_tree_list:[],
			drawStyles: { // 抽屉样式
				height: 'calc(100% - 55px)',
				overflow: 'auto',
				paddingBottom: '54px',
				position: 'static'
			},
		}

	},
	created() {
		this.getDspRuleBudgetList()
	},

	methods: {

		doCreate(row) {
			this.submitTxt = '提交中...'// 提交按钮的文字
			this.setModalFlag = true

			if(row && row.id) {
				// 编辑
				this.modalForm = {
					dsp_slot_id : row.ssp_slot_id,
					rule_id: row.rule_id,

				}
			} else {
				this.modalForm = {
					dsp_slot_id : '',
					rule_id: '',

				}
			}
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

/// 当选中菜单后，在去搜索要跟新选中菜单的数组

		// 懒加载节点的方法
		loadNode(node, resolve) {
			if (node.level === 0) {
				// 根节点数据模拟，并设置默认名称为"全部"
				setTimeout(() => {
					resolve([{ rule_id: 0, rule_name: '全部', leaf: false }]);
				}, 500);
			} else {
				// 加载子节点的数据模拟
				setTimeout(() => {
					// 示例：根据父节点ID获取对应子节点数据
					console.log("loadNode:",this.rule_tree_list)
					const nodeData = this.rule_tree_list
					resolve(nodeData);
				}, 500);
			}
		},


		// 处理复选框状态改变事件
		handleCheckChange(data, checked, indeterminate) {
			if (data.rule_name === '全部') {
				return
			}

			let cutAtColon = data.rule_name.split(':')[1];
			let curr_id_tirm = cutAtColon.replace(/\)$/, '').trim()
			let curr_id_num = +curr_id_tirm
			if(!this.rule_id_list.includes(curr_id_num) ) {
				this.rule_id_list.push(curr_id_num)
			} else if(!checked) {
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

		SearchSspInputSSSSSSSSSS(){
			console.log("dsafsdfadsf")
			getRuleList({
				rule_name: this.modalForm.search_text,
				page_num: 1,
				page_size: 0,
			}).then(res=> {
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
				if(err.code === 403) {

				}
			})
		},


		/**
		 * [sizeChange 切换每页条数时的回调]
		 * @param  {[type]} size [description]
		 * @return {[type]}      [description]
		 */
		sizeChange(size) {
			this.pageSize = size;
			this.getDspRuleBudgetList()
		},
		/**
		 * [changePage 修改页码]
		 * @param  {[type]} val [description]
		 * @return {[type]}     [description]
		 */
		changePage(val) {
			this.currentPage = val
			this.getDspRuleBudgetList()
		},

		doFilterList() {
			this.currentPage = 1
			this.getDspRuleBudgetList()
		},

		getDspRuleBudgetList() {
			this.tableLoadFlag = true

			getDspRuleList({
				dsp_slot_id: this.filterSearch.dsp_slot_id_arr_select[0],
				page_nam: this.currentPage,
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

		// 弹框提交
		submitCompany() {
			this.$refs[name].validate((valid) => {
				this.subitForm()
			})
		},
		subitForm() {
			this.submitClock = true
			this.submitTxt = '提交中...' // 提交按钮的文字

			saveRule(this.modalForm).then(res => {
				this.submitClock = false

				if(res.code === 200) {
					this.setModalFlag = false
					this.$Message.success({content:this.modalForm.id ? "修改成功" : "新建成功",duration: 3})
					getBudgetList()
				}
			})
		},

		/**
		 * [searchDspSlot 预算位搜索]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		searchDspSlot(query) {
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
		 * [limitText 剩余项数量]
		 * @param  {[type]} count [description]
		 * @return {[type]}       [description]
		 */
		limitText(count) {
			return `${count}+`
		},
		/**
		 * [getDspSlotList 预算位列表-防抖]
		 * @param  {[type]} query [description]
		 * @return {[type]}    [description]
		 */
		_getDspSlotList: debounce(function (query) {
			let _params = {

				page_size: 0,
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
	}
}
</script>
