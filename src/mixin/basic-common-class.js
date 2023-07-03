import {mapActions} from 'vuex'
import { debounce } from '@/libs/tools'

export const commonMixin = {
	data() {
		return {
			meidaCompanyArr: [], // 媒体公司列表
			adTypeList: [], // 广告类型
			platform3rdList: [], // 第三方平台名称
			appStoreList: [], // 应用商店数据

			catchAppList: [], // 缓存应用列表
			appList: [], // 应用列表
			appLoading: false, // app加载loading
		}
	},
	created() {
		this._getMediaCompany() // 获取媒体公司简称
		this._getAllAdType() // 获取广告类型
		this._getPlatform3rd() // 获取第三方平台名称
	},
	computed: {
		renderTypeList() { // 渲染方式  模板/自渲染
			return this.$store.getters.renderType
		},
		accessTypeList() { // 接入方式 API/SDK
			return this.$store.getters.accessType
		}
	},
	methods: {
		...mapActions([
			'getAllAdType',
			'getMediaCompany',
			'getPlatform3rd'
		]),
		/**
		 * [_getAllAdType 获取广告类型]
		 * @return {[type]} [description]
		 */
		async _getAllAdType() {
			let storeUser = this.$store.state.user
			let resArr = storeUser.adTypeArr.length ? storeUser.adTypeArr : await this.getAllAdType()

			this.adTypeList = resArr
		},
		/**
		 * [_getMediaCompany 获取媒体公司数据]
		 * @return {[type]} [description]
		 */
		async _getMediaCompany() {
			let storeUser = this.$store.state.user
			let resArr = storeUser.meidaCompanyArr.length ? storeUser.meidaCompanyArr : await this.getMediaCompany()

			this.meidaCompanyArr = resArr
		},
		/**
		 * [_getPlatform3rd 第三方平台名称]
		 * @return {[type]} [description]
		 */
		async _getPlatform3rd() {
			let storeUser = this.$store.state.user
			let resArr = storeUser.platform3rdArr.length ? storeUser.platform3rdArr : await this.getPlatform3rd()

			this.platform3rdList = resArr
		}
	}
}
