// 页面内权限
import config from '@/config'

export const inPageAccess = {
	data() {
		return {
			inPageAccessArr: [] // 页面内权限
		}
	},
	created() {
		this._inPageAccessArr() // 获取页面按钮权限数组
	},
	methods: {
		/**
		 * [hasPageAccess 页面访问权限]
		 * @return {Boolean} [description]
		 */
		_hasPageAccess() {
			let _role = this.$store.getters.userInPageRole
			let _permission = !!_role && !!_role[this.$route.name] ? _role[this.$route.name] : ''

			// 判断route是否有redirect跳转
			if (!!this.$route && !!this.$route.meta && !!this.$route.meta.redirectForm) {
				_permission = this.$route.meta.redirectForm
			}

			// 存在当前模块， 并且有查看页面的权限
			// if (this._isSuperAdmin() || (!!_permission && _permission.arr.includes('viewIndex'))) {
			if (this._isSuperAdmin() || !!_permission) {
				return true
			} else {
				this._gotoNoAccess()
			}
		},
		/**
		 * [_inPageAccessArr 页面按钮权限]
		 * @return {[type]} [description]
		 */
		_inPageAccessArr() {
			let _role = this.$store.getters.userInPageRole

			this.inPageAccessArr = (!!_role && !!_role[this.$route.name]) ? _role[this.$route.name].arr : [] // 页面内权限
		},
		/**
		 * [_isShow_ 页面内按钮级别权限   判断是否显示]
		 * @param  {[type]}  name [description]
		 * @return {Boolean}      [description]
		 */
		_isShow_(name) {
			return this._isSuperAdmin() || this.inPageAccessArr.includes(name)
		},
		/**
		 * [_isPageShow 页面是否显示
		 * ]
		 * @return {Boolean} [description]
		 */
		_isPageShow() {
			let _targetRoute = this.$route.meta.targetHighLight
			let _role = this.$store.getters.userInPageRole

			return _role[_targetRoute] ? _role[_targetRoute].arr : []
		},
		/**
		 * [_gotoNoAccess 跳转到无权限页面]
		 * @return {[type]} [description]
		 */
		_gotoNoAccess() {
			this.$router.replace({name: 'noPermission'})
		},
		/**
		 * [_isSuperAdmin 是否为超级管理员]
		 * @return {Boolean} [description]
		 */
		_isSuperAdmin() {
			return this.$store.state.user.userName === config.superName
		}
	}
}
