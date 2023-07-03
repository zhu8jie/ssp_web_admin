/**
 * [cp的列]
 * @param  {[type]} self [description]
 * @return {[type]}	  [description]
 */
export const cpCols = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: 'CPID',
			key: 'id'
		},
		{
			title: 'CP名称',
			key: 'name'
		},
		{
			title: '创建时间',
			slot: 'created_at'
		},
		{
			title: '操作',
			slot: 'action',
			width: 200
		}
	]
}
/**
 * [推广产品的列]
 * @param  {[type]} self [description]
 * @return {[type]}	  [description]
 */
export const productCols = (self) => {
	return [
		{
			title: '推广产品ID',
			key: 'id'
		},
		{
			title: '推广产品',
			key: 'name'
		},
		{
			title: 'CP',
			slot: 'cp_name'
		},
		{
			title: '创建时间',
			slot: 'created_at'
		},
		{
			title: '操作',
			slot: 'action',
			width: 200
		}
	]
}
/**
 * [监测概况]
 * @param  {[type]} self [description]
 * @return {[type]}	  [description]
 */
export const getInfoColumn = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center',
			isHideInColumn: true
		},
		{
			title: '日期',
			slot: 'date',
			key: 'date',
			width: 100,
			isHideInColumn: true
		},
		{
			title: '任务编号',
			key: 'id',
			slot: 'id',
			minWidth: 80,
			noNeedCalcThou: true
		},
		{
			title: '推广产品',
			slot: 'product_name',
			key: 'product_name',
			minWidth: 130,
			noNeedCalcThou: true
		},
		{
			title: '推广平台',
			slot: 'os',
			key: 'os',
			minWidth: 90,
			noNeedCalcThou: true
		},
		{
			title: 'CP',
			slot: 'cp_name',
			key: 'cp_name',
			minWidth: 130,
			noNeedCalcThou: true
		},
		{
			title: '渠道',
			slot: 'channel_name',
			key: 'channel_name',
			minWidth: 130,
			noNeedCalcThou: true
		},
		{
			title: '入价(元)',
			key: 'cp_price',
			slot: 'cp_price',
			minWidth: 100,
			noNeedCalcThou: true
		},
		{
			title: '出价(元)',
			key: 'channel_price',
			slot: 'channel_price',
			minWidth: 100,
			noNeedCalcThou: true
		},
		{
			title: '点击数',
			key: 'click',
			slot: 'click',
			minWidth: 80
		},
		{
			title: '转化数',
			slot: 'action',
			key: 'action',
			minWidth: 80
		},
		{
			title: '点转率',
			slot: 'click_action_rate',
			key: 'click_action_rate',
			minWidth: 90
		},
		{
			title: '实际折扣系数(%)',
			slot: 'current_discount_rate',
			key: 'current_discount_rate',
			minWidth: 130,
			noNeedCalcThou: true
		},
		{
			title: '实时折扣系数(%)',
			slot: 'actual_discount_rate',
			key: 'actual_discount_rate',
			minWidth: 150,
			noNeedCalcThou: true,
			renderHeader: (h, params) => {
				return h('div', [
					h('Tooltip', {
						props: {
							transfer: true,
							content: 'Bottom Center text',
							placement: 'top-end',
							maxWidth: 400
						},
						style: {
							lineHeight: '15px'
						}
					}, [
						h('span', {
							style: {
								cursor: 'pointer',
								marginRight: '5px',
								lineHeight: '15px'
							}
						}, '实时折扣系数(%)'),
						h('Icon', {
							props: {
								type: 'md-help-circle',
								color: '#B5B5B5',
								size: '16',
								cursor: 'pointer'
							},
							class: {iconClass: true}
						}),
						h('div', {
							slot: 'content',
							style: {
								fontSize: '12px'
							}
						}, '回调数/转化数*100%，结果取整')
					])
				])
			}
		},
		{
			title: '回调数',
			slot: 'action_channel',
			key: 'action_channel',
			minWidth: 100
		},
		{
			title: '误差',
			slot: 'action_gap',
			key: 'action_gap',
			width: 100,
			noNeedCalcThou: true,
			renderHeader: (h, params) => {
				return h('div', [
					h('Tooltip', {
						props: {
							transfer: true,
							content: 'Bottom Center text',
							placement: 'top-end',
							maxWidth: 400
						},
						style: {
							lineHeight: '15px'
						}
					}, [
						h('span', {
							style: {
								cursor: 'pointer',
								marginRight: '5px',
								lineHeight: '15px'
							}
						}, '误差'),
						h('Icon', {
							props: {
								type: 'md-help-circle',
								color: '#B5B5B5',
								size: '16',
								cursor: 'pointer'
							},
							class: {iconClass: true}
						}),
						h('div', {
							slot: 'content',
							style: {
								fontSize: '12px'
							}
						}, '转化数-回调数')
					])
				])
			}
		},
		{
			title: '预测收入(元)',
			slot: 'income',
			key: 'income',
			minWidth: 130
		},
		{
			title: '预测支出(元)',
			slot: 'cost',
			key: 'cost',
			minWidth: 130
		},
		{
			title: '预测利润率',
			slot: 'profit_rate',
			key: 'profit_rate',
			minWidth: 130,
			renderHeader: (h, params) => {
				return h('div', [
					h('Tooltip', {
						props: {
							transfer: true,
							content: 'Bottom Center text',
							placement: 'top-end',
							maxWidth: 400
						},
						style: {
							lineHeight: '15px'
						}
					}, [
						h('span', {
							style: {
								cursor: 'pointer',
								marginRight: '5px',
								lineHeight: '15px'
							}
						}, '预测利润率'),
						h('Icon', {
							props: {
								type: 'md-help-circle',
								color: '#B5B5B5',
								size: '16',
								cursor: 'pointer'
							},
							class: {iconClass: true}
						}),
						h('div', {
							slot: 'content',
							style: {
								fontSize: '12px'
							}
						}, '（预测收入-预测支出）/预测收入*100%')
					])
				])
			}
		},
		{
			title: '更新时间',
			slot: 'updated_at',
			key: 'updated_at',
			width: 150,
			noNeedCalcThou: true
		}
	]
}

