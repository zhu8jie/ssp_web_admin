import { showTitle } from '@/libs/util'

export default {
    methods: {
        /**
         * @param  {[显示标题]}
         * @return {[type]}
         */
        showTitle(item) {
            return showTitle(item, this)
        },
        /**
         * @param  {判断是否有子路由}
         * @return {[type]}
         */
        showChildren(item) {
            return item.children && (item.children.length > 1 || (item.meta && item.meta.showAlways))
        },
        /**
         * @param  {[获取当前目录的herf]}
         * @param  {[type]}
         * @return {[type]}
         */
        getNameOrHref(item, children0) {
            return item.href ? `isTurnByHref_${item.href}` : (children0 ? item.children[0].name : item.name)
        },
        /**
         * @param  {[获取当前目录的herf/path]}
         * @param  {[type]}
         * @return {[type]}
         */
        getPathOrHref(item, children0) {
            try {
                return item.href ? `isTurnByHref_${item.href}` : (children0 ? item.children[0].path : item.path)
            } catch (e) {
                console.log(e)
            }
        }
    }
}
