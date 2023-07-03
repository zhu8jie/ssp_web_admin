<template>
	<Modal
		v-model="modalFlag"
		title="修改密码"
		width="450"
		:footer-hide="true"
		@on-cancel="hideModal"
		class-name="vertical-center-modal">
		<Form ref="modalForm" :model="modalForm" :rules="modalRules" :label-width="120">
			<FormItem label="请输入旧密码" prop="old">
				<Input type="password" :maxlength="20" v-model.trim="modalForm.old" />
			</FormItem>
			<FormItem label="请输入新密码" prop="new">
				<Input type="password" :maxlength="20" v-model.trim="modalForm.new" />
			</FormItem>
			<FormItem label="确认密码" prop="newCheck">
				<Input type="password" :maxlength="20" v-model.trim="modalForm.newCheck"/>
			</FormItem>
			<FormItem>
				<Button type="primary" :loading="submitClock" @click="submitPsw('modalForm')">
					<span v-if="!submitClock">提交</span>
					<span v-else>提交中...</span>
				</Button>
			</FormItem>
		</Form>
	</Modal>
</template>
<script>
import { resetPassword } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
	name: 'changePsw',
	data() {
		const validatePassCheck = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请再次输入密码'))
			} else if (value !== this.modalForm.new) {
				callback(new Error('两次输入密码不一致'))
			} else {
				callback()
			}
		}
		return {
			modalFlag: false, // 显示隐藏
			submitClock: false, // 提交按钮
			modalForm: {
				old: '', // 旧密码
				new: '', // 新密码
				newCheck: '' // 二次确认
			},
			modalRules: {
				old: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
				new: [
					{required: true, message: '密码不能为空'},
					{min: 6, message: '长度至少6位', trigger: 'blur'},
					{pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '密码必须是字母或数字的6-20位字符组成', trigger: 'blur'}
				],
				newCheck: [{required: true, validator: validatePassCheck, trigger: 'blur'}]
			}
		}
	},
	methods: {
		...mapMutations([
			'setLoginOut'
		]),
		/**
		 * [submitPsw 重置密码，提交]
		 * @param  {[type]} name [description]
		 * @return {[type]}	  [description]
		 */
		submitPsw(name) {
			this.$refs[name].validate((valid) => {
				if (valid) {
					this.submitClock = true

					resetPassword({
						old: this.modalForm.old,
						new: this.modalForm.new
					}).then(res => {
						this.submitClock = false

						if (res.code === 200) {
							this.hideModal()
							this.setLoginOut() // 清除
							this.$Message.success({content: '密码修改成功，请重新登录...', duration: 3})

							setTimeout(() => { // 有效期内，跳转到首页
								this.$router.replace({
									name: 'login'
								})
							}, 3000)
						}
					}, err => {
						this.submitClock = false
						this.$Message.error({content: err.msg, duration: 3})
					})
				}
			})
		},
		/**
		 * [hideModal 取消]
		 * @return {[type]} [description]
		 */
		hideModal() {
			this.$refs['modalForm'].resetFields()
			this.modalFlag = false
		},
		showModal() {
			this.modalFlag = true
		}
	}
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
