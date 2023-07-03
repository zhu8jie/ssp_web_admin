<template>
    <div class="clearfix root-header">
        <div class="header-card"><img src="~@/assets/image/header_logo.png">数字欢喜管理平台</div>
        <div class="user-avatar-dropdown">
            <Dropdown trigger="click" placement="bottom-end" @on-click="handleClick">
                <a href="javascript:void(0)">
                    {{userName}}
                    <Icon type="ios-arrow-down"></Icon>
                </a>
                <DropdownMenu slot="list">
                    <DropdownItem name="password">修改密码</DropdownItem>
                    <DropdownItem name="logout">退出</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
        
    </div>
</template>
<script>
import {mapActions, mapMutations} from 'vuex'
export default {
    name: 'Header',
    computed: {
        userName() {
            return this.$store.state.user.userName
        }
    },
    methods: {
        ...mapActions([
            'logout'
        ]),
        ...mapMutations([
            'setLoginOut'
        ]),
        /**
         * [handleClick 切换点击]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        handleClick(name) {
            switch (name) {
                case 'logout':
                    this.toLogOut()
                    break
                case 'password':
                    this.changePassword()
                    break
            }
        },
        /**
         * [toLogOut 退出登录]
         * @return {[type]} [description]
         */
        toLogOut() {
            this.$Modal.confirm({
                title: '确认退出？',
                className: 'vertical-center-modal',
                onOk: () => {
                    this.logout().then(res => {
                        this.setLoginOut() // 清除

                        if (res.code === 200) {
                            this.$Message.success({content: '退出成功', duration: 3})
                            this.$router.replace({name: 'login'})
                        } else {
                            this.$Message.error({content: res.msg, duration: 3})
                        }
                    })
                },
                onCancel() {
                    console.log('取消')
                }
            })
        },
        /**
         * [password 修改密码]
         * @return {[type]} [description]
         */
        changePassword() {
            this.$emit('on-change')
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.header-card
    display: inline
    float: left
    font-size: 16px
    font-weight: bold
    color: #FFF
    height: 50px
    line-height: 50px
    img
        margin-right: 10px
        width: 28px
        height: 28px
        vertical-align: -8px
.user-avatar-dropdown
    display: inline
    float: right
    a
        color: #FFF
.login-out
    display: inline-block
    vertical-align: middle
    line-height: 50px
    margin-left: 20px
    cursor: pointer
    i
        margin-right: 6px
</style>
