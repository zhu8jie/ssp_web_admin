/**
 * [计划模板]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getPanelColumns = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			fixed: 'left',
			align: 'center',
			isHideInColumn: true
		},
		{
			type: 'selection',
			width: 50,
			align: 'center',
			fixed: 'left',
			isHideInColumn: true
		},
		{
			title: '广告位名称/ID',
			slot: 'ssp_slot_id',
			minWidth: 200
		},
		{
			title: '触发操作',
			slot: 'operate',
			minWidth: 100,
			renderHeader: (h, params) => {
				return h('div', [
					h('Tooltip', {
						props: {
							transfer: true,
							content: 'Bottom Center text',
							placement: 'bottom',
							maxWidth: 300
						}
					}, [
						h('span', {
							style: {
								cursor: 'pointer'
							}
						}, '触发操作'),
						h('i', {
							style: {
								'color': '#999',
								'cursor': 'pointer',
								'margin-left': '5px'
							},
							class: 'icon-font icon-why'
						}), //
						h('div', {
							slot: 'content',
							style: {
								display: 'flex'
							}
						}, [h('span', '标记广告位运营状态如何变为待测试；分别有审核通过，重新测试，恢复采买三种行为')])
					])
				])
			}
		},
		{
			title: '应用平台',
			slot: 'os_type',
			minWidth: 120
		},
		{
			title: '广告场景',
			slot: 'ad_type_id',
			minWidth: 120
		},
		{
			title: '广告样式',
			slot: 'creative_type',
			minWidth: 120
		},
		{
			title: '素材尺寸比例',
			slot: 'ad_ratio',
			minWidth: 110
		},
		{
			title: '应用名称/ID',
			slot: 'app_id',
			minWidth: 150
		},
		{
			title: '媒体简称/ID',
			slot: 'ud_id',
			minWidth: 100
		},
		{
			title: '广告位创建时间',
			slot: 'created_at',
			width: 150
		},
		{
			title: '任务创建时间',
			slot: 'updated_at',
			width: 150
		},
		{
			title: '操作',
			slot: 'action',
			width: 80,
			fixed: 'right'
		}
	]
}

/**
 * [计划模板]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getPlanTemColumns = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: 'ID',
			key: 'id',
			width: 60
		},
		{
			title: '模板名称',
			key: 'name',
			width: 200
		},
		{
			title: '关联计划数',
			key: 'related_test_plan_num',
			minWidth: 150
		},
		{
			title: '展现控制',
			slot: 'show_pv',
			minWidth: 150
		},
		{
			title: '点击控制',
			slot: 'click_pv',
			minWidth: 150
		},
		{
			title: '成本',
			slot: 'spend',
			minWidth: 150
		},
		{
			title: '前置条件',
			slot: 'check_show_pv',
			minWidth: 200
		},
		{
			title: '规则',
			slot: 'ctr',
			minWidth: 200
		},
		{
			title: '操作',
			slot: 'action',
			width: 90,
			fixed: 'right'
		}
	]
}

/**
 * [计划管理]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getPlanManColumns = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '计划ID',
			key: 'id',
			width: 80
		},
		{
			title: '计划名称',
			key: 'name',
			width: 200
		},
		{
			title: '计划模板',
			slot: 'template',
			width: 150
		},
		{
			title: '广告位ID',
			slot: 'ssp_slot_id_arr',
			width: 150
		},
		{
			title: '广告位名称',
			slot: 'ssp_slot_name_arr',
			width: 300
		},
		{
			title: '产品名称',
			slot: 'dsp_product_name',
			minWidth: 200
		},
		{
			title: '测试日期',
			slot: 'test_time',
			width: 140
		},
		{
			title: '状态',
			slot: 'status',
			width: 120,
			renderHeader: (h, params) => {
				return h('div', [
					h('span', '状态'),
					h('i', {
						style: {
							'color': '#999',
							'cursor': 'pointer',
							'margin-left': '5px'
						},
						class: 'icon-font icon-why',
						on: {
							click: () => {
								self.toggleExplain()
							}
						}
					})
				])
			}
		},
		{
			title: '测试完成时间',
			slot: 'test_end_time',
			minWidth: 200
		},
		{
			title: '创建时间',
			key: 'created_at',
			width: 170
		},
		{
			title: '更新时间',
			key: 'updated_at',
			width: 170
		},
		{
			title: '操作人',
			slot: 'updater',
			width: 100
		},
		{
			title: '操作',
			slot: 'action',
			width: 200,
			fixed: 'right',
			renderHeader: (h, params) => {
				return h('div', [
					h('Tooltip', {
						props: {
							transfer: true,
							content: 'Bottom Center text',
							placement: 'bottom',
							maxWidth: 300
						}
					}, [
						h('span', {
							style: {
								cursor: 'pointer'
							}
						}, '操作'),
						h('i', {
							style: {
								'color': '#999',
								'cursor': 'pointer',
								'margin-left': '5px'
							},
							class: 'icon-font icon-why'
						}), //
						h('div', {
							slot: 'content',
							style: {
								display: 'flex'
							}
						}, [h('span', '此处备注会同步到媒体库广告位与产品的备注上')])
					])
				])
			}
		}
	]
}

/**
 * [广告位与产品状态及原因解释说明 列表]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getExplainColumns = () => {
	return [
		{
			title: '状态',
			slot: 'status',
			width: 60
		},
		{
			title: '触发条件',
			slot: 'name'
		},
		{
			title: '已完成原因',
			slot: 'reason',
			width: 100
		}
	]
}

/**
 * [explainColDatList 解释列]
 * @type {Array}
 */
