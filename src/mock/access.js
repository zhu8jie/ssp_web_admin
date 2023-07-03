import { moduleManageData } from './data/module-manage'
import { role } from './data/role'

export const getAccessModuleManageData = req => {
	return {
		code: 200,
		data: moduleManageData
	}
}

export const getAccessRole = req => {
	return {
		code: 200,
		data: role
	}
}
