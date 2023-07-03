export const getManageCols = (self) => {
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
			minWidth: 200,
			fixed: 'left',
			isHideInColumn: true
		},
		{
			title: '内部广告位名称',
			slot: 'Internal_name',
			minWidth: 140
		},
		{
			title: '外部广告位ID',
			slot: 'ex_slot_id',
			minWidth: 150
		},
		{
			title: '应用名称/ID',
			slot: 'app_id',
			minWidth: 150
		},
		{
			title: '应用平台',
			slot: 'app_os_type',
			minWidth: 100
		},
		{
			title: '媒体简称/ID',
			slot: 'ud_id',
			minWidth: 150
		},
		{
			title: '广告场景',
			slot: 'ad_type',
			minWidth: 120
		},
		{
			title: '广告样式',
			slot: 'creative_type',
			minWidth: 150
		},
		{
			title: '素材尺寸比例',
			slot: 'ad_ratio',
			minWidth: 120
		},
		{
			title: '接入方式',
			slot: 'access_type_text',
			minWidth: 80
		},
		{
			title: '渲染方式',
			slot: 'render_type_text',
			minWidth: 100
		},
		{
			title: '关联预算位',
			slot: 'configNumber',
			minWidth: 100
		},
		{
			title: '业务状态',
			slot: 'status',
			minWidth: 110
		},
		{
			title: '广告位状态',
			slot: 'status_dev',
			minWidth: 90
		},
		// {
		// 	title: '请求量控制',
		// 	slot: 'status_ctrl',
		// 	minWidth: 90
		// },
		{
			title: '最大请求数',
			slot: 'max_request_times',
			minWidth: 90
		},
    {
      title: '运营状态',
      slot: 'operate_status',
      minWidth: 90
    },
    {
      title: '运营状态原因',
      slot: 'operate_reason',
      minWidth: 110
    },
		{
			title: '广告展现保留比',
			slot: 'show_rate',
			minWidth: 120
		},
		{
			title: '广告点击保留比',
			slot: 'click_rate',
			minWidth: 120
		},
		{
			title: '第三方SDK接入',
			slot: 'platform_name',
			minWidth: 160
		},
		{
			title: '穿山甲广告位ID',
			slot: 'pangolin_APPID',
			minWidth: 140
		},
		{
			title: '优量汇广告位ID',
			slot: 'you_APPID',
			minWidth: 140
		},
		{
			title: '交互通广告位ID',
			slot: 'tuia_ID',
			minWidth: 140
		},
		{
			title: '更新时间',
			slot: 'updated_time',
			minWidth: 170
		},
		{
			title: '创建时间',
			slot: 'created_time',
			minWidth: 170
		},
		{
			title: '操作',
			slot: 'action',
			minWidth: 200,
			fixed: 'right',
			isHideInColumn: true
		}
	]
}
