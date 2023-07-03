<template>
    <div class="error-page">
        <div class="content-con">
            <img src="~@/assets/image/error/error-404.svg">
            <div class="text-con">
                <h4>404</h4>
                <h5>Oh~~您的页面好像飞走了~</h5>
                <Button type="text" @click="backHome">返回首页</Button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'page404',
    methods: {
        backHome() {
            this.$router.replace({
                name: this.$config.homeName
            })
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.error-page
    width: 500px
    margin: 0 auto
    text-align: center
    img
        width: 100%
    .text-con
        h4
            font-size: 80px
            font-weight: 700
            color: #348EED
        h5
            font-size: 20px
            font-weight: 700
            color: #67647D
            margin-bottom: 20px
</style>
