module.exports = {
	'/api': { // 接口代理
		target: 'http://apia.gladdigit.com/api', // 代理到本地环境
		// target: 'http://grayapia.gladdigit.com/api', // 代理到本地环境
		changeOrigin: true,
		pathRewrite: {
			'^/api': ''
		}
	},
	'/xls': { // 下载文档代理
		target: 'http://apia.gladdigit.com/xls', // 代理到本地环境
		// target: 'http://grayapia.gladdigit.com/xls', // 代理到本地环境
		changeOrigin: true,
		pathRewrite: {
			'^/xls': ''
		}
	}
}
