/**
 * [catchTableColumn 表格数据]
 * prop: 表格所识别的字段
 * label: 表格title
 * width: 表格宽度
 * include: 所属维度 (dimension: 数据维度; indicator: 数据指标; child: 京东指标/支付宝DAU等指标)
 * @type {Array}
 */
export const catchTableColumn = {
	dimension: [ // 数据维度
		{prop: 'ssp_slot_name', label: '广告位名称/ID', minWidth: 200},
		{prop: 'app_name', label: '应用名称/ID', minWidth: 200},
		{prop: 'ud_name', label: '媒体简称/ID', minWidth: 120},
		{prop: 'ad_type', label: '广告位类型', minWidth: 200},
		{prop: 'ratios', label: '素材尺寸比例', minWidth: 120},
		{prop: 'ex_slot_id', label: '外部广告位ID', minWidth: 120},
		{prop: 'status', label: '业务状态', minWidth: 120},
		{prop: 'status_dev', label: '广告位状态', minWidth: 100},
		{prop: 'operate_status', label: '运营状态', minWidth: 120},
		{prop: 'dsp_product_name', label: '关联产品', minWidth: 200}
	],
	indicator: [ // 数据指标
		{prop: 'total_req_pv', label: '总广告请求pv', sortable: 'custom', minWidth: 140, calcThou: true}
	],
	product: [ // 产品指标
		{prop: 'ssp_product_status_text', label: '今日状态', minWidth: 100},
		{prop: 'req_pv', label: '有效广告请求pv', sortable: 'custom', minWidth: 150, calcThou: true},
		{prop: 'ret_pv', label: '广告返回pv', sortable: 'custom', minWidth: 140, calcThou: true},
		{prop: 'show_pv', label: '广告展现pv', sortable: 'custom', minWidth: 140, calcThou: true},
		{prop: 'click_pv', label: '广告点击pv', sortable: 'custom', minWidth: 140, calcThou: true},
		{prop: 'dplsucc_pv', label: '调起数', sortable: 'custom', minWidth: 100, calcThou: true},
		{prop: 'activate_pv', label: '激活量', sortable: 'custom', minWidth: 100, calcThou: true},
		{prop: 'fill_rates', label: '填充率', sortable: 'custom', minWidth: 100, unit: '%'},
		{prop: 'show_rates', label: '展现率', sortable: 'custom', minWidth: 100, unit: '%'},
		{prop: 'ctr', label: '点击率', sortable: 'custom', minWidth: 100, unit: '%'},
		{prop: 'dplsucc_rates', label: '调起率', sortable: 'custom', minWidth: 100, unit: '%'},
		{prop: 'activate_rates', label: '激活率', sortable: 'custom', minWidth: 100, unit: '%'},
		{prop: 'ssp_ecpm', label: '媒体eCPM', sortable: 'custom', minWidth: 120, calcThou: true },
		{prop: 'ssp_cpc', label: '媒体CPC', sortable: 'custom', minWidth: 120, calcThou: true},
		{prop: 'ecpm', label: 'CPM', sortable: 'custom', minWidth: 100, calcThou: true},
		{prop: 'cpc', label: 'CPC', sortable: 'custom', minWidth: 100, calcThou: true}
	]
}

/**
 * [fixedProp 因为子产品在列表中渲染问题，所以单独
 * 提取出来自产品的prop]
 * @type {Array}
 */
export const fixedProp = [
	'ssp_slot_name',
	'app_name',
	'ud_name',
	'ad_type',
	'ratios',
	'ex_slot_id',
	'dsp_product_name'
]

/**
 * [productProp 因为子产品在列表中渲染问题，所以单独
 * 提取出来自产品的prop]
 * @type {Array}
 */
export const productProp = {
	'req_pv': {calcThou: true},
	'show_pv': {calcThou: true},
	'ret_pv': {calcThou: true},
	'click_pv': {calcThou: true},
	'dplsucc_pv': {calcThou: true},
	'activate_pv': {calcThou: true},
	'fill_rates': {unit: '%'},
	'show_rates': {unit: '%'},
	'dplsucc_rates': {unit: '%'},
	'activate_rates': {unit: '%'},
	'ctr': {unit: '%'},
	'ssp_ecpm': {},
	'ssp_cpc': {},
	'ecpm': {},
	'cpc': {},
	'ssp_product_status_text': {},
}
