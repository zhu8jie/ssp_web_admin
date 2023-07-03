<template>
    <div class="error-page">
        <div class="content-con">
            <img src="~@/assets/image/error/noPermission.png">
            <div class="text-con">
                <p>暂无访问权限</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'pageAccess'
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.error-page
    width: 150px
    padding-top: 80px
    margin: 0 auto
    text-align: center
    img
        width: 100%
    .text-con
        p
            font-size: 14px
            color: #999
            margin-top: 20px
</style>
