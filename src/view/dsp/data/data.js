/**
 * [第三发管理平台]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getThirdCols = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '编号',
			key: 'id',
			width: 100
		},
		{
			title: '账号类型',
			key: 'platform_name'
		},
		{
			title: '账号名称',
			key: 'account'
		},
		{
			title: '状态',
			slot: 'status',
			width: 150
		},
		{
			title: '创建时间',
			key: 'created_time',
			width: 170
		},
		{
			title: '更新时间',
			key: 'updated_time',
			width: 170
		},
		{
			title: '操作',
			slot: 'action',
			width: 60
		}
	]
}

/**
 * [预算位管理列表]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getBitColumn = (self) => {
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
			title: '预算位名称/ID',
			slot: 'dsp_slot_name',
			width: 200,
			fixed: 'left',
			isHideInColumn: true
		},
		{
			title: '广告场景',
			key: 'ad_type',
			minWidth: 120
		},
		{
			title: '应用平台',
			slot: 'os_type',
			width: 80,
			minWidth: 80
		},
		{
			title: '公司名称/ID',
			slot: 'dsp_company_id',
			minWidth: 120
		},
    {
      title: '产品名称/ID',
      slot: 'product_id',
      width: 200
    },
		{
			title: '广告样式',
			slot: 'creative_type',
			minWidth: 120
		},
		{
			title: '关联广告位',
			slot: 'ssp_slot_count',
			minWidth: 100
		},
		{
			title: '素材尺寸比例',
			slot: 'ad_ratio',
			minWidth: 110
		},
		{
			title: '预算方广告位ID',
			key: 'dsp_slot_code',
			minWidth: 150
		},
    {
      title: '采买类型',
      slot: 'pickup_status',
      width: 100,
      renderHeader: (h, params) => {
        return h('div', [
          h('Tooltip', {
            props: {transfer: true, content: 'Bottom Center text', placement: 'bottom', maxWidth: 320}
          }, [
            h('span', {style: {cursor: 'pointer'}}, '采买类型'),
            h('Icon', {
              props: {type: 'md-help-circle', color: '#c8c8c8', size: '16', cursor: 'pointer'},
              class: { iconClass: true }
            }), //
            h('div', {
              slot: 'content', style: {display: 'flex'}
            }, [h('span', '为了配合流量的联调、测试和采买流程正常运转，根据业务将预算位进行划分；联调预算位用于开发者联调使用，测试预算位用于流量测试使用，正式预算位用于正常采买使用')])
          ])
        ])
      }
    },
		{
			title: '预算位状态',
			slot: 'status',
			width: 120
		},
		{
			title: 'appkey',
			key: 'dsp_app_key',
			minWidth: 150
		},
		{
			title: 'appsecret',
			key: 'dsp_app_secret',
			minWidth: 150
		},
		{
			title: 'appid',
			key: 'dsp_app_id',
			minWidth: 150
		},
		{
			title: '包名',
			key: 'dsp_app_pkg_name',
			minWidth: 200
		},
		{
			title: '扩展参数',
			key: 'rta_ext',
			minWidth: 200
		},
		{
			title: '备注',
			slot: 'dsp_slot_alias',
			maxWidth: 400,
			minWidth: 200
		},
    {
      title: '开始封禁时间',
      slot: 'banned_at',
      width: 150
    },
		{
			title: '更新时间',
			key: 'updated_at',
			width: 150
		},
		{
			title: '创建时间',
			key: 'created_at',
			width: 150
		},
		{
			title: '操作',
			slot: 'action',
			fixed: 'right',
			width: 60,
			isHideInColumn: true
		}
	]
}

/**
 * [公司Column]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getCompanyColumn = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center',
		},
		{
			title: '公司名称/ID',
			slot: 'company_name',
			width: 250
		},
		{
			title: '公司简称全拼',
			key: 'dsp_code',
			width: 250
		},
		{
			title: '广告请求地址',
			key: 'dsp_request_url'
		},
		{
			title: '广告请求方式',
			slot: 'dsp_request_method',
			width: 150
		},
		{
			title: '操作',
			slot: 'action',
			width: 60
		}
	]
}
/**
 * [选择广告位Column]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getSelectCols = (self) => {
  return [
    {
      title: '广告位名称/ID',
      slot: 'ssp_slot_id',
      minWidth: 200,
      fixed: 'left'
    },
    {
      title: '结算方式',
      slot: 'settlement',
      minWidth: 75
    },
    {
      title: '结算价格',
      slot: 'settlement_money',
      minWidth: 90,
      sortable: 'custom'
    },
    {
      title: '出价CPM',
      slot: 'cpm_price',
      minWidth: 90,
      sortable: 'custom'
    },
    {
      title: '当日请求量',
      slot: 'req_pv',
      minWidth: 100,
      sortable: 'custom'
    },
    {
      title: '媒体CPC',
      slot: 'cpc_dev',
      minWidth: 90,
      sortable: 'custom'
    },
    {
      title: '媒体eCPM',
      slot: 'ecpm_dev',
      minWidth: 95,
      sortable: 'custom'
    },
    {
      title: 'CTR',
      slot: 'ctr',
      minWidth: 70,
      sortable: 'custom'
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
      title: '应用平台',
      slot: 'app_os_type',
      minWidth: 70
    },
    {
      title: '属性',
      slot: 'property',
      minWidth: 70
    },
    {
      title: '选择流量拆分名称',
      slot: 'divide_list',
      fixed: 'right',
      minWidth: 180
    },
    {
      title: '操作',
      slot: 'action',
      width: 60,
      fixed: 'right'
    }
  ]
}
/**
 * [公司Column]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getSplitCols = (self) => {
	return [
		{
			title: '预算位名称/ID',
			slot: 'dsp_slot_id',
			minWidth: 200
		},
		{
			title: '公司简称/ID',
			slot: 'dsp_company_id',
			minWidth: 150
		},
		{
			title: '权重(0~100)',
			slot: 'control_weight',
			minWidth: 150
		}
	]
}

/**
 * [产品管理Column]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
export const getProductColumn = (self) => {
	return [
		{
			type: 'index',
			width: 36,
			align: 'center'
		},
		{
			title: '产品名称/ID',
			slot: 'name',
			minWidth: 200
		},
		{
			title: '公司名称/ID',
			slot: 'dsp_company_id',
			minWidth: 150
		},
		{
			title: '操作',
			slot: 'action',
			width: 60
		}
	]
}