export const explainColDatList = [
	{
		status: '已完成',
		name: '达到测试结束日期时间',
		reason: '到期完成'
	},
	{
		name: '成功终止',
		reason: '手动终止'
	},
	{
		name: '结束日期当天达到展现量级或点击量级',
		reason: '达到量级'
	},
	{
		name: '结束日期当天达到成本',
		reason: '达到成本'
	},
	{
		status: '暂停中',
		name: '成功暂停',
		reason: '-'
	},
	{
		name: '触发媒体CPC临界值',
		reason: '异常CPC'
	},
	{
		name: '触发CTR临界值',
		reason: '异常CTR'
	},
	{
		status: '待测试',
		name: '未达到测试开始时间',
		reason: '-'
	},
	{
		status: '测试中',
		name: '处于测试日期时间段内：或从测试暂停状态进行启动操作',
		reason: '-'
	}
]

/**
 * [编辑页面匹配 列表]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getMatchColumns = () => {
	return [
		{
			type: 'index',
			width: 42,
			align: 'center'
		},
		{
			title: '广告位名称',
			slot: 'ssp_slot_name',
			width: 200
		},
		{
			title: '广告位ID',
			slot: 'ssp_slot_id',
			width: 120
		},
		{
			title: '应用平台',
			slot: 'app_os_type',
			minWidth: 100
		},
		{
			title: '广告位类型',
			slot: 'ad_type',
			minWidth: 120
		},
		{
			title: '素材尺寸比例',
			slot: 'ad_ratio',
			minWidth: 120
		},
		{
			title: '公司名称',
			slot: 'dsp_company_name',
			minWidth: 120
		},
		{
			title: '产品名称',
			slot: 'product_name',
			minWidth: 200
		},
		{
			title: '预算位',
			slot: 'dsp_slot_list',
			minWidth: 200
		},
		{
			title: '时段控制',
			slot: 'time_control',
			width: 180
		},
		{
			title: '人群定向',
			slot: 'control',
			width: 100
		}
	]
}

/**
 * [测试详情]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getTestDetailColumns = () => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '广告位名称',
			slot: 'ssp_slot_name',
			width: 200
		},
		{
			title: '广告位ID',
			slot: 'ssp_slot_id',
			width: 120
		},
		{
			title: '产品名称',
			slot: 'product_name',
			minWidth: 200
		},
		{
			title: '状态',
			slot: 'status',
			width: 80
		},
		{
			title: '原因详情',
			slot: 'reason',
			minWidth: 200
		},
		{
			title: '操作',
			slot: 'action',
			width: 100
		}
	]
}

/**
 * [备注弹窗]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getNoteColumns = () => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '广告位名称',
			slot: 'ssp_slot_name',
			minWidth: 200
		},
		{
			title: '广告位ID',
			slot: 'ssp_slot_id',
			width: 120
		},
		{
			title: '产品名称',
			slot: 'product_name',
			minWidth: 200
		},
		{
			title: '备注',
			slot: 'action',
			width: 250
		}
	]
}
