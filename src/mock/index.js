import Mock from 'mockjs'
import {
	getAccessModuleManageData,
	getAccessRole
} from './access'

// 配置Ajax请求延时，可用来测试网络延迟大时项目中一些效果
Mock.setup({
	timeout: 1000
})

// 账号权限-模块管理
Mock.mock('/mock/get_access_module_data', 'get', getAccessModuleManageData)
Mock.mock('/mock/role', 'get', getAccessRole)

export default Mock
