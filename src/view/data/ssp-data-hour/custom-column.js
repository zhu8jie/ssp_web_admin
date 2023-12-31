export const customColumn = {
	data() {
		return {
			parentHasCheckData: [ // 抽屉 - 流量表格 - 已选择列（下拉滚动）
				// 数据维度
				// '时间',
				'媒体名称',
				'应用平台',
				'应用名称',
				'广告位名称',
				'外部广告位ID',
				'素材尺寸比例',
				'广告位类型',

				// 基本指标
				'总广告请求pv',
				'有效广告请求pv',
				'丢弃广告请求pv',
				'有效广告请求uv',
				'广告返回pv',
				'广告返回uv',
				'广告展现pv',
				'广告展现uv',
				'扣量广告展现pv',
				'广告点击pv',
				'广告点击uv',
				'扣量广告点击pv',
				'加群点击数',
				'调起数',
				'下载完成量',
				'安装量',
				'激活量',

				// 效果指标
				'填充率',
				'展现率',
				'点击率',
				'调起率',
				'下载完成率',
				'安装率',
				'激活率',
				'媒体eCPM',
				'媒体CPC',

				// 收益指标
				'成本'
			],
			parent_data_dimension: [ // 抽屉 - 流量表格 - 数据维度
				// 数据维度
				// '时间',
				'媒体名称',
				'应用平台',
				'应用名称',
				'广告位名称',
				'外部广告位ID',
				'素材尺寸比例',
				'广告位类型'
			],
			parent_basic_indicators: [ // 抽屉 - 流量表格 - 基本指标
				'总广告请求pv',
				'有效广告请求pv',
				'丢弃广告请求pv',
				'有效广告请求uv',
				'广告返回pv',
				'广告返回uv',
				'广告展现pv',
				'广告展现uv',
				'扣量广告展现pv',
				'广告点击pv',
				'广告点击uv',
				'扣量广告点击pv',
				'加群点击数',
				'调起数',
				'下载完成量',
				'安装量',
				'激活量'
			],
			parent_effect_indicators: [ // 抽屉 - 流量表格 - 效果指标
				'填充率',
				'展现率',
				'点击率',
				'调起率',
				'下载完成率',
				'安装率',
				'激活率',
				'媒体eCPM',
				'媒体CPC'
			],
			parent_income_indicators: [ // 抽屉 - 流量表格 - 收益指标
				'成本'
			],

			childHasCheckData: [ // 抽屉 - 预算表格 - 已选择列（下拉滚动）
				// 数据维度
				// '时间',
				'公司/账号名称',
				'产品名称',
				'预算位名称',
				'素材尺寸比例',
				'广告位类型',

				// 基本指标
				'有效广告请求pv',
				'有效广告请求uv',
				'广告返回pv',
				'广告返回uv',
				'广告展现pv',
				'广告展现uv',
				'扣量广告展现pv',
				'广告点击pv',
				'广告点击uv',
				'扣量广告点击pv',
				'加群点击数',
				'调起数',
				'广告展现占比',
				'广告点击占比',
				'下载完成量',
				'安装量',
				'激活量',

				// 效果指标
				'填充率',
				'展现率',
				'点击率',
				'调起率',
				'下载完成率',
				'安装率',
				'激活率',
				'媒体eCPM',
				'媒体CPC',

				// 收益指标
				'成本'
			],

			child_data_dimension: [ // 抽屉 - 预算表格 - 数据维度
				// 数据维度
				// '时间',
				'公司/账号名称',
				'产品名称',
				'预算位名称',
				'素材尺寸比例',
				'广告位类型'
			],

			child_basic_indicators: [ // 抽屉 - 预算表格 - 基本指标
				// 基本指标
				'有效广告请求pv',
				'有效广告请求uv',
				'广告返回pv',
				'广告返回uv',
				'广告展现pv',
				'广告展现uv',
				'扣量广告展现pv',
				'广告点击pv',
				'广告点击uv',
				'扣量广告点击pv',
				'加群点击数',
				'调起数',
				'广告展现占比',
				'广告点击占比',
				'下载完成量',
				'安装量',
				'激活量'
			],

			child_effect_indicators: [ // 抽屉 - 预算表格 - 效果指标
				// 效果指标
				'填充率',
				'展现率',
				'点击率',
				'调起率',
				'下载完成率',
				'安装率',
				'激活率',
				'媒体eCPM',
				'媒体CPC'
			],

			child_income_indicators: [ // 抽屉 - 预算表格 - 收益指标
				// 收益指标
				'成本'
			]
		}
	}
}
