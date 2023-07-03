<template>
    <div class="side-menu-wrapper">
        <Menu ref="menu" v-show="!collapsed" :active-name="activeName" :open-names="openedNames" :theme="theme" width="auto" @on-select="handleSelect">
            <template v-for="item in menuList">
                <template v-if="item.children && item.children.length === 1">
                    <side-menu-item v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
                    <MenuItem v-else :to="getPathOrHref(item, true)" :name="getNameOrHref(item, true)" :key="`menu-${item.children[0].name}`"><span :class="item.icon"></span><span class="in-title">{{ showTitle(item) }}</span></MenuItem>
                </template>
                <template v-else>
                    <side-menu-item v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item">dadadsa</side-menu-item>
                    <MenuItem v-else :name="getNameOrHref(item)" :key="`menu-${item.name}`"><span class="in-title">{{ showTitle(item) }}</span></MenuItem>
                </template>
            </template>
        </Menu>
        <div class="menu-collapsed" v-show="collapsed">
            <template v-for="item in menuList">
                <collapsed-menu v-if="item.children && item.children.length > 1" @on-click="handleSelect" hide-title :root-icon-size="rootIconSize" :icon-size="iconSize" :theme="theme" :parent-item="item" :key="`drop-menu-${item.name}`"></collapsed-menu>
                <Tooltip transfer v-else :content="showTitle(item.children && item.children[0] ? item.children[0] : item)" placement="right" :key="`drop-menu-${item.name}`">
                    <a @click="handleSelect(getNameOrHref(item, true))" class="drop-menu-a" :style="{textAlign: 'center'}"><i class="iconfont" :class="item.icon"></i></a>
                </Tooltip>
            </template>
        </div>
    </div>
</template>
<script>

import SideMenuItem from './side-menu-item.vue'
import CollapsedMenu from './collapsed-menu.vue'
import {getUnion} from '@/libs/tools'
import mixin from './mixin'

export default {
    name: 'SideMenu',
    mixins: [mixin],
    components: {
        SideMenuItem,
        CollapsedMenu
    },
    props: {
        menuList: {
            type: Array,
            default () {
                return []
            }
        },
        collapsed: {
            type: Boolean
        },
        theme: {
            type: String,
            default: 'dark'
        },
        rootIconSize: {
            type: Number,
            default: 20
        },
        iconSize: {
            type: Number,
            default: 16
        },
        accordion: Boolean,
        activeName: {
            type: String,
            default: ''
        },
        openNames: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            openedNames: []
        }
    },
    mounted() {
        this.openedNames = getUnion(this.openedNames, this.getOpenedNamesByActiveName(name))
    },
    methods: {
        /**
         * [handleSelect 点击导航，向父级更新事件]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        handleSelect(name) {
            this.$emit('on-select', name)
        },
        getOpenedNamesByActiveName(name) {
            return this.$route.matched.map(item => item.name).filter(item => item !== name)
        },
        updateOpenName(name) {
            this.openedNames = name === this.$config.homeName ? [] : this.getOpenedNamesByActiveName(name)
        }
    },
    computed: {
        textColor() {
            return this.theme === 'dark' ? '#fff' : '#495060'
        }
    },
    watch: {
        activeName(name) {
            this.openedNames = this.accordion ? this.getOpenedNamesByActiveName(name) : getUnion(this.openedNames, this.getOpenedNamesByActiveName(name))
        },
        openNames(newNames) {
            this.openedNames = newNames
        },
        openedNames() {
            this.$nextTick(() => {
                this.$refs.menu.updateOpened()
            })
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>
