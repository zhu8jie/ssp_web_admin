/**
 * 自定义列
 */
import { localRead } from '@/libs/util'

export const columnFn = {
    data() {
        return {
            tableColList: [] // table 的 columns
        }
    },
    methods: {
        /**
         * [doColumns 自定义列调起]
         * @return {[type]} [description]
         */
        doColumns() {
            this.$refs.customColumn.toggleDrawer()
        },
        /**
         * [getTableColumns 获取自定义列表]
         * @return {[type]} [description]
         */
        getTableColumns() {
            let _local = localRead(this.$route.name.toUpperCase())
            let resultArr = []

            // 默认
            if (!_local) {
                resultArr = this.catchTableColList
            } else {
                resultArr = this.catchTableColList.filter(_ => {
                    return _local === 'null' ? !!_.isHideInColumn : (!!_.isHideInColumn || _local.split(',').includes(_.title))
                })
            }
            this.tableColList = resultArr
        },
        /**
         * [columnChange 自定义列子传父级]
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        columnChange(data) {
            this.getTableColumns()
        }
    }
}
