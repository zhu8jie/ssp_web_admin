<template>
    <Submenu :name="`${parentName}`" :class="{'monitor-submenu': parentItem.name === 'monitor-manage'}">
        <!-- 数据检测产品 class单独处理 -->
        <template slot="title">
            <span :class="parentItem.icon"></span>
            <span class="in-title">{{ showTitle(parentItem) }}</span>
        </template>
        <template v-for="item in children">
            <template v-if="item.children && item.children.length === 1">
                <side-menu-item v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
                <menu-item v-else :name="getNameOrHref(item, true)" :key="`menu-${item.children[0].name}`"><span>{{ showTitle(item.children[0]) }}</span></menu-item>
            </template>
            <template v-else>
                <side-menu-item v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
                <menu-item v-else :to="getPathOrHref(item)" :name="getNameOrHref(item)" :key="`menu-${item.name}`"><span><Icon v-if="item.icon" :type="item.icon" />{{ showTitle(item) }}</span></menu-item>
            </template>
        </template>
    </Submenu>
</template>
<script>
import mixin from './mixin'
import itemMixin from './item-mixin'
export default {
    name: 'SideMenuItem',
    mixins: [mixin, itemMixin]
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.monitor-submenu
    margin-top: 20px
    padding-top: 20px
    position: relative
    &:before
        position: absolute
        width: 80%
        left: 10%
        top: 0px
        height: 1px
        background: #DCDCDC
        content: ''
</style>

