export default {
	/**
	 * @description 配置显示在浏览器标签的title
	 */
	title: '管理平台',
	/**
	 * @description token在Cookie中存储的天数，默认1天
	 */
	cookieExpires: 1,
	/**
	 * [superName 超级管理员的名字]
	 * @type {String}
	 */
	superName: 'admin',

	/**
	 * [loginEnter 校验登录的唯一字段]
	 * @type {String}
	 */
	loginEnterId: 'userId',
	/**
	 * [loginEnter 校验登录的唯一字段]
	 * @type {String}
	 */
	loginEnterName: 'userName',
	/**
	 * @description 是否使用国际化，默认为false
	 *			  如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
	 *			  用来在菜单中显示文字
	 */
	useI18n: false,
	/**
	 * @description api请求基础路径
	 */
	APIUrl: {
		dev: { // 开发环境 - 切换到灰度环境
			baseUrl: 'http://apia.gladdigit.com', // 基础请求接口
			mediaComUrl: 'http://apim.gladdigit.com', // 平台公告（公用接口）-从-->媒体平台 --获取
			media: 'http://media.gladdigit.com' // 媒体平台
		},
		deving: { // 开发环境
			baseUrl: 'http://grayapia.gladdigit.com', // 基础请求接口
			mediaComUrl: 'http://grayapim.gladdigit.com', // 平台公告（公用接口）-从-->媒体平台 --获取
			media: 'http://graymedia.gladdigit.com' // 媒体平台
		},
		testing: { // 测试服务器
			baseUrl: 'http://grayapia.gladdigit.com', // 基础请求接口
			mediaComUrl: 'http://grayapim.gladdigit.com', // 平台公告（公用接口）-从-->媒体平台 --获取
			media: 'http://graymedia.gladdigit.com' // 媒体平台
		},
		gray: { // 灰度
			baseUrl: 'http://grayapia.gladdigit.com', // 基础请求接口
			mediaComUrl: 'http://grayapim.gladdigit.com', // 平台公告（公用接口）-从-->媒体平台 --获取
			media: 'http://graymedia.gladdigit.com' // 媒体平台
		},
		pro: { // 正式服务器
			baseUrl: 'http://apia.gladdigit.com', // 基础请求接口
			mediaComUrl: 'http://apim.gladdigit.com', // 平台公告（公用接口）-从-->媒体平台 --获取
			media: 'http://media.gladdigit.com' // 媒体平台
		}
	},
	/**
	 * [xlsApiUrl 模板xls路径  模板api 接口 ，区分(dev,test) 和 (gray, product)]
	 * @type {Object}
	 */
	xlsApiUrl: {
		dev: 'http://192.168.3.36:8899/example', // dev和test使用
		pro: 'http://apia.gladdigit.com/example' // gray和production使用
	},
	/**
	 * @description 默认打开的首页的路由name值，默认为home
	 */
	homeName: 'home',
	/**
	 * @description 需要加载的插件
	 */
	plugin: {
		'error-store': {
			showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
			developmentOff: true // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
		}
	},
	/**
	 * [noDataText table 数据为空时显示的提示内容]
	 * @type {String}
	 */
	noDataText: '暂无数据',
	/**
	 * [dataNoPer 访问列表403权限]
	 * @type {String}
	 */
	noDataTextPer: '暂无权限',
	/**
	 * [requiredText 必填项不能为空]
	 * @type {String}
	 */
	requiredText: '表单填写有误, 请检查重试...'
}