/**
 * [渠道管理Column]
 * @param  {[type]} self [description]
 * @return {[type]}	  [description]
 */
export const getChannelCol = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '渠道ID',
			key: 'id',
			width: 100
		},
		{
			title: '渠道名称',
			key: 'name',
			minWidth: 250
		},
		{
			title: '创建时间',
			slot: 'created_at',
			minWidth: 170
		},
		{
			title: '操作',
			slot: 'handle',
			width: 60
		}
	]
}

/**
 * [任务管理Column]
 * @param  {[type]} self [description]
 * @return {[type]}	  [description]
 */
export const getTaskCol = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			fixed: 'left',
			align: 'center',
			isHideInColumn: true
		},
		{
			title: '任务ID',
			slot: 'id',
			fixed: 'left',
			isHideInColumn: true,
			width: 80
		},
		{
			title: '推广产品',
			slot: 'product_name',
			minWidth: 250
		},
		{
			title: 'CP',
			slot: 'cp',
			minWidth: 250
		},
		{
			title: '渠道',
			slot: 'channel',
			minWidth: 250
		},
		{
			title: '推广链接',
			slot: 'cp_landing_page',
			minWidth: 250
		},
		{
			title: 'CP监测链接',
			slot: 'cp_click_url',
			minWidth: 250
		},
		{
			title: '渠道监测链接',
			slot: 'task_url',
			minWidth: 250
		},
		{
			title: '推广地区',
			key: 'region',
			width: 100
		},
		{
			title: '推广平台',
			slot: 'os_type',
			width: 80
		},
		{
			title: '入价(元)',
			slot: 'cp_price',
			width: 100
		},
		{
			title: '出价(元)',
			slot: 'channel_price',
			width: 100
		},
		{
			title: '折扣系数(%)',
			key: 'discount_rate',
			width: 100
		},
		{
			title: '需求量级',
			slot: 'demand',
			minWidth: 200
		},
		{
			title: '投放时间',
			slot: 'timestamp',
			minWidth: 200
		},
		{
			title: '考核内容',
			slot: 'content',
			minWidth: 200
		},
		{
			title: '创建时间',
			slot: 'created_at',
			minWidth: 170
		},
		{
			title: '操作',
			slot: 'handle',
			fixed: 'right',
			isHideInColumn: true,
			width: 60
		}
	]
}
