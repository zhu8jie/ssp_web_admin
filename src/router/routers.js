import Main from '@/components/main/main'

/**
 * 项目中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  targetHighLight: (false) 目标父级高亮
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 * keepAlive: 页面需要缓存
 * inPageAccess 页面内权限，比如[查看，修改，封禁， 重置密码，伪登录...]
 * isShowAccess 是否在 账号权限-模块管理 route中显示
 * redirectTo 重定向的来源，在配置异步路由时使用
 */

/**
 * [constantRouterMap 登录，注册， 首页等 不需要权限的公共页面]
 * @type {Array}
 */
export const constantRouterMap = [
	{
		path: '/account/login', // 登录
		name: 'login',
		meta: {
			title: '登录',
			hideInMenu: true
		},
		component: resolve => require(['@/view/account/login'], resolve)
	},
	{
		path: '/account/reg', // 注册
		name: 'register',
		meta: {
			title: '注册',
			hideInMenu: true
		},
		component: resolve => require(['@/view/account/register'], resolve)
	}
]

/**
 * 异步路由，需要在权限-模块中创建的路由
 */
export const asyncRouterMap = [
	{
		path: '/',
		name: 'home',
		redirect: '/home',
		component: Main,
		meta: {
			title: '首页',
			redirectTo: 'home-index',
			icon: 'left-bar-icon home-tag'
		},
		children: [
			{
				path: '/home',
				name: 'home-index',
				meta: {
					title: '首页',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'viewDetail': '查看详细数据'} // 页面内权限
				},
				component: resolve => require(['@/view/home/index'], resolve)
			}
		]
	},
	{
		path: '/ssp', // 预算管理
		name: 'ssp',
		component: Main,
		meta: {
			title: '流量管理',
			icon: 'left-bar-icon ssp-tag'
		},
		children: [
			{
				path: '/ssp/media/manage',
				name: 'media-manage',
				meta: {
					keepAlive: true,
					title: '媒体管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'view': '查看', 'modify': '修改', 'setting': '配置', 'banned': '封禁', 'enable': '启用', 'resetPsw': '重置密码', 'mediaLogin': '伪登录'} // 页面内权限
				},
				component: resolve => require(['@/view/ssp/media/manage'], resolve)
			},
			{
				path: '/ssp/media/edit/:ud_id',
				name: 'media-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'media-manage',
					title: '媒体平台-修改'
				},
				component: resolve => require(['@/view/ssp/media/edit'], resolve)
			},
			{
				path: '/ssp/media/view/:ud_id',
				name: 'media-view',
				meta: {
					hideInMenu: true,
					targetHighLight: 'media-manage',
					title: '媒体详情'
				},
				component: resolve => require(['@/view/ssp/media/view'], resolve)
			},
			{
				path: '/ssp/app/manage',
				name: 'application-manage',
				meta: {
					keepAlive: true,
					title: '应用管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载应用列表', 'view': '查看', 'edit': '编辑', 'pass': '通过', 'setting': '配置', 'banned': '封禁', 'passAndSet': '通过并配置', 'enable': '启用', 'refuse': '拒绝', 'batchNewApp': '批量新建应用'} // 页面内权限
				},
				component: resolve => require(['@/view/ssp/app/manage'], resolve)
			},
			{
				path: '/ssp/app/detail',
				name: 'app-detail',
				meta: {
					hideInMenu: true,
					targetHighLight: 'application-manage',
					title: '应用详情'
				},
				component: resolve => require(['@/view/ssp/app/detail'], resolve)
			},
			{
				path: '/ssp/app/edit',
				name: 'app-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'application-manage',
					title: '编辑应用'
				},
				component: resolve => require(['@/view/ssp/app/app-edit'], resolve)
			},
			{
				path: '/ssp/ad/manage',
				name: 'ad-manage',
				meta: {
					keepAlive: true,
					isShowAccess: true,
					title: '广告位管理',
					inPageAccess: {'viewIndex': '首页', 'view': '查看', 'modify': '修改', 'setting': '配置', 'passAndSet': '通过并配置', 'refuse': '拒绝', 'enable': '启用', 'banned': '封禁', 'batchNewAd': '批量导入广告位', 'batchNewBudget': '批量配置预算位', 'download': '下载广告位列表'} // 页面内权限
				},
				component: resolve => require(['@/view/ssp/adv/ad-manage'], resolve)
			},
			{
				path: '/ssp/ad/edit',
				name: 'ad-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'ad-manage',
					title: '编辑广告位'
				},
				component: resolve => require(['@/view/ssp/adv/ad-edit'], resolve)
			},
			{
				path: '/ssp/ad/view',
				name: 'ad-view',
				meta: {
					hideInMenu: true,
					targetHighLight: 'ad-manage',
					title: '广告位详情'
				},
				component: resolve => require(['@/view/ssp/adv/ad-view'], resolve)
			},
			{
				path: '/ssp/ad/config/:slot_id',
				name: 'ad-config',
				meta: {
					hideInMenu: true,
					targetHighLight: 'ad-manage',
					title: '广告位管理-配置'
				},
				component: resolve => require(['@/view/ssp/adv/ad-config'], resolve)
			},
			{
				path: '/ssp/dealId/manage',
				name: 'dealId-manage',
				meta: {
					keepAlive: true,
					title: 'Deal ID 管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'edit': '新建/修改Deal组'} // 页面内权限
				},
				component: resolve => require(['@/view/ssp/dealId/manage'], resolve)
			},
			{
				path: '/ssp/dealId/edit',
				name: 'dealId-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'dealId-manage',
					title: '新建/编辑Deal组'
				},
				component: resolve => require(['@/view/ssp/dealId/edit'], resolve)
			},
			{
				path: '/ssp/ratio/manage',
				name: 'ratio-manage',
				meta: {
					keepAlive: true,
					title: '素材尺寸管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAdd': '新建尺寸比例'}
				},
				component: resolve => require(['@/view/ssp/ratio/manage'], resolve)
			}
		]
	},
	{
		path: '/plan', // 预算管理
		name: 'ssp-plan',
		component: Main,
		meta: {
			title: '流量测试',
			icon: 'left-bar-icon ssp-tag'
		},
		children: [
			{
				path: '/ssp/plan/panel',
				name: 'ssp-plan-panel',
				meta: {
					keepAlive: true,
					title: '任务面板',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'add': '批量创建计划'}
				},
				component: resolve => require(['@/view/plan/panel/manage'], resolve)
			},
			{
				path: '/ssp/plan/template',
				name: 'ssp-plan-template',
				meta: {
					keepAlive: true,
					title: '计划模板',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAndEdit': '新建/修改计划模板', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/plan/template/manage'], resolve)
			},
			{
				path: '/ssp/plan/manage',
				name: 'ssp-plan-manage',
				meta: {
					keepAlive: true,
					title: '计划管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAndEdit': '查看/新建/修改计划', 'handle': '开启/终止/暂停计划', 'delete': '删除', 'note': '备注'} // 页面内权限
				},
				component: resolve => require(['@/view/plan/manage/manage'], resolve)
			},
			{
				path: '/ssp/plan/edit',
				name: 'ssp-plan-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'ssp-plan-manage',
					title: '新建/修改/查看计划'
				},
				component: resolve => require(['@/view/plan/manage/edit'], resolve)
			},
		]
	},
	{
		path: '/dsp', // 预算管理
		name: 'dsp',
		component: Main,
		meta: {
			title: '预算管理',
			icon: 'left-bar-icon dsp-tag'
		},
		children: [
			{
				path: '/dsp/company/manage',
				name: 'company-manage',
				meta: {
					title: '公司管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'addNewCompany': '新建公司', 'modify': '修改'} // 页面内权限
				},
				component: resolve => require(['@/view/dsp/company-manage'], resolve)
			},
			{
				path: '/dsp/product/manage',
				name: 'product-manage',
				meta: {
					title: '产品管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAndEdit': '新建/修改产品'} // 页面内权限
				},
				component: resolve => require(['@/view/dsp/product-manage'], resolve)
			},
			{
				path: '/dsp/slot/manage',
				name: 'dsp-slot-manage',
				meta: {
					keepAlive: true,
					title: '预算位管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'modify': '修改', 'addNewBudget': '新建预算位', 'batchNewBudget': '批量导入预算位', 'download': '下载预算位列表'} // 页面内权限
				},
				component: resolve => require(['@/view/dsp/dsp-slot-manage'], resolve)
			},
			{
				path: '/dsp/slot/edit',
				name: 'dsp-slot-edit',
				meta: {
					hideInMenu: true,
					targetHighLight: 'dsp-slot-manage',
					title: '新建/编辑预算位'
				},
				component: resolve => require(['@/view/dsp/dsp-slot-edit'], resolve)
			},
			{
				path: '/dsp/third/manage',
				name: 'third-account-manage',
				meta: {
					title: '第三方平台账号管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'addNewAccount': '新建账号', 'modify': '修改'} // 页面内权限
				},
				component: resolve => require(['@/view/dsp/third-manage'], resolve)
			}
		]
	},
	{
		path: '/data', // 数据管理
		name: 'data',
		component: Main,
		meta: {
			title: '数据管理',
			icon: 'left-bar-icon revenue-tag'
		},
		children: [
			{
				path: '/data/ssp/media/index',
				name: 'ssp-media-data',
				meta: {
					title: '媒体库数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表'} // 页面内权限
				},
				component: resolve => require(['@/view/data/media-library-data/index'], resolve)
			},
			{
				path: '/data/ssp/plan/index',
				name: 'plan-data',
				meta: {
					title: '测试计划数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表'} // 页面内权限
				},
				component: resolve => require(['@/view/data/plan-data/index'], resolve)
			},
			{
				path: '/data/ssp/index',
				name: 'ssp-data',
				meta: {
					title: '流量数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表', 'viewSource': '子表查看', 'deleteSource': '删除广告位配置的预算位'} // 页面内权限
				},
				component: resolve => require(['@/view/data/ssp-data/index'], resolve)
			},
			{
				path: '/data/dsp/index',
				name: 'dsp-data',
				meta: {
					title: '预算数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表', 'viewSource': '子表查看', 'deleteSource': '删除广告位配置的预算位'} // 页面内权限
				},
				component: resolve => require(['@/view/data/dsp-data/index'], resolve)
			},
			{
				path: '/data/dsp/detail/index',
				name: 'dsp-detail-data',
				meta: {
					title: '预算位详细数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表'} // 页面内权限
				},
				component: resolve => require(['@/view/data/dsp-detail-data/index'], resolve)
			},
			{
				path: '/data/dsp/gap',
				name: 'budget-gap',
				meta: {
					title: '平台与预算方gap数据',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页'} // 页面内权限
				},
				component: resolve => require(['@/view/data/gap-data/index'], resolve)
			},
			{
				path: '/data/export/index',
				name: 'export-data',
				meta: {
					title: '数据导入',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'download': '下载', 'import': '导入', 'reimport': '重新导入'} // 页面内权限
				},
				component: resolve => require(['@/view/data/export-data/index'], resolve)
			},
			{
				path: '/data/spend/index',
				name: 'spend-amendment',
				meta: {
					title: '支出修正',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAddSpend': '新建修正'} // 页面内权限
				},
				component: resolve => require(['@/view/data/spend-amendment/index'], resolve)
			}
		]
	},
	{
		path: '/finance', // 财务中心
		name: 'finance',
		component: Main,
		redirect: '/finance/manage/index',
		meta: {
			title: '财务中心',
			redirectTo: 'finance-manage',
			icon: 'left-bar-icon material-tag'
		},
		children: [
			{
				path: '/finance/manage/index',
				name: 'finance-manage',
				meta: {
					title: '财务中心-媒体结算账单',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页','viewMedia': '查看媒体', 'viewFill': '查看账单', 'uploadFill': '上传回单', 'downloadFill': '下载回单', 'writeFill': '填写回寄单号', 'remit': '打款', 'checkFill': '核对结算材料', 'modify' : '修正', 'trial' : '初审', 'lastTrial': '终审' } // 页面内权限
				},
				component: resolve => require(['@/view/finance/manage/index'], resolve)
			}
		]
	},
	{
		path: '/tag', // 人群标签
		name: 'tag-manage',
		component: Main,
		redirect: '/tag/crowd/manage',
		meta: {
			title: '人群标签',
			redirectTo: 'tag-crowd-manage',
			icon: 'left-bar-icon material-tag'
		},
		children: [
			{
				path: '/tag/crowd/manage',
				name: 'tag-crowd-manage',
				meta: {
					title: '人群标签',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAndEdit': '新建/修改标签'} // 页面内权限
				},
				component: resolve => require(['@/view/tag/crowd/manage'], resolve)
			}
		]
	},
	{
		path: '/ad', // 广告物料
		name: 'material-manage',
		component: Main,
		redirect: '/ad/material',
		meta: {
			title: '广告物料',
			redirectTo: 'material-manage-index',
			icon: 'left-bar-icon material-tag'
		},
		children: [
			{
				path: '/ad/material',
				name: 'material-manage-index',
				meta: {
					title: '广告物料',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页'} // 页面内权限
				},
				component: resolve => require(['@/view/ad/material'], resolve)
			}
		]
	},
	{
		path: '/warn', // 预警中心
		name: 'warn-manage',
		component: Main,
		redirect: '/warn/manage',
		meta: {
			title: '预警中心',
			redirectTo: 'warn-manage-index',
			icon: 'left-bar-icon warn-tag'
		},
		children: [
			{
				path: '/warn/manage',
				name: 'warn-manage-index',
				meta: {
					title: '预警中心',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'addAndEdit': '新建/编辑预警', 'status': '修改预警状态', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/warn/manage'], resolve)
			},
			{
				path: '/warn/edit',
				name: 'warn-edit',
				meta: {
					title: '新建预警规则',
					hideInMenu: true,
					targetHighLight: 'warn-manage-index',
				},
				component: resolve => require(['@/view/warn/edit'], resolve)
			}
		]
	},
	{
		path: '/access', // 接入管理
		name: 'access-manage',
		component: Main,
		redirect: '/access/manage',
		meta: {
			title: '接入管理',
			redirectTo: 'access-manage-index',
			icon: 'left-bar-icon access-tag'
		},
		children: [
			{
				path: '/access/manage',
				name: 'access-manage-index',
				meta: {
					title: '接入管理',
					isShowAccess: true,
					inPageAccess: {'addVersion': '新建版本', 'modify': '修改', 'publish': '发布', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/access/manage'], resolve)
			}
		]
	},
	{
		path: '/permission', // 账号权限
		name: 'permission',
		component: Main,
		meta: {
			title: '账号权限',
			icon: 'left-bar-icon account-tag'
		},
		children: [
			{
				path: '/permission/account/manage',
				name: 'permission-account',
				meta: {
					title: '账号管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAddAccount': '新建账号', 'modify': '修改', 'resetPsw': '重置密码'} // 页面内权限
				},
				component: resolve => require(['@/view/permission/account-manage'], resolve)
			},
			{
				path: '/permission/role/manage',
				name: 'permission-role',
				meta: {
					title: '角色管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAddRole': '新建角色', 'modify': '修改', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/permission/role-manage'], resolve)
			},
			/*{
				path: '/permission/module/manage',
				name: 'permission-module',
				meta: {
					title: '模块管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAddModule': '新建模块', 'newAddChildModule': '新建子模块', 'modify': '修改', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/permission/module-manage'], resolve)
			},*/
			{
				path: '/permission/module/manage',
				name: 'permission-module',
				meta: {
					title: '模块管理',
					isShowAccess: true,
					inPageAccess: {'viewIndex': '首页', 'newAddModule': '新建模块', 'newAddChildModule': '新建子模块', 'modify': '修改', 'delete': '删除'} // 页面内权限
				},
				component: resolve => require(['@/view/permission/module-manage'], resolve)
			}
		]
	},
	{
		path: '/monitor', // 数据监测产品
		name: 'monitor-manage',
		component: Main,
		meta: {
			title: '数据监测产品',
			icon: 'left-bar-icon monitor-tag'
		},
		children: [
			{
				path: '/monitor/info',
				name: 'monitor-info',
				meta: {
					isShowAccess: true,
					title: '监测概况',
					inPageAccess: {'viewIndex': '首页', 'download': '下载报表', 'edit': '修改'} // 页面内权限
				},
				component: resolve => require(['@/view/monitor/info'], resolve)
			},
			{
				path: '/monitor/cp/manage',
				name: 'monitor-cp',
				meta: {
					isShowAccess: true,
					title: 'CP管理',
					inPageAccess: {'viewIndex': '首页', 'addCP': '新建CP', 'addApp': '新建推广产品'} // 页面内权限
				},
				component: resolve => require(['@/view/monitor/cp'], resolve)
			},
			{
				path: '/monitor/channel/manage',
				name: 'monitor-channel',
				meta: {
					isShowAccess: true,
					title: '渠道管理',
					inPageAccess: {'viewIndex': '首页', 'add': '新建渠道'} // 页面内权限
				},
				component: resolve => require(['@/view/monitor/channel'], resolve)
			},
			{
				path: '/monitor/task/manage',
				name: 'monitor-task',
				meta: {
					isShowAccess: true,
					title: '任务管理',
					inPageAccess: {'viewIndex': '首页', 'add': '新建任务'} // 页面内权限
				},
				component: resolve => require(['@/view/monitor/task'], resolve)
			}
		]
	}
]

/**
 * [noFoundRouterMap 404页面]
 * @type {Array}
 */
export const noFoundRouterMap = [
	{
		path: '/permission/error',
		name: '_noPermission',
		component: Main,
		redirect: '/permission/error/log',
		meta: {
			hideInMenu: true,
			title: '无访问权限'
		},
		children: [
			{
				path: '/permission/error/log',
				name: 'noPermission',
				component: resolve => require(['@/view/error/noPermission'], resolve)
			}
		]
	},
	{
		path: '*', // 404
		name: 'noFound',
		meta: {
			hideInMenu: true,
			title: '错误'
		},
		component: resolve => require(['@/view/error/index'], resolve)
	}
]
