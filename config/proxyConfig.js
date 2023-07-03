module.exports = {
	'/api': {
		target: 'http://127.0.0.1:8899/api', // 代理到本地环境
		// target: 'http://admin.dev.deemob.com/api', // 代理到dev环境
		// target: 'https://admin.gray.deemob.com/api', // 代理到gray环境
		changeOrigin: true,
		pathRewrite: {
			'^/api': ''
		}
	},
	'/mock': {
		target: 'http://127.0.0.1:8081/mock', // 代理到dev环境
		changeOrigin: true,
		pathRewrite: {
			'^/mock': ''
		}
	}
}
